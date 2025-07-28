/*
  # Comprehensive Seed Data for OpenComments
  
  This file creates realistic sample data for testing:
  - 3 agencies across different states
  - 6 dockets (2 per agency) with mix of open/closed
  - 60+ approved comments with variety
  - Tags and sample attachments
  
  Run this after the schema migration to populate test data.
*/

-- Clear existing seed data
DELETE FROM attachments WHERE filename LIKE 'SEED_%';
DELETE FROM docket_tags WHERE docket_id IN (SELECT id FROM dockets WHERE slug LIKE 'seed-%');
DELETE FROM comments WHERE docket_id IN (SELECT id FROM dockets WHERE slug LIKE 'seed-%');
DELETE FROM dockets WHERE slug LIKE 'seed-%';
DELETE FROM agencies WHERE slug LIKE 'seed-%';
DELETE FROM tags WHERE name LIKE 'SEED_%';

-- Insert sample tags
INSERT INTO tags (name, description, color) VALUES
('Transportation', 'Transportation and mobility projects', '#3B82F6'),
('Environment', 'Environmental protection and sustainability', '#10B981'),
('Energy', 'Energy policy and renewable resources', '#F59E0B'),
('Parks', 'Parks and recreation facilities', '#8B5CF6'),
('Budget', 'Budget and financial planning', '#EF4444'),
('Housing', 'Housing development and policy', '#06B6D4'),
('Public Safety', 'Public safety and emergency services', '#F97316'),
('Education', 'Educational policy and facilities', '#84CC16');

-- Insert sample agencies
INSERT INTO agencies (id, name, slug, jurisdiction, contact_email, description, created_at) VALUES
(
  'a1111111-1111-1111-1111-111111111111',
  'California Department of Energy',
  'seed-ca-energy',
  'California',
  'info@energy.ca.gov',
  'The California Department of Energy leads the state in developing and implementing energy policies and programs.',
  '2024-01-01 09:00:00+00'
),
(
  'a2222222-2222-2222-2222-222222222222',
  'Florida Parks & Recreation Commission',
  'seed-fl-parks',
  'Florida',
  'contact@flparks.gov',
  'The Florida Parks & Recreation Commission manages state parks and recreational facilities throughout Florida.',
  '2024-01-15 10:00:00+00'
),
(
  'a3333333-3333-3333-3333-333333333333',
  'Denver Office of Transportation',
  'seed-denver-transport',
  'Denver, Colorado',
  'info@denvergov.org',
  'The Denver Office of Transportation plans and implements transportation infrastructure for the city.',
  '2024-02-01 11:00:00+00'
);

-- Insert sample dockets
INSERT INTO dockets (id, agency_id, title, description, summary, slug, status, open_at, close_at, comment_deadline, created_at) VALUES
-- California Energy Dockets
(
  'd1111111-1111-1111-1111-111111111111',
  'a1111111-1111-1111-1111-111111111111',
  'Residential Solar Incentive Program Expansion',
  'The California Department of Energy proposes expanding the residential solar incentive program to include battery storage systems and increase rebate amounts for low-income households.',
  'Proposed expansion of solar incentives to include battery storage and enhanced support for low-income residents.',
  'seed-ca-solar-incentives',
  'open',
  '2024-01-15 09:00:00+00',
  '2024-03-15 17:00:00+00',
  '2024-03-15 17:00:00+00',
  '2024-01-10 14:30:00+00'
),
(
  'd1111111-2222-2222-2222-222222222222',
  'a1111111-1111-1111-1111-111111111111',
  'Electric Vehicle Charging Infrastructure Standards',
  'New standards for electric vehicle charging infrastructure in public buildings and commercial developments.',
  'Establishing minimum requirements for EV charging stations in new construction and major renovations.',
  'seed-ca-ev-charging',
  'closed',
  '2023-11-01 09:00:00+00',
  '2024-01-01 17:00:00+00',
  '2024-01-01 17:00:00+00',
  '2023-10-25 16:00:00+00'
),
-- Florida Parks Dockets
(
  'd2222222-1111-1111-1111-111111111111',
  'a2222222-2222-2222-2222-222222222222',
  'Everglades Trail System Expansion',
  'Proposed expansion of hiking and biking trails in Everglades National Park with new visitor facilities.',
  'Adding 25 miles of new trails and three visitor centers to improve access while protecting wildlife.',
  'seed-fl-everglades-trails',
  'open',
  '2024-02-01 08:00:00+00',
  '2024-04-01 17:00:00+00',
  '2024-04-01 17:00:00+00',
  '2024-01-28 13:15:00+00'
),
(
  'd2222222-2222-2222-2222-222222222222',
  'a2222222-2222-2222-2222-222222222222',
  'Beach Access Improvement Project',
  'Improving public access to state beaches through new parking facilities and accessible walkways.',
  'Enhancing beach access with ADA-compliant facilities and expanded parking at five state beaches.',
  'seed-fl-beach-access',
  'closed',
  '2023-12-01 09:00:00+00',
  '2024-02-01 17:00:00+00',
  '2024-02-01 17:00:00+00',
  '2023-11-28 10:45:00+00'
),
-- Denver Transportation Dockets
(
  'd3333333-1111-1111-1111-111111111111',
  'a3333333-3333-3333-3333-333333333333',
  'Downtown Bike Lane Network Expansion',
  'Proposed expansion of protected bike lanes throughout downtown Denver with new bike-share stations.',
  'Creating a connected network of protected bike lanes and adding 50 new bike-share stations downtown.',
  'seed-denver-bike-lanes',
  'open',
  '2024-02-15 09:00:00+00',
  '2024-04-15 17:00:00+00',
  '2024-04-15 17:00:00+00',
  '2024-02-10 11:20:00+00'
),
(
  'd3333333-2222-2222-2222-222222222222',
  'a3333333-3333-3333-3333-333333333333',
  'Bus Rapid Transit Line 3 Environmental Assessment',
  'Environmental impact assessment for the proposed Bus Rapid Transit Line 3 connecting downtown to the airport.',
  'Evaluating environmental impacts of BRT Line 3 including air quality, noise, and community effects.',
  'seed-denver-brt-line3',
  'closed',
  '2023-10-01 09:00:00+00',
  '2023-12-31 17:00:00+00',
  '2023-12-31 17:00:00+00',
  '2023-09-25 15:30:00+00'
);

