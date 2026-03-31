/**
 * UploadThing React Helpers
 *
 * Bu dosya UploadThing'in React hook'larını dışa aktarır.
 * Dosya yükleme componentlerinde kullanılmak üzere type-safe hook'lar sağlar.
 *
 * Kullanım:
 *   import { useUploadThing } from '@/lib/uploadthing';
 *   const { startUpload, isUploading } = useUploadThing('cardAttachment');
 */

import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

export const { useUploadThing } =
  generateReactHelpers<OurFileRouter>();
