-- Migration: Add tier system to accounts + usage tracking
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/jwkdxygcpfdmavxcbcfe/sql

-- 1. Add tier column to accounts
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'free';

-- 2. Add check constraint for valid tiers
DO $$ BEGIN
    ALTER TABLE accounts ADD CONSTRAINT accounts_tier_check CHECK (tier IN ('free', 'pro', 'enterprise'));
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 3. Create usage_logs table for daily quota tracking
CREATE TABLE IF NOT EXISTS usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Index for efficient daily count queries
CREATE INDEX IF NOT EXISTS idx_usage_logs_lookup
ON usage_logs (user_id, action, created_at);

-- 5. Verify
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'accounts' AND column_name = 'tier';
