import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

export async function middleware(request: NextRequest) {
  const adminPathRegex = /^\/admin(\/.*)?$/;
  const isAdminPath = adminPathRegex.test(request.nextUrl.pathname);
  const isLoginPage = request.nextUrl.pathname === '/admin/login';
  
  if (isAdminPath && !isLoginPage) {
    // Get the session token from cookies
    const sessionCookie = request.cookies.get('session');

    // If no session cookie, redirect to login
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    
    // We'll rely on client-side auth check for the actual admin validation
    // Firebase Admin SDK validation would be more secure but requires server components
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
}; 