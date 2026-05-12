create extension if not exists pgcrypto;

create table if not exists statements (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null,
  raw_text text,
  refined_text text not null,
  scenario text not null default 'relationship',
  tone text not null default 'empathetic',
  created_at timestamptz not null default now()
);

create index if not exists statements_user_created_idx on statements (clerk_user_id, created_at desc);

create table if not exists journal_entries (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null,
  title text,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists journal_entries_user_created_idx on journal_entries (clerk_user_id, created_at desc);

create table if not exists uploaded_files (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null,
  name text not null,
  url text not null,
  key text not null,
  size bigint,
  created_at timestamptz not null default now()
);

create index if not exists uploaded_files_user_created_idx on uploaded_files (clerk_user_id, created_at desc);
