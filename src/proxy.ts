import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');

export default async function proxy(request: NextRequest) {
  const token = request.cookies.get('session')?.value;
  const path = request.nextUrl.pathname;

  let session = null;
  if (token) {
    try {
      const { payload } = await jose.jwtVerify(token, JWT_SECRET);
      session = payload as { userId: string; role: string };
    } catch (error) {
      console.error('Middleware: Invalid token');
    }
  }

  // 1. If user is NOT logged in and tries to access protected routes
  if (!session && (path.startsWith('/farmer') || path.startsWith('/admin'))) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }

  // 2. If user IS logged in and tries to access public auth routes
  if (session && (path === '/auth/login' || path === '/auth/register' || path === '/login' || path === '/register')) {
    const url = request.nextUrl.clone();
    if (session.role === 'admin') {
      url.pathname = '/admin';
    } else {
      url.pathname = '/farmer';
    }
    return NextResponse.redirect(url);
  }

  // 3. Admin-only routes protection
  if (session && path.startsWith('/admin') && session.role !== 'admin') {
    const url = request.nextUrl.clone();
    url.pathname = '/farmer';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/farmer/:path*',
    '/admin/:path*',
    '/auth/:path*',
    '/login',
    '/register'
  ],
};
