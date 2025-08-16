# Firebase Setup Instructions

## Step 1: Get Your Firebase Configuration

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your existing project (the one used by your Android apps)
3. Click on the gear icon (Settings) → Project settings
4. Scroll down to "Your apps" section
5. Click "Add app" → Web app (</>) icon
6. Register your web app with a nickname (e.g., "Fruit Store Website")
7. Copy the Firebase configuration object

## Step 2: Update Firebase Configuration

Replace the placeholder values in `src/config/firebase.ts` with your actual Firebase configuration:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-actual-sender-id",
  appId: "your-actual-app-id"
};
```

## Step 3: Enable Authentication Methods

1. In Firebase Console, go to Authentication → Sign-in method
2. Enable the following providers:
   - **Phone**: Enable phone authentication
   - **Google**: Enable Google sign-in provider

## Step 4: Configure Authorized Domains

**CRITICAL: This step is required for authentication to work!**

1. In Authentication → Settings → Authorized domains
2. Click "Add domain" and add the following domains:
   - `localhost` (for development - **REQUIRED**)
   - `127.0.0.1` (alternative localhost format)
   - Your production domain when you deploy (e.g., `yoursite.netlify.app`)

**Note**: Without adding `localhost` to authorized domains, you will get the error:
`Firebase: Hostname match not found (auth/captcha-check-failed)`

## Step 5: Firestore Security Rules

Make sure your Firestore security rules allow web access. Here's a basic example:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /Users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can read/write their own orders
    match /Orders/{orderId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.user_id || 
         request.auth.uid == request.resource.data.user_id);
    }
    
    // Users can read/write their own notifications
    match /Notification/{notificationId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.user_id || 
         request.auth.uid == request.resource.data.user_id);
    }
    
    // Users can read/write their own addresses
    match /addresses/{addressId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.user_id || 
         request.auth.uid == request.resource.data.user_id);
    }
  }
}
```

## Step 6: Test the Integration

1. Start your development server: `npm run dev`
2. Try signing in with phone number
3. Try signing in with Google
4. Check if user data appears in Firestore Users collection
5. Test placing an order and check Orders collection

## Important Notes

- The phone authentication requires reCAPTCHA verification
- Make sure your Firebase project has the same collections as your Android app
- User accounts will be shared between Android app and website using the same Firebase project
- Only Cash on Delivery payment is implemented as requested