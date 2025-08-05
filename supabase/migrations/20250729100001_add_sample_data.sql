-- 2025-01-01 00:00 Add Sample Data

-- Add sample agencies
INSERT INTO agencies (id, name, jurisdiction) VALUES
('11111111-1111-4000-8000-000000000001', 'California Department of Transportation', 'California'),
('11111111-1111-4000-8000-000000000002', 'Texas Department of Transportation', 'Texas'),
('11111111-1111-4000-8000-000000000003', 'New York State Department of Environmental Conservation', 'New York'),
('11111111-1111-4000-8000-000000000004', 'Florida Department of Environmental Protection', 'Florida')
ON CONFLICT(id) DO NOTHING;

-- Add sample dockets
INSERT INTO dockets (id, agency_id, title, slug, status, tags, open_at, close_at, comment_deadline, description, summary) VALUES
-- California DOT dockets
('22222222-2222-4000-8000-000000000001', '11111111-1111-4000-8000-000000000001', 'Electric Vehicle Infrastructure Standards', 'ev-infrastructure-standards', 'open', ARRAY['transportation', 'electric-vehicles', 'infrastructure'], now() - interval '30 days', now() + interval '60 days', now() + interval '60 days', 'Proposed standards for electric vehicle charging infrastructure across California highways.', 'Establishing minimum requirements for EV charging stations on California highways.'),
('22222222-2222-4000-8000-000000000002', '11111111-1111-4000-8000-000000000001', 'Autonomous Vehicle Safety Regulations', 'autonomous-vehicle-safety', 'open', ARRAY['transportation', 'autonomous-vehicles', 'safety'], now() - interval '15 days', now() + interval '45 days', now() + interval '45 days', 'Safety standards and testing requirements for autonomous vehicle deployment in California.', 'New regulations for autonomous vehicle testing and deployment on California roads.'),
-- Texas DOT docket
('22222222-2222-4000-8000-000000000003', '11111111-1111-4000-8000-000000000002', 'Highway Expansion Project', 'highway-expansion-project', 'open', ARRAY['transportation', 'infrastructure', 'expansion'], now() - interval '45 days', now() + interval '30 days', now() + interval '30 days', 'Proposed expansion of major highways in Texas metropolitan areas.', 'Expansion of key highway corridors to reduce congestion in Texas cities.'),
-- New York DEC docket
('22222222-2222-4000-8000-000000000004', '11111111-1111-4000-8000-000000000003', 'Water Quality Standards Update', 'water-quality-standards', 'open', ARRAY['environment', 'water-quality', 'regulations'], now() - interval '20 days', now() + interval '40 days', now() + interval '40 days', 'Updated water quality standards for New York State waterways.', 'Revised standards for water quality management in New York State.'),
-- Florida DEP docket
('22222222-2222-4000-8000-000000000005', '11111111-1111-4000-8000-000000000004', 'Coastal Protection Regulations', 'coastal-protection-regulations', 'open', ARRAY['environment', 'coastal', 'protection'], now() - interval '10 days', now() + interval '50 days', now() + interval '50 days', 'Environmental regulations for coastal development and protection in Florida.', 'Comprehensive environmental regulations for Florida coastal areas.')
ON CONFLICT(id) DO NOTHING;

