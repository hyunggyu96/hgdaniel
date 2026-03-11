alter table public.articles enable row level security;

grant usage on schema public to anon;
grant select on table public.articles to anon;

drop policy if exists "anon_can_read_articles_non_noise" on public.articles;
create policy "anon_can_read_articles_non_noise"
on public.articles
for select
to anon
using (category is distinct from 'NOISE');
