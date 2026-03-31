/**
 * UploadThing Next.js Route Handler
 *
 * Bu dosya UploadThing'in GET ve POST endpoint'lerini Next.js'e bağlar.
 * GET: UploadThing presigned URL alımı
 * POST: Dosya yükleme tamamlama bildirimi
 */

import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});
