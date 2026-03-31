/**
 * Board Card Component
 * 
 * Board listesinde tek bir board'ı gösterir.
 */

'use client';

import Link from 'next/link';
import { Board } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users } from 'lucide-react';

interface BoardCardProps {
  board: Board;
}

export function BoardCard({ board }: BoardCardProps) {
  return (
    <Link href={`/boards/${board.id}`}>
      <Card 
        className="hover:shadow-lg transition-shadow cursor-pointer h-full"
        style={{ backgroundColor: board.background || undefined }}
      >
        <CardHeader>
          <CardTitle className="text-white truncate">
            {board.title}
          </CardTitle>
          {board.description && (
            <CardDescription className="text-white/80 line-clamp-2">
              {board.description}
            </CardDescription>
          )}
          <div className="flex items-center gap-2 text-sm text-white/80 mt-2">
            <Users className="h-4 w-4" />
            <span>{board.members?.length || 0} üye</span>
            {board._count && (
              <span className="ml-2">{board._count.lists} liste</span>
            )}
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
}
