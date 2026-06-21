create extension if not exists pgcrypto;
create type public.app_role as enum ('admin','treasurer','viewer');

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  role public.app_role not null default 'viewer',
  created_at timestamptz not null default now()
);
create table public.members (
  id uuid primary key default gen_random_uuid(), member_name text not null unique,
  family_name text, phone text, status text not null default 'active' check (status in ('active','inactive')),
  annual_commitment numeric(12,2) not null default 0 check (annual_commitment >= 0),
  created_at timestamptz not null default now()
);
create unique index members_name_unique_idx on public.members(lower(member_name));
create table public.donations (
  id uuid primary key default gen_random_uuid(), member_id uuid references public.members(id) on delete set null,
  donation_year integer not null check (donation_year between 1900 and 2200), amount numeric(12,2) not null check (amount > 0),
  donation_type text, payment_date date, remarks text, created_at timestamptz not null default now()
);
create table public.expenses (
  id uuid primary key default gen_random_uuid(), expense_date date not null, amount numeric(12,2) not null check (amount > 0),
  category text check (category in ('Festival','Temple','Charity','Maintenance','Miscellaneous')), description text,
  created_at timestamptz not null default now()
);
create table public.yearly_summary (
  year integer primary key, opening_balance numeric(12,2) not null default 0, total_income numeric(12,2) not null default 0,
  total_expense numeric(12,2) not null default 0, closing_balance numeric(12,2) generated always as (opening_balance + total_income - total_expense) stored
);
create index donations_member_year_idx on public.donations(member_id,donation_year);
create index donations_payment_date_idx on public.donations(payment_date);
create index expenses_date_idx on public.expenses(expense_date);

create function public.current_role() returns public.app_role language sql stable security definer set search_path=public as $$ select coalesce((select role from public.users where id=auth.uid()),'viewer') $$;
create function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$ begin insert into public.users(id,email) values(new.id,new.email); return new; end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

alter table public.users enable row level security; alter table public.members enable row level security;
alter table public.donations enable row level security; alter table public.expenses enable row level security; alter table public.yearly_summary enable row level security;
create policy "authenticated users can read profiles" on public.users for select to authenticated using (true);
create policy "admins manage profiles" on public.users for all to authenticated using (public.current_role()='admin') with check (public.current_role()='admin');
create policy "authenticated users read members" on public.members for select to authenticated using (true);
create policy "admins manage members" on public.members for all to authenticated using (public.current_role()='admin') with check (public.current_role()='admin');
create policy "authenticated users read donations" on public.donations for select to authenticated using (true);
create policy "finance roles manage donations" on public.donations for all to authenticated using (public.current_role() in ('admin','treasurer')) with check (public.current_role() in ('admin','treasurer'));
create policy "authenticated users read expenses" on public.expenses for select to authenticated using (true);
create policy "finance roles manage expenses" on public.expenses for all to authenticated using (public.current_role() in ('admin','treasurer')) with check (public.current_role() in ('admin','treasurer'));
create policy "authenticated users read summaries" on public.yearly_summary for select to authenticated using (true);
create policy "admins manage summaries" on public.yearly_summary for all to authenticated using (public.current_role()='admin') with check (public.current_role()='admin');

create view public.pending_collections with (security_invoker=true) as
select m.id,m.member_name,extract(year from current_date)::int as year,m.annual_commitment-coalesce(sum(d.amount) filter (where d.donation_type='Sandha' and d.donation_year=extract(year from current_date)),0) as pending_amount
from public.members m left join public.donations d on d.member_id=m.id where m.status='active' group by m.id,m.member_name,m.annual_commitment;
