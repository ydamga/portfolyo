# İş Başında Yapay Zekâ: Daha İyi Prompt, Daha Güvenilir Sonuç

> **Portfolyo içindeki konum:** Bu modül, Kurumsal Akademi portfolyosunda **Modül 1** olarak yer alır. Portfolyo içinde paket `../../build.py` ile `dist/modul-1-ai-at-work-scorm12.zip` olarak üretilir, testler `../../test/test-modul1.js` ile çalışır. Aşağıdaki yollar modülün bağımsız sürümüne göredir.

Animasyonlu, etkileşimli, Türkçe HTML5 mikro öğrenme modülü (yaklaşık 6–7 dk, tahmini) ve SCORM 1.2 paketi.
Karakterler (Ece, Mert, asistan), ofis sahnesi ve simgeler bu proje için SVG ile sıfırdan çizildi; Vyond/Powtoon varlığı, logosu ya da karakteri kullanılmadı.

## Açma

`index.html` dosyasını bir tarayıcıda açın. İnternet, sunucu ya da dış dosya gerekmez. LMS bulunamazsa modül tek başına çalışır, ilerleme kaydedilmez ve son sahnede bu belirtilir.

## Klasör yapısı

```
ai-at-work/
├── index.html
├── css/styles.css            # Tasarım sistemi, karakter durumları (ifade/poz/konuşma), duyarlı düzen
├── js/
│   ├── icerik.js             # Yalnızca veri: sahneler, diyaloglar, seçenekler, örnek çıktılar, 5 soru
│   ├── karakterler.js        # SVG: Ece, Mert, asistan robotu, ofis sahnesi
│   ├── scorm.js              # SCORM 1.2 sarmalayıcı + Koprusu (durum -> veri modeli)
│   └── app.js                # Modül mantığı, animasyon motoru, puanlama, gezinme (LMS'ten bağımsız)
├── assets/audio/             # Boş: ses dosyası yok, bu yüzden ses düğmesi gizli
├── imsmanifest.xml           # SCORM 1.2 manifesti (masteryscore 80)
├── build.py                  # Doğrulayıp dist/ai-at-work-scorm12.zip üretir
├── dist/ai-at-work-scorm12.zip
├── test/test.js, mock-lms.js # 142 otomatik doğrulama (jsdom + sahte LMS)
└── docs/
    ├── storyboard.md         # Görsel yön, 7 sahne, hedef-değerlendirme eşleştirmesi, durum modeli
    └── test-ve-dogrulama.md  # Test sonuçları, kontrol listesi, sınırlar
```

Görseller ayrı dosya değil, kodla çizilir (`karakterler.js`), bu yüzden `assets/characters|scenes|icons` klasörleri yoktur. Bilinçli bir sadelik tercihidir: ifade ve poz CSS ile değiştirilebilir, dış dosya riski yoktur.

## Öğrenme akışı

7 sahne: belirsiz istek → prompt'un 5 bileşeni → geliştirilebilir prompt'u iyileştir → çıktıyı doğrula → veri güvenliği → 5 soruluk değerlendirme → kapanış. Hedefler ve değerlendirme eşleştirmesi için `docs/storyboard.md`.

Her sahne bir karar ister; karar verilmeden "Sonraki" kapalıdır ve nedeni altta yazar. Sahne içi kararlar geri bildirim içindir, puana girmez. Yalnızca Sahne 6'daki 5 soru puanlanır (%80 = en az 4/5).

## Kontroller

Önceki/Sonraki, ilerleme çubuğu ve sahne numarası, **Yeniden oynat** (cevabı silmez), **Animasyonu atla**, **Animasyonları azalt** (işletim sistemi `prefers-reduced-motion` tercihini de dikkate alır; azaltılınca tüm diyalog hemen görünür), klavye (Tab/Enter/Boşluk; Alt+←/→). Ses: `assets/audio/` içinde ses dosyası olmadığından düğme **gizlidir**; seslendirme ve otomatik altyazı iddiası yoktur. Tüm diyalog sahnede ve "Diyalog metni" bölümünde yazılıdır.

## SCORM 1.2: ne gerçekten uygulandı

| Özellik | Durum |
|---|---|
| API bulma (üst pencere, opener), `LMSInitialize`, `LMSFinish` (tek sefer, `beforeunload`/`pagehide`/`unload`) | Uygulandı, sahte LMS ile test edildi |
| `cmi.core.lesson_status` | `passed` (başarı) · `failed` (denendi, başarılmadı) · `incomplete` (henüz değerlendirme yok) |
| `cmi.core.score.raw/min/max` | En iyi puan, 0–100 |
| `cmi.core.lesson_location` | Sahne kimliği (`s1`…`s7`) |
| `cmi.suspend_data` | Kompakt JSON (~100 karakter): sahne, kararlar, bileşen maskesi, cevaplar, deneme, en iyi puan, başarı, tamamlama |
| `cmi.core.exit` / `session_time` | `suspend` (başarılmadıysa), HHHH:MM:SS.SS |
| Başarı ≠ tamamlama | Uygulama ikisini ayrı izler (`g` ve `t`); arayüzde ayrı gösterilir. SCORM 1.2'de tek durum alanı olduğundan "tamamladı ama başaramadı" LMS'ye `failed` + gerçek puan olarak gider. Ayrı raporlama için SCORM 2004 gerekir. |
| Devam verisini güvenli işleme | Boyut sınırı, JSON ve tür denetimi, aralık sınırlama, kapı tutarlılığı (ör. sahte `e=6` ilk sahneye düşer). 9 bozuk girdiyle test edildi. |
| LMS yokken | Hata ekranı yok; çevrimdışı modda tam çalışır |
| Gerçek manifest, başlatma dosyası, ZIP | `imsmanifest.xml` zip kökünde, `index.html` başlatma dosyası |

**Uygulanmayan / doğrulanmayan:** gerçek bir LMS'te (SAP SuccessFactors dahil) yükleme ve raporlama; SCORM 2004.

## Paketi yeniden oluşturma

```bash
python3 build.py
```

Manifesti doğrular (kimlikler, dosya listesi, masteryscore, dış bağımlılık, manifestte unutulan dosya) ve `dist/ai-at-work-scorm12.zip` üretir.

## Testleri çalıştırma

```bash
npm install jsdom
node test/test.js          # 142 doğrulama
# jsdom başka yerdeyse: JSDOM_YOLU=/yol/node_modules/jsdom node test/test.js
```

Sonuçlar ve kontrol listesi: `docs/test-ve-dogrulama.md`.

## LMS'e yükleme

ZIP'i **açmadan** yükleyin, içerik türü **SCORM 1.2** seçin, önce bir **test ortamında** deneyin. Bu paket gerçek bir LMS'te test edilmemiştir.
