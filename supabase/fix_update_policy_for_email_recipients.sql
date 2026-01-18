-- Fix UPDATE policy to allow recipients who received via email to update cards
-- This allows recipients to accept passes even if they received via email (recipient_user_id is null initially)

-- Step 1: Drop existing UPDATE policy
DROP POLICY IF EXISTS "Users can update their cards" ON cards;

-- Step 2: Create new UPDATE policy that allows:
-- 1. Users to update cards they created (user_id = auth.uid())
-- 2. Users to update cards where they are recipient_user_id (auth.uid() = recipient_user_id)
-- 3. Users to update cards where recipient_email matches their email (for email recipients)
-- Note: We need to grant SELECT on auth.users first (already done in fix_permission_error.sql)
CREATE POLICY "Users can update their cards" ON cards
  FOR UPDATE
  USING (
    -- Owner can update
    auth.uid() = user_id
    OR
    -- Recipient (via user_id) can update
    auth.uid() = recipient_user_id
    OR
    -- Recipient (via email) can update - allows email recipients to accept/update
    -- Check if recipient_email matches current user's email
    (recipient_email IS NOT NULL AND recipient_email != '' AND 
     recipient_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
  )
  WITH CHECK (
    -- Same conditions for WITH CHECK
    auth.uid() = user_id
    OR
    auth.uid() = recipient_user_id
    OR
    (recipient_email IS NOT NULL AND recipient_email != '' AND 
     recipient_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
  );
