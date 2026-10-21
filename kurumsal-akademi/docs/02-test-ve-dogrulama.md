# Test Senaryoları ve Doğrulama Kontrol Listesi

Kapsam: **dört modül**. Genel doğrulama durumu, manuel kontrol listesi ve ortak sınırlar tüm modüller için geçerlidir; modüle özel otomatik test sonuçları aşağıda ayrı bölümlerdedir.

## Doğrulama durumu: ne test edildi, ne edilmedi

| Alan | Durum | Yöntem |
|---|---|---|
| Manifest geçerliliği (XML, kimlikler, dosya listesi, masteryscore) | Test edildi | `build.py` otomatik denetim |
| Dış bağımlılık yok (çevrimdışı çalışma) | Test edildi | `build.py` http/https taraması |
| SCORM 1.2 çağrıları ve veri modeli kuralları | Test edildi | `test/mock-lms.js` sahte LMS |
| Puan, tamamlama/başarı, devam etme, çıkış davranışı | Test edildi | `test/test-modul1.js` … `test-modul4.js` |
| Düzen (masaüstü ve mobil genişlikler) | Ekran görüntüsüyle görsel kontrol | Headless Chromium (Playwright) |
| **Gerçek SAP SuccessFactors ya da başka bir LMS'te çalışma** | **Test EDİLMEDİ** | LMS erişimi yok |
| Ekran okuyucu ile gerçek kullanım (NVDA, VoiceOver) | Test EDİLMEDİ | Yalnızca kod düzeyinde erişilebilirlik önlemleri |
| Farklı tarayıcılar (Safari, Firefox, eski Edge) | Test EDİLMEDİ | Yalnızca Chromium ve jsdom |
| Gerçek kullanıcı testi | Test EDİLMEDİ | — |

Sahte LMS, gerçek bir LMS'in tüm davranışlarını (ör. `masteryscore`'a göre durumu kendisi değiştirmek, kısmi `suspend_data` kesmeleri) taklit etmez. Bu nedenle **doğrulanmış LMS uyumluluğu iddia edilmez**; paket SAP SuccessFactors'a yüklenmeden önce bir test ortamında denenmelidir.

## Manuel doğrulama kontrol listesi (LMS ve tarayıcıda yapılacak)

**LMS'e yükleme**
- [ ] ZIP'in kökünde `imsmanifest.xml` var; LMS paketi hatasız içe aktarıyor.
- [ ] Başlık modülün adıyla (ör. "Modül 1: İş Başında Yapay Zekâ, Daha İyi Prompt, Daha Güvenilir Sonuç") görünüyor.
- [ ] Modül yeni pencerede/çerçevede açılıyor, ekran tam yükleniyor.

