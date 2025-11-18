create extension if not exists "pgcrypto";

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  original_name text not null,
  storage_path text not null unique,
  status text not null default 'draft' check (status in ('draft','in_review','confirmed')),
  source text not null default 'manual' check (source in ('amazon','rakuten','manual','other')),
  note text,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists documents_status_idx on public.documents(status);
create index if not exists documents_created_at_idx on public.documents(created_at desc);
create index if not exists documents_source_status_idx on public.documents(source, status);

create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  date date not null,
  vendor text not null,
  account_title text not null,
  amount integer not null check (amount > 0),
  tax_category text not null check (tax_category in ('standard_10','reduced_8','exempt')),
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists entries_document_id_idx on public.entries(document_id);
create index if not exists entries_date_idx on public.entries(date);
create index if not exists entries_vendor_date_idx on public.entries(vendor, date);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger documents_set_updated_at
  before update on public.documents
  for each row execute procedure public.set_updated_at();

create trigger entries_set_updated_at
  before update on public.entries
  for each row execute procedure public.set_updated_at();

alter table public.documents enable row level security;
alter table public.entries enable row level security;

create policy "Users can select own documents" on public.documents
  for select using (auth.uid() = created_by);

create policy "Users can insert own documents" on public.documents
  for insert with check (auth.uid() = created_by);

create policy "Users can update own documents" on public.documents
  for update using (auth.uid() = created_by);

create policy "Users can delete own documents" on public.documents
  for delete using (auth.uid() = created_by);

create policy "Users can select own entries" on public.entries
  for select using (auth.uid() = created_by);

create policy "Users can insert own entries" on public.entries
  for insert with check (auth.uid() = created_by);

create policy "Users can update own entries" on public.entries
  for update using (auth.uid() = created_by);

create policy "Users can delete own entries" on public.entries
  for delete using (auth.uid() = created_by);
