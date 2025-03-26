import { initializeApp, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// For debugging purposes - log the config without sensitive values
console.log('Firebase Config:', {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '**exists**' : '**missing**',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '**exists**' : '**missing**',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '**exists**' : '**missing**',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? '**exists**' : '**missing**',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? '**exists**' : '**missing**',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? '**exists**' : '**missing**'
});

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage;

try {
  app = getApp();
} catch {
  app = initializeApp(firebaseConfig);
  console.log('Firebase Config:', {
    apiKey: '**exists**',
    authDomain: '**exists**',
    projectId: '**exists**',
    storageBucket: '**exists**',
    messagingSenderId: '**exists**',
    appId: '**exists**'
  });
  console.log('Firebase initialized successfully');
}

auth = getAuth(app);
db = getFirestore(app);
storage = getStorage(app);

export { app, db, auth, storage }; 