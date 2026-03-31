# 🚀 İLK ÇALIŞTIRMA ADIMLARI - Hızlı Başlangıç

**Proje:** ÜLGEN
**Tarih:** 31 Aralık 2025  
**Durum:** ⚠️ Kurulum Gerekli

---

## ✅ MEVCUT DURUM ANALİZİ

### Sisteminizde Hazır Olanlar:
- ✅ **Node.js:** v24.9.0 (Gereksinim: v18+) - Mükemmel!
- ✅ **pnpm:** v8.15.0 (Gereksinim: v8+) - Mükemmel!
- ✅ **Proje Dosyaları:** Eksiksiz ve 
düzgün yapılandırılmış
- ✅ **.env Dosyası:** Oluşturulmuş ve yapılandırılmış
- ✅ **Prisma Schema:** Eksiksiz (User, Board, List, Card modelleri)

### Eksik Olanlar:
- ❌ **node_modules:** Henüz yüklenmemiş (pnpm install gerekli)
- ❌ **PostgreSQL:** Kurulu değil veya çalışmıyor
- ❌ **Prisma Client:** Generate edilmemiş
- ❌ **Veritabanı:** Oluşturulmamış

---

## 🎯 YAPMANIZ GEREKENLER (5 Adım)

### ADIM 1: PostgreSQL Kurulumu (15 dakika)

PostgreSQL, projenizin veritabanı sistemidir. Windows için:

#### 1.1. PostgreSQL İndirme ve Kurulum

