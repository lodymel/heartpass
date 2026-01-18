-- Add recipient fields to track who the card is sent to
-- Option 2: Support both user ID (if registered) and email (if not registered)

ALTER TABLE cards 
ADD COLUMN IF NOT EXISTS recipient_email TEXT;

ALTER TABLE cards 
ADD COLUMN IF NOT EXISTS recipient_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add status field if it doesn't exist (for tracking pending/accepted/used)
ALTER TABLE cards 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Add used_at field if it doesn't exist
ALTER TABLE cards 
ADD COLUMN IF NOT EXISTS used_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS cards_recipient_email_idx ON cards(recipient_email);
CREATE INDEX IF NOT EXISTS cards_recipient_user_id_idx ON cards(recipient_user_id);

-- Update RLS policies to allow users to see cards sent to them
-- Users can view cards where:
-- 1. They created it (user_id = their id), OR
-- 2. They are the recipient (recipient_user_id = their id OR recipient_email = their email)

-- Note: DROP POLICY IF EXISTS might not work in all Supabase versions
-- If policies already exist, drop them manually first or use Supabase dashboard

-- Create new comprehensive policy for viewing cards
-- This replaces the old "Users can view own cards" policy
CREATE POLICY "Users can view their cards" ON cards
  FOR SELECT
  USING (
    auth.uid() = user_id OR 
    auth.uid() = recipient_user_id OR
    recipient_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Create new comprehensive policy for updating cards
-- This replaces the old "Users can update own cards" policy
CREATE POLICY "Users can update their cards" ON cards
  FOR UPDATE
  USING (
    auth.uid() = user_id OR
    auth.uid() = recipient_user_id OR
    recipient_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );
