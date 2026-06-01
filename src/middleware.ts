import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_COOKIE, isAuthEnabled, isValidSession } from '@/lib/auth';

export function middleware(request: NextRequest) {
  if (!isAuthEnabled()) return NextResponse.next();

  const session = request.cookies.get(AUTH_COOKIE)?.value;
  const isLogin = request.nextUrl.pathname === '/login';

  if (isValidSession(session)) {
    if (isLogin) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  if (isLogin) return NextResponse.next();

  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('from', request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
