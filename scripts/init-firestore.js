// This script initializes Firestore collections for the admin dashboard
const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  getDocs,
  addDoc,
  serverTimestamp 
} = require('firebase/firestore');

// Your Firebase configuration - replace with your actual values
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyD1l4xwytu_hGvx--pb91bjBUM8nbZcSE4",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "my-secand-chance.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "my-secand-chance",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "my-secand-chance.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "872159356088",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:872159356088:web:7f25ce9288d48f76edc04d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to create a collection if it doesn't exist
async function ensureCollectionExists(collectionName, sampleData) {
  console.log(`Checking if ${collectionName} collection exists...`);
  const collectionRef = collection(db, collectionName);
  const snapshot = await getDocs(collectionRef);
  
  if (snapshot.empty) {
    console.log(`Collection ${collectionName} is empty, creating sample data...`);
    
    try {
      const docRef = await addDoc(collectionRef, {
        ...sampleData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      console.log(`Created sample ${collectionName} with ID: ${docRef.id}`);
    } catch (error) {
      console.error(`Error creating sample ${collectionName}:`, error);
    }
  } else {
    console.log(`Collection ${collectionName} already has data, skipping...`);
  }
}

// Initialize collections
async function initializeCollections() {
  try {
    // Ensure categories collection exists with sample data
    await ensureCollectionExists('categories', {
      name: 'Sample Category',
      description: 'This is a sample category created automatically',
      isActive: true,
    });
    
    // Ensure products collection exists with sample data
    await ensureCollectionExists('products', {
      name: 'Sample Product',
      description: 'This is a sample product created automatically',
      price: 29.99,
      categoryId: 'sample', // This would be replaced with an actual category ID in a real scenario
      stock: 10,
      isActive: true,
    });
    
    console.log('Firestore initialization complete.');
  } catch (error) {
    console.error('Error initializing Firestore:', error);
  }
}

// Run the initialization
initializeCollections(); 