'use client';

import { useState } from 'react';

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

interface OrderDetailViewProps {
  order: OrderData;
  orderId: string;
}

export default function OrderDetailView({ order, orderId }: OrderDetailViewProps) {
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<OrderData>(order);

  const handleStatusUpdate = async (newStatus: 'completed' | 'pending' | 'declined' | 'confirmed') => {
    try {
      setUpdating(true);
      const response = await fetch(`/api/sales/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      setCurrentOrder({ ...currentOrder, status: newStatus });
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (seconds: number) => {
    return new Date(seconds * 1000).toLocaleString();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Order Details</h1>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{orderId}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{currentOrder.product?.name || 'N/A'}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{`${currentOrder.firstName} ${currentOrder.lastName}`}</div>
                <div className="text-sm text-gray-500">{currentOrder.email}</div>
                {currentOrder.phoneNumber && (
                  <div className="text-sm text-gray-500">{currentOrder.phoneNumber}</div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${currentOrder.amount.toFixed(2)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(currentOrder.createdAt.seconds)}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${currentOrder.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                  ${currentOrder.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                  ${currentOrder.status === 'declined' ? 'bg-red-100 text-red-800' : ''}
                  ${currentOrder.status === 'confirmed' ? 'bg-blue-100 text-blue-800' : ''}`}
                >
                  {currentOrder.status}
                </span>
              </td>
            </tr>
            <tr>
              <td colSpan={6} className="px-6 py-4">
                <div className="flex justify-end gap-2">
                  {currentOrder.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate('confirmed')}
                        disabled={updating}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 text-sm"
                      >
                        {updating ? 'Updating...' : 'Confirm Order'}
                      </button>
                      <button
                        onClick={() => handleStatusUpdate('declined')}
                        disabled={updating}
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:bg-gray-400 text-sm"
                      >
                        {updating ? 'Updating...' : 'Decline Order'}
                      </button>
                    </>
                  )}

                  {currentOrder.status === 'confirmed' && (
                    <button
                      onClick={() => handleStatusUpdate('completed')}
                      disabled={updating}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 text-sm"
                    >
                      {updating ? 'Updating...' : 'Mark as Completed'}
                    </button>
                  )}

                  {(currentOrder.status === 'completed' || currentOrder.status === 'declined') && (
                    <button
                      onClick={() => handleStatusUpdate('pending')}
                      disabled={updating}
                      className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 disabled:bg-gray-400 text-sm"
                    >
                      {updating ? 'Updating...' : 'Mark as Pending'}
                    </button>
                  )}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {updateSuccess && (
        <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-md flex items-center animate-fade-in">
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Order status updated successfully
        </div>
      )}
    </div>
  );
} 