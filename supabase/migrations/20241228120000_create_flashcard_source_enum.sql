-- Migration: Create flashcard_source enum
-- Purpose: Define the source type for flashcards (AI-generated vs manual)
-- Date: 2024-12-28 12:00:00 UTC

-- create the flashcard_source enum to track the origin of flashcards
-- 'ai-full' - accepted from ai suggestion without changes
-- 'ai-edited' - accepted from ai suggestion with user edits  
-- 'manual' - created manually by the user
create type public.flashcard_source as enum (
  'ai-full',
  'ai-edited', 
  'manual'
);

-- add comment to document the enum
comment on type public.flashcard_source is 'Tracks the origin of a flashcard: AI-generated (full/edited) or manually created'; 