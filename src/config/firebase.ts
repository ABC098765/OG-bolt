import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDBk7Njz9W1Gd6q97S-XtxqnXrkStbJZnk",
  authDomain: "super-fruit-center-69794.firebaseapp.com",
  projectId: "super-fruit-center-69794",
  storageBucket: "super-fruit-center-69794.appspot.com",
  messagingSenderId: "334494456886",
  appId: "1:334494456886:web:super-fruit-center-69794"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;