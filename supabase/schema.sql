-- ============================================================================
-- Cho Rental — Supabase database schema
-- How to run: Supabase Dashboard → SQL Editor → New query → paste → Run
-- Safe to re-run: every statement uses IF NOT EXISTS / OR REPLACE guards,
-- and the seed block only inserts when the tables are still empty.
-- ============================================================================

-- 1. TABLES ------------------------------------------------------------------

create table if not exists public.dresses (
  id uuid primary key default gen_random_uuid(),
  dress_name text not null,
  quantity integer not null default 1 check (quantity >= 1),
  rental_price numeric(10, 2) not null default 0 check (rental_price >= 0),
  date_added date not null default current_date,
  status text not null default 'Available'
    check (status in ('Available', 'Rented', 'Unavailable', 'Archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rentals (
  id uuid primary key default gen_random_uuid(),
  -- Typed manually in the Add Rent form; source of truth for display/history.
  dress_name text not null,
  -- Linked inventory record (null = standalone rental, no inventory change).
  -- RESTRICT protects history: a dress with rentals cannot be hard-deleted.
  dress_id uuid references public.dresses (id) on delete restrict,
  customer_name text not null,
  rental_date date not null,
  expected_return_date date not null,
  actual_return_date date,
  rental_fee numeric(10, 2) not null default 0 check (rental_fee >= 0),
  status text not null default 'Rented'
    check (status in ('Rented', 'Returned')),
  condition text
    check (condition in ('Good', 'Minor Damage', 'Damaged')),
  remarks text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (expected_return_date >= rental_date)
);

create table if not exists public.returns (
  id uuid primary key default gen_random_uuid(),
  rental_id uuid not null references public.rentals (id) on delete cascade,
  actual_return_date date not null,
  condition text not null
    check (condition in ('Good', 'Minor Damage', 'Damaged')),
  remarks text not null default '',
  created_at timestamptz not null default now()
);

-- 2. INDEXES -----------------------------------------------------------------

create index if not exists rentals_dress_id_idx on public.rentals (dress_id);
create index if not exists rentals_status_idx on public.rentals (status);
create index if not exists rentals_expected_return_idx on public.rentals (expected_return_date);
create index if not exists rentals_dress_name_idx on public.rentals (dress_name);
create index if not exists returns_rental_id_idx on public.returns (rental_id);
create index if not exists dresses_status_idx on public.dresses (status);

-- 3. AUTO updated_at ----------------------------------------------------------

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_dresses_updated_at on public.dresses;
create trigger set_dresses_updated_at
  before update on public.dresses
  for each row execute function public.handle_updated_at();

drop trigger if exists set_rentals_updated_at on public.rentals;
create trigger set_rentals_updated_at
  before update on public.rentals
  for each row execute function public.handle_updated_at();

-- 4. ROW LEVEL SECURITY -------------------------------------------------------
-- Single-owner app with no login, so the anon key gets full access.
-- If you add Supabase Auth later, replace `to anon, authenticated`
-- with `to authenticated` and add an owner check (e.g. auth.uid() = ...).

alter table public.dresses enable row level security;
alter table public.rentals enable row level security;
alter table public.returns enable row level security;

drop policy if exists "Owner full access to dresses" on public.dresses;
create policy "Owner full access to dresses"
  on public.dresses for all
  to anon, authenticated
  using (true) with check (true);

drop policy if exists "Owner full access to rentals" on public.rentals;
create policy "Owner full access to rentals"
  on public.rentals for all
  to anon, authenticated
  using (true) with check (true);

drop policy if exists "Owner full access to returns" on public.returns;
create policy "Owner full access to returns"
  on public.returns for all
  to anon, authenticated
  using (true) with check (true);

-- 5. HELPER VIEW: active rentals with due/overdue computed --------------------

create or replace view public.active_rentals as
select
  r.id,
  r.dress_name,
  r.dress_id,
  r.customer_name,
  r.rental_date,
  r.expected_return_date,
  r.rental_fee,
  case
    when r.expected_return_date < current_date then 'Overdue'
    when r.expected_return_date = current_date then 'Due Today'
    else 'Rented'
  end as display_status,
  greatest(0, (current_date - r.expected_return_date)) as days_overdue
from public.rentals r
where r.status = 'Rented';

-- 6. SEED DATA (runs once — matches the app prototype) ------------------------

do $$
begin
  if not exists (select 1 from public.dresses) then

    insert into public.dresses (dress_name, quantity, rental_price, date_added, status)
    values
      ('Fitted Pink Dress', 1, 350, current_date - 19, 'Available'),
      ('Black Glitz Dress', 1, 350, current_date - 19, 'Rented'),
      ('Valentina Dress',   1, 500, current_date - 19, 'Available');

    insert into public.rentals
      (dress_name, dress_id, customer_name, rental_date,
       expected_return_date, actual_return_date, rental_fee,
       status, condition, remarks)
    values
      ('Black Glitz Dress',
        (select id from public.dresses where dress_name = 'Black Glitz Dress' limit 1),
        'Maria', current_date - 19, current_date - 18, current_date - 18,
        350, 'Returned', 'Good', 'Returned on time.'),
      ('Black Glitz Dress',
        (select id from public.dresses where dress_name = 'Black Glitz Dress' limit 1),
        'Ana', current_date - 15, current_date - 14, current_date - 14,
        350, 'Returned', 'Good', ''),
      ('Black Glitz Dress',
        (select id from public.dresses where dress_name = 'Black Glitz Dress' limit 1),
        'Jenny', current_date - 7, current_date - 6, current_date - 6,
        350, 'Returned', 'Good', ''),
      ('Black Glitz Dress',
        (select id from public.dresses where dress_name = 'Black Glitz Dress' limit 1),
        'Maria', current_date, current_date + 1, null,
        350, 'Rented', null, '');

    insert into public.returns (rental_id, actual_return_date, condition, remarks)
    select id, actual_return_date, condition, remarks
    from public.rentals
    where status = 'Returned';

  end if;
end $$;
