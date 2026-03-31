conversation'a başlamadan önce projeyi incelemek istedin. Her konuşmada bunu yapmanın maliyeti ne kadardır. Contex boyutunu meşgul etmeden bunun aynı proje için kolay, güvenilir, sürdürülebilir bir yolu var mı
Çok iyi bir soru. Önce maliyeti analiz edelim:

Mevcut Keşif Maliyeti (Her Konuşma Başı)
Dosya	Satır	Neden Okunuyor
CLAUDE.MD	375	Kurallar — ama zaten auto-loaded (system reminder), tekrar okumaya gerek yok
TODOS.md	794	Sıradaki görevi anlamak için
schema.prisma	222	Model alanlarını görmek için
types/index.ts	177	TypeScript tiplerini anlamak için
package.json	53	Bağımlılıkları kontrol için
Toplam: ~1600 satır = ~12.000 token her konuşma başı.

Neden Bunu Yaptım?
Çünkü MEMORY.md yeterince ayrıntılı değildi. Sadece "v1.7.0: Due Dates" gibi üst düzey bilgiler var — ama geliştirme sırasında neye baktığımı bilmek için dosyaları okumak zorunda kaldım.

Çözüm: MEMORY.md'yi "Proje Özet Paneli" Olarak Kullan
MEMORY.md zaten her konuşmada otomatik yükleniyor, yani maliyetsiz. Onu yeterince zengin tutarsak diğer dosyaları açmaya gerek kalmaz.

MEMORY.md'ye şunlar eklenirse:


## Prisma Schema Özeti (Card modeli - kritik alanlar)
- id, title, description, position, dueDate, dueComplete, labels[]
- listId → List, creatorId → User, assignees → User[]
- comments[], attachments[], timelineTasks[]

## API Endpoints
- PATCH /api/cards/[id] → updateCardSchema (title, desc, dueDate, dueComplete, labels)
- POST /api/cards/[id]/comments → yorum ekle
- GET/DELETE /api/attachments/[id] → dosya yönetimi
- GET/POST /api/timeline → timeline görev listesi

## Store Actions (board.store.ts)
- updateCard(cardId, Partial<Card>)
- addAttachment / removeAttachment
- moveCard(cardId, targetListId, position)
Pratik Öneri
Şu an ihtiyaç var mı? Hayır — bu konuşmada projeyi tanıdım, bağlam dolu.

Ne zaman gerekir? Bir sonraki konuşmada yeni bir özellik geliştirmeden önce.

MEMORY.md'yi genişleteyim mi şimdi? Bu yatırım sonraki tüm konuşmaları ucuzlatır — tek seferlik ~5 dakikalık iş, her sonraki konuşmada ~12.000 token tasarruf sağlar.

Memory.md yi genişletelim. Her geliştirme yeni conversation'da yapılsın istiyorum. @docs/CLAUDE.MD dosyasından alınması gerekenleride ekle
MEMORY.md'yi kapsamlı hale getirelim. Şu anki 70 satırı yaklaşık 190 satıra (200 limit'e yakın, kesilmeyecek şekilde) çıkaracağım.

Read c:\Users\turki\.claude\projects\c--Users-turki-Documents-PROJELER--LGEN-trello-clone\memory\MEMORY.md
Write c:\Users\turki\.claude\projects\c--Users-turki-Documents-PROJELER--LGEN-trello-clone\memory\MEMORY.md
114 lines
# ÜLGEN Trello Clone — Proje Memory

## Stack
- Monorepo: pnpm workspaces + Turborepo | Web: `apps/web` (Next.js 14, TS) | DB: `packages/database` (Prisma + PostgreSQL)
- Auth: NextAuth.js | State: Zustand | UI: Radix UI + TailwindCSS | File: UploadThing | Validasyon: Zod

## Tamamlanan Özellikler
- v1.0.0: Board/List/Card CRUD + Auth
- v1.2.0: Trello JSON Import
- v1.3.0: Drag & Drop (@dnd-kit, PointerSensor 8px threshold)
- v1.4.0: Kart Yorumları (Comment model, yeni→eski sıra)
- v1.5.0: Dosya Ekleri (UploadThing CDN, maks 8MB)
- v1.6.0: Daily Task Timeline Phase 1 (cross-board, TimelineTask model, /timeline route)
- v1.7.0: Due Dates (dueComplete Boolean, DueDateBadge renk mantığı, DueDatePicker)

## Sonraki Özellik (TODOS.md sırası)
- **#21 Timeline Phase 2**: drag&drop ile saat değiştirme, çakışma modal, board bazlı renk
- **#7 Labels**: Board-level label tanımlama, karta ekleme/çıkarma, filtre
- **#17 Dark Mode**: next-themes, Tailwind dark: variants

## Prisma Schema Özeti (kritik alanlar)
```
Card: id, title, description, position, dueDate(DateTime?), dueComplete(Boolean=false),
      labels(String[]), listId, creatorId, assignees[], comments[], attachments[], timelineTasks[]

List: id, title, position, boardId, cards[]
Board: id, title, description, background, ownerId, lists[], members[], timelineTasks[]
BoardMember: id, role(owner|admin|member), boardId, userId
Comment: id, content, cardId, authorId, createdAt, updatedAt
Attachment: id, name, url, key(unique), mimeType, size, cardId, userId
TimelineTask: id, scheduledDate, startTime, endTime, estimatedMinutes(=60),
              status(PLANNED|IN_PROGRESS|PAUSED|COMPLETED|SKIPPED),
              actualStartTime?, actualEndTime?, actualMinutes?, userId, cardId, boardId
```