-- Link dockets to tags
INSERT INTO docket_tags (docket_id, tag_id) 
SELECT d.id, t.id FROM dockets d, tags t WHERE 
  (d.slug = 'seed-ca-solar-incentives' AND t.name IN ('Energy', 'Environment')) OR
  (d.slug = 'seed-ca-ev-charging' AND t.name IN ('Transportation', 'Energy', 'Environment')) OR
  (d.slug = 'seed-fl-everglades-trails' AND t.name IN ('Parks', 'Environment')) OR
  (d.slug = 'seed-fl-beach-access' AND t.name IN ('Parks', 'Transportation')) OR
  (d.slug = 'seed-denver-bike-lanes' AND t.name IN ('Transportation', 'Environment')) OR
  (d.slug = 'seed-denver-brt-line3' AND t.name IN ('Transportation', 'Environment'));

-- Insert sample comments for California Solar Incentives (10 comments)
INSERT INTO comments (id, docket_id, content, body, submitter_name, commenter_name, organization, commenter_organization, position, status, created_at) VALUES
('c1111111-0001-0001-0001-000000000001', 'd1111111-1111-1111-1111-111111111111', 'I strongly support this expansion. Solar energy is crucial for California''s clean energy future, and battery storage will help address grid reliability issues.', 'I strongly support this expansion. Solar energy is crucial for California''s clean energy future, and battery storage will help address grid reliability issues.', 'Sarah Johnson', 'Sarah Johnson', NULL, NULL, 'support', 'published', '2024-01-20 10:30:00+00'),
('c1111111-0001-0001-0001-000000000002', 'd1111111-1111-1111-1111-111111111111', 'The program should prioritize low-income communities who face the highest energy burden. The enhanced rebates are a step in the right direction.', 'The program should prioritize low-income communities who face the highest energy burden. The enhanced rebates are a step in the right direction.', 'Maria Rodriguez', 'Maria Rodriguez', 'Clean Energy Coalition', 'Clean Energy Coalition', 'support', 'published', '2024-01-22 14:15:00+00'),
('c1111111-0001-0001-0001-000000000003', 'd1111111-1111-1111-1111-111111111111', 'While I support renewable energy, I''m concerned about the cost to taxpayers. We need more analysis of the program''s fiscal impact.', 'While I support renewable energy, I''m concerned about the cost to taxpayers. We need more analysis of the program''s fiscal impact.', 'Robert Chen', 'Robert Chen', NULL, NULL, 'neutral', 'published', '2024-01-25 09:45:00+00'),
('c1111111-0001-0001-0001-000000000004', 'd1111111-1111-1111-1111-111111111111', 'This expansion is essential for meeting our climate goals. Battery storage will make solar more effective and reduce strain on the grid during peak hours.', 'This expansion is essential for meeting our climate goals. Battery storage will make solar more effective and reduce strain on the grid during peak hours.', 'Jennifer Park', 'Jennifer Park', 'Sierra Club California', 'Sierra Club California', 'support', 'published', '2024-01-28 16:20:00+00'),
('c1111111-0001-0001-0001-000000000005', 'd1111111-1111-1111-1111-111111111111', 'The program needs better oversight to prevent fraud and ensure quality installations. We''ve seen issues with some solar contractors.', 'The program needs better oversight to prevent fraud and ensure quality installations. We''ve seen issues with some solar contractors.', 'David Wilson', 'David Wilson', NULL, NULL, 'neutral', 'published', '2024-02-01 11:10:00+00'),
('c1111111-0001-0001-0001-000000000006', 'd1111111-1111-1111-1111-111111111111', 'Excellent initiative! As a solar installer, I see daily how these incentives help families reduce their energy costs and carbon footprint.', 'Excellent initiative! As a solar installer, I see daily how these incentives help families reduce their energy costs and carbon footprint.', 'Lisa Thompson', 'Lisa Thompson', 'SunPower Solutions', 'SunPower Solutions', 'support', 'published', '2024-02-03 13:55:00+00'),
('c1111111-0001-0001-0001-000000000007', 'd1111111-1111-1111-1111-111111111111', 'I oppose this expansion. The state should focus on fixing our existing infrastructure before subsidizing luxury items like solar panels.', 'I oppose this expansion. The state should focus on fixing our existing infrastructure before subsidizing luxury items like solar panels.', 'Michael Brown', 'Michael Brown', NULL, NULL, 'oppose', 'published', '2024-02-05 08:30:00+00'),
('c1111111-0001-0001-0001-000000000008', 'd1111111-1111-1111-1111-111111111111', 'The battery storage component is particularly important for grid stability. This will help California avoid blackouts during extreme weather events.', 'The battery storage component is particularly important for grid stability. This will help California avoid blackouts during extreme weather events.', 'Amanda Davis', 'Amanda Davis', 'California Energy Storage Alliance', 'California Energy Storage Alliance', 'support', 'published', '2024-02-08 15:40:00+00'),
('c1111111-0001-0001-0001-000000000009', 'd1111111-1111-1111-1111-111111111111', 'Please ensure the program includes provisions for renters and apartment dwellers, not just homeowners. Community solar options should be expanded.', 'Please ensure the program includes provisions for renters and apartment dwellers, not just homeowners. Community solar options should be expanded.', 'Carlos Martinez', 'Carlos Martinez', NULL, NULL, 'support', 'published', '2024-02-10 12:25:00+00'),
('c1111111-0001-0001-0001-000000000010', 'd1111111-1111-1111-1111-111111111111', 'The environmental benefits are clear, but we need stronger requirements for recycling solar panels and batteries at end of life.', 'The environmental benefits are clear, but we need stronger requirements for recycling solar panels and batteries at end of life.', 'Emily White', 'Emily White', 'Environmental Defense Fund', 'Environmental Defense Fund', 'support', 'published', '2024-02-12 17:05:00+00');

