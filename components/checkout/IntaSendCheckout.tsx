'use client';

import React, { useState } from 'react';
import { createCheckout } from '@/lib/intasend-api';

interface IntaSendCheckoutProps {
  amount: number;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
  orderId?: string;
  productName: string;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

const IntaSendCheckout: React.FC<IntaSendCheckoutProps> = ({
  amount,
  customerInfo,
  orderId,
  productName,
  onSuccess,
  onError,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await createCheckout({
        amount,
        email: customerInfo.email,
        first_name: customerInfo.firstName,
        last_name: customerInfo.lastName,
        phone_number: customerInfo.phoneNumber,
        reference: orderId || `Order-${Date.now()}`,
        comment: `Payment for ${productName}`,
        currency: 'USD'
      });

      if (response.success && response.data) {
        const checkoutUrl = response.data.url || response.data.checkout_url;
        if (checkoutUrl) {
          if (onSuccess) onSuccess(response.data);
          window.location.href = checkoutUrl;
        } else {
          throw new Error('No checkout URL received');
        }
      } else {
        throw new Error(response.error || 'Checkout failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Checkout failed';
      setError(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={isLoading}
      className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
    >
      {isLoading ? 'Processing...' : 'Pay Now'}
    </button>
  );
};

export default IntaSendCheckout; 