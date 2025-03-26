'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getCategoryById } from '@/lib/services/category-service';
import { Category } from '@/lib/models';
import CategoryForm from '@/components/admin/categories/CategoryForm';

export default function EditCategoryPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);
        const data = await getCategoryById(id);
        setCategory(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching category:', error);
        setError('Failed to load category. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCategory();
    }
  }, [id]);

  if (loading) {
    return <div className="p-4">Loading category...</div>;
  }

  if (error || !category) {
    return (
      <div className="p-4 text-red-500">
        {error || 'Category not found'}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Category: {category.name}</h1>
      <CategoryForm category={category} isEdit={true} />
    </div>
  );
} 