# ÜLGEN

Modern teknolojilerle geliştirilmiş, ölçeklenebilir ve güvenli bir proje yönetim uygulaması.

**Versiyon:** 1.4.0 | **Son Güncelleme:** 1 Ocak 2026

## 🎯 Proje Hakkında

Bu proje, modern bir görev yönetim uygulamasıdır. Temel CRUD işlemleri, authentication, drag & drop ve yorumlar özelliklerini içerir.

### ✨ Mevcut Özellikler

- ✅ **Authentication**: Email/Password girişi (NextAuth.js)
- ✅ **Board Yönetimi**: Board oluşturma, düzenleme, silme
- ✅ **Liste Yönetimi**: Board içinde listeler oluşturma
- ✅ **Kart Yönetimi**: Liste içinde kartlar oluşturma, düzenleme, silme
- ✅ **Üye Yönetimi**: Board'lara üye ekleme/çıkarma
- ✅ **Rol Tabanlı Erişim**: Owner, Admin, Member rolleri
- ✅ **Etiketler**: Kartlara renkli etiketler ekleme
- ✅ **Son Tarih**: Kartlara deadline ekleme
- ✅ **Veri Aktarma**: Trello JSON import (v1.2.0)
- ✅ **Drag & Drop**: Kartları sürükle-bırak ile taşıma (v1.3.0) 🆕
- ✅ **Yorumlar**: Kartlara yorum ekleme, düzenleme, silme (v1.4.0) 🆕
- ✅ **Responsive UI**: Mobil uyumlu modern arayüz

### 🚀 Planlanan Özellikler

- 🔥 **Daily Task Timeline**: Cross-board zaman çizelgesi ([Detaylı Doküman](DAILY_TASK_TIMELINE.md))
- ⏳ **Due Dates (Bitiş Tarihleri)**: Tarih seçici ve hatırlatıcılar
- ⏳ **Checklists**: Kart içi kontrol listeleri
- ⏳ **File Attachments**: Kartlara dosya ekleme
- ⏳ **Activity Log**: Aktivite geçmişi
- ⏳ **Labels**: Gelişmiş etiket yönetimi
- ⏳ **Real-time Collaboration**: WebSocket ile anlık güncelleme
- ⏳ **Dark Mode**: Karanlık tema desteği
- ⏳ **Board Templates**: Hazır şablonlar
- ⏳ **Search & Filter**: Gelişmiş arama

> 📋 Tüm planlanan özellikler için [TODOS.md](TODOS.md) dosyasına bakın.

## 🛠️ Teknoloji Stack

### Frontend
- **Next.js 14**: App Router, React Server Components
- **React 18**: Modern React özellikleri
- **TypeScript**: Tip güvenliği
- **TailwindCSS**: Utility-first CSS framework
- **Zustand**: State management
- **Radix UI**: Accessible UI components

### Backend
- **Next.js API Routes**: Serverless API endpoints
- **Prisma ORM**: Type-safe database ORM
- **PostgreSQL**: İlişkisel veritabanı
- **NextAuth**: Authentication ve session management
- **Zod**: Schema validation

### Tooling
- **pnpm**: Hızlı paket yöneticisi
- **Turborepo**: Monorepo build tool
- **ESLint**: Code linting
- **TypeScript**: Type checking

## 📁 Proje Yapısı

```
trello-clone/
├── apps/
│   └── web/                    # Next.js frontend + API
│       ├── app/                # App Router pages
│       │   ├── (auth)/         # Auth routes (login, register)
│       │   ├── (dashboard)/    # Dashboard routes (boards)
│       │   └── api/            # API routes
│       ├── components/         # React components
│       ├── lib/                # Utilities
│       ├── services/           # Business logic
│       ├── store/              # Zustand stores
│       └── types/              # TypeScript types
├── packages/
│   ├── database/               # Prisma ORM paketi
│   ├── typescript-config/      # Shared TypeScript configs
│   └── eslint-config/          # Shared ESLint configs
├── .env.example                # Environment variables örneği
├── package.json                # Root package.json
├── pnpm-workspace.yaml         # pnpm workspace config
└── turbo.json                  # Turborepo config
```

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler

- **Node.js** 18.x veya üzeri
- **pnpm** 8.x veya üzeri
- **PostgreSQL** 14.x veya üzeri

### 1. Projeyi İndirin

```bash
# ZIP olarak indirdiyseniz
unzip trello-clone.zip
cd trello-clone

# Git clone yaptıysanız
git clone <repo-url>
cd trello-clone
```

### 2. Dependencies Yükleyin

```bash
pnpm install
```

### 3. Environment Variables

`.env` dosyası oluşturun (root dizinde):

```bash
cp .env.example .env
```

`.env` dosyasını düzenleyin:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ulgen_trello?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-change-in-production-minimum-32-characters"

# Google OAuth (Opsiyonel)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

**NEXTAUTH_SECRET oluşturma:**

```bash
# Linux/macOS
openssl rand -base64 32

# Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])
```

### 4. Veritabanını Hazırlayın

PostgreSQL veritabanınızı oluşturun:

```sql
CREATE DATABASE ulgen_trello;
```

Prisma schema'yı veritabanına push edin:

```bash
pnpm db:push
```

Veritabanı modellerini generate edin:

```bash
pnpm db:generate
```

### 5. Seed Data (Opsiyonel)

Demo verilerini yükleyin:

```bash
pnpm db:seed
```

Bu komut şunları oluşturur:
- Demo kullanıcı: `demo@ulgen.com` (şifre: `demo123`)
- 2 örnek board
- Listeler ve kartlar

