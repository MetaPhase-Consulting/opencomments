-- Fix for docket_status enum conversion
-- First, drop the default value
ALTER TABLE dockets ALTER COLUMN status DROP DEFAULT;

-- Update any invalid status values to 'draft'
UPDATE dockets SET status = 'draft' WHERE status NOT IN ('draft', 'open', 'closed', 'archived');

-- Now convert the column type
ALTER TABLE dockets ALTER COLUMN status TYPE docket_status USING status::docket_status;

-- Add back the default value
ALTER TABLE dockets ALTER COLUMN status SET DEFAULT 'draft'; 