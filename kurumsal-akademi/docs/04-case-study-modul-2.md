# Case Study: Modül 2, Zor Görüşmeyi Yönetmek

## Problem
Yeni yöneticiler zor performans görüşmelerinden ya kaçınır ya da yargılayıcı konuşur. Çalışan savunmaya geçer ve davranış değişmez.

## Çözüm
6–7 dakikalık, dallanan bir görüşme provası. Öğrenen ekip lideridir; karşısında analist Elif vardır. İK iş ortağı Selin koçluk yapar. Her karar Elif'in tepkisini, yüz ifadesini ve iki göstergeyi (Güven, Netlik) değiştirir. SBI (Durum-Davranış-Etki) modeli önce kısa bir kart etkileşimiyle öğretilir, sonra görüşmede uygulanır, en sonda 5 soruyla ölçülür.

## Tasarım kararları
1. **Sonucu göster.** Geri bildirimin değeri tek bir cümlede değil, karşıdakinin tepkisinde görülür; bu yüzden dallanma var.
2. **Görüşmeyi puanlama.** Tek bir "doğru cümle" yoktur. Görüşme geri bildirim ve beceri rozetidir; yalnızca gözlem/yargı ayrımını ölçen 5 soru puanlanır (%80).
3. **Güçlü seçim her zaman aynı yerde değil.** Doğru şıklar A, B, C arasında dağıtıldı; "uzun olan doğru" ipucu da bilerek kırıldı (orta ve zayıf seçenekler de ayrıntılı).
4. **Renk tek başına anlam taşımaz.** Her seçimde metinle ("En güçlü ✓", "Geliştirilebilir ✗", "Kısmen işe yarar ~") ve okla (↑ ↓ →) belirtilir.
5. **Kapsayıcı karakterler.** Selin ve Elif özgün SVG avatarlardır; ifadeleri (nötr, gülümseme, endişe, savunma, kapalı, rahat) hikâyeyi taşır. Dekoratif kopyalar ekran okuyucudan gizlidir.
6. **Çevrimdışı ve hafif.** Tüm görseller kodla çizilir; dış dosya, font ya da CDN yoktur.

## Teknik özet
SCORM 1.2, `masteryscore` 80, `suspend_data` yaklaşık 200 karakter, en iyi puan ve "geçti" kalıcı. Ekran akışı, dallanma, yeniden deneme, devam etme ve çevrimdışı çalışma 109 otomatik doğrulamayla sınandı (sahte LMS + jsdom).

## Dürüst sınırlar
Gerçek LMS, ekran okuyucu, diğer tarayıcılar ve gerçek öğrenenlerle test edilmedi. Öğrenme etkisi ölçülmedi; bu bir prototiptir.
