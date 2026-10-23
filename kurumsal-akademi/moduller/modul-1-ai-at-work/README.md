# AI at Work: Daha İyi Prompt, Daha Güvenilir Sonuç

Animasyonlu, etkileşimli, Türkçe HTML5 mikro öğrenme modülü (yaklaşık 6–7 dk, tahmini) ve SCORM 1.2 paketi.
**Kurgusal demo:** Ece, Mert, yönetici, çalışan bilgileri, tarihler ve yapay zekâ çıktıları kurgudur. Modül gerçek bir yapay zekâ servisi çağırmaz; gösterilen çıktılar önceden yazılmıştır ve ekranda "Kurgusal örnek çıktı" etiketi taşır.

Karakterler (Ece, Mert, asistan), ofis sahnesi ve simgeler bu proje için SVG ile sıfırdan çizildi; Vyond/Powtoon varlığı, logosu ya da karakteri kullanılmadı.

## Açma

`index.html` dosyasını bir tarayıcıda açın. İnternet, sunucu ya da dış dosya gerekmez. LMS bulunamazsa modül tek başına çalışır, ilerleme kaydedilmez ve son sahnede bu belirtilir.

## Klasör yapısı

```
ai-at-work/
├── index.html
├── css/styles.css            # Tasarım sistemi, karakter durumları (ifade/poz/konuşma), duyarlı düzen
├── js/
│   ├── icerik.js             # Yalnızca veri: sahneler, diyaloglar, seçenekler, kurgusal çıktılar, 5 soru
│   ├── karakterler.js        # SVG: Ece, Mert, asistan robotu, ofis sahnesi
│   ├── scorm.js              # SCORM 1.2 sarmalayıcı + Koprusu (durum -> veri modeli)
│   └── app.js                # Modül mantığı, animasyon motoru, puanlama, gezinme (LMS'ten bağımsız)
├── assets/audio/             # ses-listesi.js (şu an boş). Ses dosyaları sizin üretmenizi bekliyor; yoksa düğme gizli
├── tools/                    # seslendir.py (yapay zekâ sesi üretir), replikleri-cikar.js, ses-ayar.json, okunus.json
├── imsmanifest.xml           # SCORM 1.2 manifesti (masteryscore 80)
├── build.py                  # Doğrulayıp dist/ai-at-work-scorm12.zip üretir
├── dist/ai-at-work-scorm12.zip
├── test/test.js, mock-lms.js # 168 otomatik doğrulama (jsdom + sahte LMS)
└── docs/
    ├── storyboard.md         # Görsel yön, 7 sahne, hedef-değerlendirme eşleştirmesi, durum modeli
    ├── seslendirme-metni.md  # Seslendirilecek 24 replik (kimlik, konuşan, metin)
    └── test-ve-dogrulama.md  # Test sonuçları, kontrol listesi, sınırlar
```

Görseller ayrı dosya değil, kodla çizilir (`karakterler.js`), bu yüzden `assets/characters|scenes|icons` klasörleri yoktur. Bilinçli bir sadelik tercihidir: ifade ve poz CSS ile değiştirilebilir, dış dosya riski yoktur.

## Öğrenme akışı

7 sahne: belirsiz istek → prompt'un 5 bileşeni → zayıf prompt'u iyileştir → çıktıyı doğrula → veri güvenliği → 5 soruluk değerlendirme → kapanış. Hedefler ve değerlendirme eşleştirmesi için `docs/storyboard.md`.

Her sahne bir karar ister; karar verilmeden "Sonraki" kapalıdır ve nedeni altta yazar. Sahne içi kararlar geri bildirim içindir, puana girmez. Yalnızca Sahne 6'daki 5 soru puanlanır (%80 = en az 4/5).

## Kontroller

Önceki/Sonraki, ilerleme çubuğu ve sahne numarası, **Yeniden oynat** (cevabı silmez), **Animasyonu atla**, **Animasyonları azalt** (işletim sistemi `prefers-reduced-motion` tercihini de dikkate alır; azaltılınca tüm diyalog hemen görünür), klavye (Tab/Enter/Boşluk; Alt+←/→). **Seslendirme:** modül sese hazırdır ama bu pakette **ses dosyası yoktur**; bu yüzden düğme şu an gizlidir (aşağıda "Seslendirme" bölümü). Tüm diyalog sahnede ve "Diyalog metni" bölümünde yazılıdır.

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

