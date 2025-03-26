import { getFirestore } from 'firebase-admin/firestore';
import { getApp, getApps, initializeApp, cert } from 'firebase-admin/app';
import OrderDetailView from '../components/OrderDetailView';

interface OrderData {
  id: string;
  product: {
    name: string;
  };
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  amount: number;
  status: 'pending' | 'completed' | 'declined' | 'confirmed';
  createdAt: {
    seconds: number;
  };
}

// Initialize Firebase Admin if it hasn't been initialized
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

interface PageProps {
  params: {
    id: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const id = params.id;
  
  try {
    const db = getFirestore();
    const orderRef = db.collection('sales').doc(id);
    const orderSnap = await orderRef.get();
    
    if (!orderSnap.exists) {
      return (
        <div className="p-6 text-red-500">Order not found</div>
      );
    }

    const data = orderSnap.data();
    console.log('Raw Firestore Data:', JSON.stringify(data, null, 2));

    // Create a plain JavaScript object with only the data we need
    const order: OrderData = {
      id: orderSnap.id,
      product: {
        name: data?.productName || 'N/A'
      },
      firstName: data?.firstName || 'N/A',
      lastName: data?.lastName || 'N/A',
      email: data?.email || 'N/A',
      phoneNumber: data?.phoneNumber || 'N/A',
      amount: Number(data?.amount) || 0,
      status: (data?.status as 'pending' | 'completed' | 'declined' | 'confirmed') || 'pending',
      createdAt: {
        seconds: data?.createdAt?.seconds || Math.floor(Date.now() / 1000)
      }
    };

    // Log the mapped order object for debugging
    console.log('Mapped Order Object:', JSON.stringify(order, null, 2));

    // Pass the serialized data to the client component
    return <OrderDetailView order={order} orderId={id} />;
  } catch (error) {
    console.error('Error fetching order:', error);
    return (
      <div className="p-6 text-red-500">Failed to load order details</div>
    );
  }
} 