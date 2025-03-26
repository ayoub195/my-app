'use client';

import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs, doc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Sale {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  productName: string;
  amount: number;
  status: 'pending' | 'completed' | 'declined' | 'confirmed';
  createdAt: { seconds: number };
}

export default function SalesManagementPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'completed'>('all');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [updating, setUpdating] = useState(false);
  const router = useRouter();

  const fetchSales = async () => {
    try {
      setLoading(true);
      const salesRef = collection(db, 'sales');
      const q = query(salesRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const salesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Sale[];
      setSales(salesData);
    } catch (error) {
      console.error('Error fetching sales:', error);
      setError('Failed to load sales data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const handleDelete = async (orderId: string) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await deleteDoc(doc(db, 'sales', orderId));
        fetchSales();
      } catch (error) {
        console.error('Error deleting order:', error);
        alert('Failed to delete order. Please try again.');
      }
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedOrders(filteredSales.map(sale => sale.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (!selectedOrders.length) {
      alert('Please select orders to update');
      return;
    }

    if (window.confirm(`Are you sure you want to mark ${selectedOrders.length} orders as ${newStatus}?`)) {
      try {
        setUpdating(true);
        const batch = writeBatch(db);
        
        // Update each selected order
        for (const orderId of selectedOrders) {
          const orderRef = doc(db, 'sales', orderId);
          batch.update(orderRef, {
            status: newStatus,
            updatedAt: new Date().toISOString()
          });
        }

        // Commit the batch
        await batch.commit();

        // Send status update notifications
        await Promise.all(selectedOrders.map(async (orderId) => {
          const order = sales.find(s => s.id === orderId);
          if (order) {
            try {
              await fetch(`/api/sales/${orderId}/status`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
              });
            } catch (error) {
              console.error(`Failed to send notification for order ${orderId}:`, error);
            }
          }
        }));

        // Refresh the sales list
        await fetchSales();
        setSelectedOrders([]);
        alert(`Successfully updated ${selectedOrders.length} orders`);
      } catch (error) {
        console.error('Error updating orders:', error);
        alert('Failed to update orders. Please try again.');
      } finally {
        setUpdating(false);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedOrders.length) {
      alert('Please select orders to delete');
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedOrders.length} orders? This action cannot be undone.`)) {
      try {
        setUpdating(true);
        const batch = writeBatch(db);
        
        // Delete each selected order
        for (const orderId of selectedOrders) {
          const orderRef = doc(db, 'sales', orderId);
          batch.delete(orderRef);
        }

        // Commit the batch
        await batch.commit();

        // Refresh the sales list
        await fetchSales();
        setSelectedOrders([]);
        alert(`Successfully deleted ${selectedOrders.length} orders`);
      } catch (error) {
        console.error('Error deleting orders:', error);
        alert('Failed to delete orders. Please try again.');
      } finally {
        setUpdating(false);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const filteredSales = activeTab === 'all' 
    ? sales 
    : sales.filter(sale => sale.status === activeTab);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sales Management</h1>
        <span className="text-gray-600">Total: {sales.length} order(s)</span>
      </div>

      <div className="mb-6 border-b">
        <button
          className={`mr-4 pb-2 px-1 ${activeTab === 'all' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600'}`}
          onClick={() => setActiveTab('all')}
        >
          All Sales
        </button>
        <button
          className={`mr-4 pb-2 px-1 ${activeTab === 'pending' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600'}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-sm">{sales.filter(s => s.status === 'pending').length}</span>
        </button>
        <button
          className={`pb-2 px-1 ${activeTab === 'completed' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600'}`}
          onClick={() => setActiveTab('completed')}
        >
          Completed
        </button>
      </div>

      {selectedOrders.length > 0 && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg flex items-center justify-between">
          <span className="text-sm text-gray-600">
            {selectedOrders.length} orders selected
          </span>
          <div className="space-x-2">
            <button
              onClick={() => handleBulkStatusUpdate('confirmed')}
              disabled={updating}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 text-sm"
            >
              Mark as Confirmed
            </button>
            <button
              onClick={() => handleBulkStatusUpdate('completed')}
              disabled={updating}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 text-sm"
            >
              Mark as Completed
            </button>
            <button
              onClick={() => handleBulkStatusUpdate('declined')}
              disabled={updating}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:bg-gray-400 text-sm"
            >
              Mark as Declined
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={updating}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:bg-gray-400 text-sm border-2 border-red-700"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-4 px-6 py-3">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selectedOrders.length === filteredSales.length && filteredSales.length > 0}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ORDER ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PRODUCT</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CUSTOMER</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AMOUNT</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DATE</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STATUS</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSales.map((sale) => (
              <tr key={sale.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedOrders.includes(sale.id)}
                    onChange={() => handleSelectOrder(sale.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sale.id.substring(0, 8)}...</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sale.productName || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{`${sale.firstName} ${sale.lastName}`}</div>
                  <div className="text-sm text-gray-500">{sale.email}</div>
                  {sale.phoneNumber && (
                    <div className="text-sm text-gray-500">{sale.phoneNumber}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${sale.amount?.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {sale.createdAt ? new Date(sale.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(sale.status)}`}>
                    {sale.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <Link
                    href={`/admin/sales/${sale.id}`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => handleDelete(sale.id)}
                    className="text-red-600 hover:text-red-900 ml-3"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 