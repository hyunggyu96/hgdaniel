-- Add preferences JSONB column to accounts table
-- Stores user display settings: showBadges, showKeywords, viewMode, classicLayout
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;
