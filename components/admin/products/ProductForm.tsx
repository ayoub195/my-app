'use client';

import React, { useState, useEffect, ChangeEvent, Dispatch, SetStateAction } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/lib/models';
import { createProduct, updateProduct } from '@/lib/services/product-service';
import { getAllCategories } from '@/lib/services/category-service';
import { Category } from '@/lib/models';

interface ProductFormProps {
  product?: Product;
  isEdit?: boolean;
  isSubmitting?: boolean;
  setIsSubmitting?: Dispatch<SetStateAction<boolean>>;
}

export default function ProductForm({ 
  product, 
  isEdit = false, 
  isSubmitting = false,
  setIsSubmitting
}: ProductFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    description: '',
    price: 0,
    categoryId: '',
    stock: 0,
    imageUrl: '',
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    // Load categories
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const data = await getAllCategories();
        setCategories(data);
      } catch (error) {
        console.error('Error loading categories:', error);
        setError('Failed to load categories. Please try again.');
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();

    // If editing, populate form with product data
    if (isEdit && product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price,
        categoryId: product.categoryId,
        stock: product.stock,
        imageUrl: product.imageUrl || '',
        isActive: product.isActive
      });
    }
  }, [isEdit, product]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Use the parent component's loading state if provided
    if (setIsSubmitting) {
      setIsSubmitting(true);
    }

    try {
      if (!formData.categoryId && categories.length > 0) {
        formData.categoryId = categories[0].id || '';
      }

      if (isEdit && product?.id) {
        await updateProduct(product.id, formData);
      } else {
        await createProduct(formData);
      }
      
      router.push('/admin/products');
    } catch (error) {
      console.error('Error saving product:', error);
      setError('Failed to save product. Please try again.');
    } finally {
      setLoading(false);
      if (setIsSubmitting) {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      <div className="mb-4">
        <label htmlFor="name" className="block text-gray-700 mb-2">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          required
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="description" className="block text-gray-700 mb-2">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="categoryId" className="block text-gray-700 mb-2">
          Category <span className="text-red-500">*</span>
        </label>
        <select
          id="categoryId"
          name="categoryId"
          value={formData.categoryId}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          required
          disabled={categoriesLoading || categories.length === 0}
        >
          {categoriesLoading ? (
            <option value="">Loading categories...</option>
          ) : categories.length === 0 ? (
            <option value="">No categories available. Create one first.</option>
          ) : (
            <>
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </>
          )}
        </select>
        {categories.length === 0 && !categoriesLoading && (
          <p className="mt-1 text-sm text-red-500">
            <a href="/admin/categories/new" className="underline">
              Create a category
            </a>{' '}
            before adding products.
          </p>
        )}
      </div>
      
      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="price" className="block text-gray-700 mb-2">
            Price <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            step="0.01"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            required
          />
        </div>
        
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="stock" className="block text-gray-700 mb-2">
            Stock <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="stock"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            step="1"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            required
          />
        </div>
      </div>
      
      <div className="mb-4">
        <label htmlFor="imageUrl" className="block text-gray-700 mb-2">
          Product Image URL
        </label>
        <input
          type="url"
          id="imageUrl"
          name="imageUrl"
          value={formData.imageUrl}
          onChange={handleChange}
          placeholder="https://example.com/image.jpg"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        />
        {formData.imageUrl && (
          <div className="mt-2">
            <p className="text-sm text-gray-600 mb-1">Image Preview:</p>
            <img 
              src={formData.imageUrl} 
              alt="Product preview" 
              className="h-32 w-32 object-cover rounded-md border border-gray-200"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Invalid+URL';
              }}
            />
          </div>
        )}
        <p className="mt-1 text-xs text-gray-500">Enter a valid image URL. Leave blank if no image.</p>
      </div>
      
      <div className="mb-6">
        <label className="flex items-center">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={(e: ChangeEvent<HTMLInputElement>) => 
              setFormData(prev => ({ ...prev, isActive: e.target.checked }))
            }
            className="mr-2"
          />
          <span className="text-gray-700">Active (available for purchase)</span>
        </label>
      </div>
      
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.push('/admin/products')}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
        >
          {loading || isSubmitting ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </form>
  );
} 