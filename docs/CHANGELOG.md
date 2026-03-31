# Changelog - ÜLGEN

Projedeki tüm önemli değişiklikler bu dosyada kaydedilir.

---

## [2.5.0] - 2026-03-31

### ✨ Added (Yeni Eklenenler)
- **Card Dependencies / Kart Bağımlılıkları (#25)**
- `CardDependency` Prisma modeli: `blockingCardId`, `blockedCardId`, `@@unique` + `@@index`
- `Card` modeline `blockingFor` ve `blockedBy` iki yönlü relation
- GET/POST `/api/cards/[id]/dependencies` — bağımlılık listeleme ve ekleme
- DELETE `/api/cards/[id]/dependencies/[depId]` — bağımlılık silme
- BFS tabanlı dairesel bağımlılık tespiti (server-side, POST sırasında)
- `DependencyBadge` component: kart önizlemesinde kırmızı kilit (bloke) + sarı kilit (bloklayan)
- `DependencyPicker` component: modal içinde bağımlılık ekleme/silme, kart arama
- `CardDetailModal`: "Bağımlılıklar" bölümü eklendi (DependencyPicker)
- `card-item.tsx`: DependencyBadge entegrasyonu (`_count.blockedBy`, `_count.blockingFor`)
- `timeline-task-card.tsx`: bloke uyarı bandı (kırmızı, bekleyen kart sayısı)
- `BoardService.getBoardById`: kartlara `_count { blockedBy, blockingFor }` eklendi
- `TimelineService TASK_INCLUDE`: kart sorguya `_count { blockedBy, blockingFor }` eklendi

### 📦 Dependencies
- Eklenen: yok (yeni Prisma model, yeni API route'lar)

---

## [2.4.0] - 2026-03-08

### Added (Yeni Eklenenler)
- **Personal Analytics Dashboard (#26)** - analytics sayfasi
- GET /api/analytics/personal?range=week|month|3month|all
- WeeklySummaryChart, BoardDistributionChart, HourlyHeatmap, EstimationAccuracyChart, StatsCard
- AnalyticsDashboard ana container (range secici ile)
- Navbar: Analitik linki eklendi

### Dependencies
- Eklendi: recharts@3.8.0

---

## [2.3.0] - 2026-03-08

### Added (Yeni Eklenenler)
- **Kart Tamamlandi / Board-Level Completion (#32)**
- `isCompleted Boolean @default(false)` Card modeline eklendi (pnpm db:push ile sync)
- Timeline unscheduled pool: `isCompleted: false` filtresi -- tamamlananlar havuzdan dislandi
- CardItem: sag ust kosede Circle/CheckCircle2 toggle, ustu cizili baslik, yesil rozet
- CardDetailModal: "Karti Tamamlandi Olarak Isaretele" toggle butonu + aciklama notu
- Board header: "Tamamlananlar" toggle (aktifken Kanban ve Matris'te gizlenir)
- Optimistic UI: toggle store'u aninda gunceller, API basarisizsa revert eder

### Changed (Degistirilenler)
- `updateCardSchema`: `isCompleted: z.boolean().optional()` eklendi
- `Card` TypeScript interface'ine `isCompleted: boolean` eklendi
- `timeline.service.ts -> getUnscheduledCards`: `isCompleted: false` filtresi eklendi
- `boards/[id]/page.tsx`: `hideCompleted` state + bilesik filtre (label + completed)

---

## [2.2.0] - 2026-03-07

### Added (Yeni Eklenenler)
- **Labels / Etiketler (#7):** Board seviyesinde etiket tanımlama, karta ekleme/cikarma, label filtresi
- Label ve CardLabel Prisma modelleri (junction tablo, cascade delete)
- GET/POST /api/boards/[id]/labels
- PATCH/DELETE /api/labels/[id]
- POST /api/cards/[id]/labels (upsert ile guvenli)
- DELETE /api/cards/[id]/labels/[labelId]
- LabelBadge bileseni: minimal renkli serit + isimli mod
- LabelPicker bileseni: dropdown CRUD + toggle - kart detay modalinda
- Board header label filtre bar: etiket chipler, aktif filtre vurgusu
- Kanban ve Matris gorununumlerine label filtresi
- Import API: Trello labellari artik Label + CardLabel modellerine aktariliyor

### Changed (Degistirilenler)
- board.store.ts: activeLabelFilter, setLabelFilter, addBoardLabel, updateBoardLabel, deleteBoardLabel eklendi
- card-item.tsx, matrix-card.tsx, timeline-task-card.tsx, unscheduled-pool.tsx: Label[] ile guncellendi
- card-detail-modal.tsx: interaktif LabelPicker entegre edildi
- boards/[id]/page.tsx: label filtre bar + filteredLists/filteredCards eklendi

### New Files
- app/api/boards/[id]/labels/route.ts
- app/api/labels/[id]/route.ts
- app/api/cards/[id]/labels/route.ts
- app/api/cards/[id]/labels/[labelId]/route.ts
- components/label/label-badge.tsx
- components/label/label-picker.tsx

---

## [2.1.0] - 2026-03-07

### Added (Yeni Eklenenler)
- **Eisenhower Matrix (#23):** Board görünümüne "Matris" sekmesi eklendi
- `Card.eisenhowerQuadrant` veritabanı alanı (nullable String): `DO | PLAN | DELEGATE | DELETE`
- `EisenhowerMatrix` bileşeni: 2x2 grid, @dnd-kit DragOverlay, DroppableQuadrant
- `MatrixCard` bileşeni: sol kenar renk çizgisi, etiket, due date, atanan üye özeti
- Board page header'a Kanban/Matris toggle butonu
- Optimistic UI: kadran değişimi anında store'a yansır, hata durumunda revert

### New Files
- `components/matrix/eisenhower-matrix.tsx`
- `components/matrix/matrix-card.tsx`

---

## [2.0.0] - 2026-03-07

### Added (Yeni Eklenenler)
- **Timeline Phase 3 (#22):** Real-time sayaç, Pomodoro timer, haftalık görünüm, günler arası taşıma, günlük rapor

### New Files
- `components/timeline/pomodoro-timer.tsx`
- `components/timeline/weekly-view.tsx`
- `components/timeline/daily-report-modal.tsx`

---

## [1.9.0] - 2026-03-07

### Added (Yeni Eklenenler)
- **Checklist (Kontrol Listeleri):** Checklist + ChecklistItem modelleri, 4 API route, 3 component, card detail entegrasyon

---

## [1.8.1] - 2026-03-06

### Fixed (Düzeltilen Build Hataları)
- react/no-unescaped-entities, noUnusedLocals, UploadThing portability, TypeScript tip hataları

---

## [1.8.0] - 2026-03-06

### Added
- Timeline Phase 2: Drag & Drop ile saat değiştirme, Conflict Modal, board bazlı renk kodlaması

---

## [1.7.0] - 2026-03-06

### Added
- Due Dates: Card modeline dueDate + dueComplete alanları, DueDateBadge ve DueDatePicker

---

## [1.6.0] - 2026-03-05

### Added
- Daily Task Timeline (Cross-Board Time Planning) - Phase 1 MVP

---

## [1.5.0] - 2026-03-04

### Added
- File Attachments: UploadThing CDN entegrasyonu

---

## [1.4.0] - 2026-01-01

### Added
- Kart Yorumları (Comments)

---

## [1.3.0] - 2026-01-01

### Added
- Drag & Drop (@dnd-kit)

---

## [1.2.0] - 2026-01-01

### Added
- Trello JSON Import

---

## [1.1.0] - 2026-01-01

### Added
- Kart Detay Modal + Optimistic UI

---

## [1.0.0] - 2025-12-31

### Added
- İlk Kurulum: Board/List/Card CRUD + Auth