-- Add sample comments
INSERT INTO comments (id, docket_id, content, status, commenter_name, commenter_organization, comment_position, created_at) VALUES
-- Comments on California EV Infrastructure docket
('33333333-3333-4000-8000-000000000001', '22222222-2222-4000-8000-000000000001', 'I strongly support the proposed electric vehicle infrastructure standards for California. As a Tesla owner in Los Angeles, I have experienced firsthand the need for standardized charging infrastructure. The current patchwork of different charging networks creates confusion and range anxiety for EV drivers. Standardized connectors and payment systems would greatly improve the EV ownership experience and encourage more people to adopt electric vehicles. I recommend including provisions for fast-charging stations every 50 miles along major California highways.', 'approved', 'Sarah Johnson', 'Tesla Owners Club', 'support', now() - interval '25 days'),
('33333333-3333-4000-8000-000000000002', '22222222-2222-4000-8000-000000000001', 'While I support the concept of EV infrastructure, I have concerns about the proposed standards being too restrictive. The rapid pace of technology development means that today''s standards may be obsolete tomorrow. I suggest a more flexible approach that allows for innovation while maintaining basic safety requirements. Additionally, the cost estimates for implementation seem optimistic and could place undue burden on smaller charging network operators.', 'approved', 'Michael Chen', 'Electric Vehicle Manufacturers Association', 'neutral', now() - interval '20 days'),
('33333333-3333-4000-8000-000000000003', '22222222-2222-4000-8000-000000000001', 'I oppose these standards as they represent government overreach into private business operations. The free market should determine charging infrastructure standards, not government mandates. This will stifle innovation and increase costs for consumers. Let the market decide which charging solutions work best.', 'approved', 'Robert Smith', 'Free Market Coalition', 'oppose', now() - interval '15 days'),

-- Comments on California Autonomous Vehicle Safety docket
('33333333-3333-4000-8000-000000000004', '22222222-2222-4000-8000-000000000002', 'The proposed autonomous vehicle safety regulations are a critical step forward for public safety in California. As a transportation safety researcher, I believe these standards will help establish a baseline for autonomous vehicle testing and deployment. However, I recommend strengthening the cybersecurity requirements, as autonomous vehicles represent a significant cybersecurity risk. The regulations should include mandatory penetration testing and regular security audits.', 'approved', 'Dr. Emily Rodriguez', 'Transportation Safety Institute', 'support', now() - interval '10 days'),
('33333333-3333-4000-8000-000000000005', '22222222-2222-4000-8000-000000000002', 'These regulations are too restrictive and will slow down autonomous vehicle development. The technology is advancing rapidly, and overly burdensome regulations will put California at a competitive disadvantage. I suggest a more permissive approach that allows for rapid iteration and testing.', 'approved', 'David Kim', 'Autonomous Vehicle Development Corp', 'oppose', now() - interval '5 days'),

-- Comment on Texas Highway Expansion docket
('33333333-3333-4000-8000-000000000006', '22222222-2222-4000-8000-000000000003', 'The proposed highway expansion project is essential for reducing congestion in Texas metropolitan areas. As a transportation engineer working in Houston, I see daily the impact of traffic congestion on economic productivity. The expansion should include provisions for public transit integration and bike lanes to provide alternative transportation options.', 'approved', 'Lisa Thompson', 'Texas Transportation Solutions', 'support', now() - interval '30 days'),

-- Comment on New York Water Quality docket
('33333333-3333-4000-8000-000000000007', '22222222-2222-4000-8000-000000000004', 'The updated water quality standards are crucial for protecting New York State waterways. As an environmental engineer working in New York, I can attest to the challenges of maintaining water quality in urban areas. The standards should include specific requirements for stormwater management and green infrastructure integration.', 'approved', 'James Wilson', 'New York Environmental Coalition', 'support', now() - interval '15 days'),

-- Comment on Florida Coastal Protection docket
('33333333-3333-4000-8000-000000000008', '22222222-2222-4000-8000-000000000005', 'The coastal protection regulations represent a significant investment in Florida''s environmental future. However, I have concerns about the impact assessment methodology. The study should include more detailed analysis of wildlife corridors and noise pollution impacts on coastal communities. I recommend extending the public comment period to allow for more thorough review.', 'approved', 'Maria Garcia', 'Florida Coastal Alliance', 'neutral', now() - interval '5 days'),

