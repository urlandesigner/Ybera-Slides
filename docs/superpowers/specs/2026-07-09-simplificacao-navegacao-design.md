# Simplificação da navegação: Apresentações + CTA

## Contexto

Hoje o header (`AppShell`) tem 3 itens de menu: **Novo briefing** (`/`), **Biblioteca**
(`/repositorio`, decks públicos de toda a equipe) e **Minhas apresentações**
(`/minhas`, decks do usuário logado, públicos e restritos). São três rotas
independentes, cada uma com sua própria query Supabase em Server Component.

Isso separa em duas telas quase idênticas (mesma lista, mesmo `DeckListItem`,
filtro diferente) algo que poderia ser uma tela só, e trata "criar" como um
item de navegação igual aos de consulta, quando na prática é a ação primária
do produto.

## Objetivo

Reduzir o menu a um único item ("Apresentações"), promover a criação a um CTA
de destaque no header, e unificar as duas listas em uma tela só com um filtro
Minhas/Públicas.

## Decisões

- **Página inicial**: `/` passa a ser a tela de Apresentações (lista). Hoje é
  o formulário de briefing.
- **Filtro padrão**: "Públicas" (mostra a Biblioteca da equipe ao abrir).
- **Abas**: apenas duas — "Minhas" e "Públicas". Sem aba "Todas" por agora.
- **Mecanismo do filtro**: query string (`?filtro=minhas|publicas`), sem
  estado de cliente. Mantém o padrão do resto do app (Server Components sem
  JS de lista), preserva bookmark/compartilhamento e o botão voltar do
  navegador.

## Rotas

| Antes | Depois |
|---|---|
| `/` (briefing) | `/nova` |
| `/repositorio` (Biblioteca) | `/?filtro=publicas` (redirect a partir de `/repositorio`) |
| `/minhas` (Minhas apresentações) | `/?filtro=minhas` (redirect a partir de `/minhas`) |
| — | `/` (Apresentações, novo default) |

`/repositorio` e `/minhas` continuam existindo como redirects (não 404), para
não quebrar links/favoritos já salvos.

## Header (`AppShell`)

- Nav reduz a um único item: **"APRESENTAÇÕES"**, linkando para `/`. Serve
  como indicador de "você está aqui" quando a pessoa está em `/nova` ou
  `/deck/[id]`.
- Logo continua linkando para `/` (mesmo destino do item de nav — redundância
  aceitável, é convenção comum).
- Novo CTA **"+ Nova apresentação"**, estilo pill preenchido (mesmo padrão
  visual dos toggles DARK/LIGHT), posicionado ao lado do item de nav, à
  esquerda do bloco de utilidades (tema, e-mail, sair). Linka para `/nova`.
- Prop `active` do `AppShell` simplifica: só precisa diferenciar "está na
  lista" de "não está" (perde os três estados atuais `"nova" | "repositorio"
  | "minhas"`).

## Tela de Apresentações (`/`)

- Toggle **MINHAS / PÚBLICAS** no topo da lista, mesmo padrão visual pill dos
  outros toggles do app. Cada opção é um `<Link>` para `?filtro=...` (sem
  JavaScript de cliente).
- Query por filtro:
  - `publicas` (default): `visibilidade = 'publica'`, sem filtro de usuário —
    query que hoje está em `/repositorio`.
  - `minhas`: `user_id = user.id`, ambas visibilidades, com selo "RESTRITA"
    nos itens restritos — query que hoje está em `/minhas`.
- `DeckListItem` não muda.
- Empty states: reaproveita os textos já existentes de cada aba ("Nenhuma
  apresentação pública ainda" / "Você ainda não gerou nenhuma apresentação"),
  cada um roteado pela aba ativa.

## Efeitos colaterais

- `EmptyState` em ambas as abas tem `cta href="/"` apontando para o
  formulário de briefing — passa a apontar para `/nova`.
- Qualquer redirect pós-login/logout que hoje aponta para `/` continua
  correto (só muda o que `/` renderiza).

## Fora de escopo

- Aba "Todas" (união de minhas + públicas).
- Filtro por marca ou busca por texto na lista.
- Mudança de comportamento do formulário de briefing em si (`GeneratorClient`).