## Seslendirme (yapay zekâ sesi)

**Durum:** altyapı hazır ve test edildi; **gerçek sesler üretilmedi.** Sesleri üreten araca bu modülün geliştirildiği ortamdan erişilemedi (ağ kısıtı), bu yüzden seslendirme sizin bilgisayarınızda tek komutla üretilir. `tools/seslendir.py` içindeki Edge ve Azure bağlantı kodu **hiç çalıştırılıp denenmedi**; yalnızca betiğin geri kalanı (plan, dosya adları, özet eşleşmesi, liste ve manifest güncelleme) sessiz yer tutucu dosyalarla denendi.

Neyi seslendirir: Ece, Mert ve yönetici mesajı için 24 replik, yaklaşık 220 kelime (`docs/seslendirme-metni.md`). Soru metinleri, geri bildirim kutuları ve yapay zekâ çıktıları seslendirilmez; ekrandaki yazı her zaman eksiksizdir.

Sesleri üretme (Python 3 ve Node gerekir):

```bash
node tools/replikleri-cikar.js          # replikler.json ve docs/seslendirme-metni.md
pip install edge-tts
python3 tools/seslendir.py --motor edge # ücretsiz; resmî olmayan Microsoft Edge okuma servisi
# resmî alternatif: AZURE_SPEECH_KEY ve AZURE_SPEECH_REGION tanımlayıp --motor azure
python3 build.py                        # sesler pakete girer
```

Varsayılan sesler: Ece = `tr-TR-EmelNeural`, Mert ve yönetici mesajı = `tr-TR-AhmetNeural` (`tools/ses-ayar.json`). Telaffuz düzeltmesi için `tools/okunus.json`. Üretimden sonra **mutlaka dinleyin**: "prompt", "AI" gibi sözcüklerin okunuşu ve cümle ritmi ancak duyularak değerlendirilebilir. Sesler yapay zekâ ürünüdür, arayüzde bu belirtilir. Kullanacağınız servisin kullanım koşullarını ve kurumunuzun sentetik ses politikasını kontrol edin.

Davranış: ses varsayılan olarak **kapalıdır** (tarayıcılar kullanıcı eylemi olmadan ses çalmayı engelleyebilir); üst çubuktaki **Seslendirme** düğmesi açar ve sahneyi sesle baştan oynatır. Animasyon açıkken sahne sese göre ilerler (ses bitmeden sonraki replik başlamaz; takılırsa 30 sn sonra geçer). Animasyon azaltılmışsa ya da sahne atlanmışsa ses kendiliğinden başlamaz; **Yeniden oynat** repliklerini sırayla seslendirir. Her ses, üretildiği metnin özetiyle eşleşir: metni sonradan değiştirirseniz eski ses atlanır, modül o satırda sessiz kalır (`build.py` bunu uyarır). Ses dosyası hiç yoksa düğme gizlenir.

`python3 tools/seslendir.py --temizle` üretilmiş her şeyi siler ve sessiz sürüme döner. `--motor sessiz` yalnızca boru hattını denemek içindir ve `build.py` bu sesler varken paket üretmeyi reddeder.

## Paketi yeniden oluşturma

```bash
python3 build.py
```

Manifesti doğrular (kimlikler, dosya listesi, masteryscore, dış bağımlılık, manifestte unutulan dosya) ve `dist/ai-at-work-scorm12.zip` üretir.

## Testleri çalıştırma

```bash
npm install jsdom
node test/test.js          # 168 doğrulama
# jsdom başka yerdeyse: JSDOM_YOLU=/yol/node_modules/jsdom node test/test.js
```

Sonuçlar ve kontrol listesi: `docs/test-ve-dogrulama.md`.

## LMS'e yükleme

ZIP'i **açmadan** yükleyin, içerik türü **SCORM 1.2** seçin, önce bir **test ortamında** deneyin. Bu paket gerçek bir LMS'te test edilmemiştir.
