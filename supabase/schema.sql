-- ============================================================
--  Tadhana's Handicrafts: run this once in Supabase → SQL Editor
-- ============================================================

-- ---------- Tables ----------
create table if not exists settings (
  id int primary key default 1 check (id = 1),  -- only ever one row
  name text not null default 'Tadhana''s Handicrafts',
  tagline text default '',
  messenger_username text default '',
  facebook_url text default '',
  phone text default '',
  location text default '',
  hours text default ''
);

create table if not exists bouquets (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  category text default '',
  description text default '',
  image_url text default '',
  emoji text default '💐',
  code text default '',  -- e.g. B001, shown on the photo so customers can reference it
  wrapper_id text default '',
  recipe jsonb default '[]',  -- [{ flower_id, color, qty }]: what's inside
  sort int default 0,
  active boolean default true
);

create table if not exists flowers (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  type text not null default 'main' check (type in ('main', 'filler')),
  colors text[] default '{}',
  image_url text default '',
  emoji text default '🌸',
  sort int default 0,
  active boolean default true
);

create table if not exists options (
  id text primary key default gen_random_uuid()::text,
  kind text not null check (kind in ('wrapper', 'addon')),
  name text not null,
  sort int default 0,
  active boolean default true
);

-- (for projects created with an older version of this file)
alter table bouquets add column if not exists wrapper_id text default '';
alter table bouquets add column if not exists recipe jsonb default '[]';
alter table bouquets add column if not exists code text default '';
alter table options add column if not exists active boolean default true;

-- ---------- Security: anyone can read, only the logged-in owner can change ----------
do $$
declare t text;
begin
  foreach t in array array['settings', 'bouquets', 'flowers', 'options'] loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "public read" on %I', t);
    execute format('drop policy if exists "owner write" on %I', t);
    execute format('create policy "public read" on %I for select using (true)', t);
    execute format('create policy "owner write" on %I for all to authenticated using (true) with check (true)', t);
  end loop;
end $$;

-- ---------- Photo storage ----------
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

drop policy if exists "photos public read" on storage.objects;
drop policy if exists "photos owner upload" on storage.objects;
drop policy if exists "photos owner update" on storage.objects;
drop policy if exists "photos owner delete" on storage.objects;
create policy "photos public read" on storage.objects for select using (bucket_id = 'photos');
create policy "photos owner upload" on storage.objects for insert to authenticated with check (bucket_id = 'photos');
create policy "photos owner update" on storage.objects for update to authenticated using (bucket_id = 'photos');
create policy "photos owner delete" on storage.objects for delete to authenticated using (bucket_id = 'photos');

-- ---------- Starter data (edit later in the admin page) ----------
insert into settings (id, name, tagline, messenger_username, facebook_url, phone, location, hours) values
  (1, 'Tadhana''s Handicrafts', 'Handmade bouquets for every kind of story.', 'tadhanashandicrafts',
   'https://facebook.com/tadhanashandicrafts', '0917 000 0000', 'Quezon City, Metro Manila', 'Mon–Sat, 9AM–7PM')
on conflict (id) do nothing;

insert into bouquets (id, code, name, category, description, emoji, wrapper_id, recipe, sort) values
  ('classic-red', 'B001', 'Classic Red Dozen', 'Anniversary', 'A dozen red roses with baby’s breath. Timeless.', '🌹', 'korean',
   '[{"flower_id":"rose","color":"Red","qty":12},{"flower_id":"babys-breath","color":"White","qty":4}]', 1),
  ('sunny-day', 'B002', 'Sunny Day', 'Graduation', 'Bright sunflowers with eucalyptus for the big day.', '🌻', 'kraft',
   '[{"flower_id":"sunflower","color":"Yellow","qty":3},{"flower_id":"eucalyptus","color":"Green","qty":3}]', 2),
  ('blush-tulips', 'B003', 'Blush Tulips', 'Birthday', 'Soft pink tulips, simple and sweet.', '🌷', 'korean',
   '[{"flower_id":"tulip","color":"Pink","qty":10},{"flower_id":"fern","color":"Green","qty":3}]', 3),
  ('mini-love', 'B004', 'Mini Love', 'Just Because', 'Small but sweet. Perfect for “just because”.', '💐', 'kraft',
   '[{"flower_id":"rose","color":"Pink","qty":3},{"flower_id":"babys-breath","color":"White","qty":2}]', 4),
  ('white-peace', 'B005', 'White Peace', 'Sympathy', 'Calm white lilies and greens in a basket.', '🤍', 'basket',
   '[{"flower_id":"lily","color":"White","qty":6},{"flower_id":"eucalyptus","color":"Green","qty":5}]', 5),
  ('pastel-dream', 'B006', 'Pastel Dream', 'Birthday', 'Mixed pastel roses and carnations with statice.', '🌸', 'korean',
   '[{"flower_id":"rose","color":"Peach","qty":5},{"flower_id":"carnation","color":"Pink","qty":4},{"flower_id":"statice","color":"Purple","qty":3}]', 6)
on conflict (id) do nothing;

insert into flowers (id, name, type, colors, emoji, sort) values
  ('rose', 'Rose', 'main', '{Red,Pink,White,Yellow,Peach}', '🌹', 1),
  ('tulip', 'Tulip', 'main', '{Pink,White,Yellow,Purple}', '🌷', 2),
  ('sunflower', 'Sunflower', 'main', '{Yellow}', '🌻', 3),
  ('carnation', 'Carnation', 'main', '{Red,Pink,White}', '🌺', 4),
  ('lily', 'Lily', 'main', '{White,Pink}', '🪷', 5),
  ('babys-breath', 'Baby’s Breath', 'filler', '{White}', '☁️', 6),
  ('eucalyptus', 'Eucalyptus', 'filler', '{Green}', '🌿', 7),
  ('statice', 'Statice', 'filler', '{Purple,White}', '🪻', 8),
  ('fern', 'Fern Leaves', 'filler', '{Green}', '🍃', 9)
on conflict (id) do nothing;

insert into options (id, kind, name, sort) values
  ('kraft', 'wrapper', 'Kraft Paper', 1),
  ('korean', 'wrapper', 'Korean Wrap', 2),
  ('box', 'wrapper', 'Flower Box', 3),
  ('basket', 'wrapper', 'Basket', 4),
  ('card', 'addon', 'Message Card', 5),
  ('ribbon', 'addon', 'Satin Ribbon', 6),
  ('chocolate', 'addon', 'Chocolates', 7)
on conflict (id) do nothing;
