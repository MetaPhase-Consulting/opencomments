/*
  # Make user_id nullable for public comments
  
  This migration allows comments to be created without a user_id for public
  anonymous comments, which is common in government comment systems.
*/

-- Make user_id nullable
ALTER TABLE comments ALTER COLUMN user_id DROP NOT NULL;

-- Update the foreign key to allow NULL values
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_user_id_fkey;
ALTER TABLE comments ADD CONSTRAINT comments_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE; 