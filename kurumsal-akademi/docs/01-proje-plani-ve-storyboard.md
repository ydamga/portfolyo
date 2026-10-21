# Kurumsal Akademi: Proje Planı ve Storyboard

## 1. Portfolyonun amacı

Kurumsal öğrenme ve gelişim alanında dört farklı öğrenme yaklaşımını tek bir akademi çatısı altında göstermek: animasyonlu karakter anlatımı, davranışsal gelişim, dijital beceri/analitik ve yapay zekâ destekli öğrenme. Her modül bağımsız bir SCORM paketidir; aynı tasarım sistemini paylaşır, ancak konuya özgü görsel kimliği ve etkileşimi vardır.

| # | Modül | Alan | Öğrenme yaklaşımı | Ana etkileşimler | Görsel kimlik | Süre |
|---|---|---|---|---|---|---|
| 1 | İş Başında Yapay Zekâ: Daha İyi Prompt, Daha Güvenilir Sonuç | AI Literacy | Animasyonlu senaryo, karakterli anlatım | 7 sahne; prompt bileşenleri, A/B çıktı karşılaştırma, uydurma bilgiyi doğrulama, kişisel veriyi karartma | Krem ofis sahnesi, SVG ile çizilmiş 2D karakterler (Ece, Mert, asistan) | 6–7 dk |
| 2 | Zor Görüşmeyi Yönetmek | Behavioral & Leadership | Vaka ve dallanan senaryo | Konuşma balonları, karar noktaları, güven/netlik göstergesi | Mavi gece sahnesi, avatarlar, cam arayüz | 6–7 dk |
| 3 | Eğitim KPI'larını Excel'de Okumak | Digital Skills & Learning Analytics | Veri odaklı problem çözme | Tablo, hesaplama görevi, KPI kartları ve grafik, aksiyon seçimi | Beyaz ve yeşil, Excel çalışma kitabı ve KPI panosu | 6–7 dk |
| 4 | Yapay Zekâyı İş Yerinde Güvenle Kullanmak | AI-Powered Learning | İyi/geliştirilebilir örnek karşılaştırma, atölye | Prompt bileşenleri, prompt iyileştirme, doğrulama, gizlilik kararları | Koyu zemin, indigo başlık, izometrik sahneler, LMS oynatıcı düzeni | 6–7 dk |

## 2. Ortak tasarım sistemi

**Tipografi.** Sistem yazı tipleri (`Segoe UI`, `system-ui`, `Roboto`, `Helvetica Neue`, `Arial`). Dış yazı tipi yok, internetsiz çalışır, Türkçe karakterleri destekler. Başlık 1,6–1,9 rem / kalın; gövde 1 rem / 1,6 satır aralığı.

**Renk.** Ortak nötr palet (koyu mürekkep `#14213d`, zemin `#f4f6fb`, yüzey `#ffffff`, çizgi `#d9dfec`). Her modül tek bir vurgu rengi tanımlar (`--vurgu`). Durum renkleri: başarı `#166534`, hata `#b42318`, uyarı `#8a5a00`. Metin/zemin çiftleri en az 4,5:1 kontrast hedefler.

