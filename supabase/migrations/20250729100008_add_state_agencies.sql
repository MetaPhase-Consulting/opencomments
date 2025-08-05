-- 2025-07-29 10:00:08 Add State Agencies

-- Add more state agencies for testing state pages
INSERT INTO agencies (id, name, jurisdiction, slug, description) VALUES
-- California agencies
('11111111-1111-4000-8000-000000000005', 'California Environmental Protection Agency', 'California', 'calepa', 'Protecting California''s environment and public health through regulatory oversight and environmental programs.'),
('11111111-1111-4000-8000-000000000006', 'California Energy Commission', 'California', 'energy-commission', 'Leading California to a 100% clean energy future through policy development and energy planning.'),

-- Colorado agencies
('11111111-1111-4000-8000-000000000007', 'Colorado Department of Transportation', 'Colorado', 'codot', 'Building and maintaining Colorado''s transportation infrastructure for safe and efficient travel.'),
('11111111-1111-4000-8000-000000000008', 'Colorado Department of Natural Resources', 'Colorado', 'codnr', 'Managing Colorado''s natural resources including water, wildlife, and public lands.'),

-- Texas agencies
('11111111-1111-4000-8000-000000000009', 'Texas Department of Transportation', 'Texas', 'txdot', 'Connecting Texas through transportation infrastructure and services.'),
('11111111-1111-4000-8000-000000000010', 'Texas Commission on Environmental Quality', 'Texas', 'tceq', 'Protecting Texas'' natural resources and public health through environmental regulation.'),

-- New York agencies
('11111111-1111-4000-8000-000000000011', 'New York State Department of Transportation', 'New York', 'nysdot', 'Providing safe, efficient, and environmentally sound transportation infrastructure for New York State.'),
('11111111-1111-4000-8000-000000000012', 'New York State Department of Environmental Conservation', 'New York', 'dec', 'Conserving, improving, and protecting New York''s natural resources and environment.'),

-- Florida agencies
('11111111-1111-4000-8000-000000000013', 'Florida Department of Transportation', 'Florida', 'fdot', 'Building and maintaining Florida''s transportation system for safe and efficient travel.'),
('11111111-1111-4000-8000-000000000014', 'Florida Department of Environmental Protection', 'Florida', 'dep', 'Protecting Florida''s air, water, and land through environmental regulation and conservation.')
ON CONFLICT(id) DO NOTHING;

-- Add some dockets for the new agencies
INSERT INTO dockets (id, agency_id, title, slug, status, tags, open_at, close_at, comment_deadline, description, summary) VALUES
-- California dockets
('22222222-2222-4000-8000-000000000006', '11111111-1111-4000-8000-000000000005', 'Air Quality Standards Update', 'ca-air-quality-standards', 'open', ARRAY['environment', 'air-quality', 'regulations'], now() - interval '20 days', now() + interval '40 days', now() + interval '40 days', 'Updated air quality standards for California cities and counties.', 'New air quality regulations to improve public health across California.'),
('22222222-2222-4000-8000-000000000007', '11111111-1111-4000-8000-000000000006', 'Renewable Energy Portfolio Standards', 'ca-renewable-energy', 'open', ARRAY['energy', 'renewable', 'policy'], now() - interval '15 days', now() + interval '45 days', now() + interval '45 days', 'Updated renewable energy portfolio standards for California utilities.', 'Strengthening California''s commitment to renewable energy sources.'),

-- Colorado dockets
('22222222-2222-4000-8000-000000000008', '11111111-1111-4000-8000-000000000007', 'Mountain Highway Safety Improvements', 'co-highway-safety', 'open', ARRAY['transportation', 'safety', 'highways'], now() - interval '25 days', now() + interval '35 days', now() + interval '35 days', 'Safety improvements for mountain highways and passes.', 'Enhanced safety measures for Colorado''s mountain transportation corridors.'),
('22222222-2222-4000-8000-000000000009', '11111111-1111-4000-8000-000000000008', 'Water Rights Management', 'co-water-rights', 'open', ARRAY['water', 'rights', 'management'], now() - interval '30 days', now() + interval '30 days', now() + interval '30 days', 'Updated water rights management and allocation policies.', 'Streamlining Colorado''s water rights administration and management.'),

-- Texas dockets
('22222222-2222-4000-8000-000000000010', '11111111-1111-4000-8000-000000000009', 'Interstate Highway Expansion', 'tx-highway-expansion', 'open', ARRAY['transportation', 'highways', 'expansion'], now() - interval '10 days', now() + interval '50 days', now() + interval '50 days', 'Expansion of major interstate highways in Texas.', 'Improving Texas transportation infrastructure through highway expansion projects.'),
('22222222-2222-4000-8000-000000000011', '11111111-1111-4000-8000-000000000010', 'Industrial Emissions Standards', 'tx-emissions-standards', 'open', ARRAY['environment', 'emissions', 'industry'], now() - interval '35 days', now() + interval '25 days', now() + interval '25 days', 'Updated industrial emissions standards for Texas facilities.', 'Strengthening environmental protection through updated emissions regulations.')
ON CONFLICT(id) DO NOTHING; 