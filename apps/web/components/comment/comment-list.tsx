"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { CommentItem } from "./comment-item";
import { MessageSquare, Send } from "lucide-react";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

interface CommentListProps {
  cardId: string;
}

export function CommentList({ cardId }: CommentListProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Yorumları yükle
  useEffect(() => {
    fetchComments();
  }, [cardId]);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/cards/${cardId}/comments`);

      if (!response.ok) {
        throw new Error("Yorumlar yüklenemedi");
      }

      const data = await response.json();
      setComments(data);
    } catch (err) {
      console.error("Yorum yükleme hatası:", err);
      setError("Yorumlar yüklenirken bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch(`/api/cards/${cardId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newComment.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Yorum eklenemedi");
      }

      const createdComment = await response.json();

      // Listeye ekle (en üste)
      setComments([createdComment, ...comments]);
      setNewComment("");
    } catch (err: any) {
      console.error("Yorum ekleme hatası:", err);
      setError(err.message || "Yorum eklenirken bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Yorum silinemedi");
      }

      // Listeden kaldır
      setComments(comments.filter((c) => c.id !== commentId));
    } catch (err: any) {
      console.error("Yorum silme hatası:", err);
      alert(err.message || "Yorum silinirken bir hata oluştu");
    }
  };

  const handleUpdate = async (commentId: string, content: string) => {
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Yorum güncellenemedi");
      }

      const updatedComment = await response.json();

      // Listede güncelle
      setComments(
        comments.map((c) => (c.id === commentId ? updatedComment : c))
      );
    } catch (err: any) {
      console.error("Yorum güncelleme hatası:", err);
      alert(err.message || "Yorum güncellenirken bir hata oluştu");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-gray-500">
          <MessageSquare className="h-5 w-5" />
          <span>Yorumlar yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
          Yorumlar
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          ({comments.length})
        </span>
      </div>

      {/* Add Comment Form */}
      {session?.user && (
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="flex gap-3">
            {/* User Avatar */}
            <div className="flex-shrink-0">
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold">
                  {session.user.name?.charAt(0).toUpperCase() ||
                    session.user.email?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Input */}
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Yorum ekle..."
                className="w-full min-h-[80px] p-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 resize-none"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="flex justify-between items-center">
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="ml-auto">
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting || !newComment.trim()}
              >
                <Send className="h-4 w-4 mr-2" />
                {isSubmitting ? "Gönderiliyor..." : "Yorum Ekle"}
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* Comments List */}
      <div className="space-y-2">
        {comments.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
            Henüz yorum yapılmamış. İlk yorumu siz yapın! 💬
          </p>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={session?.user?.id || ""}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          ))
        )}
      </div>
    </div>
  );
}
