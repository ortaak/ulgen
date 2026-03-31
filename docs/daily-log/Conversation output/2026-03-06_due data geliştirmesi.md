
MErhaba C:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone dizinindeki projeyi geliştirmeye devam edelim. Dikkat etmen gerekenler @docs/CLAUDE.MD dosyasındadır. @docs/TODOS.md  dosyasından 4. maddeyi "Due Dates" geliştirelim. Son geliştirmeyi görmek istersen konuşma çıktısını ekleyebilirim
Tool loaded.
Merhaba! Due Dates özelliğini geliştirmeye başlamadan önce mevcut yapıyı analiz edeyim.

Read c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\packages\database\prisma\schema.prisma
Read c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\types\index.ts
Harika, schema ve tipler görüldü. Şimdi mevcut API ve bileşen yapısına bakalım.

Read c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\lib\validations.ts
Globpattern: "apps/web/app/api/cards/**/*.ts"
Found 5 files
Globpattern: "apps/web/components/card/*.tsx"
Found 3 files
Read c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\components\card\card-detail-modal.tsx
Read c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\components\card\card-item.tsx
Read c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\app\api\cards\[id]\route.ts
Read c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\store\board.store.ts
Read c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\services\card.service.ts
Read c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\lib\utils.ts
Read c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\package.json
Globpattern: "apps/web/components/ui/*.tsx"
Found 5 files
Analiz tamamlandı. Şimdi planı sunayım.

Analiz Sonucu
Zaten mevcut olan (hiç dokunmayacağız):

dueDate alanı Prisma schema'da var (Card modeli)
dueDate TypeScript tipinde var
dueDate Zod validasyonunda var (createCardSchema / updateCardSchema)
CardService.updateCard zaten dueDate kabul ediyor
date-fns kurulu
Eksik olan (yapacaklarımız):

#	Ne	Dosya	İşlem
1	dueComplete alanı	schema.prisma	Boolean @default(false) ekle + pnpm db:push
2	dueComplete tipi	types/index.ts	Card interface'e ekle
3	dueComplete validasyon	lib/validations.ts	updateCardSchema'ya ekle
4	DueDateBadge	components/card/due-date-badge.tsx	YENİ — renkli badge (kırmızı/sarı/gri/yeşil)
5	DueDatePicker	components/card/due-date-picker.tsx	YENİ — styled native date input
6	CardItem	components/card/card-item.tsx	DueDateBadge kullan
7	CardDetailModal	components/card/card-detail-modal.tsx	DatePicker + tamamlandı checkbox ekle
Renk mantığı:

Geçmiş + tamamlanmamış → kırmızı (gecikmiş)
Bugün veya 2 gün içinde → sarı (yaklaşıyor)
İleride → gri (normal)
Tamamlandı → yeşil (ne zaman olursa)
Bağımlılık eklenmeyecek — native <input type="date"> + date-fns yeterli.

Onaylarsan uygulayalım. Devam edelim mi?

Onaylıyorum.  @docs/CLAUDE.MD dosyasını dikkate aldın mı
Evet, CLAUDE.MD'yi dikkate aldım:

Plan → onay → uygulama sürecini izledim
any tipi kullanmayacağım
Hata mesajları Türkçe
Her adım açıklanacak
Sonunda CHANGELOG + daily-log güncellenecek
Hemen başlıyorum.

Tool loaded.
Update Todos

Schema: dueComplete alanı ekle + db:push

Types: Card interface'e dueComplete ekle

Validations: updateCardSchema'ya dueComplete ekle

Yeni: DueDateBadge component oluştur

Yeni: DueDatePicker component oluştur

CardItem: DueDateBadge kullan

CardDetailModal: DatePicker + tamamlandı toggle ekle

Dokümantasyon: CHANGELOG + daily-log + MEMORY güncelle
Adım 1: Schema — dueComplete alanı ekleniyor

Update Todos

Schema: dueComplete alanı ekle + db:push

Types: Card interface'e dueComplete ekle

Validations: updateCardSchema'ya dueComplete ekle

Yeni: DueDateBadge component oluştur

Yeni: DueDatePicker component oluştur

CardItem: DueDateBadge kullan

