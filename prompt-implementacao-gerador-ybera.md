# Prompt de implementação — Gerador de Apresentações Ybera

> Cole este prompt no Claude Code, na raiz de um repositório novo que contenha o arquivo
> `template-ybera-referencia.html` (fonte da verdade do padrão visual).

---

Construa um web app interno chamado **Gerador de Apresentações Ybera**. Funcionários preenchem um briefing e recebem uma apresentação HTML no padrão visual da empresa, com preview, download e histórico.

## Stack

- **Next.js 15 (App Router) + TypeScript + Tailwind**, deploy na Vercel
- **Supabase**: Auth (magic link) + Postgres
- **API da Anthropic** (`claude-sonnet-5`) chamada apenas no servidor, com prompt caching
- Variáveis de ambiente: `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

## Decisão central de arquitetura

**A IA nunca gera HTML.** Ela gera um JSON estruturado com o conteúdo dos slides. Um renderer no servidor (`lib/renderer.ts`) injeta esse JSON em templates de layout fixos e monta o HTML final. Os templates de layout são extraídos **uma única vez, manualmente, do arquivo `template-ybera-referencia.html`** deste repositório — copie a estrutura HTML de cada layout à risca, trocando apenas os textos por variáveis. Não altere tamanhos de fonte, espaçamentos, cores ou estrutura.

O HTML final é montado assim (nesta ordem):

1. `<head>` + bloco `<style>` completo do arquivo de referência, sem alterações
2. `<body data-marca="{marca}" data-tom="{modo}">` + HUD/drawer/contador do visualizador
3. `<div id="stage">` com os slides renderizados
4. O `<script id="logos-data" type="application/json">` do arquivo de referência, sem alterações (ignore/remova o script cloudflare `email-decode` que está na mesma linha)
5. O `<script>` do visualizador, sem alterações

O resultado deve ser um HTML único, auto-contido, que abre no navegador e navega com ← → / clique (o visualizador já faz isso).

## Contrato do JSON de slides

```ts
type Deck = {
  titulo: string;
  marca: "group" | "ybera" | "club" | "pro";
  modo: "dark" | "light";
  slides: Slide[];
};

type Slide =
  | { layout: "capa"; titulo: string; subtitulo: string; apresentador: string; data: string } // data ex: "JULHO · 2026"
  | { layout: "indice"; titulo: string; itens: { numero: string; titulo: string; descricao: string }[] } // 2 a 4 itens
  | { layout: "separador"; numero: string; titulo: string; linha: string }
  | { layout: "conteudo"; kicker: string; titulo: string; paragrafos: string[]; imagemDescricao: string } // 1-2 parágrafos
  | { layout: "texto"; kicker: string; afirmacao: string; apoio?: string }
  | { layout: "imagem"; kicker: string; legenda: string; imagemDescricao: string }
  | { layout: "citacao"; frase: string; autor: string; fonte: string }
  | { layout: "cards"; kicker: string; titulo: string; cards: { titulo: string; texto: string }[] } // exatamente 3
  | { layout: "metricas"; kicker: string; titulo: string; metricas: { valor: string; rotulo: string }[] } // exatamente 4
  | { layout: "timeline"; kicker: string; titulo: string; marcos: { rotulo: string; titulo: string; texto: string }[] } // exatamente 4; o 4º usa o marcador vazado/tracejado
  | { layout: "comparativo"; kicker: string; titulo: string; antesRotulo: string; antesItens: string[]; depoisRotulo: string; depoisItens: string[] } // 3 itens cada
  | { layout: "encerramento"; titulo: string; texto: string; email: string; site: string };
