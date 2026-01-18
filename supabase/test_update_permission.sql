-- Test if UPDATE is working for email recipients
-- Run this in Supabase SQL Editor to check current RLS policies

-- Check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'cards' AND cmd = 'UPDATE';

-- Test UPDATE with a user email (replace with your actual test email)
-- This will show if the policy allows the update
SELECT 
  auth.uid() as current_user_id,
  (SELECT email FROM auth.users WHERE id = auth.uid()) as current_user_email,
  'Test query to check policy logic' as note;
