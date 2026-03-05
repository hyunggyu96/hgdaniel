-- Security: Enable RLS on all sensitive tables
-- Run in Supabase SQL Editor

-- ============================================
-- 1. accounts table — prevent anon key from modifying is_admin
-- ============================================
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

-- Allow service_role full access (our API uses service_role key)
CREATE POLICY "Service role full access on accounts"
    ON public.accounts FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Block anon key from all operations on accounts
-- (all account operations go through our API which uses service_role)

-- ============================================
-- 2. editors_picks_sections — read public, write admin-only (via service_role)
-- ============================================
ALTER TABLE public.editors_picks_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read sections"
    ON public.editors_picks_sections FOR SELECT
    USING (true);

CREATE POLICY "Service role can modify sections"
    ON public.editors_picks_sections FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- ============================================
-- 3. editors_picks_items — read public, write admin-only (via service_role)
-- ============================================
ALTER TABLE public.editors_picks_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read items"
    ON public.editors_picks_items FOR SELECT
    USING (true);

CREATE POLICY "Service role can modify items"
    ON public.editors_picks_items FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');
