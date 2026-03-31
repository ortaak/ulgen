# 🚀 Sonraki Seans Planı - Daily Task Timeline MVP

**Tarih:** 2 Ocak 2026  
**Özellik:** Daily Task Timeline MVP  
**Tahmini Süre:** 3-4 saat  
**Hedef:** Çalışan bir prototype

---

## ✅ Hazırlık (Tamamlandı)

- [x] Konsept dokümanı oluşturuldu ([DAILY_TASK_TIMELINE.md](DAILY_TASK_TIMELINE.md))
- [x] TODOS.md güncellendi
- [x] Diğer dokümanlara referanslar eklendi
- [x] Teknik spesifikasyon hazır

---

## 🎯 MVP Scope

### Dahil Olan Özellikler:
✅ Günlük timeline görünümü (Morning/Afternoon/Evening)  
✅ Board'lardan kart seçip timeline'a ekleme  
✅ Tahmini süre belirleme (30dk, 1h, 2h)  
✅ "Start Task" ve "Complete Task" butonları  
✅ Temel progress tracking  
✅ Günlük stats (tamamlanan/kalan görevler)  
✅ Responsive tasarım

### Dahil Olmayan (v2'de):
❌ Drag & drop (manuel ekleme yeterli)  
❌ Pomodoro timer  
❌ Multi-day navigation  
❌ Gerçek zamanlı timer  
❌ Advanced analytics  

---

## 📋 Implementation Checklist

### 1️⃣ Database (30-45 dk)
```bash
# Yapılacaklar:
1. packages/database/prisma/schema.prisma güncelle
2. npx prisma migrate dev --name add_timeline_task
3. Seed data ekle (opsiyonel)
```

**Schema Eklenecek:**
```prisma
model TimelineTask {
  id           String   @id @default(cuid())
  userId       String
  cardId       String
  boardId      String
  
  scheduledDate DateTime
  timeSlot     TimeSlot
  estimatedMinutes Int @default(60)
  
  status       TimelineTaskStatus @default(PLANNED)
  startedAt    DateTime?
  completedAt  DateTime?
  actualMinutes Int?
  
  user      User     @relation(fields: [userId], references: [id])
  card      Card     @relation(fields: [cardId], references: [id], onDelete: Cascade)
  board     Board    @relation(fields: [boardId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([userId, scheduledDate])
}

enum TimeSlot {
  MORNING    // 06:00-12:00
  AFTERNOON  // 12:00-18:00
  EVENING    // 18:00-00:00
}

enum TimelineTaskStatus {
  PLANNED
  IN_PROGRESS
  COMPLETED
  SKIPPED
}
```

### 2️⃣ API Endpoints (45-60 dk)

```bash
# Oluşturulacak dosyalar:
apps/web/app/api/timeline/route.ts           # GET, POST
apps/web/app/api/timeline/[id]/route.ts      # PATCH, DELETE
apps/web/app/api/timeline/[id]/start/route.ts
apps/web/app/api/timeline/[id]/complete/route.ts
```

**Endpoints:**
- `GET /api/timeline?date=2026-01-02` → Günlük task'ları getir
- `POST /api/timeline` → Yeni task ekle
- `PATCH /api/timeline/:id/start` → Task'ı başlat
- `PATCH /api/timeline/:id/complete` → Task'ı tamamla
- `DELETE /api/timeline/:id` → Task'ı sil

### 3️⃣ Zustand Store (30 dk)

```bash
# Oluşturulacak:
apps/web/store/timeline.store.ts
```

**Store State:**
```typescript
interface TimelineStore {
  currentDate: Date;
  tasks: TimelineTask[];
  stats: { total, completed, inProgress, remaining };
  
  setDate: (date: Date) => void;
  fetchTasks: (date: Date) => Promise<void>;
  addTask: (task) => Promise<void>;
  startTask: (id: string) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}
```

### 4️⃣ UI Components (90-120 dk)

```bash
# Oluşturulacak dosyalar:
apps/web/app/(dashboard)/timeline/page.tsx
apps/web/components/timeline/timeline-view.tsx
apps/web/components/timeline/timeline-header.tsx
apps/web/components/timeline/time-slot-section.tsx
apps/web/components/timeline/task-card.tsx
apps/web/components/timeline/add-task-dialog.tsx
apps/web/components/timeline/timeline-stats.tsx
```

