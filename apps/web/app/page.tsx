/**
 * Home Page
 * 
 * Ana sayfa - giriş yapmış kullanıcıları board'lara yönlendirir.
 */

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LayoutGrid } from 'lucide-react';

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect('/boards');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="text-center text-white">
        <div className="flex items-center justify-center gap-3 mb-6">
          <LayoutGrid className="h-16 w-16" />
          <h1 className="text-6xl font-bold">ULGEN</h1>
        </div>
        <p className="text-xl mb-8">Görevlerinizi Kolayca Yönetin</p>
        <div className="flex gap-4 justify-center">
          <Link href="/login">
            <Button size="lg" variant="secondary">
              Giriş Yap
            </Button>
          </Link>
          <Link href="/register">
            <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
              Kayıt Ol
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
