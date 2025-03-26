// Product model interface
export interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  imageUrl?: string;
  stock: number;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Category model interface
export interface Category {
  id?: string;
  name: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
} 