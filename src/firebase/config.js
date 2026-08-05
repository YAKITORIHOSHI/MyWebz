import { initializeApp } from 'firebase/app';
import { initializeAuth, browserLocalPersistence, inMemoryPersistence } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// City College of Tagaytay Firebase Credentials Configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyABXspXcQOGHxVCHTM5IdNp6XIazui1CVk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "academicdashboarddata.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "academicdashboarddata",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "academicdashboarddata.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "220617074534",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:220617074534:web:db3aa2fcd106ef72e8caa7",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://academicdashboarddata-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Session persistence strategy:
// - Default: inMemoryPersistence (tab close = instant logout, no IndexedDB)
// - "Keep me signed in": browserLocalPersistence (session survives tab/browser close)
const KEEP_SIGNED_IN_KEY = 'cct_keep_signed_in';
const userWantsToStaySignedIn = localStorage.getItem(KEEP_SIGNED_IN_KEY) === 'true';

let app, auth, rtdb;
let isFirebaseInitialized = false;

try {
  app = initializeApp(firebaseConfig);

  // initializeAuth (not getAuth) ensures persistence is set BEFORE any cached session is loaded.
  // This is the critical difference: getAuth() loads IndexedDB sessions first, then setPersistence changes future behavior.
  // initializeAuth() sets persistence from the start, so inMemoryPersistence means NO cached session is ever read.
  auth = initializeAuth(app, {
    persistence: userWantsToStaySignedIn ? browserLocalPersistence : inMemoryPersistence
  });

  rtdb = getDatabase(app);
  isFirebaseInitialized = true;
} catch (error) {
  console.warn("Firebase initialization error:", error);
}

export { app, auth, rtdb, isFirebaseInitialized, KEEP_SIGNED_IN_KEY };
