'use client';

import React, { useState } from 'react';
import { Product } from '@/lib/models';
import { createOrder, OrderFormData } from '@/lib/services/sales-service';
import { createCheckout } from '@/lib/intasend-api';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

// Add this CSS at the top of your file, after the imports
const arrowAnimation = `
@keyframes bounceRight {
  0%, 100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(10px);
  }
}
`;

export default function ProductDetailModal({ product, onClose }: ProductDetailModalProps) {
  const [customerInfo, setCustomerInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: ''
  });
  const [showCheckout, setShowCheckout] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  if (!product) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleShowCheckout = () => {
    setShowCheckout(true);
  };

  const handlePaymentSuccess = (data: any) => {
    console.log('Payment initiated:', data);
    onClose();
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    setError(`Payment error: ${error}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!customerInfo.firstName || !customerInfo.lastName || !customerInfo.email) {
      setError('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    try {
      // Create the order in Firestore
      const orderData: OrderFormData = {
        firstName: customerInfo.firstName,
        lastName: customerInfo.lastName,
        email: customerInfo.email,
        phoneNumber: customerInfo.phoneNumber,
        product: product
      };
      
      const id = await createOrder(orderData);
      setOrderId(id);
      setOrderPlaced(true);

      // Automatically initiate payment after order is created
      const checkoutResponse = await createCheckout({
        amount: product.price,
        email: customerInfo.email,
        first_name: customerInfo.firstName,
        last_name: customerInfo.lastName,
        phone_number: customerInfo.phoneNumber,
        reference: id,
        comment: `Payment for ${product.name}`,
        currency: 'USD'
      });

      if (checkoutResponse.success && checkoutResponse.data) {
        const checkoutUrl = checkoutResponse.data.url || checkoutResponse.data.checkout_url;
        if (checkoutUrl) {
          handlePaymentSuccess(checkoutResponse.data);
          window.location.href = checkoutUrl;
        } else {
          throw new Error('No checkout URL received');
        }
      } else {
        throw new Error(checkoutResponse.error || 'Checkout failed');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Failed to process your order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <style>{arrowAnimation}</style>
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center border-b px-6 py-4">
          <h2 className="text-xl font-bold text-gray-800">Product Details</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Product Image */}
            <div className="w-full md:w-1/2">
              {product.imageUrl ? (
                <img 
                  src={product.imageUrl} 
                  alt={product.name}
                  className="w-full h-auto object-cover rounded-lg shadow-md max-h-80 md:max-h-96"
                />
              ) : (
                <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-lg">
                  <span className="text-gray-400">No image available</span>
                </div>
              )}
            </div>
            
            {/* Product Info */}
            <div className="w-full md:w-1/2">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
              
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl font-bold text-green-600">${product.price.toFixed(2)}</span>
                
                {product.stock > 0 ? (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    In Stock ({product.stock})
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                    Out of Stock
                  </span>
                )}
              </div>
              
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 uppercase mb-2">DESCRIPTION</h3>
                <p className="text-gray-600">{product.description || 'No description available'}</p>
              </div>

              {/* Order Placed Success Message */}
              {orderPlaced && (
                <div className="bg-green-100 text-green-800 p-4 rounded-md mb-4">
                  <div className="flex items-center mb-2">
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-medium">Order Created Successfully!</span>
                  </div>
                  <p className="text-sm">Your order has been placed. Order ID: {orderId}</p>
                  <p className="text-sm mt-1">Redirecting to payment...</p>
                </div>
              )}

              {/* Buy Now Section */}
              {!showCheckout ? (
                <button
                  onClick={handleShowCheckout}
                  disabled={product.stock <= 0}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {product.stock > 0 ? 'Buy Now' : 'Out of Stock'}
                </button>
              ) : (
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
                  
                  {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
                      {error}
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                          First Name *
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          value={customerInfo.firstName}
                          onChange={handleInputChange}
                          className="w-full p-2 border rounded-md text-gray-900"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          value={customerInfo.lastName}
                          onChange={handleInputChange}
                          className="w-full p-2 border rounded-md text-gray-900"
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={customerInfo.email}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md text-gray-900"
                        required
                      />
                    </div>

                    <div className="mb-6">
                      <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        value={customerInfo.phoneNumber}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md text-gray-900"
                      />
                    </div>

                    <div className="relative flex items-center">
                      <div className="mr-4">
                        <svg 
                          className="w-8 h-8 text-blue-600 animate-[bounceRight_1s_ease-in-out_infinite]" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                          style={{ transform: 'scaleX(-1)' }}
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M13 7l5 5m0 0l-5 5m5-5H6" 
                          />
                        </svg>
                      </div>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                      >
                        {isSubmitting ? 'Processing...' : 'Continue to Payment'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 