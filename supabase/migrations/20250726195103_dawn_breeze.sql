/*
  # Create dockets table

  1. New Tables
    - `dockets`
      - `id` (uuid, primary key)
      - `agency_id` (uuid, references profiles.id)
      - `title` (text)
      - `description` (text)
      - `status` (text, 'draft', 'open', 'closed')
      - `comment_deadline` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `dockets` table
    - Add policy for agencies to manage their own dockets
    - Add policy for public to read open dockets
*/

CREATE TABLE IF NOT EXISTS dockets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  status text NOT NULL CHECK (status IN ('draft', 'open', 'closed')) DEFAULT 'draft',
  comment_deadline timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE dockets ENABLE ROW LEVEL SECURITY;

-- Policy for agencies to manage their own dockets
CREATE POLICY "Agencies can manage own dockets"
  ON dockets
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'agency'
      AND profiles.id = dockets.agency_id
    )
  );

-- Policy for public to read open dockets
CREATE POLICY "Public can read open dockets"
  ON dockets
  FOR SELECT
  TO authenticated, anon
  USING (status = 'open');

-- Trigger to update updated_at on docket changes
DROP TRIGGER IF EXISTS update_dockets_updated_at ON dockets;
CREATE TRIGGER update_dockets_updated_at
  BEFORE UPDATE ON dockets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();