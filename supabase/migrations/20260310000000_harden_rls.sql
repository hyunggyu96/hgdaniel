-- Harden RLS: explicit write restrictions on public data tables
-- Ensures anon key cannot INSERT/UPDATE/DELETE even if future policy changes

-- ============================================
-- 1. mfds_products — public read, service_role write only
-- ============================================
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'mfds_products' AND policyname = 'Service role can modify mfds_products'
    ) THEN
        CREATE POLICY "Service role can modify mfds_products"
            ON public.mfds_products FOR ALL
            USING (auth.role() = 'service_role')
            WITH CHECK (auth.role() = 'service_role');
    END IF;
END $$;

-- ============================================
-- 2. nedrug_products — public read, service_role write only
-- ============================================
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'nedrug_products' AND policyname = 'Service role can modify nedrug_products'
    ) THEN
        CREATE POLICY "Service role can modify nedrug_products"
            ON public.nedrug_products FOR ALL
            USING (auth.role() = 'service_role')
            WITH CHECK (auth.role() = 'service_role');
    END IF;
END $$;

-- ============================================
-- 3. articles — ensure public read, service_role write only
-- ============================================
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'articles' AND policyname = 'Public read access on articles'
    ) THEN
        CREATE POLICY "Public read access on articles"
            ON public.articles FOR SELECT
            USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'articles' AND policyname = 'Service role can modify articles'
    ) THEN
        CREATE POLICY "Service role can modify articles"
            ON public.articles FOR ALL
            USING (auth.role() = 'service_role')
            WITH CHECK (auth.role() = 'service_role');
    END IF;
END $$;

-- ============================================
-- 4. recovery_logs — service_role only (no public access)
-- ============================================
ALTER TABLE public.recovery_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'recovery_logs' AND policyname = 'Service role full access on recovery_logs'
    ) THEN
        CREATE POLICY "Service role full access on recovery_logs"
            ON public.recovery_logs FOR ALL
            USING (auth.role() = 'service_role')
            WITH CHECK (auth.role() = 'service_role');
    END IF;
END $$;
