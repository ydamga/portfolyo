# Kurumsal Akademi: 4 Modüllük SCORM Portfolyosu

Kurumsal öğrenme ve gelişim alanı için hazırlanmış, bir portfolyo. Modül 1 ve 4 gerçek bir yapay zekâ servisi çağırmaz; çıktılar önceden yazılmış örneklerdir.

## Durum

| Modül | Durum |
|---|---|
| 1. İş Başında Yapay Zekâ: Daha İyi Prompt, Daha Güvenilir Sonuç (AI Literacy) | Hazır, çalışan prototip (SVG karakterli 7 animasyonlu sahne) + SCORM 1.2 paketi |
| 2. Zor Görüşmeyi Yönetmek (Behavioral & Leadership) | Hazır, çalışan prototip (avatar sahneli, cam arayüz) + SCORM 1.2 paketi |
| 3. Eğitim KPI'larını Excel'de Okumak (Analytics) | Hazır, çalışan prototip (Excel çalışma kitabı ve etkileşimli KPI panosu) + SCORM 1.2 paketi |
| 4. Yapay Zekâyı İş Yerinde Güvenle Kullanmak (AI-Powered Learning) | Hazır, çalışan prototip (izometrik sahneler, LMS oynatıcı düzeni) + SCORM 1.2 paketi |

Portfolyo giriş sayfası: `index.html` (her modül kendi renk alanında: amaç, hedef kitle, yöntem, gerçek ekran görüntüsü ve sayfada açılan canlı önizleme; ayrıca beceriler ve karşılaştırma tablosu). Depo kökündeki `index.html` buraya yönlendirir; GitHub Pages ile yayınlanabilir.

## Klasör yapısı

```
kurumsal-akademi/
├── index.html                            # Portfolyo giriş sayfası
├── gorseller/                            # Giriş sayfası için modül ekran görüntüleri (WebP)
├── docs/
│   ├── 01-proje-plani-ve-storyboard.md   # Plan, tasarım sistemi, 4 modülün storyboard'u
│   ├── 02-test-ve-dogrulama.md           # Test senaryoları, kontrol listesi, sınırlar
│   ├── 03-case-study-modul-1.md          # Modül 1 (İş Başında Yapay Zekâ) tasarım kararları
│   ├── 04-case-study-modul-2.md          # Modül 2 tasarım kararları
│   ├── 05-case-study-modul-3.md          # Modül 3 tasarım kararları
│   └── 06-case-study-modul-4.md          # Modül 4 tasarım kararları
├── ortak/                                # Ortak kaynak: tasarım sistemi + SCORM sarmalayıcı
│   ├── akademi.css
│   └── scorm-wrapper.js
├── moduller/
│   ├── modul-1-ai-at-work/               # Animasyonlu modül; kendi SCORM sarmalayıcısı (js/scorm.js), storyboard ve test belgesi docs/ altında
│   ├── modul-2-zor-gorusme/              # Avatar sahneli modül (js/gorsel.js: SVG karakter ve ofis)
│   ├── modul-3-kpi-analizi/              # Excel görünümlü KPI modülü (SVG grafikler)
│   └── modul-4-yapay-zeka/               # İzometrik sahneli modül (js/izo.js)
├── test/
│   ├── mock-lms.js                       # SCORM 1.2 API taklidi
│   ├── test-modul1.js                    # Senaryo testleri (142)
│   ├── test-modul2.js                    # Senaryo testleri (109)
│   ├── test-modul3.js                    # Senaryo testleri (85)
│   └── test-modul4.js                    # Senaryo testleri (68)
├── dist/                                 # build.py'nin ürettiği ZIP paketleri (depoda tutulmaz)
└── build.py                              # Paketleme ve manifest doğrulama
```

## Modülü açma

**Tarayıcıda (LMS olmadan):** önce `index.html` giriş sayfasını açın ve modül kartlarından gidin, ya da `moduller/<modül-klasörü>/index.html` dosyasını doğrudan açın. Dış bağlantı gerekmez. LMS bulunamayınca modül tek başına çalışır, ilerleme kaydedilmez.

## Paketi yeniden oluşturma

```bash
python3 build.py
```

Bu komut `ortak/` dosyalarını, manifestinde bunları listeleyen modüllere kopyalar (Modül 1 kendi sarmalayıcısını taşır), manifesti doğrular (kimlikler, dosya listesi, masteryscore, dış bağımlılık), ve `dist/` altında ZIP üretir. `imsmanifest.xml` ZIP'in kök dizinindedir.

## Testleri çalıştırma

```bash
npm install jsdom          # bir kez
node test/test-modul1.js   # 142 doğrulama
node test/test-modul2.js   # 109 doğrulama
node test/test-modul3.js   # 85 doğrulama
node test/test-modul4.js   # 68 doğrulama
```

jsdom başka bir yerdeyse: `JSDOM_YOLU=/yol/node_modules/jsdom node test/test-modul1.js`

Testler, SCORM 1.2 veri modelini taklit eden bir sahte LMS ile yapılır. Gerçek LMS testinin yerine geçmez (bkz. `docs/02-test-ve-dogrulama.md`).

## LMS'e yükleme (SAP SuccessFactors dahil)

1. `python3 build.py` ile paketleri üretin, ardından `dist/` altındaki ilgili ZIP dosyasını (ör. `modul-2-zor-gorusme-scorm12.zip`) **açmadan** yükleyin.
2. İçerik türü olarak **SCORM 1.2** seçin.
3. Önce bir **test ortamında** yükleyip `docs/02-test-ve-dogrulama.md` içindeki manuel kontrol listesini uygulayın.

> Bu paketler gerçek bir SAP SuccessFactors ortamında test edilmemiştir; uyumluluk doğrulanmış değildir.

## SCORM yaklaşımı (özet)

- Standart: **SCORM 1.2** (`cmi.core.*`). Başarı eşiği %80 (`adlcp:masteryscore`).
- Durum: `incomplete` → `passed` / `failed`; puan: `score.raw` (en iyi puan korunur).
- Devam etme: `lesson_location` + `suspend_data` (kompakt JSON); çıkış: yarım/başarısızsa `suspend`.
- Tamamlama ve başarı arayüzde ayrı gösterilir; SCORM 1.2'nin tek durum alanı nedeniyle LMS'ye "tamamladı ama başaramadı" ayrı gönderilemez. Bunun için SCORM 2004 seçeneği `docs/01-proje-plani-ve-storyboard.md` içinde açıklanmıştır.
