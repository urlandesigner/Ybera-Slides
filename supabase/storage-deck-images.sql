-- Bucket público de fotos dos slides (upload no editor).
-- Rodar no SQL Editor do Supabase uma vez.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'deck-images',
  'deck-images',
  true,
  5242880, -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Leitura pública (HTML das apresentações usa a URL direta)
drop policy if exists "deck_images_public_read" on storage.objects;
create policy "deck_images_public_read"
  on storage.objects for select
  to public
  using (bucket_id = 'deck-images');

-- Upload só na pasta do próprio usuário: {user_id}/arquivo.ext
drop policy if exists "deck_images_auth_insert" on storage.objects;
create policy "deck_images_auth_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'deck-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "deck_images_auth_update" on storage.objects;
create policy "deck_images_auth_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'deck-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'deck-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "deck_images_auth_delete" on storage.objects;
create policy "deck_images_auth_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'deck-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
