-- Daily snapshots of Editor's Pick data (for future AI training)
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.editors_picks_snapshots (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    snapshot_date DATE NOT NULL UNIQUE,
    snapshot_data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: service_role only (cron endpoint uses service_role key)
ALTER TABLE public.editors_picks_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on snapshots"
    ON public.editors_picks_snapshots FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');
