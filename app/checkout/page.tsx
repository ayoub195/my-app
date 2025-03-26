'use client';

import React, { useState } from 'react';
import IntaSendCheckout from '@/components/checkout/IntaSendCheckout';
import Link from 'next/link';

export default function CheckoutPage() {
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handlePaymentSuccess = (data: any) => {
    console.log('Payment initiated:', data);
    setPaymentStatus('Payment initiated successfully. You will be redirected to the payment page.');
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    setPaymentError(`Payment error: ${error}`);
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
        <div className="border-b pb-4 mb-4">
          <div className="flex justify-between mb-2">
            <span>Premium Package</span>
            <span>$99.99</span>
          </div>
        </div>
        
        <div className="flex justify-between font-bold">
          <span>Total</span>
          <span>$99.99</span>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p><strong>Name:</strong> John Doe</p>
            <p><strong>Email:</strong> john@example.com</p>
          </div>
          <div>
            <p><strong>Phone:</strong> +1234567890</p>
          </div>
        </div>
      </div>
      
      {paymentStatus && (
        <div className="bg-green-100 text-green-700 p-4 rounded-md mb-6">
          {paymentStatus}
        </div>
      )}
      
      {paymentError && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
          {paymentError}
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <Link href="/" className="text-blue-600 hover:underline">
          Return to Home
        </Link>
        
        <IntaSendCheckout
          amount={99.99}
          customerInfo={{
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            phoneNumber: '+1234567890'
          }}
          productName="Premium Package"
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
      </div>
    </div>
  );
} 