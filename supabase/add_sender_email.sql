-- Add sender_email column to cards table
-- This will automatically store the sender's email from their login

ALTER TABLE cards 
ADD COLUMN IF NOT EXISTS sender_email TEXT;

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_cards_sender_email ON cards(sender_email);
