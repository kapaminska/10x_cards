-- Migration: Create triggers for automatic timestamp updates
-- Purpose: Auto-update the updated_at column when flashcards are modified
-- Date: 2024-12-28 12:04:00 UTC
-- Affected tables: flashcards
-- Functions: handle_updated_at

-- create function to handle updated_at timestamp updates
-- this function will be called by triggers to automatically update the updated_at column
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  -- set the updated_at column to the current timestamp
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- add comment to document the function
comment on function public.handle_updated_at() is 'Automatically updates the updated_at column to current timestamp';

-- create trigger on flashcards table to auto-update updated_at column
-- this trigger fires before any update operation on the flashcards table
create trigger on_flashcard_update
  before update on public.flashcards
  for each row
  execute procedure public.handle_updated_at();

-- add comment to document the trigger
comment on trigger on_flashcard_update on public.flashcards is 'Automatically updates updated_at timestamp when flashcard is modified'; 