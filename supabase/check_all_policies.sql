-- Check all existing policies on cards table
-- This shows what policies are currently active

SELECT 
  policyname,
  cmd,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'cards'
ORDER BY cmd, policyname;

-- Check specifically for UPDATE policies
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'cards' AND cmd = 'UPDATE';
