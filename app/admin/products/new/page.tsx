'use client';

import { useState } from 'react';
import Link from 'next/link';
import ProductForm from '@/components/admin/products/ProductForm';

export default function NewProduct() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Add New Product</h1>
        <Link 
          href="/admin/products"
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
        >
          Back to Products
        </Link>
      </div>
      
      <ProductForm 
        isSubmitting={isSubmitting}
        setIsSubmitting={setIsSubmitting}
      />
    </div>
  );
} 