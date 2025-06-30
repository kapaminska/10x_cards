-- Migration: Create performance indexes
-- Purpose: Add indexes to optimize query performance for common access patterns
-- Date: 2024-12-28 12:03:00 UTC
-- Affected tables: flashcards, generations, generation_error_logs

-- flashcards table indexes
-- index on user_id to speed up fetching all flashcards for a user
create index idx_flashcards_user_id on public.flashcards(user_id);

-- index on generation_id to speed up finding flashcards from a specific generation
create index idx_flashcards_generation_id on public.flashcards(generation_id);

-- index on created_at for chronological queries
create index idx_flashcards_created_at on public.flashcards(created_at);

-- generations table indexes
-- index on user_id to speed up fetching generation history for a user
create index idx_generations_user_id on public.generations(user_id);

-- index on source_text_hash for duplicate checks (part of unique constraint)
-- note: this index is automatically created by the unique constraint
-- but we're being explicit for documentation purposes
create index idx_generations_source_text_hash on public.generations(source_text_hash);

-- index on created_at for chronological queries
create index idx_generations_created_at on public.generations(created_at);

-- generation_error_logs table indexes
-- index on user_id to speed up queries on user-specific errors
create index idx_generation_error_logs_user_id on public.generation_error_logs(user_id);

-- index on created_at for chronological error analysis
create index idx_generation_error_logs_created_at on public.generation_error_logs(created_at);

-- index on model for error analysis by ai model
create index idx_generation_error_logs_model on public.generation_error_logs(model);

-- composite index for user and generation relationship queries
create index idx_flashcards_user_generation on public.flashcards(user_id, generation_id);

-- add comments explaining the purpose of each index
comment on index idx_flashcards_user_id is 'Speeds up fetching all flashcards for a user';
comment on index idx_flashcards_generation_id is 'Speeds up finding flashcards from a specific generation';
comment on index idx_generations_user_id is 'Speeds up fetching generation history for a user';
comment on index idx_generation_error_logs_user_id is 'Speeds up queries on user-specific errors'; 