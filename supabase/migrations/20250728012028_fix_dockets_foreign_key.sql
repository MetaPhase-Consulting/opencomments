/*
  # Fix Dockets Foreign Key Constraint
  
  This migration fixes the dockets.agency_id foreign key to reference agencies(id)
  instead of profiles(id), which is the correct relationship.
*/

-- Drop the existing foreign key constraint
ALTER TABLE dockets DROP CONSTRAINT IF EXISTS dockets_agency_id_fkey;

-- Add the correct foreign key constraint
ALTER TABLE dockets ADD CONSTRAINT dockets_agency_id_fkey 
  FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE CASCADE; 