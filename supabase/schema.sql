-- Gerador de Apresentações Ybera — schema v1
-- Rodar no SQL Editor do Supabase (ou via supabase db push).

create table if not exists decks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  autor_email text not null default '',
  titulo text not null,
  marca text not null,
  modo text not null,
  briefing jsonb not null,
  slides jsonb not null,
  html text not null,
  origem text not null default 'geracao', -- 'geracao' (conta na cota diária) | 'edicao'
  visibilidade text not null default 'publica', -- 'publica' (repositório da equipe) | 'restrita' (só o autor)
  created_at timestamptz default now(),
  deleted_at timestamptz -- soft delete: preenchido = excluída (some do app; a linha fica pra cota diária)
);

alter table decks enable row level security;

-- Públicas para qualquer autenticado; restritas só para o autor.
-- Excluídas somem para os outros no nível do banco; o dono ainda enxerga as
-- próprias (a cota diária conta na tabela) — as telas filtram deleted_at.
create policy "decks_select_visiveis"
  on decks for select
  to authenticated
  using (
    (visibilidade = 'publica' or user_id = auth.uid())
    and (deleted_at is null or user_id = auth.uid())
  );

-- Insert apenas com o próprio user_id
create policy "decks_insert_proprio"
  on decks for insert
  to authenticated
  with check (user_id = auth.uid());

-- Dono pode atualizar (o app só expõe a troca de visibilidade)
create policy "decks_update_dono"
  on decks for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Sem delete físico (nenhuma policy = negado por padrão). A exclusão do app
-- é soft delete: update em deleted_at, coberto pela policy de update acima.

create index if not exists decks_created_at_idx on decks (created_at desc);
create index if not exists decks_user_dia_idx on decks (user_id, created_at);
