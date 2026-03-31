/**
 * NextAuth Configuration
 * 
 * Authentication yapılandırması:
 * - Email/Password (Credentials Provider)
 * - Google OAuth Provider
 * - JWT-based sessions
 * - Prisma adapter for database
 */

import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from 'database';
import * as bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    // Google OAuth Provider (opsiyonel)
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      // Google OAuth yoksa session strategy JWT olmalı
      allowDangerousEmailAccountLinking: true,
    }),
    
    // Email/Password Credentials Provider
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Input validation
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Geçersiz kimlik bilgileri');
        }

        // Kullanıcıyı veritabanında ara
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        // Kullanıcı bulunamadı veya şifre yok (OAuth kullanıcısı)
        if (!user || !user.password) {
          throw new Error('Kullanıcı bulunamadı veya şifre geçersiz');
        }

        // Şifre doğrulama
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Şifre hatalı');
        }

        // Başarılı giriş - kullanıcı bilgilerini döndür
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  
  callbacks: {
    // JWT callback - token'ı oluştur/güncelle
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    
    // Session callback - session'ı oluştur
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  
  // Debug modunu aç (development ortamında)
  debug: process.env.NODE_ENV === 'development',
};
