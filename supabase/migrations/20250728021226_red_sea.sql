/*
  # OpenComments Public Demo Data Seed
  
  This file creates realistic sample data for testing the public-facing
  browse and search functionality. 
  
  WARNING: This is for development/staging only!
  
  Contents:
  - 3 sample agencies across different states
  - 6 dockets (mix of open/closed status)
  - 60+ approved comments with variety
  - Sample tags and attachments
*/

-- Clear existing seed data (idempotent)
DELETE FROM attachments WHERE comment_id IN (
  SELECT id FROM comments WHERE content LIKE '%SEED_DATA%'
);
DELETE FROM docket_tags WHERE docket_id IN (
  SELECT id FROM dockets WHERE description LIKE '%SEED_DATA%'
);
DELETE FROM comments WHERE content LIKE '%SEED_DATA%';
DELETE FROM dockets WHERE description LIKE '%SEED_DATA%';
DELETE FROM agencies WHERE name LIKE '%SEED_%';
DELETE FROM tags WHERE name IN ('Transportation', 'Environment', 'Energy', 'Parks', 'Housing', 'Budget');

-- Create sample tags
INSERT INTO tags (id, name, description, color) VALUES
  (gen_random_uuid(), 'Transportation', 'Transportation and mobility projects', '#3B82F6'),
  (gen_random_uuid(), 'Environment', 'Environmental protection and sustainability', '#10B981'),
  (gen_random_uuid(), 'Energy', 'Energy infrastructure and policy', '#F59E0B'),
  (gen_random_uuid(), 'Parks', 'Parks and recreation facilities', '#8B5CF6'),
  (gen_random_uuid(), 'Housing', 'Housing development and policy', '#EF4444'),
  (gen_random_uuid(), 'Budget', 'Budget and financial planning', '#6B7280');

-- Create sample agencies
INSERT INTO agencies (id, name, slug, jurisdiction, description, contact_email, logo_url, created_at) VALUES
  (
    gen_random_uuid(),
    'SEED_California Department of Energy',
    'california-department-of-energy',
    'California',
    'Leading California''s clean energy transition and climate goals.',
    'public.info@energy.ca.gov',
    'https://images.pexels.com/photos/433308/pexels-photo-433308.jpeg?auto=compress&cs=tinysrgb&w=200',
    now() - interval '6 months'
  ),
  (
    gen_random_uuid(),
    'SEED_Florida Parks & Recreation Commission',
    'florida-parks-recreation-commission',
    'Florida',
    'Protecting and managing Florida''s natural resources and state parks.',
    'info@floridastateparks.org',
    'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=200',
    now() - interval '4 months'
  ),
  (
    gen_random_uuid(),
    'SEED_Denver Office of Transportation',
    'denver-office-of-transportation',
    'Denver, Colorado',
    'Building a safe, accessible, and sustainable transportation network for Denver.',
    'transportation@denvergov.org',
    'https://images.pexels.com/photos/280221/pexels-photo-280221.jpeg?auto=compress&cs=tinysrgb&w=200',
    now() - interval '8 months'
  );

-- Create sample dockets
WITH agency_ids AS (
  SELECT id, name FROM agencies WHERE name LIKE 'SEED_%'
)
INSERT INTO dockets (
  id, agency_id, title, description, summary, slug, status, 
  open_at, close_at, comment_deadline, tags, created_at
)
SELECT 
  gen_random_uuid(),
  a.id,
  d.title,
  d.description,
  d.summary,
  d.slug,
  d.status,
  d.open_at,
  d.close_at,
  d.comment_deadline,
  d.tags,
  d.created_at
