-- Migration: Add is_admin to accounts + Editor's Pick tables
-- Run in Supabase SQL Editor

-- 1. Add admin flag to accounts (separate from tier)
ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

-- 2. Editor's Pick sections (max 3)
CREATE TABLE IF NOT EXISTS public.editors_picks_sections (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#1e3a5f',
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Editor's Pick items (articles assigned to sections)
CREATE TABLE IF NOT EXISTS public.editors_picks_items (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    section_id BIGINT NOT NULL REFERENCES public.editors_picks_sections(id) ON DELETE CASCADE,
    article_link TEXT NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (section_id, article_link)
);
CREATE INDEX IF NOT EXISTS idx_editors_picks_items_section
    ON public.editors_picks_items (section_id, display_order);

-- 4. Seed default section
INSERT INTO public.editors_picks_sections (name, color, display_order)
SELECT 'Editor''s Pick', '#1e3a5f', 0
WHERE NOT EXISTS (SELECT 1 FROM public.editors_picks_sections LIMIT 1);

-- 5. Set admin user
UPDATE accounts SET is_admin = true WHERE username = 'admincoauths356';
