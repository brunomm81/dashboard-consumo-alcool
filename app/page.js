import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { AUTH_COOKIE, expectedCookieValue } from '@/lib/auth';

export default function Home() {
  const token = cookies().get(AUTH_COOKIE)?.value;
  const authed = token && token === expectedCookieValue();
  redirect(authed ? '/dashboard' : '/login');
}
