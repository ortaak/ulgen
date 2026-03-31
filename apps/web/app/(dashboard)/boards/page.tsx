/**
 * Boards List Page
 * 
 * Kullanıcının board'larını listeler.
 */

'use client';

import { useEffect, useState } from 'react';
import { BoardCard } from '@/components/board/board-card';
import { CreateBoardDialog } from '@/components/board/create-board-dialog';
import { ImportDialog } from '@/components/board/import-dialog';
import { Board } from '@/types';

export default function BoardsPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/boards')
      .then((res) => res.json())
      .then((data) => {
        setBoards(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Board&apos;larım</h1>
          <p className="text-gray-600 mt-1">Tüm board&apos;larınızı görüntüleyin ve yönetin</p>
        </div>
        <div className="flex gap-2">
          <ImportDialog onImportComplete={(_boardId) => {
            // Board listesini yeniden yükle
            fetch('/api/boards')
              .then((res) => res.json())
              .then((data) => setBoards(data));
          }} />
          <CreateBoardDialog />
        </div>
      </div>

      {boards.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Henüz board&apos;ınız yok</p>
          <CreateBoardDialog />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {boards.map((board) => (
            <BoardCard key={board.id} board={board} />
          ))}
        </div>
      )}
    </div>
  );
}
