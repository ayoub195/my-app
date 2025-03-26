import { Metadata } from 'next';
import { getFirestore } from 'firebase-admin/firestore';
import { getApp, getApps, initializeApp, cert } from 'firebase-admin/app';
import OrderDetailView from '../components/OrderDetailView';

export const metadata: Metadata = {
  title: 'Order Details',
  description: 'View order details and manage order status',
};

type PageParams = {
  id: string;
};

export default async function OrderDetailPage(props: {
  params: PageParams;
}) {
  const id = props.params.id;
  
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
    const order = {
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