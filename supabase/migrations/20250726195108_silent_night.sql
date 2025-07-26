/*
  # Create comments table

  1. New Tables
    - `comments`
      - `id` (uuid, primary key)
      - `docket_id` (uuid, references dockets.id)
      - `user_id` (uuid, references profiles.id)
      - `content` (text)
      - `status` (text, 'submitted', 'under_review', 'published')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `comments` table
    - Add policy for users to read their own comments
    - Add policy for users to create comments on open dockets
    - Add policy for agencies to read comments on their dockets
*/

CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  docket_id uuid NOT NULL REFERENCES dockets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  status text NOT NULL CHECK (status IN ('submitted', 'under_review', 'published')) DEFAULT 'submitted',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own comments
CREATE POLICY "Users can read own comments"
  ON comments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for users to create comments on open dockets
CREATE POLICY "Users can create comments on open dockets"
  ON comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM dockets 
      WHERE dockets.id = comments.docket_id 
      AND dockets.status = 'open'
      AND dockets.comment_deadline > now()
    )
    AND auth.uid() = user_id
  );

-- Policy for agencies to read comments on their dockets
CREATE POLICY "Agencies can read comments on own dockets"
  ON comments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dockets 
      JOIN profiles ON profiles.id = dockets.agency_id
      WHERE dockets.id = comments.docket_id 
      AND profiles.id = auth.uid()
      AND profiles.role = 'agency'
    )
  );

-- Policy for agencies to update comment status on their dockets
CREATE POLICY "Agencies can update comment status on own dockets"
  ON comments
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dockets 
      JOIN profiles ON profiles.id = dockets.agency_id
      WHERE dockets.id = comments.docket_id 
      AND profiles.id = auth.uid()
      AND profiles.role = 'agency'
    )
  );

-- Trigger to update updated_at on comment changes
DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();