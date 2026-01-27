-- Create a table for storing PubMed research papers
-- Run this in your Supabase SQL Editor

create table if not exists pubmed_papers (
  id text primary key, -- PubMed ID (PMID)
  title text not null,
  abstract text,
  authors text[],
  publication_date text,
  journal text,
  keywords text[], -- Array of search keywords matched
  link text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table pubmed_papers enable row level security;

-- Policy: Allow public read access
create policy "Public papers are viewable by everyone"
  on pubmed_papers for select
  using ( true );

-- Policy: Allow service_role (backend script) to insert/update
create policy "Service role can insert papers"
  on pubmed_papers for insert
  with check ( true );

create policy "Service role can update papers"
  on pubmed_papers for update
  using ( true );
