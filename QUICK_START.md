# 🚀 Quick Start Guide - Dynamic Website

## What Changed?

Your website now has **dynamic URLs** and a **backend API**.

## Navigate to Pages

Instead of state-based navigation, just use these URLs:

| Page | URL |
|------|-----|
| 🏠 Home | `/` |
| 🔧 Services | `/services` |
| 📧 Contact | `/contact` |
| 🚀 Get Started | `/get-started` |
| 👤 Dashboard | `/dashboard` |
| 🔐 Login | `/auth` |
| 🛡️ Admin Login | `/admin/login` |
| ⚙️ Admin Setup | `/admin/setup` |
| 📊 Admin Dashboard | `/admin/dashboard` |

## Example: Call Backend API

```typescript
import { backendAPI } from './lib/backendAPI';

// Get all states
const states = await backendAPI.getAvailableStates();
console.log(states); // [{code: 'CA', name: 'California'}, ...]

// Get pricing for California
const pricing = await backendAPI.getStatePricing('CA');
console.log(pricing); // {state: 'CA', name: 'California', basic_price: 2000, ...}

// Create application
const app = await backendAPI.createApplication({
  state: 'CA',
  state_name: 'California',
  company_name: 'My LLC Inc',
  package_id: 'basic_pkg'
});
console.log(app); // {success: true, applicationId: '...'}
```

## Deploy Cloud Functions

```bash
firebase deploy --only functions
```

## Files Changed/Added

### ✨ Modified
- `src/App.tsx` - React Router integration
- `src/components/Header.tsx` - URL-based active page
- `src/lib/firebase.ts` - Added Functions

### 🆕 New Files
- `src/lib/backendAPI.ts` - API client
- `functions/src/api.ts` - Backend functions
- `BACKEND_SETUP.md` - Full documentation
- `MIGRATION_COMPLETE.md` - Implementation guide

## Available Backend Functions

### `getAvailableStates()`
Returns all states from State Pricing Management

**Example:**
```typescript
const states = await backendAPI.getAvailableStates();
// [{code: 'CA', name: 'California'}, ...]
```

### `getStatePricing(stateCode)`
Returns pricing for a specific state

**Example:**
```typescript
const pricing = await backendAPI.getStatePricing('CA');
// {state: 'CA', name: 'California', basic_price: 2000, ...}
```

### `createApplication(data)`
Create new LLC application (requires user auth)

**Example:**
```typescript
const result = await backendAPI.createApplication({
  state: 'CA',
  state_name: 'California',
  company_name: 'My LLC',
  package_id: 'pkg_123',
  form_data: {
    memberName: 'John',
    email: 'john@example.com'
  }
});
// {success: true, applicationId: 'app_xyz'}
```

### `getUserApplications()`
Get user's applications (requires auth)

**Example:**
```typescript
const apps = await backendAPI.getUserApplications();
// [{ id: '...', company_name: 'My LLC', state: 'CA', ... }]
```

### `getPackages(stateCode?)`
Get packages, optionally filtered by state

**Example:**
```typescript
const packages = await backendAPI.getPackages('CA');
// [{ id: 'pkg_1', name: 'Basic', price: 499, ... }]
```

## Testing URLs

Start dev server:
```bash
npm run dev
```

Visit:
- http://localhost:5173/
- http://localhost:5173/services
- http://localhost:5173/get-started
- http://localhost:5173/admin/login

## Common Issues

### Functions not working?
1. Deploy: `firebase deploy --only functions`
2. Check logs: `firebase functions:log`

### URL not working?
- Restart dev server: `npm run dev`
- Check React Router setup in `App.tsx`

### API call fails?
- Check user authentication
- Verify Firebase config in `.env`
- Check function logs

## Environment Setup

`.env` file should have:
```
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Adding New Endpoints

1. Add function to `functions/src/api.ts`
2. Export from `functions/src/index.ts`
3. Add method to `src/lib/backendAPI.ts`
4. Deploy: `firebase deploy --only functions`

Example: Add a new function

**`functions/src/api.ts`:**
```typescript
export const getStats = functions.https.onCall(async (data, context) => {
  return { success: true, stats: {...} };
});
```

**`functions/src/index.ts`:**
```typescript
export { getStats };
```

**`src/lib/backendAPI.ts`:**
```typescript
async getStats() {
  const func = httpsCallable(functions, 'getStats');
  return (await func({})).data;
}
```

**Use it:**
```typescript
const stats = await backendAPI.getStats();
```

## Next Steps

1. ✅ Test URLs in browser
2. Deploy functions: `firebase deploy --only functions`
3. Build for production: `npm run build`
4. Deploy frontend (Firebase, Vercel, Netlify, etc.)
5. Monitor function logs

## Support

📖 See `BACKEND_SETUP.md` for detailed documentation
📄 See `MIGRATION_COMPLETE.md` for implementation details

---

**Everything is ready!** Your website now has proper URLs and a scalable backend. 🎉
