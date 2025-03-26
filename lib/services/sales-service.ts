import { 
  collection, 
  addDoc, 
  serverTimestamp,
  doc,
  updateDoc,
  Firestore
} from 'firebase/firestore';
import { db } from '@/lib/firebase-client';
import { Product } from '@/lib/models';

export interface OrderFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  product: Product;
}

export interface OrderData {
  productId: string;
  productName: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: any; // Firebase Timestamp
}

// Create a new order in Firestore
export const createOrder = async (orderData: OrderFormData): Promise<string> => {
  try {
    if (!db) {
      throw new Error('Firestore is not initialized');
    }

    const newOrder: OrderData = {
      productId: orderData.product.id || '',
      productName: orderData.product.name,
      firstName: orderData.firstName,
      lastName: orderData.lastName,
      email: orderData.email,
      phoneNumber: orderData.phoneNumber,
      amount: orderData.product.price,
      status: 'pending',
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'sales'), newOrder);
    
    // Send email notification
    await sendOrderNotification(newOrder, docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating order:', error);
    throw new Error('Failed to create order');
  }
};

// Update order status
export const updateOrderStatus = async (
  orderId: string, 
  status: 'pending' | 'completed' | 'cancelled'
): Promise<void> => {
  try {
    if (!db) {
      throw new Error('Firestore is not initialized');
    }

    const orderRef = doc(db, 'sales', orderId);
    await updateDoc(orderRef, {
      status,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    throw new Error('Failed to update order status');
  }
};

// Send email notification about order
const sendOrderNotification = async (orderData: OrderData, orderId: string): Promise<void> => {
  try {
    console.log('Attempting to send order notification:', {
      orderId,
      email: orderData.email,
      productName: orderData.productName
    });

    // Create an order notification endpoint to handle email sending
    const response = await fetch('/api/notifications/order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        order: {
          ...orderData,
          id: orderId
        }
      }),
    });

    const responseData = await response.json();
    console.log('Notification API response:', responseData);

    if (!response.ok) {
      throw new Error(`Failed to send notification: ${responseData.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error sending notification:', error);
    // We don't want to fail the order creation if notification fails
    // so we just log the error
  }
}; 