1. **İndirme:**
   - [PostgreSQL Windows İndiricisi](https://www.postgresql.org/download/windows/) adresine gidin
   - "Download the installer" butonuna tıklayın
   - **PostgreSQL 16.x** (en güncel sürüm) indirin

2. **Kurulum:**
   - İndirilen `.exe` dosyasını çalıştırın
   - **Installation Directory:** Varsayılan bırakın: `C:\Program Files\PostgreSQL\16`
   - **Components:** Hepsini seçili bırakın:
     - ✅ PostgreSQL Server
     - ✅ pgAdmin 4 (görsel veritabanı yönetim aracı)
     - ✅ Stack Builder (opsiyonel)
     - ✅ Command Line Tools
   - **Data Directory:** Varsayılan bırakın
   - **Password:** Güçlü bir şifre belirleyin ve **KAYDET EDİN**
     ```
     Örnek: postgres123
     NOT: Bunu unutmayın, .env dosyasında kullanacaksınız!
     ```
   - **Port:** `5432` (varsayılan) - Değiştirmeyin
   - **Locale:** Varsayılan bırakın
   - "Next" ve "Finish" ile kurulumu tamamlayın

3. **PATH Kontrolü:**
   - Kurulum otomatik olarak PATH'e ekler
   - Kontrol için yeni PowerShell açın:
   ```powershell
   psql --version
   ```
   - Çıktı: `psql (PostgreSQL) 16.x` görmeli

#### 1.2. Veritabanı Oluşturma

**Yöntem A: SQL Shell ile (Önerilen)**

1. Windows Arama'da **"SQL Shell (psql)"** yazın ve açın
2. Enter tuşlarına basarak varsayılan ayarları kabul edin:
   ```
   Server [localhost]: (Enter)
   Database [postgres]: (Enter)
   Port [5432]: (Enter)
   Username [postgres]: (Enter)
   Password: (Kurulumda belirlediğiniz şifreyi girin)
   ```

3. Şu komutları çalıştırın:
   ```sql
   -- Veritabanını oluştur
   CREATE DATABASE ulgen_trello;
   
   -- Oluşturulduğunu kontrol et
   \l
   
   -- ulgen_trello listede görünmeli
   
   -- Çıkış
   \q
   ```

**Yöntem B: PowerShell ile**

```powershell
# PostgreSQL komutunu çalıştır
psql -U postgres -c "CREATE DATABASE ulgen_trello;"

# Şifre istenince kurulumda belirlediğiniz şifreyi girin
```

**Yöntem C: pgAdmin 4 ile (Görsel)**

1. pgAdmin 4'ü açın (Başlat menüsünden)
2. Sol panelde "Servers" > "PostgreSQL 16" üzerine çift tıklayın
3. Şifrenizi girin
4. "Databases" üzerine sağ tıklayın > "Create" > "Database..."
5. Database name: `ulgen_trello`
6. "Save" butonuna tıklayın

---

### ADIM 2: Environment Variables Güncelleme (2 dakika)

`.env` dosyanızı güncelleyin:

1. **Dosyayı açın:**
   ```powershell
   notepad .env
   ```

2. **DATABASE_URL'i güncelleyin:**
   ```env
   # Şifrenizi doğru girin!
   DATABASE_URL="postgresql://postgres:SIZIN_SIFRENIZ@localhost:5432/ulgen_trello?schema=public"
   ```
   
   **Örnek:**
   ```env
   DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/ulgen_trello?schema=public"
   ```

3. **NEXTAUTH_SECRET oluşturun:**
   
   PowerShell'de çalıştırın:
   ```powershell
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```
   
   Çıktıyı kopyalayın ve `.env`'ye yapıştırın:
   ```env
   NEXTAUTH_SECRET="kopyaladiginiz-uzun-anahtar-buraya"
   ```

4. **Diğer ayarlar doğru mu kontrol edin:**
   ```env
   NEXTAUTH_URL="http://localhost:3000"
   NODE_ENV="development"
   GOOGLE_CLIENT_ID=""  # Boş bırakabilirsiniz
   GOOGLE_CLIENT_SECRET=""  # Boş bırakabilirsiniz
   ```

5. **Kaydet ve kapat**

---

### ADIM 3: Bağımlılıkları Yükleme (3-5 dakika)

Proje klasöründe PowerShell'de:

```powershell
# Tüm bağımlılıkları yükle
pnpm install
```

**Ne yapıyor bu komut?**
- `package.json` dosyalarındaki tüm paketleri indirir
- `node_modules` klasörlerini oluşturur
- Workspace yapısını kurar (apps/web ve packages/database)
- Yaklaşık 500+ paket indirecek

**Beklenen çıktı:**
```
Packages: +XXX
++++++++++++++++++++++++
Progress: resolved XXX, reused XXX, downloaded XX, added XXX
Done in XXXs
```

**Sorun çıkarsa:**
```powershell
# Cache'i temizle ve tekrar dene
pnpm store prune
pnpm install --force
```

---

### ADIM 4: Veritabanını Hazırlama (2 dakika)

#### 4.1. Prisma Client Oluşturma

```powershell
pnpm db:generate
```

**Ne yapıyor?**
- `schema.prisma` dosyasını okur
- TypeScript için tip güvenli database client oluşturur
- `node_modules/@prisma/client` klasörüne yazar

**Beklenen çıktı:**
```
✔ Generated Prisma Client to ./node_modules/@prisma/client
```

#### 4.2. Veritabanı Şemasını Uygulama

```powershell
pnpm db:push
```

**Ne yapıyor?**
- PostgreSQL veritabanına bağlanır
- Tabloları oluşturur: User, Board, BoardMember, List, Card
- İlişkileri ve indeksleri kurar

**Beklenen çıktı:**
```
Your database is now in sync with your Prisma schema.

✔ Generated Prisma Client
```

**Oluşturulan tablolar:**
- `User` - Kullanıcı bilgileri
- `Board` - Panolar (Trello board'ları)
- `BoardMember` - Pano üyelikleri ve yetkileri
- `List` - Sütunlar (To Do, In Progress, Done gibi)
- `Card` - Kartlar (görevler)

#### 4.3. Demo Verileri Yükleme (Opsiyonel)

```powershell
pnpm db:seed
```

**Ne yapıyor?**
- Demo kullanıcı oluşturur:
  - Email: `demo@ulgen.com`
  - Şifre: `demo123`
- 2 örnek board oluşturur
- Örnek listeler ve kartlar ekler

**Beklenen çıktı:**
```
🌱 Seeding database...
✅ Demo user created
✅ Sample boards created
🎉 Database seeded successfully!
```

---

### ADIM 5: Uygulamayı Başlatma (1 dakika)

```powershell
pnpm dev
```

**Ne yapıyor?**
- Next.js development server'ı başlatır
- Tüm workspace'leri paralel çalıştırır
- Hot-reload aktif (dosya değişikliklerinde otomatik yenilenir)

**Beklenen çıktı:**
```
web:dev: ▲ Next.js 14.0.4
web:dev: - Local:        http://localhost:3000
web:dev: - Network:      http://192.168.x.x:3000
web:dev: 
web:dev: ✓ Ready in 3.2s
```

**Tarayıcınızda açın:** [http://localhost:3000](http://localhost:3000)

---

## 🎉 İLK GİRİŞ VE TEST

### 1. Ana Sayfa
- Tarayıcıda `http://localhost:3000` açılacak
- Landing page'i görmelisiniz
- "Sign In" veya "Get Started" butonu olmalı

### 2. Giriş Yapma

**Seçenek A: Demo Hesapla (Seed data yüklediyseniz)**
- Email: `demo@ulgen.com`
- Şifre: `demo123`

**Seçenek B: Yeni Hesap Oluşturma**
1. "Sign Up" veya "Kayıt Ol" linkine tıklayın
2. Formu doldurun:
   - Ad Soyad: Adınız
   - Email: email@example.com
   - Şifre: Güvenli bir şifre (min 6 karakter)
3. "Sign Up" butonuna tıklayın
4. Otomatik giriş yapılacak

### 3. İlk Board'u Oluşturma
1. Dashboard'da "Create Board" veya "Yeni Pano Oluştur" butonuna tıklayın
2. Board bilgilerini girin:
   - Başlık: "İlk Projem"
   - Açıklama: "Test board'u"
   - Arka plan: Renk seçin
3. "Create" butonuna tıklayın

### 4. Liste ve Kart Ekleme
1. **Liste ekle:** "Add a list" > "To Do" > Enter
2. **Kart ekle:** Liste altında "Add a card" > "İlk görev" > Enter
3. **Karta tıklayın:** Detay sayfası açılır
4. Açıklama, etiket, tarih ekleyebilirsiniz

---

## 🔧 SORUN GİDERME

### PostgreSQL Bağlantı Hatası

**Hata:** `Error: P1001: Can't reach database server`

**Çözüm:**
```powershell
# Servisi kontrol et
Get-Service | Where-Object { $_.Name -like "*postgresql*" }

# Servis durdu ise başlat
Start-Service postgresql-x64-16

# Veya Services uygulamasından manuel başlatın
```

### Port 3000 Kullanımda

**Hata:** `Port 3000 is already in use`

**Çözüm:**
```powershell
# Portu kullanan process'i bul ve durdur
netstat -ano | findstr :3000
# PID'yi not edin ve sonlandırın:
taskkill /PID XXXX /F

# Veya farklı port kullan
$env:PORT=3001; pnpm dev
```

### Prisma Client Bulunamıyor

**Hata:** `Cannot find module '@prisma/client'`

**Çözüm:**
```powershell
# Prisma client'ı yeniden oluştur
pnpm db:generate

# Hala sorun varsa
rm -r node_modules
pnpm install
pnpm db:generate
```

### Veritabanı Şifre Hatası

**Hata:** `password authentication failed`

**Çözüm:**
1. `.env` dosyasındaki şifreyi kontrol edin
2. PostgreSQL'de şifreyi sıfırlayın:
   ```sql
   psql -U postgres
   ALTER USER postgres WITH PASSWORD 'yeni_sifre';
   \q
   ```
3. `.env` dosyasını güncelleyin

---

## 📚 FAYDALI KOMUTLAR

### Geliştirme Komutları
```powershell
pnpm dev          # Development server başlat
pnpm build        # Production build oluştur
pnpm start        # Production server başlat (build sonrası)
pnpm lint         # Kod kalitesi kontrolü
```

### Veritabanı Komutları
```powershell
pnpm db:generate  # Prisma Client oluştur
pnpm db:push      # Schema'yı DB'ye uygula
pnpm db:seed      # Demo data yükle
pnpm db:studio    # Prisma Studio aç (görsel DB yöneticisi)
```

### Prisma Studio
Veritabanınızı görsel olarak yönetmek için:
```powershell
pnpm db:studio
```
Tarayıcıda `http://localhost:5555` adresinde açılır.

---

## 🎓 ÖĞRETİCİ BİLGİLER

### Proje Mimarisi

```
ÜLGEN
│
├── Monorepo Yapısı (Turborepo + pnpm workspace)
│   ├── apps/web          → Next.js uygulaması (frontend + backend)
│   └── packages/
│       ├── database      → Prisma ORM (veritabanı)
│       ├── eslint-config → Kod standartları
│       └── typescript-config → TypeScript ayarları
│
├── Teknoloji Stack'i
│   ├── Framework: Next.js 14 (App Router)
│   ├── UI: React 18 + Tailwind CSS
│   ├── Veritabanı: PostgreSQL + Prisma ORM
│   ├── Auth: NextAuth.js
│   └── TypeScript: Tip güvenliği
│
└── Özellikler
    ├── ✅ Kullanıcı kaydı/girişi
    ├── ✅ Board (pano) oluşturma
    ├── ✅ Liste ve kart yönetimi
    ├── ✅ Kart detayları (açıklama, etiket, tarih)
    ├── ✅ Board üyelik yönetimi
    └── ✅ Responsive tasarım
```

### Veritabanı İlişkileri

```
User (Kullanıcı)
  ├── boards[] → Sahip olduğu board'lar
  ├── boardMembers[] → Üye olduğu board'lar
  └── cards[] → Atandığı/oluşturduğu kartlar

Board (Pano)
  ├── owner → User (sahip)
  ├── members[] → BoardMember (üyeler)
  └── lists[] → List (listeler)

List (Sütun)
  ├── board → Board (ait olduğu board)
  └── cards[] → Card (içindeki kartlar)

Card (Görev)
  ├── list → List (ait olduğu liste)
  ├── creator → User (oluşturan)
  └── assignees[] → User (atananlar)
```

### Next.js App Router Yapısı

```
apps/web/app/
│
├── (auth)/              → Kimlik doğrulama sayfaları
│   ├── login/           → Giriş sayfası
│   └── register/        → Kayıt sayfası
│
├── (dashboard)/         → Ana uygulama sayfaları
│   └── boards/          → Board listesi ve detay
│       └── [id]/        → Dinamik board sayfası
│
├── api/                 → Backend API routes
│   ├── auth/            → NextAuth endpoints
│   ├── boards/          → Board CRUD işlemleri
│   ├── lists/           → Liste işlemleri
│   └── cards/           → Kart işlemleri
│
└── layout.tsx           → Root layout (tüm sayfalarda ortak)
```

### Environment Variables Açıklaması

```env
# DATABASE_URL
# PostgreSQL bağlantı string'i
# Format: postgresql://[user]:[password]@[host]:[port]/[database]
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/ulgen_trello?schema=public"

# NEXTAUTH_URL
# Uygulamanızın çalıştığı URL
# Production'da gerçek domain olmalı
NEXTAUTH_URL="http://localhost:3000"

# NEXTAUTH_SECRET
# JWT token'larını şifrelemek için gizli anahtar
# Production'da mutlaka değiştirin!
# Minimum 32 karakter olmalı
NEXTAUTH_SECRET="your-secret-key"

# GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET
# Google ile giriş için (opsiyonel)
# Google Cloud Console'dan alınır
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

### pnpm Workspace Kavramı

**Monorepo nedir?**
- Birden fazla projenin (package) tek bir repository'de tutulması
- Kod paylaşımı ve bağımlılık yönetimi kolaylaşır

**pnpm workspace avantajları:**
- Disk alanı tasarrufu (symlink kullanımı)
- Hızlı kurulum
- Workspace'ler arası bağımlılık yönetimi

**Örnek:**
```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'      # apps/web
  - 'packages/*'  # packages/database, eslint-config, etc.
```

### Prisma ORM Avantajları

1. **Type Safety:** TypeScript ile tam entegrasyon
2. **Migration:** Veritabanı şema değişikliklerini takip eder
3. **Query Builder:** SQL yazmaya gerek yok
4. **Studio:** Görsel veritabanı yönetimi

**Örnek kullanım:**
```typescript
// Prisma Client ile type-safe queries
const user = await prisma.user.create({
  data: {
    email: "user@example.com",
    name: "John Doe",
    boards: {
      create: {
        title: "My Board",
        description: "First board"
      }
    }
  }
})
```

---

## 🚀 SONRAKI ADIMLAR

### Geliştirme Önerileri

1. **VS Code Extensions:**
   - Prisma (prisma.prisma)
   - Tailwind CSS IntelliSense
   - ESLint
   - Prettier

2. **Öğrenme Kaynakları:**
   - Next.js Docs: https://nextjs.org/docs
   - Prisma Docs: https://www.prisma.io/docs
   - NextAuth.js: https://next-auth.js.org

3. **Gelecek Özellikler (Kendiniz Ekleyebilirsiniz):**
   - Drag & Drop (@dnd-kit)
   - Gerçek zamanlı güncellemeler (WebSocket)
   - Dosya ekleme
   - Yorum sistemi
   - Bildirimler

---

## ✅ KONTROL LİSTESİ

İlk çalıştırma öncesi:

- [ ] Node.js v18+ kurulu
- [ ] pnpm v8+ kurulu
- [ ] PostgreSQL kurulu ve çalışıyor
- [ ] `ulgen_trello` veritabanı oluşturuldu
- [ ] `.env` dosyası düzenlendi
- [ ] `pnpm install` çalıştırıldı
- [ ] `pnpm db:generate` çalıştırıldı
- [ ] `pnpm db:push` çalıştırıldı
- [ ] `pnpm db:seed` çalıştırıldı (opsiyonel)
- [ ] `pnpm dev` ile uygulama başlatıldı
- [ ] `http://localhost:3000` açıldı
- [ ] Giriş yapıldı
- [ ] Board oluşturuldu
- [ ] Liste ve kart eklendi

---

## 📞 YARDIM VE DESTEK

### Dokümantasyonlar
- `README.md` - Genel bilgiler
- `KURULUM_VE_CALISTIRMA.md` - Detaylı kılavuz
- `TESHIS_RAPORU.md` - Sistem analizi

### Hata Ayıklama
- Browser Console: F12 (Chrome DevTools)
- Server Logs: PowerShell çıktılarına bakın
- Prisma Studio: `pnpm db:studio` ile veritabanını inceleyin

---

**🎉 Başarılar! ÜLGEN projeniz hazır!**

**Son Güncelleme:** 31 Aralık 2025  
**Versiyon:** 1.0  
**Yazar:** GitHub Copilot AI Assistant
