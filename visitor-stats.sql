-- Run once in the Supabase SQL Editor to enable shared visit and active-user counts.
create table if not exists public.site_visit_stats (
  id smallint primary key default 1 check (id = 1),
  total_visits bigint not null default 0 check (total_visits >= 0)
);

insert into public.site_visit_stats (id, total_visits)
values (1, 0)
on conflict (id) do nothing;

create table if not exists public.site_active_sessions (
  session_id uuid primary key,
  visitor_id uuid not null,
  is_active boolean not null default true,
  last_seen_at timestamptz not null default now()
);

create index if not exists site_active_sessions_last_seen_idx
  on public.site_active_sessions (last_seen_at);

alter table public.site_visit_stats enable row level security;
alter table public.site_active_sessions enable row level security;

revoke all on public.site_visit_stats from public, anon, authenticated;
revoke all on public.site_active_sessions from public, anon, authenticated;

create or replace function public.track_site_activity(
  p_visitor_id uuid,
  p_session_id uuid,
  p_count_visit boolean,
  p_is_active boolean
)
returns table (total_visits bigint, active_users bigint)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if p_visitor_id is null
    or p_session_id is null
    or p_count_visit is null
    or p_is_active is null then
    raise exception using
      errcode = '22023',
      message = 'Visitor statistics arguments cannot be null';
  end if;

  delete from public.site_active_sessions
  where last_seen_at < now() - interval '90 seconds';

  if p_count_visit then
    update public.site_visit_stats
    set total_visits = site_visit_stats.total_visits + 1
    where id = 1;
  end if;

  insert into public.site_active_sessions (
    session_id,
    visitor_id,
    is_active,
    last_seen_at
  )
  values (
    p_session_id,
    p_visitor_id,
    p_is_active,
    now()
  )
  on conflict (session_id) do update
  set visitor_id = excluded.visitor_id,
      is_active = excluded.is_active,
      last_seen_at = excluded.last_seen_at;

  return query
  select
    stats.total_visits,
    (
      select count(distinct sessions.visitor_id)::bigint
      from public.site_active_sessions as sessions
      where sessions.is_active
        and sessions.last_seen_at >= now() - interval '90 seconds'
    )
  from public.site_visit_stats as stats
  where stats.id = 1;
end;
$$;

revoke all on function public.track_site_activity(uuid, uuid, boolean, boolean)
  from public;
grant execute on function public.track_site_activity(uuid, uuid, boolean, boolean)
  to anon, authenticated;
