# 🌟 Daily Task Timeline - Cross-Board Time Planning

**Versiyon:** 1.0 (Concept)  
**Durum:** 📋 Tasarım Aşaması  
**Öncelik:** 🔥 Yüksek  
**Tahmini Süre:** 6-8 saat  
**Tarih:** 1 Ocak 2026

---

## 🎯 Konsept Özeti

**Problem:**  
Kullanıcılar birden fazla board'da çalışıyor ve görevleri farklı board'lara dağılmış durumda. Günlük planlama yaparken tüm board'ları tek tek kontrol etmek zorunda kalıyorlar. Zamanı verimli yönetmek ve günlük iş akışını görselleştirmek zor.

**Çözüm:**  
Tüm board'lardan görevleri tek bir **zaman çizelgesi (timeline)** üzerinde toplamak. Kullanıcı, görevlerini belirli zaman dilimlerine yerleştirerek gününü planlayabilir, ilerlemesini takip edebilir ve tamamlanan görevleri görsel olarak ayırt edebilir.

---

## ✨ Özellikler

### 🎨 1. Timeline Görünümü

**Tasarım Konseptleri:**

#### **A) Yatay Timeline (Önerilen)**
```
┌─────────────────────────────────────────────────────────────────┐
│  Daily Timeline - 1 Ocak 2026                      [< Bugün >]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  06:00 ─────────────────────────────────────────────────────────│
│         ┌──────────────────────────┐                             │
│  07:00  │ ☀️ Morning Routine       │                            │
│         │ 📋 Personal Board         │                            │
│  08:00  └──────────────────────────┘                             │
│         ┌─────────────────────────────────────────┐              │
│  09:00  │ 💻 Backend API Development             │              │
│         │ 🎯 Sprint Board                        │              │
│  10:00  │ Est: 2h | Actual: --                    │              │
│         └─────────────────────────────────────────┘              │
│  11:00 ─────────────────────────────────────────────────────────│
│         ┌────────────────┐                                       │
│  12:00  │ 🍽️ Lunch Break │                                      │
│         └────────────────┘                                       │
│  13:00 ─────────────────────────────────────────────────────────│
│         ┌──────────────────────────────────┐                     │
│  14:00  │ 📊 Weekly Report Preparation    │                     │
│         │ 📈 Marketing Board              │                     │
│  15:00  │ ✅ COMPLETED                     │                     │
│         └──────────────────────────────────┘                     │
│  16:00 ─────────────────────────────────────────────────────────│
│         ┌────────────────────────────────────────────┐           │
│  17:00  │ 🎨 Design Review Meeting                  │           │
│         │ 🎨 Design Board | Due: Today 18:00       │           │
│  18:00  └────────────────────────────────────────────┘           │
│                                                                   │
│  Unscheduled Tasks (10) ▼                                        │
│    • Fix login bug (Bug Tracking Board)                          │
│    • Update documentation (Dev Board)                            │
│    • Review PR #123 (Sprint Board)                               │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

**Avantajları:**
- ✅ Doğal zaman akışı (yukarıdan aşağıya)
- ✅ Mobil uyumlu (scroll ile gezinti)
- ✅ Takvim görünümüne benzer (aşina)
- ✅ Her saat dilimi net görünür

#### **B) Gantt Chart Benzeri (Alternatif)**
```
┌─────────────────────────────────────────────────────────────────┐
│         │06│07│08│09│10│11│12│13│14│15│16│17│18│19│20│21│22│   │
├─────────┼──────────────────────────────────────────────────────┤
│ Sprint  │  │  │■■■■■■■■■■│  │  │  │  │  │  │  │  │  │  │  │  │   │
│ Design  │  │  │  │  │  │  │  │  │  │  │  │■■■■│  │  │  │  │  │   │
│ Market. │  │  │  │  │  │  │  │  │■■■■■■│  │  │  │  │  │  │  │   │
│ Personal│  │■■│  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │   │
└─────────┴──────────────────────────────────────────────────────┘
```

**Avantajları:**
- ✅ Tüm board'ları bir arada görme
- ✅ Paralel görevleri görselleştirme
- ❌ Kompleks UI
- ❌ Mobilde zor

#### **C) Kanban-Timeline Hybrid (En İnovatif) 🌟**
```
┌─────────────────────────────────────────────────────────────────┐
│  🌅 Morning (06:00-12:00)        │  📊 Stats                     │
├─────────────────────────────────┼───────────────────────────────┤
│                                  │  ⏱️ Planned: 6h              │
│  [💻 Backend API Development]   │  ✅ Completed: 2/5            │
│  Sprint Board | 2h               │  🎯 Remaining: 3/5           │
│                                  │  📈 Progress: 40%             │
│  [☀️ Morning Routine]           │                               │
│  Personal Board | 1h             │  🔥 Current Task:            │
│                                  │  📊 Weekly Report            │
│                                  │  ⏰ Started: 14:05           │
├─────────────────────────────────┼───────────────────────────────┤
│  ☀️ Afternoon (12:00-18:00)     │  📅 Next Up                   │
├─────────────────────────────────┤                               │
│                                  │  17:00 - 🎨 Design Review    │
│  [✅ Weekly Report] DONE         │  18:30 - 📞 Team Standup     │
│  Marketing Board | 1.5h          │                               │
│                                  │  🔔 Reminders                 │
│  [🎨 Design Review Meeting]     │  • Backend API due today      │
│  Design Board | Due: 18:00      │  • 3 cards overdue            │
│                                  │                               │
├─────────────────────────────────┼───────────────────────────────┤
│  🌙 Evening (18:00-00:00)       │  📋 Unscheduled (10)          │
├─────────────────────────────────┤                               │
│                                  │  [Drag tasks here]            │
│  [Empty - Drop tasks here]      │                               │
│                                  │  • Fix login bug              │
│                                  │  • Update docs                │
│                                  │  • Review PR #123             │
│                                  │  • Design mockups             │
│                                  │                               │
└─────────────────────────────────┴───────────────────────────────┘
```

**Avantajları:**
- ✅ ✨ En kullanıcı dostu
- ✅ ✨ Gün parçalara bölünmüş (cognitive load az)
- ✅ ✨ Stats ve context zengin
- ✅ ✨ Drag & drop doğal
- ✅ ✨ Unscheduled tasks pool'u var
- ✅ ✨ Next up preview
- ✅ ✨ Real-time progress tracking

---

### 🎯 2. Core Features

#### **2.1 Task Scheduling (Görev Planlama)**

**Özellikler:**
- ✅ Drag & drop ile zaman slotuna kart ekleme
- ✅ Kartları farklı board'lardan seçme
- ✅ Tahmini süre belirleme (30 dk, 1 saat, 2 saat, vb.)
- ✅ Başlangıç-bitiş zamanı otomatik hesaplama
- ✅ Çakışma uyarısı (overlap detection)
- ✅ Buffer time (görevler arası 15 dk mola)

**User Flow:**
```
1. Timeline sayfasını aç
2. "Add Task" veya unscheduled pool'dan sürükle
3. Board seç → Card seç
4. Time slot'a drop et
5. Süre ayarla (default: 1h)
6. Kaydet → Timeline'da görün
```

#### **2.2 Progress Tracking (İlerleme Takibi)**

**Özellikler:**
- ✅ "Start Task" butonu (zaman sayacı başlat)
- ✅ Aktif görev vurgulama (pulse animation)
- ✅ Gerçek harcanan süre vs tahmini süre
- ✅ "Complete Task" butonu (✅ işaretle)
- ✅ Tamamlanan görevler farklı görünüm (opacity, strikethrough)
- ✅ Progress bar (günlük ilerleme)

**Task States:**
```
🔵 Planned (Planlandı)       → Gri/Mavi border
🟡 In Progress (Devam ediyor) → Sarı pulse animation
✅ Completed (Tamamlandı)     → Yeşil background, opacity 60%
⏸️ Paused (Durduruldu)        → Turuncu border
⏭️ Skipped (Atlandı)          → Gri strikethrough
```

#### **2.3 Time Block Management**

**Pomodoro Entegrasyonu:**
```
┌─────────────────────────────────┐
│ 💻 Backend API Development     │
│ Sprint Board                    │
├─────────────────────────────────┤
│ 🍅 Pomodoro Timer               │
│ ⏱️ 25:00                        │
│ [█████████████░░░░░░] 60%      │
│                                 │
│ [⏸️ Pause]  [⏭️ Skip]           │
│                                 │
│ Sessions: 🍅🍅🍅 (3/4)          │
│ Next break: 5 min               │
└─────────────────────────────────┘
```

**Özellikler:**
- ✅ 25 dk odaklanma + 5 dk mola (Pomodoro)
- ✅ 4 Pomodoro sonra 15 dk uzun mola
- ✅ Timer otomatik başlat/durdur
- ✅ Bildirimler (browser notification)
- ✅ Pomodoro sayısını tracking

#### **2.4 Multi-Day View**

**Navigasyon:**
```
[< Dün]  [Bugün]  [Yarın >]