```

Valide o JSON retornado pela IA com Zod. Se inválido, faça 1 retry automático antes de retornar erro. Números de página (`data-pagina`) são preenchidos pelo script `numerar()` do visualizador — o renderer pode emitir placeholders `00 / 00`.

## Prompt de geração (system prompt da chamada à API)

Monte o system prompt com: o contrato JSON acima, a lista dos 13 layouts com quando usar cada um, e estas regras de conteúdo (do padrão Ybera):

- Estrutura: capa → indice → separador por seção → slides variados → encerramento (sempre o último)
- Uma ideia por slide; 2–3 frases por bloco de texto; nunca repetir o mesmo layout mais de 2× seguidas
- **Não inventar dados, números ou citações** — usar apenas o conteúdo fornecido no briefing; se faltar conteúdo para `metricas` ou `citacao`, não usar esses layouts
- Kickers em caixa alta com número da seção (ex: `01 · FUNDAMENTOS`)
- Responder **somente** o JSON (use tool use / JSON mode para garantir)

Marque o system prompt com `cache_control` (prompt caching) — ele é grande e idêntico entre chamadas.

## Banco (Supabase)

```sql
create table decks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  titulo text not null,
  marca text not null,
  modo text not null,
  briefing jsonb not null,
  slides jsonb not null,
  html text not null,
  created_at timestamptz default now()
);
-- RLS: select para qualquer usuário autenticado (histórico é da empresa toda);
-- insert apenas com user_id = auth.uid(); sem update/delete na v1.
```

## Auth

- Magic link do Supabase. **Validação do domínio no servidor**: antes de enviar o link, rejeitar e-mails que não terminem em `@ybera.com` (route handler próprio, não só validação no client). Desabilitar signup por senha.
- Middleware protege todas as rotas exceto `/login`.

## Rotas e telas

- `/login` — logo, campo de e-mail, botão "Receber link de acesso". Estados: enviado ("verifique seu e-mail"), domínio inválido, link expirado.
- `/` (nova apresentação) — formulário em coluna única: marca, modo, assunto, público, nº de slides (~10/~14/~18), textarea "conteúdo a cobrir" (obrigatório, com hint "cole os pontos, dados e fatos — nada será inventado"). CTA único "Gerar apresentação". Depois de gerar: preview em `<iframe sandbox="allow-scripts" srcdoc={html}>` ocupando a largura útil, com ações "Baixar HTML" e "Nova versão" (volta ao formulário preenchido).
- `/historico` — lista (título, marca, autor, data), clique abre `/deck/[id]` com o mesmo preview + download. Empty state com CTA para criar a primeira.
- `POST /api/generate` — valida sessão → rate limit (10 gerações/usuário/dia, contadas na tabela decks) → chama a API → valida JSON → renderiza → salva → retorna id. Timeout de 120s; enquanto gera, a UI mostra progresso ("gerando slide X de N" se usar streaming; senão, mensagem de status honesta).

## UI do app

Use os próprios tokens do template como base visual do app (fundo `rgb(5,5,5)`, tinta `rgb(250,249,252)`, fontes Syne/Nunito Sans/DM Mono via Google Fonts, hairlines sutis). Interface sóbria e operacional: sem hero, sem cards decorativos, sem sombras. Componentes: `AppShell`, `Field`, `BrandPicker`, `DeckPreview`, `DeckListItem`, `EmptyState`, `Toast`.

## Estados obrigatórios

Formulário incompleto (CTA desabilitado com motivo visível), gerando (com progresso), erro de geração (briefing preservado + "tentar de novo"), JSON inválido após retry (erro claro), limite diário atingido, histórico vazio, e-mail fora do domínio, sessão expirada.

## Fora do escopo da v1

Edição de slide individual, upload de imagens (mantêm-se os placeholders listrados), export PPTX/PDF direto (PDF = imprimir do navegador), busca no histórico, papéis/admin.

## Critérios de aceite

1. Login por magic link funciona e bloqueia e-mails fora de @ybera.com no servidor
2. Um briefing de teste gera um deck que abre no navegador, navega por teclado/clique e é visualmente idêntico ao padrão do arquivo de referência (compare lado a lado)
3. O HTML gerado contém o `<style>`, o `logos-data` e o visualizador do arquivo de referência sem alterações
4. JSON inválido da IA não quebra o app (retry + erro tratado)
5. Deck salvo aparece no histórico para outro usuário autenticado
6. `ANTHROPIC_API_KEY` nunca chega ao client
