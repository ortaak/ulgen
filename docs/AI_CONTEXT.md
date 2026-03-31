# AI Context - Yeni Konuşma Başlangıcı

> **Bu dosya AI asistanlar için hazırlanmıştır.**  
> Yeni bir konuşma başlarken bu dosyayı oku ve bağlamı otomatik kur.

---

## 🤖 AI İçin Talimatlar

### İlk Mesajda Yapılması Gerekenler

1. **Otomatik Sistem Kontrolü**
   ```powershell
   # PostgreSQL durumu
   Get-Service postgresql-x64-16
   
   # .env dosyaları
   Test-Path .env, packages\database\.env, apps\web\.env
   ```

2. **Proje Durumunu Oku**
   - `docs/PROJE_DURUMU.md` dosyasını tamamen oku
   - `docs/CHANGELOG.md` son versiyonu kontrol et
   - `docs/TODOS.md` yapılacakları gözden geçir
   - `docs/DAILY_TASK_TIMELINE.md` yeni özellik konseptini incele
   - Son değişiklikleri hafızaya al

3. **Kullanıcıya Özet Bilgi Ver**
   ```
   ✅ Sistem durumu kontrol edildi
   ✅ PostgreSQL çalışıyor
   ✅ .env dosyaları mevcut
   ✅ Son versiyon: 1.2.0
   
   Projede çalışmaya hazırım. Ne yapmamı istersin?
   ```

---

## 📊 Proje Özeti (Hızlı Referans)

### Teknoloji Stack
- **Framework:** Next.js 14 (App Router) + React 18
- **Database:** PostgreSQL 16 + Prisma ORM
- **Auth:** NextAuth.js
- **State:** Zustand
- **Styling:** Tailwind CSS
- **Monorepo:** pnpm + Turborepo

### Credentials (Sık Kullanılan)
```
PostgreSQL: postgres / FBU45mB9u @ localhost:5432 / ulgen_trello
Demo User: demo@ulgen.com / demo123
NEXTAUTH_SECRET: gETtU8gZWakPH/OJgEpV9H552/n5DU5+wWPN/PtZrTI=
```

### Önemli Komutlar
```powershell
pnpm dev          # Uygulamayı başlat
pnpm db:push      # Schema güncelle
pnpm db:seed      # Demo data
pnpm db:studio    # Database GUI
```

### Dizin Yapısı
```
apps/web/                  # Next.js app
  ├── app/(dashboard)/     # Board sayfaları
  ├── components/          # React components
  ├── store/              # Zustand store
  └── lib/                # Utilities
packages/database/         # Prisma
  └── prisma/schema.prisma
docs/                      # 👈 Dokümantasyon
```

---

## 🎯 Görev Tipleri ve Yaklaşımlar

### 1. Yeni Özellik Eklemek
**Adımlar:**
1. Database schema değişikliği gerekli mi? → `schema.prisma`
2. API endpoint ekle → `apps/web/app/api/[entity]/route.ts`
3. Zustand store güncelle → `board.store.ts`
4. Component oluştur → `apps/web/components/`
5. Store entegrasyonu (optimistic update)
6. Test et
7. **CHANGELOG.md güncelle**

### 2. Bug Fix
**Adımlar:**
1. Sorunu reproduce et
2. Root cause analizi yap
3. Fix uygula (multi_replace_string_in_file kullan)
4. Test et
5. Kullanıcıya açıkla
6. **CHANGELOG.md güncelle**

### 3. Optimizasyon
**Adımlar:**
1. Mevcut kodu analiz et
2. Performans darboğazlarını tespit et
3. İyileştirme öner ve uygula
4. Before/after karşılaştır
5. **CHANGELOG.md güncelle**

---

## 🔍 Kod İnceleme Rehberi

### State Management Pattern
```typescript
// ✅ DOĞRU: Optimistic UI Update
const response = await fetch('/api/cards', { ... });
const newCard = await response.json();
addCard(newCard); // Store'u güncelle
```

```typescript
// ❌ YANLIŞ: Store güncellenmemiş
const response = await fetch('/api/cards', { ... });
onCreated?.(); // Sadece callback, state güncellenmiyor
```

### API Route Pattern
```typescript
// apps/web/app/api/[entity]/route.ts
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const body = await req.json();
  const data = await prisma.entity.create({ data: body });
  
  return NextResponse.json(data);
}
```

### Component Pattern
```typescript
// components/[entity]/create-[entity]-form.tsx
'use client';

import { useBoardStore } from '@/store/board.store';

export function CreateForm({ onCreated }) {
  const addEntity = useBoardStore((state) => state.addEntity);
  
  const handleSubmit = async () => {
    const res = await fetch('/api/entity', { ... });
    const data = await res.json();
    addEntity(data); // Store güncelle
    onCreated?.();
  };
}
```

---

## 🚨 Yaygın Hatalar ve Çözümleri