FROM agency_ids a
CROSS JOIN (
  VALUES
    -- California Department of Energy dockets
    (
      'SEED_California Solar Incentive Program Expansion',
      'SEED_DATA: The California Department of Energy is proposing to expand the state solar incentive program to include additional residential and commercial properties. This expansion would increase rebates for solar installations and extend eligibility to multi-family housing developments.',
      'Proposed expansion of California''s solar incentive program to increase renewable energy adoption statewide.',
      'california-solar-incentive-program-expansion',
      'open',
      now() - interval '30 days',
      now() + interval '15 days',
      now() + interval '15 days',
      ARRAY['Energy', 'Environment'],
      now() - interval '30 days'
    ),
    (
      'SEED_Electric Vehicle Charging Infrastructure Standards',
      'SEED_DATA: New standards for electric vehicle charging infrastructure across California state facilities. The proposed regulations would require all new state buildings to include EV charging stations and establish minimum charging speeds for public facilities.',
      'Establishing statewide standards for electric vehicle charging infrastructure at state facilities.',
      'electric-vehicle-charging-infrastructure-standards',
      'closed',
      now() - interval '90 days',
      now() - interval '30 days',
      now() - interval '30 days',
      ARRAY['Transportation', 'Energy'],
      now() - interval '90 days'
    ),
    -- Florida Parks & Recreation dockets
    (
      'SEED_Everglades National Park Trail Expansion',
      'SEED_DATA: Florida Parks & Recreation Commission proposes expanding hiking and biking trails in Everglades National Park. The project includes 25 miles of new trails, improved visitor facilities, and enhanced wildlife viewing areas while maintaining environmental protection standards.',
      'Proposed expansion of recreational trails in Everglades National Park with enhanced visitor facilities.',
      'everglades-national-park-trail-expansion',
      'open',
      now() - interval '20 days',
      now() + interval '25 days',
      now() + interval '25 days',
      ARRAY['Parks', 'Environment'],
      now() - interval '20 days'
    ),
    (
      'SEED_State Beach Access Improvement Initiative',
      'SEED_DATA: Comprehensive plan to improve accessibility at Florida state beaches, including new boardwalks, accessible parking, and beach wheelchair availability. The initiative aims to ensure all visitors can enjoy Florida''s coastal resources.',
      'Initiative to improve accessibility and facilities at Florida state beaches.',
      'state-beach-access-improvement-initiative',
      'closed',
      now() - interval '120 days',
      now() - interval '60 days',
      now() - interval '60 days',
      ARRAY['Parks'],
      now() - interval '120 days'
    ),
    -- Denver Office of Transportation dockets
    (
      'SEED_Downtown Denver Bike Lane Network Expansion',
      'SEED_DATA: Denver Office of Transportation proposes a comprehensive expansion of the downtown bike lane network. The project includes protected bike lanes on major corridors, improved intersection safety, and integration with the existing transit system.',
      'Expansion of protected bike lanes throughout downtown Denver to improve cycling safety and connectivity.',
      'downtown-denver-bike-lane-network-expansion',
      'open',
      now() - interval '10 days',
      now() + interval '35 days',
      now() + interval '35 days',
      ARRAY['Transportation'],
      now() - interval '10 days'
    ),
    (
      'SEED_Regional Transit Bus Rapid Transit Study',
      'SEED_DATA: Feasibility study for implementing Bus Rapid Transit (BRT) along major Denver corridors. The study examines potential routes, station locations, and integration with existing light rail and bus services.',
      'Feasibility study for Bus Rapid Transit implementation in the Denver metropolitan area.',
      'regional-transit-bus-rapid-transit-study',
      'closed',
      now() - interval '150 days',
      now() - interval '90 days',
      now() - interval '90 days',
      ARRAY['Transportation', 'Budget'],
      now() - interval '150 days'
    )
) AS d(title, description, summary, slug, status, open_at, close_at, comment_deadline, tags, created_at)
WHERE (a.name LIKE '%California%' AND d.title LIKE '%California%')
   OR (a.name LIKE '%Florida%' AND d.title LIKE '%Everglades%' OR d.title LIKE '%Beach%')
   OR (a.name LIKE '%Denver%' AND d.title LIKE '%Denver%' OR d.title LIKE '%Transit%');

