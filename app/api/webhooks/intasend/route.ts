import { NextResponse } from 'next/server';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';

// In a real implementation, you would use your database here
// This is a placeholder for demonstration purposes
const savePayment = async (data: any) => {
  console.log('Payment saved:', data);
  return true;
};

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const body = JSON.parse(rawBody);
    
    console.log('IntaSend webhook received:', body);
    
    // Verify webhook signature if available
    const signature = request.headers.get('x-intasend-signature');
    
    // Handle different event types
    switch (body.event) {
      case 'payment.completed':
      case 'payment.complete':
        await handlePaymentCompleted(body.data);
        break;
      case 'payment.failed':
        await handlePaymentFailed(body.data);
        break;
      case 'payment.pending':
        await handlePaymentPending(body.data);
        break;
      default:
        console.log('Unhandled IntaSend event type:', body.event);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { success: false, error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentCompleted(data: any) {
  try {
    // Update your database with payment information
    const paymentRef = collection(db, 'payments');
    await addDoc(paymentRef, {
      invoiceId: data.invoice?.invoice_id,
      reference: data.invoice?.reference,
      amount: parseFloat(data.invoice?.amount || '0'),
      status: 'completed',
      customerEmail: data.customer?.email,
      customerName: `${data.customer?.first_name} ${data.customer?.last_name}`,
      paymentMethod: data.payment_method,
      transactionDate: new Date(),
      rawData: data,
      createdAt: serverTimestamp()
    });
    console.log('Payment completed and saved to database');
  } catch (error) {
    console.error('Error saving completed payment:', error);
  }
}

async function handlePaymentFailed(data: any) {
  try {
    // Log failed payment
    const paymentRef = collection(db, 'payments');
    await addDoc(paymentRef, {
      invoiceId: data.invoice?.invoice_id,
      reference: data.invoice?.reference,
      amount: parseFloat(data.invoice?.amount || '0'),
      status: 'failed',
      customerEmail: data.customer?.email,
      customerName: `${data.customer?.first_name} ${data.customer?.last_name}`,
      errorMessage: data.error_message,
      failureReason: data.failure_reason,
      rawData: data,
      createdAt: serverTimestamp()
    });
    console.log('Failed payment recorded in database');
  } catch (error) {
    console.error('Error saving failed payment:', error);
  }
}

async function handlePaymentPending(data: any) {
  try {
    // Log pending payment
    const paymentRef = collection(db, 'payments');
    await addDoc(paymentRef, {
      invoiceId: data.invoice?.invoice_id,
      reference: data.invoice?.reference,
      amount: parseFloat(data.invoice?.amount || '0'),
      status: 'pending',
      customerEmail: data.customer?.email,
      customerName: `${data.customer?.first_name} ${data.customer?.last_name}`,
      paymentMethod: data.payment_method,
      rawData: data,
      createdAt: serverTimestamp()
    });
    console.log('Pending payment recorded in database');
  } catch (error) {
    console.error('Error saving pending payment:', error);
  }
} 