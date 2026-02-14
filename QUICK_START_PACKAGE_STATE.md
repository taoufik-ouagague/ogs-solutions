# Quick Start Guide: State-Specific Package Display

## Current Implementation

When you select a state (e.g., Wyoming), the app displays **three packages** with **state-specific pricing**:

1. **Basic Package** - Shows `basic_price` from Firestore
2. **Epic Package** - Shows `epic_price` from Firestore  
3. **Ultimate Package** - Shows `ultimate_price` from Firestore

## Setup Steps

### Step 1: Initialize the Data
Run this in your browser console on the app:

```javascript
import { setupPackageStateOneTime } from './lib/setup-package-state';
await setupPackageStateOneTime();
```

This creates the `package_state` collection with pricing for:
- Wyoming (WY)
- Colorado (CO)
- New Mexico (NM)
- Delaware (DE)
- Texas (TX)
- California (CA)
- Florida (FL)
- New York (NY)

### Step 2: Verify in Firestore Console
Go to Firebase Console → Firestore → `package_state` collection

You should see 8 documents like:
```
WY: {state: "WY", name: "Wyoming", basic_price: 990, epic_price: 2990, ultimate_price: 4990}
CO: {state: "CO", name: "Colorado", basic_price: 1490, epic_price: 3490, ultimate_price: 5490}
...
```

### Step 3: Test in App
1. Go to "Get Started" page
2. Step 1: Select a state (e.g., Wyoming)
3. Step 2: Click "Next Step"
4. You should see **3 package cards** with prices for that state:
   - Basic: 990 DHS
   - Epic: 2990 DHS
   - Ultimate: 4990 DHS

## Debugging

Open browser console (F12) and look for logs like:

```
📦 [usePackageStatePricing] Fetching package state pricing...
✅ [usePackageStatePricing] Loaded pricing for states: ["WY", "CO", "NM", "DE", "TX", "CA", "FL", "NY"]
📦 [GetStartedPage] Loading packages...
✅ [GetStartedPage] Loaded packages: [...]
📦 Package: Basic, State: WY, State Pricing: {basic_price: 990, epic_price: 2990, ...}
  → Basic Price: 990
```

## Troubleshooting

### If you don't see 3 packages:
1. Check that packages are loaded: Look for `✅ [GetStartedPage] Valid packages:` in console
2. Check that pricing is loaded: Look for `✅ [usePackageStatePricing] Loaded pricing for states:`

### If prices show default values:
1. Verify `package_state` collection exists in Firestore
2. Verify the state code matches (e.g., "WY" not "Wyoming")
3. Check that `basic_price`, `epic_price`, `ultimate_price` fields exist

### If nothing shows on Step 2:
1. Make sure you selected a state in Step 1
2. Check console for any error messages
3. Verify Firestore permissions allow read access to `package_state`

## Files Involved

- `/src/pages/GetStartedPage.tsx` - Displays the 3 packages with state pricing
- `/src/hooks/usePackageStatePricing.ts` - Fetches pricing from Firestore
- `/src/lib/setup-package-state.ts` - Setup script to initialize data
- `/src/components/SetupPackageStateComponent.tsx` - Admin UI for setup
- `/firestore.rules` - Security rules for `package_state` collection

## Flow Diagram

```
User selects state (Wyoming)
        ↓
loadPackages() fetches Basic, Epic, Ultimate from 'packages' collection
        ↓
usePackageStatePricing() hook fetches all state pricing from 'package_state' collection
        ↓
For each package, getPriceForState('WY') returns WY pricing
        ↓
Display 3 packages with WY prices:
  - Basic: 990 DHS
  - Epic: 2990 DHS
  - Ultimate: 4990 DHS
```
