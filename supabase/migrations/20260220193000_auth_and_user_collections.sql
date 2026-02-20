create extension if not exists pgcrypto;

create table if not exists public.accounts (
    id uuid primary key default gen_random_uuid(),
    username text not null unique,
    password_hash text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

do $$
begin
    if not exists (
        select 1
        from pg_constraint
        where conname = 'accounts_username_lowercase'
          and conrelid = 'public.accounts'::regclass
    ) then
        alter table public.accounts
            add constraint accounts_username_lowercase check (username = lower(username));
    end if;
end $$;

alter table public.accounts enable row level security;
alter table public.accounts force row level security;
revoke all on table public.accounts from anon, authenticated;

create or replace function public.touch_accounts_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists trg_accounts_updated_at on public.accounts;
create trigger trg_accounts_updated_at
before update on public.accounts
for each row
execute function public.touch_accounts_updated_at();

create table if not exists public.user_collections (
    id bigint generated always as identity primary key,
    user_id text not null,
    item_type text,
    item_key text,
    title text,
    url text,
    metadata jsonb,
    created_at timestamptz not null default now()
);

alter table public.user_collections add column if not exists item_type text;
alter table public.user_collections add column if not exists item_key text;
alter table public.user_collections add column if not exists title text;
alter table public.user_collections add column if not exists url text;
alter table public.user_collections add column if not exists metadata jsonb;

do $$
begin
    if exists (
        select 1
        from information_schema.columns
        where table_schema = 'public'
          and table_name = 'user_collections'
          and column_name = 'article_link'
    ) then
        execute $sql$
            update public.user_collections
            set item_type = coalesce(item_type, 'news'),
                item_key = coalesce(item_key, article_link, id::text),
                url = coalesce(url, article_link),
                metadata = coalesce(metadata, '{}'::jsonb)
            where item_type is null
               or item_key is null
               or url is null
               or metadata is null
        $sql$;
    else
        execute $sql$
            update public.user_collections
            set item_type = coalesce(item_type, 'news'),
                item_key = coalesce(item_key, url, id::text),
                metadata = coalesce(metadata, '{}'::jsonb)
            where item_type is null
               or item_key is null
               or metadata is null
        $sql$;
    end if;
end $$;

update public.user_collections
set item_type = coalesce(item_type, 'news'),
    item_key = coalesce(item_key, url, id::text),
    metadata = coalesce(metadata, '{}'::jsonb)
where item_type is null
   or item_key is null
   or metadata is null;

alter table public.user_collections alter column metadata set default '{}'::jsonb;
alter table public.user_collections alter column metadata set not null;
alter table public.user_collections alter column item_type set not null;
alter table public.user_collections alter column item_key set not null;

with ranked as (
    select ctid,
           row_number() over (
               partition by user_id, item_type, item_key
               order by created_at desc, id desc
           ) as rn
    from public.user_collections
)
delete from public.user_collections u
using ranked r
where u.ctid = r.ctid
  and r.rn > 1;

do $$
begin
    if not exists (
        select 1
        from pg_constraint
        where conname = 'user_collections_item_type_check'
          and conrelid = 'public.user_collections'::regclass
    ) then
        alter table public.user_collections
            add constraint user_collections_item_type_check
            check (item_type in ('news', 'paper'));
    end if;
end $$;

do $$
begin
    if not exists (
        select 1
        from pg_constraint
        where conname = 'user_collections_unique_item'
          and conrelid = 'public.user_collections'::regclass
    ) then
        alter table public.user_collections
            add constraint user_collections_unique_item
            unique (user_id, item_type, item_key);
    end if;
end $$;

alter table public.user_collections enable row level security;
alter table public.user_collections force row level security;
revoke all on table public.user_collections from anon, authenticated;

create index if not exists idx_user_collections_user_type_created
    on public.user_collections (user_id, item_type, created_at desc);
