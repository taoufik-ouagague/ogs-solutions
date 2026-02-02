/*
  # OGS Solution Database Schema

  ## Overview
  Creates the core database structure for OGS Solution LLC formation platform.

  ## New Tables

  ### 1. profiles
  User profile information linked to auth.users
  - `id` (uuid, primary key) - References auth.users
  - `full_name` (text) - User's full name
  - `phone` (text) - Contact phone number
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. packages
  Available LLC formation packages (New Mexico, Wyoming, Colorado)
  - `id` (uuid, primary key) - Package identifier
  - `name` (text) - Package name
  - `price` (numeric) - Package price in USD
  - `description` (text) - Package description
  - `features` (jsonb) - Array of features included
  - `is_active` (boolean) - Whether package is currently offered
  - `created_at` (timestamptz) - Creation timestamp

  ### 3. llc_applications
  LLC formation applications submitted by users
  - `id` (uuid, primary key) - Application identifier
  - `user_id` (uuid) - References profiles table
  - `package_id` (uuid) - References packages table
  - `state` (text) - U.S. state for LLC formation
  - `company_name` (text) - Desired LLC name
  - `status` (text) - Application status (pending, processing, completed, rejected)
  - `form_data` (jsonb) - Additional form information
  - `payment_status` (text) - Payment status (pending, completed, failed)
  - `payment_id` (text) - External payment reference
  - `created_at` (timestamptz) - Application submission date
  - `updated_at` (timestamptz) - Last status update

  ### 4. contact_messages
  Messages submitted through contact form
  - `id` (uuid, primary key) - Message identifier
  - `name` (text) - Sender's name
  - `email` (text) - Sender's email
  - `subject` (text) - Message subject
  - `message` (text) - Message content
  - `status` (text) - Message status (new, read, responded)
  - `created_at` (timestamptz) - Submission timestamp

  ### 5. chat_conversations
  AI chat agent conversation history
  - `id` (uuid, primary key) - Conversation identifier
  - `user_id` (uuid, nullable) - References profiles table
  - `session_id` (text) - Anonymous session identifier
  - `messages` (jsonb) - Array of chat messages
  - `created_at` (timestamptz) - Conversation start time
  - `updated_at` (timestamptz) - Last message time

  ## Security
  - Enable RLS on all tables
  - Users can read/update their own profiles
  - Users can view packages
  - Users can manage their own LLC applications
  - Contact messages are insert-only for public
  - Chat conversations are private to users

  ## Important Notes
  - Uses Supabase auth for user management
  - Includes proper indexes for performance
  - All timestamps use timezone-aware types
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create packages table
CREATE TABLE IF NOT EXISTS packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  price numeric(10, 2) NOT NULL,
  description text NOT NULL,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create llc_applications table
CREATE TABLE IF NOT EXISTS llc_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  package_id uuid REFERENCES packages(id) NOT NULL,
  state text NOT NULL,
  company_name text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  form_data jsonb DEFAULT '{}'::jsonb,
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
  payment_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create contact_messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'new' CHECK (status IN ('new', 'read', 'responded')),
  created_at timestamptz DEFAULT now()
);

-- Create chat_conversations table
CREATE TABLE IF NOT EXISTS chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  messages jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_llc_applications_user_id ON llc_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_llc_applications_status ON llc_applications(status);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_session_id ON chat_conversations(session_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE llc_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Packages policies (public read)
CREATE POLICY "Anyone can view active packages"
  ON packages FOR SELECT
  TO public
  USING (is_active = true);

-- LLC applications policies
CREATE POLICY "Users can view own applications"
  ON llc_applications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own applications"
  ON llc_applications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications"
  ON llc_applications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Contact messages policies (public insert only)
CREATE POLICY "Anyone can submit contact messages"
  ON contact_messages FOR INSERT
  TO public
  WITH CHECK (true);

-- Chat conversations policies
CREATE POLICY "Users can view own conversations"
  ON chat_conversations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own conversations"
  ON chat_conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
  ON chat_conversations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anonymous users can insert conversations"
  ON chat_conversations FOR INSERT
  TO public
  WITH CHECK (user_id IS NULL);

-- Insert default packages
INSERT INTO packages (name, price, description, features) VALUES
  ('New Mexico', 99.00, 'Essential LLC registration and document filing', 
   '["State filing fees included", "Articles of Organization", "Operating Agreement template", "Email support", "Processing time: 5-7 business days"]'::jsonb),
  ('Wyoming', 299.00, 'Everything in New Mexico plus EIN and registered agent', 
   '["Everything in New Mexico", "EIN registration (Tax ID)", "1 year registered agent service", "Compliance calendar", "Phone & email support", "Processing time: 3-5 business days"]'::jsonb),
  ('Colorado', 499.00, 'Complete business setup with priority support', 
   '["Everything in Wyoming", "Business bank account setup assistance", "Compliance alerts & reminders", "Priority 24/7 support", "Expedited processing: 1-2 business days", "Free business consultation (30 min)"]'::jsonb)
ON CONFLICT (name) DO NOTHING;