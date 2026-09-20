import { NextResponse } from 'next/server';
import { auth } from './auth';

export default auth((request) => {
  const isAuthenticated = Boolean(request.auth);
  const pathname = request.nextUrl.pathname;
  if (pathname === '/') {
    return NextResponse.redirect(new URL(isAuthenticated ? '/home' : '/login', request.url));
  }
  if (pathname === '/login') {
    if (isAuthenticated) return NextResponse.redirect(new URL('/home', request.url));
    return NextResponse.next();
  }
  if (pathname.startsWith('/home') && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next();
});

export const config = { matcher: ['/', '/login', '/home/:path*'] };
