-- Run this once in Supabase: SQL Editor → New query → paste → Run.

create table if not exists public.reviews (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  product_name text not null,
  reviewer_name text not null check (char_length(reviewer_name) between 1 and 40),
  rating int not null check (rating between 1 and 5),
  comment text check (char_length(comment) <= 300)
);

alter table public.reviews enable row level security;

-- Anyone can post a review...
create policy "anyone can post a review"
  on public.reviews for insert to anon
  with check (true);

-- ...and reviews are public, so everyone can read them.
create policy "anyone can read reviews"
  on public.reviews for select to anon
  using (true);
