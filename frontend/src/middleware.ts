import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the token from the request
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/question-bank', '/messages', '/reports'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // Dashboard and other protected routes - require authentication
  if (isProtectedRoute && !token) {
    const url = new URL('/', request.url);
    url.searchParams.set('redirected', 'true');
    return NextResponse.redirect(url);
  }

  // Admin routes protection - require admin privileges
  if (pathname.startsWith('/admin')) {
    // Check if user is authenticated
    if (!token) {
      const url = new URL('/', request.url);
      return NextResponse.redirect(url);
    }

    // Check if user has admin privileges
    const userRole = token.role as string;
    const allowedRoles = ['org_admin', 'super_admin'];

    if (!allowedRoles.includes(userRole)) {
      // Redirect non-admin users to dashboard with error
      const url = new URL('/dashboard', request.url);
      url.searchParams.set('error', 'forbidden');
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/question-bank/:path*',
    '/messages/:path*',
    '/reports/:path*',
    '/admin/:path*',
  ],
};