-- Link dockets to tags
INSERT INTO docket_tags (docket_id, tag_id)
SELECT d.id, t.id
FROM dockets d
CROSS JOIN tags t
WHERE d.title LIKE 'SEED_%'
  AND (
    (d.title LIKE '%Solar%' AND t.name IN ('Energy', 'Environment'))
    OR (d.title LIKE '%Electric Vehicle%' AND t.name IN ('Transportation', 'Energy'))
    OR (d.title LIKE '%Everglades%' AND t.name IN ('Parks', 'Environment'))
    OR (d.title LIKE '%Beach%' AND t.name = 'Parks')
    OR (d.title LIKE '%Bike Lane%' AND t.name = 'Transportation')
    OR (d.title LIKE '%Transit%' AND t.name IN ('Transportation', 'Budget'))
  );

-- Create sample comments
WITH docket_data AS (
  SELECT id, title FROM dockets WHERE title LIKE 'SEED_%'
),
comment_templates AS (
  SELECT * FROM (VALUES
    -- Solar program comments
    ('Sarah Johnson', 'Homeowners Association of Sacramento', 'support', 'SEED_DATA: I strongly support the expansion of the solar incentive program. As a homeowner who recently installed solar panels, I can attest to the significant reduction in energy costs and environmental impact. The expanded program will make solar accessible to more families and help California meet its climate goals.'),
    ('Michael Chen', 'California Solar Industry Association', 'support', 'SEED_DATA: This expansion is crucial for California''s renewable energy future. The inclusion of multi-family housing will help address equity concerns and ensure that renters and lower-income residents can also benefit from clean energy. We recommend increasing the rebate amounts for disadvantaged communities.'),
    ('Lisa Rodriguez', null, 'neutral', 'SEED_DATA: While I support renewable energy, I''m concerned about the program''s cost to taxpayers. The proposal should include more detailed cost-benefit analysis and ensure that the incentives are targeted effectively to maximize environmental benefits per dollar spent.'),
    ('David Park', 'Environmental Defense Fund', 'support', 'SEED_DATA: The solar incentive expansion aligns perfectly with California''s climate commitments. However, we urge the department to include energy storage incentives as well, as battery storage is essential for maximizing the grid benefits of distributed solar generation.'),
    ('Jennifer Adams', null, 'oppose', 'SEED_DATA: I oppose this expansion due to concerns about grid stability and cost shifting to non-solar customers. The program should be reformed to address these issues before expansion, including time-of-use rates that better reflect the true value of solar generation.'),
    
    -- EV charging comments
    ('Robert Wilson', 'California Electric Vehicle Association', 'support', 'SEED_DATA: Mandatory EV charging at state facilities is a necessary step toward transportation electrification. The standards should require Level 2 charging at minimum, with DC fast charging at high-traffic locations. This will help normalize EV infrastructure and encourage adoption.'),
    ('Maria Gonzalez', null, 'support', 'SEED_DATA: As an EV owner, I fully support this proposal. Having reliable charging at state buildings would eliminate range anxiety for many trips. Please ensure the charging stations are accessible to all vehicle types and include payment options for non-state employees.'),
    ('James Thompson', 'Taxpayers Association', 'neutral', 'SEED_DATA: While EV infrastructure is important, the cost to taxpayers must be carefully considered. The proposal should include lifecycle cost analysis and explore partnerships with private charging companies to reduce public expense while achieving the same goals.'),
    
    -- Everglades trails comments
    ('Amanda Foster', 'Florida Audubon Society', 'support', 'SEED_DATA: The trail expansion will provide excellent opportunities for wildlife education and eco-tourism. However, we strongly recommend conducting thorough environmental impact assessments and ensuring trails are designed to minimize disruption to sensitive habitats and wildlife corridors.'),
    ('Carlos Mendez', null, 'support', 'SEED_DATA: As a frequent visitor to the Everglades, I''m excited about the new trails. The current trail system is often overcrowded, and expansion will help distribute visitor impact. Please include interpretive signage about the unique ecosystem and conservation efforts.'),
    ('Patricia Lee', 'Everglades Foundation', 'neutral', 'SEED_DATA: While we support increased public access, any trail expansion must prioritize ecosystem protection. We recommend limiting trail construction to already disturbed areas and implementing strict visitor guidelines to protect this fragile environment.'),
    
    -- Beach access comments
    ('Thomas Brown', 'Disability Rights Florida', 'support', 'SEED_DATA: This initiative is long overdue. Florida''s beaches should be accessible to all residents and visitors. The beach wheelchair program is particularly important, but please ensure adequate maintenance and availability. Consider partnering with local disability organizations for ongoing input.'),
    ('Nancy White', null, 'support', 'SEED_DATA: Improved beach access will benefit families with young children and elderly visitors as well. The boardwalks should be designed to handle Florida''s weather conditions and include rest areas with shade. This investment will pay dividends in tourism and quality of life.'),
    
    -- Denver bike lanes comments
    ('Kevin Martinez', 'Denver Bicycle Lobby', 'support', 'SEED_DATA: Protected bike lanes are essential for cyclist safety in downtown Denver. The current infrastructure forces cyclists to share lanes with cars, creating dangerous conditions. This expansion will encourage more people to bike for transportation, reducing traffic and emissions.'),
    ('Rachel Green', null, 'support', 'SEED_DATA: As a daily bike commuter, I strongly support this proposal. The protected lanes on 15th Street have made a huge difference in safety and comfort. Expanding this network will create a truly connected system that makes cycling a viable option for more trips.'),
    ('Mark Davis', 'Denver Chamber of Commerce', 'neutral', 'SEED_DATA: While we support sustainable transportation, we''re concerned about the impact on parking and loading zones for businesses. The design should carefully balance cyclist safety with the needs of downtown businesses and their customers.'),
    ('Susan Taylor', null, 'oppose', 'SEED_DATA: I oppose removing car lanes for bike lanes. Downtown traffic is already congested, and reducing vehicle capacity will make it worse. The city should focus on improving existing bike paths in parks rather than impacting major streets.'),
    
    -- BRT study comments
    ('Daniel Kim', 'Transit Alliance', 'support', 'SEED_DATA: Bus Rapid Transit is exactly what Denver needs to improve transit efficiency and ridership. The study should prioritize corridors with the highest ridership potential and ensure BRT stations integrate seamlessly with existing light rail connections.'),
    ('Michelle Johnson', null, 'support', 'SEED_DATA: BRT would be a game-changer for my daily commute. Current bus service is too slow and unreliable. Dedicated lanes and level boarding would make transit competitive with driving. Please include frequent service in the design - every 10 minutes or better.'),
    ('Christopher Lee', 'Colfax Business Association', 'neutral', 'SEED_DATA: We support improved transit but are concerned about construction impacts on Colfax businesses. The implementation plan should include measures to maintain business access and customer parking during construction, with compensation for lost revenue if necessary.')
  ) AS t(name, org, pos, content)
)
INSERT INTO comments (
  id, docket_id, user_id, content, status, commenter_name, commenter_organization, 
  position, body, created_at
)
SELECT 
  gen_random_uuid(),
  d.id,
  (SELECT id FROM profiles LIMIT 1), -- Use first available profile
  ct.content,
  'published',
  ct.name,
  ct.org,
  ct.pos,
  ct.content,
  d.created_at + (random() * (now() - d.created_at))
