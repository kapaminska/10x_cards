-- Migration: Remove duplicate checking constraints
-- Description: Removes the unique constraint and index used for duplicate checking on generations table
-- Since we no longer want to prevent users from submitting the same text multiple times

-- Drop the unique constraint on (user_id, source_text_hash)
ALTER TABLE public.generations
DROP CONSTRAINT IF EXISTS generations_user_id_source_text_hash_key;

-- Drop the index on source_text_hash if it exists
DROP INDEX IF EXISTS idx_generations_source_text_hash;

-- Note: We keep the source_text_hash column as it's still useful for storage and reference purposes,
-- but it no longer enforces uniqueness 