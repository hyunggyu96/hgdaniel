-- Add email, birth_year, and consent fields to accounts table
-- Run this in Supabase SQL Editor before deploying the registration update

ALTER TABLE accounts ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS birth_year INTEGER;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS agreed_privacy BOOLEAN DEFAULT false;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS agreed_terms BOOLEAN DEFAULT false;

-- Unique constraint on email (allows NULL for existing users)
CREATE UNIQUE INDEX IF NOT EXISTS accounts_email_unique ON accounts (email) WHERE email IS NOT NULL;
