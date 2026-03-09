-- Drop legacy article_link column from user_collections.
-- Data was migrated to item_key/url in 20260220193000_auth_and_user_collections.sql
-- but the old column was never dropped, causing NOT NULL violations on new inserts.
ALTER TABLE public.user_collections DROP COLUMN IF EXISTS article_link;
