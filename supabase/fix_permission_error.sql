-- Fix "permission denied for table users" Error
-- This is caused by foreign key constraint checking auth.users
-- Run this in Supabase SQL Editor

-- Step 1: Grant SELECT permission on auth.users to authenticated users
-- This allows foreign key constraint checks to work
GRANT SELECT ON auth.users TO authenticated;
GRANT SELECT ON auth.users TO anon;  -- Also for anon if needed

-- Step 2: Verify the grant worked
-- You can check with: SELECT * FROM information_schema.table_privileges WHERE table_name = 'users' AND table_schema = 'auth';

-- Step 3: Ensure RLS policies are correct (run fix_rls_complete.sql if not already done)
-- The INSERT policy should be simple: WITH CHECK (auth.uid() = user_id)

-- Step 4: Test inserting a card
-- The foreign key check will now be able to verify user_id exists in auth.users
