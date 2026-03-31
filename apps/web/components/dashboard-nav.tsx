/**
 * Dashboard Navigation
 * 
 * Üst navigasyon barı.
 */

'use client';

import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { Button } from './ui/button';
import { LogOut, LayoutGrid, CalendarDays, BarChart2 } from 'lucide-react';

interface DashboardNavProps {
  user: any;
}

export function DashboardNav({ user }: DashboardNavProps) {
  return (
    <nav className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/boards" className="flex items-center gap-2">
              <LayoutGrid className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">ULGEN</span>
            </Link>
            <Link href="/boards">
              <Button variant="ghost">Board&apos;lar</Button>
            </Link>
            <Link href="/timeline">
              <Button variant="ghost" className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" />
                Günlük Plan
              </Button>
            </Link>
            <Link href="/analytics">
              <Button variant="ghost" className="flex items-center gap-1.5">
                <BarChart2 className="h-4 w-4" />
                Analitik
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm">
              <p className="font-medium">{user.name || user.email}</p>
              <p className="text-gray-500 text-xs">{user.email}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Çıkış
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