CardDetailModal: DatePicker + tamamlandı toggle ekle

Dokümantasyon: CHANGELOG + daily-log + MEMORY güncelle
Edit c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\packages\database\prisma\schema.prisma
Edit failed
Schema dosyasını tekrar okuyup düzenliyorum (Edit aracı aynı oturumda okuma gerektiriyor).

Read c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\packages\database\prisma\schema.prisma (lines 109-138)
Edit c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\packages\database\prisma\schema.prisma
Added 1 line
Schema güncellendi. Şimdi db:push ile veritabanına yansıtalım:

Bash Prisma schema değişikliğini veritabanına uygula
IN
cd "c:/Users/turki/Documents/PROJELER/ÜLGEN/trello-clone" && pnpm db:push 2>&1

OUT
> ulgen-trello-clone@1.0.0 db:push C:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone
> pnpm --filter database db:push


> database@1.0.0 db:push C:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\packages\database
> prisma db push

Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
Datasource "db": PostgreSQL database "ulgen_trello", schema "public" at "localhost:5432"

Your database is now in sync with your Prisma schema. Done in 306ms

Running generate... (Use --skip-generate to skip the generators)
[2K[1A[2K[GRunning generate... - Prisma Client
[2K[1A[2K[G✔ Generated Prisma Client (v5.22.0) to .\..\..\node_modules\.pnpm\@prisma+client
@5.22.0_prisma@5.22.0\node_modules\@prisma\client in 71ms
Veritabanı senkronize edildi. Şimdi sıradaki adımlara geçiyorum.

Update Todos

Schema: dueComplete alanı ekle + db:push

Types: Card interface'e dueComplete ekle

Validations: updateCardSchema'ya dueComplete ekle

Yeni: DueDateBadge component oluştur

Yeni: DueDatePicker component oluştur

CardItem: DueDateBadge kullan

CardDetailModal: DatePicker + tamamlandı toggle ekle

Dokümantasyon: CHANGELOG + daily-log + MEMORY güncelle
Adım 2: TypeScript tipi güncelleniyor

Edit c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\types\index.ts
Added 1 line
Update Todos

Schema: dueComplete alanı ekle + db:push

Types: Card interface'e dueComplete ekle

Validations: updateCardSchema'ya dueComplete ekle

Yeni: DueDateBadge component oluştur

Yeni: DueDatePicker component oluştur

CardItem: DueDateBadge kullan

CardDetailModal: DatePicker + tamamlandı toggle ekle

Dokümantasyon: CHANGELOG + daily-log + MEMORY güncelle
Adım 3: Validations — dueComplete ekleniyor

Edit c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\lib\validations.ts
Added 8 lines
Update Todos

Schema: dueComplete alanı ekle + db:push

Types: Card interface'e dueComplete ekle

Validations: updateCardSchema'ya dueComplete ekle

Yeni: DueDateBadge component oluştur

Yeni: DueDatePicker component oluştur

CardItem: DueDateBadge kullan

CardDetailModal: DatePicker + tamamlandı toggle ekle

Dokümantasyon: CHANGELOG + daily-log + MEMORY güncelle
Adım 4: DueDateBadge component oluşturuluyor

Renkli görüntüleme mantığı: geçmiş+tamamlanmamış=kırmızı, 2 gün içinde=sarı, ileride=gri, tamamlandı=yeşil.

Write c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\components\card\due-date-badge.tsx
102 lines
/**
 * DueDateBadge Component
 *
 * Kartın bitiş tarihini renkli rozet olarak gösterir.
 * Renk mantığı (Trello benzeri):
 *  - Tamamlandı        → yeşil
 *  - Geçmiş (gecikmiş) → kırmızı
 *  - Bugün veya 2 gün içinde → sarı (uyarı)
 *  - Daha uzak gelecek → gri (nötr)
 */

'use client';

import { useMemo } from 'react';
import { Calendar } from 'lucide-react';
import { differenceInCalendarDays, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

interface DueDateBadgeProps {
  dueDate: string;
  dueComplete: boolean;
  /** Kompakt mod: sadece kart listesinde ikon + tarih göster */
  compact?: boolean;
}

type DueDateStatus = 'completed' | 'overdue' | 'due-soon' | 'upcoming';

function getDueDateStatus(dueDate: string, dueComplete: boolean): DueDateStatus {
  if (dueComplete) return 'completed';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = parseISO(dueDate);
  const daysUntilDue = differenceInCalendarDays(due, today);

  if (daysUntilDue < 0) return 'overdue';
  if (daysUntilDue <= 2) return 'due-soon';
  return 'upcoming';
}

const STATUS_STYLES: Record<DueDateStatus, string> = {
  completed: 'bg-green-100 text-green-800 border-green-200',
  overdue:   'bg-red-100 text-red-800 border-red-200',
  'due-soon':'bg-yellow-100 text-yellow-800 border-yellow-200',
  upcoming:  'bg-gray-100 text-gray-700 border-gray-200',
};

const STATUS_LABELS: Record<DueDateStatus, string> = {
  completed: 'Tamamlandı',
  overdue:   'Gecikmiş',
  'due-soon':'Yaklaşıyor',
  upcoming:  '',
};

export function DueDateBadge({ dueDate, dueComplete, compact = false }: DueDateBadgeProps) {
  const status = useMemo(
    () => getDueDateStatus(dueDate, dueComplete),
    [dueDate, dueComplete]
  );

  const formattedDate = useMemo(() => {
    const due = parseISO(dueDate);
    return new Intl.DateTimeFormat('tr-TR', {
      day: 'numeric',
      month: 'short',
    }).format(due);
  }, [dueDate]);

  const statusLabel = STATUS_LABELS[status];

  if (compact) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium border',
          STATUS_STYLES[status]
        )}
        title={statusLabel || undefined}
      >
        <Calendar className="h-3 w-3" />
        {formattedDate}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-medium border',
        STATUS_STYLES[status]
      )}
    >
      <Calendar className="h-4 w-4" />
      {formattedDate}
      {statusLabel && (
        <span className="font-semibold">— {statusLabel}</span>
      )}
    </span>
  );
}
Adım 5: DueDatePicker component oluşturuluyor

Update Todos

Schema: dueComplete alanı ekle + db:push

Types: Card interface'e dueComplete ekle

Validations: updateCardSchema'ya dueComplete ekle

Yeni: DueDateBadge component oluştur

Yeni: DueDatePicker component oluştur

CardItem: DueDateBadge kullan

CardDetailModal: DatePicker + tamamlandı toggle ekle

Dokümantasyon: CHANGELOG + daily-log + MEMORY güncelle
Write c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\components\card\due-date-picker.tsx
145 lines
/**
 * DueDatePicker Component
 *
 * Bitiş tarihi seçici + tamamlandı toggle.
 * Harici kütüphane gerektirmez; styled native <input type="date"> kullanır.
 * date-fns ile ISO dönüşümleri yapılır.
 */

'use client';

import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Calendar, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DueDateBadge } from './due-date-badge';

interface DueDatePickerProps {
  /** Mevcut bitiş tarihi (ISO string veya null) */
  dueDate: string | null;
  /** Tamamlandı durumu */
  dueComplete: boolean;
  /** Kaydet callback'i — null göndererek tarihi temizler */
  onSave: (dueDate: string | null, dueComplete: boolean) => Promise<void>;
  /** Kaydedilirken loading göstergesi için */
  disabled?: boolean;
}

export function DueDatePicker({
  dueDate,
  dueComplete,
  onSave,
  disabled = false,
}: DueDatePickerProps) {
  // HTML date input için YYYY-MM-DD formatında tut
  const [dateValue, setDateValue] = useState<string>(
    dueDate ? format(parseISO(dueDate), 'yyyy-MM-dd') : ''
  );
  const [isComplete, setIsComplete] = useState(dueComplete);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // YYYY-MM-DD → ISO 8601 (gece yarısı UTC) dönüşümü
      const isoDate = dateValue ? new Date(dateValue + 'T00:00:00').toISOString() : null;
      await onSave(isoDate, isComplete);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = async () => {
    setDateValue('');
    setIsComplete(false);
    setIsSaving(true);
    try {
      await onSave(null, false);
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges =
    dateValue !== (dueDate ? format(parseISO(dueDate), 'yyyy-MM-dd') : '') ||
    isComplete !== dueComplete;

  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2 text-sm font-medium">
        <Calendar className="h-4 w-4" />
        Bitiş Tarihi
      </Label>

      {/* Mevcut tarih varsa badge göster */}
      {dueDate && (
        <div className="flex items-center gap-2">
          <DueDateBadge dueDate={dueDate} dueComplete={dueComplete} />
        </div>
      )}

      {/* Tarih seçici input */}
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={dateValue}
          onChange={(e) => setDateValue(e.target.value)}
          disabled={disabled || isSaving}
          className={cn(
            'flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm',
            'shadow-sm transition-colors',
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
        />
        {/* Tarihi temizle butonu */}
        {dueDate && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            disabled={disabled || isSaving}
            className="h-9 px-2 text-gray-500 hover:text-red-600"
            title="Tarihi kaldır"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Tamamlandı checkbox — sadece tarih seçilmişse göster */}
      {(dateValue || dueDate) && (
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isComplete}
            onChange={(e) => setIsComplete(e.target.checked)}
            disabled={disabled || isSaving}
            className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
          />
          <span className="text-sm text-gray-700">Tamamlandı olarak işaretle</span>
        </label>
      )}

      {/* Kaydet butonu — değişiklik varsa göster */}
      {hasChanges && dateValue && (
        <Button
          type="button"
          size="sm"
          onClick={handleSave}
          disabled={disabled || isSaving}
          className="mt-1"
        >
          {isSaving ? 'Kaydediliyor...' : 'Tarihi Kaydet'}
        </Button>
      )}

      {/* Tamamlandı değişince otomatik kaydet */}
      {!hasChanges || !dateValue ? null : null}
    </div>
  );
}
DueDatePicker içindeki dead code satırını temizleyeyim:

Edit c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\components\card\due-date-picker.tsx
Removed 2 lines
Update Todos

Schema: dueComplete alanı ekle + db:push

Types: Card interface'e dueComplete ekle

Validations: updateCardSchema'ya dueComplete ekle

Yeni: DueDateBadge component oluştur

Yeni: DueDatePicker component oluştur

CardItem: DueDateBadge kullan

CardDetailModal: DatePicker + tamamlandı toggle ekle

Dokümantasyon: CHANGELOG + daily-log + MEMORY güncelle
Adım 6: CardItem — DueDateBadge'i entegre ediyorum

Edit c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\components\card\card-item.tsx
Modified
Edit c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\components\card\card-item.tsx
Added 1 line
Update Todos

Schema: dueComplete alanı ekle + db:push

Types: Card interface'e dueComplete ekle

Validations: updateCardSchema'ya dueComplete ekle

Yeni: DueDateBadge component oluştur

Yeni: DueDatePicker component oluştur

CardItem: DueDateBadge kullan

CardDetailModal: DatePicker + tamamlandı toggle ekle

Dokümantasyon: CHANGELOG + daily-log + MEMORY güncelle
Adım 7: CardDetailModal — DueDatePicker entegrasyonu

Edit c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\components\card\card-detail-modal.tsx
Edit failed
Read c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\components\card\card-detail-modal.tsx (lines 2-31)
Edit c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\components\card\card-detail-modal.tsx
Modified
Şimdi modalın bitiş tarihi bölümünü (sadece görüntüleme yapan eski kısım) DueDatePicker ile değiştiriyorum:

Edit c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\components\card\card-detail-modal.tsx
Removed 4 lines
Şimdi handleDueDateSave fonksiyonunu ve card state'ini modal'a ekliyorum:

Edit c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\components\card\card-detail-modal.tsx
Added 22 lines
formatDate import'unun modal'da başka kullanımı var mı kontrol ediyorum:

Grep "formatDate" (in c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\components\card\card-detail-modal.tsx)
2 lines of output
formatDate hâlâ kullanılıyor, import'u geri eklemeliyim:

Edit c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\components\card\card-detail-modal.tsx
Added 1 line
Şimdi son halini doğrulayalım:

Read c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\apps\web\components\card\card-detail-modal.tsx
Modal doğru görünüyor. TypeScript derleme kontrolü yapıyorum:

Bash TypeScript derleme hatası kontrolü
IN
cd "c:/Users/turki/Documents/PROJELER/ÜLGEN/trello-clone/apps/web" && npx tsc --noEmit 2>&1 | head -60

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
components/board/create-board-dialog.tsx(111,63): error TS2322: Type '"#0079bf" | "#d29034" | "#519839" | "#b04632" | "#89609e" | "#cd5a91" | "#4bbf6b" | "#00aecc" | "#838c91"' is not assignable to type '"#0079bf"'.
  Type '"#d29034"' is not assignable to type '"#0079bf"'.
components/card/card-item.tsx(44,19): error TS6133: 'e' is declared but its value is never read.
components/list/list.tsx(14,16): error TS6133: 'MoreVertical' is declared but its value is never read.
Hataların tamamı önceden mevcut olan unused import/variable uyarıları. Yeni dosyalarımda hata yok. Kontrol ediyorum:

Bash Sadece yeni/değiştirilen dosyalardaki hataları filtrele
IN
cd "c:/Users/turki/Documents/PROJELER/ÜLGEN/trello-clone/apps/web" && npx tsc --noEmit 2>&1 | grep -E "due-date|card-detail-modal"

OUT
0
Yeni dosyalarımda sıfır TypeScript hatası. Şimdi dokümantasyona geçiyorum.

Update Todos

Schema: dueComplete alanı ekle + db:push

Types: Card interface'e dueComplete ekle

Validations: updateCardSchema'ya dueComplete ekle

Yeni: DueDateBadge component oluştur

Yeni: DueDatePicker component oluştur

CardItem: DueDateBadge kullan

CardDetailModal: DatePicker + tamamlandı toggle ekle

Dokümantasyon: CHANGELOG + daily-log + MEMORY güncelle
Adım 8: Dokümantasyon

Globpattern: "docs/CHANGELOG.md"
Found 1 file
Read c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\docs\CHANGELOG.md
Edit c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\docs\CHANGELOG.md
Edit failed
Read c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\docs\CHANGELOG.md
Edit c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\docs\CHANGELOG.md
Edit failed
Read c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\docs\CHANGELOG.md
Edit c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\docs\CHANGELOG.md
Edit failed
Read c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\docs\CHANGELOG.md
Edit c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\docs\CHANGELOG.md
Edit failed
The Edit tool requires the read to be in the same turn. Let me use Bash for the CHANGELOG prepend instead:

Bash CHANGELOG.md başına v1.7.0 bölümü ekle
IN
cd "c:/Users/turki/Documents/PROJELER/ÜLGEN/trello-clone" && python -c "
content = open('docs/CHANGELOG.md', encoding='utf-8').read()
new_section = '''## [1.7.0] - 2026-03-06

### Added (Yeni Eklenenler)

#### Due Dates (Bitis Tarihleri)

- **Database:** Card modeline dueComplete Boolean @default(false) alani eklendi
- **Yeni Dosyalar:**
  - apps/web/components/card/due-date-badge.tsx - Renkli tarih rozeti
  - apps/web/components/card/due-date-picker.tsx - Styled date input + tamamlandi checkbox

### Changed (Degistirilenler)

- packages/database/prisma/schema.prisma - Card modeline dueComplete alani eklendi
- apps/web/types/index.ts - Card interface e dueComplete: boolean eklendi
- apps/web/lib/validations.ts - updateCardSchema ya dueComplete + nullable dueDate desteği eklendi
- apps/web/components/card/card-item.tsx - DueDateBadge (compact) kullanildi
- apps/web/components/card/card-detail-modal.tsx - DueDatePicker entegre edildi

### Breaking Changes

- Yok. dueComplete @default(false) oldugu icin mevcut kartlar etkilenmez.

### Dependencies

- Eklenen: Yok (date-fns zaten kuruluydu)

---

'''
content = content.replace('## [1.6.0] - 2026-03-05', new_section + '## [1.6.0] - 2026-03-05')
open('docs/CHANGELOG.md', 'w', encoding='utf-8').write(content)
print('Done')
"

OUT
Done
Şimdi daily-log ve MEMORY'yi paralel olarak yazıyorum:

Write c:\Users\turki\Documents\PROJELER\ÜLGEN\trello-clone\docs\daily-log\2026-03-06.md
86 lines
# Gelistirme Logu - 2026-03-06

## Hedef
Due Dates (Bitis Tarihleri) ozelligini gelistirmek — karta bitis tarihi ekleme, tamamlandi isaretleme, renkli gorunum.

## Tamamlanan Isler
- [x] Prisma schema: Card modeline `dueComplete Boolean @default(false)` eklendi
- [x] `pnpm db:push` ile veritabani senkronize edildi
- [x] TypeScript `Card` interface'e `dueComplete: boolean` eklendi
- [x] `updateCardSchema` Zod validasyonuna `dueComplete` + nullable `dueDate` desteği eklendi
- [x] `DueDateBadge` yeni component olusturuldu (renk mantigi ile)
- [x] `DueDatePicker` yeni component olusturuldu (native date input + checkbox)
- [x] `CardItem` guncellendi — DueDateBadge (compact mod) kullaniliyor
- [x] `CardDetailModal` guncellendi — DueDatePicker entegre edildi, `handleDueDateSave` eklendi

## Teknik Detaylar

### Degistirilen Dosyalar
| Dosya | Islem | Aciklama |
|-------|-------|----------|
| packages/database/prisma/schema.prisma | Guncellendi | dueComplete alani eklendi |
| apps/web/types/index.ts | Guncellendi | Card interface e dueComplete eklendi |
| apps/web/lib/validations.ts | Guncellendi | updateCardSchema genisletildi |
| apps/web/components/card/due-date-badge.tsx | Olusturuldu | Renkli tarih rozeti |
| apps/web/components/card/due-date-picker.tsx | Olusturuldu | Tarih secici + checkbox |
| apps/web/components/card/card-item.tsx | Guncellendi | DueDateBadge kullaniliyor |
| apps/web/components/card/card-detail-modal.tsx | Guncellendi | DueDatePicker entegrasyonu |

### Mimari Kararlar

**Neden native `<input type="date">` secildi?**
YAGNI prensibi: `react-day-picker` gibi harici bir kutuphane eklemek yerine, `date-fns` zaten kurulu oldugundan native input + Tailwind styling yeterli. Daha az bundle size, sifir bagimlilık.

**Neden ayri DueDateBadge ve DueDatePicker?**
Single Responsibility: Badge yalnizca gosterim yapar (CardItem ve CardDetailModal icin), Picker ise etkilesim saglar. Bu ayrim, Badge'i gelecekte baska yerlerde de kullanilabilir kilar (ornegin Timeline).

**Neden updateCardSchema .extend() ile genisletildi?**
`dueComplete` `createCardSchema`'da yok (kart olusturulurken false olarak baslar). Sadece update sirasinda gonderilebilir. `.partial().omit().extend()` zinciri bu ayrimi net bir sekilde ifade ediyor.

### Karsılasilan Sorunlar & Cozumler
**Sorun:** Edit araci her cagrilar arasi dosya okumasi gerektiriyor (farkli turn'lerde fail ediyor).
**Cozum:** CHANGELOG.md icin Python one-liner ile prepend yapildi; diger dosyalar ayni turn'de Read+Edit ile islendi.

## Guvenlik Kontrol Listesi
- [x] Input validation: dueDate ISO format, dueComplete boolean — Zod ile dogrulanıyor
- [x] Secrets .env'de — yeni .env degeri yok
- [x] Hata mesajlari hassas bilgi icermiyor — "Bitis tarihi guncellenemedi"
- [x] API erisim kontrolu: CardService mevcut board member kontrolunu muhafaza ediyor

## Test Durumu (Manuel Senaryolar)

1. **Tarih Ekleme:** Kart ac → date picker'a tarih sec → "Tarihi Kaydet" tikla → Badge gorunmeli
2. **Tamamlandi isaretleme:** Tarihli kart ac → checkbox isaretle → kaydet → yesil badge gorunmeli
3. **Tarihi Silme:** Kart ac → X butonuna tikla → badge kaybolmali
4. **Kart Listesi Rengi:**
   - Gecmis tarih → Kirmizi badge
   - Bugun/yakin → Sari badge
   - Uzak gelecek → Gri badge
   - Tamamlandi → Yesil badge
5. **Sifir tarih:** Bos dueDate → badge yok (beklenen)

## Ogretici Notlar

### NEDEN BU YAKLASIM?

**Kullandigim pattern/teknik:** Computed State + Pure Function (getDueDateStatus)

**Ne ise yarar:**
`getDueDateStatus(dueDate, dueComplete)` saf bir fonksiyon — ayni girdi her zaman ayni ciktiyi uretir. Side effect yok, test edilmesi kolay. `useMemo` ile memoize ediliyor cunku her render'da hesaplanmasi gereksiz.

**Alternatif ne olabilirdi:**
Her component icinde inline hesaplama. Ama bu DRY ilkesini bozar — Badge ve baska bir yerde kullanildiginda kodun kopyalanmasi gerekir.

**Bu projeye neden daha uygun:**
DueDateBadge hem CardItem'da hem de DueDatePicker icinde (simdiki durum gosterimi) kullaniliyor. Mantigi tek yerde tutmak, ilerideki bir degisiklikte (ornegin threshold 2 gun yerine 3 gun olsun) tek yerden duzeltme imkani veriyor.

**Daha fazla ogrenilecek kavramlar:**
- `date-fns/differenceInCalendarDays` — UTC offset sorunlarindan bagimsiz gunluk fark hesaplamak icin
- `Intl.DateTimeFormat` — Harici kutuphane olmadan yerellestirilmis tarih formatlama
- Native `<input type="date">` degeri her zaman `YYYY-MM-DD` formatinda — ISO'ya donustururken `T00:00:00` eklemek timezone sorununu onler

## Sonraki Adimlar
- [ ] Labels (#7) — Karta renk etiketi ekleme/cikartma
- [ ] Timeline Phase 2 (#21) — Drag & drop, cakisma yonetimi
- [ ] Due date bilgisini Timeline unscheduled pool'da goster
Read c:\Users\turki\.claude\projects\c--Users-turki-Documents-PROJELER--LGEN-trello-clone\memory\MEMORY.md
Edit c:\Users\turki\.claude\projects\c--Users-turki-Documents-PROJELER--LGEN-trello-clone\memory\MEMORY.md
Added 1 line
Edit c:\Users\turki\.claude\projects\c--Users-turki-Documents-PROJELER--LGEN-trello-clone\memory\MEMORY.md
Added 2 lines
Update Todos

Schema: dueComplete alanı ekle + db:push

Types: Card interface'e dueComplete ekle

Validations: updateCardSchema'ya dueComplete ekle

Yeni: DueDateBadge component oluştur

Yeni: DueDatePicker component oluştur

CardItem: DueDateBadge kullan

CardDetailModal: DatePicker + tamamlandı toggle ekle

Dokümantasyon: CHANGELOG + daily-log + MEMORY güncelle
Tüm adımlar tamamlandı. Özet:

✅ Due Dates (v1.7.0) — Tamamlandı
Ne yapıldı
7 dosya değiştirildi / 2 yeni dosya oluşturuldu:

Dosya	Değişiklik
schema.prisma	dueComplete Boolean @default(false) eklendi + pnpm db:push çalıştırıldı
types/index.ts	Card.dueComplete: boolean eklendi
validations.ts	updateCardSchema'ya dueComplete + nullable dueDate eklendi
due-date-badge.tsx	YENİ — Renkli rozet
due-date-picker.tsx	YENİ — Tarih seçici + checkbox
card-item.tsx	DueDateBadge (compact) entegre edildi
card-detail-modal.tsx	DueDatePicker + handleDueDateSave eklendi
Renk mantığı
Tamamlandı → Yeşil
Geçmiş (gecikmiş) → Kırmızı
2 gün içinde → Sarı (uyarı)
Uzak gelecek → Gri (nötr)
Öğretici not: Neden native <input type="date">?
react-day-picker gibi bir kütüphane eklersek bundle size büyür ve başka bir bağımlılık riski gelir. Oysa date-fns zaten kurulu, ve native input + Tailwind styling bu ihtiyaç için fazlasıyla yeterli. YAGNI prensibi — ihtiyaçtan fazlasını ekleme.

