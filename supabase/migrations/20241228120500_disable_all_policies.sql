-- Migration: Disable all Row Level Security policies
-- Purpose: Remove all RLS policies and disable RLS on flashcards, generations, and generation_error_logs tables
-- Date: 2024-12-28 12:05:00 UTC
-- Affected tables: flashcards, generations, generation_error_logs
-- Note: This will make all data accessible to all authenticated users

-- Disable policies for flashcards table
DROP POLICY IF EXISTS "authenticated_users_select_own_flashcards" ON public.flashcards;
DROP POLICY IF EXISTS "authenticated_users_insert_own_flashcards" ON public.flashcards;
DROP POLICY IF EXISTS "authenticated_users_update_own_flashcards" ON public.flashcards;
DROP POLICY IF EXISTS "authenticated_users_delete_own_flashcards" ON public.flashcards;

-- Disable RLS on flashcards table
ALTER TABLE public.flashcards DISABLE ROW LEVEL SECURITY;

-- Disable policies for generations table
DROP POLICY IF EXISTS "authenticated_users_select_own_generations" ON public.generations;
DROP POLICY IF EXISTS "authenticated_users_insert_own_generations" ON public.generations;
DROP POLICY IF EXISTS "authenticated_users_update_own_generations" ON public.generations;
DROP POLICY IF EXISTS "authenticated_users_delete_own_generations" ON public.generations;

-- Disable RLS on generations table
ALTER TABLE public.generations DISABLE ROW LEVEL SECURITY;

-- Disable policies for generation_error_logs table
DROP POLICY IF EXISTS "authenticated_users_select_own_error_logs" ON public.generation_error_logs;
DROP POLICY IF EXISTS "authenticated_users_no_insert_error_logs" ON public.generation_error_logs;
DROP POLICY IF EXISTS "authenticated_users_no_update_error_logs" ON public.generation_error_logs;
DROP POLICY IF EXISTS "authenticated_users_no_delete_error_logs" ON public.generation_error_logs;

-- Disable RLS on generation_error_logs table
ALTER TABLE public.generation_error_logs DISABLE ROW LEVEL SECURITY;

-- Add comment explaining the change
COMMENT ON TABLE public.flashcards IS 'RLS disabled - all authenticated users have full access';
COMMENT ON TABLE public.generations IS 'RLS disabled - all authenticated users have full access';
COMMENT ON TABLE public.generation_error_logs IS 'RLS disabled - all authenticated users have full access'; 