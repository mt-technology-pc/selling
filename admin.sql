-- Products, image storage and admin access.
-- Run this once in Supabase: SQL Editor → New query → paste → Run.
-- (Run supabase.sql and reviews.sql first — this file adds admin rules to those tables.)

-- ============ Admins ============
-- Only users listed here can use admin.html. Add yourself at the bottom of this file.
create table if not exists public.admins (
  user_id uuid primary key references auth.users on delete cascade
);
alter table public.admins enable row level security;
-- No policies on admins: nobody can read or change it through the API.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from admins where user_id = auth.uid());
$$;

-- ============ Products (friends) ============
create table if not exists public.products (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  name text not null unique,          -- used to match orders and reviews
  title text not null,
  price int not null check (price >= 0),
  old_price int check (old_price >= 0),
  loc text not null default 'Western',
  img text not null,                  -- image URL (Storage) or a local path like images/x.png
  perks text[] not null default '{}',
  hot boolean not null default false, -- shows the 🔥 HOT SELLING badge
  active boolean not null default true, -- hidden from the shop when false
  sort_order int not null default 100 -- lower comes first
);
alter table public.products enable row level security;

create policy "shop shows active products"
  on public.products for select to anon, authenticated
  using (active or public.is_admin());

create policy "admins add products"
  on public.products for insert to authenticated
  with check (public.is_admin());

create policy "admins edit products"
  on public.products for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "admins delete products"
  on public.products for delete to authenticated
  using (public.is_admin());

-- Your current friends, so the shop looks the same as before
insert into public.products (name, title, price, old_price, loc, img, perks, hot, sort_order) values
  ('hanash', '🔥 HOT SELLING 🔥 hanash — Buy 1 Get 1 FREE', 899, 34999, 'Western', 'images/hanash.png', array['🔥 #1 Best Seller this week', '⚡ Selling fast — only 2 left in stock!', '🎁 Buy 1 Get 1 FREE (limited time)', '⚠️ Seller not responsible for chaos']::text[], true, 10),
  ('Chenuk', 'Chenuk Pro Max 2026 — Original, Slightly Used, No Box', 499, 49900, 'Western', 'images/chenuk.png', array['🔋 Battery: needs a snack every 2 hours', '🤓 Built-in glasses, free of charge', '📶 Replies to WhatsApp: sometimes', '❌ No warranty, no returns']::text[], false, 20),
  ('Dilon', 'Dilon Ultra — Genuine Model, Comes With Free Excuses', 999, 25000, 'Western', 'images/dilon.png', array['⏰ Always 10 minutes late (feature, not bug)', '🍛 Runs on rice & curry', '🔊 Loud speaker built in', '↩️ 7 Days Return — seller will NOT accept']::text[], false, 30),
  ('Febian', 'Febian Only — Single Unit, Limited Stock, Rare Edition', 250, 15000, 'Western', 'images/febian only.png', array['💤 Sleep mode activates in class', '🎮 Pre-installed with games', '📦 Ships in school uniform', '🛡️ Warranty: 0 days']::text[], false, 40),
  ('Nibodh', 'Nibodh Lite — Budget Edition, Great Value for Money', 5999, 9999, 'Western', 'images/nibodh.png', array['🧠 Knows all the answers (after the exam)', '🍪 Accepts payment in biscuits', '😂 Laugh track included', '🚚 Free delivery — walks to you']::text[], false, 50),
  ('Ragith', 'Ragith Plus — Brand New Condition, Never Did Homework', 350, 20000, 'Western', 'images/ragith.png', array['📚 Homework module not installed', '⚡ Fast charging: 1 samosa = full power', '🗣️ Voice assistant: talks non-stop', '❌ Non-refundable']::text[], false, 60),
  ('Diyon', 'Diyon Mini — Clearance Sale, Comes With Free Birds 🐦', 20, 5000, 'Western', 'images/diyon.jpg', array['🐦 Free flying birds included (dizzy mode)', '😴 Always in low-power mode', '📦 Cheapest item in the store', '❌ No returns, seriously']::text[], false, 70),
  ('Nibodh & Dilon', 'COMBO DEAL 🔥 Nibodh + Dilon — Buy 1 Get 1 FREE', 599, 34999, 'Western', 'images/combo nibodh and dilon.png', array['👯 Cannot be separated, sold as a pair', '🔊 Double the noise', '🎁 Free tempered glass (not really)', '⚠️ Seller not responsible for chaos']::text[], false, 80),
  ('the Squad', 'MEGA COMBO PACK 🎉 Full Squad Bundle — 9.9 Mega Deals', 999, 99999, 'Western', 'images/combo pack.jpg', array['📦 Whole gang in one box', '📸 Poses for every photo', '🍕 Warning: will eat all your food', '🚚 Free island-wide delivery']::text[], false, 90),
  ('Didula', 'Didula Max — Latest Model, Fresh Stock, Hurry Up!', 150, 12000, 'Western', 'images/didula.png', array['📱 Screen time: 12 hours a day', '🍗 Powered by fried chicken', '😎 Comes with free attitude', '❌ No refunds after opening the box']::text[], false, 100),
  ('Siddharth', 'Siddharth Max — Latest Model, Fresh Stock, Hurry Up!', 4500, 12000, 'Western', 'images/sid.png', array['📱 Screen time: 12 hours a day', '🍗 Powered by fried chicken', '😎 Comes with free attitude', '❌ No refunds after opening the box']::text[], false, 110),
  ('Imadh', 'Imadh Lareef — Limited Stock Edition', 4500, 12000, 'Western', 'images/imadh.png', array['📱 Screen time: 12 hours a day', '🍗 Powered by fried chicken', '😎 Comes with free attitude', '❌ No refunds after opening the box']::text[], false, 120),
  ('Shakeel', 'Shakeel Bing Chun Edition — Jenna Ortega''s BF', 4500, 12000, 'Western', 'images/shakeel.png', array['📱 Screen time: 12 hours a day', '🍗 Powered by fried chicken', '😎 Comes with free attitude', '❌ No refunds after opening the box']::text[], false, 130),
  ('muhammad', 'Muhamamd Nazeer', 20500, 12000, 'Western', 'images/Screenshot 2026-09-21 at 14.57.28.png', array['📱 Screen time: 12 hours a day', '🍗 Powered by fried chicken', '😎 Comes with free attitude', '❌ No refunds after opening the box']::text[], false, 140)
on conflict (name) do nothing;

-- ============ Admin access to orders & reviews ============
create policy "admins read orders"
  on public.orders for select to authenticated
  using (public.is_admin());

create policy "admins delete orders"
  on public.orders for delete to authenticated
  using (public.is_admin());

create policy "admins delete reviews"
  on public.reviews for delete to authenticated
  using (public.is_admin());

-- ============ Storage bucket for product photos ============
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Anyone can view the photos (the bucket is public); only admins can change them.
create policy "admins upload product images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "admins update product images"
  on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and public.is_admin());

create policy "admins delete product images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and public.is_admin());

-- ============ Make yourself an admin ============
-- 1. Supabase → Authentication → Users → Add user → Create new user
--    (enter your email + a password, tick "Auto Confirm User").
-- 2. Put that email below and run just this statement:
--
-- insert into public.admins (user_id)
-- select id from auth.users where email = 'you@example.com';
