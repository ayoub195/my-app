'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAdmin, isLoading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in and is an admin
    if (!isLoading && (!user || !isAdmin)) {
      // If not admin or not logged in, redirect to login
      if (pathname !== '/admin/login') {
        router.push('/admin/login');
      }
    }
  }, [isLoading, user, isAdmin, pathname, router]);

  // Show nothing while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If not on login page and not authenticated, show nothing (will redirect)
  if (!user && pathname !== '/admin/login') {
    return null;
  }

  // If on login page, just render children (login form)
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // If authenticated and admin, show admin layout
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-100">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-gray-800 text-white">
        <div className="p-4">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
        </div>
        
        <nav className="mt-6">
          <ul>
            <li>
              <Link 
                href="/admin/dashboard" 
                className={`block py-2 px-4 ${pathname === '/admin/dashboard' ? 'bg-gray-900' : 'hover:bg-gray-700'}`}
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/products" 
                className={`block py-2 px-4 ${pathname.startsWith('/admin/products') ? 'bg-gray-900' : 'hover:bg-gray-700'}`}
              >
                Products
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/categories" 
                className={`block py-2 px-4 ${pathname.startsWith('/admin/categories') ? 'bg-gray-900' : 'hover:bg-gray-700'}`}
              >
                Categories
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/sales" 
                className={`block py-2 px-4 ${pathname.startsWith('/admin/sales') ? 'bg-gray-900' : 'hover:bg-gray-700'}`}
              >
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Sales
                </div>
              </Link>
            </li>
            <li>
              <button
                onClick={() => logout().then(() => router.push('/admin/login'))}
                className="w-full text-left py-2 px-4 text-red-300 hover:bg-gray-700"
              >
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </aside>
      
      {/* Main content */}
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
} 