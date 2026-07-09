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
  created_at timestamptz default now()
);

alter table decks enable row level security;

-- Histórico é da empresa toda: select para qualquer usuário autenticado
create policy "decks_select_autenticados"
  on decks for select
  to authenticated
  using (true);

-- Insert apenas com o próprio user_id
create policy "decks_insert_proprio"
  on decks for insert
  to authenticated
  with check (user_id = auth.uid());

-- Sem update/delete na v1 (nenhuma policy criada = negado por padrão)

create index if not exists decks_created_at_idx on decks (created_at desc);
create index if not exists decks_user_dia_idx on decks (user_id, created_at);