### 6. Development Modunda Çalıştırın

```bash
pnpm dev
```

Uygulama şu adreste çalışacaktır: **http://localhost:3000**

### 7. Production Build

```bash
pnpm build
pnpm start
```

## 📚 Kullanım

### Giriş Yapma

1. **http://localhost:3000** adresine gidin
2. **Giriş Yap** butonuna tıklayın
3. Demo hesap bilgileri:
   - **Email**: demo@ulgen.com
   - **Şifre**: demo123

### Yeni Kullanıcı Kaydı

1. **Kayıt Ol** butonuna tıklayın
2. Ad, email ve şifre bilgilerinizi girin
3. Otomatik olarak giriş yapılır

### Board Oluşturma

1. **Yeni Board** butonuna tıklayın
2. Board başlığı, açıklama ve arka plan rengi seçin
3. **Oluştur** butonuna tıklayın

### Liste Oluşturma

1. Bir board'a girin
2. **Liste Ekle** butonuna tıklayın
3. Liste başlığı girin

### Kart Oluşturma

1. Bir listede **Kart Ekle** butonuna tıklayın
2. Kart başlığı girin
3. Kartın üzerine tıklayarak detayları görüntüleyin

## 🗄️ Veritabanı Yönetimi

### Prisma Studio

Veritabanını görsel arayüzle yönetmek için:

```bash
pnpm db:studio
```

**http://localhost:5555** adresinde açılır.

### Veritabanını Sıfırlama

```bash
# Tüm verileri sil
pnpm db:push --force-reset

# Seed verileri tekrar yükle
pnpm db:seed
```

## 🧪 Komutlar

```bash
# Development
pnpm dev                  # Tüm uygulamaları development modunda çalıştır
pnpm build                # Production build
pnpm lint                 # Lint kontrolü
pnpm type-check           # TypeScript kontrolü

# Database
pnpm db:generate          # Prisma client generate
pnpm db:push              # Schema'yı veritabanına push et
pnpm db:seed              # Seed data yükle
pnpm db:studio            # Prisma Studio'yu aç

# Workspace
pnpm --filter web dev     # Sadece web uygulamasını çalıştır
pnpm --filter database    # Sadece database package'ını çalıştır
```

## 🏗️ Mimari

### Monorepo Yapısı

Projede **pnpm workspaces** ve **Turborepo** kullanılarak monorepo yapısı kurulmuştur. Bu sayede:

- Kod paylaşımı kolaylaşır
- Bağımlılık yönetimi merkezi olur
- Build cache'leme ile hız artar

### Data Flow

```
User Action → UI Component → API Route → Service Layer → Prisma ORM → PostgreSQL
```

### Authentication Flow

```
Login Form → NextAuth → Prisma Adapter → PostgreSQL → Session Cookie
```

## 🔒 Güvenlik

- **Password Hashing**: bcryptjs ile 10 round
- **JWT Sessions**: HTTP-only cookies
- **Input Validation**: Zod schemas ile tüm endpoint'lerde
- **CSRF Protection**: NextAuth built-in
- **Role-Based Access**: Board level permissions (owner, admin, member)

## 🎨 UI Bileşenleri

Proje **shadcn/ui** ve **Radix UI** kullanarak erişilebilir ve modern bir arayüz sunar:

- **Button**: Çeşitli variant'lar
- **Input**: Form girdileri
- **Dialog**: Modal pencereler
- **Card**: İçerik kartları
- **Label**: Form etiketleri

## 🐛 Sık Karşılaşılan Sorunlar

### Veritabanı Bağlantı Hatası

```
Error: Can't reach database server at `localhost:5432`
```

**Çözüm**: PostgreSQL'in çalıştığından emin olun:

```bash
# Linux/macOS
sudo service postgresql start

# Windows
# PostgreSQL servisini başlatın
```

### Port Zaten Kullanımda

```
Error: Port 3000 is already in use
```

**Çözüm**: Portu değiştirin:

```bash
PORT=3001 pnpm dev
```

### Prisma Client Hatası

```
Error: @prisma/client did not initialize yet
```

**Çözüm**: Prisma client'ı yeniden generate edin:

```bash
pnpm db:generate
```

## 📝 API Endpoints

### Authentication

- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/signin` - Giriş
- `POST /api/auth/signout` - Çıkış

### Boards

- `GET /api/boards` - Tüm board'ları getir
- `POST /api/boards` - Yeni board oluştur
- `GET /api/boards/[id]` - Board detayı getir
- `PATCH /api/boards/[id]` - Board güncelle
- `DELETE /api/boards/[id]` - Board sil
- `POST /api/boards/[id]/members` - Üye ekle

### Lists

- `POST /api/lists` - Yeni liste oluştur
- `PATCH /api/lists/[id]` - Liste güncelle
- `DELETE /api/lists/[id]` - Liste sil

### Cards

- `POST /api/cards` - Yeni kart oluştur
- `GET /api/cards/[id]` - Kart detayı getir
- `PATCH /api/cards/[id]` - Kart güncelle
- `DELETE /api/cards/[id]` - Kart sil
- `POST /api/cards/[id]/move` - Kart taşı

## 🤝 Katkıda Bulunma

Bu proje kapalı kaynak olabilir, ancak önerileriniz için issue açabilirsiniz.

## 📄 Lisans

Bu proje özel lisans altındadır.

## 👥 İletişim

Sorularınız için: [your-email@example.com]

---

**ÜLGEN** - Aşama 1 | © 2024
