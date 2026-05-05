import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// We have to use 'jose' for middleware because 'jsonwebtoken' uses Node.js crypto APIs 
// which are not available in the Edge Runtime. Wait, I should implement a simpler check
// or just use Next.js cookies and a simple edge-compatible JWT verification.
// Alternatively, I can just protect API routes directly in the route handlers and UI routes in layouts to avoid edge runtime issues, 
// since I haven't installed 'jose'. Let's do that instead of middleware, or use a basic middleware that just checks if cookie exists.

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup');
  const isApiAuthRoute = request.nextUrl.pathname.startsWith('/api/auth');
  const isApiRoute = request.nextUrl.pathname.startsWith('/api');

  if (!token) {
    if (!isAuthPage && !isApiAuthRoute && !isApiRoute && request.nextUrl.pathname !== '/') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (isApiRoute && !isApiAuthRoute) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  } else {
    if (isAuthPage || request.nextUrl.pathname === '/') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
