-- Fix INSERT Permission Error
-- Run this in Supabase SQL Editor to fix "permission denied for table users" error

-- Step 1: Drop existing INSERT policy
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can insert their cards" ON cards;
END 
$$;

-- Step 2: Create simple INSERT policy without any subqueries
CREATE POLICY "Users can insert their cards" ON cards
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
  );

-- Step 3: Verify RLS is enabled
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- Note: If you still get errors, check:
-- 1. Make sure you're logged in (auth.uid() should return your user ID)
-- 2. Make sure user_id in your insert matches auth.uid()
-- 3. Check Supabase Dashboard → Authentication → Policies to see all policies
