# CHECKOUT PAGE SPECIFICATIONS

## 1) CHECKOUT STRUCTURE (WIREFRAME)

### Desktop Layout (2-Column)
```
┌─────────────────────────────────────────────────┐
│  OGS Solutions - Secure Checkout               │
├──────────────────────┬──────────────────────────┤
│                      │                          │
│   FORM SECTION       │   ORDER SUMMARY (STICKY) │
│   (Left - 60%)       │   (Right - 40%)          │
│                      │                          │
│  B) Customer Info    │  A) Order Summary        │
│  C) Billing/Location │     - Package name      │
│  D) Company Details  │     - What's included   │
│  E) Legal Checkboxes │     - Subtotal          │
│  F) CTA Button       │     - Taxes             │
│                      │     - TOTAL (bold)      │
│                      │     - Refund link       │
│                      │                          │
└──────────────────────┴──────────────────────────┘
```

### Mobile Layout (Single Column - Stacked)
```
┌──────────────────────┐
│ Secure Checkout      │
├──────────────────────┤
│ A) Order Summary     │  (Collapsible or pinned at top)
├──────────────────────┤
│ B) Customer Info     │
├──────────────────────┤
│ C) Billing/Location  │
├──────────────────────┤
│ D) Company Details   │
├──────────────────────┤
│ E) Legal Checkboxes  │
├──────────────────────┤
│ F) CTA + Trust Line  │
│ Support Link         │
└──────────────────────┘
```

---

## 2) FIELD LIST (REQUIRED VS OPTIONAL)

### A) ORDER SUMMARY (Display Only)
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Package Name | Text (Display) | - | e.g., "LLC Formation Package" |
| What's Included | Bullet List | - | 3-6 items max |
| Subtotal | Currency | - | Auto-calculated |
| Tax (10%) | Currency | - | Auto-calculated |
| Shipping/Processing | Currency | - | Fixed amount |
| **TOTAL** | Currency (Bold) | - | Sum of above |
| Refund Policy Link | Link | - | "View full refund policy" |

### B) CUSTOMER INFORMATION
| Field | Type | Required | Validation | Placeholder |
|-------|------|----------|------------|-------------|
| Full Name | Text | ✓ | Min 2 chars, no numbers | "John Doe" |
| Email Address | Email | ✓ | Valid email format | "john@example.com" |
| Phone Number | Tel | ✓ | Min 10 digits | "+1 (555) 123-4567" |

### C) BILLING / LOCATION
| Field | Type | Required | Options | Notes |
|-------|------|----------|---------|-------|
| Country | Dropdown | ✓ | All countries | Default: User's country if detected |
| City | Text | ✓ | - | Auto-clear if country changes |

### D) BASIC COMPANY DETAILS
| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| Proposed LLC Name | Text | ✓ | Min 3 chars, max 100 | "My Business LLC" |
| State | Dropdown | Optional | US States (if USA selected) | Only show if Country = USA |

### E) LEGAL CHECKBOXES
| Checkbox | Required | Text | Link |
|----------|----------|------|------|
| Terms & Conditions | ✓ | "I agree to the Terms & Conditions" | [Link] |
| Service Disclaimer | ✓ | "I understand this is a service and results are NOT guaranteed" | - |
| Refund Policy | Optional | "I agree to the Refund Policy" | [Link] |

---

## 3) MICROCOPY & ERROR MESSAGES

### SECTION HEADERS
```
A) Order Summary
   "Your package details"

B) Customer Information
   "Where should we send your confirmation?"

C) Billing & Location
   "For invoicing and contact purposes"

D) Company Details
   "Tell us about your LLC"

E) Agreements
   "Please review and accept our terms"
```

### FIELD LABELS & PLACEHOLDERS
```
Full Name *
  Placeholder: "John Doe"

Email Address *
  Placeholder: "john@example.com"

Phone Number *
  Placeholder: "+1 (555) 123-4567"

Country *
  Placeholder: "Select your country..."

City *
  Placeholder: "New York"

Proposed LLC Name *
  Placeholder: "My Awesome Business LLC"

State (US Only)
  Placeholder: "Select a state..."
  Shown only if Country = "United States"
```

### ERROR MESSAGES (Inline, Red, Under Field)
```
Full Name:
  - "Full name is required"
  - "Full name must be at least 2 characters"

Email:
  - "Email is required"
  - "Please enter a valid email address"

Phone:
  - "Phone number is required"
  - "Please enter a valid phone number (min 10 digits)"

Country:
  - "Country is required"

City:
  - "City is required"
  - "City must be at least 2 characters"

Proposed LLC Name:
  - "Proposed LLC name is required"
  - "Proposed LLC name must be at least 3 characters"
  - "Proposed LLC name must not exceed 100 characters"

Checkboxes:
  - "You must agree to the Terms & Conditions"
  - "You must confirm the service disclaimer"
```

### CHECKBOX LABEL TEXT
```
☑ I agree to the Terms & Conditions [Link]
☑ I understand this is a service process. Results are NOT guaranteed. Approval depends on official authorities and your eligibility.
☐ I agree to the Refund Policy [Link]
```

### "WHAT HAPPENS NEXT?" BOX
```
WHAT HAPPENS NEXT?

1. Pay Securely
   Your payment is processed on our secure platform.

2. Confirmation Email
   You'll receive a confirmation within minutes.

3. Processing Begins
   Our team starts processing your LLC immediately after payment.

Questions? Contact us →
```