-- Insert sample comments for Florida Everglades Trails (12 comments)
INSERT INTO comments (id, docket_id, content, body, submitter_name, commenter_name, organization, commenter_organization, position, status, created_at) VALUES
('c2222222-0001-0001-0001-000000000001', 'd2222222-1111-1111-1111-111111111111', 'This trail expansion will provide incredible opportunities for outdoor recreation while showcasing Florida''s unique ecosystem to visitors.', 'This trail expansion will provide incredible opportunities for outdoor recreation while showcasing Florida''s unique ecosystem to visitors.', 'John Anderson', 'John Anderson', NULL, NULL, 'support', 'published', '2024-02-05 09:15:00+00'),
('c2222222-0001-0001-0001-000000000002', 'd2222222-1111-1111-1111-111111111111', 'I''m concerned about the impact on wildlife habitats. The Everglades is a fragile ecosystem that needs protection, not more human traffic.', 'I''m concerned about the impact on wildlife habitats. The Everglades is a fragile ecosystem that needs protection, not more human traffic.', 'Dr. Patricia Green', 'Dr. Patricia Green', 'Florida Wildlife Federation', 'Florida Wildlife Federation', 'oppose', 'published', '2024-02-07 14:30:00+00'),
('c2222222-0001-0001-0001-000000000003', 'd2222222-1111-1111-1111-111111111111', 'The visitor centers should include educational components about Everglades conservation and the importance of water management.', 'The visitor centers should include educational components about Everglades conservation and the importance of water management.', 'Susan Miller', 'Susan Miller', 'Everglades Foundation', 'Everglades Foundation', 'support', 'published', '2024-02-09 11:45:00+00'),
('c2222222-0001-0001-0001-000000000004', 'd2222222-1111-1111-1111-111111111111', 'As a local business owner, I support this project. It will bring more tourists to our area and boost the local economy.', 'As a local business owner, I support this project. It will bring more tourists to our area and boost the local economy.', 'Tom Rodriguez', 'Tom Rodriguez', 'Homestead Chamber of Commerce', 'Homestead Chamber of Commerce', 'support', 'published', '2024-02-11 16:20:00+00'),
('c2222222-0001-0001-0001-000000000005', 'd2222222-1111-1111-1111-111111111111', 'The trails must be designed to minimize disruption to nesting birds and other wildlife. Seasonal closures may be necessary.', 'The trails must be designed to minimize disruption to nesting birds and other wildlife. Seasonal closures may be necessary.', 'Dr. James Wilson', 'Dr. James Wilson', 'Audubon Society', 'Audubon Society', 'neutral', 'published', '2024-02-13 10:10:00+00'),
('c2222222-0001-0001-0001-000000000006', 'd2222222-1111-1111-1111-111111111111', 'Excellent project! My family loves hiking and this will give us new places to explore Florida''s natural beauty.', 'Excellent project! My family loves hiking and this will give us new places to explore Florida''s natural beauty.', 'Rachel Thompson', 'Rachel Thompson', NULL, NULL, 'support', 'published', '2024-02-15 13:35:00+00'),
('c2222222-0001-0001-0001-000000000007', 'd2222222-1111-1111-1111-111111111111', 'Please ensure the trails are accessible to people with disabilities. The ADA requirements should be exceeded, not just met.', 'Please ensure the trails are accessible to people with disabilities. The ADA requirements should be exceeded, not just met.', 'Mark Davis', 'Mark Davis', 'Disability Rights Florida', 'Disability Rights Florida', 'support', 'published', '2024-02-17 08:50:00+00'),
('c2222222-0001-0001-0001-000000000008', 'd2222222-1111-1111-1111-111111111111', 'The environmental impact study needs to be more comprehensive. We need to understand long-term effects on water flow and wildlife migration.', 'The environmental impact study needs to be more comprehensive. We need to understand long-term effects on water flow and wildlife migration.', 'Dr. Lisa Garcia', 'Dr. Lisa Garcia', 'University of Miami', 'University of Miami', 'neutral', 'published', '2024-02-19 15:25:00+00'),
('c2222222-0001-0001-0001-000000000009', 'd2222222-1111-1111-1111-111111111111', 'This is a waste of taxpayer money. The Everglades should be left alone, not turned into a theme park.', 'This is a waste of taxpayer money. The Everglades should be left alone, not turned into a theme park.', 'Robert Johnson', 'Robert Johnson', NULL, NULL, 'oppose', 'published', '2024-02-21 12:40:00+00'),
('c2222222-0001-0001-0001-000000000010', 'd2222222-1111-1111-1111-111111111111', 'The project should include partnerships with local Native American tribes who have deep knowledge of this ecosystem.', 'The project should include partnerships with local Native American tribes who have deep knowledge of this ecosystem.', 'Maria Gonzalez', 'Maria Gonzalez', 'Miccosukee Tribe', 'Miccosukee Tribe', 'support', 'published', '2024-02-23 09:55:00+00'),
('c2222222-0001-0001-0001-000000000011', 'd2222222-1111-1111-1111-111111111111', 'Great initiative! Educational tourism like this helps people understand why we need to protect our natural areas.', 'Great initiative! Educational tourism like this helps people understand why we need to protect our natural areas.', 'Kevin Lee', 'Kevin Lee', 'Florida State Parks Association', 'Florida State Parks Association', 'support', 'published', '2024-02-25 14:15:00+00'),
('c2222222-0001-0001-0001-000000000012', 'd2222222-1111-1111-1111-111111111111', 'The visitor centers should be built with sustainable materials and renewable energy to demonstrate environmental stewardship.', 'The visitor centers should be built with sustainable materials and renewable energy to demonstrate environmental stewardship.', 'Sarah Kim', 'Sarah Kim', 'Green Building Council', 'Green Building Council', 'support', 'published', '2024-02-27 11:30:00+00');

