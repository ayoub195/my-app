'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getAllProducts } from '@/lib/services/product-service';
import { getAllCategories } from '@/lib/services/category-service';
import { Product, Category } from '@/lib/models';
import ProductGrid from '@/components/products/ProductGrid';
import ProductDetailModal from '@/components/products/ProductDetailModal';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function ShopPage() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('category');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(categoryId);
  const [activeCategoryName, setActiveCategoryName] = useState<string>('All Products');

  useEffect(() => {
    // Update active category when URL parameter changes
    setActiveCategoryId(categoryId);
  }, [categoryId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch products and categories in parallel
        const [productsData, categoriesData] = await Promise.all([
          getAllProducts(),
          getAllCategories()
        ]);
        
        setProducts(productsData);
        setCategories(categoriesData);

        // Update category name for header if a category is selected
        if (activeCategoryId) {
          const category = categoriesData.find(cat => cat.id === activeCategoryId);
          if (category) {
            setActiveCategoryName(category.name);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [activeCategoryId]);

  const handleViewProductDetails = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleCloseProductDetails = () => {
    setSelectedProduct(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      {/* Page Header */}
      <div className="bg-blue-600 text-white py-10 px-4">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold">{activeCategoryId ? activeCategoryName : 'Shop All Products'}</h1>
          <p className="mt-2">
            {activeCategoryId 
              ? `Browse our collection of ${activeCategoryName} products` 
              : 'Browse our complete collection of quality products'}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 flex-grow">
        {loading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-md">
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 underline"
            >
              Try again
            </button>
          </div>
        ) : (
          <ProductGrid 
            products={products} 
            categories={categories}
            onViewDetails={handleViewProductDetails}
            initialCategoryId={activeCategoryId}
          />
        )}
      </main>

      <Footer />

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={handleCloseProductDetails}
        />
      )}
    </div>
  );
} 