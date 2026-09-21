-- Run this once in Supabase: SQL Editor → New query → paste → Run.

create table if not exists public.orders (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  buyer_name text not null check (char_length(buyer_name) between 1 and 60),
  product_name text not null,
  product_title text,
  qty int not null default 1 check (qty between 1 and 5),
  total int not null
);

alter table public.orders enable row level security;

-- Visitors can place orders...
create policy "anyone can place an order"
  on public.orders for insert to anon
  with check (true);

-- ...but can't read them. There's no select policy, so buyer names are only
-- visible to you in the Supabase dashboard (Table Editor → orders).

-- The site only gets the number of orders per product, never the names.
create or replace function public.order_counts()
returns table (product_name text, orders bigint)
language sql
security definer
set search_path = public
as $$
  select product_name, count(*) from orders group by product_name;
$$;

grant execute on function public.order_counts() to anon;
