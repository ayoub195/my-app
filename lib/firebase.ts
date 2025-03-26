import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

import { initializeApp as initializeClientApp } from 'firebase/app';
import { getFirestore as getClientFirestore } from 'firebase/firestore';
import { getAuth as getClientAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase Admin SDK (server-side)
const initializeAdminApp = () => {
  if (getApps().length === 0) {
    return initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
      databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
    });
  }
};

// Initialize Firebase Client SDK (client-side)
const initializeClient = () => {
  return initializeClientApp(firebaseConfig);
};

// Initialize Firestore and Auth based on environment
let db;
let auth;

if (typeof window === 'undefined') {
  // Server-side
  const adminApp = initializeAdminApp();
  db = getFirestore();
  auth = getAuth();
} else {
  // Client-side
  const clientApp = initializeClient();
  db = getClientFirestore(clientApp);
  auth = getClientAuth(clientApp);
}

export { db, auth }; 