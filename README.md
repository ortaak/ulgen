# ÜLGEN

> Proje ve görev yönetim uygulaması — Board, Timeline, Analytics ve daha fazlası.

**Versiyon:** v2.5.0 | **Stack:** Next.js 14 · TypeScript · PostgreSQL · Prisma · Zustand · TailwindCSS

---

## Özellikler

### Temel Yönetim
- **Board / Liste / Kart** — Sürükle-bırak ile tam CRUD (@dnd-kit)
- **Etiketler** — Board seviyesinde renk kodlu etiketler, kart filtresi
- **Bitiş Tarihleri** — Tarih seçici, renk kodlu badge (gecikme/bugün/gelecek)
- **Kontrol Listeleri** — Kart içi checklist & items, ilerleme çubuğu
- **Dosya Ekleri** — UploadThing CDN (maks 8MB), önizleme
- **Yorumlar** — Karta yorum ekleme, düzenleme, silme
- **Kart Bağımlılıkları** — "A tamamlanmadan B başlamasın", BFS döngü koruması
- **Kart Tamamlandı** — Board-level tamamlama, timeline'dan otomatik dışlama
- **Trello JSON İçe Aktarma** — Trello export formatı desteği

### Verimlilik Araçları
- **Daily Task Timeline** — Cross-board günlük planlama, Pomodoro zamanlayıcı, haftalık grid, günlük rapor
- **Eisenhower Matrisi** — Kartları 4 kadranda (YAP/PLANLA/DELEGE ET/SİL) görselleştirme
- **Kişisel Analitik** — Haftalık/aylık özet, saatlik verimlilik haritası, tahmin doğruluğu trendi

### Teknik
- **Auth** — NextAuth.js (email/şifre + Google OAuth)
- **Rol Tabanlı Erişim** — Owner / Admin / Member
- **Optimistic UI** — Zustand store anında günceller, API başarısızsa revert
- **Monorepo** — pnpm workspaces + Turborepo

---

## Stack

| Katman | Teknoloji |
|--------|-----------|
| Framework | Next.js 14 (App Router) |
| Dil | TypeScript |
| Veritabanı | PostgreSQL + Prisma ORM |
| Auth | NextAuth.js |
| State | Zustand |
| UI | Radix UI + TailwindCSS |
| Dosya | UploadThing |
| Charts | Recharts |
| DnD | @dnd-kit |
| Monorepo | pnpm + Turborepo |

---

## Mimari

```
ulgen/
├── apps/
│   └── web/                    # Next.js 14 uygulaması
│       ├── app/                # App Router sayfaları & API route'ları
│       ├── components/         # UI bileşenleri (board, card, timeline…)
│       ├── services/           # İş mantığı (statik class metodları)
│       ├── store/              # Zustand store'ları
│       └── types/              # TypeScript tip tanımları
└── packages/
    └── database/               # Prisma schema + client
```

**API Route'ları:** 30+ endpoint — board, list, card, comment, attachment, checklist, label, dependency, timeline, analytics, import

---

## Kurulum

```bash
# Bağımlılıkları yükle
pnpm install

# .env dosyalarını oluştur
cp .env.example .env
cp apps/web/.env.example apps/web/.env
# packages/database/.env dosyasına DATABASE_URL ekle

# Veritabanını sync et
pnpm db:push

# Geliştirme sunucusunu başlat
pnpm dev
```

**Gerekli environment değişkenleri:**
- `DATABASE_URL` — PostgreSQL bağlantı URL'i
- `NEXTAUTH_SECRET` — NextAuth şifreleme anahtarı
- `NEXTAUTH_URL` — Uygulama URL'i
- `UPLOADTHING_TOKEN` — UploadThing dosya yükleme

---

## Değişiklik Geçmişi

Tüm versiyonlar için [CHANGELOG.md](docs/CHANGELOG.md) dosyasına bakın.

**Son versiyon (v2.5.0):** Kart Bağımlılıkları — BFS döngü koruması, DependencyBadge, DependencyPicker, Timeline bloke uyarısı