Tab View:
[Today] [Tomorrow] [This Week] [Next Week]
```

**Özellikler:**
- ✅ Geçmiş günleri görüntüleme (readonly)
- ✅ Gelecek günleri planlama
- ✅ Haftalık overview (7 günlük)
- ✅ Drag & drop ile günler arası taşıma
- ✅ Recurring tasks (tekrarlayan görevler)

---

### 🎨 3. UI/UX Details

#### **3.1 Task Card in Timeline**

```
┌─────────────────────────────────────────────┐
│ 💻 Backend API Development                 │ ← Title
│ 🎯 Sprint Board · #feature · @john        │ ← Metadata
├─────────────────────────────────────────────┤
│ ⏰ 09:00 - 11:00 (2h)                      │ ← Time
│ ⏱️ Actual: 1h 23m                          │ ← Progress
│ [████████████░░░░░░] 70%                   │ ← Visual bar
├─────────────────────────────────────────────┤
│ [▶️ Start] [✅ Complete] [⏸️ Pause] [⚙️]   │ ← Actions
└─────────────────────────────────────────────┘
```

**Tamamlandığında:**
```
┌─────────────────────────────────────────────┐
│ ✅ Backend API Development                 │
│ 🎯 Sprint Board · Completed at 10:45      │
├─────────────────────────────────────────────┤
│ ⏰ 09:00 - 11:00 (Planned: 2h)             │
│ ✓ Actual: 1h 45m (15m under estimate)     │
│ [████████████████████] 100%                │
├─────────────────────────────────────────────┤
│ [↻ Undo] [👁️ View in Board]                │
└─────────────────────────────────────────────┘

