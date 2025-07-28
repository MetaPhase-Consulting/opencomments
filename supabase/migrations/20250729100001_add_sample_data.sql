-- 2025-01-01 00:00 Add Sample Data

-- Add sample agencies
INSERT INTO agencies (id, name, jurisdiction) VALUES
('11111111-1111-4000-8000-000000000001', 'Department of Transportation', 'Federal'),
('11111111-1111-4000-8000-000000000002', 'Environmental Protection Agency', 'Federal'),
('11111111-1111-4000-8000-000000000003', 'Department of Energy', 'Federal'),
('11111111-1111-4000-8000-000000000004', 'California Department of Transportation', 'California')
ON CONFLICT(id) DO NOTHING;

-- Add sample dockets
INSERT INTO dockets (id, agency_id, title, slug, status, tags, open_at, close_at, comment_deadline, description, summary) VALUES
-- DOT docket with multiple comments
('22222222-2222-4000-8000-000000000001', '11111111-1111-4000-8000-000000000001', 'Electric Vehicle Infrastructure Standards', 'ev-infrastructure-standards', 'open', ARRAY['transportation', 'electric-vehicles', 'infrastructure'], now() - interval '30 days', now() + interval '60 days', now() + interval '60 days', 'Proposed standards for electric vehicle charging infrastructure across the national highway system.', 'Establishing minimum requirements for EV charging stations on federal highways.'),
('22222222-2222-4000-8000-000000000002', '11111111-1111-4000-8000-000000000001', 'Autonomous Vehicle Safety Regulations', 'autonomous-vehicle-safety', 'open', ARRAY['transportation', 'autonomous-vehicles', 'safety'], now() - interval '15 days', now() + interval '45 days', now() + interval '45 days', 'Safety standards and testing requirements for autonomous vehicle deployment.', 'New regulations for autonomous vehicle testing and deployment on public roads.'),
-- EPA docket with one comment
('22222222-2222-4000-8000-000000000003', '11111111-1111-4000-8000-000000000002', 'Clean Water Act Implementation', 'clean-water-implementation', 'open', ARRAY['environment', 'water-quality', 'regulations'], now() - interval '45 days', now() + interval '30 days', now() + interval '30 days', 'Implementation guidelines for the Clean Water Act in urban areas.', 'Updated guidelines for urban water quality management under the Clean Water Act.'),
-- DOE docket
('22222222-2222-4000-8000-000000000004', '11111111-1111-4000-8000-000000000003', 'Renewable Energy Grid Integration', 'renewable-energy-grid', 'open', ARRAY['energy', 'renewable', 'grid'], now() - interval '20 days', now() + interval '40 days', now() + interval '40 days', 'Standards for integrating renewable energy sources into the national grid.', 'Technical standards for renewable energy integration and grid stability.'),
-- Caltrans docket
('22222222-2222-4000-8000-000000000005', '11111111-1111-4000-8000-000000000004', 'High-Speed Rail Environmental Impact', 'high-speed-rail-eis', 'open', ARRAY['transportation', 'rail', 'environmental'], now() - interval '10 days', now() + interval '50 days', now() + interval '50 days', 'Environmental impact study for proposed high-speed rail corridor.', 'Comprehensive environmental assessment for California high-speed rail project.')
ON CONFLICT(id) DO NOTHING;

-- Add sample comments
INSERT INTO comments (id, docket_id, content, status, commenter_name, commenter_organization, comment_position, created_at) VALUES
-- Comments on EV Infrastructure docket
('33333333-3333-4000-8000-000000000001', '22222222-2222-4000-8000-000000000001', 'I strongly support the proposed electric vehicle infrastructure standards. As a Tesla owner, I have experienced firsthand the need for standardized charging infrastructure. The current patchwork of different charging networks creates confusion and range anxiety for EV drivers. Standardized connectors and payment systems would greatly improve the EV ownership experience and encourage more people to adopt electric vehicles. I recommend including provisions for fast-charging stations every 50 miles along major highways.', 'approved', 'Sarah Johnson', 'Tesla Owners Club', 'support', now() - interval '25 days'),
('33333333-3333-4000-8000-000000000002', '22222222-2222-4000-8000-000000000001', 'While I support the concept of EV infrastructure, I have concerns about the proposed standards being too restrictive. The rapid pace of technology development means that today''s standards may be obsolete tomorrow. I suggest a more flexible approach that allows for innovation while maintaining basic safety requirements. Additionally, the cost estimates for implementation seem optimistic and could place undue burden on smaller charging network operators.', 'approved', 'Michael Chen', 'Electric Vehicle Manufacturers Association', 'neutral', now() - interval '20 days'),
('33333333-3333-4000-8000-000000000003', '22222222-2222-4000-8000-000000000001', 'I oppose these standards as they represent government overreach into private business operations. The free market should determine charging infrastructure standards, not government mandates. This will stifle innovation and increase costs for consumers. Let the market decide which charging solutions work best.', 'approved', 'Robert Smith', 'Free Market Coalition', 'oppose', now() - interval '15 days'),

