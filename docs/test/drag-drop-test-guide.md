# 🎨 Drag & Drop Test Rehberi (v1.3.0)

**Test Tarihi:** 1 Ocak 2026  
**Özellik:** Kartları sürükle-bırak ile taşıma

---

## 📋 Test Öncesi Hazırlık

### 1. Gerekli Veriler
Öncelikle test için bir board'a ihtiyacınız var:

```bash
# Mevcut boardlarınızı kontrol edin
cd packages/database
npx prisma studio
```

**Önerilen Test Board:**
- Board: "Test Import Board" (zaten import ettiniz)
- 3 Liste: "Yapılacaklar", "Devam Edenler", "Tamamlananlar"
- 5+ Kart mevcut

---

## 🧪 Test Senaryoları

### ✅ Senaryo 1: Aynı Liste İçinde Kartı Taşıma

**Adımlar:**
1. Bir board sayfasını açın: `/boards/[id]`
2. Herhangi bir listede en az 2 kart olduğundan emin olun
3. Bir kartı **mouse ile tıklayıp basılı tutun**
4. Kartı **aynı liste içinde** yukarı veya aşağı sürükleyin
5. Kartı bırakın

**Beklenen Sonuç:**
- ✅ Kart hareket ederken **opacity 0.5** olmalı (hafif saydam)
- ✅ Kart sürüklenirken **cursor: grabbing** görünmeli
- ✅ Bırakıldığında kart **yeni pozisyonunda** kalmalı
- ✅ Diğer kartlar **yumuşakça** kaymalı (smooth animation)
- ✅ Sayfa yenilense bile **pozisyon korunmalı** (veritabanına kaydedildi)

**Test Komutu (Veritabanı kontrolü):**
```bash
# Kartların position değerlerini kontrol edin
npx prisma studio
# Cards tablosunda position sütununu inceleyin
```

---

### ✅ Senaryo 2: Farklı Listeye Kartı Taşıma

**Adımlar:**
1. Board sayfasında en az **2 liste** görünür olmalı
2. Sol taraftaki bir listeden bir kart seçin
3. Kartı **mouse ile sürükleyerek** sağ taraftaki listeye taşıyın
4. Kartı hedef listenin üzerine bırakın

**Beklenen Sonuç:**
- ✅ Kart **hedef listeye** taşınmalı
- ✅ Eski listeden **kaldırılmalı**
- ✅ Hedef listede **doğru pozisyonda** görünmeli
- ✅ Her iki listede de **smooth animation** olmalı
- ✅ API çağrısı **başarılı** olmalı (Network tab'de `POST /api/cards/[id]/move`)

**Test Komutu (API Response kontrolü):**
```bash
# Browser Developer Tools'u açın (F12)
# Network tab'inde şunu arayın:
POST /api/cards/[card-id]/move
Status: 200 OK
Response: { id, title, listId, position, ... }
```

---

### ✅ Senaryo 3: Çoklu Kart Taşıma

**Adımlar:**
1. Aynı listede **3-4 kart** olsun
2. Üst kısımdaki bir kartı **en alta** sürükleyin
3. Alt kısımdaki bir kartı **en üste** sürükleyin
4. Orta kısımdaki bir kartı **başka listeye** taşıyın

**Beklenen Sonuç:**
- ✅ Her taşıma işlemi **bağımsız** çalışmalı
- ✅ Position değerleri **doğru hesaplanmalı**
- ✅ Hiçbir kart **kaybolmamalı** veya **çakışmamalı**

---

### ✅ Senaryo 4: Hata Durumu Testleri

**Test 4.1: İzin olmayan board'da taşıma**
```bash
# Başka bir kullanıcı ile login olun (eğer mümkünse)
# Başka bir kullanıcının board'unda kart taşımaya çalışın
# Beklenen: 403 Forbidden hatası
```

**Test 4.2: Geçersiz liste ID'si**
```bash
# Developer Tools > Console'da manuel API çağrısı yapın:
fetch('/api/cards/[geçerli-card-id]/move', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ listId: 'geçersiz-id', position: 0 })
})
# Beklenen: 400 Bad Request
```

---

## 🎯 Performans Testleri

### Test 5: Büyük Board Performansı

**Adımlar:**
1. **50+ kart** olan bir board oluşturun (import feature kullanabilirsiniz)
2. Bir kartı **en üstten en alta** sürükleyin
3. Bir kartı **başka listeye** taşıyın

**Beklenen Sonuç:**
- ✅ Drag işlemi **60fps** hızında olmalı (lagless)
- ✅ Animation **smooth** olmalı
- ✅ API response süresi **< 500ms** olmalı

---

## 🔍 Hata Kontrol Listesi

### Backend Kontrolleri
```bash
# Terminal'de backend loglarını kontrol edin
cd apps/web
pnpm dev

# Aşağıdaki logları görebilirsiniz:
# ✅ "POST /api/cards/[id]/move 200" - Başarılı
# ❌ "POST /api/cards/[id]/move 400" - Validation hatası
# ❌ "POST /api/cards/[id]/move 403" - Yetki hatası
```

### Database Kontrolleri
```sql
-- Kartların doğru listede olduğunu kontrol edin
SELECT id, title, listId, position 
FROM "Card" 
WHERE listId = 'test-list-id'
ORDER BY position;
```

### Frontend Kontrolleri
```javascript
// Browser Console'da Zustand store'u kontrol edin
// Store'da güncel state'i görebilirsiniz
```

---

## ✅ Test Sonuç Formu

### Senaryo 1: Aynı Liste İçinde Taşıma
- [ ] Kart sürüklenebiliyor
- [ ] Opacity değişiyor (0.5)
- [ ] Cursor grabbing görünüyor
- [ ] Position kaydediliyor
- [ ] Smooth animation var

### Senaryo 2: Farklı Listeye Taşıma
- [ ] Kart farklı listeye taşınıyor
- [ ] Eski listeden kaldırılıyor
- [ ] API çağrısı başarılı (200 OK)
- [ ] Database'de değişiklik kaydediliyor

### Senaryo 3: Çoklu Kart Taşıma
- [ ] Birden fazla kart taşınabiliyor
- [ ] Position değerleri doğru
- [ ] Çakışma yok

### Senaryo 4: Hata Durumları
- [ ] Yetkisiz erişim engelleniyor (403)
- [ ] Geçersiz data kontrol ediliyor (400)

### Senaryo 5: Performans
- [ ] 50+ kartta lag yok
- [ ] Animation smooth
- [ ] API response < 500ms

---

## 🐛 Sorun Bulursanız

### Kart Taşınmıyor
1. Browser console'u kontrol edin (F12 > Console)
2. Network tab'de API response'u kontrol edin
3. `@dnd-kit` kütüphanelerinin yüklü olduğundan emin olun:
   ```bash
   cd apps/web
   pnpm list @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
   ```

### Position Değerleri Yanlış
1. Prisma Studio'da Card tablosunu açın
2. Position sütunundaki değerleri kontrol edin
3. Eğer hepsi 0 ise, database seed'ini çalıştırın:
   ```bash
   cd packages/database
   pnpm prisma db seed
   ```

### API Hataları
1. Terminal'de backend loglarını kontrol edin
2. NextAuth session'ın aktif olduğundan emin olun (demo@ulgen.com ile login olun)
3. PostgreSQL'in çalıştığını kontrol edin:
   ```bash
   # Windows'ta:
   Get-Service postgresql*
   ```

---

## 📞 Destek

Sorun yaşarsanız:
1. **CHANGELOG.md** dosyasında v1.3.0 notlarını okuyun
2. **PROJE_DURUMU.md** dosyasında sistemi kontrol edin
3. Hata mesajlarını ve console loglarını kaydedin

**Başarılı testler! 🎉**
