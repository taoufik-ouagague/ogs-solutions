/*
  # Fix Auth Schema Error
  
  1. Issue
    - RLS policies on tables are blocking Supabase's internal auth schema queries
    - Need to allow public access to public tables during auth operations
    
  2. Changes
    - Drop and recreate chat_conversations policies to allow anonymous access properly
    - Add bypass policy for service role if needed
    - Fix contact_messages policy to use proper public access
*/

-- Drop existing policies that might block auth
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Recreate profiles policies with proper auth handling
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

-- Ensure packages table allows public access
DROP POLICY IF EXISTS "Anyone can view active packages" ON packages;

CREATE POLICY "Anyone can view active packages"
  ON packages FOR SELECT
  USING (is_active = true);

-- Fix contact_messages to allow public inserts without restrictions
DROP POLICY IF EXISTS "Anyone can submit contact messages" ON contact_messages;

CREATE POLICY "Anyone can submit contact messages"
  ON contact_messages FOR INSERT
  WITH CHECK (true);

-- Fix chat_conversations anonymous policy
DROP POLICY IF EXISTS "Anonymous users can insert conversations" ON chat_conversations;

CREATE POLICY "Anonymous users can insert conversations"
  ON chat_conversations FOR INSERT
  WITH CHECK (user_id IS NULL);
