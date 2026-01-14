-- Create cards table to store user's HeartPass cards
CREATE TABLE IF NOT EXISTS cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_type TEXT NOT NULL,
  coupon_type TEXT NOT NULL,
  mood TEXT NOT NULL,
  recipient_name TEXT,
  sender_name TEXT,
  usage_condition TEXT,
  message TEXT,
  issue_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own cards
CREATE POLICY "Users can view own cards"
  ON cards FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Users can insert their own cards
CREATE POLICY "Users can insert own cards"
  ON cards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own cards
CREATE POLICY "Users can update own cards"
  ON cards FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policy: Users can delete their own cards
CREATE POLICY "Users can delete own cards"
  ON cards FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS cards_user_id_idx ON cards(user_id);
CREATE INDEX IF NOT EXISTS cards_created_at_idx ON cards(created_at DESC);
