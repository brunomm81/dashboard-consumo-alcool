import { NextResponse } from 'next/server';
import { AUTH_COOKIE, expectedCookieValue, isValidLogin } from '@/lib/auth';

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Requisição inválida.' }, { status: 400 });
  }

  const { username, password } = body || {};

  if (!isValidLogin(username, password)) {
    return NextResponse.json(
      { error: 'Usuário ou senha inválidos.' },
      { status: 401 }
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE, expectedCookieValue(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 8 // 8 horas
  });
  return res;
}
