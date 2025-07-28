/*
  # Add Agency Slug Support

  1. Updates
    - Add sample agencies with proper slugs
    - Add sample dockets with slugs
    - Update existing data for testing
  
  2. Data
    - Realistic agency names and jurisdictions
    - Proper slug generation
    - Sample dockets with various statuses
*/

-- Insert sample agencies if they don't exist
INSERT INTO agencies (id, name, jurisdiction, description, logo_url, created_at, updated_at)
VALUES 
  (
    'a1111111-1111-1111-1111-111111111111',
    'Colorado Department of Transportation',
    'Colorado',
    'The Colorado Department of Transportation (CDOT) develops, maintains and operates the state highway system and administers state and federal funding for other modes of transportation.',
    NULL,
    NOW(),
    NOW()
  ),
  (
    'a2222222-2222-2222-2222-222222222222',
    'City of Denver',
    'Denver, Colorado',
    'The City and County of Denver is the capital and most populous city of Colorado. We provide municipal services to over 700,000 residents.',
    NULL,
    NOW(),
    NOW()
  ),
  (
    'a3333333-3333-3333-3333-333333333333',
    'New York Department of Health',
    'New York',
    'The New York State Department of Health works to protect and promote the health of all New Yorkers through prevention, science and the assurance of quality health care delivery.',
    NULL,
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- Insert sample dockets with proper slugs
INSERT INTO dockets (
  id, 
  agency_id, 
  title, 
  description, 
  summary,
  slug, 
  status, 
  open_at, 
  close_at, 
  tags,
  created_at, 
  updated_at
)
VALUES 
  (
    'd1111111-1111-1111-1111-111111111111',
    'a1111111-1111-1111-1111-111111111111',
    'Electric Vehicle Charging Infrastructure Plan',
    'CDOT is seeking public input on the statewide plan for electric vehicle charging infrastructure along major highways and in rural communities. This plan will guide the deployment of charging stations over the next 10 years.',
    'Public comment period for Colorado''s comprehensive electric vehicle charging infrastructure plan.',
    'ev-charging-infrastructure-plan',
    'open',
    NOW() - INTERVAL '10 days',
    NOW() + INTERVAL '20 days',
    ARRAY['Transportation', 'Environment', 'Infrastructure'],
    NOW(),
    NOW()
  ),
  (
    'd2222222-2222-2222-2222-222222222222',
    'a2222222-2222-2222-2222-222222222222',
    'Downtown Denver Zoning Code Updates',
    'The City of Denver is proposing updates to the downtown zoning code to encourage mixed-use development, affordable housing, and sustainable transportation options.',
    'Proposed changes to downtown Denver zoning regulations.',
    'downtown-zoning-updates',
    'open',
    NOW() - INTERVAL '5 days',
    NOW() + INTERVAL '25 days',
    ARRAY['Zoning', 'Housing', 'Urban Planning'],
    NOW(),
    NOW()
  ),
  (
    'd3333333-3333-3333-3333-333333333333',
    'a3333333-3333-3333-3333-333333333333',
    'Public Health Emergency Preparedness Plan',
    'The New York Department of Health is updating its emergency preparedness plan based on lessons learned from recent public health emergencies. We are seeking input from healthcare providers, community organizations, and the public.',
    'Updates to New York''s public health emergency response protocols.',
    'emergency-preparedness-plan',
    'closed',
    NOW() - INTERVAL '60 days',
    NOW() - INTERVAL '10 days',
    ARRAY['Health', 'Emergency Management', 'Public Safety'],
    NOW(),
    NOW()
  ),
  (
    'd4444444-4444-4444-4444-444444444444',
    'a1111111-1111-1111-1111-111111111111',
    'Highway 36 Expansion Environmental Impact',
    'Environmental impact assessment for the proposed expansion of Highway 36 between Denver and Boulder. This project aims to reduce congestion while minimizing environmental impact.',
    'Environmental review for Highway 36 expansion project.',
    'highway-36-expansion-impact',
    'archived',
    NOW() - INTERVAL '120 days',
    NOW() - INTERVAL '60 days',
    ARRAY['Transportation', 'Environment'],
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- Add some sample comments
INSERT INTO comments (
  id,
  docket_id,
  user_id,
  content,
  status,
  commenter_name,
  commenter_organization,
  created_at,
  updated_at
)
VALUES 
  (
    'c1111111-1111-1111-1111-111111111111',
    'd1111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'I strongly support the expansion of EV charging infrastructure throughout Colorado. As an electric vehicle owner, I often worry about range anxiety when traveling to rural areas. This plan would make EV ownership much more practical for all Coloradans.',
    'published',
    'Sarah Johnson',
    NULL,
    NOW() - INTERVAL '8 days',
    NOW() - INTERVAL '8 days'
  ),
  (
    'c2222222-2222-2222-2222-222222222222',
    'd1111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'While I support EV infrastructure, I am concerned about the cost to taxpayers. The plan should include detailed cost-benefit analysis and explore public-private partnerships to reduce the burden on state funds.',
    'published',
    'Michael Chen',
    'Colorado Taxpayers Association',
    NOW() - INTERVAL '6 days',
    NOW() - INTERVAL '6 days'
  ),
  (
    'c3333333-3333-3333-3333-333333333333',
    'd2222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333',
    'The proposed zoning changes are a step in the right direction for addressing Denver''s housing crisis. However, I urge the city to include stronger affordability requirements to ensure that new development benefits all residents, not just high-income earners.',
    'published',
    'Maria Rodriguez',
    'Denver Housing Coalition',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days'
  )
ON CONFLICT (id) DO NOTHING;

-- Update search vectors for new dockets
UPDATE dockets SET search_vector = 
  setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(description, '')), 'B') ||
  setweight(to_tsvector('english', array_to_string(tags, ' ')), 'C')
WHERE search_vector IS NULL;

-- Update search vectors for new comments
UPDATE comments SET search_vector = 
  setweight(to_tsvector('english', COALESCE(content, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(commenter_name, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(commenter_organization, '')), 'C')
WHERE search_vector IS NULL;