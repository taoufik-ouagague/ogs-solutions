# Payment Integration Documentation

## Overview

This document outlines the complete payment integration system for the OGS Solution LLC formation platform. The system supports multiple payment methods and includes automatic detection with admin dashboard verification.

## Payment Methods

### 1. Bank Transfer (CIH)
- **Account Holder**: OGS Solutions
- **Bank**: Crédit Immobilier et Hôtelier (CIH)
- **Account Number (RIB)**: 007260200004500100
- **Amount**: 1,000 MAD
- **Verification**: Admin reviews transfer references submitted by users

### 2. Cryptocurrency (USDT TRC20)
- **Network**: USDT - TRC20
- **Wallet Address**: TQCkG6WnTWjZiT9mfV8p5kK3q9L2mN4pRx
- **Amount**: 50 USDT (≈ 1,000 MAD)
- **Verification**: Admin reviews transaction hashes submitted by users

### 3. Cash Plus
- **Merchant Code**: OGS-SOLUTIONS
- **Amount**: 1,000 MAD
- **Verification**: Admin reviews receipt numbers submitted by users

## Database Schema

### Payments Table
```sql
CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES llc_applications(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  amount numeric(10, 2) NOT NULL,
  currency text NOT NULL DEFAULT 'MAD',
  method text NOT NULL CHECK (method IN ('bank', 'crypto', 'cashplus')),
  status text NOT NULL DEFAULT 'pending',
  payment_reference text DEFAULT '',
  verified_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### Status Flow
```
pending → verified → (updates llc_applications.payment_status to completed)
```

## API Functions

### Payment Service (`src/lib/paymentService.ts`)

#### Create Payment
```typescript
createPayment(
  applicationId: string,
  userId: string,
  amount: number,
  method: PaymentMethod
): Promise<Payment>
```
Creates a new payment record in the database.

#### Update Payment Reference
```typescript
updatePaymentReference(
  paymentId: string,
  paymentReference: string
): Promise<Payment>
```
Updates payment with the user-provided reference (tx hash, receipt number, etc.).

#### Verify Payment
```typescript
verifyPayment(paymentId: string): Promise<Payment>
```
Admin action to verify and complete a payment. Automatically updates the associated LLC application status.

#### Get Pending Payments
```typescript
getPendingPayments(): Promise<Payment[]>
```
Retrieves all pending payments awaiting admin verification.

#### Subscribe to Payment Updates
```typescript
subscribeToPaymentUpdates(
  applicationId: string,
  callback: (payment: Payment) => void
): Subscription
```
Real-time subscription to payment status changes for an application.

## Components

### PaymentModal
**Location**: `src/components/PaymentModal.tsx`

Enhanced payment modal that:
- Displays all three payment methods
- Collects payment references from users
- Integrates with payment service
- Provides real-time error handling

**Props**:
```typescript
interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (paymentMethod: string) => void;
  loading: boolean;
  applicationId: string;
  userId: string;
  amount?: number;
}
```

### PaymentVerificationPanel
**Location**: `src/components/PaymentVerificationPanel.tsx`

Admin component that:
- Lists all pending payments
- Allows verification with one click
- Shows payment details (amount, method, reference)
- Auto-refreshes and updates application status

**Features**:
- Real-time payment verification
- Color-coded payment methods
- Payment reference display
- Error handling

## Admin Dashboard Integration

### Payments Tab
A new "Payments" tab has been added to the Admin Dashboard (`src/pages/AdminDashboardPage.tsx`).

**Features**:
- View all pending payments
- Quick verification interface
- Auto-update application status
- Filter and search payments
- Real-time updates

## Usage Flow

### User Side
1. User completes LLC form and selects package
2. Payment modal opens with three options
3. User selects payment method
4. Payment reference is collected and stored
5. Payment record created in database
6. User sent to WhatsApp for confirmation

### Admin Side
1. Admin navigates to "Payments" tab
2. Views list of pending payments
3. Reviews payment reference
4. Clicks "Verify Payment"
5. Application status automatically updated to "completed"
6. User receives notification (to be implemented)

## Real-time Updates

The system uses Supabase real-time subscriptions to automatically update:
- Dashboard payment list
- Application payment status
- User notification (recommended)

## Database Migration

Run the migration to create the payments table:
```bash
supabase migration up
```

Or manually execute:
```bash
psql -d your_database -f supabase/migrations/20260202_create_payments_table.sql
```

## Translation Support

All payment-related text is translatable in `src/utils/translations.ts`:
- Payment method descriptions
- Status messages
- Error messages
- Button labels

Languages supported:
- English (en)
- French (fr)
- Arabic (ar)
- Spanish (es)

## Environment Variables

No additional environment variables needed. Uses existing Supabase configuration.

## Security Considerations

1. **Row-Level Security (RLS)**: Enabled on payments table
   - Users can only view their own payments
   - Admin verification happens server-side
   - Payment references are encrypted in transit

2. **Verification**: Admin-only permission required
   - Only admins can verify payments
   - Automatic application status update prevents fraud
   - Audit trail maintained via timestamps

3. **Data Validation**:
   - Payment amount validation
   - Method validation (enum)
   - Status validation (enum)
   - Reference format validation

## Testing

### Manual Testing
1. Submit LLC application
2. Select payment method
3. Enter payment reference
4. Check Supabase to verify payment record created
5. As admin, navigate to Payments tab
6. Verify payment
7. Check application status updated to "completed"

### Test Data
- Bank Reference: Use any text (e.g., "TEST-TRANSFER-001")
- Crypto Hash: Use any format (e.g., "0x...")
- Cash Plus: Use any reference (e.g., "CP-RECEIPT-001")

## Future Enhancements

1. **Automated Verification**
   - Crypto: Verify transactions on blockchain
   - Bank: API integration with CIH
   - Cash Plus: API integration

2. **Notifications**
   - WhatsApp notifications on payment verification
   - Email confirmations
   - SMS alerts

3. **Refunds**
   - Partial refund support
   - Refund history tracking
   - Automatic reversal of application status

4. **Analytics**
   - Payment method usage statistics
   - Revenue tracking
   - Payment failure analysis

## Troubleshooting

### Payment Not Appearing
- Check Supabase connection
- Verify user ID and application ID
- Check RLS policies

### Cannot Verify Payment
- Check admin authentication
- Verify payment ID format
- Check database permissions

### Real-time Updates Not Working
- Verify Supabase subscription is active
- Check network connection
- Review browser console for errors

## Support

For issues or questions about payment integration, please contact the development team or refer to the Supabase documentation.
