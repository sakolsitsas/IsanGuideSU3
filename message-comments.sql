-- Run once in the Supabase SQL Editor to enable comments on message cards.
create table if not exists public.message_comments (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  name text not null default 'ผู้ร่วมทริป' check (
    char_length(trim(name)) between 1 and 30
  ),
  comment text not null check (
    char_length(trim(comment)) between 1 and 300
  ),
  created_at timestamptz not null default now()
);

alter table public.message_comments enable row level security;

revoke update, delete on public.message_comments from anon, authenticated;
grant select, insert on public.message_comments to anon, authenticated;

drop policy if exists "Public can read message comments"
  on public.message_comments;
create policy "Public can read message comments"
  on public.message_comments
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Public can add message comments"
  on public.message_comments;
create policy "Public can add message comments"
  on public.message_comments
  for insert
  to anon, authenticated
  with check (
    char_length(trim(name)) between 1 and 30
    and char_length(trim(comment)) between 1 and 300
  );

create index if not exists message_comments_message_id_created_at_idx
  on public.message_comments (message_id, created_at);
