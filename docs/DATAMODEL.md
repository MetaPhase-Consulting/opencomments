# DATA MODEL GUIDE

This document describes the complete database schema, relationships, and data flow patterns used in OpenComments.

## 🗄️ Database Overview

OpenComments uses PostgreSQL with Supabase's Row Level Security (RLS) to ensure multi-tenant data isolation and security. Every table implements soft deletes and audit trails for compliance.

## 📋 Core Entities

### User Management

**profiles**
```sql
id              uuid PRIMARY KEY (references auth.users)
email           text UNIQUE NOT NULL
role            text CHECK (role IN ('public', 'agency'))
full_name       text
agency_name     text
created_at      timestamptz DEFAULT now()
updated_at      timestamptz DEFAULT now()
```
*User profiles extending Supabase auth with role information*

**agencies**
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
name            text NOT NULL
jurisdiction    text
description     text
logo_url        text
settings        jsonb DEFAULT '{}'
created_at      timestamptz DEFAULT now()
updated_at      timestamptz DEFAULT now()
```
*Government agencies that manage comment periods*

**agency_members**
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
agency_id       uuid REFERENCES agencies(id)
user_id         uuid REFERENCES profiles(id)
role            agency_role DEFAULT 'reviewer'
invited_by      uuid REFERENCES profiles(id)
joined_at       timestamptz DEFAULT now()
created_at      timestamptz DEFAULT now()
updated_at      timestamptz DEFAULT now()
```
*Many-to-many relationship between users and agencies with roles*

## 🔧 Platform Administration

### Platform Roles

**platform_roles**
```sql
user_id         uuid PRIMARY KEY (references profiles)
role            text CHECK (role IN ('super_owner', 'super_user'))
created_at      timestamptz DEFAULT now()
created_by      uuid REFERENCES profiles(id)
updated_at      timestamptz DEFAULT now()
updated_by      uuid REFERENCES profiles(id)
```
*Platform-level administrative roles for system management*

### Platform Role Definitions

**Super Owner**
- Full access to all agency data, users, roles, and comments
- Can change any role (including agency Owner)
- Can create new agencies and invite first user
- Can invite and remove Super Users
- Can impersonate agency users (optional)
- Restricted to approved email domains (@metaphaseconsulting.com, @metaphase.tech, @opencomments.us)

**Super User**
- Can create new agencies
- Can invite first Owner to a new agency
- Can invite additional users to existing agencies (except cannot assign/change Owner)
- Cannot see agency content (dockets, comments, settings)
- Restricted to approved email domains (@metaphaseconsulting.com, @metaphase.tech, @opencomments.us)

### Platform Functions

**create_agency_with_owner()**
- Creates new agency with initial owner
- Validates government email domains (.gov, .edu)
- Generates unique public slug
- Sets up initial agency member relationship

**platform_invite_user_to_agency()**
- Invites users to existing agencies
- Creates user profile if doesn't exist
- Enforces role restrictions (Super Users cannot assign Owner role)
- Sets up agency membership

### Security Model

**Domain Restrictions**
- Platform roles restricted to approved domains only
- Government agencies must use .gov or .edu domains
- Email domain validation enforced at database level

**Access Control**
- Row Level Security (RLS) enforces platform role permissions
- Super Owners can access all agency data
- Super Users limited to agency creation and user invitation
- Platform role checks integrated throughout application

### Comment System

**dockets**
```sql
id                  uuid PRIMARY KEY DEFAULT gen_random_uuid()
agency_id           uuid REFERENCES agencies(id)
title               text NOT NULL
description         text NOT NULL
summary             text
slug                text UNIQUE
reference_code      text
tags                text[] DEFAULT '{}'
status              docket_status DEFAULT 'draft'
comment_deadline    timestamptz NOT NULL
open_at             timestamptz
close_at            timestamptz
settings            jsonb DEFAULT '{}'
auto_publish        boolean DEFAULT false
require_captcha     boolean DEFAULT true
max_file_size_mb    integer DEFAULT 10
allowed_file_types  text[] DEFAULT ARRAY['pdf','docx','jpg','png']
search_vector       tsvector
created_at          timestamptz DEFAULT now()
updated_at          timestamptz DEFAULT now()
```
*Comment periods/dockets managed by agencies*

**comments**
```sql
id                      uuid PRIMARY KEY DEFAULT gen_random_uuid()
docket_id               uuid REFERENCES dockets(id)
user_id                 uuid REFERENCES profiles(id)
content                 text NOT NULL
status                  comment_status DEFAULT 'submitted'
commenter_name          text
commenter_email         text
commenter_organization  text
oauth_provider          text
oauth_uid               text
geo_country             text
content_hash            text
captcha_token           text
ip_address              inet
user_agent              text
search_vector           tsvector
created_at              timestamptz DEFAULT now()
updated_at              timestamptz DEFAULT now()
```
*Public comments submitted on dockets*

