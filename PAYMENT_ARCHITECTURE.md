# Payment System Architecture & Flows

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    OGS Solution Payment System                   │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────┐         ┌──────────────────────┐
│   USER INTERFACE     │         │  ADMIN DASHBOARD     │
├──────────────────────┤         ├──────────────────────┤
│ • PaymentModal       │         │ • Payments Tab       │
│ • Payment Methods    │         │ • Verification Panel │
│ • Reference Input    │         │ • Pending List       │
└──────────┬───────────┘         └──────────┬───────────┘
           │                                 │
           └────────────────┬────────────────┘
                            │
                    ┌───────▼────────┐
                    │  Payment Service│
                    │  (paymentService)
                    └───────┬────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
    ┌───────▼────────┐   ┌──▼────────┐  ┌─▼──────────┐
    │   Supabase     │   │   RLS     │  │ Triggers   │
    │   Database     │   │  Policies │  │   & Hooks  │
    └────────────────┘   └───────────┘  └────────────┘
```

## User Payment Flow

```
START
  │
  ├─► Complete LLC Form
  │       │
  │       ├─► Select Package
  │       │
  │       └─► Click "Next"
  │
  ├─► Payment Modal Opens
  │       │
  │       ├─► Select Payment Method:
  │       │    • Bank Transfer (CIH)
  │       │    • Cryptocurrency (USDT)
  │       │    • Cash Plus
  │       │
  │       ├─► Enter Payment Reference
  │       │    (optional, but recommended)
  │       │
  │       └─► Click "Continue"
  │
  ├─► createPayment()
  │       │
  │       ├─► Create payment record
  │       ├─► Set status = "pending"
  │       ├─► Link to application
  │       └─► Save reference
  │
  ├─► Display Success Message
  │
  └─► Redirect to WhatsApp
            │
            ├─► User sends receipt
            └─► Manual verification flow
```

## Admin Verification Flow

```
START
  │
  ├─► Admin Opens Dashboard
  │
  ├─► Click "Payments" Tab
  │       │
  │       └─► Load Pending Payments
  │
  ├─► See Payment Details:
  │    • Amount & Currency
  │    • Payment Method (Color-coded)
  │    • Payment Reference
  │    • Submission Time
  │
  ├─► Click "Verify Payment"
  │       │
  │       └─► verifyPayment(paymentId)
  │
  ├─► Update Payment Status
  │    status: "pending" → "verified"
  │       │
  │       └─► Set verified_at timestamp
  │
  ├─► Trigger Auto-Update
  │    (Database Trigger)
  │       │
  │       ├─► Update llc_applications
  │       └─► Set payment_status = "completed"
  │
  ├─► Display Success
  │    "Payment verified successfully!"
  │
  └─► Payment Removed from List
         (Now shows in verified list if viewed)
```

## Database State Transitions

### Payment Status Flow

```
┌─────────┐
│ pending │ ◄─── New payment created
└────┬────┘
     │
     │ verifyPayment()
     │
     ▼
┌─────────────┐
│  verified   │ ◄─── Admin confirmed
└────┬────────┘
     │
     │ Trigger fires
     │
     ▼
┌──────────────────────┐
│ llc_applications     │
│ payment_status:      │
│ completed            │
└──────────────────────┘
```

### Application Status Updates

```
┌─────────┐
│ pending │ ◄─── User submits form
└────┬────┘
     │
     │ Creates payment record
     │ payment_status = "pending"
     │
     ▼
┌──────────────┐
│  processing  │ ◄─── Admin reviews
└────┬─────────┘
     │
     │ Admin verifies payment
     │ payment_status = "verified"
     │ (Trigger fires)
     │
     ▼
┌──────────────┐
│  completed   │ ◄─── Auto-updated!
└──────────────┘
```

## Payment Method Details

### 1. Bank Transfer Flow

```
User Selects "Bank Transfer"
        ▼
Display CIH Details:
┌─────────────────────────────────────────┐
│ Account: OGS Solutions                  │
│ Bank: Crédit Immobilier et Hôtelier     │
│ RIB: 007260200004500100 [COPY]          │
│ Amount: 1,000 MAD                       │
├─────────────────────────────────────────┤
│ Transfer Reference (optional):          │
│ ┌───────────────────────────────────┐   │
│ │ [User enters reference]           │   │
│ └───────────────────────────────────┘   │
└─────────────────────────────────────────┘
        ▼
User makes bank transfer
        ▼
Admin verifies reference
        ▼
Payment marked "verified"
```

### 2. Cryptocurrency Flow

```
User Selects "Cryptocurrency"
        ▼
