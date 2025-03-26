'use client';

import React, { useEffect, useState } from 'react';
import { getAllProducts } from '@/lib/services/product-service';
import { getAllCategories } from '@/lib/services/category-service';
import { Product, Category } from '@/lib/models';
import { collection, getDocs, query, orderBy, where, Firestore } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pendingSales, setPendingSales] = useState<number>(0);
  const [totalSales, setTotalSales] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        if (!db) {
          console.error('Firestore not initialized');
          return;
        }
        
        // Fetch products
        const productsQuery = query(collection(db as Firestore, 'products'));
        const productsSnapshot = await getDocs(productsQuery);
        const productsData: Product[] = [];
        
        productsSnapshot.forEach(doc => {
          const data = doc.data();
          productsData.push({
            id: doc.id,
            name: data.name,
            description: data.description,
            price: data.price,
            imageUrl: data.imageUrl,
            stock: data.stock,
            isActive: data.isActive,
            categoryId: data.categoryId,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date()
          });
        });
        
        setProducts(productsData);
        
        // Fetch categories
        const categoriesQuery = query(collection(db as Firestore, 'categories'));
        const categoriesSnapshot = await getDocs(categoriesQuery);
        const categoriesData: Category[] = [];
        
        categoriesSnapshot.forEach(doc => {
          const data = doc.data();
          categoriesData.push({
            id: doc.id,
            name: data.name,
            description: data.description,
            imageUrl: data.imageUrl,
            isActive: data.isActive,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date()
          });
        });
        
        setCategories(categoriesData);
        
        // Fetch sales data
        const salesQuery = query(collection(db as Firestore, 'sales'));
        const salesSnapshot = await getDocs(salesQuery);
        let pending = 0;
        let total = 0;
        
        salesSnapshot.forEach(doc => {
          total++;
          const data = doc.data();
          if (data.status === 'pending') {
            pending++;
          }
        });
        
        setPendingSales(pending);
        setTotalSales(total);
      } catch (error) {
        console.error('Error fetching admin data:', error);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    // Re-fetch data
    fetchData();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
          {error}
        </div>
        <button 
          onClick={handleRetry}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-8 text-gray-800">Admin Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase">Products</p>
                <h2 className="text-3xl font-bold text-gray-900 mt-1">{products.length}</h2>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0v10l-8 4m0-10L4 7m8 4v10" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <Link href="/admin/products" className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center">
                View All Products
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
          <div className="bg-blue-50 px-6 py-2">
            <div className="flex items-center text-sm">
              <span className="text-blue-600 font-medium">
                {products.filter(p => p.isActive).length} active
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase">Categories</p>
                <h2 className="text-3xl font-bold text-gray-900 mt-1">{categories.length}</h2>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <Link href="/admin/categories" className="text-sm text-green-600 hover:text-green-800 font-medium flex items-center">
                View All Categories
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
          <div className="bg-green-50 px-6 py-2">
            <div className="flex items-center text-sm">
              <span className="text-green-600 font-medium">
                {categories.filter(c => c.isActive).length} active
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase">Total Stock</p>
                <h2 className="text-3xl font-bold text-gray-900 mt-1">
                  {products.reduce((total, product) => total + product.stock, 0)}
                </h2>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <Link href="/admin/products" className="text-sm text-purple-600 hover:text-purple-800 font-medium flex items-center">
                Manage Inventory
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
          <div className="bg-purple-50 px-6 py-2">
            <div className="flex items-center text-sm">
              <span className="text-purple-600 font-medium">
                {products.filter(p => p.stock < 10).length} low stock items
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase">Sales Management</p>
                <h2 className="text-3xl font-bold text-gray-900 mt-1">
                  {totalSales}
                </h2>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <Link href="/admin/sales" className="text-sm text-yellow-600 hover:text-yellow-800 font-medium flex items-center">
                Manage Orders
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
          <div className="bg-yellow-50 px-6 py-2">
            <div className="flex items-center text-sm">
              <span className="text-yellow-600 font-medium">
                {pendingSales} pending orders
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase">Average Price</p>
                <h2 className="text-3xl font-bold text-gray-900 mt-1">
                  ${products.length > 0 
                    ? (products.reduce((sum, product) => sum + product.price, 0) / products.length).toFixed(2)
                    : '0.00'
                  }
                </h2>
              </div>
              <div className="bg-pink-100 p-3 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <Link href="/admin/products" className="text-sm text-pink-600 hover:text-pink-800 font-medium flex items-center">
                View Products
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
          <div className="bg-pink-50 px-6 py-2">
            <div className="flex items-center text-sm">
              <span className="text-pink-600 font-medium">
                {products.length} total products
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md mb-8 overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-800">Quick Actions</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/admin/products/new" 
              className="flex items-center p-4 bg-blue-50 text-blue-700 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors">
              <div className="mr-4 bg-blue-100 p-2 rounded-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <span>Add Product</span>
            </Link>
            
            <Link href="/admin/categories/new" 
              className="flex items-center p-4 bg-green-50 text-green-700 rounded-lg border border-green-100 hover:bg-green-100 transition-colors">
              <div className="mr-4 bg-green-100 p-2 rounded-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <span>Add Category</span>
            </Link>
            
            <Link href="/admin/products" 
              className="flex items-center p-4 bg-purple-50 text-purple-700 rounded-lg border border-purple-100 hover:bg-purple-100 transition-colors">
              <div className="mr-4 bg-purple-100 p-2 rounded-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </div>
              <span>Manage Products</span>
            </Link>
            
            <Link href="/admin/categories" 
              className="flex items-center p-4 bg-yellow-50 text-yellow-700 rounded-lg border border-yellow-100 hover:bg-yellow-100 transition-colors">
              <div className="mr-4 bg-yellow-100 p-2 rounded-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </div>
              <span>Manage Categories</span>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Getting Started */}
      {(products.length === 0 || categories.length === 0) && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg shadow-md border border-yellow-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-yellow-200">
            <h2 className="text-lg font-semibold text-yellow-800">Getting Started</h2>
          </div>
          <div className="p-6">
            <div className="flex items-start mb-4">
              <div className="bg-yellow-100 p-2 rounded-full mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-yellow-700">
                To use the admin dashboard effectively, first create some categories, then add products within those categories.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <Link href="/admin/categories/new" 
                className="flex items-center justify-center p-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-lg hover:from-yellow-500 hover:to-orange-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create First Category
              </Link>
              
              <Link href="/admin/products/new" 
                className="flex items-center justify-center p-3 bg-gradient-to-r from-blue-400 to-indigo-400 text-white rounded-lg hover:from-blue-500 hover:to-indigo-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create First Product
              </Link>
            </div>
          </div>
        </div>
      )}
      
      {/* Recent Products - Show only if there are products */}
      {products.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-800">Recent Products</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.slice(0, 3).map(product => (
                <div key={product.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="h-40 overflow-hidden bg-gray-100">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 mb-1">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">
                      Stock: {product.stock} · ${product.price.toFixed(2)}
                    </p>
                    <div className="flex justify-end">
                      <Link href={`/admin/products/${product.id}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Edit
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {products.length > 3 && (
              <div className="mt-6 text-center">
                <Link href="/admin/products" className="inline-flex items-center text-blue-600 hover:text-blue-800">
                  View all products
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 