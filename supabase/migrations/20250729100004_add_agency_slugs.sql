-- 2025-07-29 10:00:04 Add Agency Slugs

-- Add slugs to existing agencies
UPDATE agencies 
SET slug = 'california-department-of-transportation' 
WHERE name = 'California Department of Transportation';

UPDATE agencies 
SET slug = 'texas-department-of-transportation' 
WHERE name = 'Texas Department of Transportation';

UPDATE agencies 
SET slug = 'new-york-state-department-of-environmental-conservation' 
WHERE name = 'New York State Department of Environmental Conservation';

UPDATE agencies 
SET slug = 'florida-department-of-environmental-protection' 
WHERE name = 'Florida Department of Environmental Protection'; 