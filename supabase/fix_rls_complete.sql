-- Complete RLS Fix - Remove all policies and recreate simple ones
-- This will fix "permission denied for table users" error
-- Run this in Supabase SQL Editor

-- Step 1: Drop ALL existing policies on cards table
DO $$ 
BEGIN
  -- Drop all possible policy names
  DROP POLICY IF EXISTS "Users can view their cards" ON cards;
  DROP POLICY IF EXISTS "Users can view own cards" ON cards;
  DROP POLICY IF EXISTS "Users can view cards sent to them" ON cards;
  DROP POLICY IF EXISTS "Users can insert their cards" ON cards;
  DROP POLICY IF EXISTS "Users can insert own cards" ON cards;
  DROP POLICY IF EXISTS "Users can update their cards" ON cards;
  DROP POLICY IF EXISTS "Users can update own cards" ON cards;
  DROP POLICY IF EXISTS "Users can update cards sent to them" ON cards;
  DROP POLICY IF EXISTS "Users can delete their cards" ON cards;
  DROP POLICY IF EXISTS "Users can delete own cards" ON cards;
END 
$$;

-- Step 2: Ensure RLS is enabled
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- Step 3: Create SIMPLE policies WITHOUT any subqueries to auth.users
-- This avoids "permission denied for table users" error

-- SELECT: Users can see cards they created OR cards where they are recipient_user_id
-- Note: recipient_email matching is handled in application code, not RLS
CREATE POLICY "Users can view their cards" ON cards
  FOR SELECT
  USING (
    auth.uid() = user_id OR 
    auth.uid() = recipient_user_id
  );

-- INSERT: Users can only create cards with their own user_id
-- This is the critical one - must be simple!
CREATE POLICY "Users can insert their cards" ON cards
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
  );

-- UPDATE: Users can update cards they own OR received (via recipient_user_id)
CREATE POLICY "Users can update their cards" ON cards
  FOR UPDATE
  USING (
    auth.uid() = user_id OR
    auth.uid() = recipient_user_id
  );

-- DELETE: Users can only delete cards they created
CREATE POLICY "Users can delete their cards" ON cards
  FOR DELETE
  USING (
    auth.uid() = user_id
  );

-- Step 4: Verify policies were created
-- You can check in Supabase Dashboard → Authentication → Policies
