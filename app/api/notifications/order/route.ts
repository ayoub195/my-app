import { NextResponse } from 'next/server';
import { OrderData } from '@/lib/services/sales-service';
import { sendOrderNotificationEmail } from '@/lib/services/email-service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { order } = body as { order: OrderData & { id: string } };
    
    if (!order) {
      console.error('No order data provided');
      return NextResponse.json(
        { success: false, error: 'Order data is required' },
        { status: 400 }
      );
    }

    console.log('Processing order notification:', {
      orderId: order.id,
      email: order.email,
      status: order.status
    });

    // Map the order data to match the email service interface
    const emailData = {
      orderId: order.id,
      productName: order.productName,
      amount: order.amount,
      customerName: `${order.firstName} ${order.lastName}`,
      customerEmail: order.email,
      customerPhone: order.phoneNumber || '',
      status: order.status
    };

    // Send email notification
    try {
      await sendOrderNotificationEmail(emailData);
      console.log('Email notification sent successfully');
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      return NextResponse.json(
        { success: false, error: 'Failed to send email notification', details: emailError.message },
        { status: 500 }
      );
    }

    // Log for debugging
    console.log(`
      ========================================
      NEW ORDER NOTIFICATION
      ========================================
      Order ID: ${order.id}
      Product: ${order.productName}
      Amount: $${order.amount}
      Customer: ${order.firstName} ${order.lastName}
      Email: ${order.email}
      Phone: ${order.phoneNumber || 'Not provided'}
      Status: ${order.status}
      ========================================
    `);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in notification endpoint:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send notification', details: error.message },
      { status: 500 }
    );
  }
} 