**Raporlama**
- [ ] Açılışta durum "devam ediyor" görünüyor.
- [ ] Tüm sorular doğruyken LMS'te durum "geçti", puan 100.
- [ ] 3/5 doğruyken puan 60, durum "kaldı" (ya da LMS'in eşleştirmesi); LMS ayrıca durumu kendisi hesaplıyorsa (masteryscore) sonuç tutarlı.
- [ ] Süre (session time) LMS kaydında görünüyor.

**Devam etme**
- [ ] Bir ara adımda pencereyi kapat, yeniden aç: aynı ekrandan devam ediyor, verilen kararlar korunmuş.
- [ ] Başarısız sonra yeniden açma: değerlendirme sonuç ekranı geliyor, "Yeniden dene" çalışıyor.
- [ ] Başarıdan sonra yeniden açma: durum "geçti" olarak kalıyor (aşağı çekilmiyor).

**Erişilebilirlik**
- [ ] Yalnızca klavyeyle (Tab, Enter, Boşluk) tüm modül tamamlanabiliyor.
- [ ] Odak her zaman görünür; ekran değişince başlığa odaklanıyor.
- [ ] Ekran okuyucu geri bildirimleri, sayaçları ve durum metinlerini okuyor.
- [ ] Hata/doğru durumları yalnızca renkle değil simge + metinle de belli.
- [ ] %200 yakınlaştırmada içerik kullanılabilir.

**Görsel / duyarlılık**
- [ ] 390 px, 768 px ve 1280 px genişliklerde taşma yok.
- [ ] Türkçe karakterler (ç ğ ı İ ö ş ü) doğru görünüyor.

## Bilinen sınırlar ve riskler

1. **Tamamlama ≠ başarı, SCORM 1.2 sınırı:** Arayüz bu iki durumu ayrı gösterir; ancak LMS'ye tek durum alanı (`lesson_status`) gider. "Tamamladı ama başaramadı" durumu 1.2'de ayrı bir değer olarak raporlanamaz; bu durumda `failed` + gerçek puan gönderilir. Bu ayrımı LMS'te de görmek gerekiyorsa SCORM 2004 sürümü gerekir.
2. **Sorular sabit sırada:** Seçenek ve soru sırası rastgele değil; ardışık denemelerde ezberlenebilir. Soru havuzu ve karıştırma sonraki sürüm için iyileştirme önerisidir.
3. **Modern tarayıcı gerekliyor:** Kod ES2015+ özellikleri kullanır; Internet Explorer 11 desteklenmez.
4. **Gerçek kullanıcıyla ölçülmedi:** Süre (6–7 dk) ve zorluk tahminidir.


## Modül 1 doğrulama sonuçları (İş Başında Yapay Zekâ)

Çalıştırma: `JSDOM_YOLU=/yol/node_modules/jsdom node test/test-modul1.js` (142 doğrulama; modül geliştirilirken hepsi geçti). Ayrıntı: `moduller/modul-1-ai-at-work/docs/test-ve-dogrulama.md`.

### Otomatik senaryolar

| # | Senaryo | Beklenen |
|---|---|---|
| T1 | Başlatma | `incomplete`, hata yok, benzersiz id, ses düğmesi gizli ve `assets/audio` gerçekten boş, örnek çıktı etiketi, `progressbar`, erişilebilir düğme adları, çıkışta tek `LMSFinish`, geçerli `session_time` |
| T2 | Kapılar ve geri bildirim | Her sahnede karar/5 bileşen olmadan Sonraki kapalı; her seçeneğe özel geri bildirim; S2 prompt'u doğru sırada oluşur; S3 iki çıktı + kontrol listesi, kelime sayısı kodla hesaplanır (≤ 90); S4 uydurma 4 parça işaretlenir, doğru seçimde "doğrulanacak"a döner, yanlışta işaretli kalır; S5 üç seçenekte üç farklı sonuç (hiçbiri / yalnız adlar / hepsi temizlenir) |
| T3 | Puanlama | 3/5 → `failed`, `score.raw=60`, `exit=suspend`, yanlışlar gözden geçirme listesinde; başarısızken S7'ye ulaşılır ve "tamamladı, başaramadı" ayrı gösterilir; yeniden dene cevapları sıfırlar, en iyi puanı korur; 4/5 eşik dahil `passed`/80; sonraki 0/5 deneme başarıyı ve en iyi puanı bozmaz |
| T4 | Tam doğru akış | 5/5 → `passed`/100, `exit` boş, kapanış 3 mesaj kartı, yer tutucular "doğrulandı", `lesson_location=s7`, `suspend_data` kompakt |
| T5 | Devam ve güvenli işleme | Yarım oturumdan aynı sahne ve seçimler; yarım değerlendirmede cevaplanmamış ilk soruya dönülür; 9 bozuk/kötü niyetli `suspend_data` (bozuk JSON, dizi, null, aralık dışı, `__proto__`, 5000 karakter) çökertmez ve ilk sahneye düşer; LMS `passed` + puan düşürülmez |
| T6 | Kontroller | Animasyon açıkken etkileşim sahnenin sonunda gelir; balonlar sırayla; Atla, Yeniden oynat (cevabı korur), Azalt (`aria-pressed`, tüm diyalog hemen), `prefers-reduced-motion`, Alt+→/← (kapı klavyeyle atlatılamaz), LMS yokken tam akış |
| T7 | İçerik ve paket | Dış adres yok, `prefers-reduced-motion`, `:focus-visible`, viewport, manifest (1.2, masteryscore 80), 7 sahne, 5 soru H1–H4'ü kapsar, doğru şıklar `[1,3,0,2,1]`, "en uzun şık doğru" ipucu ≤ 2/5 |
| T8 | Karakter tutarlılığı | Ece ve Mert beş sahnede aynı SVG çizimi (ifade/poz dışında); Ece'nin 7 ifade varyantı |

### Bilinen sınırlar

1. Soru ve seçenek sırası sabit; doğru şıklar farklı konumlara dağıtıldı. Soru havuzu ve karıştırma sonraki sürüm önerisidir.
2. Sürekli hareketler (göz kırpma, nefes) küçüktür ve azaltılınca durur; yine de bazı kullanıcılar için dikkat dağıtıcı olabilir.
3. Konuşan karakter ağız hareketi basit bir açılıp kapanmadır; dudak eşleşmesi yoktur ve ses olmadığı için gerekmez.
4. Modern tarayıcı gerekir (ES2015+, SVG, CSS `transform-box`); Internet Explorer desteklenmez.
5. Süre (6–7 dk) tahmindir.

## Modül 2 doğrulama sonuçları

Çalıştırma: `JSDOM_YOLU=/yol/node_modules/jsdom node test/test-modul2.js` (109 doğrulama, hepsi geçti).

| # | Senaryo | Beklenen sonuç |
|---|---|---|
| T1 | Açılış | `LMSInitialize`, `incomplete`, SCORM hata kodu yok, JS hatası yok, sayfadaki tüm id'ler benzersiz (SVG gradyanları dahil), yalnızca büyük karakter ekran okuyucuya açık |
| T1b | Ad ayrıştırma | "Soyad, Ad" → Ad; boş ad → "Katılımcı"; "İpek" → "İ" harfi |
| T2 | Kapılar | Üç SBI kartı açılmadan, yanıt seçilmeden ve 5 soru bitmeden İleri kapalı; yanıt kilitlenir; kenar çubuğu erişimi kademeli |
| T3 | Tam doğru akış | Güven/Netlik 62/45 → 72/65 → 82/80; 3 beceri; "Ortak plan"; 5/5 → `passed`, `score.raw=100`, `exit=""`, `LMSFinish` tek sefer, `session_time` biçimi |
| T4 | Başarısız, yeniden deneme | 3/5 → `failed`/60; 4/5 → `passed`/80 (eşik dahil); sonraki 0 puanlık deneme geçti durumunu ve en iyi puanı bozmaz |
| T5 | Dallanma | Zayıf açılışta Elif savunmaya geçer; kötü 2. seçimde kapanır; göstergeler 0–100 ile sınırlı; "Kopuk görüşme"; yeniden dene beceri ve kilitleri sıfırlar |
| T6 | Devam | `exit=suspend`; aynı ekran, seçimler, beceriler, deneme sayısı geri yüklenir; bozuk ya da aralık dışı `suspend_data` çökertmez |
| T7 | LMS yok | Tüm akış çevrimdışı çalışır |
| T8 | Uygulama ekranı | Kullanıcı metni HTML olarak yorumlanmaz; metin LMS'e gönderilmez; taahhüt kaydedilir |
| T9 | İçerik/paket | Eşik 80, masteryscore 80, SCORM 1.2, dış adres yok, `prefers-reduced-motion` var |

**Görsel kontrol.** Headless Chromium ile 1280 px ve 390 px'te ekranlar incelendi (metin kontrastı ve mobil seçenek düzeni bu turda düzeltildi). Bu bir tasarım onayı ya da kullanılabilirlik testi değildir.

**Test EDİLMEDİ (Modül 2).** Gerçek LMS, gerçek ekran okuyucu, Safari/Firefox, eski cihazlar, gerçek kullanıcılar. `backdrop-filter` desteklemeyen tarayıcılarda cam efekti düz yarı saydam zemine düşer; metin okunur kalacak şekilde tasarlandı ama doğrulanmadı.


## Modül 3 doğrulama sonuçları

Çalıştırma: `JSDOM_YOLU=/yol/node_modules/jsdom node test/test-modul3.js` (85 doğrulama, hepsi geçti).

| # | Senaryo | Beklenen sonuç |
|---|---|---|
| T1 | Veri tutarlılığı | Haftalık diziler eğitim toplamlarını verir; aylık toplamlar çeyreğe eşittir; 395/500 = %79,0; basit ortalama %80,0; memnuniyet basit ortalaması 4,1 |
| T2 | Formül ekranı | 65, %65 ve 0,65 biçimleri kabul edilir; 3. yanlışta yanıt açıklanır; yazılan değerler yeniden çizimde korunur |
| T3 | Pano | Filtreler KPI şeridini ve grafikleri günceller; aylarda memnuniyet/sınav "—"; grafik `aria-label` ve tablo eşdeğeri var; keşif kapısı açılmadan İleri kapalı |
| T4 | Kapılar | Yorum, aksiyon, özet ve değerlendirme tamamlanmadan ilerlenemez; özet yanıtı 3 kontrolden sonra açıklanır |
| T5 | Puanlama | 5/5 → `passed`/100; 3/5 → `failed`/60; 4/5 → geçer (eşik dahil); yeniden denemede en iyi puan ve geçti durumu korunur |
| T6 | Devam / bozuk veri | `exit=suspend`; ekran, filtreler, girişler ve cevaplar geri yüklenir; bozuk `suspend_data` çökertmez |
| T7 | LMS yok, içerik | Çevrimdışı akış çalışır; dış adres yok; masteryscore 80 |

## Modül 4 doğrulama sonuçları

Çalıştırma: `JSDOM_YOLU=/yol/node_modules/jsdom node test/test-modul4.js` (68 doğrulama, hepsi geçti).

| # | Senaryo | Beklenen sonuç |
|---|---|---|
| T1 | Açılış ve menü | `incomplete`, JS hatası yok, benzersiz id; menü `aria-expanded` ile açılır/kapanır, Escape kapatır, kilitli dersler seçilemez |
| T2 | Kapılar | 4 istem bileşeni görülmeden, karşılaştırma doğru işaretlenmeden, atölyede çalıştırma yapılmadan ilerlenemez |
| T3 | Atölye | 0–1 / 2–3 / 4 doğru seçim sırasıyla zayıf / orta / iyi çıktı verir; grup bazlı gerekçe görünür; çıktı "örnek" etiketlidir |
| T4 | Doğrulama ve gizlilik | İddia sınıflandırması 3 denemede açıklanır; gizlilik vakaları doğru olana dek tekrar edilir |
| T5 | Puanlama | 5/5 → `passed`/100; başarısız → yeniden deneme; en iyi puan ve geçti durumu korunur; eylem planı seçimleri indeks olarak saklanır |
| T6 | Devam / çevrimdışı | `suspend` sonrası aynı ekran ve cevaplar; bozuk veri güvenli; LMS yoksa çalışır; dış adres yok |

**Görsel kontrol (Modül 3 ve 4, giriş sayfası).** Headless Chromium ile 1280 px ve 390 px'te incelendi; üstte kırpılan izometrik figürler ve üst üste binen katman etiketleri bu turda düzeltildi. Bu bir tasarım onayı ya da kullanılabilirlik testi değildir.

**Test EDİLMEDİ (Modül 3 ve 4).** Gerçek LMS (SAP SuccessFactors dahil), gerçek ekran okuyucu, Safari/Firefox, gerçek kullanıcılar. Excel ve pano görünümü temsilidir; Modül 4 gerçek bir yapay zekâ servisi çağırmaz. Cam efekti (`backdrop-filter`) desteği olmayan tarayıcılarda doğrulanmadı.
