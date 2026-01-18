-- SAFE FIX: Remove ALL UPDATE policies and create one clean policy
-- This ensures no conflicts

-- Step 1: Drop ALL existing UPDATE policies (safe - we'll recreate)
DO $$ 
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'cards' AND cmd = 'UPDATE') 
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON cards';
  END LOOP;
END $$;

-- Step 2: Create ONE clean UPDATE policy
CREATE POLICY "Users can update their cards" ON cards
  FOR UPDATE
  USING (
    auth.uid() = user_id
    OR
    auth.uid() = recipient_user_id
    OR
    (recipient_email IS NOT NULL AND recipient_email != '')
  )
  WITH CHECK (
    auth.uid() = user_id
    OR
    auth.uid() = recipient_user_id
    OR
    (recipient_email IS NOT NULL AND recipient_email != '')
  );

-- Step 3: Verify only one UPDATE policy exists
SELECT policyname, cmd
FROM pg_policies 
WHERE tablename = 'cards' AND cmd = 'UPDATE';
