import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    "AIzaSyBLwSFwP35aygvi8Kx6KYu21gcAGFfEJ70",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    "lost-and-found-75cf0.firebaseapp.com",
  databaseURL:
    import.meta.env.VITE_FIREBASE_DATABASE_URL ||
    "https://lost-and-found-75cf0-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "lost-and-found-75cf0",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    "lost-and-found-75cf0.firebasestorage.app",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1018958257203",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    "1:1018958257203:web:f33994508a7fc361469746",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-7TMFSMQYP8",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
