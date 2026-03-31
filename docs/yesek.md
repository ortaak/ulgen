# ÜLGEN - Yapılacaklar Listesi

**Son Güncelleme:** 1 Ocak 2026

---

## 🎯 Öncelik Sırası

### 🔴 Yüksek Öncelik

#### ✅ 1. Veri Aktarma Sistemi
**Durum:** ✅ Tamamlandı (v1.2.0)
- Trello JSON export formatını destekleme
- Diğer platformlardan (Asana, Jira, vb.) veri aktarma
- Board, Liste ve Kartları import etme
- Kullanıcı eşleştirme (email bazlı)
- Upload arayüzü ve validation
- Import preview özelliği

---

### 🟠 Orta Öncelik

#### ✅ 2. Drag & Drop (Sürükle-Bırak) 🎨
**Durum:** ✅ Tamamlandı (v1.3.0)
**Teknoloji:** @dnd-kit/core 6.3.1, @dnd-kit/sortable 10.0.0

**Özellikler:**
- ✅ Kartları listeler arası taşıma
- ✅ Kartların liste içinde sıralaması
- ✅ Smooth animasyonlar ve görsel feedback
- ✅ PointerSensor ile hassas kontrol (8px activation distance)
- ✅ Optimistic UI güncellemeleri

**Tamamlanan Dosyalar:**
- ✅ `apps/web/app/(dashboard)/boards/[id]/page.tsx` - DndContext wrapper
- ✅ `apps/web/components/list/list.tsx` - Droppable zone
- ✅ `apps/web/components/card/card-item.tsx` - Draggable card
- ✅ `apps/web/app/api/cards/[id]/move/route.ts` - Move API endpoint (zaten mevcuttu)
- ✅ Store güncellemeleri (optimistic updates zaten vardı)

---

#### 3. Kart Yorumları 💬
**Durum:** 🔄 Devam Ediyor (v1.4.0) aşağıda tamamlandı bilgisi var
**Tahmini Süre:** 3-4 saat

**Özellikler:**
- Karta yorum ekleme
#### ✅ 3. Kart Yorumları 💬
**Durum:** ✅ Tamamlandı (v1.4.0)
**Teknoloji:** Prisma, date-fns

**Tamamlanan Özellikler:**
- ✅ Karta yorum ekleme
- ✅ Yorumları listeleme (yeni → eski)
- ✅ Yorum düzenleme (sadece sahibi)
- ✅ Yorum silme (sahibi veya board owner)
- ✅ Avatar gösterimi ve zaman formatı
- ✅ Trello import desteği

**Tamamlanan Yapılacaklar:**
- ✅ Schema: Comment model eklendi
- ✅ API: `/api/cards/[id]/comments` (GET, POST)
- ✅ API: `/api/comments/[id]` (PUT, DELETE)
- ✅ Component: `CommentList` ve form
- ✅ Component: `CommentItem` with edit/delete
- ✅ Card detail modal'a entegrasyon
- ✅ Import API yorumları destekliyor

**İleride Eklenebilir:**
- Mention özelliği (@username)
- Markdown desteği

---

#### 4. Due Dates (Bitiş Tarihleri) ⏰
**Tahmini Süre:** 2-3 saat

**Özellikler:**
- Karta bitiş tarihi ekleme
- Başlangıç tarihi (optional)
- Tarih hatırlatıcısı
- "Tamamlandı" işaretleme
- Renkli gösterim (yaklaşan: sarı, geçmiş: kırmızı)
- Takvim picker UI

**Yapılacaklar:**
- [ ] Schema: Card model'e due, dueComplete, start alanları ekle
- [ ] API: Card update endpoint'ine due date desteği
- [ ] Component: `DatePicker` (shadcn/ui date picker)
- [ ] Component: `DueDateBadge` (kart üzerinde gösterim)
- [ ] Card detail'a due date section
- [ ] Import API'de due date desteği

---

#### 5. Checklist (Kontrol Listeleri) ✅
**Tahmini Süre:** 3-5 saat

**Özellikler:**
- Checklist oluşturma/düzenleme/silme
- CheckItem ekleme/çıkarma
- Tamamlanma yüzdesi gösterimi (3/5)
- Checkbox işaretleme/kaldırma
- Sıralama (position based)

