import { NextResponse } from 'next/server';
import { AUTH_COOKIE, expectedCookieValue, isValidLogin } from '@/lib/auth';
import { isRateLimited, registerFailedAttempt, resetAttempts } from '@/lib/rateLimit';

function getClientIp(request) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  return request.ip || 'unknown';
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Requisição inválida.' }, { status: 400 });
  }

  const { username, password } = body || {};
  const clientIp = getClientIp(request);

  const { limited, retryAfterSeconds } = isRateLimited(clientIp);
  if (limited) {
    return NextResponse.json(
      { error: 'Muitas tentativas de login. Tente novamente mais tarde.' },
      { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } }
    );
  }

  if (!isValidLogin(username, password)) {
    registerFailedAttempt(clientIp);
    console.warn(`Tentativa de login malsucedida a partir do IP ${clientIp}.`);
    return NextResponse.json(
      { error: 'Usuário ou senha inválidos.' },
      { status: 401 }
    );
  }

  resetAttempts(clientIp);

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
