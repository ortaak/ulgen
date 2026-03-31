/**
 * Dashboard Layout
 * 
 * Giriş yapmış kullanıcılar için layout.
 */

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { DashboardNav } from '@/components/dashboard-nav';
import { Toaster } from 'sonner';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav user={session.user} />
      {children}
      <Toaster richColors position="bottom-right" />
    </div>
  );
}