**Yapılacaklar:**
- [ ] Schema: Checklist ve ChecklistItem modelleri
  ```prisma
  model Checklist {
    id        String         @id @default(cuid())
    name      String
    cardId    String
    position  Int
    card      Card           @relation(fields: [cardId], references: [id], onDelete: Cascade)
    items     ChecklistItem[]
    createdAt DateTime       @default(now())
  }
  
  model ChecklistItem {
    id          String    @id @default(cuid())
    name        String
    checked     Boolean   @default(false)
    position    Int
    checklistId String
    checklist   Checklist @relation(fields: [checklistId], references: [id], onDelete: Cascade)
    createdAt   DateTime  @default(now())
  }
  ```
- [ ] API: `/api/cards/[id]/checklists` endpoints
- [ ] API: `/api/checklists/[id]/items` endpoints
- [ ] Component: `ChecklistManager`
- [ ] Component: `ChecklistItem` with checkbox
- [ ] Progress bar component
- [ ] Card detail'a entegrasyon
- [ ] Import API'de checklist desteği

---

#### ✅ 6. File Attachments (Dosya Ekleri) 📎
**Durum:** ✅ Tamamlandı (v1.5.0)
**Teknoloji:** UploadThing 7.7.4, @uploadthing/react 7.3.3

**Tamamlanan Özellikler:**
- ✅ Dosya/resim upload (drag & drop veya tıklama)
- ✅ Resimler için thumbnail önizleme
- ✅ Dosya tipi ikonları (PDF, Word, Excel)
- ✅ Dosya indirme ve yeni sekmede açma
- ✅ Dosya silme (yükleyen veya board sahibi)
- ✅ Desteklenen formatlar: Resimler, PDF, Word, Excel (maks. 8MB)
- ✅ Optimistic UI güncellemeleri (Zustand store)
- ✅ UploadThing CDN'den fiziksel silme

**Tamamlanan Yapılacaklar:**
- ✅ Schema: `Attachment` modeli eklendi (`key @unique` ile)
- ✅ File storage: UploadThing CDN
- ✅ API: `GET/POST /api/cards/[id]/attachments`
- ✅ API: `DELETE /api/attachments/[id]` (CDN + DB)
- ✅ Component: `AttachmentList`, `AttachmentUpload`, `AttachmentItem`
- ✅ Resim thumbnail + dosya ikonu
- ✅ Card detail'a entegrasyon

**İleride Eklenebilir:**
- Attachment'ı kart kapağı olarak ayarlama (Card Cover özelliği ile)
- Import API'de attachment URL desteği

---

#### 7. Labels (Etiketler) 🏷️
**Tahmini Süre:** 2-3 saat

**Özellikler:**
- Board seviyesinde label tanımlama
- Label oluşturma/düzenleme/silme
- Renk seçimi (10+ renk)
- İsimlendirme
- Karta label ekleme/çıkarma
- Label ile filtreleme

**Yapılacaklar:**
- [ ] Schema: Label ve CardLabel modelleri
  ```prisma
  model Label {
    id      String      @id @default(cuid())
    name    String
    color   String
    boardId String
    board   Board       @relation(fields: [boardId], references: [id], onDelete: Cascade)
    cards   CardLabel[]
  }
  
  model CardLabel {
    cardId  String
    labelId String
    card    Card   @relation(fields: [cardId], references: [id], onDelete: Cascade)
    label   Label  @relation(fields: [labelId], references: [id], onDelete: Cascade)
    
    @@id([cardId, labelId])
  }
  ```
- [ ] API: `/api/boards/[id]/labels` endpoints
- [ ] API: `/api/cards/[id]/labels` endpoints
- [ ] Component: `LabelManager`
- [ ] Component: `LabelPicker` with color selection
- [ ] Component: `LabelBadge` (kart üzerinde)
- [ ] Board filter by labels
- [ ] Import API'de label desteği

---

#### 8. Card Cover (Kart Kapağı) 🎨
**Tahmini Süre:** 2-3 saat

**Özellikler:**
- Renk seçimi (solid colors)
- Attachment'tan kapak seçme
- Kapak boyutu (normal/full)
- Parlaklık ayarı