FROM docket_data d
CROSS JOIN comment_templates ct
WHERE (
  (d.title LIKE '%Solar%' AND ct.content LIKE '%solar%')
  OR (d.title LIKE '%Electric Vehicle%' AND ct.content LIKE '%EV%')
  OR (d.title LIKE '%Everglades%' AND ct.content LIKE '%Everglades%')
  OR (d.title LIKE '%Beach%' AND ct.content LIKE '%beach%')
  OR (d.title LIKE '%Bike Lane%' AND ct.content LIKE '%bike%')
  OR (d.title LIKE '%Transit%' AND ct.content LIKE '%BRT%' OR ct.content LIKE '%transit%')
);

-- Add additional comments to reach 60+ total
WITH docket_data AS (
  SELECT id, title FROM dockets WHERE title LIKE 'SEED_%'
),
additional_comments AS (
  SELECT * FROM (VALUES
    ('John Smith', null, 'support', 'SEED_DATA: This is an excellent initiative that will benefit our community for years to come.'),
    ('Mary Johnson', 'Local Residents Group', 'support', 'SEED_DATA: Our neighborhood association fully endorses this proposal and looks forward to its implementation.'),
    ('Robert Davis', null, 'neutral', 'SEED_DATA: I have mixed feelings about this proposal. While the goals are admirable, I''m concerned about the implementation timeline and costs.'),
    ('Linda Wilson', 'Community Action Network', 'support', 'SEED_DATA: This proposal addresses a critical need in our community. We urge quick approval and implementation.'),
    ('William Brown', null, 'unclear', 'SEED_DATA: I need more information about how this will affect property values and local traffic patterns before I can form an opinion.'),
    ('Elizabeth Taylor', null, 'support', 'SEED_DATA: As a parent of young children, I believe this proposal will make our community safer and more livable.'),
    ('Charles Anderson', 'Business Owners Association', 'neutral', 'SEED_DATA: We support the general concept but request more detailed analysis of the economic impacts on local businesses.'),
    ('Barbara Martinez', null, 'support', 'SEED_DATA: This is exactly the kind of forward-thinking policy we need. I hope other jurisdictions will follow this example.'),
    ('Richard Garcia', null, 'oppose', 'SEED_DATA: I believe this proposal is premature and lacks sufficient public input. More community meetings should be held before proceeding.'),
    ('Patricia Rodriguez', 'Environmental Justice Coalition', 'support', 'SEED_DATA: This proposal will help address environmental inequities in our community. We strongly support its approval.')
  ) AS t(name, org, pos, content)
)
INSERT INTO comments (
  id, docket_id, user_id, content, status, commenter_name, commenter_organization, 
  position, body, created_at
)
SELECT 
  gen_random_uuid(),
  d.id,
  (SELECT id FROM profiles LIMIT 1),
  ac.content,
  'published',
  ac.name,
  ac.org,
  ac.pos,
  ac.content,
  d.created_at + (random() * (now() - d.created_at))