### 1. State Güncellenmiyor
**Belirti:** Yeni eklenen veri sayfa yenilenene kadar görünmüyor  
**Çözüm:** Zustand store'dan ilgili action'ı import et ve çağır

### 2. TypeScript Hatası
**Belirti:** Type errors, "Property does not exist"  
**Çözüm:** `apps/web/types/index.ts` kontrol et, eksik type tanımla

### 3. Prisma Query Çalışmıyor
**Belirti:** "Invalid prisma.xxx invocation"  
**Çözüm:** 
```powershell
pnpm db:generate  # Client'ı yeniden oluştur
```

### 4. API Route 500 Hatası
**Belirti:** Internal Server Error  
**Çözüm:** Terminal output'u kontrol et, Prisma query hatası olabilir

---

## 📝 Dokümantasyon Güncelleme Kuralları

### Her Değişiklikte Güncelle
1. **CHANGELOG.md** - Her commit sonrası
   - Yeni özellik → 🎉 Yeni Özellikler
   - Bug fix → 🐛 Düzeltilen Hatalar
   - Değişiklik → 🔄 Değiştirilen Dosyalar

2. **PROJE_DURUMU.md** - Büyük değişikliklerde
   - Yeni teknoloji eklendi
   - Yeni tablo eklendi
   - Önemli konfigürasyon değişti

3. **AI_CONTEXT.md** - Pattern değişikliklerinde
   - Yeni kod pattern'i
   - Yeni best practice
   - Sık yapılan hata eklendi

---

## 🧪 Test Checklist

### Manual Test Senaryosu
```
1. [ ] Giriş yap (demo@ulgen.com)
2. [ ] Board oluştur
3. [ ] Liste ekle (anında görünmeli)
4. [ ] Kart ekle (anında görünmeli)
5. [ ] Karta tıkla (modal açılmalı)
6. [ ] Başlık değiştir (anında güncellenmeli)
7. [ ] Kartı sil (anında kalmalı)
8. [ ] Listeyi sil (anında kalmalı)
```

### Otomatik Kontroller
```powershell
# TypeScript errors
pnpm type-check

# Lint errors
pnpm lint

# Build başarılı mı
pnpm build
```

---

## 🎓 Proje Kültürü

### Kod Yazım Kuralları
- **TypeScript:** Strict mode, explicit types
- **Components:** Client component'lerde `'use client'` direktifi
- **State:** Zustand ile merkezi state yönetimi
- **API:** Server-side authentication kontrolü
- **UI:** Optimistic updates, anında feedback

### Commit Message Formatı
```
feat: Yeni özellik açıklaması
fix: Bug fix açıklaması
refactor: Refactoring açıklaması
docs: Dokümantasyon güncellemesi
```

### Dosya İsimlendirme
```
kebab-case.tsx          # Components
camelCase.ts            # Utilities
PascalCase.tsx          # React components (export)
SCREAMING_SNAKE.md      # Docs
```

---

## 🔗 Harici Kaynaklar

### Dokümantasyon
- Next.js: https://nextjs.org/docs
- Prisma: https://www.prisma.io/docs
- NextAuth: https://next-auth.js.org
- Zustand: https://zustand-demo.pmnd.rs
- Tailwind: https://tailwindcss.com/docs

### Proje İçi Referanslar
- Schema: `packages/database/prisma/schema.prisma`
- Types: `apps/web/types/index.ts`
- Auth Config: `apps/web/lib/auth.ts`
- Store: `apps/web/store/board.store.ts`

---

## 💡 İpuçları

### Verimli Çalışma
1. **Paralel tool call kullan** (bağımsız işlemler için)
2. **multi_replace_string_in_file** tercih et (çoklu değişiklik)
3. **Semantic search** kullan (kod arama için)
4. **grep_search** kullan (hızlı dosya içi arama)

### Kullanıcı İletişimi
- Teknik terimler kullan ama Türkçe açıkla
- Her değişiklikten sonra kısa özet ver
- Dosya linklerini markdown format ile ver: `[file.ts](path/file.ts#L10)`
- Emoji kullanma (gereksiz)

### Hata Yönetimi
- Hatayı önce anla, sonra düzelt
- Root cause analizi yap
- Kullanıcıya ne olduğunu açıkla
- Çözümü dokümante et

---

## 🎬 İlk Mesaj Template

Yeni konuşma başlarken bu template'i kullan:

```
Merhaba! ÜLGEN projesine devam edelim.

[Sistem kontrolü yapılıyor...]

✅ PostgreSQL durumu: Running
✅ .env dosyaları: Mevcut
✅ Son versiyon: 1.1.0 (1 Ocak 2026)

Son yapılan değişiklikler:
- Kart detay modal'ı eklendi
- Gerçek zamanlı state güncellemeleri (optimistic UI)
- Tüm CRUD operasyonları sayfa yenilemeden çalışıyor

Projede ne yapmamı istersin?
```

---

**Son Güncelleme:** 1 Ocak 2026  
**Hedef Kitle:** AI Asistanlar (GitHub Copilot, Claude, GPT, vb.)
