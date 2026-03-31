# 💬 Yorumlar (Comments) Test Rehberi - v1.4.0

**Test Tarihi:** 1 Ocak 2026  
**Özellik:** Kartlara yorum ekleme, düzenleme ve silme

---

## 📋 Ön Hazırlık

### 1. Veritabanı Kontrolü
Seed verilerinin yüklendiğinden emin olun:
```bash
cd packages/database
npx tsx prisma/seed.ts
```

### 2. Giriş Yapın
- **Email:** demo@ulgen.com
- **Şifre:** demo123

### 3. Application Çalıştırın
```bash
cd apps/web
pnpm dev
```
URL: http://localhost:3000

---

## 🧪 Test Senaryoları

### ✅ Test 1: Yorum Ekleme

**Adımlar:**
1. Bir board seçin (örn: "İlk Board'um")
2. Herhangi bir karta tıklayın (Card Detail Modal açılır)
3. Aşağıya scroll yapın → **"Yorumlar (0)"** bölümünü görün
4. Yorum kutusuna bir şeyler yazın: "Bu işi tamamladım! 🎉"
5. **"Yorum Ekle"** butonuna tıklayın

**Beklenen Sonuç:**
- ✅ Yorum anında listeye eklenir
- ✅ Avatar gösterilir (veya baş harf)
- ✅ Kullanıcı adı görünür
- ✅ "az önce" zaman damgası gösterilir
- ✅ Yorum sayısı güncellenir: "Yorumlar (1)"

---

### ✅ Test 2: Birden Fazla Yorum

**Adımlar:**
1. Aynı karta 3-4 farklı yorum ekleyin
2. Yorumların sıralamasını gözlemleyin

**Beklenen Sonuç:**
- ✅ Yorumlar **yeni → eski** sırasıyla listelenir
- ✅ En son eklenen yorum en üstte
- ✅ Yorum sayısı doğru güncellenir

---

### ✅ Test 3: Yorum Düzenleme

**Adımlar:**
1. Daha önce eklediğiniz bir yorumun üzerine **hover** yapın
2. Sağ üstte **Kalem (Edit)** ikonunu görün
3. Edit butonuna tıklayın
4. Yorum metnini değiştirin: "Güncellendi: İş tamamlandı ✓"
5. **"Kaydet"** butonuna tıklayın

**Beklenen Sonuç:**
- ✅ Yorum metni güncellenir
- ✅ **(düzenlendi)** etiketi görünür
- ✅ Zaman damgası aynı kalır (createdAt)
- ✅ Edit modu kapanır

**İptal Testi:**
1. Tekrar Edit'e tıklayın
2. **"İptal"** butonuna tıklayın
3. ✅ Değişiklik kaydedilmez, eski metin kalır

---

### ✅ Test 4: Yorum Silme

**Adımlar:**
1. Bir yorumun üzerine hover yapın
2. Sağ üstte **Çöp Kutusu (Delete)** ikonunu görün
3. Delete butonuna tıklayın

**Beklenen Sonuç:**
- ✅ Yorum anında listeden kaldırılır
- ✅ Yorum sayısı güncellenir
- ✅ Sayfa yenilenmez (optimistic update)

---

### ✅ Test 5: Uzun Yorum

**Adımlar:**
1. Çok uzun bir yorum yazın (500+ karakter)
2. Yorum ekleyin

**Beklenen Sonuç:**
- ✅ Yorum başarıyla eklenir
- ✅ Metin düzgün wrap olur (taşmaz)
- ✅ Scroll yapılabilir

---

### ✅ Test 6: Boş Yorum Engelleme

**Adımlar:**
1. Yorum kutusunu boş bırakın
2. "Yorum Ekle" butonuna tıklayın

**Beklenen Sonuç:**
- ✅ Buton disabled durumda
- ✅ Boş yorum gönderilemez
- ✅ Sadece boşluk karakteri de geçersiz

---

### ✅ Test 7: Avatar Gösterimi

**Adımlar:**
1. Yorumları inceleyin
2. Avatar veya baş harf kontrolü yapın

**Beklenen Sonuç:**
- ✅ Kullanıcı image varsa avatar gösterilir
- ✅ Image yoksa **ilk harf** mavi daire içinde gösterilir
- ✅ Örnek: "demo@ulgen.com" → **"D"**

---

### ✅ Test 8: Zaman Formatı

**Adımlar:**
1. Yeni bir yorum ekleyin
2. Zaman damgasını kontrol edin
3. 5 dakika bekleyin, sayfayı yenileyin

**Beklenen Sonuç:**
- ✅ "az önce" → ilk 1 dakika
- ✅ "5 dakika önce" → 5 dakika sonra
- ✅ "1 saat önce" → 1 saat sonra
- ✅ Türkçe format (date-fns/locale/tr)

---

### ✅ Test 9: Sayfa Yenileme Sonrası

**Adımlar:**
1. Bir karta 2-3 yorum ekleyin
2. Sayfayı yenileyin (F5)
3. Aynı kartı tekrar açın

