'use client';

import React, { useState, useEffect } from 'react';
import { Product, Category } from '@/lib/models';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
  categories: Category[];
  onViewDetails: (product: Product) => void;
  initialCategoryId?: string | null;
}

export default function ProductGrid({ products, categories, onViewDetails, initialCategoryId = null }: ProductGridProps) {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  const [activeFilter, setActiveFilter] = useState<string | null>(initialCategoryId);
  const [sortBy, setSortBy] = useState<'lowToHigh' | 'highToLow'>('lowToHigh');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Update active filter when initialCategoryId changes
  useEffect(() => {
    if (initialCategoryId !== null) {
      setActiveFilter(initialCategoryId);
    }
  }, [initialCategoryId]);

  useEffect(() => {
    let result = [...products];
    
    // Apply category filter
    if (activeFilter) {
      result = result.filter(product => product.categoryId === activeFilter);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (sortBy === 'lowToHigh') {
        return a.price - b.price;
      } else {
        return b.price - a.price;
      }
    });
    
    setFilteredProducts(result);
  }, [products, activeFilter, sortBy]);

  return (
    <div>
      {/* Filter and Sort Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        {/* Left side: View mode toggle */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            aria-label="Grid view"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            aria-label="List view"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="text-sm text-gray-600 ml-4">
            Showing {filteredProducts.length} products
          </div>
        </div>

        {/* Right side: Filter options */}
        <div className="flex flex-wrap items-center gap-3 ml-auto">
          <select
            value={activeFilter || ''}
            onChange={(e) => setActiveFilter(e.target.value || null)}
            className="border rounded-md p-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Filter by category"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'lowToHigh' | 'highToLow')}
            className="border rounded-md p-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Sort by price"
          >
            <option value="lowToHigh">Price: Low to High</option>
            <option value="highToLow">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600">
            {activeFilter ? 'Try selecting a different category or clearing your filters.' : 'Please check back later for new products.'}
          </p>
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6" 
          : "space-y-4"
        }>
          {filteredProducts.map((product) => (
            <div key={product.id} className={viewMode === 'list' ? "bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden" : ""}>
              {viewMode === 'grid' ? (
                <ProductCard product={product} onViewDetails={onViewDetails} />
              ) : (
                <div className="flex flex-col sm:flex-row">
                  {/* List view */}
                  <div className="w-full sm:w-48 h-48">
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">No image</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="text-lg font-medium mb-2 text-gray-900">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {product.description || 'No description available'}
                    </p>
                    
                    <div className="mt-auto flex justify-between items-center">
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
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 