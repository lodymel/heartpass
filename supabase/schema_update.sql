-- Add status and used_at columns to cards table
ALTER TABLE cards 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS used_at TIMESTAMP WITH TIME ZONE;

-- Update existing cards to have 'active' status
UPDATE cards SET status = 'active' WHERE status IS NULL;
