-- Emergency RLS Fix - Disable RLS temporarily to test
-- ⚠️ WARNING: This disables security - ONLY FOR TESTING!
-- Run this to verify if RLS is the problem

-- Step 1: Temporarily disable RLS to test
ALTER TABLE cards DISABLE ROW LEVEL SECURITY;

-- Step 2: Try inserting a card now
-- If this works, the problem is with RLS policies, not the data

-- Step 3: After testing, re-enable RLS with simple policy
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- Step 4: Drop and recreate INSERT policy only
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can insert their cards" ON cards;
END 
$$;

-- Step 5: Create simplest possible INSERT policy
CREATE POLICY "Users can insert their cards" ON cards
  FOR INSERT
  WITH CHECK (true);  -- Allow all inserts (temporarily for testing)

-- NOTE: This is NOT secure for production!
-- After confirming this works, change WITH CHECK (true) to:
-- WITH CHECK (auth.uid() = user_id)