**Beklenen Sonuç:**
- ✅ Tüm yorumlar korunmuş
- ✅ Sıralama doğru (yeni → eski)
- ✅ Zaman damgaları güncel

---

### ✅ Test 10: Farklı Kartlarda Yorumlar

**Adımlar:**
1. İlk karta 2 yorum ekleyin
2. Kartı kapatın
3. Farklı bir kart açın
4. Bu karta da 2 yorum ekleyin
5. İlk kartı tekrar açın

**Beklenen Sonuç:**
- ✅ Her kart kendi yorumlarını gösterir
- ✅ Yorumlar karışmaz
- ✅ Yorum sayıları doğru

---

### ✅ Test 11: Trello Import ile Yorumlar

**Adımlar:**
1. "Boards" sayfasında **"Import"** butonuna tıklayın
2. `docs/test/6HGqOHdb - otomasyon-ekibi.json` dosyasını seçin
3. **"Import Et"** butonuna tıklayın
4. Import edilen board'u açın
5. Kartları kontrol edin

**Beklenen Sonuç:**
- ✅ Board başarıyla import edilir
- ✅ Kartlarda **yorumlar** varsa gösterilir
- ✅ Yorumların tarihleri orijinal tarihe göre ayarlanır
- ✅ Yorum sayısı doğru

**Test Komutu (Backend Log Kontrolü):**
Terminal'de import sırasında log kontrol edin:
```
prisma:query INSERT INTO "public"."Comment" ...
```

---

## 🐛 Hata Senaryoları

### ❌ Test 12: Yetkisiz Düzenleme Engelleme

**Adımlar:**
1. Başka bir kullanıcı olarak login olun (eğer varsa)
2. İlk kullanıcının yorumunu düzenlemeye çalışın

**Beklenen Sonuç:**
- ✅ Edit butonu görünmez (sadece kendi yorumunuz için görünür)

---

### ❌ Test 13: Network Hatası

**Adımlar:**
1. Developer Tools → Network tab → Offline yap
2. Yorum eklemeye çalış

**Beklenen Sonuç:**
- ✅ Hata mesajı gösterilir
- ✅ Application çökmez
- ✅ "Yorum eklenemedi" bildirimi

---

### ❌ Test 14: Çok Hızlı Yorum Ekleme

**Adımlar:**
1. Hızlıca 5-6 yorum ekleyin (Enter tuşuna basarak)

**Beklenen Sonuç:**
- ✅ Tüm yorumlar başarıyla eklenir
- ✅ Sıralama doğru
- ✅ Race condition yok

---

## 📊 API Endpoint Test

### Manual API Test (Postman/curl)

**1. Yorumları Getir:**
```bash
GET http://localhost:3000/api/cards/[CARD_ID]/comments
Authorization: Bearer [SESSION_TOKEN]
```

**2. Yorum Ekle:**
```bash
POST http://localhost:3000/api/cards/[CARD_ID]/comments
Content-Type: application/json

{
  "content": "Test yorumu"
}
```

**3. Yorum Güncelle:**
```bash
PUT http://localhost:3000/api/comments/[COMMENT_ID]
Content-Type: application/json

{
  "content": "Güncellenmiş yorum"
}
```

**4. Yorum Sil:**
```bash
DELETE http://localhost:3000/api/comments/[COMMENT_ID]
```

---

## 📈 Performans Testleri

### Test 15: Çok Sayıda Yorum

**Adımlar:**
1. Bir karta 50+ yorum ekleyin
2. Kartı açıp kapatın
3. Yorumlar listesinde scroll yapın

**Beklenen Sonuç:**
- ✅ Sayfa yavaşlamaz
- ✅ Scroll smooth çalışır
- ✅ Loading indicator görünür (ilk yüklemede)

---

## ✅ Başarı Kriterleri

Tüm testler başarılıysa:
- [x] Yorumlar başarıyla eklenir
- [x] Yorumlar düzenlenir (sadece sahibi)
- [x] Yorumlar silinir (sahibi veya owner)
- [x] Zaman formatı doğru çalışır
- [x] Avatar/baş harf gösterimi çalışır
- [x] Trello import yorumları aktarır
- [x] API güvenlik kontrolleri çalışır
- [x] UI responsive ve hızlı

---

## 🎉 Test Sonucu

**Tarih:** _______________  
**Test Eden:** _______________  
**Durum:** ⬜ Başarılı / ⬜ Başarısız  
**Notlar:** 

_______________________________________________
_______________________________________________
_______________________________________________

---

## 📞 Destek

Sorun yaşarsanız:
1. Terminal loglarını kontrol edin
2. Browser Console'u kontrol edin (F12)
3. Prisma Studio'da Comment tablosunu inceleyin:
   ```bash
   cd packages/database
   npx prisma studio
   ```
4. CHANGELOG.md dosyasında v1.4.0 notlarını okuyun
