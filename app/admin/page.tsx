import { redirect } from 'next/navigation';

export default function AdminIndexPage() {
  // Server-side redirect to admin dashboard
  redirect('/admin/dashboard');
} 