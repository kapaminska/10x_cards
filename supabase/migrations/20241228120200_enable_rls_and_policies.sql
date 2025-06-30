-- Migration: Enable Row Level Security and create policies
-- Purpose: Secure all tables with RLS and create granular access policies
-- Date: 2024-12-28 12:02:00 UTC
-- Affected tables: flashcards, generations, generation_error_logs
-- Security: Users can only access their own data

-- enable rls on flashcards table
-- this ensures users can only access their own flashcards
alter table public.flashcards enable row level security;

-- flashcards policies for authenticated users
-- separate policy for each operation (select, insert, update, delete)

-- policy: allow authenticated users to select their own flashcards
create policy "authenticated_users_select_own_flashcards"
on public.flashcards
for select
to authenticated
using (auth.uid() = user_id);

-- policy: allow authenticated users to insert their own flashcards
create policy "authenticated_users_insert_own_flashcards"
on public.flashcards
for insert
to authenticated
with check (auth.uid() = user_id);

-- policy: allow authenticated users to update their own flashcards
create policy "authenticated_users_update_own_flashcards"
on public.flashcards
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- policy: allow authenticated users to delete their own flashcards
create policy "authenticated_users_delete_own_flashcards"
on public.flashcards
for delete
to authenticated
using (auth.uid() = user_id);

-- enable rls on generations table
-- this ensures users can only access their own generation history
alter table public.generations enable row level security;

-- generations policies for authenticated users
-- separate policy for each operation

-- policy: allow authenticated users to select their own generation history
create policy "authenticated_users_select_own_generations"
on public.generations
for select
to authenticated
using (auth.uid() = user_id);

-- policy: allow authenticated users to insert their own generation records
create policy "authenticated_users_insert_own_generations"
on public.generations
for insert
to authenticated
with check (auth.uid() = user_id);

-- policy: allow authenticated users to update their own generation records
create policy "authenticated_users_update_own_generations"
on public.generations
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- policy: allow authenticated users to delete their own generation records
create policy "authenticated_users_delete_own_generations"
on public.generations
for delete
to authenticated
using (auth.uid() = user_id);

-- enable rls on generation_error_logs table
-- this ensures users can only see their own error logs
alter table public.generation_error_logs enable row level security;

-- generation_error_logs policies
-- note: inserts will be handled by backend with elevated privileges
-- users can only select their own error logs

-- policy: allow authenticated users to select their own error logs
create policy "authenticated_users_select_own_error_logs"
on public.generation_error_logs
for select
to authenticated
using (auth.uid() = user_id);

-- policy: restrict direct inserts by users (backend service will handle inserts)
-- authenticated users cannot directly insert error logs
create policy "authenticated_users_no_insert_error_logs"
on public.generation_error_logs
for insert
to authenticated
with check (false);

-- policy: authenticated users cannot update error logs
create policy "authenticated_users_no_update_error_logs"
on public.generation_error_logs
for update
to authenticated
using (false);

-- policy: authenticated users cannot delete error logs
create policy "authenticated_users_no_delete_error_logs"
on public.generation_error_logs
for delete
to authenticated
using (false);

-- add comments explaining the security model
comment on policy "authenticated_users_select_own_flashcards" on public.flashcards is 'Users can only view their own flashcards';
comment on policy "authenticated_users_select_own_generations" on public.generations is 'Users can only view their own AI generation history';
comment on policy "authenticated_users_select_own_error_logs" on public.generation_error_logs is 'Users can only view their own error logs, but cannot modify them'; 