-- Fix RLS Policies - Run this to fix permission issues
-- If you get "Failed to load cards" error, run this

-- First, let's check what policies exist and drop them all
DO $$ 
BEGIN
  -- Drop all existing policies on cards table
  DROP POLICY IF EXISTS "Users can view own cards" ON cards;
  DROP POLICY IF EXISTS "Users can view their cards" ON cards;
  DROP POLICY IF EXISTS "Users can view cards sent to them" ON cards;
  DROP POLICY IF EXISTS "Users can insert own cards" ON cards;
  DROP POLICY IF EXISTS "Users can insert their cards" ON cards;
  DROP POLICY IF EXISTS "Users can update own cards" ON cards;
  DROP POLICY IF EXISTS "Users can update their cards" ON cards;
  DROP POLICY IF EXISTS "Users can update cards sent to them" ON cards;
  DROP POLICY IF EXISTS "Users can delete own cards" ON cards;
  DROP POLICY IF EXISTS "Users can delete their cards" ON cards;
END 
$$;

-- Now create fresh policies with correct syntax

-- 1. SELECT: Users can view cards they created OR received
CREATE POLICY "Users can view their cards" ON cards
  FOR SELECT
  USING (
    auth.uid() = user_id OR 
    auth.uid() = recipient_user_id OR
    recipient_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- 2. INSERT: Users can only insert cards with their own user_id
CREATE POLICY "Users can insert their cards" ON cards
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 3. UPDATE: Users can update cards they created OR received
CREATE POLICY "Users can update their cards" ON cards
  FOR UPDATE
  USING (
    auth.uid() = user_id OR
    auth.uid() = recipient_user_id OR
    recipient_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- 4. DELETE: Users can only delete cards they created
CREATE POLICY "Users can delete their cards" ON cards
  FOR DELETE
  USING (auth.uid() = user_id);