## API Endpoints
```
POST   /api/auth/register
GET    /api/boards                    → kullanıcının board'ları
POST   /api/boards
GET    /api/boards/[id]               → board + lists + cards
PATCH  /api/boards/[id]
DELETE /api/boards/[id]
POST   /api/lists                     → createListSchema
PATCH  /api/lists/[id]
DELETE /api/lists/[id]
POST   /api/cards                     → createCardSchema
GET    /api/cards/[id]
PATCH  /api/cards/[id]                → updateCardSchema (title,desc,dueDate,dueComplete,labels,position)
DELETE /api/cards/[id]
POST   /api/cards/[id]/move           → moveCardSchema (listId, position)
GET    /api/cards/[id]/comments
POST   /api/cards/[id]/comments
PUT    /api/comments/[id]
DELETE /api/comments/[id]
GET    /api/cards/[id]/attachments
POST   /api/cards/[id]/attachments    → UploadThing yükledikten sonra metadata kaydet
DELETE /api/attachments/[id]          → CDN + DB siler
GET    /api/timeline?date=YYYY-MM-DD  → günün görevleri
POST   /api/timeline                  → createTimelineTaskSchema
PATCH  /api/timeline/tasks/[id]       → action: start|pause|complete|skip
DELETE /api/timeline/tasks/[id]
GET    /api/timeline/unscheduled      → henüz planlanmamış kartlar
POST   /api/import                    → Trello JSON import
```

## Zustand Store Actions
```
board.store.ts:
  setBoard(board) | updateBoard(partial) | setLoading | setError
  addList | updateList(listId, partial) | deleteList
  addCard | updateCard(cardId, partial) | deleteCard | moveCard(cardId, targetListId, pos)
  addAttachment(cardId, attachment) | removeAttachment(cardId, attachmentId)

timeline.store.ts: (apps/web/store/timeline.store.ts'e bak)
  setTasks | addTask | updateTask | removeTask | setStats | setLoading
```

## Çalıştırma & .env
```bash
pnpm install --force   # yeni bilgisayarda
pnpm db:push           # schema sync (PostgreSQL çalışıyor olmalı)
pnpm dev               # geliştirme
pnpm db:studio         # Prisma Studio
```
- `/packages/database/.env` → `DATABASE_URL`
- `/apps/web/.env` → `DATABASE_URL` + `NEXTAUTH_URL` + `NEXTAUTH_SECRET` + `UPLOADTHING_TOKEN`

## CLAUDE.MD — Geliştirme Süreci (Her Konuşmada Uygula)
1. **Keşif**: MEMORY.md yeterli → dosya okumadan başla; eksik varsa hedef dosyayı oku
2. **Plan**: Ne/hangi dosyalar/riskler → kullanıcıya sun, **onay al**
3. **Uygula**: Atomik adımlar, try/catch, Türkçe hata mesajları
4. **Test**: Manuel senaryo listesi yaz (test framework yok)
5. **Dokümantasyon**: CHANGELOG.md + `docs/daily-log/YYYY-MM-DD.md` + MEMORY.md güncelle

## CLAUDE.MD — Yasaklar (Asla)
- `any` type | hardcoded credential | console.log production'da
- Onaysız refactor | hata mesajı yutma `.catch(()=>{})` | TODO bırakıp geçme
- pnpm dışı paket yöneticisi | mevcut çalışan kodu onaysız silme

## CLAUDE.MD — Görev Sonu Kontrol
```
☐ TypeScript hatası yok (tsc --noEmit)   ☐ Güvenlik: input validate, secrets .env'de
☐ CHANGELOG.md güncellendi               ☐ daily-log/YYYY-MM-DD.md oluşturuldu
☐ MEMORY.md güncellendi                  ☐ Sonraki adımlar belirlendi
```

## Mimari Kurallar
- Service sınıfları: `apps/web/services/*.service.ts` (statik metodlar)
- Tüm API route'larda board member erişim kontrolü zorunlu
- Optimistic UI: store'u anında güncelle → API başarısızsa revert
- UploadThing: CDN'e yükle → metadata Prisma'ya kaydet (iki aşama)
- pnpm PATH (Windows): `export PATH="$PATH:/c/Users/turki/AppData/Roaming/npm"`
Satır sayısını doğrulayalım (200 limit):

Bash MEMORY.md satır sayısını kontrol et
IN
wc -l "c:/Users/turki/.claude/projects/c--Users-turki-Documents-PROJELER--LGEN-trello-clone/memory/MEMORY.md"

OUT
113 c:/Users/turki/.claude/projects/c--Users-turki-Documents-PROJELER--LGEN-trello-clone/memory/MEMORY.md
113 satır — 200 limitinin çok altında, gelecek özellikler için bol alan var.

Ne değişti ve neden
Eski MEMORY.md → 73 satır, eksik:

Schema alanları yok → schema.prisma okunmak zorundaydı
API listesi yok → route dosyaları okunmak zorundaydı
Store action'ları yok → board.store.ts okunmak zorundaydı
Sonraki özellik yok → TODOS.md (794 satır!) okunmak zorundaydı
CLAUDE.MD kuralları yok → CLAUDE.MD okunmak zorundaydı
Yeni MEMORY.md → 113 satır, yeterli:

Prisma modeli alanları → schema.prisma okumak gerekmez
Tüm API endpoint'ler → route dosyaları okumak gerekmez
Zustand action'ları → store dosyaları okumak gerekmez
Sonraki 3 özellik (TODOS.md'den) → TODOS.md okumak gerekmez
CLAUDE.MD özeti (sürec + yasaklar + kontrol listesi) → CLAUDE.MD tekrar okunmak gerekmez
Yeni bir konuşmada artık şunlar yeterli:

MEMORY.md otomatik yükleniyor ✅
CLAUDE.MD sistem olarak yükleniyor ✅
Geliştirme hemen başlayabilir — sıfır ekstra dosya okuma