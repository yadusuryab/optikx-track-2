// middleware/adminAuth.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '../lib/auth';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip auth for these paths
  const publicPaths = [
    '/admin/login',
    '/api/admin/auth/login',
    '/api/admin/auth/verify', // Add verify route to public paths
    '/api/public'
  ];

  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Only check auth for admin routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const token = request.cookies.get('admin-token')?.value;

    if (!token) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    try {
      verifyToken(token);
      return NextResponse.next();
    } catch (error) {
      // Clear invalid token
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      response.cookies.delete('admin-token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};