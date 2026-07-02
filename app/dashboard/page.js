import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { AUTH_COOKIE, expectedCookieValue } from '@/lib/auth';
import Dashboard from './Dashboard';

export default function DashboardPage() {
  // Protegido tambem pelo middleware; aqui garantimos no server component.
  const token = cookies().get(AUTH_COOKIE)?.value;
  if (!token || token !== expectedCookieValue()) {
    redirect('/login');
  }
  return <Dashboard />;
}
