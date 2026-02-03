-- RUN THIS IN SUPABASE SQL EDITOR

-- 1. Ensure the table is in the 'public' schema and accessible
GRANT ALL ON TABLE public.pubmed_papers TO postgres;
GRANT ALL ON TABLE public.pubmed_papers TO service_role;
GRANT ALL ON TABLE public.pubmed_papers TO anon;
GRANT ALL ON TABLE public.pubmed_papers TO authenticated;

-- 2. Also grant usage on the sequence if 'id' was serial (it's text here, but good practice)
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- 3. Force PostgREST to refresh its schema cache immediately
NOTIFY pgrst, 'reload config';

-- 4. Simple check: This should return 0 rows (or data) if table exists
SELECT count(*) FROM public.pubmed_papers;