**Component Hierarchy:**
```
TimelinePage
└── TimelineView
    ├── TimelineHeader (date, stats)
    ├── TimeSlotSection (Morning)
    │   ├── TaskCard
    │   ├── TaskCard
    │   └── AddTaskButton
    ├── TimeSlotSection (Afternoon)
    │   └── TaskCard
    └── TimeSlotSection (Evening)
        └── [Empty state]
```

### 5️⃣ Navigation (10 dk)

```bash
# Güncellenecek:
apps/web/components/dashboard-nav.tsx
```

**Navbar'a ekle:**
- 🕐 Timeline linki

---

## 🎨 Minimal UI Design

```
┌─────────────────────────────────────────────────────┐
│  Timeline - 2 Ocak 2026           📊 3/5 tamamlandı │
├─────────────────────────────────────────────────────┤
│                                                       │
│  🌅 MORNING (06:00-12:00)                            │
│  ┌──────────────────────────────────────────────┐   │
│  │ 💻 Backend API Development                   │   │
│  │ 🎯 Sprint Board · 2 saat                     │   │
│  │ [▶️ Start] [✅ Complete] [🗑️ Remove]          │   │
│  └──────────────────────────────────────────────┘   │
│  [+ Add Task]                                        │
│                                                       │
│  ☀️ AFTERNOON (12:00-18:00)                         │
│  ┌──────────────────────────────────────────────┐   │
│  │ ✅ Weekly Report                             │   │
│  │ 📈 Marketing Board · 1 saat · COMPLETED     │   │
│  └──────────────────────────────────────────────┘   │
│  [+ Add Task]                                        │
│                                                       │
│  🌙 EVENING (18:00-00:00)                           │
│  [+ Add Task]                                        │
│                                                       │
└─────────────────────────────────────────────────────┘
```

---

## 🚦 Başlangıç Komutu

```powershell
# PostgreSQL kontrol
Get-Service postgresql-x64-16

# Dev server başlat (ayrı terminal)
pnpm dev

# Prisma Studio (opsiyonel)
cd packages/database
npx prisma studio
```

---

## 📝 Test Senaryosu

1. ✅ `/timeline` sayfasını aç
2. ✅ "Add Task" butonuna tıkla
3. ✅ Board seç → Card seç → Time slot seç → Süre belirle
4. ✅ Task eklenir, Morning section'da görünür
5. ✅ "Start" butonuna bas → Status IN_PROGRESS olur
6. ✅ "Complete" butonuna bas → Yeşil ✅ işareti çıkar
7. ✅ Stats güncellenir (1/1 completed)

---

## 🎯 Başarı Kriterleri

MVP tamamlanmış sayılır eğer:
- [x] Timeline sayfası açılıyor
- [x] Board'dan task ekleyebiliyorum
- [x] Task'ı başlatıp tamamlayabiliyorum
- [x] Tamamlanan task'lar yeşil görünüyor
- [x] Stats doğru sayıyor (3/5 gibi)
- [x] Responsive (mobile'da çalışıyor)

---

## 💡 İpuçları

**Hızlı İlerleme İçin:**
1. Önce database + API'yi bitir (test et Postman/curl ile)
2. Sonra UI'ye geç (data varsa kolay)
3. Styling'i en sona bırak (çalışan > güzel)
4. shadcn/ui componentlerini kullan (button, dialog, card)

**Takıldığında:**
1. Mevcut board/card/list componentlerine bak (pattern'ler aynı)
2. Comment feature'ı referans al (yeni eklendi, temiz kod)
3. Prisma studio'da veriyi manuel test et

---

## 📚 Referans Dosyalar

**Benzeri Yapılar:**
- `apps/web/app/api/cards/route.ts` → API pattern
- `apps/web/store/board.store.ts` → Zustand pattern
- `apps/web/components/card/card-item.tsx` → Component pattern
- `packages/database/prisma/schema.prisma` → Model pattern

---

## 🎉 Bitince

1. Test et (farklı board'lardan task ekle)
2. Screenshot al (dokümantasyon için)
3. CHANGELOG.md güncelle (v1.5.0)
4. Git commit yap
5. Bana göster, feedback alalım! 🚀

---

**Hazır olduğunuzda şunu söyleyin:**
> "MVP'ye başlayalım"

Ve ben de adım adım rehberlik ederim. İyi dinlenme! 😊
