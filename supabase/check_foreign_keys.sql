-- Check Foreign Key Constraints on cards table
-- This will show what's causing the "permission denied for table users" error

-- Check all constraints on cards table
SELECT 
  conname AS constraint_name,
  contype AS constraint_type,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'cards'::regclass
ORDER BY contype, conname;

-- Check if foreign keys reference auth.users
SELECT 
  conname AS constraint_name,
  conrelid::regclass AS table_name,
  confrelid::regclass AS referenced_table,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE contype = 'f'  -- foreign key
  AND conrelid = 'cards'::regclass;

-- Check all policies on cards table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'cards';
