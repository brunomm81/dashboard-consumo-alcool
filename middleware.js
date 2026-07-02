import { NextResponse } from 'next/server';

const AUTH_COOKIE = 'dash_auth';

export function middleware(request) {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const expected = process.env.AUTH_COOKIE_SECRET || '';
  const authed = token && expected && token === expected;

  const { pathname } = request.nextUrl;

  if (!authed) {
    // Rotas de API respondem 401; páginas redirecionam para o login.
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/upload']
};