### SERVICE DISCLAIMER BOX (Near Checkboxes)
```
⚠️ Important Service Notice

This is a professional filing and consulting service. Success and approval depend on:
- Your eligibility based on state requirements
- Accurate information provided
- Official government authority decisions

We do NOT guarantee approval. We provide professional preparation and filing services only.
```

### SUPPORT / HELP SECTION (Below CTA)
```
Need help? We're here for you.
📧 Email: support@ogssolutions.com
💬 WhatsApp: Chat with us now
⏱️ Response time: Usually within 1 hour (Business hours: 9 AM - 6 PM EST)
```

### CTA BUTTON & TRUST LINE
```
Button Text: "Place Order & Pay"
Button Color: Blue (#2563EB)
Button Size: Full width on mobile, 50% on desktop

Trust Line (Below Button):
"🔒 Secure Checkout • Your data is encrypted"
```

### SUCCESS CONFIRMATION (After Submit)
```
✓ Order Placed Successfully

Your confirmation email is on the way to [email].
Order #[ORDER_ID]

Next Steps:
- Check your email for login credentials
- We'll begin processing your LLC right away
- You can track progress from your dashboard
```

---

## 4) UX RULES & VALIDATION

### FORM BEHAVIOR
- ✓ Inline validation (errors show under each field)
- ✓ Required fields marked with red asterisk (*)
- ✓ Real-time email validation (on blur)
- ✓ Phone number auto-formatting (as user types)
- ✓ Checkboxes must be explicitly checked (not pre-checked)
- ✓ CTA button DISABLED until all required fields + checkboxes are complete
- ✓ On Enter key: auto-focus next field (or submit if last field)
- ✓ Preserve user input on validation error (don't clear fields)
- ✓ Show visual feedback on valid fields (green checkmark or border)

### FIELD VALIDATION LOGIC
```
Full Name:
  - Trim whitespace
  - Check minimum 2 characters
  - No leading/trailing spaces
  
Email:
  - Standard email regex validation
  - Auto-lowercase
  - Show error on blur
  
Phone:
  - Remove all non-digits
  - Check minimum 10 digits
  - Auto-format as user types
  - Support multiple formats: (555) 123-4567, 555-123-4567, 5551234567
  
Country:
  - Required dropdown selection
  - Trigger update to State field if changed
  
City:
  - Minimum 2 characters
  - Trim whitespace
  
Proposed LLC Name:
  - Minimum 3 characters
  - Maximum 100 characters
  - Trim whitespace
  - Allow letters, numbers, hyphens, ampersands
  
Checkboxes:
  - Terms & Conditions: MUST be checked
  - Service Disclaimer: MUST be checked
  - Refund Policy: OPTIONAL
```

### BUTTON STATE MANAGEMENT
```
CTA Button Enabled When:
- Full Name: not empty & ≥ 2 chars
- Email: valid format
- Phone: ≥ 10 digits
- Country: selected
- City: not empty & ≥ 2 chars
- Proposed LLC Name: not empty & 3-100 chars
- Terms & Conditions checkbox: checked
- Service Disclaimer checkbox: checked

CTA Button Disabled:
- During payment processing (show "Processing...")
- If any above condition is false
```

### ERROR CLEARING
- Clear error when user starts typing in field
- Revalidate on blur
- Show green checkmark on valid field (optional nice-to-have)

---

## 5) MOBILE LAYOUT NOTES

### Stack Order (Top to Bottom)
1. Header ("Secure Checkout")
2. Order Summary (Sticky or Collapsible)
3. Customer Information section
4. Billing/Location section
5. Company Details section
6. Legal Checkboxes section
7. Support/Help section
8. CTA Button (full width)
9. Trust line

### Mobile Optimizations
- Form fields: full width (100%)
- Input height: 44px minimum (thumb-friendly)
- Spacing: 16px between sections
- Font sizes: readable without zoom
- Order Summary: sticky header or collapsible on scroll
- Checkboxes: large touch targets (44x44px)
- Links: underlined, clear color contrast

---

## 6) CONVERSION OPTIMIZATION ELEMENTS

### Trust Signals
- ✓ Security badge / lock icon near CTA
- ✓ "What happens next?" clearly visible
- ✓ Service disclaimer preventing buyer's remorse
- ✓ Support link prominently displayed
- ✓ Clear refund policy link
- ✓ HTTPS visible (browser shows secure connection)

### Reduce Cart Abandonment
- ✓ Clear price breakdown (no surprises)
- ✓ Field-by-field validation (not bulk validation at end)
- ✓ Save progress on blur (could auto-save to localStorage)
- ✓ Minimal required fields (only essentials)
- ✓ Mobile-optimized form (no horizontal scrolling)

### Reduce Chargebacks
- ✓ Explicit service disclaimer checkbox
- ✓ "Results NOT guaranteed" language visible
- ✓ Clear confirmation email sent
- ✓ Order tracking / dashboard access
- ✓ Easy support contact options

---

## 7) IMPLEMENTATION NOTES

### Tech Stack
- React component with TypeScript
- Form validation with real-time feedback
- localStorage for autosave (optional)
- Phone number formatting library
- Email validation regex

### Files to Create/Update
1. `src/components/CheckoutFormPage.tsx` - Main checkout component
2. `src/utils/formValidation.ts` - Validation helpers
3. `src/utils/phoneFormatter.ts` - Phone number utility
4. `src/styles/checkout.css` - Additional styles if needed

### States to Manage
- Form data (all fields)
- Validation errors (per field)
- Processing state (loading)
- Success state (confirmation)
- CTA button enable/disable state

---

**Version:** 1.0  
**Last Updated:** February 2, 2026  
**Status:** Ready for Implementation
