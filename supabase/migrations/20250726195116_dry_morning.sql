/*
  # Create saved dockets table

  1. New Tables
    - `saved_dockets`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles.id)
      - `docket_id` (uuid, references dockets.id)
      - `saved_at` (timestamp)

  2. Security
    - Enable RLS on `saved_dockets` table
    - Add policy for users to manage their own saved dockets
*/

CREATE TABLE IF NOT EXISTS saved_dockets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  docket_id uuid NOT NULL REFERENCES dockets(id) ON DELETE CASCADE,
  saved_at timestamptz DEFAULT now(),
  UNIQUE(user_id, docket_id)
);

ALTER TABLE saved_dockets ENABLE ROW LEVEL SECURITY;

-- Policy for users to manage their own saved dockets
CREATE POLICY "Users can manage own saved dockets"
  ON saved_dockets
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);