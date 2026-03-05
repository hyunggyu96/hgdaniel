-- 1. Add extended fields to conferences table (10times-style template)
ALTER TABLE public.conferences
    ADD COLUMN IF NOT EXISTS timing TEXT,
    ADD COLUMN IF NOT EXISTS admission TEXT,
    ADD COLUMN IF NOT EXISTS frequency TEXT DEFAULT 'Annual',
    ADD COLUMN IF NOT EXISTS event_type TEXT DEFAULT 'Conference / Exhibition',
    ADD COLUMN IF NOT EXISTS expected_visitors TEXT,
    ADD COLUMN IF NOT EXISTS expected_exhibitors TEXT;

-- 2. Conference reviews table
CREATE TABLE IF NOT EXISTS public.conference_reviews (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    conference_id TEXT NOT NULL REFERENCES public.conferences(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (conference_id, username)
);

CREATE INDEX IF NOT EXISTS idx_conference_reviews_conference
    ON public.conference_reviews (conference_id, created_at DESC);

-- 3. RLS for conference_reviews
ALTER TABLE public.conference_reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read reviews
CREATE POLICY "Anyone can read conference reviews"
    ON public.conference_reviews FOR SELECT
    USING (true);

-- Authenticated users can insert their own reviews (via service role from API)
-- For now, allow all inserts/updates since auth is handled at API layer
CREATE POLICY "Anyone can insert conference reviews"
    ON public.conference_reviews FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can update own conference reviews"
    ON public.conference_reviews FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- 4. Updated_at trigger for reviews
CREATE OR REPLACE FUNCTION set_conference_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_conference_reviews_updated_at ON public.conference_reviews;
CREATE TRIGGER trg_conference_reviews_updated_at
BEFORE UPDATE ON public.conference_reviews
FOR EACH ROW
EXECUTE FUNCTION set_conference_reviews_updated_at();
