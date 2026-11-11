-- Paint Labs: suggested table + Row Level Security setup.
-- You said the tables already exist, so review this and run only what is missing
-- (policies are the part the website cannot work without).
-- Website visitors use the publishable (anon) key: they may INSERT into the five
-- form tables, and may only READ `reviews`. They can never read orders, inquiries, etc.

create table if not exists not_in_giki (
  id bigint generated always as identity primary key, created_at timestamptz default now(),
  email text, location text, customer_name text, phone text, wishlist_items text, notes text);

create table if not exists inquiries (
  id bigint generated always as identity primary key, created_at timestamptz default now(),
  name text, email text, message text, status text default 'New');

create table if not exists original_orders (
  id bigint generated always as identity primary key, created_at timestamptz default now(),
  order_id text, customer_name text, email text, painting_id text,
  delivery_address text, payment_status text default 'Pending Cash');

create table if not exists custom_portraits (
  id bigint generated always as identity primary key, created_at timestamptz default now(),
  order_id text, customer_name text, email text, canvas_size text,
  reference_image_url text, special_notes text, order_status text default 'In Queue');

create table if not exists reviews (
  id bigint generated always as identity primary key, created_at timestamptz default now(),
  customer_name text, rating int check (rating between 1 and 5), comment text, painting_id text);

alter table not_in_giki      enable row level security;
alter table inquiries        enable row level security;
alter table original_orders  enable row level security;
alter table custom_portraits enable row level security;
alter table reviews          enable row level security;

create policy "public can submit" on not_in_giki      for insert to anon with check (true);
create policy "public can submit" on inquiries        for insert to anon with check (true);
create policy "public can submit" on original_orders  for insert to anon with check (true);
create policy "public can submit" on custom_portraits for insert to anon with check (true);
create policy "public can submit" on reviews          for insert to anon with check (true);
create policy "public can read"   on reviews          for select to anon using (true);
