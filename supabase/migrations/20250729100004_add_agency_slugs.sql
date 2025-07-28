-- 2025-07-29 10:00:04 Add Agency Slugs

-- Add slugs to existing agencies
UPDATE agencies 
SET slug = 'dot' 
WHERE name = 'Department of Transportation';

UPDATE agencies 
SET slug = 'epa' 
WHERE name = 'Environmental Protection Agency';

UPDATE agencies 
SET slug = 'doe' 
WHERE name = 'Department of Energy';

UPDATE agencies 
SET slug = 'caltrans' 
WHERE name = 'California Department of Transportation'; 