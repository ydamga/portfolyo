# Test ve Doğrulama: İş Başında Yapay Zekâ

## Ne test edildi, ne edilmedi

| Yöntem | Kapsam |
|---|---|
| Otomatik (jsdom + SCORM 1.2 sahte LMS), `node test/test.js` | **142 doğrulama, hepsi geçti** |
| Headless Chromium ekran görüntüleri (1280 ve 390 px; animasyonlu ve azaltılmış) | Yedi sahne, ifade/poz, balonlar, mobil düzen gözle incelendi |
| Yatay taşma ölçümü (Chromium) | 320, 390, 768, 1024 px genişliklerde yedi sahnenin hiçbirinde yatay taşma yok |
| **Test EDİLMEDİ** | Gerçek LMS (SAP SuccessFactors dahil), gerçek ekran okuyucu, Safari/Firefox, dokunmatik cihaz, gerçek öğrenenle süre/anlaşılırlık. Gerçek bir yapay zekâ servisi bu modülde yoktur. |

## Otomatik senaryolar

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

## Teslimat kontrol listesi (özet cevaplar)

| Soru | Cevap |
|---|---|
| Bütün butonlar çalışıyor mu? | Otomatik testte tıklandı: seçenekler, bileşenler, Önceki/Sonraki, Yeniden oynat, Atla, Azalt, Sonraki soru, Yeniden dene, Değerlendirmeye dön. Ses düğmesi gizli (ses yok). |
| Her sahneye doğru ilerleniyor mu? | Evet; kapılar yalnızca karardan sonra açılır. |
| Yanlış cevaplara doğru geri bildirim? | Evet; sahne içinde seçeneğe özel, değerlendirmede gerekçeli ve doğru cevap işaretli. |
| Puanlama doğru mu? | 0/5, 3/5, 4/5, 5/5 senaryoları test edildi. |
| Yeniden deneme çalışıyor mu? | Evet; en iyi puan ve başarı kalıcı. |
| İnternet olmadan açılıyor mu? | Dış adres taraması temiz; jsdom'da ve Chromium'da dosyadan açıldı. |
| Mobil ve masaüstü? | 320–1280 px ölçüldü, taşma yok. Gerçek cihazda denenmedi. |
| Animasyonlar öğrenme amacını destekliyor mu? | Hareket yalnızca mesajı taşır (balon sırası, prompt'un oluşması, uydurma bilginin işaretlenmesi, verinin karartılması); süs döngüsü yoktur. Etkisi gerçek öğrenenle ölçülmedi. |
| SCORM gerçekten uygulandı mı? | Evet, tablo README'de; yalnızca sahte LMS ile doğrulandı. |

## Bilinen sınırlar

1. Soru ve seçenek sırası sabit; doğru şıklar farklı konumlara dağıtıldı. Soru havuzu ve karıştırma sonraki sürüm önerisidir.
2. Sürekli hareketler (göz kırpma, nefes) küçüktür ve azaltılınca durur; yine de bazı kullanıcılar için dikkat dağıtıcı olabilir.
3. Konuşan karakter ağız hareketi basit bir açılıp kapanmadır; dudak eşleşmesi yoktur ve ses olmadığı için gerekmez.
4. Modern tarayıcı gerekir (ES2015+, SVG, CSS `transform-box`); Internet Explorer desteklenmez.
5. Süre (6–7 dk) tahmindir.
