-- Add recipient_email field to track who the card is sent to
ALTER TABLE cards 
ADD COLUMN IF NOT EXISTS recipient_email TEXT;

-- Add status field if it doesn't exist (for tracking pending/accepted/used)
ALTER TABLE cards 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Add used_at field if it doesn't exist
ALTER TABLE cards 
ADD COLUMN IF NOT EXISTS used_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster queries on recipient_email
CREATE INDEX IF NOT EXISTS cards_recipient_email_idx ON cards(recipient_email);

-- Update RLS policy to allow users to see cards sent to them
-- Users can view cards where they are the recipient
CREATE POLICY "Users can view cards sent to them"
  ON cards FOR SELECT
  USING (
    auth.uid() = user_id OR 
    recipient_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Users can update cards sent to them (to accept/decline/use)
CREATE POLICY "Users can update cards sent to them"
  ON cards FOR UPDATE
  USING (
    recipient_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );
