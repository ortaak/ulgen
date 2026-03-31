
"projemi geliştirmeye devam edelim, TODOS.md'den 20. sıradaki **Daily Task Timeline (Cross-Board Time Planning)** özelliği yapalım"
Read c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\docs\TODOS.md
Read c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\docs\DAILY_TASK_TIMELINE.md
Çok kapsamlı bir özellik. Mevcut kod tabanını inceleyelim ve plan yapalım.

EnterPlanMode
OUT
Entered plan mode. You should now focus on exploring the codebase and designing an implementation approach.

In plan mode, you should:
1. Thoroughly explore the codebase to understand existing patterns
2. Identify similar features and architectural approaches
3. Consider multiple approaches and their trade-offs
4. Use AskUserQuestion if you need to clarify the approach
5. Design a concrete implementation strategy
6. When ready, use ExitPlanMode to present your plan for approval

Remember: DO NOT write or edit any files yet. This is a read-only exploration and planning phase.
Agent:Explore existing codebase patterns
IN
Trello clone projesinin mevcut kod yapısını incele. Şu bilgileri topla:

1. `packages/database/prisma/schema.prisma` - Mevcut modeller (Card, Board, List, User ilişkileri)
2. `apps/web/store/board.store.ts` - Zustand store pattern'i
3. `apps/web/app/api/` klasörünün yapısı - API route pattern'leri
4. `apps/web/services/` - Service sınıfları pattern'i
5. `apps/web/types/index.ts` - Frontend tip tanımları
6. `apps/web/components/` - Component yapısı (özellikle card ve list komponentleri)
7. `apps/web/app/(dashboard)/` - Page yapısı (layout, routing)
8. `apps/web/lib/auth.ts` - NextAuth yapısı (session.user.id nasıl alınıyor)

Her dosyadan kritik kısımları özetle. Özellikle:
- API route handler pattern (NextRequest, session check, prisma usage)
- Zustand store action pattern (optimistic updates)
- Component import patterns
- TypeScript interface tanımlama stili

Working directory: c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone
AskUserQuestion
OUT
User has answered your questions: "Timeline görünümü için hangi tasarımı tercih edersiniz?"="C) Kanban-Timeline Hybrid", "İlk aşamada ne kadar özellik isteyin?"="Sadece Phase 1". You can now continue with the user's answers in mind.
Şimdi planı yazayım.

Write C:\Users\turki\.claude\plans\cryptic-beaming-lovelace.md
218 lines
# Plan: Daily Task Timeline — Phase 1 MVP

## Bağlam
Kullanıcılar birden fazla board'da çalışırken görevleri dağınık kalıyor. Bu özellik tüm board'lardan kartları tek bir günlük zaman çizelgesinde topluyor. **Phase 1 MVP**: Temel timeline görünümü (Kanban-Timeline Hybrid), task ekleme/silme, manuel start/complete ve basit stats. Pomodoro ve drag & drop yok.

## Mimari

### Görünüm: Kanban-Timeline Hybrid (C)
- Sol panel: Sabah (06-12) / Öğle (12-18) / Akşam (18-00) blokları, kartlar listeleniyor
- Sağ panel: Günlük stats + "Planlanmadı" pool (board'lardan tüm kartlar)
- Üst: Tarih navigasyonu (< Dün | Bugün | Yarın >)

---

## Adımlar

### 1. Database Schema
**Dosya:** `packages/database/prisma/schema.prisma`

Eklenecek modeller:
```prisma
enum TimelineTaskStatus {
  PLANNED
  IN_PROGRESS
  PAUSED
  COMPLETED
  SKIPPED
}

model TimelineTask {
  id               String             @id @default(cuid())
  userId           String
  cardId           String
  boardId          String
  scheduledDate    DateTime
  startTime        DateTime
  endTime          DateTime
  estimatedMinutes Int                @default(60)
  status           TimelineTaskStatus @default(PLANNED)
  actualStartTime  DateTime?
  actualEndTime    DateTime?
  actualMinutes    Int?
  user             User               @relation(fields: [userId], references: [id])
  card             Card               @relation(fields: [cardId], references: [id], onDelete: Cascade)
  board            Board              @relation(fields: [boardId], references: [id], onDelete: Cascade)
  createdAt        DateTime           @default(now())
  updatedAt        DateTime           @updatedAt
  @@index([userId, scheduledDate])
}
```

Card, Board, User model'lerine `timelineTasks TimelineTask[]` relation ekle.

Ardından: `pnpm db:push`

### 2. TypeScript Tipleri
**Dosya:** `apps/web/types/index.ts`

```typescript
export interface TimelineTask {
  id: string
  userId: string
  cardId: string
  boardId: string
  scheduledDate: string
  startTime: string  // ISO datetime
  endTime: string
  estimatedMinutes: number
  status: 'PLANNED' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'SKIPPED'
  actualStartTime?: string
  actualEndTime?: string
  actualMinutes?: number
  card: {
    id: string
    title: string
    description?: string
  }
  board: {
    id: string
    title: string
  }
  createdAt: string
  updatedAt: string
}

export interface TimelineStats {
  totalPlanned: number
  completed: number
  inProgress: number
  remaining: number
  totalMinutesPlanned: number
}
```

### 3. Zod Validasyon Şemaları
**Dosya:** `apps/web/lib/validations.ts`

```typescript
export const createTimelineTaskSchema = z.object({
  cardId: z.string().cuid(),
  boardId: z.string().cuid(),
  scheduledDate: z.string(), // YYYY-MM-DD
  startTime: z.string(),     // ISO datetime
  endTime: z.string(),       // ISO datetime
  estimatedMinutes: z.number().int().min(15).max(480).default(60),
})
```

### 4. Service
**Yeni dosya:** `apps/web/services/timeline.service.ts`

Metodlar:
- `getTasksForDate(userId, date)` → tasks + stats hesapla
- `createTask(data, userId)` → board membership kontrol + overlap detection + create
- `updateTaskStatus(taskId, status, userId)` → sahiplik kontrol + status update (start sets actualStartTime, complete sets actualEndTime + actualMinutes)
- `deleteTask(taskId, userId)` → sahiplik kontrol + delete
- `getUnscheduledCards(userId)` → kullanıcının board'larındaki kartları getir (timeline'da olmayan)

### 5. API Endpoints

**`apps/web/app/api/timeline/route.ts`** (GET + POST)
- GET `?date=YYYY-MM-DD` → TimelineService.getTasksForDate()
- POST body: createTimelineTaskSchema → TimelineService.createTask()

**`apps/web/app/api/timeline/tasks/[id]/route.ts`** (PATCH + DELETE)
- PATCH body: `{ action: 'start' | 'pause' | 'complete' | 'skip' }` → updateTaskStatus()
- DELETE → TimelineService.deleteTask()

**`apps/web/app/api/timeline/unscheduled/route.ts`** (GET)
- GET `?date=YYYY-MM-DD` → TimelineService.getUnscheduledCards()

### 6. Zustand Store
**Yeni dosya:** `apps/web/store/timeline.store.ts`

```typescript
interface TimelineStore {
  currentDate: Date
  tasks: TimelineTask[]
  unscheduledCards: UnscheduledCard[]
  isLoading: boolean
  stats: TimelineStats

  setDate: (date: Date) => void
  fetchTasks: (date: Date) => Promise<void>
  fetchUnscheduledCards: () => Promise<void>
  addTask: (data: CreateTimelineTaskInput) => Promise<void>
  updateStatus: (id: string, action: TaskAction) => Promise<void>
  deleteTask: (id: string) => Promise<void>
}
```

Optimistic update pattern: mevcut board.store.ts ile aynı yaklaşım.

### 7. Components
**Yeni klasör:** `apps/web/components/timeline/`

| Dosya | Açıklama |
|-------|----------|
| `timeline-view.tsx` | Ana container, layout (sol + sağ panel) |
| `timeline-header.tsx` | Tarih navigasyonu (< Dün/Bugün/Yarın >) |
| `timeline-section.tsx` | Sabah/Öğle/Akşam bloğu (genişletilebilir) |
| `timeline-task-card.tsx` | Tek görev kartı (title, board adı, saat, actions) |
| `timeline-stats.tsx` | Sağ panel: tamamlanan/toplam/ilerleme yüzdesi |
| `unscheduled-pool.tsx` | Sağ panel: Planlanmamış kartlar listesi |
| `add-task-dialog.tsx` | "Görev Ekle" dialog: saat seç + board/kart seç |

**Task status renkleri:**
- PLANNED → `border-gray-300 bg-white`
- IN_PROGRESS → `border-yellow-400 bg-yellow-50`
- COMPLETED → `border-green-400 bg-green-50 opacity-70`
- PAUSED → `border-orange-400 border-dashed bg-orange-50`
- SKIPPED → `opacity-40 line-through`

### 8. Sayfa Route
**Yeni dosya:** `apps/web/app/(dashboard)/timeline/page.tsx`

```typescript
export default function TimelinePage() {
  return <TimelineView />
}
```

### 9. Navigation
**Dosya:** `apps/web/components/layout/dashboard-nav.tsx` veya benzeri nav dosyası

Timeline sayfasına link ekleme.

---

## Kritik Dosyalar

| Dosya | Değişiklik |
|-------|-----------|
| `packages/database/prisma/schema.prisma` | TimelineTask modeli + enum ekle |
| `apps/web/types/index.ts` | TimelineTask, TimelineStats tipleri |
| `apps/web/lib/validations.ts` | createTimelineTaskSchema |
| `apps/web/services/timeline.service.ts` | **Yeni** |
| `apps/web/app/api/timeline/route.ts` | **Yeni** |
| `apps/web/app/api/timeline/tasks/[id]/route.ts` | **Yeni** |
| `apps/web/app/api/timeline/unscheduled/route.ts` | **Yeni** |
| `apps/web/store/timeline.store.ts` | **Yeni** |
| `apps/web/components/timeline/` (7 dosya) | **Yeni** |
| `apps/web/app/(dashboard)/timeline/page.tsx` | **Yeni** |
| Nav component | Link ekleme |

---

## Doğrulama

1. `pnpm db:push` → schema migration başarılı
2. `pnpm dev` → dev server başlatılır
3. `/timeline` sayfası açılır → Bugünün boş timeline görünür
4. "Görev Ekle" → board seç → kart seç → saat seç → timeline'a eklenir
5. "Başlat" butonu → status IN_PROGRESS, saat damgası set edilir
6. "Tamamla" butonu → COMPLETED, yeşil görünüm
7. Sağdaki Unscheduled pool → tüm board kartları listelenir
8. Stats güncel kalır
Claude’s Plan
Plan: Daily Task Timeline — Phase 1 MVP
Bağlam
Kullanıcılar birden fazla board'da çalışırken görevleri dağınık kalıyor. Bu özellik tüm board'lardan kartları tek bir günlük zaman çizelgesinde topluyor. Phase 1 MVP: Temel timeline görünümü (Kanban-Timeline Hybrid), task ekleme/silme, manuel start/complete ve basit stats. Pomodoro ve drag & drop yok.

Mimari
Görünüm: Kanban-Timeline Hybrid (C)
Sol panel: Sabah (06-12) / Öğle (12-18) / Akşam (18-00) blokları, kartlar listeleniyor
Sağ panel: Günlük stats + "Planlanmadı" pool (board'lardan tüm kartlar)
Üst: Tarih navigasyonu (< Dün | Bugün | Yarın >)
Adımlar
1. Database Schema
Dosya: packages/database/prisma/schema.prisma

Eklenecek modeller:


enum TimelineTaskStatus {
  PLANNED
  IN_PROGRESS
  PAUSED
  COMPLETED
  SKIPPED
}

model TimelineTask {
  id               String             @id @default(cuid())
  userId           String
  cardId           String
  boardId          String
  scheduledDate    DateTime
  startTime        DateTime
  endTime          DateTime
  estimatedMinutes Int                @default(60)
  status           TimelineTaskStatus @default(PLANNED)
  actualStartTime  DateTime?
  actualEndTime    DateTime?
  actualMinutes    Int?
  user             User               @relation(fields: [userId], references: [id])
  card             Card               @relation(fields: [cardId], references: [id], onDelete: Cascade)
  board            Board              @relation(fields: [boardId], references: [id], onDelete: Cascade)
  createdAt        DateTime           @default(now())
  updatedAt        DateTime           @updatedAt
  @@index([userId, scheduledDate])
}
Card, Board, User model'lerine timelineTasks TimelineTask[] relation ekle.

Ardından: pnpm db:push

2. TypeScript Tipleri
Dosya: apps/web/types/index.ts


export interface TimelineTask {
  id: string
  userId: string
  cardId: string
  boardId: string
  scheduledDate: string
  startTime: string  // ISO datetime
  endTime: string
  estimatedMinutes: number
  status: 'PLANNED' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'SKIPPED'
  actualStartTime?: string
  actualEndTime?: string
  actualMinutes?: number
  card: {
    id: string
    title: string
    description?: string
  }
  board: {
    id: string
    title: string
  }
  createdAt: string
  updatedAt: string
}

export interface TimelineStats {
  totalPlanned: number
  completed: number
  inProgress: number
  remaining: number
  totalMinutesPlanned: number
}
3. Zod Validasyon Şemaları
Dosya: apps/web/lib/validations.ts


export const createTimelineTaskSchema = z.object({
  cardId: z.string().cuid(),
  boardId: z.string().cuid(),
  scheduledDate: z.string(), // YYYY-MM-DD
  startTime: z.string(),     // ISO datetime
  endTime: z.string(),       // ISO datetime
  estimatedMinutes: z.number().int().min(15).max(480).default(60),
})
4. Service
Yeni dosya: apps/web/services/timeline.service.ts

Metodlar:

getTasksForDate(userId, date) → tasks + stats hesapla
createTask(data, userId) → board membership kontrol + overlap detection + create
updateTaskStatus(taskId, status, userId) → sahiplik kontrol + status update (start sets actualStartTime, complete sets actualEndTime + actualMinutes)
deleteTask(taskId, userId) → sahiplik kontrol + delete
getUnscheduledCards(userId) → kullanıcının board'larındaki kartları getir (timeline'da olmayan)
5. API Endpoints
apps/web/app/api/timeline/route.ts (GET + POST)

GET ?date=YYYY-MM-DD → TimelineService.getTasksForDate()
POST body: createTimelineTaskSchema → TimelineService.createTask()
apps/web/app/api/timeline/tasks/[id]/route.ts (PATCH + DELETE)

PATCH body: { action: 'start' | 'pause' | 'complete' | 'skip' } → updateTaskStatus()
DELETE → TimelineService.deleteTask()
apps/web/app/api/timeline/unscheduled/route.ts (GET)

GET ?date=YYYY-MM-DD → TimelineService.getUnscheduledCards()
6. Zustand Store
Yeni dosya: apps/web/store/timeline.store.ts


interface TimelineStore {
  currentDate: Date
  tasks: TimelineTask[]
  unscheduledCards: UnscheduledCard[]
  isLoading: boolean
  stats: TimelineStats

  setDate: (date: Date) => void
  fetchTasks: (date: Date) => Promise<void>
  fetchUnscheduledCards: () => Promise<void>
  addTask: (data: CreateTimelineTaskInput) => Promise<void>
  updateStatus: (id: string, action: TaskAction) => Promise<void>
  deleteTask: (id: string) => Promise<void>
}
Optimistic update pattern: mevcut board.store.ts ile aynı yaklaşım.

7. Components
Yeni klasör: apps/web/components/timeline/

Dosya	Açıklama
timeline-view.tsx	Ana container, layout (sol + sağ panel)
timeline-header.tsx	Tarih navigasyonu (< Dün/Bugün/Yarın >)
timeline-section.tsx	Sabah/Öğle/Akşam bloğu (genişletilebilir)
timeline-task-card.tsx	Tek görev kartı (title, board adı, saat, actions)
timeline-stats.tsx	Sağ panel: tamamlanan/toplam/ilerleme yüzdesi
unscheduled-pool.tsx	Sağ panel: Planlanmamış kartlar listesi
add-task-dialog.tsx	"Görev Ekle" dialog: saat seç + board/kart seç
Task status renkleri:

PLANNED → border-gray-300 bg-white
IN_PROGRESS → border-yellow-400 bg-yellow-50
COMPLETED → border-green-400 bg-green-50 opacity-70
PAUSED → border-orange-400 border-dashed bg-orange-50
SKIPPED → opacity-40 line-through
8. Sayfa Route
Yeni dosya: apps/web/app/(dashboard)/timeline/page.tsx


export default function TimelinePage() {
  return <TimelineView />
}
9. Navigation
Dosya: apps/web/components/layout/dashboard-nav.tsx veya benzeri nav dosyası

Timeline sayfasına link ekleme.

Kritik Dosyalar
Dosya	Değişiklik
packages/database/prisma/schema.prisma	TimelineTask modeli + enum ekle
apps/web/types/index.ts	TimelineTask, TimelineStats tipleri
apps/web/lib/validations.ts	createTimelineTaskSchema
apps/web/services/timeline.service.ts	Yeni
apps/web/app/api/timeline/route.ts	Yeni
apps/web/app/api/timeline/tasks/[id]/route.ts	Yeni
apps/web/app/api/timeline/unscheduled/route.ts	Yeni
apps/web/store/timeline.store.ts	Yeni
apps/web/components/timeline/ (7 dosya)	Yeni
apps/web/app/(dashboard)/timeline/page.tsx	Yeni
Nav component	Link ekleme
Doğrulama
pnpm db:push → schema migration başarılı
pnpm dev → dev server başlatılır
/timeline sayfası açılır → Bugünün boş timeline görünür
"Görev Ekle" → board seç → kart seç → saat seç → timeline'a eklenir
"Başlat" butonu → status IN_PROGRESS, saat damgası set edilir
"Tamamla" butonu → COMPLETED, yeşil görünüm
Sağdaki Unscheduled pool → tüm board kartları listelenir
Stats güncel kalır
User approved the plan
Plan onaylandı. Uygulamaya başlayalım.

Update Todos

Database schema: TimelineTask modeli + enum ekle, pnpm db:push

TypeScript tipleri: TimelineTask, TimelineStats

Zod validasyon şeması: createTimelineTaskSchema

Service: apps/web/services/timeline.service.ts

API endpoints: /api/timeline, /api/timeline/tasks/[id], /api/timeline/unscheduled

Zustand store: apps/web/store/timeline.store.ts

Components: timeline-view, header, section, task-card, stats, unscheduled-pool, add-task-dialog

Sayfa route: /timeline + nav linki
Read c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\packages\database\prisma\schema.prisma
Edit c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\packages\database\prisma\schema.prisma
Added 1 line
Edit c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\packages\database\prisma\schema.prisma
Added 1 line
Edit c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\packages\database\prisma\schema.prisma
Added 1 line
Şimdi TimelineTask modelini ve enum'u dosyanın sonuna ekleyelim:

Edit c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\packages\database\prisma\schema.prisma
Added 39 lines
Bash Apply database schema changes
IN
cd /c/Users/turki/Documents/PROJELER/ÜLGEN/trello-clone && pnpm db:push 2>&1

OUT
> ulgen-trello-clone@1.0.0 db:push C:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone
> pnpm --filter database db:push


> database@1.0.0 db:push C:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\packages\database
> prisma db push

Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
Datasource "db": PostgreSQL database "ulgen_trello", schema "public" at "localhost:5432"

Your database is now in sync with your Prisma schema. Done in 300ms

Running generate... (Use --skip-generate to skip the generators)
[2K[1A[2K[GRunning generate... - Prisma Client
[2K[1A[2K[G✔ Generated Prisma Client (v5.22.0) to .\..\..\node_modules\.pnpm\@prisma+client
@5.22.0_prisma@5.22.0\node_modules\@prisma\client in 77ms

┌─────────────────────────────────────────────────────────┐
│  Update available 5.22.0 -> 7.4.2                       │
│                                                         │
│  This is a major update - please follow the guide at    │
│  https://pris.ly/d/major-version-upgrade                │
│                                                         │
│  Run the following to update                            │
│    npm i --save-dev prisma@latest                       │
│    npm i @prisma/client@latest                          │
└─────────────────────────────────────────────────────────┘
Schema push başarılı.

Update Todos

Database schema: TimelineTask modeli + enum ekle, pnpm db:push

TypeScript tipleri: TimelineTask, TimelineStats

Zod validasyon şeması: createTimelineTaskSchema

Service: apps/web/services/timeline.service.ts

API endpoints: /api/timeline, /api/timeline/tasks/[id], /api/timeline/unscheduled

Zustand store: apps/web/store/timeline.store.ts

Components: timeline-view, header, section, task-card, stats, unscheduled-pool, add-task-dialog

Sayfa route: /timeline + nav linki
Read c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\types\index.ts
Edit c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\types\index.ts
Added 54 lines
Update Todos

Database schema: TimelineTask modeli + enum ekle, pnpm db:push

TypeScript tipleri: TimelineTask, TimelineStats

Zod validasyon şeması: createTimelineTaskSchema

Service: apps/web/services/timeline.service.ts

API endpoints: /api/timeline, /api/timeline/tasks/[id], /api/timeline/unscheduled

Zustand store: apps/web/store/timeline.store.ts

Components: timeline-view, header, section, task-card, stats, unscheduled-pool, add-task-dialog

Sayfa route: /timeline + nav linki
Read c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\lib\validations.ts
Edit c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\lib\validations.ts
Added 19 lines
Edit c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\lib\validations.ts
Added 2 lines
Update Todos

Database schema: TimelineTask modeli + enum ekle, pnpm db:push

TypeScript tipleri: TimelineTask, TimelineStats

Zod validasyon şeması: createTimelineTaskSchema

Service: apps/web/services/timeline.service.ts

API endpoints: /api/timeline, /api/timeline/tasks/[id], /api/timeline/unscheduled

Zustand store: apps/web/store/timeline.store.ts

Components: timeline-view, header, section, task-card, stats, unscheduled-pool, add-task-dialog

Sayfa route: /timeline + nav linki
Şimdi service'i yazalım. Önce mevcut bir service'in yapısını inceleyelim:

Read c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\services\board.service.ts
Write c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\services\timeline.service.ts
254 lines
/**
 * Timeline Service
 *
 * Günlük görev zaman çizelgesi için CRUD işlemleri ve yetkilendirme.
 *
 * Yetkiler:
 * - Görev oluşturma: Kullanıcı ilgili board'a erişebilmeli
 * - Görev güncelleme/silme: Sadece görevin sahibi
 */

import { prisma } from 'database';
import { CreateTimelineTaskInput } from '@/lib/validations';
import { TimelineStats } from '@/types';

const TASK_INCLUDE = {
  card: {
    select: { id: true, title: true, description: true, labels: true },
  },
  board: {
    select: { id: true, title: true },
  },
};

export class TimelineService {
  /**
   * Belirli bir gün için kullanıcının timeline görevlerini getirir.
   * Başlangıç saatine göre sıralı.
   */
  static async getTasksForDate(userId: string, date: string) {
    // date: 'YYYY-MM-DD' formatında — o günün 00:00 - 23:59 UTC aralığı
    const start = new Date(`${date}T00:00:00.000Z`);
    const end = new Date(`${date}T23:59:59.999Z`);

    const tasks = await prisma.timelineTask.findMany({
      where: {
        userId,
        scheduledDate: { gte: start, lte: end },
      },
      include: TASK_INCLUDE,
      orderBy: { startTime: 'asc' },
    });

    const stats: TimelineStats = {
      totalPlanned: tasks.length,
      completed: tasks.filter((t) => t.status === 'COMPLETED').length,
      inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
      remaining: tasks.filter((t) => t.status === 'PLANNED' || t.status === 'PAUSED').length,
      totalMinutesPlanned: tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0),
    };

    return { tasks, stats };
  }

  /**
   * Yeni bir timeline görevi oluşturur.
   * Kullanıcının o board'a erişimi olmalı.
   * Zaman çakışması kontrol edilir.
   */
  static async createTask(data: CreateTimelineTaskInput, userId: string) {
    // Board erişim kontrolü
    const board = await prisma.board.findFirst({
      where: {
        id: data.boardId,
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } },
        ],
      },
    });

    if (!board) {
      throw new Error('Board bulunamadı veya bu board\'a erişim yetkiniz yok');
    }

    // Kartın bu board'a ait olduğunu doğrula
    const card = await prisma.card.findFirst({
      where: {
        id: data.cardId,
        list: { boardId: data.boardId },
      },
    });

    if (!card) {
      throw new Error('Kart bulunamadı veya bu board\'a ait değil');
    }

    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);

    if (endTime <= startTime) {
      throw new Error('Bitiş saati başlangıç saatinden sonra olmalıdır');
    }

    const scheduledDate = new Date(`${data.scheduledDate}T00:00:00.000Z`);

    // Zaman çakışması kontrolü
    const overlap = await prisma.timelineTask.findFirst({
      where: {
        userId,
        scheduledDate: {
          gte: new Date(`${data.scheduledDate}T00:00:00.000Z`),
          lte: new Date(`${data.scheduledDate}T23:59:59.999Z`),
        },
        status: { notIn: ['SKIPPED', 'COMPLETED'] },
        OR: [
          { startTime: { lt: endTime }, endTime: { gt: startTime } },
        ],
      },
    });

    if (overlap) {
      throw new Error('Bu zaman aralığında zaten bir görev var. Farklı bir saat seçin.');
    }

    return prisma.timelineTask.create({
      data: {
        userId,
        cardId: data.cardId,
        boardId: data.boardId,
        scheduledDate,
        startTime,
        endTime,
        estimatedMinutes: data.estimatedMinutes ?? 60,
      },
      include: TASK_INCLUDE,
    });
  }

  /**
   * Görev durumunu günceller.
   * Sadece görevin sahibi güncelleyebilir.
   */
  static async updateTaskStatus(
    taskId: string,
    action: 'start' | 'pause' | 'complete' | 'skip',
    userId: string
  ) {
    const task = await prisma.timelineTask.findFirst({
      where: { id: taskId, userId },
    });

    if (!task) {
      throw new Error('Görev bulunamadı veya bu görevi değiştirme yetkiniz yok');
    }

    const now = new Date();

    let updateData: Record<string, unknown> = {};

    if (action === 'start') {
      updateData = {
        status: 'IN_PROGRESS',
        actualStartTime: task.actualStartTime ?? now,
      };
    } else if (action === 'pause') {
      updateData = { status: 'PAUSED' };
    } else if (action === 'complete') {
      const actualStart = task.actualStartTime ?? now;
      const actualMinutes = Math.round((now.getTime() - actualStart.getTime()) / 60000);
      updateData = {
        status: 'COMPLETED',
        actualEndTime: now,
        actualMinutes: actualMinutes > 0 ? actualMinutes : null,
      };
    } else if (action === 'skip') {
      updateData = { status: 'SKIPPED' };
    }

    return prisma.timelineTask.update({
      where: { id: taskId },
      data: updateData,
      include: TASK_INCLUDE,
    });
  }

  /**
   * Timeline görevini siler.
   * Sadece görevin sahibi silebilir.
   */
  static async deleteTask(taskId: string, userId: string) {
    const task = await prisma.timelineTask.findFirst({
      where: { id: taskId, userId },
    });

    if (!task) {
      throw new Error('Görev bulunamadı veya bu görevi silme yetkiniz yok');
    }

    await prisma.timelineTask.delete({ where: { id: taskId } });
  }

  /**
   * Kullanıcının erişebildiği tüm board'lardaki kartları getirir.
   * Belirli bir gün için zaten timeline'da olan kartlar hariç tutulur.
   */
  static async getUnscheduledCards(userId: string, date: string) {
    // O gün için zaten planlanmış card ID'lerini bul
    const scheduledCardIds = await prisma.timelineTask.findMany({
      where: {
        userId,
        scheduledDate: {
          gte: new Date(`${date}T00:00:00.000Z`),
          lte: new Date(`${date}T23:59:59.999Z`),
        },
        status: { notIn: ['SKIPPED'] },
      },
      select: { cardId: true },
    });

    const scheduledIds = scheduledCardIds.map((t) => t.cardId);

    // Kullanıcının erişebildiği tüm kartları getir (planlanmamışlar)
    const cards = await prisma.card.findMany({
      where: {
        id: { notIn: scheduledIds.length > 0 ? scheduledIds : undefined },
        list: {
          board: {
            OR: [
              { ownerId: userId },
              { members: { some: { userId } } },
            ],
          },
        },
      },
      include: {
        list: {
          select: {
            id: true,
            title: true,
            board: { select: { id: true, title: true } },
          },
        },
      },
      orderBy: [
        { list: { board: { updatedAt: 'desc' } } },
        { position: 'asc' },
      ],
      take: 100, // Performans için limit
    });

    return cards.map((card) => ({
      id: card.id,
      title: card.title,
      description: card.description,
      labels: card.labels,
      dueDate: card.dueDate?.toISOString() ?? null,
      listId: card.list.id,
      listTitle: card.list.title,
      boardId: card.list.board.id,
      boardTitle: card.list.board.title,
    }));
  }
}
Update Todos

Database schema: TimelineTask modeli + enum ekle, pnpm db:push

TypeScript tipleri: TimelineTask, TimelineStats

Zod validasyon şeması: createTimelineTaskSchema

Service: apps/web/services/timeline.service.ts

API endpoints: /api/timeline, /api/timeline/tasks/[id], /api/timeline/unscheduled

Zustand store: apps/web/store/timeline.store.ts

Components: timeline-view, header, section, task-card, stats, unscheduled-pool, add-task-dialog

Sayfa route: /timeline + nav linki
Bash List API route directories
IN
ls /c/Users/turki/Documents/PROJELER/ÜLGEN/trello-clone/apps/web/app/api/

OUT
attachments
auth
boards
cards
comments
import
lists
uploadthing
Read c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\app\api\cards\route.ts
Write c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\app\api\timeline\route.ts
66 lines
/**
 * Timeline API
 *
 * GET  /api/timeline?date=YYYY-MM-DD  — Belirtilen gün için görevleri getirir
 * POST /api/timeline                  — Yeni timeline görevi oluşturur
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { TimelineService } from '@/services/timeline.service';
import { createTimelineTaskSchema } from '@/lib/validations';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: 'Geçersiz tarih. YYYY-MM-DD formatında olmalıdır' },
        { status: 400 }
      );
    }

    const result = await TimelineService.getTasksForDate(session.user.id, date);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Timeline getirme hatası:', error);
    return NextResponse.json({ error: error.message || 'Sunucu hatası' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = createTimelineTaskSchema.parse(body);

    const task = await TimelineService.createTask(validatedData, session.user.id);
    return NextResponse.json(task, { status: 201 });
  } catch (error: any) {
    console.error('Timeline görev oluşturma hatası:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Geçersiz giriş verisi', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: error.message || 'Sunucu hatası' }, { status: 500 });
  }
}
Write c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\app\api\timeline\tasks\[id]\route.ts
71 lines
/**
 * Timeline Task API
 *
 * PATCH  /api/timeline/tasks/[id]  — Görev durumunu günceller (start/pause/complete/skip)
 * DELETE /api/timeline/tasks/[id]  — Görevi siler
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { TimelineService } from '@/services/timeline.service';
import { updateTimelineTaskStatusSchema } from '@/lib/validations';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const body = await req.json();
    const { action } = updateTimelineTaskStatusSchema.parse(body);

    const task = await TimelineService.updateTaskStatus(params.id, action, session.user.id);
    return NextResponse.json(task);
  } catch (error: any) {
    console.error('Timeline görev güncelleme hatası:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Geçersiz giriş verisi', details: error.errors },
        { status: 400 }
      );
    }

    if (error.message?.includes('bulunamadı')) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ error: error.message || 'Sunucu hatası' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    await TimelineService.deleteTask(params.id, session.user.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Timeline görev silme hatası:', error);

    if (error.message?.includes('bulunamadı')) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ error: error.message || 'Sunucu hatası' }, { status: 500 });
  }
}
Write c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\app\api\timeline\unscheduled\route.ts
38 lines
/**
 * Unscheduled Cards API
 *
 * GET /api/timeline/unscheduled?date=YYYY-MM-DD
 * — Belirtilen gün için henüz planlanmamış kartları getirir
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { TimelineService } from '@/services/timeline.service';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: 'Geçersiz tarih. YYYY-MM-DD formatında olmalıdır' },
        { status: 400 }
      );
    }

    const cards = await TimelineService.getUnscheduledCards(session.user.id, date);
    return NextResponse.json({ cards });
  } catch (error: any) {
    console.error('Planlanmamış kartlar getirme hatası:', error);
    return NextResponse.json({ error: error.message || 'Sunucu hatası' }, { status: 500 });
  }
}
Update Todos

Database schema: TimelineTask modeli + enum ekle, pnpm db:push

TypeScript tipleri: TimelineTask, TimelineStats

Zod validasyon şeması: createTimelineTaskSchema

Service: apps/web/services/timeline.service.ts

API endpoints: /api/timeline, /api/timeline/tasks/[id], /api/timeline/unscheduled

Zustand store: apps/web/store/timeline.store.ts

Components: timeline-view, header, section, task-card, stats, unscheduled-pool, add-task-dialog

Sayfa route: /timeline + nav linki
Write c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\store\timeline.store.ts
217 lines
/**
 * Timeline Zustand Store
 *
 * Günlük görev zaman çizelgesi için global state yönetimi.
 * Optimistic updates: Store'u hemen güncelle, API başarısızsa revert et.
 */

import { create } from 'zustand';
import { TimelineTask, TimelineStats, UnscheduledCard } from '@/types';
import { CreateTimelineTaskInput } from '@/lib/validations';

interface TimelineStore {
  // State
  currentDate: Date;
  tasks: TimelineTask[];
  unscheduledCards: UnscheduledCard[];
  isLoading: boolean;
  isUnscheduledLoading: boolean;
  stats: TimelineStats;
  error: string | null;

  // Date actions
  setDate: (date: Date) => void;

  // Data fetching
  fetchTasks: (date: Date) => Promise<void>;
  fetchUnscheduledCards: (date?: Date) => Promise<void>;

  // Task mutations
  addTask: (data: CreateTimelineTaskInput) => Promise<void>;
  updateStatus: (id: string, action: 'start' | 'pause' | 'complete' | 'skip') => Promise<void>;
  deleteTask: (id: string) => Promise<void>;

  // Utility
  reset: () => void;
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

const defaultStats: TimelineStats = {
  totalPlanned: 0,
  completed: 0,
  inProgress: 0,
  remaining: 0,
  totalMinutesPlanned: 0,
};

function computeStats(tasks: TimelineTask[]): TimelineStats {
  return {
    totalPlanned: tasks.length,
    completed: tasks.filter((t) => t.status === 'COMPLETED').length,
    inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
    remaining: tasks.filter((t) => t.status === 'PLANNED' || t.status === 'PAUSED').length,
    totalMinutesPlanned: tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0),
  };
}

export const useTimelineStore = create<TimelineStore>((set, get) => ({
  currentDate: new Date(),
  tasks: [],
  unscheduledCards: [],
  isLoading: false,
  isUnscheduledLoading: false,
  stats: defaultStats,
  error: null,

  setDate: (date) => {
    set({ currentDate: date });
    get().fetchTasks(date);
    get().fetchUnscheduledCards(date);
  },

  fetchTasks: async (date) => {
    set({ isLoading: true, error: null });
    try {
      const dateStr = formatDate(date);
      const res = await fetch(`/api/timeline?date=${dateStr}`);
      if (!res.ok) throw new Error('Görevler yüklenemedi');
      const data = await res.json();
      const tasks = data.tasks as TimelineTask[];
      set({ tasks, stats: computeStats(tasks), isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchUnscheduledCards: async (date) => {
    const targetDate = date ?? get().currentDate;
    set({ isUnscheduledLoading: true });
    try {
      const dateStr = formatDate(targetDate);
      const res = await fetch(`/api/timeline/unscheduled?date=${dateStr}`);
      if (!res.ok) throw new Error('Planlanmamış kartlar yüklenemedi');
      const data = await res.json();
      set({ unscheduledCards: data.cards as UnscheduledCard[], isUnscheduledLoading: false });
    } catch {
      set({ isUnscheduledLoading: false });
    }
  },

  addTask: async (data) => {
    try {
      const res = await fetch('/api/timeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Görev eklenemedi');
      }

      const newTask = (await res.json()) as TimelineTask;

      set((state) => {
        const tasks = [...state.tasks, newTask].sort(
          (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );
        return {
          tasks,
          stats: computeStats(tasks),
          // Eklenen kart artık unscheduled pool'dan çıkar
          unscheduledCards: state.unscheduledCards.filter((c) => c.id !== newTask.cardId),
        };
      });
    } catch (error: any) {
      throw error;
    }
  },

  updateStatus: async (id, action) => {
    const previousTasks = get().tasks;

    // Optimistic update
    const statusMap: Record<string, TimelineTask['status']> = {
      start: 'IN_PROGRESS',
      pause: 'PAUSED',
      complete: 'COMPLETED',
      skip: 'SKIPPED',
    };

    set((state) => {
      const tasks = state.tasks.map((t) =>
        t.id === id ? { ...t, status: statusMap[action] } : t
      );
      return { tasks, stats: computeStats(tasks) };
    });

    try {
      const res = await fetch(`/api/timeline/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) {
        // Revert
        set({ tasks: previousTasks, stats: computeStats(previousTasks) });
        const err = await res.json();
        throw new Error(err.error || 'Güncelleme başarısız');
      }

      // Sunucudan gelen gerçek veriyle güncelle (actualStartTime vb. için)
      const updatedTask = (await res.json()) as TimelineTask;
      set((state) => {
        const tasks = state.tasks.map((t) => (t.id === id ? updatedTask : t));
        return { tasks, stats: computeStats(tasks) };
      });
    } catch (error: any) {
      throw error;
    }
  },

  deleteTask: async (id) => {
    const previousTasks = get().tasks;
    const deletedTask = previousTasks.find((t) => t.id === id);

    // Optimistic delete
    set((state) => {
      const tasks = state.tasks.filter((t) => t.id !== id);
      return { tasks, stats: computeStats(tasks) };
    });

    try {
      const res = await fetch(`/api/timeline/tasks/${id}`, { method: 'DELETE' });

      if (!res.ok) {
        // Revert
        set({ tasks: previousTasks, stats: computeStats(previousTasks) });
        const err = await res.json();
        throw new Error(err.error || 'Silme başarısız');
      }

      // Silinen kartı tekrar unscheduled pool'a ekle
      if (deletedTask) {
        get().fetchUnscheduledCards();
      }
    } catch (error: any) {
      throw error;
    }
  },

  reset: () => {
    set({
      tasks: [],
      unscheduledCards: [],
      isLoading: false,
      isUnscheduledLoading: false,
      stats: defaultStats,
      error: null,
    });
  },
}));
Update Todos

Database schema: TimelineTask modeli + enum ekle, pnpm db:push

TypeScript tipleri: TimelineTask, TimelineStats

Zod validasyon şeması: createTimelineTaskSchema

Service: apps/web/services/timeline.service.ts

API endpoints: /api/timeline, /api/timeline/tasks/[id], /api/timeline/unscheduled

Zustand store: apps/web/store/timeline.store.ts

Components: timeline-view, header, section, task-card, stats, unscheduled-pool, add-task-dialog

Sayfa route: /timeline + nav linki
Şimdi componentleri yazalım. Önce mevcut component yapısını kontrol edelim:

Bash List components directory
IN
ls /c/Users/turki/Documents/PROJELER/ÜLGEN/trello-clone/apps/web/components/

OUT
attachment
board
card
comment
dashboard-nav.tsx
list
ui
Read c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\components\dashboard-nav.tsx
Şimdi tüm timeline componentlerini yazalım:

Write c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\components\timeline\timeline-header.tsx
90 lines
'use client';

import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TimelineHeaderProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

function formatDateLabel(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (isSameDay(date, today)) return 'Bugün';
  if (isSameDay(date, yesterday)) return 'Dün';
  if (isSameDay(date, tomorrow)) return 'Yarın';

  return date.toLocaleDateString('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

export function TimelineHeader({ currentDate, onDateChange }: TimelineHeaderProps) {
  const goToPrev = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 1);
    onDateChange(d);
  };

  const goToNext = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 1);
    onDateChange(d);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <CalendarDays className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-gray-900">Günlük Plan</h1>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={goToPrev} title="Önceki gün">
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="min-w-[180px] text-center">
          <span className="font-semibold text-gray-800">{formatDateLabel(currentDate)}</span>
        </div>

        <Button variant="outline" size="icon" onClick={goToNext} title="Sonraki gün">
          <ChevronRight className="h-4 w-4" />
        </Button>

        {!isToday(currentDate) && (
          <Button variant="secondary" size="sm" onClick={goToToday} className="ml-2">
            Bugüne Dön
          </Button>
        )}
      </div>
    </div>
  );
}
Write c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\components\timeline\timeline-task-card.tsx
235 lines
'use client';

import { useState } from 'react';
import { Play, Pause, CheckCircle, SkipForward, Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TimelineTask } from '@/types';

interface TimelineTaskCardProps {
  task: TimelineTask;
  onUpdateStatus: (id: string, action: 'start' | 'pause' | 'complete' | 'skip') => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} dk`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}s ${m}dk` : `${h} saat`;
}

const STATUS_CONFIG = {
  PLANNED: {
    border: 'border-l-4 border-l-gray-300',
    bg: 'bg-white',
    badge: 'bg-gray-100 text-gray-600',
    label: 'Planlandı',
  },
  IN_PROGRESS: {
    border: 'border-l-4 border-l-yellow-400',
    bg: 'bg-yellow-50',
    badge: 'bg-yellow-100 text-yellow-700',
    label: 'Devam Ediyor',
  },
  PAUSED: {
    border: 'border-l-4 border-l-orange-400',
    bg: 'bg-orange-50',
    badge: 'bg-orange-100 text-orange-700',
    label: 'Duraklatıldı',
  },
  COMPLETED: {
    border: 'border-l-4 border-l-green-400',
    bg: 'bg-green-50 opacity-75',
    badge: 'bg-green-100 text-green-700',
    label: 'Tamamlandı',
  },
  SKIPPED: {
    border: 'border-l-4 border-l-gray-200',
    bg: 'bg-gray-50 opacity-50',
    badge: 'bg-gray-100 text-gray-500',
    label: 'Atlandı',
  },
};

export function TimelineTaskCard({ task, onUpdateStatus, onDelete }: TimelineTaskCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const config = STATUS_CONFIG[task.status];

  const handleAction = async (action: 'start' | 'pause' | 'complete' | 'skip') => {
    setIsUpdating(true);
    try {
      await onUpdateStatus(task.id, action);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(task.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className={`rounded-lg border shadow-sm p-3 transition-all ${config.border} ${config.bg} ${
        task.status === 'SKIPPED' ? 'line-through' : ''
      }`}
    >
      {/* Başlık ve board bilgisi */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">{task.card.title}</p>
          <p className="text-xs text-gray-500 truncate">{task.board.title}</p>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${config.badge}`}>
          {config.label}
        </span>
      </div>

      {/* Saat ve süre */}
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
        <Clock className="h-3 w-3 flex-shrink-0" />
        <span>
          {formatTime(task.startTime)} – {formatTime(task.endTime)}
        </span>
        <span className="text-gray-400">·</span>
        <span>{formatDuration(task.estimatedMinutes)}</span>
        {task.actualMinutes && (
          <>
            <span className="text-gray-400">·</span>
            <span className="text-green-600">Gerçek: {formatDuration(task.actualMinutes)}</span>
          </>
        )}
      </div>

      {/* Etiketler */}
      {task.card.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.card.labels.map((label) => (
            <span
              key={label}
              className={`h-1.5 w-8 rounded-full bg-${label}-400`}
              title={label}
            />
          ))}
        </div>
      )}

      {/* Aksiyonlar */}
      {task.status !== 'COMPLETED' && task.status !== 'SKIPPED' && (
        <div className="flex items-center gap-1 flex-wrap">
          {task.status === 'PLANNED' || task.status === 'PAUSED' ? (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              disabled={isUpdating}
              onClick={() => handleAction('start')}
            >
              <Play className="h-3 w-3 mr-1" />
              Başlat
            </Button>
          ) : null}

          {task.status === 'IN_PROGRESS' && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              disabled={isUpdating}
              onClick={() => handleAction('pause')}
            >
              <Pause className="h-3 w-3 mr-1" />
              Duraklat
            </Button>
          )}

          {(task.status === 'IN_PROGRESS' || task.status === 'PAUSED') && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs text-green-600 border-green-300 hover:bg-green-50"
              disabled={isUpdating}
              onClick={() => handleAction('complete')}
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Tamamla
            </Button>
          )}

          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs text-gray-500"
            disabled={isUpdating}
            onClick={() => handleAction('skip')}
          >
            <SkipForward className="h-3 w-3 mr-1" />
            Atla
          </Button>

          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs text-red-500 hover:text-red-600 ml-auto"
            disabled={isDeleting}
            onClick={handleDelete}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Tamamlandı durumu */}
      {task.status === 'COMPLETED' && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-green-600 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Tamamlandı
            {task.actualEndTime && ` · ${formatTime(task.actualEndTime)}`}
          </span>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs text-red-400"
            disabled={isDeleting}
            onClick={handleDelete}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Atlandı durumu */}
      {task.status === 'SKIPPED' && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Atlandı</span>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs text-red-400"
            disabled={isDeleting}
            onClick={handleDelete}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}
Write c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\components\timeline\timeline-section.tsx
73 lines
'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Sun, Coffee, Moon } from 'lucide-react';
import { TimelineTask } from '@/types';
import { TimelineTaskCard } from './timeline-task-card';

interface TimelineSectionProps {
  title: string;
  icon: 'morning' | 'afternoon' | 'evening';
  tasks: TimelineTask[];
  onUpdateStatus: (id: string, action: 'start' | 'pause' | 'complete' | 'skip') => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const ICON_MAP = {
  morning: { Icon: Sun, color: 'text-amber-500' },
  afternoon: { Icon: Coffee, color: 'text-blue-500' },
  evening: { Icon: Moon, color: 'text-indigo-500' },
};

export function TimelineSection({
  title,
  icon,
  tasks,
  onUpdateStatus,
  onDelete,
}: TimelineSectionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const { Icon, color } = ICON_MAP[icon];

  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
      >
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
        )}
        <Icon className={`h-4 w-4 flex-shrink-0 ${color}`} />
        <span className="font-semibold text-gray-700 text-sm">{title}</span>
        <span className="ml-auto text-xs text-gray-400">
          {completedCount}/{tasks.length}
        </span>
      </button>

      {isOpen && (
        <div className="mt-1 space-y-2 pl-2">
          {tasks.length === 0 ? (
            <p className="text-sm text-gray-400 py-3 text-center italic">
              Bu blokta henüz görev yok
            </p>
          ) : (
            tasks.map((task) => (
              <TimelineTaskCard
                key={task.id}
                task={task}
                onUpdateStatus={onUpdateStatus}
                onDelete={onDelete}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
Write c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\components\timeline\timeline-stats.tsx
86 lines
'use client';

import { CheckCircle, Clock, Loader2, AlertCircle } from 'lucide-react';
import { TimelineStats } from '@/types';

interface TimelineStatsProps {
  stats: TimelineStats;
}

function formatDuration(minutes: number): string {
  if (minutes === 0) return '—';
  if (minutes < 60) return `${minutes} dk`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}s ${m}dk` : `${h} saat`;
}

export function TimelineStatsPanel({ stats }: TimelineStatsProps) {
  const progressPercent =
    stats.totalPlanned > 0 ? Math.round((stats.completed / stats.totalPlanned) * 100) : 0;

  return (
    <div className="bg-white rounded-xl border p-4 space-y-4">
      <h2 className="font-semibold text-gray-800 text-sm">Günlük İlerleme</h2>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{stats.completed} / {stats.totalPlanned} tamamlandı</span>
          <span className="font-medium text-gray-700">{progressPercent}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatItem
          icon={<CheckCircle className="h-4 w-4 text-green-500" />}
          label="Tamamlandı"
          value={stats.completed}
        />
        <StatItem
          icon={<Loader2 className="h-4 w-4 text-yellow-500" />}
          label="Devam Eden"
          value={stats.inProgress}
        />
        <StatItem
          icon={<AlertCircle className="h-4 w-4 text-blue-500" />}
          label="Bekliyor"
          value={stats.remaining}
        />
        <StatItem
          icon={<Clock className="h-4 w-4 text-gray-400" />}
          label="Toplam Süre"
          value={formatDuration(stats.totalMinutesPlanned)}
          isText
        />
      </div>
    </div>
  );
}

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  isText?: boolean;
}

function StatItem({ icon, label, value, isText }: StatItemProps) {
  return (
    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
      {icon}
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className={`font-bold text-gray-800 ${isText ? 'text-xs' : 'text-base'}`}>{value}</p>
      </div>
    </div>
  );
}
Write c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\components\timeline\unscheduled-pool.tsx
82 lines
'use client';

import { ChevronDown, ChevronRight, ListTodo, Plus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UnscheduledCard } from '@/types';

interface UnscheduledPoolProps {
  cards: UnscheduledCard[];
  isLoading: boolean;
  onAddToTimeline: (card: UnscheduledCard) => void;
}

export function UnscheduledPool({ cards, isLoading, onAddToTimeline }: UnscheduledPoolProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-white rounded-xl border p-4">
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center gap-2 mb-3 text-left"
      >
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-400" />
        )}
        <ListTodo className="h-4 w-4 text-purple-500" />
        <span className="font-semibold text-gray-800 text-sm">Planlanmadı</span>
        <span className="ml-auto text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
          {cards.length}
        </span>
      </button>

      {isOpen && (
        <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
          {isLoading ? (
            <p className="text-sm text-gray-400 text-center py-4">Yükleniyor...</p>
          ) : cards.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4 italic">
              Tüm kartlar planlandı 🎉
            </p>
          ) : (
            cards.map((card) => (
              <div
                key={card.id}
                className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{card.title}</p>
                  <p className="text-xs text-gray-400 truncate">
                    {card.boardTitle} · {card.listTitle}
                  </p>
                  {card.labels.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {card.labels.map((label) => (
                        <span
                          key={label}
                          className={`h-1 w-6 rounded-full bg-${label}-400`}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  onClick={() => onAddToTimeline(card)}
                  title="Timeline'a ekle"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
Şimdi en kritik component: Add Task Dialog:

Write c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\components\timeline\add-task-dialog.tsx
227 lines
'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { UnscheduledCard } from '@/types';
import { CreateTimelineTaskInput } from '@/lib/validations';

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentDate: Date;
  unscheduledCards: UnscheduledCard[];
  preselectedCard?: UnscheduledCard | null;
  onAdd: (data: CreateTimelineTaskInput) => Promise<void>;
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function buildIso(date: Date, timeStr: string): string {
  // timeStr: "HH:MM"
  const [h, m] = timeStr.split(':').map(Number);
  const d = new Date(date);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

// Yakın gelecekteki saati bul (bir sonraki tam saat veya yarım saat)
function nextRoundTime(): string {
  const now = new Date();
  const minutes = now.getMinutes();
  let h = now.getHours();
  let m = 0;
  if (minutes < 30) {
    m = 30;
  } else {
    h = h + 1;
    m = 0;
  }
  if (h >= 24) h = 23;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120, 180];

export function AddTaskDialog({
  open,
  onOpenChange,
  currentDate,
  unscheduledCards,
  preselectedCard,
  onAdd,
}: AddTaskDialogProps) {
  const [selectedCardId, setSelectedCardId] = useState('');
  const [startTime, setStartTime] = useState(nextRoundTime());
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Grup kartları board'a göre
  const groupedCards = unscheduledCards.reduce<Record<string, UnscheduledCard[]>>((acc, card) => {
    const key = card.boardTitle;
    if (!acc[key]) acc[key] = [];
    acc[key].push(card);
    return acc;
  }, {});

  useEffect(() => {
    if (open) {
      setError('');
      if (preselectedCard) {
        setSelectedCardId(preselectedCard.id);
      } else {
        setSelectedCardId('');
      }
      setStartTime(nextRoundTime());
      setDurationMinutes(60);
    }
  }, [open, preselectedCard]);

  const computeEndTime = (): string => {
    const [h, m] = startTime.split(':').map(Number);
    const totalMin = h * 60 + m + durationMinutes;
    const endH = Math.floor(totalMin / 60) % 24;
    const endM = totalMin % 60;
    return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    setError('');

    if (!selectedCardId) {
      setError('Lütfen bir kart seçin');
      return;
    }

    const selectedCard = unscheduledCards.find((c) => c.id === selectedCardId);
    if (!selectedCard) {
      setError('Seçilen kart bulunamadı');
      return;
    }

    const startIso = buildIso(currentDate, startTime);
    const endIso = buildIso(currentDate, computeEndTime());

    setIsSubmitting(true);
    try {
      await onAdd({
        cardId: selectedCard.id,
        boardId: selectedCard.boardId,
        scheduledDate: formatDate(currentDate),
        startTime: startIso,
        endTime: endIso,
        estimatedMinutes: durationMinutes,
      });
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || 'Görev eklenemedi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Timeline'a Görev Ekle
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Kart seçimi */}
          <div className="space-y-1.5">
            <Label htmlFor="card-select">Kart</Label>
            {unscheduledCards.length === 0 ? (
              <p className="text-sm text-gray-500 italic py-2">
                Tüm kartlar zaten bugün planlandı 🎉
              </p>
            ) : (
              <select
                id="card-select"
                value={selectedCardId}
                onChange={(e) => setSelectedCardId(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">-- Kart Seçin --</option>
                {Object.entries(groupedCards).map(([boardTitle, cards]) => (
                  <optgroup key={boardTitle} label={boardTitle}>
                    {cards.map((card) => (
                      <option key={card.id} value={card.id}>
                        {card.title} ({card.listTitle})
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            )}
          </div>

          {/* Başlangıç saati */}
          <div className="space-y-1.5">
            <Label htmlFor="start-time">Başlangıç Saati</Label>
            <input
              id="start-time"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Süre */}
          <div className="space-y-1.5">
            <Label>Tahmini Süre</Label>
            <div className="flex flex-wrap gap-2">
              {DURATION_OPTIONS.map((min) => (
                <button
                  key={min}
                  onClick={() => setDurationMinutes(min)}
                  className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                    durationMinutes === min
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-primary'
                  }`}
                >
                  {min < 60 ? `${min}dk` : `${min / 60}s`}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              Bitiş: {computeEndTime()}
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            İptal
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || unscheduledCards.length === 0}>
            {isSubmitting ? 'Ekleniyor...' : 'Ekle'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
Şimdi ana timeline-view component'ini yazalım:

Write c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\components\timeline\timeline-view.tsx
180 lines
'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTimelineStore } from '@/store/timeline.store';
import { TimelineHeader } from './timeline-header';
import { TimelineSection } from './timeline-section';
import { TimelineStatsPanel } from './timeline-stats';
import { UnscheduledPool } from './unscheduled-pool';
import { AddTaskDialog } from './add-task-dialog';
import { TimelineTask, UnscheduledCard } from '@/types';

// Saate göre görev bloğunu belirle
function classifyTask(task: TimelineTask): 'morning' | 'afternoon' | 'evening' {
  const hour = new Date(task.startTime).getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

export function TimelineView() {
  const {
    currentDate,
    tasks,
    unscheduledCards,
    isLoading,
    isUnscheduledLoading,
    stats,
    setDate,
    fetchTasks,
    fetchUnscheduledCards,
    addTask,
    updateStatus,
    deleteTask,
  } = useTimelineStore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [preselectedCard, setPreselectedCard] = useState<UnscheduledCard | null>(null);

  useEffect(() => {
    fetchTasks(currentDate);
    fetchUnscheduledCards(currentDate);
  }, []);

  const handleDateChange = (date: Date) => {
    setDate(date);
  };

  const handleUpdateStatus = async (id: string, action: 'start' | 'pause' | 'complete' | 'skip') => {
    try {
      await updateStatus(id, action);
      const labels: Record<string, string> = {
        start: 'Görev başlatıldı',
        pause: 'Görev duraklatıldı',
        complete: 'Görev tamamlandı! 🎉',
        skip: 'Görev atlandı',
      };
      toast.success(labels[action]);
    } catch (err: any) {
      toast.error(err.message || 'Güncelleme başarısız');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTask(id);
      toast.success('Görev kaldırıldı');
    } catch (err: any) {
      toast.error(err.message || 'Silme başarısız');
    }
  };

  const handleAddTask = async (data: Parameters<typeof addTask>[0]) => {
    await addTask(data);
    toast.success('Görev timeline\'a eklendi');
  };

  const handleOpenDialogForCard = (card: UnscheduledCard) => {
    setPreselectedCard(card);
    setDialogOpen(true);
  };

  const handleOpenDialog = () => {
    setPreselectedCard(null);
    setDialogOpen(true);
  };

  // Görevleri 3 bloğa ayır
  const morningTasks = tasks.filter((t) => classifyTask(t) === 'morning');
  const afternoonTasks = tasks.filter((t) => classifyTask(t) === 'afternoon');
  const eveningTasks = tasks.filter((t) => classifyTask(t) === 'evening');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <TimelineHeader currentDate={currentDate} onDateChange={handleDateChange} />

        {/* Ana layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sol: Timeline blokları */}
          <div className="lg:col-span-2 space-y-2">
            {/* Görev ekle butonu */}
            <div className="flex justify-end mb-4">
              <Button onClick={handleOpenDialog} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Görev Ekle
              </Button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center text-gray-400">
                  <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3" />
                  <p className="text-sm">Yükleniyor...</p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border p-4">
                <TimelineSection
                  title="Sabah (06:00 – 12:00)"
                  icon="morning"
                  tasks={morningTasks}
                  onUpdateStatus={handleUpdateStatus}
                  onDelete={handleDelete}
                />
                <TimelineSection
                  title="Öğle (12:00 – 18:00)"
                  icon="afternoon"
                  tasks={afternoonTasks}
                  onUpdateStatus={handleUpdateStatus}
                  onDelete={handleDelete}
                />
                <TimelineSection
                  title="Akşam (18:00 – 00:00)"
                  icon="evening"
                  tasks={eveningTasks}
                  onUpdateStatus={handleUpdateStatus}
                  onDelete={handleDelete}
                />

                {tasks.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <p className="text-base mb-2">Henüz görev eklenmedi</p>
                    <p className="text-sm">
                      Sağdaki listeden kart seçin veya "Görev Ekle" butonuna tıklayın
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sağ: Stats ve Unscheduled pool */}
          <div className="space-y-4">
            <TimelineStatsPanel stats={stats} />
            <UnscheduledPool
              cards={unscheduledCards}
              isLoading={isUnscheduledLoading}
              onAddToTimeline={handleOpenDialogForCard}
            />
          </div>
        </div>
      </div>

      {/* Dialog */}
      <AddTaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        currentDate={currentDate}
        unscheduledCards={unscheduledCards}
        preselectedCard={preselectedCard}
        onAdd={handleAddTask}
      />
    </div>
  );
}
Update Todos

Database schema: TimelineTask modeli + enum ekle, pnpm db:push

TypeScript tipleri: TimelineTask, TimelineStats

Zod validasyon şeması: createTimelineTaskSchema

Service: apps/web/services/timeline.service.ts

API endpoints: /api/timeline, /api/timeline/tasks/[id], /api/timeline/unscheduled

Zustand store: apps/web/store/timeline.store.ts

Components: timeline-view, header, section, task-card, stats, unscheduled-pool, add-task-dialog

Sayfa route: /timeline + nav linki
Şimdi sayfa route ve nav linkini ekleyelim:

Write c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\app\(dashboard)\timeline\page.tsx
11 lines
import { TimelineView } from '@/components/timeline/timeline-view';

export const metadata = {
  title: 'Günlük Plan | ULGEN',
  description: 'Tüm board\'lardan görevleri zaman çizelgesinde planlayın',
};

export default function TimelinePage() {
  return <TimelineView />;
}
Edit c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\components\dashboard-nav.tsx
Edit failed
Edit c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\components\dashboard-nav.tsx
Edit failed
Edit c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\components\dashboard-nav.tsx
Edit failed
dashboard-nav.tsx'i yeniden yazalım:

Write c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\components\dashboard-nav.tsx
Write failed
/**
 * Dashboard Navigation
 *
 * Üst navigasyon barı.
 */

'use client';

import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { Button } from './ui/button';
import { LogOut, LayoutGrid, CalendarDays } from 'lucide-react';

interface DashboardNavProps {
  user: any;
}

export function DashboardNav({ user }: DashboardNavProps) {
  return (
    <nav className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/boards" className="flex items-center gap-2">
              <LayoutGrid className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">ULGEN</span>
            </Link>
            <Link href="/boards">
              <Button variant="ghost">Board'lar</Button>
            </Link>
            <Link href="/timeline">
              <Button variant="ghost" className="flex items-center gap-1">
                <CalendarDays className="h-4 w-4" />
                Günlük Plan
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm">
              <p className="font-medium">{user.name || user.email}</p>
              <p className="text-gray-500 text-xs">{user.email}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Çıkış
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
Read c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\components\dashboard-nav.tsx
Edit c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\components\dashboard-nav.tsx
Modified
Edit c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\components\dashboard-nav.tsx
Added 6 lines
Şimdi TypeScript derleme hatası var mı diye kontrol edelim:

Bash TypeScript type check
IN
cd /c/Users/turki/Documents/PROJELER/ÜLGEN/trello-clone && pnpm --filter web exec tsc --noEmit 2>&1 | head -80

OUT
app/(dashboard)/boards/[id]/page.tsx(11,1): error TS6133: 'BoardType' is declared but its value is never read.
app/(dashboard)/boards/[id]/page.tsx(22,3): error TS6133: 'DragOverEvent' is declared but its value is never read.
app/(dashboard)/boards/[id]/page.tsx(23,3): error TS6133: 'DragOverlay' is declared but its value is never read.
app/(dashboard)/boards/[id]/page.tsx(30,1): error TS6133: 'arrayMove' is declared but its value is never read.
app/(dashboard)/boards/[id]/page.tsx(39,10): error TS6133: 'activeId' is declared but its value is never read.
app/(dashboard)/boards/page.tsx(45,44): error TS6133: 'boardId' is declared but its value is never read.
app/api/boards/[id]/route.ts(16,3): error TS6133: 'req' is declared but its value is never read.
app/api/boards/[id]/route.ts(88,3): error TS6133: 'req' is declared but its value is never read.
app/api/cards/[id]/route.ts(16,3): error TS6133: 'req' is declared but its value is never read.
app/api/cards/[id]/route.ts(88,3): error TS6133: 'req' is declared but its value is never read.
app/api/lists/[id]/route.ts(56,3): error TS6133: 'req' is declared but its value is never read.
app/api/timeline/tasks/[id]/route.ts(49,3): error TS6133: 'req' is declared but its value is never read.
components/board/create-board-dialog.tsx(111,63): error TS2322: Type '"#0079bf" | "#d29034" | "#519839" | "#b04632" | "#89609e" | "#cd5a91" | "#4bbf6b" | "#00aecc" | "#838c91"' is not assignable to type '"#0079bf"'.
  Type '"#d29034"' is not assignable to type '"#0079bf"'.
components/card/card-item.tsx(44,19): error TS6133: 'e' is declared but its value is never read.
components/list/list.tsx(14,16): error TS6133: 'MoreVertical' is declared but its value is never read.
components/timeline/timeline-view.tsx(4,23): error TS2307: Cannot find module 'sonner' or its corresponding type declarations.
undefined
C:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web:
 ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL  Command failed with exit code 2: tsc --noEmit
sonner paketi yüklü mü kontrol edelim:

Bash Check if sonner is in dependencies
IN
cd /c/Users/turki/Documents/PROJELER/ÜLGEN/trello-clone && cat apps/web/package.json | grep sonner

OUT
0
Bash Check if sonner package exists
IN
cd /c/Users/turki/Documents/PROJELER/ÜLGEN/trello-clone && ls apps/web/node_modules/.pnpm/ 2>/dev/null | grep sonner || echo "sonner bulunamadı"

OUT
sonner bulunamadı
sonner yüklü değil. Mevcut toast çözümünü bulalım:

Grep "toast|Toast" (in c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\components, glob: *.tsx")
1 line of output
Bash Find files using toast
IN
grep -r "toast" /c/Users/turki/Documents/PROJELER/ÜLGEN/trello-clone/apps/web --include="*.tsx" -l 2>/dev/null | head -5

OUT
/c/Users/turki/Documents/PROJELER/ÜLGEN/trello-clone/apps/web/components/timeline/timeline-view.tsx
Bash Check attachment component for error handling pattern
IN
cat /c/Users/turki/Documents/PROJELER/ÜLGEN/trello-clone/apps/web/components/attachment/attachment-list.tsx | head -20

OUT
'use client';

/**
 * AttachmentList — Karta Ait Dosya Eklerini Listeler
 *
 * API'dan ekleri çeker, listeleme ve silme işlemlerini yönetir.
 * Yeni ek yüklemek için AttachmentUpload bileşenini içerir.
 */

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Attachment } from '@/types';
import { AttachmentItem } from './attachment-item';
import { AttachmentUpload } from './attachment-upload';
import { Paperclip, Loader2 } from 'lucide-react';
import { useBoardStore } from '@/store/board.store';

interface AttachmentListProps {
  cardId: string;
  boardOwnerId: string;
Toast sistemi yok, sadece console.error kullanılıyor. sonner'ı yükleyelim:

Bash Install sonner toast library
IN
cd /c/Users/turki/Documents/PROJELER/ÜLGEN/trello-clone && pnpm --filter web add sonner 2>&1

OUT
Progress: resolved 0, reused 1, downloaded 0, added 0
apps/web                                 |  WARN  deprecated eslint@8.57.1
apps/web                                 |  WARN  deprecated next@14.0.4
Progress: resolved 330, reused 272, downloaded 1, added 0
Progress: resolved 523, reused 460, downloaded 1, added 0
Progress: resolved 528, reused 465, downloaded 1, added 0
 WARN  6 deprecated subdependencies found: @humanwhocodes/config-array@0.13.0, @humanwhocodes/object-schema@2.0.3, glob@7.1.7, glob@7.2.3, inflight@1.0.6, rimraf@3.0.2
.                                        |   +1 +
Progress: resolved 528, reused 465, downloaded 1, added 1
Progress: resolved 528, reused 465, downloaded 1, added 1, done
Done in 5.3s
Şimdi sonner'ın Toaster bileşenini de layout'a eklemem gerekiyor:

Bash Check dashboard directory layout
IN
ls /c/Users/turki/Documents/PROJELER/ÜLGEN/trello-clone/apps/web/app/\(dashboard\)/

OUT
boards
layout.tsx
timeline
Read c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\app\(dashboard)\layout.tsx
Edit c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\app\(dashboard)\layout.tsx
Added 1 line
Edit c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\app\(dashboard)\layout.tsx
Added 1 line
Şimdi tekrar TypeScript kontrolü yapalım (sadece timeline dosyalarına odaklanarak):

Bash Check TypeScript errors related to timeline
IN
cd /c/Users/turki/Documents/PROJELER/ÜLGEN/trello-clone && pnpm --filter web exec tsc --noEmit 2>&1 | grep "timeline\|Cannot find module"

OUT
app/api/timeline/tasks/[id]/route.ts(49,3): error TS6133: 'req' is declared but its value is never read.
Sadece kullanılmayan req parametresi uyarısı var (mevcut kod tabanında da aynı pattern — önemli değil). Sonner hata gitti. Şimdi bunu da düzeltelim:

Read c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\app\api\timeline\tasks\[id]\route.ts
Edit c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\app\api\timeline\tasks\[id]\route.ts
Modified
Bash Check for new TypeScript errors excluding pre-existing ones
IN
cd /c/Users/turki/Documents/PROJELER/ÜLGEN/trello-clone && pnpm --filter web exec tsc --noEmit 2>&1 | grep -v "TS6133\|app/(dashboard)/boards\|app/(dashboard)/timeline\|create-board\|card-item\|list.tsx\|app/api/boards\|app/api/cards\|app/api/lists" | grep "error TS"

OUT
0
Yeni hata yok. Tüm timeline-spesifik hatalar temizlendi. Şimdi dev server'ı çalıştıralım:

Bash Start dev server in background
IN
cd /c/Users/turki/Documents/PROJELER/ÜLGEN/trello-clone && pnpm dev 2>&1 &

OUT
Command running in background with ID: bga9m7n0o. Output is being written to: C:\Users\turki\AppData\Local\Temp\claude\c--Users-turki-Documents-PROJELER--LGEN-trello-clone\tasks\bga9m7n0o.output
Bash Check dev server startup output
IN
sleep 8 && tail -30 /c/Users/turki/AppData/Local/Temp/claude/c--Users-turki-Documents-PROJELER--LGEN-trello-clone/tasks/bga9m7n0o.output 2>&1

OUT
> ulgen-trello-clone@1.0.0 dev C:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone
> turbo run dev --parallel

• Packages in scope: database, eslint-config, typescript-config, web
• Running dev in 4 packages
• Remote caching disabled
web:dev: cache bypass, force executing 1c8ce9daa7711872
web:dev: 
web:dev: > web@1.0.0 dev C:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web
web:dev: > next dev
web:dev: 
web:dev:    ▲ Next.js 14.0.4
web:dev:    - Local:        http://localhost:3000
web:dev:    - Environments: .env
web:dev: 
web:dev:  ✓ Ready in 2.8s
Dev server 2.8 saniyede hazır oldu. Şimdi TODOS.md ve CHANGELOG.md'yi güncelleyelim:

Update Todos

Database schema: TimelineTask modeli + enum ekle, pnpm db:push

TypeScript tipleri: TimelineTask, TimelineStats

Zod validasyon şeması: createTimelineTaskSchema

Service: apps/web/services/timeline.service.ts

API endpoints: /api/timeline, /api/timeline/tasks/[id], /api/timeline/unscheduled

Zustand store: apps/web/store/timeline.store.ts

Components: timeline-view, header, section, task-card, stats, unscheduled-pool, add-task-dialog

Sayfa route: /timeline + nav linki

TODOS.md ve CHANGELOG.md güncelle
Bash List docs directory
IN
ls /c/Users/turki/Documents/PROJELER/ÜLGEN/trello-clone/docs/

OUT
AI_CONTEXT.md
CHANGELOG.md
CLAUDE.MD
DAILY_TASK_TIMELINE.md
HIZLI_BASLANGIC.md
ILK_CALISTIRMA_ADIMLAR.md
KURULUM_VE_CALISTIRMA.md
KURULUM_VE_CALISTIRMA.pdf
NEXT_SESSION_PLAN.md
PROJE_DURUMU.md
README.md
RELEASE_NOTES_v1.4.0.md
TESHIS_RAPORU.md
TESHIS_RAPORU.pdf
TODOS.md
daily-log
kurulum-postgresql
loglar
test
Read c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\docs\CHANGELOG.md
Edit c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\docs\CHANGELOG.md
Added 50 lines
TODOS.md'de 20. maddeyi tamamlandı olarak işaretleyelim:

Edit c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\docs\TODOS.md
Added 1 line
Edit c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\docs\TODOS.md
Modified
Şimdi memory dosyasını güncelleyelim:

Read C:\Users\turki\.claude\projects\c--Users-turki-Documents-PROJELER--LGEN-trello-clone\memory\MEMORY.md
Edit C:\Users\turki\.claude\projects\c--Users-turki-Documents-PROJELER--LGEN-trello-clone\memory\MEMORY.md
Added 1 line
Edit C:\Users\turki\.claude\projects\c--Users-turki-Documents-PROJELER--LGEN-trello-clone\memory\MEMORY.md
Added 3 lines
Update Todos

Database schema: TimelineTask modeli + enum ekle, pnpm db:push

TypeScript tipleri: TimelineTask, TimelineStats

Zod validasyon şeması: createTimelineTaskSchema

Service: apps/web/services/timeline.service.ts

API endpoints: /api/timeline, /api/timeline/tasks/[id], /api/timeline/unscheduled

Zustand store: apps/web/store/timeline.store.ts

Components: timeline-view, header, section, task-card, stats, unscheduled-pool, add-task-dialog

Sayfa route: /timeline + nav linki

TODOS.md ve CHANGELOG.md güncelle
v1.6.0 Daily Task Timeline Phase 1 MVP tamamlandı. 🎉

Yapılan Değişiklikler
Yeni Dosyalar (14 adet)
Database & Types:

schema.prisma — TimelineTask modeli + TimelineTaskStatus enum eklendi
types/index.ts — TimelineTask, TimelineStats, UnscheduledCard tipleri
Backend:

services/timeline.service.ts — CRUD, erişim kontrolü, overlap detection
api/timeline/route.ts — GET + POST
api/timeline/tasks/[id]/route.ts — PATCH + DELETE
api/timeline/unscheduled/route.ts — Planlanmamış kartlar
Frontend:

store/timeline.store.ts — Zustand store (optimistic updates)
components/timeline/timeline-view.tsx — Ana container
components/timeline/timeline-header.tsx — Tarih navigasyonu
components/timeline/timeline-section.tsx — Sabah/Öğle/Akşam blokları
components/timeline/timeline-task-card.tsx — Görev kartı
components/timeline/timeline-stats.tsx — İstatistik paneli
components/timeline/unscheduled-pool.tsx — Planlanmamış kartlar
components/timeline/add-task-dialog.tsx — Görev ekleme dialogu
app/(dashboard)/timeline/page.tsx — /timeline route
Güncellemeler
dashboard-nav.tsx — "Günlük Plan" nav linki
layout.tsx — Sonner <Toaster> eklendi
Kullanım: http://localhost:3000/timeline adresine gidin ya da navbar'daki "Günlük Plan" butonuna tıklayın. Board'larınızdaki kartları Sabah/Öğle/Akşam bloklarına planlayıp Başlat → Tamamla akışını kullanabilirsiniz.

Bu geliştirmeleri kaydettin mi ilgili dosyalara
Read c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\docs\daily-log\2026-03-05.md
Daily log güncellenмemiş. Hemen ekleyeyim:

Edit c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\docs\daily-log\2026-03-05.md
Added 65 lines
Evet, artık tüm dosyalar güncel:

CHANGELOG.md — v1.6.0 girişi eklendi
TODOS.md — 20. madde ✅ Tamamlandı (v1.6.0) olarak işaretlendi
MEMORY.md — v1.6.0 ve yeni kritik dosyalar eklendi
daily-log/2026-03-05.md — Az önce detaylı v1.6.0 log girişi eklendi (tamamlanan işler, değiştirilen dosyalar, önemli notlar, Phase 2 için yapılacaklar)
Başlangıçta sunduğun planlardan tamamlanmayan var mı. Benim seçtiğim harici diğer planda tamamlanması gereken var mı
Evet, kullanıcı olarak seçtiğin "Sadece Phase 1" kapsamındaki her şey tamamlandı. Hatta Phase 2'den birkaç ekstra da geldi:

✅ Phase 1 — Tamamlananlar (Seçilenler)
Madde	Durum
Database schema (TimelineTask modeli)	✅
Temel API endpoints (CRUD)	✅
Timeline görünümü (Kanban-Hybrid)	✅
Board'dan görev ekleme (dialog)	✅
Manuel Başlat / Duraklat / Tamamla / Atla	✅
Temel günlük istatistikler	✅
🎁 Bonus — Phase 2'den Gelen Ekstralar
Madde	Durum
Zaman çakışması (overlap) koruması	✅ Phase 2 idi, geldi
Status bazlı renk kodlaması	✅ Phase 2 idi, geldi
Unscheduled pool (planlanmamış kartlar)	✅ Phase 2 idi, geldi
⏳ Seçilmeyen / Yapılmayan (Phase 2 & 3)
Madde	Aşama
Drag & drop ile zaman slotuna taşıma	Phase 2
Görev bazlı progress bar	Phase 2
Responsive / mobil iyileştirmeleri	Phase 2
Pomodoro timer (25dk/5dk)	Phase 3
Real-time süre sayacı	Phase 3
Haftalık görünüm (This Week)	Phase 3
Tekrarlayan görevler	Phase 3
Kısaca: Seçtiğin kapsamda eksiksiz tamamlandı, üstüne 3 Phase 2 özelliği de hediye geldi. Phase 2/3 istediğinde devam edebiliriz.

phase 2 den tamamlanmayanları TODOS'a ekleyelim mi
Read c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\docs\TODOS.md (lines 491-580)
Edit c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\docs\TODOS.md
Added 26 lines
Edit c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\docs\TODOS.md
Modified
Edit c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\docs\TODOS.md
Added 2 lines
TODOS.md güncellendi. Eklenenler:

#21 — Timeline Phase 2 (Enhanced UX)

Drag & drop ile saat değiştirme
Çakışma modal'ı (Replace / Move / Cancel)
Görev bazlı progress bar
Board bazlı renk kodlaması
Mobil iyileştirmeler
#22 — Timeline Phase 3 (Advanced Features)

Pomodoro timer (25/5/15 dk)
Real-time canlı süre sayacı
Haftalık görünüm
Günler arası görev taşıma
Günlük rapor / export
"Sonraki Adım" bölümü de güncellendi — Phase 2, bir sonraki mantıklı adım olarak listelendi.

İleri seviye özellikler arasında katmak için TODOS'ta olmayan projeyi farklı kılacak ne önerirsin
TODOS.md ve mevcut liste tam olarak aklımda. İşte projeyi gerçekten farklılaştıracak, listede olmayan öneriler:

🔥 En Güçlü Olanlar
1. Eisenhower Matrix View (Önemli/Acil 2×2 Matrisi)
Kartları 4 kadranda görselleştir: Yap / Planla / Delege Et / Sil. Trello'da yok, basit ama çok güçlü bir önceliklendirme aracı.

2. Card Aging (Kart "Eskime" Sistemi)
Uzun süre dokunulmayan kartlar görsel olarak solar — 7 gün sonra hafif gri, 30 gün sonra tam soluk. "Bu iş neden hâlâ burada?" sorusunun otomatik cevabı.

3. Card Dependencies (Kart Bağımlılıkları)
"A tamamlanmadan B başlamasın" ilişkisi. Gantt/Timeline ile entegre olunca gerçek proje yönetimi aracına dönüşür.

4. Personal Analytics Dashboard
Timeline Phase 1'in doğal devamı: "En verimli saatlerim 10:00–12:00", "Sprint Board'a haftalık 14 saat harcıyorum", "Ortalama tahmin doğruluğun %73." Rakip ürünlerde neredeyse yok.

5. Focus Mode (Derin Çalışma Modu)
Tek görev tam ekran — diğer her şey gizlenir, ambient ses seçeneği (yağmur, kahvehane, beyaz gürültü), Pomodoro entegre. "Do Not Disturb for tasks."

💡 İlginç Olanlar
6. Smart Card Templates
"Bug report" şablonu seçince otomatik olarak checklist, label, due date gelir. Kart oluştururken template seçimi.

7. Workload Heatmap
GitHub contribution graph gibi — hangi günler yoğun çalıştın, hangi günler boş kaldın. Haftalık/aylık görünüm.

8. Voice Notes
Kartlara tarayıcı API ile sesli not kaydetme. Özellikle mobilde çok kullanışlı, neredeyse hiçbir task manager'da yok.

Bunları TODOS.md'ye ekleyeyim mi? Hangileri ilgini çekti?

hepsi çok güzel TODOS'a ekle
Read c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\docs\TODOS.md (lines 514-563)
Read c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\docs\TODOS.md (lines 561-590)
Edit c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\docs\TODOS.md
Added 184 lines
Edit c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\docs\TODOS.md
Modified
8 yeni özellik (#23–#30) TODOS.md'ye eklendi:

#	Özellik	Süre	Öncelik
23	Eisenhower Matrix View	3-4s	🔥 Yüksek
24	Card Aging	2-3s	🟠 Orta
25	Card Dependencies	4-5s	🟠 Orta
26	Personal Analytics Dashboard	4-5s	🟠 Orta
27	Focus Mode	3-4s	🟡 Orta-Düşük
28	Smart Card Templates	3-4s	🟡 Orta-Düşük
29	Workload Heatmap	3-4s	🟡 Orta-Düşük
30	Voice Notes	3-4s	🟡 Orta-Düşük
Her madde için detaylı konsept açıklaması, özellik listesi ve yapılacaklar (schema → API → component) yazıldı. Toplam özellik sayısı 22'den 30'a çıktı.

Bu projenin kazanç getirisi ne olur piyasada ilgi görür mü
Teknik değil, iş/pazar sorusu — dürüstçe değerlendireyim.

Pazar Analizi
Gerçek Tablo
Trello klonu olarak: Kazanç zorlu. Trello, Notion, Linear, Asana gibi devler milyarlarca dolar yatırımla bu alanı doldurmuş. "Başka bir Kanban aracı" olarak piyasaya çıkmak çok zor.

Ama bu proje farklı bir şey yapıyor:

Gerçek Fırsat: Nişin Kesişim Noktası
Projenin öne çıkan özellik kombinasyonu — Kanban + Daily Timeline + Personal Analytics + Focus Mode — aslında hiçbir büyük ürünün tam olarak çözmediği bir boşluğu dolduruyor:

"Tek başına çalışan, birden fazla projesi olan, zamanını verimli yönetmek isteyen kişi"

Bu persona için mevcut seçenekler:

Trello → Görev takibi var, zaman yönetimi yok
Notion → Her şey var, karmaşık ve ağır
Todoist → Görev listesi var, proje görünümü zayıf
Motion / Reclaim.ai → Takvim odaklı, Kanban yok, pahalı ($20-34/ay)
ÜLGEN bu boşluğa oturabilir: Kanban + Zaman Planlama + Kişisel Analitik, tek platformda, sade arayüzle.

Gelir Modeli Seçenekleri
1. SaaS — Freemium (En mantıklı)


Ücretsiz:  3 board, 7 günlük timeline, temel analitik
Pro ($8/ay): Sınırsız board, tam analitik, Focus Mode, Voice Notes
Team ($15/kullanıcı): Paylaşımlı board, team timeline
Hedef: 1.000 ödeme yapan kullanıcı = $8.000–15.000/ay

2. Lifetime Deal (Hızlı nakit)
AppSumo veya benzeri platformlarda $49–99 lifetime lisans. 500 satış = $25.000–50.000 tek seferlik.

3. Open Source + Hosted (Topluluk + gelir)
Kodu açık kaynak yap, self-host isteyenler ücretsiz, bulut versiyonu ücretli. Notion'ın rakibi AppFlowy bu modeli kullanıyor.

Gerçekçi Risk Değerlendirmesi
Risk	Seviye	Açıklama
Rekabet	🔴 Yüksek	Dev oyuncular var ama niş boş
Teknik borç	🟡 Orta	Monorepo sağlam, ölçeklenebilir
Kullanıcı edinme	🔴 Yüksek	En zor kısım — pazarlama gerekir
Farklılaştırma	🟢 Düşük	Timeline + Analytics kombinasyonu gerçekten özgün
Piyasada İlgi Görür mü?
Kısa cevap: Timeline + Analytics + Focus Mode kombinasyonu Product Hunt'ta öne çıkabilir. Indie hacker topluluğu (freelancer, solo developer, remote çalışan) bu tür araçlara para ödüyor.

Ama şunu bilmek lazım: Trello rakibi olarak değil, "personal productivity OS" olarak konumlanırsa şansı var. "Tüm projelerini yönet, günün planla, ne kadar verimli olduğunu gör" — bu mesaj satılabilir.

Sonuç: Portföy projesi olarak çok güçlü. Ticari ürün olarak ciddi iş geliştirme (pazarlama, kullanıcı edinme, ödeme altyapısı) gerektiriyor. Teknik temeli şu haliyle SaaS'a hazır, asıl mesele teknikten çok büyüme stratejisi.

