import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth/session';
import NextAuth from 'next-auth';
import authConfig from './auth.config';

const protectedRoutes = ['/dashboard', '/settings', '/courses'];
const unaccessibleWhenConnected = ['/sign-in', '/sign-up', '/login'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const { auth } = NextAuth(authConfig);
  const session = await getSession(auth);
  let isProtectedRoute = false;

  for (const route of protectedRoutes) {
    if (pathname.startsWith(route)) {
      isProtectedRoute = true;
      break;
    }
  }

  if (isProtectedRoute && session === null) {
    return NextResponse.redirect(new URL('/sign-in?redirect=' + encodeURIComponent(pathname), request.url));
  }

  let isUnnaccessibleWhenConnected = false;

  for (const route of unaccessibleWhenConnected) {
    if (pathname.startsWith(route)) {
      isUnnaccessibleWhenConnected = true;
      break;
    }
  }

  if (session !== null && isUnnaccessibleWhenConnected) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