**Yapılacaklar:**
- [ ] Schema: Card model'e cover alanı ekle (JSON)
- [ ] API: Card update endpoint'ine cover desteği
- [ ] Component: `CoverPicker` (color palette)
- [ ] Card item'da cover gösterimi
- [ ] Card detail'a cover section
- [ ] Import API'de cover desteği

---

#### 9. Activity History (İşlem Geçmişi) 📜
**Tahmini Süre:** 3-4 saat

**Özellikler:**
- Tüm işlemleri loglama
- Activity timeline görüntüleme
- İşlem tipleri: createCard, updateCard, moveCard, addComment, vb.
- Board ve kart seviyesinde activity
- "Kim, ne yaptı, ne zaman" bilgisi

**Yapılacaklar:**
- [ ] Schema: Activity model ekle
  ```prisma
  model Activity {
    id        String   @id @default(cuid())
    type      String   // createCard, updateCard, moveCard, addComment, etc.
    data      Json     // Old/new values, related entities
    cardId    String?
    boardId   String
    userId    String
    card      Card?    @relation(fields: [cardId], references: [id], onDelete: Cascade)
    board     Board    @relation(fields: [boardId], references: [id], onDelete: Cascade)
    user      User     @relation(fields: [userId], references: [id])
    createdAt DateTime @default(now())
  }
  ```
- [ ] Middleware/Service: Activity logger
- [ ] API: Activity endpoints (`/api/boards/[id]/activity`)
- [ ] Component: `ActivityTimeline`
- [ ] Component: `ActivityItem` with type-specific rendering
- [ ] Board sidebar'a activity tab
- [ ] Card detail'a activity section

---

#### 10. Card Members (Üye Atama) 👥
**Tahmini Süre:** 2 saat

**Özellikler:**
- Karta üye atama
- Üye çıkarma
- Avatar gösterimi
- Assigned member listesi

**Yapılacaklar:**
- [ ] Schema: CardMember many-to-many relation (zaten Card-User relation var, extend edilecek)
- [ ] API: `/api/cards/[id]/members` endpoints
- [ ] Component: `MemberPicker` dropdown
- [ ] Component: `MemberAvatar` (kart üzerinde)
- [ ] Card detail'a members section
- [ ] Import API'de member assignment desteği

---

---

### 🟡 Yeni Fikirler (Öneri Aşamasında)

#### 11. Search & Filter (Arama & Filtreleme) 🔍
**Tahmini Süre:** 3-4 saat

