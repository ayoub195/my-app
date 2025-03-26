import nodemailer from 'nodemailer';

// Initialize NodeMailer transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

interface EmailData {
  orderId: string;
  productName: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: string;
}

// Send notification to admin and customer
export const sendOrderNotificationEmail = async (data: EmailData) => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.error('Gmail credentials not configured');
    throw new Error('Email service not configured');
  }

  try {
    // Send admin notification
    const adminMsg = {
      from: `"ConnectZen Store" <${process.env.GMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL || process.env.GMAIL_USER,
      subject: `New Order Notification: ${data.orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb; margin-bottom: 20px;">New Order Notification</h1>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1f2937; margin-top: 0;">Order Details</h2>
            <p><strong>Order ID:</strong> ${data.orderId}</p>
            <p><strong>Product:</strong> ${data.productName}</p>
            <p><strong>Amount:</strong> $${data.amount.toFixed(2)}</p>
            <p><strong>Status:</strong> ${data.status}</p>
          </div>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px;">
            <h2 style="color: #1f2937; margin-top: 0;">Customer Information</h2>
            <p><strong>Name:</strong> ${data.customerName}</p>
            <p><strong>Email:</strong> ${data.customerEmail}</p>
            <p><strong>Phone:</strong> ${data.customerPhone || 'Not provided'}</p>
          </div>
          
          <div style="margin-top: 20px; text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/sales" 
               style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Order Details
            </a>
          </div>
        </div>
      `
    };

    // Send customer notification
    const customerMsg = {
      from: `"ConnectZen Store" <${process.env.GMAIL_USER}>`,
      to: data.customerEmail,
      subject: `Order Confirmation: ${data.orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb; margin-bottom: 20px;">Thank You for Your Order!</h1>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1f2937; margin-top: 0;">Order Details</h2>
            <p><strong>Order ID:</strong> ${data.orderId}</p>
            <p><strong>Product:</strong> ${data.productName}</p>
            <p><strong>Amount:</strong> $${data.amount.toFixed(2)}</p>
            <p><strong>Status:</strong> ${data.status}</p>
          </div>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px;">
            <h2 style="color: #1f2937; margin-top: 0;">Your Information</h2>
            <p><strong>Name:</strong> ${data.customerName}</p>
            <p><strong>Email:</strong> ${data.customerEmail}</p>
            <p><strong>Phone:</strong> ${data.customerPhone || 'Not provided'}</p>
          </div>
          
          <div style="margin-top: 20px; background-color: #f3f4f6; padding: 20px; border-radius: 8px;">
            <h2 style="color: #1f2937; margin-top: 0;">What's Next?</h2>
            <p>1. Your order has been received and is being processed</p>
            <p>2. You'll receive updates about your order status via email</p>
            <p>3. If you have any questions, please contact us at ${process.env.GMAIL_USER}</p>
          </div>
          
          <div style="margin-top: 20px; text-align: center; color: #6b7280;">
            <p>Thank you for shopping with us!</p>
            <p>ConnectZen Store Team</p>
          </div>
        </div>
      `
    };

    // Send both emails concurrently
    await Promise.all([
      transporter.sendMail(adminMsg),
      transporter.sendMail(customerMsg)
    ]);

    console.log('Order notification emails sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Send order status update notification to customer
export const sendOrderStatusUpdateEmail = async (data: EmailData) => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.error('Gmail credentials not configured');
    throw new Error('Email service not configured');
  }

  try {
    const statusMessages = {
      confirmed: 'Your order has been approved and confirmed',
      declined: 'Your order has been declined',
      completed: 'Your order has been completed',
      pending: 'Your order is now pending review'
    };

    const statusMessage = statusMessages[data.status as keyof typeof statusMessages] || 
                         `Your order status has been updated to ${data.status}`;

    const customerMsg = {
      from: `"ConnectZen Store" <${process.env.GMAIL_USER}>`,
      to: data.customerEmail,
      subject: `Order Status Update: ${data.orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb; margin-bottom: 20px;">Order Status Update</h1>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1f2937; margin-top: 0;">${statusMessage}</h2>
            <p><strong>Order ID:</strong> ${data.orderId}</p>
            <p><strong>Product:</strong> ${data.productName}</p>
            <p><strong>Amount:</strong> $${data.amount.toFixed(2)}</p>
            <p><strong>Status:</strong> ${data.status}</p>
          </div>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px;">
            <h2 style="color: #1f2937; margin-top: 0;">Your Information</h2>
            <p><strong>Name:</strong> ${data.customerName}</p>
            <p><strong>Email:</strong> ${data.customerEmail}</p>
            <p><strong>Phone:</strong> ${data.customerPhone || 'Not provided'}</p>
          </div>
          
          <div style="margin-top: 20px; background-color: #f3f4f6; padding: 20px; border-radius: 8px;">
            <h2 style="color: #1f2937; margin-top: 0;">What's Next?</h2>
            ${data.status === 'confirmed' ? `
            <p>1. Your order has been approved and will be processed</p>
            <p>2. You'll receive another email when your order is completed</p>
            ` : data.status === 'completed' ? `
            <p>1. Your order has been completed</p>
            <p>2. Thank you for shopping with us!</p>
            ` : data.status === 'declined' ? `
            <p>1. Your order has been declined</p>
            <p>2. If you have any questions, please contact us</p>
            ` : `
            <p>1. We'll keep you updated on any changes to your order</p>
            `}
            <p>If you have any questions, please contact us at ${process.env.GMAIL_USER}</p>
          </div>
          
          <div style="margin-top: 20px; text-align: center; color: #6b7280;">
            <p>Thank you for choosing ConnectZen Store!</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(customerMsg);
    console.log('Order status update email sent successfully');
  } catch (error) {
    console.error('Error sending status update email:', error);
    throw error;
  }
}; 