**commenter_info**
```sql
id                      uuid PRIMARY KEY DEFAULT gen_random_uuid()
comment_id              uuid REFERENCES comments(id)
representation          text CHECK (representation IN ('myself', 'organization', 'behalf_of_another'))
organization_name       text
authorization_statement text
perjury_certified       boolean NOT NULL DEFAULT false
certification_timestamp timestamptz DEFAULT now()
created_at              timestamptz DEFAULT now()
```
*Commenter representation and legal certification data*

**comment_rate_limits**
```sql
id                      uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id                 uuid
ip_address              inet
docket_id               uuid REFERENCES dockets(id)
submission_count        integer DEFAULT 1
last_submission         timestamptz DEFAULT now()
created_at              timestamptz DEFAULT now()
updated_at              timestamptz DEFAULT now()
```
*Anti-spam rate limiting tracking*
### File Management

**comment_attachments**
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
comment_id      uuid REFERENCES comments(id)
filename        text NOT NULL
file_url        text NOT NULL
file_path       text NOT NULL
mime_type       text NOT NULL
file_size       bigint NOT NULL
created_at      timestamptz DEFAULT now()
```
*Files uploaded with comments*

**docket_attachments**
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
docket_id       uuid REFERENCES dockets(id)
filename        text NOT NULL
file_url        text NOT NULL
file_size       bigint NOT NULL
mime_type       text NOT NULL
uploaded_by     uuid REFERENCES profiles(id)
created_at      timestamptz DEFAULT now()
```
*Supporting documents for dockets*

## 🔗 Relationships

### Entity Relationship Diagram

```
agencies ──┬── agency_members ──── profiles
           │
           └── dockets ──┬── comments ──── comment_attachments
                         │
                         └── docket_attachments
```

### Key Relationships

**One-to-Many**
- Agency → Dockets (one agency has many dockets)
- Docket → Comments (one docket has many comments)
- Comment → Attachments (one comment has many attachments)

**Many-to-Many**
- Users ↔ Agencies (via agency_members with roles)

**Self-Referencing**
- agency_members.invited_by → profiles.id

## 🔐 Row Level Security (RLS)

### Security Principles

**Agency Isolation**
- Users can only access data from agencies they belong to
- Public users can only see published comments on open dockets
- No cross-agency data leakage

**Role-Based Access**
- Viewer: Read-only access to agency data
- Reviewer: Can moderate comments
- Manager: Can create and manage dockets
- Admin: Can manage users and settings
- Owner: Full agency control

### RLS Policy Examples

**Dockets Table**
```sql
-- Agency members can read dockets
CREATE POLICY "Agency members can read dockets" ON dockets
FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM agency_members 
  WHERE agency_id = dockets.agency_id 
  AND user_id = auth.uid()
));

-- Public can read open dockets
CREATE POLICY "Public can read open dockets" ON dockets
FOR SELECT TO anon, authenticated
USING (status = 'open');
```

**Comments Table**
```sql
-- Users can read own comments
CREATE POLICY "Users can read own comments" ON comments
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Agency members can read comments on agency dockets
CREATE POLICY "Agency members can read comments" ON comments
FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM dockets d
  JOIN agency_members am ON am.agency_id = d.agency_id
  WHERE d.id = comments.docket_id 
  AND am.user_id = auth.uid()
));
```

## 📊 Data Types & Enums

### Custom Types

**agency_role**
```sql
CREATE TYPE agency_role AS ENUM (
  'owner',
  'admin', 
  'manager',
  'reviewer',
  'viewer'
);
```

**comment_status**
```sql
CREATE TYPE comment_status AS ENUM (
  'submitted',
  'under_review',
  'published',
  'rejected',
  'flagged'
);
```

**docket_status**
```sql
CREATE TYPE docket_status AS ENUM (
  'draft',
  'open',
  'closed',
  'archived'
);
```

## 🔍 Search & Indexing

### Full-Text Search

**Search Vectors**
- `dockets.search_vector`: Title + description + tags
- `comments.search_vector`: Content + commenter info

**Indexes**
```sql
-- GIN indexes for full-text search
CREATE INDEX idx_dockets_search_vector ON dockets USING gin(search_vector);
CREATE INDEX idx_comments_search_vector ON comments USING gin(search_vector);

-- Performance indexes
CREATE INDEX idx_comments_docket_id ON comments(docket_id);
CREATE INDEX idx_comments_status ON comments(status);
CREATE INDEX idx_dockets_agency_id ON dockets(agency_id);
CREATE INDEX idx_dockets_status ON dockets(status);
```

