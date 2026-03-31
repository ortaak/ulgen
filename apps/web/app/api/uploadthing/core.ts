/**
 * UploadThing File Router — Sunucu Tarafı Konfigürasyonu
 *
 * Bu dosya hangi dosya tiplerinin, hangi boyutlarda yüklenebileceğini
 * ve kim tarafından yüklenebileceğini tanımlar.
 *
 * Güvenlik: Middleware içinde NextAuth session kontrolü yapılır.
 * Anonim yükleme kesinlikle engellenir.
 */

import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const f = createUploadthing();

export const ourFileRouter: FileRouter = {
  /**
   * cardAttachment — Kart Eki Yükleme Rotası
   *
   * İzin verilen dosya tipleri:
   * - Resimler: JPEG, PNG, GIF, WEBP (maks. 8MB)
   * - PDF belgeler (maks. 8MB)
   * - Word belgeleri (.doc, .docx) (maks. 8MB)
   * - Excel belgeleri (.xls, .xlsx) (maks. 8MB)
   */
  cardAttachment: f({
    image: { maxFileSize: "8MB", maxFileCount: 5 },
    pdf: { maxFileSize: "8MB", maxFileCount: 5 },
    "application/msword": { maxFileSize: "8MB", maxFileCount: 5 },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      maxFileSize: "8MB",
      maxFileCount: 5,
    },
    "application/vnd.ms-excel": { maxFileSize: "8MB", maxFileCount: 5 },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
      maxFileSize: "8MB",
      maxFileCount: 5,
    },
  })
    .middleware(async () => {
      // Kullanıcının oturum açık olduğunu doğrula
      const session = await getServerSession(authOptions);

      if (!session?.user?.id) {
        throw new Error("Dosya yüklemek için giriş yapmanız gerekiyor");
      }

      // Metadata olarak userId döndür — onUploadComplete'te kullanılacak
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Yükleme tamamlandı — metadata client'a gönderilir
      // Prisma kaydı burada değil, /api/cards/[id]/attachments POST'ta yapılır
      // Çünkü cardId bilgisi burada mevcut değil
      return {
        uploadedBy: metadata.userId,
        url: file.url,
        key: file.key,
        name: file.name,
        size: file.size,
      };
    }),
};

export type OurFileRouter = typeof ourFileRouter;
