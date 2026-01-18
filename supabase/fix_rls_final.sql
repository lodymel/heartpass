-- Fast & Safe RLS Fix - No complex subqueries
-- Run this in Supabase SQL Editor

-- Step 1: Drop all existing policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view their cards" ON cards;
  DROP POLICY IF EXISTS "Users can insert their cards" ON cards;
  DROP POLICY IF EXISTS "Users can update their cards" ON cards;
  DROP POLICY IF EXISTS "Users can delete their cards" ON cards;
END 
$$;

-- Step 2: Create simple, safe RLS policies
-- SELECT: Users can see cards they created OR cards where they are recipient_user_id
CREATE POLICY "Users can view their cards" ON cards
  FOR SELECT
  USING (
    auth.uid() = user_id OR 
    auth.uid() = recipient_user_id
  );

-- INSERT: Users can only create cards with their own user_id
CREATE POLICY "Users can insert their cards" ON cards
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

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
  USING (auth.uid() = user_id);
