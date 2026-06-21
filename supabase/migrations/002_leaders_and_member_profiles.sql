alter table public.members
  add column if not exists location text,
  add column if not exists occupation text;

create table if not exists public.leaders (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  position text not null,
  phone text not null,
  location text not null,
  occupation text not null,
  picture_url text,
  picture_path text,
  created_at timestamptz not null default now()
);

create index if not exists leaders_name_idx on public.leaders(lower(name));
alter table public.leaders enable row level security;

create policy "authenticated users read leaders"
  on public.leaders for select to authenticated using (true);
create policy "admins manage leaders"
  on public.leaders for all to authenticated
  using (public.current_role()='admin')
  with check (public.current_role()='admin');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('leader-photos', 'leader-photos', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "admins manage leader photos"
  on storage.objects for all to authenticated
  using (bucket_id='leader-photos' and public.current_role()='admin')
  with check (bucket_id='leader-photos' and public.current_role()='admin');