**Özellikler:**
- Global arama (tüm board'larda)
- Board içinde arama
- Filtreleme: label, member, due date, checklist status
- Gelişmiş arama (description, comments içinde)
- Saved filters (kaydedilmiş filtreler)
- Quick filters (sidebar'da)

**Yapılacaklar:**
- [ ] API: `/api/search` endpoint (full-text search)
- [ ] Component: `SearchBar` with autocomplete
- [ ] Component: `FilterPanel` (sidebar)
- [ ] Component: `SavedFilterManager`
- [ ] Search results page/modal
- [ ] URL query params ile filter state

---

#### 12. Board Templates (Şablonlar) 📋
**Tahmini Süre:** 2-3 saat

**Özellikler:**
- Hazır board şablonları
  - 🎯 Sprint Planning (Backlog, Todo, In Progress, Review, Done)
  - 📝 Kanban (Todo, Doing, Done)
  - 🚀 Product Roadmap (Now, Next, Later, Ideas)
  - 🐛 Bug Tracking (New, Confirmed, In Progress, Fixed, Closed)
  - 💡 Idea Management (Ideas, Evaluating, Approved, In Development)
  - 📚 Content Calendar (Ideas, Writing, Review, Published)
- Template'den board oluşturma
- Custom template kaydetme

**Yapılacaklar:**
- [ ] Schema: BoardTemplate model
- [ ] Seed data: Hazır template'ler
- [ ] API: `/api/templates` endpoints
- [ ] Component: `TemplateGallery`
- [ ] Component: `CreateFromTemplate` dialog
- [ ] Board oluşturma akışına entegrasyon

---

#### 13. Board Background Customization 🎨
**Tahmini Süre:** 2 saat

**Özellikler:**
- Gradient arkaplanlar (10+ hazır gradient)
- Düz renkler (color picker)
- Unsplash entegrasyonu (ücretsiz stok fotoğraflar)
- Kullanıcı yüklediği görseller
- Blur/opacity ayarları

**Yapılacaklar:**
- [ ] Schema: Board model'e background field ekle (JSON)
- [ ] API: Board update endpoint'ine background desteği
- [ ] Component: `BackgroundPicker` (colors, gradients, images)
- [ ] Unsplash API entegrasyonu
- [ ] Board page'de dynamic background rendering

---

#### 14. Command Palette (Komut Paleti) ⌨️
**Tahmini Süre:** 3-4 saat

**Özellikler:**
- Cmd+K / Ctrl+K ile aç
- Fuzzy search
- Hızlı aksiyonlar:
  - Board ara ve git
  - Kart oluştur
  - Kart ara
  - Settings aç
  - Theme değiştir
- Son kullanılan aksiyonlar
- Klavye navigasyonu

**Yapılacaklar:**
- [ ] Component: `CommandPalette` (cmdk library)
- [ ] Global keyboard listener (Cmd+K)
- [ ] Action registry system
- [ ] Fuzzy search implementation
- [ ] Recent actions tracking

---

#### 15. Board Settings & Permissions 🔐
**Tahmini Süre:** 4-5 saat

**Özellikler:**
- Board visibility (Private, Workspace, Public)
- Member invitation (email)
- Role yönetimi:
  - Owner (full access)
  - Admin (manage members, settings)
  - Member (create/edit cards)
  - Viewer (read-only)
- Link sharing (invite link)
- Member removal

**Yapılacaklar:**
- [ ] Schema: BoardMember with role field
- [ ] Schema: BoardInvite model
- [ ] API: `/api/boards/[id]/members` endpoints
- [ ] API: `/api/boards/[id]/invite` endpoints
- [ ] Component: `BoardSettingsModal`
- [ ] Component: `MemberManagement`
- [ ] Component: `InviteMember` dialog
- [ ] Permission checks (middleware)

---

#### 16. Board Statistics & Analytics 📈
**Tahmini Süre:** 4-5 saat

**Özellikler:**
- Board overview dashboard
- Metrikler:
  - Toplam/tamamlanan/bekleyen kart sayısı
  - Bu hafta tamamlanan kartlar
  - Ortalama tamamlanma süresi
  - En aktif kullanıcılar
  - Liste bazında dağılım
- Grafikler:
  - Pie chart (liste dağılımı)
  - Line chart (zaman içinde ilerleme)
  - Bar chart (kullanıcı aktiviteleri)
- Date range seçimi (1 hafta, 1 ay, 3 ay, tümü)

**Yapılacaklar:**
- [ ] API: `/api/boards/[id]/stats` endpoint
- [ ] Component: `BoardStats` dashboard
- [ ] Chart library entegrasyonu (recharts/chart.js)
- [ ] Data aggregation queries
- [ ] Export stats (PDF/CSV)

---

#### 17. Dark Mode (Karanlık Tema) 🌙
**Tahmini Süre:** 2-3 saat

**Özellikler:**
- Light/Dark/System modes
- Smooth transition
- Toggle switch (navbar'da)
- Tüm componentlerde dark mode desteği
- Kullanıcı tercihini localStorage'da kaydet

**Yapılacaklar:**
- [ ] next-themes library entegrasyonu
- [ ] Tailwind dark: variants ekle
- [ ] Component: `ThemeToggle`
- [ ] Dark mode color palette tanımla
- [ ] Tüm componentleri dark mode için güncelle

---

#### 18. Board Archive & Restore 📦
**Tahmini Süre:** 2-3 saat

**Özellikler:**
- Board arşivleme (soft delete)
- Arşivlenmiş board'ları görüntüleme
- Geri yükleme
- Kalıcı silme (30 gün sonra otomatik)
- Liste ve kart seviyesinde arşivleme

**Yapılacaklar:**
- [ ] Schema: Board, List, Card model'e archived field ekle
- [ ] API: Archive/restore endpoints
- [ ] Component: `ArchivedItems` page
- [ ] Board list'te archived filter
- [ ] Auto-delete cron job (30 gün)

---

#### 19. Email Notifications (E-posta Bildirimleri) 📧
**Tahmini Süre:** 4-6 saat

**Özellikler:**
- Bildirim tipleri:
  - Size kart atandı
  - Yorumda mention edildiniz
  - Due date yaklaşıyor
  - Kart taşındı (watching boards)
- Notification preferences (ayarlar)
- Email template'leri (HTML)
- Unsubscribe link

**Yapılacaklar:**
- [ ] Email service setup (Resend/SendGrid/NodeMailer)
- [ ] Schema: NotificationPreference model
- [ ] Email template'leri oluştur
- [ ] API: Notification trigger logic
- [ ] Component: `NotificationSettings`
- [ ] Cron job: Daily digest

---

#### ✅ 20. 🌟 **Daily Task Timeline (Cross-Board Time Planning)** 🕐
**Durum:** ✅ Tamamlandı (v1.6.0 - Phase 1 MVP)
**Tahmini Süre:** 6-8 saat
**Öncelik:** 🔥 Yüksek (İnovatif Özellik)

> **Yenilikçi Konsept:** Kullanıcının tüm board'larından görevleri tek bir zaman çizelgesinde yönetmesi.

**Detaylı Doküman:** [DAILY_TASK_TIMELINE.md](DAILY_TASK_TIMELINE.md)

**Ana Özellikler:**
- Cross-board task agregasyonu
- 24 saatlik zaman çizelgesi (timeline view)
- Time slot'lara kart ekleme/planlama
- Sürükle-bırak ile zamanı düzenleme
- Real-time progress tracking
- Tamamlanan görevler için farklı görünüm
- Zaman blokları (Pomodoro entegrasyonu)
- Geçmiş ve gelecek günleri görüntüleme

**Bakınız:** Detaylı tasarım ve teknik spesifikasyon için [DAILY_TASK_TIMELINE.md](DAILY_TASK_TIMELINE.md) dosyasına bakın.

---

#### 21. Timeline Phase 2 — Enhanced UX 🗓️
**Tahmini Süre:** 2-3 saat
**Bağımlılık:** #20 (Phase 1 ✅)

**Yapılacaklar:**
- [ ] Drag & drop ile zaman slotuna görev taşıma (saat değiştirme)
- [ ] Çakışma durumunda kullanıcıya seçenek sunma (Replace / Move / Cancel modal)
- [ ] Görev bazlı progress bar (başlangıçtan hedefe kalan süre göstergesi)
- [ ] Renk kodlaması board bazlı (her board farklı renk — dinamik)
- [ ] Responsive / mobil görünüm iyileştirmeleri

---

#### 22. Timeline Phase 3 — Advanced Features ⚡
**Tahmini Süre:** 2-3 saat
**Bağımlılık:** #21 (Phase 2)

**Yapılacaklar:**
- [ ] Pomodoro timer (25dk odak + 5dk mola, 4 turdan sonra 15dk uzun mola)
- [ ] Real-time süre sayacı (IN_PROGRESS durumunda canlı sayaç)
- [ ] Haftalık görünüm (7 günlük özet)
- [ ] Günler arası görev taşıma
- [ ] Timeline özet/export (günlük rapor)

---

#### 23. Eisenhower Matrix View (Önemli/Acil Matrisi) 🎯
**Tahmini Süre:** 3-4 saat
**Öncelik:** 🔥 Yüksek (Trello'da yok, güçlü farklılaştırıcı)

> **Konsept:** Kartları 4 kadranda görselleştir: Yap (önemli+acil) / Planla (önemli+acil değil) / Delege Et (acil+önemli değil) / Sil (ikisi de değil). GTD metodolojisi.

**Özellikler:**
- Mevcut board kartlarını 2×2 matrise sürükle-bırak
- Her kadran için renk kodlaması
- Matris görünümü board'a özel (board setting)
- Filtre: Label veya due date bazlı otomatik yerleştirme önerisi
- Export (PDF görüntüsü)

**Yapılacaklar:**
- [ ] Schema: Card model'e `eisenhowerQuadrant` alanı ekle (nullable)
- [ ] API: Card update endpoint'ine quadrant desteği
- [ ] Component: `EisenhowerMatrix` (4 bölümlü grid)
- [ ] Board view'a "Matris" sekmesi ekle
- [ ] Drag & drop ile kadran değiştirme

---

#### 24. Card Aging (Kart Eskime Sistemi) 🕰️
**Tahmini Süre:** 2-3 saat
**Öncelik:** 🟠 Orta (Görsel + davranışsal farklılaştırıcı)

> **Konsept:** Uzun süre dokunulmayan kartlar görsel olarak "solar" — 7 gün → hafif gri, 14 gün → belirgin soluk, 30 gün → tam eskimiş görünüm. "Bu iş neden hâlâ burada?" sorusunun otomatik cevabı.

**Özellikler:**
- Son güncellemeden geçen süreye göre otomatik renk solması
- Hover'da "X gündür güncellenmedi" tooltip
- Board ayarlarından aging aktif/pasif
- Aging threshold ayarlanabilir (varsayılan: 7/14/30 gün)
- "Eski kartları göster" filtresi

**Yapılacaklar:**
- [ ] Card component'e aging hesaplama fonksiyonu
- [ ] TailwindCSS dinamik opacity sınıfları
- [ ] Board settings: aging toggle + threshold
- [ ] Schema: Board model'e `agingEnabled` + `agingThresholds` (JSON)
- [ ] Filter: Aged cards listesi

---

#### 25. Card Dependencies (Kart Bağımlılıkları) 🔗
**Tahmini Süre:** 4-5 saat
**Öncelik:** 🟠 Orta (Proje yönetimi için kritik)

> **Konsept:** "A tamamlanmadan B başlamasın" ilişkisi. Bağımlı kartlar görsel olarak işaretlenir, Timeline ve Gantt ile entegre çalışır.

**Özellikler:**
- Karta "bu kartı bekliyor" bağımlılığı ekleme
- Bağımlılık döngüsü koruması (circular dependency detection)
- Kart detayında bağımlılık listesi
- Board'da bağımlı kartlar görsel ok ile bağlı
- Timeline'da bağımlı görev bloke göstergesi

**Yapılacaklar:**
- [ ] Schema: `CardDependency` modeli (dependentCardId, blockedCardId)
- [ ] API: `/api/cards/[id]/dependencies` endpoints
- [ ] Circular dependency detection algoritması
- [ ] Component: `DependencyBadge` (kart üzerinde)
- [ ] Component: `DependencyPicker` (kart detay)
- [ ] Timeline entegrasyonu: bloke kart uyarısı

---

#### 26. Personal Analytics Dashboard 📊
**Tahmini Süre:** 4-5 saat
**Öncelik:** 🟠 Orta (Timeline Phase 1'in doğal devamı)
**Bağımlılık:** #20 Timeline Phase 1 ✅

> **Konsept:** "En verimli saatlerim 10:00–12:00", "Sprint Board'a haftalık 14 saat harcıyorum", "Tahmin doğruluğum %73." Kişisel verimlilik analitiği — rakip ürünlerde neredeyse yok.

**Özellikler:**
- Haftalık/aylık özet: kaç görev tamamlandı, kaç atlandı
- Board bazlı zaman dağılımı (pasta grafiği)
- Saatlik verimlilik haritası (hangi saatler en üretken)
- Tahmin doğruluğu trendi (estimatedMinutes vs actualMinutes)
- En uzun streak (kesintisiz çalışma günleri)
- Date range seçimi (1 hafta / 1 ay / 3 ay)

**Yapılacaklar:**
- [ ] API: `/api/analytics/personal` endpoint (aggregated queries)
- [ ] Component: `AnalyticsDashboard` sayfası (`/analytics`)
- [ ] Chart library: recharts entegrasyonu
- [ ] Saatlik heatmap komponenti
- [ ] Navbar'a "Analitik" linki

---

#### 27. Focus Mode (Derin Çalışma Modu) 🎯
**Tahmini Süre:** 3-4 saat
**Öncelik:** 🟡 Orta-Düşük
**Bağımlılık:** #20 Timeline Phase 1 ✅

> **Konsept:** Tek görev tam ekran — navbar, sidebar, diğer her şey gizlenir. Ambient ses seçeneği (yağmur, kahvehane, beyaz gürültü). "Do Not Disturb for tasks."

**Özellikler:**
- Timeline'dan "Odaklan" butonu ile aktif görev için tam ekran mod
- Ambient ses seçimi (yağmur / kahvehane / beyaz gürültü / sessizlik)
- Ses Web Audio API ile tarayıcıdan üretilir (CDN gerekmez)
- Pomodoro sayacı entegrasyonu (Timeline Phase 3 ile)
- ESC veya "Çık" ile normal moda dön
- Tarayıcı başlığında aktif görev adı göster

**Yapılacaklar:**
- [ ] Component: `FocusMode` (full-screen overlay)
- [ ] Web Audio API: ambient ses generatörleri
- [ ] Keyboard shortcut: `F` veya `Ctrl+Shift+F`
- [ ] Timeline task card'a "Odaklan" butonu
- [ ] LocalStorage: son seçilen ses tercihi

---

#### 28. Smart Card Templates (Akıllı Kart Şablonları) 📋
**Tahmini Süre:** 3-4 saat
**Öncelik:** 🟡 Orta-Düşük

> **Konsept:** "Bug report" şablonu seçince otomatik checklist, label, due date gelir. Kart oluştururken template seçimi — tekrarlayan iş akışlarını standartlaştırır.

**Özellikler:**
- Hazır şablonlar: Bug Report, Feature Request, Code Review, Meeting Notes, Weekly Task
- Her şablonda: başlık prefix, otomatik checklist, önerilen label, varsayılan süre
- Board seviyesinde özel şablon oluşturma/düzenleme/silme
- Kart oluştururken şablon seçim dropdown'u
- Şablondan oluşturulan kartlar görsel işaretli (optional)

**Yapılacaklar:**
- [ ] Schema: `CardTemplate` modeli (boardId, name, defaultTitle, checklistItems JSON, labels, estimatedMinutes)
- [ ] API: `/api/boards/[id]/templates` endpoints
- [ ] Component: `TemplateSelector` (CreateCard form'unda)
- [ ] Component: `TemplateManager` (Board settings)
- [ ] Seed data: 5 hazır global şablon

---

#### 29. Workload Heatmap (İş Yükü Isı Haritası) 🔥
**Tahmini Süre:** 3-4 saat
**Öncelik:** 🟡 Orta-Düşük
**Bağımlılık:** #26 Personal Analytics

> **Konsept:** GitHub contribution graph gibi — hangi günler ne kadar yoğun çalıştın, hangi günler boştun. Haftalık/aylık görünüm. Tükenmişlik önleme aracı.

**Özellikler:**
- 365 günlük kare ızgara (GitHub benzeri)
- Renk yoğunluğu: tamamlanan dakika × task sayısı
- Hover: o günün özeti (X görev, Y dakika)
- Board bazlı filtre (sadece Sprint Board'u göster)
- En verimli gün/hafta/ay istatistikleri
- "Bu hafta geçen haftadan X% daha verimlisin" bildirimi

**Yapılacaklar:**
- [ ] API: `/api/analytics/heatmap?year=2026` endpoint
- [ ] Component: `WorkloadHeatmap` (SVG bazlı)
- [ ] Analytics sayfasına entegrasyon (#26)
- [ ] Tooltip component (günlük özet)

---

#### 30. Voice Notes (Sesli Notlar) 🎙️
**Tahmini Süre:** 3-4 saat
**Öncelik:** 🟡 Orta-Düşük (Mobilde çok değerli)

> **Konsept:** Kartlara tarayıcı Web API ile sesli not kaydet ve oynat. Özellikle mobilde yazmanın zor olduğu durumlarda — düşünceyi anında yakala. Neredeyse hiçbir task manager'da yok.

**Özellikler:**
- Mikrofon ile kayıt (MediaRecorder API — CDN gerektirmez)
- Kayıt süresi limiti: 5 dakika
- Sesli notlar UploadThing'e yüklenir (audio/webm)
- Kart detayında mini oynatıcı (play/pause/seek)
- Transkripsiyon önerisi (AI ile genişletilebilir)
- Sesli not sayısı kart üzerinde rozet olarak gösterilir

**Yapılacaklar:**
- [ ] UploadThing router'a `audio` tipi ekle
- [ ] API: `/api/cards/[id]/voice-notes` endpoints
- [ ] Schema: `VoiceNote` modeli (cardId, url, key, duration)
- [ ] Component: `VoiceRecorder` (kayıt butonu + dalga animasyonu)
- [ ] Component: `VoiceNotePlayer` (mini audio player)
- [ ] Card detail'a Voice Notes bölümü

---

## 🔮 Gelecek Fikirler

### İleri Seviye Özellikler
- **AI API Entegrasyonu:** 🤖 OpenAI/Anthropic API ile akıllı özellikler
  - Kart açıklaması otomatik oluşturma
  - Akıllı kart önceliklendirme ve kategorizasyon
  - Otomatik etiket önerisi (içerik analizi)
  - Due date tahmini (historical data bazlı)
  - Toplantı notlarından kart oluşturma
  - Kart özetleme ve action item çıkarma
  - Doğal dil ile kart arama ("bu hafta tamamlanacak acil kartlar")
  - AI asistan (chatbot) - proje durumu, istatistikler
  - Otomatik sprint planning önerileri
  - Risk analizi ve bottleneck tespiti
  - **Timeline için AI:** Akıllı görev planlama (optimal zaman önerisi)
- **Keyboard Shortcuts:** Klavye kısayolları (j/k navigation, n new card, vb.)
- **Mobile App:** React Native ile mobile uygulama
- **Offline Mode:** PWA ve offline çalışma
- **Real-time Collaboration:** WebSocket ile gerçek zamanlı güncellemeler
- **Email Integration:** Email'den kart oluşturma
- **Calendar View:** Takvim görünümü (due date'lere göre)
- **Gantt Chart:** Proje timeline görünümü
- **Time Tracking:** Kartlara zaman takibi (Timeline ile entegre)
- **Automation:** Otomatik kurallar ve tetikleyiciler (Butler benzeri)
- **Custom Fields:** Özel alanlar tanımlama
- **Export Options:** PDF, CSV, Excel export
- **API Access:** Public API ve webhooks
- **Integrations:** Slack, GitHub, Google Drive entegrasyonları
- **Pomodoro Timer:** Timeline ile entegre zaman yönetimi

---

## 📊 İstatistikler

**Toplam Özellik:** 30 ana + 15 gelecek fikir = 45
**Tamamlanan:** 5 (Veri Aktarma, Drag & Drop, Yorumlar, Dosya Ekleri, Daily Task Timeline Phase 1)
**Devam Eden:** 0
**Bekleyen:** 25
**Yeni Fikirler:** 10

**Tahmini Toplam Süre:** 60-80 saat

---

## 🎯 Sonraki Adım

En mantıklı devam sırası:
1. ✅ **Veri Aktarma** (Tamamlandı - v1.2.0)
2. ✅ **Drag & Drop** (Tamamlandı - v1.3.0)
3. ✅ **Kart Yorumları** (Tamamlandı - v1.4.0)
4. ✅ **Dosya Ekleri** (Tamamlandı - v1.5.0)
5. ✅ **Daily Task Timeline Phase 1** (Tamamlandı - v1.6.0)
6. 🔥 **Timeline Phase 2** (#21) - Drag & drop, çakışma yönetimi, renk kodlama
7. **Due Dates** (#4) - Timeline ile entegre çalışacak
8. **Labels** (#7) - Kategorize ve filtreleme
9. **Dark Mode** (#17) - Modern UX
10. **Timeline Phase 3** (#22) - Pomodoro, real-time sayaç, haftalık görünüm

---

## 📝 Notlar

- Her özellik için birim testler eklenecek
- Performans optimizasyonları yapılacak
- Accessibility (a11y) standartlarına uyulacak
- Mobile responsive tasarım sağlanacak
- TypeScript tip güvenliği korunacak

---

**Son Revizyon:** 1 Ocak 2026, v1.4.0
