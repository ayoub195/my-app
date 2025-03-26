import Link from 'next/link';

export function Header() {
  return (
    <header className="bg-blue-600 text-white">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">ConnectZen Store</Link>
          
          <nav className="hidden md:flex space-x-6">
            <Link href="/" className="hover:text-blue-200 transition-colors">Home</Link>
            <Link href="/shop" className="hover:text-blue-200 transition-colors">Shop</Link>
            <Link href="/categories" className="hover:text-blue-200 transition-colors">Categories</Link>
            <Link href="/about" className="hover:text-blue-200 transition-colors">About</Link>
          </nav>
        </div>
      </div>
    </header>
  );
} 