Display Crypto Details:
┌─────────────────────────────────────────┐
│ Network: USDT - TRC20                   │
│ Wallet: TQCkG6WnTWjZiT9mfV... [COPY]   │
│ Amount: 50 USDT (≈ 1,000 MAD)          │
├─────────────────────────────────────────┤
│ Transaction Hash:                       │
│ ┌───────────────────────────────────┐   │
│ │ [User enters tx hash]             │   │
│ └───────────────────────────────────┘   │
└─────────────────────────────────────────┘
        ▼
User sends crypto to wallet
        ▼
Admin verifies transaction hash
        ▼
Payment marked "verified"
```

### 3. Cash Plus Flow

```
User Selects "Cash Plus"
        ▼
Display Cash Plus Details:
┌─────────────────────────────────────────┐
│ Merchant Code: OGS-SOLUTIONS [COPY]    │
│ Amount: 1,000 MAD                       │
├─────────────────────────────────────────┤
│ Receipt Number (optional):              │
│ ┌───────────────────────────────────┐   │
│ │ [User enters receipt #]           │   │
│ └───────────────────────────────────┘   │
└─────────────────────────────────────────┘
        ▼
User visits Cash Plus outlet
        ▼
User pays 1,000 MAD with merchant code
        ▼
User receives receipt
        ▼
Admin verifies receipt number
        ▼
Payment marked "verified"
```

## Component Interaction Diagram

```
┌─────────────────────────────────────────────────────────┐
│  GetStartedPage / DashboardPage                         │
│  (Application workflow)                                  │
└────────────────┬──────────────────────────────────────┘
                 │
                 │ Opens on completion
                 ▼
        ┌────────────────────┐
        │  PaymentModal      │ ◄─── Enhanced with:
        │  (Updated)         │      • Payment Service
        ├────────────────────┤      • Reference Input
        │ • Bank Transfer    │      • Error Handling
        │ • Cryptocurrency   │      • Loading States
        │ • Cash Plus        │
        └────────┬───────────┘
                 │
        Calls createPayment()
                 │
                 ▼
        ┌────────────────────────────┐
        │  paymentService.ts         │
        │  (API Layer)               │
        ├────────────────────────────┤
        │ • createPayment()          │
        │ • updatePaymentReference() │
        │ • verifyPayment()          │
        │ • getPayments()            │
        └────────┬───────────────────┘
                 │
                 ▼
        ┌────────────────────────┐
        │  Supabase              │
        │  payments table        │
        └────────┬───────────────┘
                 │
        Admin accesses dashboard
                 │
                 ▼
        ┌────────────────────────────────────┐
        │  AdminDashboardPage                │
        │  (Updated with new "Payments" tab) │
        ├────────────────────────────────────┤
        │ • Applications Tab (existing)       │
        │ • Payments Tab (NEW)                │
        └────────┬───────────────────────────┘
                 │
                 ▼
        ┌────────────────────────────┐
        │  PaymentVerificationPanel  │ ◄─── New Component
        │  (NEW)                     │      Lists pending
        ├────────────────────────────┤      payments with
        │ • List pending payments    │      verification
        │ • Show payment details     │
        │ • Verify button            │
        │ • Color-coded methods      │
        └────────┬───────────────────┘
                 │
        Calls verifyPayment()
                 │
                 ▼
        ┌────────────────────────┐
        │  paymentService.ts     │
        │  • verifyPayment()     │
        └────────┬───────────────┘
                 │
                 ├─► Update payments.status = "verified"
                 │
                 ├─► Database Trigger Fires
                 │
                 └─► Update llc_applications.payment_status = "completed"
```

## Security & Permissions

```
┌──────────────────────────────────────────┐
│  User Authentication                     │
├──────────────────────────────────────────┤
│ User ID from auth.users                  │
└────────────┬───────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────┐
│  Row Level Security (RLS)                │
├──────────────────────────────────────────┤
│ ✓ Can view own payments                  │
│ ✓ Can insert own payments                │
│ ✗ Cannot modify other users payments     │
│ ✗ Cannot verify (admin only)             │
└────────────────────────────────────────┘
```

## Real-time Update Flow

```
User submits payment
        │
        ├─► Creates record in payments table
        │
        ├─► Admin dashboard polls every 5 sec
        │
        └─► Payment appears in Pending list
            (can be enhanced to true real-time)

Admin clicks "Verify"
        │
        ├─► Status updates to "verified"
        │
        ├─► Database trigger fires
        │
        ├─► llc_applications updated
        │
        └─► Admin sees success message
            Payment removed from pending list
```

## Error Handling Flow

```
User Action
    │
    ├─► Validation
    │   (method, amount, reference)
    │
    ├─► Database Operation
    │   (create/update/verify)
    │
    └─► Error?
        │
        ├─► YES: Catch & Display Error
        │        • Network error
        │        • Validation error
        │        • Permission error
        │        • Database error
        │
        └─► NO: Show Success
            Display confirmation message
```

---

**This diagram set shows the complete payment system architecture and all flows.**
For detailed API documentation, see `PAYMENT_INTEGRATION.md`.
