import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBcenzLE1BSgtC6zs1Iat0DUb-OKgvu_w4",
  authDomain: "superfruitcenter1979.firebaseapp.com",
  projectId: "superfruitcenter1979",
  storageBucket: "superfruitcenter1979.firebasestorage.app",
  messagingSenderId: "352081158916",
  appId: "1:352081158916:web:36e178fa7ec061f092a651",
  measurementId: "G-E7HZZNNB21"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Analytics (only in browser environment)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;