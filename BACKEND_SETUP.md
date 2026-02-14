# Backend Architecture Guide

## Overview
Your application now uses **React Router** for dynamic URLs and **Firebase Cloud Functions** as the backend API service.

## Directory Structure

```
├── functions/
│   ├── src/
│   │   ├── index.ts           # Main Cloud Functions export
│   │   ├── api.ts             # API functions (new)
│   │   ├── translation.ts     # Translation functions (existing)
│   │   └── ...
│   ├── package.json
│   └── tsconfig.json
├── src/
│   ├── App.tsx                # React Router setup (updated)
│   ├── hooks/
│   │   └── usePageNavigation.ts # Navigation utility
│   ├── lib/
│   │   ├── firebase.ts        # Firebase initialization (updated)
│   │   ├── backendAPI.ts      # Backend API client (new)
│   │   └── ...
│   └── pages/
│       └── [pages with proper URLs]
└── [other files]
```

## URL Routes

All pages now have proper URLs:

| Page | Old Method | New URL |
|------|-----------|---------|
| Home | Via state | `/` |
| Services | Via state | `/services` |
| Contact | Via state | `/contact` |
| Get Started | Via state | `/get-started` |
| Dashboard | Via state | `/dashboard` |
| Authentication | Via state | `/auth` |
| Admin Login | Via state | `/admin/login` |
| Admin Setup | Via state | `/admin/setup` |
| Admin Dashboard | Via state | `/admin/dashboard` |

## Firebase Cloud Functions

### Available Functions

#### 1. `getAvailableStates`
Get all states configured in State Pricing Management.

```typescript
import { backendAPI } from './lib/backendAPI';

const states = await backendAPI.getAvailableStates();
// Returns: Array of {code, name, ...pricing}
```

#### 2. `getStatePricing`
Get pricing details for a specific state.

```typescript
const pricing = await backendAPI.getStatePricing('CA');
// Returns: {state, name, basic_price, epic_price, ultimate_price, ...}
```

#### 3. `createApplication`
Create a new LLC application (requires authentication).

```typescript
const result = await backendAPI.createApplication({
  state: 'CA',
  state_name: 'California',
  company_name: 'My LLC',
  package_id: 'pkg_123',
  form_data: {
    memberName: 'John Doe',
    email: 'john@example.com',
    // ... other form fields
  }
});
// Returns: { success: true, applicationId: '...' }
```

#### 4. `getUserApplications`
Get user's LLC applications (requires authentication).

```typescript
const applications = await backendAPI.getUserApplications();
// Returns: Array of application objects
```

#### 5. `getPackages`
Get all packages, optionally filtered by state.

```typescript
const packages = await backendAPI.getPackages('CA');
const allPackages = await backendAPI.getPackages();
// Returns: Array of package objects
```

## Deploying Cloud Functions

### Prerequisites
- Firebase CLI installed: `npm install -g firebase-tools`
- Authenticated with Firebase: `firebase login`
- Project initialized: `firebase init` (already done)

### Deploy Functions

```bash
# Deploy all functions
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:getAvailableStates

# Deploy with specific project
firebase deploy --project=your-project-id
```

### View Function Logs

```bash
# View all logs
firebase functions:log

# Real-time logs
firebase functions:log --follow

# Filter by function
firebase functions:log --limit=50
```

## Development & Testing

### Local Testing with Emulator

1. Install Firebase Emulator Suite:
```bash
firebase init emulators
```

2. Start emulators:
```bash
firebase emulators:start
```

3. Enable emulator in `firebase.ts`:
```typescript
// Uncomment the emulator section in firebase.ts
connectFunctionsEmulator(functions, 'localhost', 5001);
```

4. Test functions directly in browser console:
```javascript
const getStates = firebase.functions().httpsCallable('getAvailableStates');
getStates().then(result => console.log(result.data));
```

### Adding New API Functions

1. Add function to `functions/src/api.ts`:

```typescript
export const myNewFunction = functions.https.onCall(async (data, context) => {
  // Your function logic
  return { success: true, data: ... };
});
```

2. Export from `functions/src/index.ts`:

```typescript
export { myNewFunction };
```

3. Add method to `src/lib/backendAPI.ts`:

```typescript
export const backendAPI = {
  // ... existing methods
  
  async myNewFunction(params: any) {
    try {
      const func = httpsCallable(functions, 'myNewFunction');
      const result = await func(params);
      return result.data;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
};
```

4. Use in your component:

```typescript
import { backendAPI } from '../lib/backendAPI';

const result = await backendAPI.myNewFunction(params);
```

## Best Practices

### Security Rules
Add Firestore security rules to `firestore.rules`:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own applications
    match /llc_applications/{applicationId} {
      allow read, write: if request.auth.uid == resource.data.user_id;
      allow create: if request.auth.uid != null;
    }
    
    // Anyone can read state pricing
    match /package_state/{stateCode} {
      allow read: if request.auth != null;
    }
    
    // Admin-only access
    match /admin_settings/{document=**} {
      allow read, write: if isAdmin();
    }
  }
  
  function isAdmin() {
    return request.auth.token.admin == true;
  }
}
```

### Error Handling

All API functions include proper error handling:

```typescript
try {
  const result = await backendAPI.getAvailableStates();
} catch (error: any) {
  if (error.code === 'unauthenticated') {
    // Handle authentication error
  } else if (error.code === 'not-found') {
    // Handle not found error
  } else {
    // Handle other errors
  }
}
```

### Performance

- Use indexed queries in Firestore
-  Implement pagination for large datasets
- Cache frequently accessed data
- Use request validation

## Integrating with Existing Pages

### GetStartedPage Example

```typescript
import { useEffect, useState } from 'react';
import { backendAPI } from '../lib/backendAPI';

export default function GetStartedPage() {
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStates();
  }, []);

  const loadStates = async () => {
    try {
      const statesData = await backendAPI.getAvailableStates();
      setStates(statesData);
    } catch (error) {
      console.error('Failed to load states:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Use states data */}
      {states.map(state => (
        <option key={state.code} value={state.code}>
          {state.name}
        </option>
      ))}
    </div>
  );
}
```

## Environment Variables

Ensure these are set in `.env`:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

## Next Steps

1. ✅ React Router is set up - pages now have proper URLs
2. ✅ Cloud Functions API is defined
3. ⚠️ Deploy Cloud Functions: `firebase deploy --only functions`
4. 🔄 Update pages to use `backendAPI` instead of direct Firestore calls
5. 📝 Add unit tests for Cloud Functions
6. 🔐 Implement proper security rules
7. 📊 Set up monitoring and analytics

## Troubleshooting

### Cloud Functions not working
- Check Firebase project is set up correctly
- Verify functions are deployed: `firebase deploy --only functions`
- Check function logs: `firebase functions:log`

### CORS Issues
- Add CORS headers if needed (already included in Cloud Functions)

### Authentication errors
- User must be logged in for protected functions
- Check authentication context is properly initialized

## Additional Resources

- [Firebase Cloud Functions Documentation](https://firebase.google.com/docs/functions)
- [React Router Documentation](https://reactrouter.com/)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
