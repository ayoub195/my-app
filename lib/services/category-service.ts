import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase-client';
import { Category } from '@/lib/models';

const COLLECTION_NAME = 'categories';

// Convert Firestore data to Category
const convertToCategory = (doc: any): Category => {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name,
    description: data.description,
    imageUrl: data.imageUrl,
    isActive: data.isActive,
    createdAt: data.createdAt?.toDate(),
    updatedAt: data.updatedAt?.toDate()
  };
};

// Get all categories
export const getAllCategories = async (): Promise<Category[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    return querySnapshot.docs.map(convertToCategory);
  } catch (error) {
    console.error('Error getting categories:', error);
    throw error;
  }
};

// Get category by ID
export const getCategoryById = async (id: string): Promise<Category | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return convertToCategory(docSnap);
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting category:', error);
    throw error;
  }
};

// Create a new category
export const createCategory = async (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const newCategory = {
      ...category,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), newCategory);
    return docRef.id;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

// Update a category
export const updateCategory = async (id: string, category: Partial<Category>): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const updatedFields = { ...category, updatedAt: serverTimestamp() };
    
    await updateDoc(docRef, updatedFields);
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

// Delete a category
export const deleteCategory = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
}; 