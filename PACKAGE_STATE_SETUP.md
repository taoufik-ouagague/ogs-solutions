# Package State Pricing Implementation Guide

## Overview
The `package_state` collection has been successfully implemented to fetch and display state-specific package pricing in your application. This works similarly to how activity logs are fetched and displayed.

## Files Created/Modified

### 1. **New Files Created:**

#### `/src/lib/setup-package-state.ts`
- Setup script to initialize the `package_state` collection in Firestore
- Contains sample pricing data for 8 states (WY, CO, NM, DE, TX, CA, FL, NY)
- Each document has: `state`, `name`, `basic_price`, `epic_price`, `ultimate_price`

#### `/src/hooks/usePackageStatePricing.ts`
- Custom React hook that fetches package state pricing from Firestore
- Returns `pricing` object, `loading` state, `error`, and `getPriceForState()` function
- Mimics the pattern used in `useActivityLogs.ts`

#### `/src/components/SetupPackageStateComponent.tsx`
- Admin UI component to initialize the package_state collection
- Shows loading/success/error states
- Can be added to the AdminSetupPage or AdminDashboardPage

### 2. **Modified Files:**

#### `/firestore.rules`
- Added read access rules for `package_state` collection
- Allows public read, admin-only write

#### `/src/pages/GetStartedPage.tsx`
- Integrated `usePackageStatePricing` hook
- Updated package selection (Step 2) to display state-specific prices
- Price fetching is automatic when state is selected
- Falls back to default package prices if state pricing not found

#### `/src/lib/firebaseUtils.ts`
- Added `PackageStatePrice` interface
- Added `getPackagePricesByState()` function
- Added `getPackagePriceForState()` function

## How to Use

### Step 1: Initialize the Collection

#### Option A: Using the Setup Component
1. Import the component in AdminSetupPage or AdminDashboardPage:
   ```tsx
   import SetupPackageStateComponent from '../components/SetupPackageStateComponent';
   ```

2. Add it to your admin setup UI:
   ```tsx
   <SetupPackageStateComponent onComplete={() => console.log('Setup complete!')} />
   ```

#### Option B: Using Browser Console
1. Open your application in the browser
2. Open the browser console (F12 or Cmd+Option+I)
3. Run:
   ```javascript
   import { setupPackageStateOneTime } from './lib/setup-package-state';
   await setupPackageStateOneTime();
   ```

### Step 2: Verify in Firestore
1. Go to Firebase Console → Firestore Database
2. Navigate to the `package_state` collection
3. You should see 8 documents (one per state) with their pricing

## Data Structure

Each `package_state` document has this structure:
```typescript
{
  state: "WY",           // State code (document ID)
  name: "Wyoming",       // State name
  basic_price: 990,      // Basic package price
  epic_price: 2990,      // Epic package price
  ultimate_price: 4990,  // Ultimate package price
  created_at: "2026-02-03T...",
  updated_at: "2026-02-03T..."
}
```

## How It Works

1. **On Page Load:**
   - `usePackageStatePricing()` hook fetches all state pricing from Firestore
   - Data is cached in the component state

2. **When User Selects State:**
   - GetStartedPage calls `getPriceForState(stateCode)`
   - Pricing is matched by package name (basic, epic, ultimate)
   - Prices are displayed for the selected state

3. **Fallback Logic:**
   - If state pricing not found, uses package's `state_pricing` field
   - If that also not found, uses default package price

## Testing

To test the implementation:

1. Navigate to the "Get Started" page
2. Select a state from the dropdown (e.g., Wyoming)
3. Go to Step 2 (Choose Your Package)
4. You should see prices specific to that state:
   - Wyoming: Basic 990, Epic 2990, Ultimate 4990
   - Colorado: Basic 1490, Epic 3490, Ultimate 5490
   - New Mexico: Basic 890, Epic 2490, Ultimate 4490
   - Delaware: Basic 1290, Epic 2990, Ultimate 4990

## Adding More States

To add more states, edit `/src/lib/setup-package-state.ts`:

```typescript
const stateData = [
  // ... existing states
  {
    state: 'VA',
    name: 'Virginia',
    basic_price: 1190,
    epic_price: 2890,
    ultimate_price: 4690
  }
];
```

Then re-run the setup function.

## Debugging

Console logs are included to help debug:

```typescript
// In usePackageStatePricing hook:
console.log('📦 Fetching package state pricing...');
console.log('✅ Package state pricing loaded:', pricingMap);
console.log('❌ Error fetching package state pricing:', err);

// In GetStartedPage:
// getPriceForState() logs which pricing is being used
```

Monitor these logs in the browser console while testing.

## Architecture Notes

The implementation follows the same pattern as `useActivityLogs`:
- Single source of truth: Firestore `package_state` collection
- Hook-based data fetching for reusability
- Automatic state selection → price update flow
- Error handling with fallbacks
- Console logging for debugging

This approach ensures consistency across your application's data fetching patterns.
