-- Simplified RLS Policies - Fix for "Failed to load cards" error
-- This uses a simpler approach that doesn't rely on subqueries

-- Drop all existing policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view their cards" ON cards;
  DROP POLICY IF EXISTS "Users can insert their cards" ON cards;
  DROP POLICY IF EXISTS "Users can update their cards" ON cards;
  DROP POLICY IF EXISTS "Users can delete their cards" ON cards;
END 
$$;

-- Simplified SELECT policy
-- Users can view cards where user_id OR recipient_user_id matches
-- Note: recipient_email matching requires a function or is handled in application logic
CREATE POLICY "Users can view their cards" ON cards
  FOR SELECT
  USING (
    auth.uid() = user_id OR 
    auth.uid() = recipient_user_id
  );

-- INSERT policy
CREATE POLICY "Users can insert their cards" ON cards
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE policy  
CREATE POLICY "Users can update their cards" ON cards
  FOR UPDATE
  USING (
    auth.uid() = user_id OR
    auth.uid() = recipient_user_id
  );

-- DELETE policy
CREATE POLICY "Users can delete their cards" ON cards
  FOR DELETE
  USING (auth.uid() = user_id);