**Grid ve boşluk.** 8 px tabanlı aralık ölçeği, içerik genişliği en fazla 980 px, 12 sütunlu mantık yerine 2 sütunlu esnek ızgara (≤760 px'de tek sütun).

**Bileşenler.** Üst bilgi çubuğu, adım göstergesi + ilerleme çubuğu, kart, rozet, bilgi/uyarı kutusu, buton (birincil/ikincil), seçenek düğmesi, geri bildirim kutusu, alt gezinme.

**Erişilebilirlik kuralları.**
- Tüm etkileşimler gerçek `button`, `input`, `select` öğeleriyle yapılır; klavye ile kullanılabilir.
- Odak halkası her zaman görünür; ekran değişince odak ekran başlığına taşınır.
- Anlam yalnızca renkle verilmez: durumlar simge + metin ile de belirtilir (✓ / ✗ / !).
- Geri bildirimler `aria-live` bölgelerinde duyurulur.
- Sürükle-bırak yerine seç-ve-yerleştir (düğme tabanlı) etkileşim kullanılır.
- `prefers-reduced-motion` desteklenir; dekoratif animasyon yoktur.

**Ortak modül akışı** (konuya göre uyarlanır, mekanik uygulanmaz):
1. İş problemi (dikkat çekici vaka) → 2. Hedefler → 3. Kısa görsel içerik → 4. Etkileşimli uygulama/senaryo → 5. Açıklayıcı geri bildirim → 6. Değerlendirme → 7. İş ortamına transfer ve kapanış.

## 3. Ortak SCORM yaklaşımı

**Sürüm: SCORM 1.2** (SAP SuccessFactors dahil çoğu LMS'te en yaygın desteklenen sürüm).

| Gereksinim | Uygulama |
|---|---|
| Başlatma / sonlandırma | `LMSInitialize` açılışta, `LMSFinish` sayfa kapanırken (tek sefer) |
| Durum | `cmi.core.lesson_status`: `incomplete` → `passed` / `failed` |
| Puan | `cmi.core.score.raw` (0–100), `min=0`, `max=100` |
| Başarı eşiği | %80; manifestte `adlcp:masteryscore` = 80 |
| Devam etme | `cmi.core.lesson_location` (ekran kimliği) + `cmi.suspend_data` (kompakt JSON, 4096 karakter sınırının çok altında) |
| Çıkış | Başarısızken/yarımken `cmi.core.exit = suspend`; başarıyla bitince boş |
| Süre | `cmi.core.session_time` (`HHHH:MM:SS.SS`) |
| Çevrimdışı | Dış kütüphane, yazı tipi, CDN yok |

**Tamamlama ile başarının ayrılması.** Modülde bu iki kavram ayrı izlenir: *tamamlama* = değerlendirmenin bitirilmesi, *başarı* = puanın %80 eşiğine ulaşması. Arayüz bunları ayrı gösterir. SCORM 1.2'nin tek bir durum alanı (`lesson_status`) olduğu için LMS'ye "tamamladı ama başaramadı" durumu ayrı bir değer olarak gönderilemez; bu durumda `failed` + gerçek puan raporlanır ve modül yeniden denemeye açık kalır.

**SCORM 2004 seçeneği (gerekçe).** Bu gereksinim için en doğru standart aslında SCORM 2004'tür: `cmi.completion_status` ve `cmi.success_status` ayrı alanlardır ve "tamamladı, başaramadı" doğrudan raporlanabilir. Tercih 1.2 olduğu için ilk sürüm 1.2'dir. LMS hedefi 2004'ü destekliyorsa, sarmalayıcıya sürüm katmanı eklenip aynı içerik 2004 manifestiyle paketlenebilir.

**Doğrulama sınırı.** Paketler gerçek bir SAP SuccessFactors ortamında test edilmemiştir. Yapılan testler, SCORM 1.2 veri modelini taklit eden bir sahte LMS ile yapılan işlevsel testlerdir (bkz. `02-test-ve-dogrulama.md`). Gerçek LMS uyumluluğu iddia edilmez.

## 4. Modül tasarımları

### Modül 1: İş Başında Yapay Zekâ, Daha İyi Prompt, Daha Güvenilir Sonuç (AI Literacy)

> Ayrıntılı storyboard, görsel yön, sahne tablosu ve durum modeli: [`moduller/modul-1-ai-at-work/docs/storyboard.md`](../moduller/modul-1-ai-at-work/docs/storyboard.md).

**Performans problemi.** Çalışanlar üretken yapay zekâya belirsiz istekler yazıyor, verilmemiş bilgi (tarih, saat, yer) uyduran çıktıyı doğrulamadan paylaşıyor ve prompt'a kişisel ya da gizli veri ekliyor.

**Hedef kitle.** Farklı departmanlardaki kurumsal profesyoneller.

**Öğrenme hedefleri.**
| # | Hedef | Bloom düzeyi | Ölçüldüğü yer |
|---|---|---|---|
| H1 | Etkili bir prompt'un temel bileşenlerini belirler. | Uygulama | Sahne 1–2, S1 |
| H2 | Geliştirilebilir bir prompt'u iyileştirir. | Uygulama / Değerlendirme | Sahne 3, S2 |
| H3 | Yapay zekâ çıktısını doğrular. | Değerlendirme | Sahne 4, S3 |
| H4 | Gizli veya kişisel bilgilerin paylaşılmasına ilişkin riskleri tanır. | Analiz | Sahne 5, S4–S5 |

**Sahne planı**
| Sahne | Tek temel amaç | Anlatım ve etkileşim |
|---|---|---|
| 1. Belirsiz bir istek | H1 (ihtiyaç) | Ece asistana "Bana bir eğitim duyurusu hazırla." yazar; genel bir metin gelir. Daha iyi ne yapılabileceği seçilir. |
| 2. İyi prompt'un anatomisi | H1 | Mert 5 bileşeni anlatır (rol/bağlam, görev, hedef kitle, çıktı biçimi, kısıtlar); prompt bölüm bölüm oluşur. |
| 3. Prompt'u iyileştir | H2 | Geliştirilebilir (A) ve güçlü (B) prompt; iki örnek çıktı yan yana ve bileşen kontrol listesi. |
| 4. Her çıktıya güvenme | H3 | Asistan verilmemiş tarih, saat ve yer ekler; Mert "Dur!" der. Doğru seçimde uydurma kısımlar "doğrulanacak" yer tutucusuna döner. |
| 5. Veri güvenliği | H4 | Hassas parçalar işaretlenir; doğru seçimde animasyonla karartılıp yer tutucuyla değişir. |
| 6. Son değerlendirme | H1–H4 | 5 soru, gerekçeli geri bildirim, %80 geçme. |
| 7. Kapanış | Transfer | Ece duyuruyu tamamlar; 3 temel mesaj, tamamlama ve başarı ayrı gösterilir. |

**Ölçme-değerlendirme.** Sahne içi kararlar geri bildirim içindir, puana girmez. Yalnızca Sahne 6'daki 5 soru puanlanır (%80 = en az 4/5); en iyi puan korunur.

**Tasarım gerekçeleri.**
- *Karakterli animasyon:* Konu, bir iş arkadaşının hatırlatmasıyla öğrenilen bir alışkanlıktır; Ece ve Mert hatayı ve düzeltmeyi gündelik bir ofis anında gösterir.
- *Hareket yalnızca mesajı taşır:* Balonların sırası, prompt'un parça parça oluşması, uydurma bilginin işaretlenmesi, verinin karartılması. Süs amaçlı sürekli hareket yoktur; animasyon azaltılabilir ve atlanabilir.
- *Her sahnede bir karar:* Karar verilmeden "Sonraki" kapalıdır; seçeneğe özel geri bildirim karakterlerin ifadesiyle de verilir.
- *Kendi sarmalayıcısı:* Modül, `ortak/` yerine kendi SCORM 1.2 sarmalayıcısını (`js/scorm.js`) ve stilini taşır; paketleme betiği bunu manifestten anlar.

**Modül 4 ile ilişkisi.** İki modül de yapay zekâ okuryazarlığına dokunur ama farklı yaklaşımları gösterir: Modül 1 karakterli, sahne sahne ilerleyen bir anlatı; Modül 4 izometrik oynatıcıda atölye ve vaka çalışması.

### Modül 2: Zor Görüşmeyi Yönetmek (Behavioral & Leadership)

**Performans problemi.** Yeni yöneticiler zor performans görüşmelerinden kaçınıyor ya da yargılayıcı konuşuyor; çalışan savunmaya geçiyor, değişim olmuyor.

**Hedef kitle.** Yeni yönetici ve ekip liderleri.

**Görsel kimlik (referans: avatar sahneli kurumsal e-öğrenme arayüzü).** Bu modül, Modül 1'den bilerek ayrı bir kimlik taşır: sol ikon çubuğu, "Hoş geldin, {Ad}" üst çubuğu, ofis sahnesinde SVG avatar, cam efektli konuşma balonu, parlayan A/B/C seçenekleri, sağda dairesel ilerleme halkası ve "Kazanılan beceriler" listesi. Tüm görseller (avatarlar, ofis, hologram paneller, ikonlar) kodla üretilmiş SVG'dir; dış dosya yoktur. Avatarlar özgündür; hiçbir gerçek kişiye ya da var olan bir karaktere dayanmaz.

**Öğrenme hedefleri.**
| # | Hedef | Bloom düzeyi |
|---|---|---|
| H1 | Gözleme dayalı geri bildirimi kişisel yargıdan ayırt eder. | Analiz |
| H2 | Yapıcı geri bildirim için uygun iletişim yaklaşımını (Durum-Davranış-Etki) seçer. | Uygulama |
| H3 | Zor bir görüşmede etkili bir sonraki adımı belirler. | Değerlendirme |

**Vaka.** Sen, ekip liderisin. Analist Elif'in haftalık raporları üç kez geç geldi ve sonuncusunda bölge toplamı hatalı. Koç: Selin (İK İş Ortağı).

| Ekran | Amaç | İçerik ve etkileşim | Geri bildirim |
|---|---|---|---|
| 1. Tanışma | Problemi hissettir, beklenti | Selin vakayı anlatır; 3 hedef, süre, puanlama kuralı | — |
| 2. Model | H1, H2 | S, B, I kartları (her biri tıklanır); zayıf ve güçlü örnek; açılmadan ileri yok | Kartın açıklaması |
| 3. Açılış | H2 | Elif'in karşılaması; 3 yanıt (A/B/C) | Elif'in tepkisi, koç notu, Güven/Netlik değişimi |
| 4. Gözlem | H1, H2 | Açılışın sonucuna göre dallanan Elif; 3 yanıt | Aynı |
| 5. Çözüm | H3 | Elif kök nedeni anlatır (açıklığı önceki seçime bağlı); 3 yanıt | Aynı |
| 6. Özet | H3 | Güven, Netlik, güçlü seçim sayısı; 4 sonuç türü; yeniden dene | Her karar için en güçlü seçenek |
| 7. Test | Ölçme | 5 soru (gözlem/yargı, açılış, savunma, etki, kapanış) | Soru başına gerekçe |
| 8. Sonuç | Transfer | Puan ve durum; kendi SBI cümlen (üç kutu, canlı önizleme); 3 taahhüt | Önizleme |

**Dallanma.** Elif'in 2. ekran açılışı Güven ≥ 55 ise açık, değilse savunmacı; 3. ekran açılışı 2. seçimin kalitesine (güçlü/orta/zayıf) bağlı üç farklı biçimde gelir. Sonuç türleri: Ortak plan (Güven ve Netlik ≥ 65), Kopuk görüşme (ikisi de < 50), Sıcak ama belirsiz, Net ama gergin.

**Ölçme.** Yalnızca 5 soruluk değerlendirme puanlanır (geçme %80, yani en az 4/5). Görüşme performansı (Güven, Netlik, güçlü seçim) **puana girmez**; öğrenene geri bildirim ve beceri rozetidir. Sınırsız yeniden deneme; en iyi puan korunur; geçti durumu kalıcıdır.

**Gerekçe.** Dallanan senaryo, geri bildirimin *sonucunu* göstermek için seçildi; düz bilgi aktarımı davranış değişikliği üretmez. Görüşmenin puanlanmaması bilinçli bir karardır: "doğru" geri bildirimin tek bir doğru cümlesi yoktur, ancak gözlem/yargı ayrımı ölçülebilir.

### Modül 3: Eğitim KPI'larını Excel'de Okumak (Digital Skills & Learning Analytics)

**Performans problemi.** Eğitim ekipleri veriyi toplar ama yönetici özetine dönüştüremez; ortalamalar yanlış alınır, düşük performanslı eğitim fark edilmez.

**Hedef kitle.** İK, eğitim ve öğrenme-gelişim ekipleri.

**Öğrenme hedefleri.**
| # | Hedef | Bloom düzeyi |
|---|---|---|
| H1 | Eğitim tamamlama oranını hesaplar. | Uygulama |
| H2 | Memnuniyet puanlarını ve sınav sonuçlarını yorumlar. | Analiz |
| H3 | Verilerden hareketle bir eğitim iyileştirme önerisi geliştirir. | Değerlendirme/Yaratma |

**Veri seti (2026 Q3).**

| Eğitim | Kayıtlı | Tamamlayan | Tamamlama % | Memnuniyet (5 üzerinden) | Sınav ort. (100) |
|---|---|---|---|---|---|
| Ofis Güvenliği | 120 | 108 | 90,0 | 4,4 | 86 |
| Müşteri İletişimi | 80 | 52 | 65,0 | 3,6 | 71 |
| Excel Temelleri | 60 | 51 | 85,0 | 4,5 | 78 |
| Yeni Yönetici Programı | 40 | 34 | 85,0 | 4,1 | 74 |
| Kişisel Verilerin Korunması Farkındalığı | 200 | 150 | 75,0 | 3,9 | 81 |
| **Toplam / ağırlıklı** | **500** | **395** | **79,0** | **4,1 (basit ort.)** | — |

Tutarlılık kontrolleri: 108/120 = 90,0; 52/80 = 65,0; 51/60 = 85,0; 34/40 = 85,0; 150/200 = 75,0; 395/500 = 79,0. Eğitim bazlı tamamlama oranlarının **basit ortalaması 80,0** olup **ağırlıklı oran 79,0**'dur; modülün öğretici noktalarından biri budur. Memnuniyet basit ortalaması (4,4 + 3,6 + 4,5 + 4,1 + 3,9) / 5 = 4,1.

| Ekran | Amaç | İçerik ve etkileşim | Geri bildirim |
|---|---|---|---|
| 1. Problem | Dikkat çek | Yöneticinin sorusu: "Q3 eğitimleri nasıl gitti?" | — |
| 2. Hedefler | Beklenti | 3 hedef | — |
| 3. Veri ve formül | H1 | Excel benzeri tablo (temsili); tamamlama oranı hücresini hesapla (giriş alanı) | Anında doğru/yanlış, formül `=C/B` açıklaması |
| 4. KPI kartları | H2 | Eğitim seç → KPI kartları ve çubuk grafik; metrik sekmeleri | Grafikte metnin eş değeri tablo olarak sunulur |
| 5. Yorumlama | H2 | Toplam oran: basit mi ağırlıklı mı? Bir eğitimin düşük memnuniyet + düşük tamamlama ilişkisi | Gerekçe |
| 6. Aksiyon | H3 | 4 aksiyon seçeneğinden önceliklendirme (ör. Müşteri İletişimi içeriğini yeniden tasarla) | Veriyle gerekçelendirilmiş geri bildirim |
| 7. Yönetici özeti | H3 | Boşlukları verilerle doldurarak 3 cümlelik özet kur | Doğru/yanlış, rakamla açıklama |
| 8. Değerlendirme + kapanış | Ölçme, transfer | 5 soru; kapanışta "bu hafta kendi verinde uygula" önerisi | Gerekçeli |

**Gerekçe.** Hesap ve yorumun aynı veri üzerinde birleşmesi, "formülü bilen ama yorumlayamayan" tipik boşluğu kapatır.

**Yapıldığı haliyle (as-built).** Görsel kimlik: beyaz/yeşil Excel çalışma kitabı kartı, sayfa sekmeleri olarak ekran gezintisi. Ekran 4 etkileşimli bir panodur: Eğitim ve Dönem filtreleri, KPI şeridi, haftalık çizgi grafik ve metrik sekmeli çubuk grafik (satır içi SVG, her grafiğin tablo eşdeğeri `<details>` içinde); "keşif görevi" kapısı için en az 3 farklı eğitim seçimi ve dönem değişikliği gerekir. Aylık dönemlerde memnuniyet ve sınav gösterilmez ("—"), çünkü veri çeyreklik toplanmıştır. Formül ekranında giriş "65", "%65" ve "0,65" biçimlerini kabul eder. Puanlama: yalnızca 5 soruluk değerlendirme (≥%80); formül, yorum, aksiyon ve özet etkinlikleri puana girmez.

### Modül 4: Yapay Zekâyı İş Yerinde Güvenle Kullanmak (AI-Powered Learning)

**Performans problemi.** Çalışanlar üretken yapay zekâyı belirsiz isteklerle kullanıyor, çıktıyı doğrulamadan paylaşıyor ve kişisel/gizli veriyi araca yapıştırıyor.

**Hedef kitle.** Farklı departmanlarda çalışan kurumsal profesyoneller.

**Öğrenme hedefleri.**
| # | Hedef | Bloom düzeyi |
|---|---|---|
| H1 | Etkili bir prompt'un temel bileşenlerini belirler. | Uygulama |
| H2 | Yapay zekâ çıktılarındaki hata ve doğrulama ihtiyacını değerlendirir. | Değerlendirme |
| H3 | Gizli ya da kişisel verileri paylaşmanın risklerini tanır. | Analiz |

**Not:** Modül gerçek bir yapay zekâ servisine bağlanmaz. Gösterilen çıktılar **önceden yazılmış örneklerdir**.

| Ekran | Amaç | İçerik ve etkileşim | Geri bildirim |
|---|---|---|---|
| 1. Problem | Dikkat çek | İK uzmanı 12 sayfalık politikayı özetletmek ister; belirsiz istek, genel kalan çıktı | — |
| 2. Hedefler | Beklenti | 3 hedef, örnek çıktı notu | — |
| 3. Prompt bileşenleri | H1 | Rol/bağlam, görev, girdi ve kısıtlar, çıktı biçimi: sekmeli açıklamalı örnek | — |
| 4. İyi / geliştirilebilir karşılaştırma | H1 | Yan yana iki prompt ve örnek çıktılar; hangi bileşen eksik? | Gerekçe |
| 5. Prompt atölyesi | H1 | Geliştirilebilir prompt'a bileşen ekleme; her bileşen için seçenek; canlı prompt önizleme | Seçime göre açıklama |
| 6. Çıktıyı doğrula | H2 | Örnek yanıtta 4 iddia; hangileri doğrulama gerektirir? | İddia bazlı gerekçe |
| 7. Gizlilik kararları | H3 | 4 mini vaka: paylaş / anonimleştir / paylaşma | Risk açıklaması |
| 8. Eylem planı + değerlendirme | H1–H3, transfer | 5 soru; kendi işi için 1 kullanım + 1 doğrulama + 1 gizlilik kuralı | Gerekçeli |

**Gerekçe.** Gerçek model çağrısı olmadan deterministik, güvenli ve çevrimdışı çalışan bir deneyim; öğrenme hedefi "modeli kullanmak" değil "istek, doğrulama ve gizlilik kararı vermek".

**Yapıldığı haliyle (as-built).** Görsel kimlik: koyu sahne, indigo başlık, soldaki ders menüsü çekmecesi, her ekranda kodla çizilmiş izometrik sahne (`js/izo.js`). Atölyede 4 grup (rol, girdi/kısıt, biçim, görev) × 3 seçenek vardır; "İstemi çalıştır" seçimin kalitesine göre önceden yazılmış zayıf/orta/iyi çıktıyı gösterir ve her grup için gerekçe verir. Doğrulama ekranında kaynak politika alıntısına karşı 4 iddia sınıflandırılır (uyumlu / çelişiyor / kaynakta yok). Gizlilik vakalarında doğru karar tek yanıta indirgenmez: anonimleştir / paylaş / paylaşma. Son ekranda 3 eylem planı seçimi kaydedilir. Puanlama: yalnızca 5 soruluk değerlendirme (≥%80).

## 5. Teslimat durumu

| Teslimat | Durum |
|---|---|
| Plan ve storyboard (bu doküman) | Tamam (4 modül) |
| Modül 1 (İş Başında Yapay Zekâ) çalışan prototip + SCORM 1.2 paketi | Tamam (önceki "Doğru Veri, Doğru İşlem" modülünün yerini aldı) |
| Modül 1 testleri, storyboard, case study, README | Tamam |
| Modül 2 çalışan prototip + SCORM 1.2 paketi, testler, case study | Tamam |
| Modül 3 çalışan prototip + SCORM 1.2 paketi, testler | Tamam |
| Modül 4 çalışan prototip + SCORM 1.2 paketi, testler | Tamam |
| Portfolyo giriş sayfası (`index.html`) | Tamam |
| Modül 3 ve 4 case study | Tamam |
| Yönetici gözüyle genel değerlendirme raporu | İsteğe bağlı sonraki adım |
