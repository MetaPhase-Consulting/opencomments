/*
  # Fix Status Enum Conversion
  
  This migration fixes the issue with converting text status columns to enums
  by properly handling default values and existing data.
*/

-- Fix dockets table status column
DO $$
BEGIN
  -- First, drop the default if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'dockets' AND column_name = 'status' 
    AND column_default IS NOT NULL
  ) THEN
    ALTER TABLE dockets ALTER COLUMN status DROP DEFAULT;
  END IF;
  
  -- Convert status column to enum
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'dockets' AND column_name = 'status' 
    AND data_type = 'text'
  ) THEN
    ALTER TABLE dockets ALTER COLUMN status TYPE docket_status USING status::docket_status;
  END IF;
  
  -- Add default back
  ALTER TABLE dockets ALTER COLUMN status SET DEFAULT 'draft';
END $$;

-- Fix comments table status column
DO $$
BEGIN
  -- First, drop the default if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'comments' AND column_name = 'status' 
    AND column_default IS NOT NULL
  ) THEN
    ALTER TABLE comments ALTER COLUMN status DROP DEFAULT;
  END IF;
  
  -- Convert status column to enum
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'comments' AND column_name = 'status' 
    AND data_type = 'text'
  ) THEN
    ALTER TABLE comments ALTER COLUMN status TYPE comment_status USING status::comment_status;
  END IF;
  
  -- Add default back
  ALTER TABLE comments ALTER COLUMN status SET DEFAULT 'pending';
END $$; 