-- Comments on Autonomous Vehicle Safety docket
('33333333-3333-4000-8000-000000000004', '22222222-2222-4000-8000-000000000002', 'The proposed autonomous vehicle safety regulations are a critical step forward for public safety. As a transportation safety researcher, I believe these standards will help establish a baseline for autonomous vehicle testing and deployment. However, I recommend strengthening the cybersecurity requirements, as autonomous vehicles represent a significant cybersecurity risk. The regulations should include mandatory penetration testing and regular security audits.', 'approved', 'Dr. Emily Rodriguez', 'Transportation Safety Institute', 'support', now() - interval '10 days'),
('33333333-3333-4000-8000-000000000005', '22222222-2222-4000-8000-000000000002', 'These regulations are too restrictive and will slow down autonomous vehicle development. The technology is advancing rapidly, and overly burdensome regulations will put the US at a competitive disadvantage. I suggest a more permissive approach that allows for rapid iteration and testing.', 'approved', 'David Kim', 'Autonomous Vehicle Development Corp', 'oppose', now() - interval '5 days'),

-- Comment on Clean Water Act docket
('33333333-3333-4000-8000-000000000006', '22222222-2222-4000-8000-000000000003', 'The proposed Clean Water Act implementation guidelines are essential for protecting urban water quality. As an environmental engineer working in urban areas, I see daily the impact of poor water management. The guidelines should include specific requirements for stormwater management and green infrastructure integration. I also recommend including provisions for community engagement in water quality monitoring.', 'approved', 'Lisa Thompson', 'Urban Environmental Solutions', 'support', now() - interval '30 days'),

-- Comments on Renewable Energy Grid docket
('33333333-3333-4000-8000-000000000007', '22222222-2222-4000-8000-000000000004', 'The renewable energy grid integration standards are crucial for our transition to clean energy. As a grid operator, I can attest to the challenges of integrating intermittent renewable sources. The proposed standards provide a good framework, but I recommend including more specific requirements for energy storage systems and demand response programs.', 'approved', 'James Wilson', 'National Grid Operations', 'support', now() - interval '15 days'),

-- Comment on High-Speed Rail docket
('33333333-3333-4000-8000-000000000008', '22222222-2222-4000-8000-000000000005', 'The high-speed rail project represents a significant investment in California''s transportation future. However, I have concerns about the environmental impact assessment methodology. The study should include more detailed analysis of wildlife corridors and noise pollution impacts on rural communities. I recommend extending the public comment period to allow for more thorough review.', 'approved', 'Maria Garcia', 'California Environmental Coalition', 'neutral', now() - interval '5 days')
ON CONFLICT(id) DO NOTHING;

-- Add commenter info for some comments
INSERT INTO commenter_info (comment_id, representation, city, state) VALUES
('33333333-3333-4000-8000-000000000001', 'individual', 'San Francisco', 'California'),
('33333333-3333-4000-8000-000000000002', 'organization', 'Washington', 'District of Columbia'),
('33333333-3333-4000-8000-000000000003', 'organization', 'Austin', 'Texas'),
('33333333-3333-4000-8000-000000000004', 'individual', 'Boston', 'Massachusetts'),
('33333333-3333-4000-8000-000000000005', 'organization', 'Palo Alto', 'California'),
('33333333-3333-4000-8000-000000000006', 'individual', 'Seattle', 'Washington'),
('33333333-3333-4000-8000-000000000007', 'organization', 'Denver', 'Colorado'),
('33333333-3333-4000-8000-000000000008', 'organization', 'Sacramento', 'California')
ON CONFLICT(comment_id) DO NOTHING; 