### Search Functions

**Update Search Vectors**
```sql
CREATE OR REPLACE FUNCTION update_docket_search_vector()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', array_to_string(NEW.tags, ' ')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## 📈 Analytics & Reporting

### Materialized Views

**Agency Statistics**
```sql
CREATE MATERIALIZED VIEW agency_stats AS
SELECT 
  a.id as agency_id,
  a.name as agency_name,
  COUNT(DISTINCT d.id) as total_dockets,
  COUNT(DISTINCT CASE WHEN d.status = 'open' THEN d.id END) as open_dockets,
  COUNT(DISTINCT c.id) as total_comments,
  COUNT(DISTINCT CASE WHEN c.status = 'published' THEN c.id END) as published_comments
FROM agencies a
LEFT JOIN dockets d ON d.agency_id = a.id
LEFT JOIN comments c ON c.docket_id = d.id
WHERE a.deleted_at IS NULL
GROUP BY a.id, a.name;
```

### Export Tables

**exports**
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
agency_id       uuid REFERENCES agencies(id)
docket_id       uuid REFERENCES dockets(id) -- NULL for multi-docket exports
export_type     export_type NOT NULL
filters_json    jsonb
file_url        text
file_path       text
size_bytes      bigint DEFAULT 0
status          export_status DEFAULT 'pending'
progress_percent integer DEFAULT 0
error_message   text
expires_at      timestamptz DEFAULT (now() + interval '24 hours')
created_by      uuid REFERENCES profiles(id)
created_at      timestamptz DEFAULT now()
updated_at      timestamptz DEFAULT now()
```

## 🔄 Data Flow Patterns

### Comment Submission Flow

1. **Public Submission**
   - User submits comment via public form
   - Comment stored with status 'submitted'
   - Files uploaded to comment_attachments bucket
   - Search vector generated automatically

2. **Moderation Process**
   - Agency staff reviews in moderation queue
   - Status updated to 'published', 'rejected', or 'flagged'
   - Moderation actions logged for audit

3. **Public Display**
   - Only 'published' comments visible to public
   - Comments displayed with docket information
   - Attachments available via signed URLs

### Export Generation Flow

1. **Export Request**
   - User initiates export from UI
   - Export job created with 'pending' status
   - Background function triggered

2. **Processing**
   - Edge function queries database
   - CSV generated with comment data
   - ZIP created with attachment files
   - Files uploaded to exports bucket

3. **Completion**
   - Export status updated to 'completed'
   - Download URL generated with expiry
   - User notified of completion

## 🛡️ Data Integrity

### Constraints

**Foreign Key Constraints**
- All references properly constrained
- Cascade deletes where appropriate
- Prevent orphaned records

**Check Constraints**
- Enum values enforced at database level
- File size limits validated
- Email format validation

### Triggers

**Automatic Timestamps**
```sql
CREATE TRIGGER update_updated_at_column
BEFORE UPDATE ON table_name
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**Search Vector Updates**
```sql
CREATE TRIGGER trigger_update_docket_search_vector
BEFORE INSERT OR UPDATE ON dockets
FOR EACH ROW EXECUTE FUNCTION update_docket_search_vector();
```

## 🔄 Migration Strategy

### Schema Evolution

**Migration Principles**
- Never modify existing migrations
- Always create new migration files
- Include rollback instructions
- Test on sample data first

**Migration Template**
```sql
/*
  # Migration Title
  
  1. New Tables
     - table_name: description
  
  2. Changes
     - Modified columns
     - New indexes
  
  3. Security
     - RLS policies
     - Permission updates
*/

-- Migration SQL here
```

### Data Migration

**Large Data Changes**
- Use batched updates for large tables
- Monitor performance during migration
- Plan for downtime if necessary
- Have rollback plan ready

## 📊 Performance Considerations

### Query Optimization

**Efficient Queries**
- Use appropriate indexes
- Avoid N+1 query problems
- Implement pagination for large datasets
- Use materialized views for complex aggregations

**Connection Management**
- Connection pooling enabled
- Query timeout limits
- Resource usage monitoring

### Storage Optimization

**File Storage**
- Automatic compression for exports
- CDN for global file distribution
- Lifecycle policies for old files
- Storage usage monitoring

---

**See also**: [ARCHITECTURE.md](ARCHITECTURE.md), [DEVELOPER.md](DEVELOPER.md)