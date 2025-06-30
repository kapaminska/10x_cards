-- Migration: Create core tables for flashcard system
-- Purpose: Create generations, flashcards, and generation_error_logs tables
-- Date: 2024-12-28 12:01:00 UTC
-- Affected tables: generations, flashcards, generation_error_logs

-- create generations table to log ai generation attempts
-- this table tracks each attempt to generate flashcards using ai
create table public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  model varchar(100) not null,
  source_text_hash bytea not null,
  source_text_length integer not null check (source_text_length between 1000 and 10000),
  generation_duration_ms integer not null,
  suggestions_count integer not null check (suggestions_count >= 0),
  accepted_unedited_count integer check (accepted_unedited_count >= 0),
  accepted_edited_count integer check (accepted_edited_count >= 0),
  rejected_count integer check (rejected_count >= 0),
  created_at timestamptz not null default now(),
  
  -- ensure a user cannot generate from the exact same text twice
  unique (user_id, source_text_hash)
);

-- add comments to document the generations table
comment on table public.generations is 'Logs each attempt to generate flashcards using AI';
comment on column public.generations.source_text_hash is 'SHA-256 hash of the source text to prevent duplicates and save space';
comment on column public.generations.generation_duration_ms is 'Time taken for the LLM API to respond in milliseconds';
comment on column public.generations.suggestions_count is 'Total number of flashcards suggested by the AI';

-- create flashcards table to store individual flashcards
-- this is the main table for user-created flashcards
create table public.flashcards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  front varchar(200) not null,
  back varchar(500) not null,
  source public.flashcard_source not null,
  generation_id uuid references public.generations(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- add comments to document the flashcards table
comment on table public.flashcards is 'Stores individual flashcards created by users';
comment on column public.flashcards.front is 'The question or front side of the flashcard';
comment on column public.flashcards.back is 'The answer or back side of the flashcard';
comment on column public.flashcards.source is 'The source of the flashcard (AI or manual)';
comment on column public.flashcards.generation_id is 'References the AI generation session, NULL if source is manual';

-- create generation_error_logs table to track ai generation errors
-- this table logs any errors that occur during the ai generation process
create table public.generation_error_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  error_message text not null,
  error_context jsonb,
  created_at timestamptz not null default now(),
  model varchar(100) not null,
  source_text_hash bytea not null,
  source_text_length integer not null check (source_text_length between 1000 and 10000)
);

-- add comments to document the generation_error_logs table
comment on table public.generation_error_logs is 'Logs any errors that occur during the AI generation process';
comment on column public.generation_error_logs.error_context is 'Additional context for debugging (e.g., model name, partial response)';
comment on column public.generation_error_logs.user_id is 'The user who experienced the error, anonymized on user deletion'; 