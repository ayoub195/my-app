import { NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { sendOrderStatusUpdateEmail } from '@/lib/services/email-service';

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

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await request.json();
    const validStatuses = ['pending', 'completed', 'declined', 'confirmed'];

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
        },
        { status: 400 }
      );
    }

    const db = getFirestore();
    const orderRef = db.collection('sales').doc(params.id);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    const orderData = orderSnap.data();
    await orderRef.update({
      status,
      updatedAt: new Date().toISOString()
    });

    // Send email notification for status update
    try {
      await sendOrderStatusUpdateEmail({
        orderId: params.id,
        productName: orderData?.productName,
        amount: orderData?.amount,
        customerName: `${orderData?.firstName} ${orderData?.lastName}`,
        customerEmail: orderData?.email,
        customerPhone: orderData?.phoneNumber || '',
        status
      });
    } catch (emailError) {
      console.error('Failed to send status update email:', emailError);
      // Continue with the response even if email fails
    }

    return NextResponse.json({
      success: true,
      message: `Order status updated to ${status}`
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update order status' },
      { status: 500 }
    );
  }
} 