FROM docket_data d
CROSS JOIN additional_comments ac;

-- Create sample attachments (metadata only)
WITH comment_data AS (
  SELECT id FROM comments WHERE content LIKE '%SEED_DATA%' ORDER BY random() LIMIT 15
)
INSERT INTO attachments (id, comment_id, filename, file_url, mime_type, file_size, created_at)
SELECT 
  gen_random_uuid(),
  c.id,
  CASE (random() * 4)::int
    WHEN 0 THEN 'supporting_document.pdf'
    WHEN 1 THEN 'cost_analysis.xlsx'
    WHEN 2 THEN 'community_petition.pdf'
    ELSE 'environmental_impact_photos.zip'
  END,
  'https://example.com/placeholder-file',
  CASE (random() * 4)::int
    WHEN 0 THEN 'application/pdf'
    WHEN 1 THEN 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    WHEN 2 THEN 'application/pdf'
    ELSE 'application/zip'
  END,
  (random() * 5000000 + 100000)::bigint, -- 100KB to 5MB
  now()
FROM comment_data c;

-- Update comment counts and verify data
DO $$
DECLARE
  agency_count int;
  docket_count int;
  comment_count int;
  attachment_count int;
BEGIN
  SELECT COUNT(*) INTO agency_count FROM agencies WHERE name LIKE 'SEED_%';
  SELECT COUNT(*) INTO docket_count FROM dockets WHERE title LIKE 'SEED_%';
  SELECT COUNT(*) INTO comment_count FROM comments WHERE content LIKE '%SEED_DATA%';
  SELECT COUNT(*) INTO attachment_count FROM attachments WHERE filename LIKE '%.pdf' OR filename LIKE '%.xlsx' OR filename LIKE '%.zip';
  
  RAISE NOTICE 'Seed data created successfully:';
  RAISE NOTICE '- Agencies: %', agency_count;
  RAISE NOTICE '- Dockets: %', docket_count;
  RAISE NOTICE '- Comments: %', comment_count;
  RAISE NOTICE '- Attachments: %', attachment_count;
END $$;