/*
  # Create Payments Table

  ## Overview
  Creates the payments table to track all payment transactions for LLC applications.

  ## New Table

  ### payments
  Payment transactions for LLC applications
  - `id` (uuid, primary key) - Payment identifier
  - `application_id` (uuid) - References llc_applications table
  - `user_id` (uuid) - References profiles table
  - `amount` (numeric) - Payment amount
  - `currency` (text) - Currency code (MAD, USDT, etc.)
  - `method` (text) - Payment method (bank, crypto, cashplus)
  - `status` (text) - Payment status (pending, completed, failed, verified)
  - `payment_reference` (text) - Reference for verification (tx hash, receipt, transfer ref)
  - `verified_at` (timestamptz) - When payment was verified
  - `created_at` (timestamptz) - Payment creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable RLS on payments table
  - Users can view/insert their own payments
  - Admin can verify payments
*/

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES llc_applications(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount numeric(10, 2) NOT NULL,
  currency text NOT NULL DEFAULT 'MAD',
  method text NOT NULL CHECK (method IN ('bank', 'crypto', 'cashplus')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'verified')),
  payment_reference text DEFAULT '',
  verified_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_payments_application_id ON payments(application_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own payments
CREATE POLICY "Users can view their own payments"
  ON payments
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own payments
CREATE POLICY "Users can insert their own payments"
  ON payments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Admin can view all payments (will be enforced at application level)
-- For now, we'll allow authenticated users to view payments associated with their applications
CREATE POLICY "Users can view payment status of their applications"
  ON payments
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    application_id IN (
      SELECT id FROM llc_applications WHERE user_id = auth.uid()
    )
  );

-- Create trigger to update llc_applications payment_status when payment is verified
CREATE OR REPLACE FUNCTION update_application_payment_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'verified' THEN
    UPDATE llc_applications
    SET payment_status = 'completed',
        updated_at = now()
    WHERE id = NEW.application_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payment_verification_trigger
AFTER UPDATE ON payments
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION update_application_payment_status();