-- Additional comments for more variety
-- Comment on California EV Infrastructure docket
('33333333-3333-4000-8000-000000000009', '22222222-2222-4000-8000-000000000001', 'As a small business owner in the electric vehicle charging industry, I support the proposed standards but have concerns about the implementation timeline. The current proposal may not give enough time for existing infrastructure to be upgraded. I recommend a phased approach that allows for gradual compliance over a 3-year period rather than immediate implementation.', 'approved', 'Jennifer Martinez', 'Green Charge Solutions', 'support', now() - interval '12 days'),

-- Comment on Texas Highway Expansion docket
('33333333-3333-4000-8000-000000000010', '22222222-2222-4000-8000-000000000003', 'The proposed highway expansion is necessary but should include more consideration for environmental impacts. As a local environmental advocate, I urge the department to include more green infrastructure elements and wildlife crossings. The current plan focuses too heavily on vehicle capacity without addressing the ecological consequences.', 'approved', 'Carlos Rodriguez', 'Texas Environmental Network', 'neutral', now() - interval '8 days'),

-- Comment on New York Water Quality docket
('33333333-3333-4000-8000-000000000011', '22222222-2222-4000-8000-000000000004', 'These water quality standards are a step in the right direction, but they don''t go far enough to address the specific challenges facing New York''s urban waterways. The standards should include more stringent requirements for industrial discharge and stormwater management. I also recommend increased funding for monitoring and enforcement.', 'approved', 'Dr. Sarah Williams', 'New York Water Quality Institute', 'support', now() - interval '3 days'),

-- Two more comments for additional variety
-- Comment on Florida Coastal Protection docket
('33333333-3333-4000-8000-000000000012', '22222222-2222-4000-8000-000000000005', 'As a marine biologist working in Florida''s coastal waters, I strongly support these protection regulations. The proposed measures will help preserve critical habitats for endangered species like sea turtles and manatees. However, I recommend adding specific provisions for coral reef protection and establishing marine protected areas in high-biodiversity zones.', 'approved', 'Dr. Amanda Foster', 'Florida Marine Biology Institute', 'support', now() - interval '1 day'),

-- Comment on California Autonomous Vehicle Safety docket
('33333333-3333-4000-8000-000000000013', '22222222-2222-4000-8000-000000000002', 'The autonomous vehicle regulations need to address cybersecurity vulnerabilities more comprehensively. As a cybersecurity expert, I''ve identified several potential attack vectors that aren''t covered in the current proposal. I recommend mandatory penetration testing requirements and regular security audits for all autonomous vehicle systems.', 'approved', 'Mark Thompson', 'Cyber Security Solutions', 'neutral', now() - interval '2 days')
ON CONFLICT(id) DO NOTHING;

-- Add commenter info for some comments
INSERT INTO commenter_info (comment_id, representation, city, state) VALUES
('33333333-3333-4000-8000-000000000001', 'individual', 'Los Angeles', 'California'),
('33333333-3333-4000-8000-000000000002', 'organization', 'San Francisco', 'California'),
('33333333-3333-4000-8000-000000000003', 'organization', 'Austin', 'Texas'),
('33333333-3333-4000-8000-000000000004', 'individual', 'San Diego', 'California'),
('33333333-3333-4000-8000-000000000005', 'organization', 'Palo Alto', 'California'),
('33333333-3333-4000-8000-000000000006', 'individual', 'Houston', 'Texas'),
('33333333-3333-4000-8000-000000000007', 'organization', 'Albany', 'New York'),
('33333333-3333-4000-8000-000000000008', 'organization', 'Miami', 'Florida'),
('33333333-3333-4000-8000-000000000009', 'organization', 'San Jose', 'California'),
('33333333-3333-4000-8000-000000000010', 'individual', 'Dallas', 'Texas'),
('33333333-3333-4000-8000-000000000011', 'individual', 'Buffalo', 'New York'),
('33333333-3333-4000-8000-000000000012', 'individual', 'Tampa', 'Florida'),
('33333333-3333-4000-8000-000000000013', 'organization', 'San Francisco', 'California')
ON CONFLICT(comment_id) DO NOTHING; 