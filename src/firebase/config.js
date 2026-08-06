import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth, browserLocalPersistence, inMemoryPersistence } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// Natsuki College of Imus Firebase Credentials Configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyABXspXcQOGHxVCHTM5IdNp6XIazui1CVk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "academicdashboarddata.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "academicdashboarddata",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "academicdashboarddata.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "220617074534",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:220617074534:web:db3aa2fcd106ef72e8caa7",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://academicdashboarddata-default-rtdb.asia-southeast1.firebasedatabase.app"
};

const KEEP_SIGNED_IN_KEY = 'cct_keep_signed_in';

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let auth;
try {
  auth = getAuth(app);
} catch (e) {
  try {
    const userWantsToStaySignedIn = typeof window !== 'undefined' && localStorage.getItem(KEEP_SIGNED_IN_KEY) === 'true';
    auth = initializeAuth(app, {
      persistence: userWantsToStaySignedIn ? browserLocalPersistence : inMemoryPersistence
    });
  } catch (err) {
    auth = getAuth(app);
  }
}

const rtdb = getDatabase(app);
const isFirebaseInitialized = Boolean(app && auth && rtdb);

export { app, auth, rtdb, firebaseConfig, isFirebaseInitialized, KEEP_SIGNED_IN_KEY };