-- Insert sample comments for Denver Bike Lanes (15 comments)
INSERT INTO comments (id, docket_id, content, body, submitter_name, commenter_name, organization, commenter_organization, position, status, created_at) VALUES
('c3333333-0001-0001-0001-000000000001', 'd3333333-1111-1111-1111-111111111111', 'This bike lane network is exactly what Denver needs! It will reduce traffic congestion and improve air quality downtown.', 'This bike lane network is exactly what Denver needs! It will reduce traffic congestion and improve air quality downtown.', 'Alex Turner', 'Alex Turner', NULL, NULL, 'support', 'published', '2024-02-20 08:45:00+00'),
('c3333333-0001-0001-0001-000000000002', 'd3333333-1111-1111-1111-111111111111', 'As a daily bike commuter, I fully support protected bike lanes. The current infrastructure is dangerous and inadequate.', 'As a daily bike commuter, I fully support protected bike lanes. The current infrastructure is dangerous and inadequate.', 'Jennifer Walsh', 'Jennifer Walsh', 'Denver Bicycle Lobby', 'Denver Bicycle Lobby', 'support', 'published', '2024-02-22 10:20:00+00'),
('c3333333-0001-0001-0001-000000000003', 'd3333333-1111-1111-1111-111111111111', 'I oppose this project. It will eliminate parking spaces and hurt local businesses. Cars are still the primary transportation method.', 'I oppose this project. It will eliminate parking spaces and hurt local businesses. Cars are still the primary transportation method.', 'Mike Stevens', 'Mike Stevens', 'Downtown Business Association', 'Downtown Business Association', 'oppose', 'published', '2024-02-24 13:10:00+00'),
('c3333333-0001-0001-0001-000000000004', 'd3333333-1111-1111-1111-111111111111', 'The bike-share stations are a great addition. This will make cycling accessible to tourists and occasional riders.', 'The bike-share stations are a great addition. This will make cycling accessible to tourists and occasional riders.', 'Lisa Chen', 'Lisa Chen', NULL, NULL, 'support', 'published', '2024-02-26 15:35:00+00'),
('c3333333-0001-0001-0001-000000000005', 'd3333333-1111-1111-1111-111111111111', 'Please ensure the bike lanes connect to existing trails and neighborhoods. A fragmented network won''t be effective.', 'Please ensure the bike lanes connect to existing trails and neighborhoods. A fragmented network won''t be effective.', 'David Park', 'David Park', 'Bicycle Colorado', 'Bicycle Colorado', 'support', 'published', '2024-02-28 09:50:00+00'),
('c3333333-0001-0001-0001-000000000006', 'd3333333-1111-1111-1111-111111111111', 'The safety benefits are undeniable. Protected bike lanes reduce cyclist injuries by 90% compared to shared roadways.', 'The safety benefits are undeniable. Protected bike lanes reduce cyclist injuries by 90% compared to shared roadways.', 'Dr. Sarah Martinez', 'Dr. Sarah Martinez', 'Denver Health', 'Denver Health', 'support', 'published', '2024-03-01 12:25:00+00'),
('c3333333-0001-0001-0001-000000000007', 'd3333333-1111-1111-1111-111111111111', 'This is a waste of money that could be better spent on fixing potholes and improving roads for cars.', 'This is a waste of money that could be better spent on fixing potholes and improving roads for cars.', 'Robert Taylor', 'Robert Taylor', NULL, NULL, 'oppose', 'published', '2024-03-03 14:40:00+00'),
('c3333333-0001-0001-0001-000000000008', 'd3333333-1111-1111-1111-111111111111', 'The environmental benefits extend beyond just reducing emissions. Bike infrastructure encourages active transportation and healthier communities.', 'The environmental benefits extend beyond just reducing emissions. Bike infrastructure encourages active transportation and healthier communities.', 'Amanda Green', 'Amanda Green', 'Environmental Defense Fund', 'Environmental Defense Fund', 'support', 'published', '2024-03-05 11:15:00+00'),
('c3333333-0001-0001-0001-000000000009', 'd3333333-1111-1111-1111-111111111111', 'I support the concept but worry about winter maintenance. How will bike lanes be kept clear of snow and ice?', 'I support the concept but worry about winter maintenance. How will bike lanes be kept clear of snow and ice?', 'Tom Wilson', 'Tom Wilson', NULL, NULL, 'neutral', 'published', '2024-03-07 16:30:00+00'),
('c3333333-0001-0001-0001-000000000010', 'd3333333-1111-1111-1111-111111111111', 'Bike lanes will make downtown more attractive to young professionals and families. This is good for economic development.', 'Bike lanes will make downtown more attractive to young professionals and families. This is good for economic development.', 'Jessica Brown', 'Jessica Brown', 'Denver Metro Chamber', 'Denver Metro Chamber', 'support', 'published', '2024-03-09 10:05:00+00'),
('c3333333-0001-0001-0001-000000000011', 'd3333333-1111-1111-1111-111111111111', 'The design should include proper lighting and security features. Safety concerns extend beyond just traffic accidents.', 'The design should include proper lighting and security features. Safety concerns extend beyond just traffic accidents.', 'Officer Maria Lopez', 'Officer Maria Lopez', 'Denver Police Department', 'Denver Police Department', 'neutral', 'published', '2024-03-11 13:20:00+00'),
('c3333333-0001-0001-0001-000000000012', 'd3333333-1111-1111-1111-111111111111', 'Excellent project! Cities around the world are proving that bike infrastructure improves quality of life and reduces transportation costs.', 'Excellent project! Cities around the world are proving that bike infrastructure improves quality of life and reduces transportation costs.', 'Dr. James Kim', 'Dr. James Kim', 'University of Colorado', 'University of Colorado', 'support', 'published', '2024-03-13 08:55:00+00'),
('c3333333-0001-0001-0001-000000000013', 'd3333333-1111-1111-1111-111111111111', 'The project timeline seems rushed. More community input and design refinement is needed before construction begins.', 'The project timeline seems rushed. More community input and design refinement is needed before construction begins.', 'Nancy Davis', 'Nancy Davis', 'Capitol Hill Neighborhood Association', 'Capitol Hill Neighborhood Association', 'neutral', 'published', '2024-03-15 15:45:00+00'),
('c3333333-0001-0001-0001-000000000014', 'd3333333-1111-1111-1111-111111111111', 'I oppose this project. It prioritizes a small group of cyclists over the majority of residents who drive cars.', 'I oppose this project. It prioritizes a small group of cyclists over the majority of residents who drive cars.', 'Frank Miller', 'Frank Miller', NULL, NULL, 'oppose', 'published', '2024-03-17 12:10:00+00'),
('c3333333-0001-0001-0001-000000000015', 'd3333333-1111-1111-1111-111111111111', 'The bike-share integration is smart. This creates a comprehensive mobility system that serves residents and visitors alike.', 'The bike-share integration is smart. This creates a comprehensive mobility system that serves residents and visitors alike.', 'Carlos Rodriguez', 'Carlos Rodriguez', 'Denver B-cycle', 'Denver B-cycle', 'support', 'published', '2024-03-19 09:30:00+00');