Visual: Yeşil gradient, hafif opacity, ✓ ikonu
```

#### **3.2 Color Coding**

**Board-Based Colors:**
```
🎯 Sprint Board     → Blue (#3B82F6)
🎨 Design Board     → Purple (#A855F7)
📈 Marketing Board  → Green (#10B981)
🐛 Bug Tracking     → Red (#EF4444)
📝 Personal Board   → Yellow (#F59E0B)
```

**Status-Based Colors:**
```
🔵 Planned          → Border: gray-300
🟡 In Progress      → Border: yellow-400, pulse animation
✅ Completed        → Background: green-100, opacity: 60%
⏸️ Paused           → Border: orange-400, dashed
⏭️ Skipped          → Opacity: 40%, strikethrough
🔴 Overdue          → Border: red-500, shake animation
```

#### **3.3 Responsive Design**

**Desktop (>1024px):**
- 3 column layout: Timeline | Main | Sidebar
- Full timeline görünümü
- Stats ve shortcuts yan panelde

**Tablet (768px-1024px):**
- 2 column: Timeline | Main
- Collapsible sidebar

**Mobile (<768px):**
- Single column
- Stacked timeline cards
- Bottom sheet için modals
- Swipe gestures (prev/next day)

---

### 🔧 4. Technical Architecture

#### **4.1 Database Schema**

```prisma
// packages/database/prisma/schema.prisma

model TimelineTask {
  id           String   @id @default(cuid())
  userId       String
  cardId       String
  boardId      String
  
  // Scheduling
  scheduledDate DateTime              // Hangi gün
  startTime     DateTime              // 09:00
  endTime       DateTime              // 11:00
  estimatedMinutes Int @default(60)   // Tahmini süre (dk)
  
  // Progress
  status        TimelineTaskStatus @default(PLANNED)
  actualStartTime  DateTime?         // Gerçek başlangıç
  actualEndTime    DateTime?         // Gerçek bitiş
  actualMinutes    Int?              // Gerçek süre
  pausedMinutes    Int @default(0)   // Mola süreleri
  
  // Pomodoro
  pomodoroTarget   Int @default(4)   // Hedef pomodoro sayısı
  pomodoroCompleted Int @default(0)  // Tamamlanan
  
  // Relations
  user      User     @relation(fields: [userId], references: [id])
  card      Card     @relation(fields: [cardId], references: [id], onDelete: Cascade)
  board     Board    @relation(fields: [boardId], references: [id], onDelete: Cascade)
  sessions  PomodoroSession[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([userId, scheduledDate])
  @@index([cardId])
}

enum TimelineTaskStatus {
  PLANNED
  IN_PROGRESS
  PAUSED
  COMPLETED
  SKIPPED
}

model PomodoroSession {
  id              String   @id @default(cuid())
  timelineTaskId  String
  
  startTime       DateTime
  endTime         DateTime?
  duration        Int      @default(25) // minutes
  type            PomodoroType @default(WORK)
  completed       Boolean  @default(false)
  
  timelineTask    TimelineTask @relation(fields: [timelineTaskId], references: [id], onDelete: Cascade)
  
  createdAt       DateTime @default(now())
}

enum PomodoroType {
  WORK          // 25 dk
  SHORT_BREAK   // 5 dk
  LONG_BREAK    // 15 dk
}

// Card model'e eklenecek
model Card {
  // ... existing fields
  timelineTasks TimelineTask[]
}
```

#### **4.2 API Endpoints**

```typescript
// GET /api/timeline?date=2026-01-01
// Response: Belirtilen gün için tüm timeline taskları
{
  date: "2026-01-01",
  tasks: [
    {
      id: "task_123",
      card: { id, title, description, boardId, boardName, labels },
      startTime: "09:00",
      endTime: "11:00",
      estimatedMinutes: 120,
      status: "IN_PROGRESS",
      actualMinutes: 65,
      pomodoroCompleted: 2
    }
  ],
  stats: {
    totalPlanned: 8,
    completed: 3,
    inProgress: 1,
    remaining: 4,
    totalMinutesPlanned: 480,
    totalMinutesActual: 245
  }
}

// POST /api/timeline/tasks
// Body: { cardId, scheduledDate, startTime, endTime, estimatedMinutes }
// Response: Created timeline task

// PATCH /api/timeline/tasks/:id/start
// Start task timer

// PATCH /api/timeline/tasks/:id/pause
// Pause task timer

// PATCH /api/timeline/tasks/:id/complete
// Mark as completed

// PATCH /api/timeline/tasks/:id/skip
// Skip task

// DELETE /api/timeline/tasks/:id
// Remove from timeline

// POST /api/timeline/tasks/:id/pomodoro
// Start new pomodoro session

// GET /api/timeline/unscheduled
// Get cards without timeline scheduling (for suggestions)
```

#### **4.3 Zustand Store**

```typescript
// apps/web/store/timeline.store.ts

interface TimelineStore {
  // State
  currentDate: Date;
  tasks: TimelineTask[];
  activeTask: TimelineTask | null;
  unscheduledCards: Card[];
  isLoading: boolean;
  
  // Stats
  stats: {
    totalPlanned: number;
    completed: number;
    inProgress: number;
    remaining: number;
    progressPercentage: number;
  };
  
  // Actions
  setDate: (date: Date) => void;
  fetchTasks: (date: Date) => Promise<void>;
  addTask: (task: CreateTimelineTask) => Promise<void>;
  updateTask: (id: string, updates: Partial<TimelineTask>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  
  // Timer actions
  startTask: (id: string) => Promise<void>;
  pauseTask: (id: string) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  skipTask: (id: string) => Promise<void>;
  
  // Pomodoro
  startPomodoro: (taskId: string) => Promise<void>;
  completePomodoro: (sessionId: string) => Promise<void>;
  
  // Utility
  moveTask: (id: string, newStartTime: Date) => Promise<void>;
  duplicateTask: (id: string, newDate: Date) => Promise<void>;
  fetchUnscheduledCards: () => Promise<void>;
  
  // Real-time updates
  subscribeToUpdates: () => void;
  unsubscribeFromUpdates: () => void;
}
```

#### **4.4 Components**

```
apps/web/components/timeline/
├── timeline-view.tsx           # Main container
├── timeline-header.tsx         # Date navigation, stats
├── timeline-grid.tsx           # Hour grid & time slots
├── timeline-task-card.tsx      # Individual task card
├── task-actions.tsx            # Start/pause/complete buttons
├── pomodoro-timer.tsx          # Timer component
├── unscheduled-pool.tsx        # Drag source for cards
├── add-task-dialog.tsx         # Board/card selection modal
├── timeline-stats.tsx          # Daily statistics
├── time-block-settings.tsx     # Pomodoro configuration
└── timeline-calendar-view.tsx  # Week/month overview
```

---

### 🚀 5. Implementation Roadmap

#### **Phase 1: MVP (3-4 saat)**
- [x] Database schema (TimelineTask model)
- [x] Basic API endpoints (CRUD)
- [x] Simple timeline view (hourly grid)
- [x] Add task from board
- [x] Manual start/complete
- [x] Basic stats

#### **Phase 2: Enhanced UX (2-3 saat)**
- [ ] Drag & drop scheduling
- [ ] Visual progress bars
- [ ] Status color coding
- [ ] Unscheduled pool
- [ ] Time conflict detection
- [ ] Responsive design

#### **Phase 3: Advanced Features (2-3 saat)**
- [ ] Pomodoro timer
- [ ] Real-time tracking
- [ ] Multi-day navigation
- [ ] Recurring tasks
- [ ] Timeline analytics
- [ ] Export/print timeline

#### **Phase 4: Polish & Optimization**
- [ ] Animations & transitions
- [ ] Keyboard shortcuts
- [ ] Mobile gestures
- [ ] Performance optimization
- [ ] Comprehensive testing

---

### 💡 6. Innovation Points

**Bu özelliği benzersiz yapan yönler:**

1. **🌐 Cross-Board Integration**
   - İlk kez farklı board'ları tek timeline'da birleştiriyor
   - Kullanıcının tüm iş akışını görüntülüyor

2. **⏱️ Real-Time Progress Tracking**
   - Sadece planlama değil, aktif takip
   - Tahmini vs gerçek süre karşılaştırması

3. **🍅 Built-in Pomodoro**
   - Zaman yönetimi tekniklerini entegre
   - Mindful work promotion

4. **📊 Smart Scheduling**
   - Çakışma önleme
   - Buffer time otomasyonu
   - Optimal zaman önerileri (AI ile genişletilebilir)

5. **🎨 Hybrid View**
   - Kanban + Timeline + Calendar fusion
   - Her kullanıcı tipine uygun

6. **♻️ Feedback Loop**
   - Her görev tamamlandığında data topla
   - Kullanıcı tahmin accuracy'sini artır
   - Personalized recommendations

---

### 🎯 7. Success Metrics

**Measuring Impact:**

```typescript
interface TimelineMetrics {
  // Usage
  dailyActiveUsers: number;
  averageTasksScheduled: number;
  timelineViewTime: number; // minutes
  
  // Completion
  completionRate: number; // %
  onTimeCompletionRate: number;
  averageTaskDuration: number; // minutes
  
  // Accuracy
  estimationAccuracy: number; // %
  pomodoroCompletionRate: number;
  
  // Engagement
  recurringTasksCreated: number;
  weeklyPlanningRate: number;
}
```

**Target Goals (3 aylık):**
- ✅ 70%+ kullanıcılar timeline'ı deniyor
- ✅ 50%+ aktif kullanım (weekly)
- ✅ 60%+ task completion rate
- ✅ 75%+ estimation accuracy (zamanla öğrenme)
- ✅ 4.5/5 user satisfaction

---

### 🔮 8. Future Enhancements

**Version 2.0 Ideas:**

1. **🤖 AI-Powered Scheduling**
   ```
   "Hey AI, schedule my tasks for tomorrow"
   → AI analyzes:
      - Task priorities
      - Historical completion times
      - Energy levels (morning person?)
      - Meeting schedules
      - Dependencies
   → Optimal timeline oluşturur
   ```

2. **📱 Mobile App (Native)**
   - Push notifications (görev başlangıcı)
   - Quick timer start/stop
   - Today widget
   - Apple Watch complications

3. **🔗 Calendar Integration**
   - Google Calendar sync
   - Outlook sync
   - Auto-block time for tasks
   - Meeting awareness

4. **👥 Team Timeline**
   - Takım üyelerinin timeline'larını görme
   - Resource allocation
   - Capacity planning
   - Collaboration time blocking

5. **📈 Advanced Analytics**
   ```
   - Productivity heatmap (hangi saatlerde verimli?)
   - Focus time trends
   - Context switching analysis
   - Burnout prevention alerts
   - Weekly/monthly reports
   ```

6. **⚡ Smart Suggestions**
   ```
   "Based on your pattern:
    - You work best 10am-12pm
    - Deep work: mornings
    - Meetings: afternoons
    - Friday: admin tasks
   
   → Auto-suggest optimal scheduling"
   ```

7. **🎮 Gamification**
   - Streaks (7 günlük completion streak)
   - Badges (Pomodoro Master, Early Bird)
   - Leaderboards (optional, team)
   - Achievements

8. **🔄 Automation Rules**
   ```
   IF card label = "urgent"
   THEN auto-add to today's timeline
   
   IF due date = tomorrow
   THEN suggest scheduling today
   
   IF task type = "deep work"
   THEN suggest morning slots
   ```

---

### 📚 9. User Stories

**Persona 1: Solo Developer**
```
"Ben tek başıma çalışan bir developer'ım. 
3 farklı projede çalışıyorum ve görevler dağınık.
Timeline sayesinde sabah gününü planlıyorum,
hangi projeye ne kadar zaman ayıracağımı görüyorum.
Pomodoro ile odaklanıyorum ve gün sonunda
ne kadar verimli olduğumu analiz ediyorum."

Value: Odaklanma, time management, productivity
```

**Persona 2: Product Manager**
```
"Gün boyu toplantılar, review'lar ve stratejik işler
arasında gidip geliyorum. Timeline'da hem
meeting bloklarım hem de kart işlerim görünüyor.
Boş slotları görüp orada deep work yapabiliyorum.
Hangi board'a ne kadar zaman ayırdığımı tracking
ediyorum ve önceliklendirme yapabiliyorum."

Value: Visibility, balance, prioritization
```

**Persona 3: Creative Designer**
```
"Yaratıcı işlerde zaman blokları önemli.
Timeline'da 2 saatlik design sprint bloklarım var.
Pomodoro kullanmıyorum ama başlangıç-bitiş
saatlerini tracking ediyorum. Hangi projeye
ne kadar zaman gitti görünce client billing'i
kolaylaşıyor."

Value: Time tracking, billing, focus blocks
```

---

### ⚠️ 10. Challenges & Solutions

#### **Challenge 1: Çakışan Görevler**
**Problem:** Kullanıcı aynı saate 2 görev koyarsa?

**Solution:**
```typescript
// Overlap detection
function detectOverlap(newTask: TimelineTask, existingTasks: TimelineTask[]) {
  return existingTasks.some(task => {
    return (
      (newTask.startTime >= task.startTime && newTask.startTime < task.endTime) ||
      (newTask.endTime > task.startTime && newTask.endTime <= task.endTime)
    );
  });
}

// UI: Warning modal
"⚠️ This time slot overlaps with 'Backend API Development' (09:00-11:00).
Options:
- [Replace] Remove old task
- [Split] Shorten old task
- [Move] Find next available slot
- [Cancel] Choose different time"
```

#### **Challenge 2: Gerçekçi Olmayan Planlar**
**Problem:** Kullanıcı 20 görev 8 saate sığdırmaya çalışırsa?

**Solution:**
```typescript
// Capacity warning
if (totalScheduledMinutes > 480) { // 8 saat
  showWarning({
    title: "⚠️ Overloaded Day",
    message: `You've scheduled ${totalScheduledMinutes / 60}h of work.
              Recommended: Max 8h productive work + breaks.`,
    suggestion: "Consider moving some tasks to tomorrow.",
    actions: ["Auto-Balance", "Continue Anyway"]
  });
}
```

#### **Challenge 3: Timeline vs Board Sync**
**Problem:** Card board'da silinirse timeline'da ne olacak?

**Solution:**
```prisma
// Database: Cascade delete
card Card @relation(fields: [cardId], references: [id], onDelete: Cascade)

// UI: Real-time sync via Zustand
subscribeToCardChanges((card) => {
  if (card.deleted) {
    removeFromTimeline(card.id);
    showToast(`"${card.title}" removed from timeline (card deleted)`);
  }
});
```

#### **Challenge 4: Mobile UX**
**Problem:** Küçük ekranda timeline nasıl görünecek?

**Solution:**
- Stacked card view (vertical list)
- Collapsible time blocks (Morning/Afternoon/Evening)
- Swipe gestures (left: prev day, right: next day)
- Bottom sheet modals (task details)
- Quick actions (long-press menu)

---

### 🎓 11. Best Practices

**For Users:**
1. ⏰ **Morning Planning:** Her sabah 5-10 dk timeline plan et
2. 🎯 **Realistic Estimates:** İlk hafta %120 uzun tahmin et
3. 🍅 **Use Pomodoro:** Odaklanma için 25 dk bloklar
4. ✅ **Review Daily:** Gün sonunda ne tamamlandı gözden geçir
5. 📊 **Weekly Reflection:** Hangi günler verimli, hangileri değil?

**For Developers:**
1. 🔄 **Real-time Sync:** WebSocket veya polling (her 30 saniye)
2. ⚡ **Optimistic Updates:** Instant UI feedback
3. 💾 **Auto-save:** Her değişiklik otomatik kaydet
4. 🎨 **Smooth Animations:** Framer Motion kullan
5. ♿ **Accessibility:** Keyboard navigation, screen reader support

---

### 📖 12. Glossary

| Term | Definition |
|------|------------|
| **Timeline** | Günlük görev zaman çizelgesi |
| **Time Slot** | Belirli saat aralığı (ör: 09:00-10:00) |
| **Time Block** | Görev için ayrılan zaman bloğu |
| **Unscheduled Pool** | Henüz planlanmamış kartlar listesi |
| **Pomodoro** | 25 dk odaklanma + 5 dk mola tekniği |
| **Buffer Time** | Görevler arası geçiş süresi |
| **Actual Time** | Gerçekte harcanan süre |
| **Estimated Time** | Tahmin edilen süre |
| **Completion Rate** | Tamamlanan görev yüzdesi |
| **Estimation Accuracy** | Tahmin doğruluk oranı |

---

## 🎬 Conclusion

**Daily Task Timeline** özelliği, ÜLGEN'i rakiplerinden ayıracak **inovatif bir farklılaştırıcı**. Sadece görev yönetimi değil, **zaman yönetimi** ve **verimlilik** odaklı bir yaklaşım sunuyor.

### 🌟 **Neden Özel?**

1. **Holistic View:** Tüm board'lar tek yerde
2. **Actionable:** Sadece görüntüleme değil, aktif yönetim
3. **Measurable:** Verimlilik metrikleri ve insights
4. **Flexible:** Her çalışma stiline uyum sağlar
5. **Growth:** AI ve otomasyon için foundation

### 🚀 **Next Steps**

1. ✅ Doküman hazırlandı
2. ⏭️ Prototype UI mockup (Figma)
3. ⏭️ Database migration
4. ⏭️ MVP implementation
5. ⏭️ User testing & iteration

---

**Sorular ve Feedback:**
- 💬 Hangi timeline görünümünü tercih edersiniz? (A/B/C)
- 💬 Hangi özellikler MVP'ye dahil olmalı?
- 💬 Başka hangi use case'ler var?
- 💬 UI mockup için Figma yapalım mı?

**Prepared by:** AI Assistant  
**Date:** 1 Ocak 2026  
**Version:** 1.0  
**Status:** 📋 Concept Document (Ready for Implementation)
