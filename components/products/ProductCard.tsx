'use client';

import React from 'react';
import { Product } from '@/lib/models';

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
}

export default function ProductCard({ product, onViewDetails }: ProductCardProps) {
  return (
    <div className="bg-white rounded overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="h-48 overflow-hidden">
        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No image</span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="mb-2">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            {product.categoryId ? 'category' : 'product'}
          </span>
        </div>
        
        <h3 className="text-lg font-medium mb-1 text-gray-900">{product.name}</h3>
        
        <div className="flex justify-between items-center mt-4">
          <span className="text-green-600 font-bold">${product.price.toFixed(2)}</span>
          
          <button 
            onClick={() => onViewDetails(product)}
            className="bg-blue-600 text-white text-sm px-4 py-2 rounded flex items-center gap-1 hover:bg-blue-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View Details
          </button>
        </div>
      </div>

      {product.stock < 10 && product.stock > 0 && (
        <div className="bg-orange-100 text-orange-800 text-xs px-3 py-1 text-center">
          Only {product.stock} left in stock
        </div>
      )}
      
      {product.stock === 0 && (
        <div className="bg-red-100 text-red-800 text-xs px-3 py-1 text-center">
          Out of stock
        </div>
      )}
    </div>
  );
} 