-- Insert sample comments for closed dockets (fewer comments since they're closed)
-- California EV Charging (8 comments)
INSERT INTO comments (id, docket_id, content, body, submitter_name, commenter_name, organization, commenter_organization, position, status, created_at) VALUES
('c1111111-0002-0002-0002-000000000001', 'd1111111-2222-2222-2222-222222222222', 'These standards are essential for widespread EV adoption. Consistent charging infrastructure will reduce range anxiety.', 'These standards are essential for widespread EV adoption. Consistent charging infrastructure will reduce range anxiety.', 'Mark Johnson', 'Mark Johnson', 'California Electric Vehicle Association', 'California Electric Vehicle Association', 'support', 'published', '2023-11-15 10:20:00+00'),
('c1111111-0002-0002-0002-000000000002', 'd1111111-2222-2222-2222-222222222222', 'The requirements should include provisions for different types of EVs, including motorcycles and commercial vehicles.', 'The requirements should include provisions for different types of EVs, including motorcycles and commercial vehicles.', 'Linda Garcia', 'Linda Garcia', NULL, NULL, 'support', 'published', '2023-11-20 14:45:00+00'),
('c1111111-0002-0002-0002-000000000003', 'd1111111-2222-2222-2222-222222222222', 'The cost burden on developers is too high. This will increase housing costs and commercial rents.', 'The cost burden on developers is too high. This will increase housing costs and commercial rents.', 'Steve Wilson', 'Steve Wilson', 'California Building Industry Association', 'California Building Industry Association', 'oppose', 'published', '2023-11-25 09:30:00+00'),
('c1111111-0002-0002-0002-000000000004', 'd1111111-2222-2222-2222-222222222222', 'Standards should include requirements for renewable energy sources to power the charging stations.', 'Standards should include requirements for renewable energy sources to power the charging stations.', 'Dr. Patricia Lee', 'Dr. Patricia Lee', 'Clean Energy Institute', 'Clean Energy Institute', 'support', 'published', '2023-12-01 16:15:00+00'),
('c1111111-0002-0002-0002-000000000005', 'd1111111-2222-2222-2222-222222222222', 'The standards need to address grid capacity issues. Mass EV adoption will strain our electrical infrastructure.', 'The standards need to address grid capacity issues. Mass EV adoption will strain our electrical infrastructure.', 'Robert Chen', 'Robert Chen', 'Pacific Gas & Electric', 'Pacific Gas & Electric', 'neutral', 'published', '2023-12-05 11:40:00+00'),
('c1111111-0002-0002-0002-000000000006', 'd1111111-2222-2222-2222-222222222222', 'Excellent initiative! This will accelerate California''s transition to clean transportation.', 'Excellent initiative! This will accelerate California''s transition to clean transportation.', 'Jennifer Martinez', 'Jennifer Martinez', NULL, NULL, 'support', 'published', '2023-12-10 13:25:00+00'),
('c1111111-0002-0002-0002-000000000007', 'd1111111-2222-2222-2222-222222222222', 'The standards should include cybersecurity requirements for charging stations to protect user data and grid security.', 'The standards should include cybersecurity requirements for charging stations to protect user data and grid security.', 'Dr. Michael Brown', 'Dr. Michael Brown', 'UC Berkeley', 'UC Berkeley', 'support', 'published', '2023-12-15 08:50:00+00'),
('c1111111-0002-0002-0002-000000000008', 'd1111111-2222-2222-2222-222222222222', 'Implementation timeline is too aggressive. Developers need more time to adapt to these new requirements.', 'Implementation timeline is too aggressive. Developers need more time to adapt to these new requirements.', 'Susan Davis', 'Susan Davis', 'California Association of Realtors', 'California Association of Realtors', 'neutral', 'published', '2023-12-20 15:10:00+00');

-- Florida Beach Access (10 comments)
INSERT INTO comments (id, docket_id, content, body, submitter_name, commenter_name, organization, commenter_organization, position, status, created_at) VALUES
('c2222222-0002-0002-0002-000000000001', 'd2222222-2222-2222-2222-222222222222', 'This project will greatly improve access for families and people with disabilities. The ADA compliance is especially important.', 'This project will greatly improve access for families and people with disabilities. The ADA compliance is especially important.', 'Mary Johnson', 'Mary Johnson', NULL, NULL, 'support', 'published', '2023-12-10 09:15:00+00'),
('c2222222-0002-0002-0002-000000000002', 'd2222222-2222-2222-2222-222222222222', 'The additional parking will help, but we also need better public transportation to the beaches to reduce traffic.', 'The additional parking will help, but we also need better public transportation to the beaches to reduce traffic.', 'Carlos Mendez', 'Carlos Mendez', 'Florida Transit Association', 'Florida Transit Association', 'support', 'published', '2023-12-15 11:30:00+00'),
('c2222222-0002-0002-0002-000000000003', 'd2222222-2222-2222-2222-222222222222', 'I''m concerned about the environmental impact of more parking lots near sensitive coastal areas. Alternative solutions should be considered.', 'I''m concerned about the environmental impact of more parking lots near sensitive coastal areas. Alternative solutions should be considered.', 'Dr. Lisa Thompson', 'Dr. Lisa Thompson', 'Coastal Conservation Alliance', 'Coastal Conservation Alliance', 'oppose', 'published', '2023-12-18 14:45:00+00'),
('c2222222-0002-0002-0002-000000000004', 'd2222222-2222-2222-2222-222222222222', 'The walkways should use sustainable materials that can withstand saltwater and storms without frequent replacement.', 'The walkways should use sustainable materials that can withstand saltwater and storms without frequent replacement.', 'James Wilson', 'James Wilson', 'Florida Engineering Society', 'Florida Engineering Society', 'support', 'published', '2023-12-22 10:20:00+00'),
('c2222222-0002-0002-0002-000000000005', 'd2222222-2222-2222-2222-222222222222', 'Great project! As a wheelchair user, I''m excited about improved beach access. This will open up recreation opportunities for many people.', 'Great project! As a wheelchair user, I''m excited about improved beach access. This will open up recreation opportunities for many people.', 'Patricia Davis', 'Patricia Davis', 'Disability Rights Florida', 'Disability Rights Florida', 'support', 'published', '2023-12-25 16:10:00+00'),
('c2222222-0002-0002-0002-000000000006', 'd2222222-2222-2222-2222-222222222222', 'The project should include educational signage about sea turtle nesting and other wildlife protection measures.', 'The project should include educational signage about sea turtle nesting and other wildlife protection measures.', 'Dr. Robert Garcia', 'Dr. Robert Garcia', 'Florida Sea Turtle Conservancy', 'Florida Sea Turtle Conservancy', 'support', 'published', '2023-12-28 12:35:00+00'),
('c2222222-0002-0002-0002-000000000007', 'd2222222-2222-2222-2222-222222222222', 'More parking will just bring more crowds and damage to our beaches. We need to limit access, not expand it.', 'More parking will just bring more crowds and damage to our beaches. We need to limit access, not expand it.', 'Sandra Miller', 'Sandra Miller', NULL, NULL, 'oppose', 'published', '2024-01-02 08:55:00+00'),
('c2222222-0002-0002-0002-000000000008', 'd2222222-2222-2222-2222-222222222222', 'The economic benefits to local communities will be significant. Beach tourism is vital to Florida''s economy.', 'The economic benefits to local communities will be significant. Beach tourism is vital to Florida''s economy.', 'Michael Rodriguez', 'Michael Rodriguez', 'Florida Restaurant & Lodging Association', 'Florida Restaurant & Lodging Association', 'support', 'published', '2024-01-05 13:40:00+00'),
('c2222222-0002-0002-0002-000000000009', 'd2222222-2222-2222-2222-222222222222', 'Please coordinate with local emergency services to ensure the new facilities don''t impede beach rescue operations.', 'Please coordinate with local emergency services to ensure the new facilities don''t impede beach rescue operations.', 'Captain John Smith', 'Captain John Smith', 'Florida Beach Patrol', 'Florida Beach Patrol', 'neutral', 'published', '2024-01-08 15:25:00+00'),
('c2222222-0002-0002-0002-000000000010', 'd2222222-2222-2222-2222-222222222222', 'The project timeline should account for sea turtle nesting season. Construction should be scheduled to minimize wildlife disruption.', 'The project timeline should account for sea turtle nesting season. Construction should be scheduled to minimize wildlife disruption.', 'Dr. Angela White', 'Dr. Angela White', 'Florida Fish and Wildlife Conservation Commission', 'Florida Fish and Wildlife Conservation Commission', 'support', 'published', '2024-01-12 09:50:00+00');

-- Denver BRT Line 3 (12 comments)
INSERT INTO comments (id, docket_id, content, body, submitter_name, commenter_name, organization, commenter_organization, position, status, created_at) VALUES
('c3333333-0002-0002-0002-000000000001', 'd3333333-2222-2222-2222-222222222222', 'BRT Line 3 is crucial for connecting underserved communities to employment opportunities downtown and at the airport.', 'BRT Line 3 is crucial for connecting underserved communities to employment opportunities downtown and at the airport.', 'Maria Gonzalez', 'Maria Gonzalez', 'Denver Transit Alliance', 'Denver Transit Alliance', 'support', 'published', '2023-10-15 10:30:00+00'),
('c3333333-0002-0002-0002-000000000002', 'd3333333-2222-2222-2222-222222222222', 'The environmental assessment should include analysis of construction impacts on air quality in nearby neighborhoods.', 'The environmental assessment should include analysis of construction impacts on air quality in nearby neighborhoods.', 'Dr. Sarah Kim', 'Dr. Sarah Kim', 'Colorado Department of Public Health', 'Colorado Department of Public Health', 'neutral', 'published', '2023-10-20 14:15:00+00'),
('c3333333-0002-0002-0002-000000000003', 'd3333333-2222-2222-2222-222222222222', 'This project will reduce car traffic and emissions significantly. The environmental benefits far outweigh any construction impacts.', 'This project will reduce car traffic and emissions significantly. The environmental benefits far outweigh any construction impacts.', 'Jennifer Park', 'Jennifer Park', 'Sierra Club Colorado', 'Sierra Club Colorado', 'support', 'published', '2023-10-25 09:45:00+00'),
('c3333333-0002-0002-0002-000000000004', 'd3333333-2222-2222-2222-222222222222', 'I oppose this project. The cost is too high and will burden taxpayers for decades. Existing bus service is adequate.', 'I oppose this project. The cost is too high and will burden taxpayers for decades. Existing bus service is adequate.', 'Robert Taylor', 'Robert Taylor', 'Colorado Taxpayers Union', 'Colorado Taxpayers Union', 'oppose', 'published', '2023-11-01 16:20:00+00'),
('c3333333-0002-0002-0002-000000000005', 'd3333333-2222-2222-2222-222222222222', 'The noise impact analysis should include effects on schools and hospitals along the route. Mitigation measures are essential.', 'The noise impact analysis should include effects on schools and hospitals along the route. Mitigation measures are essential.', 'Dr. Michael Chen', 'Dr. Michael Chen', 'National Jewish Health', 'National Jewish Health', 'neutral', 'published', '2023-11-05 11:55:00+00'),
('c3333333-0002-0002-0002-000000000006', 'd3333333-2222-2222-2222-222222222222', 'BRT will provide reliable transit that isn''t affected by traffic congestion. This is essential for airport workers and travelers.', 'BRT will provide reliable transit that isn''t affected by traffic congestion. This is essential for airport workers and travelers.', 'Lisa Martinez', 'Lisa Martinez', 'Denver International Airport', 'Denver International Airport', 'support', 'published', '2023-11-10 13:40:00+00'),
('c3333333-0002-0002-0002-000000000007', 'd3333333-2222-2222-2222-222222222222', 'The project should include affordable housing protections to prevent displacement of low-income residents along the route.', 'The project should include affordable housing protections to prevent displacement of low-income residents along the route.', 'Carlos Rodriguez', 'Carlos Rodriguez', 'Colorado Coalition for the Homeless', 'Colorado Coalition for the Homeless', 'support', 'published', '2023-11-15 08:25:00+00'),
('c3333333-0002-0002-0002-000000000008', 'd3333333-2222-2222-2222-222222222222', 'The environmental assessment is incomplete. More study is needed on impacts to local air quality and noise levels.', 'The environmental assessment is incomplete. More study is needed on impacts to local air quality and noise levels.', 'Dr. Amanda Davis', 'Dr. Amanda Davis', 'University of Colorado Denver', 'University of Colorado Denver', 'neutral', 'published', '2023-11-20 15:10:00+00'),
('c3333333-0002-0002-0002-000000000009', 'd3333333-2222-2222-2222-222222222222', 'This project will hurt local businesses during construction and reduce street parking permanently. The economic impact is negative.', 'This project will hurt local businesses during construction and reduce street parking permanently. The economic impact is negative.', 'Tom Wilson', 'Tom Wilson', 'Colfax Business Improvement District', 'Colfax Business Improvement District', 'oppose', 'published', '2023-11-25 12:30:00+00'),
('c3333333-0002-0002-0002-000000000010', 'd3333333-2222-2222-2222-222222222222', 'BRT Line 3 will improve regional connectivity and support sustainable development patterns. This is smart growth planning.', 'BRT Line 3 will improve regional connectivity and support sustainable development patterns. This is smart growth planning.', 'Jessica Brown', 'Jessica Brown', 'Denver Regional Council of Governments', 'Denver Regional Council of Governments', 'support', 'published', '2023-11-30 10:45:00+00'),
('c3333333-0002-0002-0002-000000000011', 'd3333333-2222-2222-2222-222222222222', 'The stations should be designed with crime prevention in mind. Good lighting and sight lines are essential for rider safety.', 'The stations should be designed with crime prevention in mind. Good lighting and sight lines are essential for rider safety.', 'Officer David Lee', 'Officer David Lee', 'Denver Police Department', 'Denver Police Department', 'support', 'published', '2023-12-05 14:20:00+00'),
('c3333333-0002-0002-0002-000000000012', 'd3333333-2222-2222-2222-222222222222', 'The project timeline should be extended to allow for more community input and design refinements based on this feedback.', 'The project timeline should be extended to allow for more community input and design refinements based on this feedback.', 'Nancy Garcia', 'Nancy Garcia', 'Montbello Neighborhood Association', 'Montbello Neighborhood Association', 'neutral', 'published', '2023-12-10 09:35:00+00');

-- Insert sample attachments (metadata only)
INSERT INTO attachments (comment_id, filename, file_url, mime_type, file_size) VALUES
('c1111111-0001-0001-0001-000000000002', 'SEED_energy_burden_report.pdf', 'https://example.com/files/energy_burden_report.pdf', 'application/pdf', 2048000),
('c1111111-0001-0001-0001-000000000004', 'SEED_climate_goals_analysis.pdf', 'https://example.com/files/climate_goals_analysis.pdf', 'application/pdf', 1536000),
('c1111111-0001-0001-0001-000000000006', 'SEED_installation_photos.jpg', 'https://example.com/files/installation_photos.jpg', 'image/jpeg', 3072000),
('c1111111-0001-0001-0001-000000000008', 'SEED_grid_stability_study.pdf', 'https://example.com/files/grid_stability_study.pdf', 'application/pdf', 4096000),
('c2222222-0001-0001-0001-000000000002', 'SEED_wildlife_impact_study.pdf', 'https://example.com/files/wildlife_impact_study.pdf', 'application/pdf', 5120000),
('c2222222-0001-0001-0001-000000000003', 'SEED_conservation_plan.docx', 'https://example.com/files/conservation_plan.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 1024000),
('c2222222-0001-0001-0001-000000000007', 'SEED_accessibility_guidelines.pdf', 'https://example.com/files/accessibility_guidelines.pdf', 'application/pdf', 2560000),
('c2222222-0001-0001-0001-000000000008', 'SEED_environmental_research.pdf', 'https://example.com/files/environmental_research.pdf', 'application/pdf', 6144000),
('c3333333-0001-0001-0001-000000000002', 'SEED_bike_safety_statistics.pdf', 'https://example.com/files/bike_safety_statistics.pdf', 'application/pdf', 1792000),
('c3333333-0001-0001-0001-000000000006', 'SEED_injury_reduction_data.xlsx', 'https://example.com/files/injury_reduction_data.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 512000),
('c3333333-0001-0001-0001-000000000008', 'SEED_environmental_benefits.pdf', 'https://example.com/files/environmental_benefits.pdf', 'application/pdf', 2304000),
('c3333333-0001-0001-0001-000000000012', 'SEED_international_case_studies.pdf', 'https://example.com/files/international_case_studies.pdf', 'application/pdf', 7168000),
('c3333333-0002-0002-0002-000000000002', 'SEED_air_quality_analysis.pdf', 'https://example.com/files/air_quality_analysis.pdf', 'application/pdf', 3584000),
('c3333333-0002-0002-0002-000000000005', 'SEED_noise_impact_study.pdf', 'https://example.com/files/noise_impact_study.pdf', 'application/pdf', 4608000),
('c3333333-0002-0002-0002-000000000008', 'SEED_environmental_assessment.pdf', 'https://example.com/files/environmental_assessment.pdf', 'application/pdf', 8192000);

-- Update search vectors for all content
UPDATE dockets SET search_vector = to_tsvector('english', title || ' ' || COALESCE(summary, description, ''));
UPDATE comments SET search_vector = to_tsvector('english', COALESCE(content, body, ''));