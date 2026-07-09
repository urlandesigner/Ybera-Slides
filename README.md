# Gerador de Apresentações Ybera

Web app interno: funcionários preenchem um briefing e recebem uma apresentação HTML no padrão visual da empresa, com preview, download e histórico.

**Decisão central:** a IA nunca gera HTML. Ela retorna um JSON estruturado com o conteúdo dos slides ([lib/schema.ts](lib/schema.ts)); o renderer no servidor ([lib/renderer.ts](lib/renderer.ts)) injeta esse conteúdo nos templates de layout ([lib/layouts.ts](lib/layouts.ts)), extraídos à risca de `template-ybera-referencia.html`. O `<style>`, o `logos-data` e o visualizador entram no HTML final **sem alterações** ([lib/reference.ts](lib/reference.ts), gerado por `node scripts/extract-reference.mjs`).

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind — deploy na Vercel
- Supabase: Auth (magic link) + Postgres
- API da Anthropic (`claude-sonnet-5`), chamada apenas no servidor, com prompt caching e structured outputs (JSON garantido + validação Zod + 1 retry)

## Configuração

### 1. Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. No **SQL Editor**, rode [supabase/schema.sql](supabase/schema.sql) (tabela `decks` + RLS: select para qualquer autenticado, insert só com o próprio `user_id`, sem update/delete).
3. Em **Authentication → URL Configuration**, adicione a URL do app (local e produção) em *Redirect URLs*: `http://localhost:3000/auth/confirm` e `https://SEU-DOMINIO/auth/confirm`.
4. Em **Authentication → Sign In / Providers → Email**, desative *Enable sign in with password* (o app só usa magic link; a validação do domínio `@ybera.com` acontece no servidor em [app/api/auth/login/route.ts](app/api/auth/login/route.ts)).

### 2. Variáveis de ambiente

Copie `.env.local.example` para `.env.local` e preencha:

| Variável | Onde obter |
| --- | --- |
| `ANTHROPIC_API_KEY` | console da Anthropic — usada só no servidor, nunca chega ao client |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API (reservada; a v1 não a utiliza em runtime) |
| `ALLOWED_EMAIL_DOMAIN` | opcional — padrão `ybera.com`; útil para testar com outro domínio |

Na Vercel, cadastre as mesmas variáveis no projeto (Settings → Environment Variables) ou via `vercel env add`.

### 3. Rodar

```bash
npm install
npm run dev
```

Verificação rápida do renderer (sem API, sem banco):

```bash
npx tsx scripts/render-sample.ts   # gera sample-deck.html e valida os blocos imutáveis
```

## Rotas

| Rota | O quê |
| --- | --- |
| `/login` | magic link; estados: enviado, domínio inválido, link expirado, sessão expirada |
| `/` | briefing → geração → preview em iframe sandbox + Baixar HTML + Nova versão |
| `/historico` | decks de toda a equipe; clique abre `/deck/[id]` |
| `POST /api/generate` | sessão → rate limit (10/dia, contado em `decks`) → IA → validação → render → salva |

## Fora do escopo da v1

Edição de slide individual, upload de imagens (placeholders listrados), export PPTX/PDF direto (PDF = imprimir do navegador), busca no histórico, papéis/admin.
