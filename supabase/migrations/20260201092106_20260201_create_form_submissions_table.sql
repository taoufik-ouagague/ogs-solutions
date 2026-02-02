/*
  # Create form submissions table

  1. New Tables
    - `form_submissions`
      - `id` (uuid, primary key)
      - `state` (text)
      - `company_name` (text)
      - `member_name` (text)
      - `email` (text)
      - `phone` (text)
      - `status` (text, default: 'new')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `form_submissions` table
    - Add policy for admins to view all submissions
    - Add policy for admins to update submissions
*/

CREATE TABLE IF NOT EXISTS form_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  state text NOT NULL,
  company_name text NOT NULL,
  member_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  status text DEFAULT 'new',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view all submissions"
  ON form_submissions
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'admin@ogssolution.com');

CREATE POLICY "Admin can update submissions"
  ON form_submissions
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'admin@ogssolution.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'admin@ogssolution.com');

CREATE INDEX idx_form_submissions_status ON form_submissions(status);
CREATE INDEX idx_form_submissions_created_at ON form_submissions(created_at);
