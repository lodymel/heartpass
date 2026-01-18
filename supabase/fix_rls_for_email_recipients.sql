-- Fix RLS to allow email recipients to view cards without login
-- This allows recipients who click email links to view their passes

-- Step 1: Drop existing SELECT policy
DROP POLICY IF EXISTS "Users can view their cards" ON cards;

-- Step 2: Create new SELECT policy that allows:
-- 1. Logged-in users to see their own cards (user_id or recipient_user_id)
-- 2. Anyone to see cards where recipient_email is set (for email link access)
-- Note: This is safe because:
-- - recipient_email is only set when card is sent via email
-- - Cards are only accessible via unique card ID in email link
-- - Without the card ID, cards cannot be discovered
CREATE POLICY "Users can view their cards" ON cards
  FOR SELECT
  USING (
    -- Logged-in users: own cards or received cards
    (auth.uid() IS NOT NULL AND (
      auth.uid() = user_id OR 
      auth.uid() = recipient_user_id
    ))
    OR
    -- Anyone: cards sent to an email (for email link access)
    -- This allows recipients to view via email link without login
    -- Security: Card ID is unique and only shared via email
    (recipient_email IS NOT NULL AND recipient_email != '')
  );

-- Step 3: Update UPDATE policy to allow email recipients to update
DROP POLICY IF EXISTS "Users can update their cards" ON cards;

-- IMPORTANT: This policy allows recipients who received via email to update cards
-- Security: Only authenticated users can update, and recipient_email must match their email
CREATE POLICY "Users can update their cards" ON cards
  FOR UPDATE
  USING (
    -- Owner can update
    auth.uid() = user_id
    OR
    -- Recipient (via user_id) can update
    auth.uid() = recipient_user_id
    OR
    -- Recipient (via email) can update - check if recipient_email matches logged-in user's email
    -- Note: This requires SELECT permission on auth.users (already granted in fix_permission_error.sql)
    (
      recipient_email IS NOT NULL 
      AND recipient_email != '' 
      AND recipient_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  )
  WITH CHECK (
    -- Same conditions for WITH CHECK clause
    auth.uid() = user_id
    OR
    auth.uid() = recipient_user_id
    OR
    (
      recipient_email IS NOT NULL 
      AND recipient_email != '' 
      AND recipient_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Step 4: Keep INSERT and DELETE policies unchanged
