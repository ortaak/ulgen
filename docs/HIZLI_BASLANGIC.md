# Hızlı Başlangıç Kılavuzu - ÜLGEN

Yeni bir AI konuşmasında projeye hızlıca başlamak için bu dosyayı oku.

---

## ⚡ 30 Saniyede Başla

```powershell
# 1. Proje dizinine git
cd "C:\Users\User\OneDrive\Belgeler\PROJELER\ÜLGEN\trello-clone"

# 2. Uygulamayı başlat
pnpm dev

# 3. Tarayıcıda aç
# http://localhost:3000

# 4. Demo hesabı ile giriş yap
# Email: demo@ulgen.com
# Password: demo123
```

---

## 📋 Sistem Durumu Kontrol

### PostgreSQL Çalışıyor mu?
```powershell
Get-Service postgresql-x64-16
# Status: Running olmalı
```

### Database Bağlantısı Tamam mı?
```powershell
psql -U postgres -d ulgen_trello -c "SELECT COUNT(*) FROM \"User\";"
# 1 satır dönmeli (demo user)
```

### .env Dosyaları Var mı?
```powershell
# 3 dosya kontrol et
Test-Path .env
Test-Path packages\database\.env
Test-Path apps\web\.env
# Hepsi True olmalı
```

---

## 🔧 Temel Komutlar

### Geliştirme
```powershell
pnpm dev              # Uygulamayı başlat
pnpm build            # Production build
pnpm start            # Production'da çalıştır
```

### Database
```powershell
pnpm db:generate      # Prisma Client oluştur
pnpm db:push          # Schema'yı database'e push et
pnpm db:seed          # Demo data yükle
pnpm db:studio        # Database GUI aç (localhost:5555)
```

### Dependencies
```powershell
pnpm install          # Tüm dependencies'i yükle
pnpm add <package>    # Yeni package ekle
```

---

## 🗂️ Dosya Yapısı (Önemli Klasörler)

```
trello-clone/
├── apps/web/                    # Next.js uygulaması
│   ├── app/                     # App Router pages
│   │   ├── (auth)/             # Login/Register
│   │   ├── (dashboard)/        # Board pages
│   │   └── api/                # API routes
│   ├── components/              # React components
│   │   ├── card/               # Kart components
│   │   ├── list/               # Liste components
│   │   └── ui/                 # UI primitives
│   ├── lib/                     # Utilities
│   ├── store/                   # Zustand store
│   └── types/                   # TypeScript types
├── packages/database/           # Prisma package
│   └── prisma/
│       └── schema.prisma       # Database schema
└── docs/                        # Dokümantasyon
    ├── PROJE_DURUMU.md         # 👈 ÖNCE BUNU OKU
    ├── CHANGELOG.md             # Değişiklik geçmişi
    └── HIZLI_BASLANGIC.md      # Bu dosya
```

---

## 🔐 Kritik Bilgiler

### PostgreSQL
- **Host:** localhost:5432
- **Database:** ulgen_trello
- **Username:** postgres
- **Password:** FBU45mB9u

### Demo Hesap
- **Email:** demo@ulgen.com
- **Password:** demo123

### URLs
- **Uygulama:** http://localhost:3000
- **Prisma Studio:** http://localhost:5555 (pnpm db:studio)

---

## ✅ Özellik Durumu

### Çalışan Özellikler
- ✅ Kullanıcı girişi/kaydı
- ✅ Board oluşturma/listeleme
- ✅ Liste ekleme/silme
- ✅ Kart ekleme/silme/güncelleme
- ✅ **Kart detay modal'ı** (başlık, açıklama, etiketler, tarih)
- ✅ **Gerçek zamanlı UI güncellemeleri** (sayfa yenilemeden)

### Yapılabilir İyileştirmeler
- ⏳ Drag & drop
- ⏳ Label/assignee picker
- ⏳ Board üye yönetimi
- ⏳ Yorumlar ve aktivite geçmişi

---

## 🐛 Sık Karşılaşılan Sorunlar

### Port 3000 Kullanımda
```powershell
# 3000 portunu kullanan process'i bul ve öldür
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### PostgreSQL Çalışmıyor
```powershell
# Servisi başlat
Start-Service postgresql-x64-16
```

### Prisma Client Bulunamıyor
```powershell
pnpm db:generate
```

### Cache Sorunu
```powershell
Remove-Item -Recurse -Force .next
pnpm dev
```

---

## 📝 Yeni Özellik Eklerken

1. **Backend (API Route) Ekle**
   ```typescript
   // apps/web/app/api/[entity]/route.ts
   export async function POST(req: Request) {
     // Logic
   }
   ```

2. **Zustand Store Güncelle**
   ```typescript
   // apps/web/store/board.store.ts
   addEntity: (entity) => set(...)
   ```

3. **Component Oluştur**
   ```typescript
   // apps/web/components/[entity]/...
   const { addEntity } = useBoardStore();
   ```

4. **Store'u Çağır (Optimistic Update)**
   ```typescript
   const newEntity = await response.json();
   addEntity(newEntity); // State'i güncelle
   ```

---

## 🆘 Acil Komutlar

### Tüm Sistemi Sıfırla
```powershell
# Database sıfırla
psql -U postgres -c "DROP DATABASE ulgen_trello;"
psql -U postgres -c "CREATE DATABASE ulgen_trello;"
pnpm db:push
pnpm db:seed

# Cache temizle
Remove-Item -Recurse -Force .next, node_modules
pnpm install
```

### Logs ve Debug
```powershell
# Terminal output'u izle (Prisma queries görünür)
pnpm dev

# Database'i görsel incele
pnpm db:studio
```

---

## 🎯 Bir Sonraki Konuşmada Ne Yapmalı?

1. **Önce `docs/PROJE_DURUMU.md` dosyasını oku**
   - Tüm kritik bilgiler orada

2. **Sistemi kontrol et**
   ```powershell
   Get-Service postgresql-x64-16  # Running olmalı
   ```

3. **Uygulamayı başlat**
   ```powershell
   pnpm dev
   ```

4. **Kullanıcının isteğini dinle**
   - Yeni özellik mi?
   - Bug fix mi?
   - Optimizasyon mu?

5. **Changelog'u güncelle**
   - Her değişiklik sonrası `docs/CHANGELOG.md`'ye ekle

---

## 📚 Diğer Dokümantasyon

- **PROJE_DURUMU.md** - Kapsamlı proje bilgileri, credentials, sorun giderme
- **CHANGELOG.md** - Tüm değişikliklerin detaylı geçmişi
- **KURULUM_VE_CALISTIRMA.md** - İlk kurulum adımları (root'ta)
- **TESHIS_RAPORU.md** - İlk analiz raporu (root'ta)

---

**Not:** Bu dosya hızlı referans içindir. Detaylı bilgi için `PROJE_DURUMU.md` dosyasını oku.

**Son Güncelleme:** 1 Ocak 2026
