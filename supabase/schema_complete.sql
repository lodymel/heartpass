-- Complete Schema Setup for HeartPass
-- Run this file in Supabase SQL Editor to set up everything at once

-- Step 1: Create cards table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_type TEXT NOT NULL,
  coupon_type TEXT NOT NULL,
  mood TEXT NOT NULL,
  recipient_name TEXT,
  sender_name TEXT,
  usage_condition TEXT,
  validity_type TEXT DEFAULT 'lifetime',
  validity_date DATE,
  message TEXT,
  issue_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Step 2: Add recipient tracking fields (Option 2)
ALTER TABLE cards 
ADD COLUMN IF NOT EXISTS recipient_email TEXT;

ALTER TABLE cards 
ADD COLUMN IF NOT EXISTS recipient_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Step 3: Add status and used_at fields
ALTER TABLE cards 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

ALTER TABLE cards 
ADD COLUMN IF NOT EXISTS used_at TIMESTAMP WITH TIME ZONE;

-- Step 4: Enable Row Level Security
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- Step 5: Drop old policies if they exist (safe to run even if they don't exist)
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view own cards" ON cards;
  DROP POLICY IF EXISTS "Users can view cards sent to them" ON cards;
  DROP POLICY IF EXISTS "Users can insert own cards" ON cards;
  DROP POLICY IF EXISTS "Users can update own cards" ON cards;
  DROP POLICY IF EXISTS "Users can update cards sent to them" ON cards;
  DROP POLICY IF EXISTS "Users can delete own cards" ON cards;
END 
$$;

-- Step 6: Create comprehensive RLS policies
-- Users can view cards where:
-- 1. They created it (user_id = their id), OR
-- 2. They are the recipient (recipient_user_id = their id OR recipient_email = their email)
CREATE POLICY "Users can view their cards" ON cards
  FOR SELECT
  USING (
    auth.uid() = user_id OR 
    auth.uid() = recipient_user_id OR
    recipient_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Users can insert their own cards
CREATE POLICY "Users can insert their cards" ON cards
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update cards they own or received
CREATE POLICY "Users can update their cards" ON cards
  FOR UPDATE
  USING (
    auth.uid() = user_id OR
    auth.uid() = recipient_user_id OR
    recipient_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Users can delete their own cards
CREATE POLICY "Users can delete their cards" ON cards
  FOR DELETE
  USING (auth.uid() = user_id);

-- Step 7: Create indexes for faster queries
CREATE INDEX IF NOT EXISTS cards_user_id_idx ON cards(user_id);
CREATE INDEX IF NOT EXISTS cards_created_at_idx ON cards(created_at DESC);
CREATE INDEX IF NOT EXISTS cards_recipient_email_idx ON cards(recipient_email);
CREATE INDEX IF NOT EXISTS cards_recipient_user_id_idx ON cards(recipient_user_id);

-- Step 8: Update existing cards to have 'active' status if null
UPDATE cards SET status = 'active' WHERE status IS NULL;
