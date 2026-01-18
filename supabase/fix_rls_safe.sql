-- Safe RLS Fix - Remove foreign key check issue
-- This fixes "permission denied for table users" caused by FK constraints

-- Step 1: Check current constraints (run check_foreign_keys.sql first)

-- Step 2: Drop and recreate INSERT policy without FK validation
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can insert their cards" ON cards;
END 
$$;

-- Step 3: Create INSERT policy that doesn't trigger FK validation issues
-- Use SECURITY DEFINER if needed (but that's a workaround)
CREATE POLICY "Users can insert their cards" ON cards
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    auth.uid() IS NOT NULL
  );

-- Alternative: If still fails, try with SECURITY DEFINER
-- (This bypasses RLS for this policy but is less secure)
-- DROP POLICY IF EXISTS "Users can insert their cards" ON cards;
-- CREATE POLICY "Users can insert their cards" ON cards
--   FOR INSERT
--   WITH CHECK (auth.uid() = user_id)
--   USING (true);
