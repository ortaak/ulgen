/**
 * Database Seed Script
 * 
 * Bu script, geliştirme ortamı için örnek veriler oluşturur:
 * - Demo kullanıcı
 * - Örnek board
 * - Listeler (Yapılacak, Devam Ediyor, Tamamlandı)
 * - Örnek kartlar
 * 
 * Kullanım: pnpm db:seed
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Veritabanı seed işlemi başlıyor...\n');

  // Demo kullanıcı oluştur
  console.log('👤 Demo kullanıcı oluşturuluyor...');
  const hashedPassword = await bcrypt.hash('demo123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'demo@ulgen.com' },
    update: {},
    create: {
      email: 'demo@ulgen.com',
      name: 'Demo Kullanıcı',
      password: hashedPassword,
      emailVerified: new Date(),
    },
  });
  console.log(`✅ Kullanıcı oluşturuldu: ${user.email}\n`);

  // Demo board oluştur
  console.log('📋 Demo board oluşturuluyor...');
  const board = await prisma.board.create({
    data: {
      title: 'İlk Board\'um',
      description: 'ÜLGEN\'e hoş geldiniz! Bu board\'u düzenleyebilir, yeni listeler ve kartlar ekleyebilirsiniz.',
      background: '#0079bf',
      ownerId: user.id,
      members: {
        create: {
          userId: user.id,
          role: 'owner',
        },
      },
      lists: {
        create: [
          {
            title: 'Yapılacaklar',
            position: 0,
            cards: {
              create: [
                {
                  title: 'ÜLGEN\'e Hoş Geldiniz! 🎉',
                  description: 'Bu bir örnek karttır. Kartları düzenleyebilir, silebilir veya yenilerini ekleyebilirsiniz.\n\nÖzellikler:\n- Kartları listeleme\n- Kart detaylarını görüntüleme\n- Yeni kart ekleme\n- Kart düzenleme ve silme\n- Etiketler (labels)\n- Atamalar (assignees)\n- Son tarih (due date)',
                  position: 0,
                  creatorId: user.id,
                  labels: ['green'],
                },
                {
                  title: 'İlk Kartınızı Oluşturun',
                  description: 'Sağ üst köşedeki "+ Yeni Kart Ekle" butonuna tıklayarak yeni bir kart oluşturabilirsiniz.',
                  position: 1,
                  creatorId: user.id,
                  labels: ['blue'],
                },
                {
                  title: 'Board Üyelerini Yönetin',
                  description: 'Board\'a yeni üyeler ekleyebilir ve rollerini yönetebilirsiniz.',
                  position: 2,
                  creatorId: user.id,
                  labels: ['purple'],
                },
              ],
            },
          },
          {
            title: 'Devam Ediyor',
            position: 1,
            cards: {
              create: [
                {
                  title: 'Proje Planlaması',
                  description: 'Sprint planlama toplantısı için hazırlık yapılıyor.',
                  position: 0,
                  creatorId: user.id,
                  labels: ['yellow', 'orange'],
                  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 gün sonra
                },
                {
                  title: 'API Entegrasyonu',
                  position: 1,
                  creatorId: user.id,
                  labels: ['orange'],
                },
              ],
            },
          },
          {
            title: 'Tamamlandı',
            position: 2,
            cards: {
              create: [
                {
                  title: 'Proje Kurulumu Tamamlandı ✓',
                  description: 'Monorepo yapısı, Prisma, NextAuth ve temel UI bileşenleri hazır!',
                  position: 0,
                  creatorId: user.id,
                  labels: ['green'],
                },
                {
                  title: 'Veritabanı Şeması Tasarlandı ✓',
                  position: 1,
                  creatorId: user.id,
                  labels: ['green'],
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`✅ Board oluşturuldu: ${board.title} (ID: ${board.id})\n`);

  // İkinci bir demo board oluştur
  console.log('📋 İkinci demo board oluşturuluyor...');
  const board2 = await prisma.board.create({
    data: {
      title: 'Kişisel Projeler',
      description: 'Kişisel projelerim için görev takibi',
      background: '#d29034',
      ownerId: user.id,
      members: {
        create: {
          userId: user.id,
          role: 'owner',
        },
      },
      lists: {
        create: [
          {
            title: 'Fikirler',
            position: 0,
            cards: {
              create: [
                {
                  title: 'Blog Yazısı Fikirleri',
                  description: 'Web geliştirme konularında blog yazıları yazmak',
                  position: 0,
                  creatorId: user.id,
                  labels: ['pink'],
                },
              ],
            },
          },
          {
            title: 'Öğrenilecekler',
            position: 1,
            cards: {
              create: [
                {
                  title: 'Next.js 14 App Router',
                  position: 0,
                  creatorId: user.id,
                  labels: ['blue'],
                },
                {
                  title: 'Prisma Advanced Patterns',
                  position: 1,
                  creatorId: user.id,
                  labels: ['blue'],
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`✅ Board oluşturuldu: ${board2.title} (ID: ${board2.id})\n`);

  console.log('🎉 Seed işlemi tamamlandı!\n');
  console.log('─────────────────────────────────────');
  console.log('📧 Demo Email: demo@ulgen.com');
  console.log('🔑 Şifre: demo123');
  console.log('─────────────────────────────────────\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed hatası:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
