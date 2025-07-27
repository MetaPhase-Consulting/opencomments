/*
  # Contact Support System

  1. New Tables
    - `contact_submissions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, nullable - for logged in users)
      - `name` (text, required)
      - `email` (text, required)
      - `organization` (text, optional)
      - `subject` (text, required)
      - `category` (text, required)
      - `message` (text, required)
      - `priority` (text, default 'normal')
      - `status` (text, default 'open')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `contact_submissions` table
    - Add policy for users to read their own submissions
    - Add policy for support staff to read all submissions

  3. Indexes
    - Index on email for support staff lookup
    - Index on category for filtering
    - Index on status for queue management
*/

-- Create contact submission categories enum
CREATE TYPE contact_category AS ENUM (
  'technical_support',
  'account_access',
  'agency_setup',
  'feature_request',
  'bug_report',
  'general_inquiry',
  'training_request',
  'billing_question'
);

-- Create contact submission status enum
CREATE TYPE contact_status AS ENUM (
  'open',
  'in_progress',
  'resolved',
  'closed'
);

-- Create contact submission priority enum
CREATE TYPE contact_priority AS ENUM (
  'low',
  'normal',
  'high',
  'urgent'
);

-- Create contact submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text NOT NULL,
  organization text,
  subject text NOT NULL,
  category contact_category NOT NULL,
  message text NOT NULL,
  priority contact_priority DEFAULT 'normal',
  status contact_status DEFAULT 'open',
  user_agent text,
  ip_address inet,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own submissions"
  ON contact_submissions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create submissions"
  ON contact_submissions
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Support staff can read all submissions"
  ON contact_submissions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'agency'
      AND email LIKE '%@opencomments.us'
    )
  );

-- Create indexes
CREATE INDEX idx_contact_submissions_email ON contact_submissions(email);
CREATE INDEX idx_contact_submissions_category ON contact_submissions(category);
CREATE INDEX idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX idx_contact_submissions_created_at ON contact_submissions(created_at);
CREATE INDEX idx_contact_submissions_user_id ON contact_submissions(user_id);

-- Create updated_at trigger
CREATE TRIGGER update_contact_submissions_updated_at
  BEFORE UPDATE ON contact_submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();