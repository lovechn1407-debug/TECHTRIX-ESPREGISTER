import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCLLVF1XwlZEqQjg_9iD3NHx3KagHbvusM",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "techtrix-espregister.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://techtrix-espregister-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "techtrix-espregister",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "techtrix-espregister.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "203804289655",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:203804289655:web:e22ccd18cfc90e3886f472",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-4CDRKLNSJ6"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const database = getDatabase(app);
export const googleProvider = new GoogleAuthProvider();

// Request basic profile and email
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;
