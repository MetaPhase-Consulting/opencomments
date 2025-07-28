-- Fix for docket_status enum conversion
-- First, let's check what values exist in the status column
SELECT DISTINCT status FROM dockets WHERE status IS NOT NULL;

-- If there are invalid values, we need to update them first
UPDATE dockets SET status = 'draft' WHERE status NOT IN ('draft', 'open', 'closed', 'archived');

-- Now we can safely convert the column type
ALTER TABLE dockets ALTER COLUMN status TYPE docket_status USING status::docket_status; 