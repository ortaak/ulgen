/**
 * Next.js Middleware
 * 
 * Auth yetkilendirme kontrolü yapar.
 */

export { default } from 'next-auth/middleware';

export const config = {
  matcher: [
    '/boards/:path*',
    '/api/boards/:path*',
    '/api/lists/:path*',
    '/api/cards/:path*',
  ],
};
