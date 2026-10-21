# Case Study: Modül 4, Yapay Zekâyı İş Yerinde Güvenle Kullanmak

## Problem
Çalışanlar üretken yapay zekâyı belirsiz isteklerle kullanır, çıktıyı doğrulamadan paylaşır ve kişisel ya da gizli veriyi araca yapıştırır.

## Çözüm
6–7 dakikalık, izometrik sahnelerle anlatılan bir oynatıcı deneyimi. Öğrenen önce geliştirilebilir bir istemin genel kalan çıktısını görür, dört istem bileşenini keşfeder, eksik bileşenleri bulur, atölyede kendi istemini kurar, çıktıyı kaynak politikayla doğrular ve dört gizlilik vakasında karar verir. Son adım 5 soruluk değerlendirme ve kişisel eylem planıdır.

## Tasarım kararları
1. **Model çağırmadan öğret.** Çıktılar önceden yazılmış ve "Örnek çıktı" etiketlidir. Deneyim deterministik, güvenli ve çevrimdışıdır; hedef modeli kullanmak değil istek, doğrulama ve gizlilik kararı vermektir.
2. **Önce sonuç, sonra kural.** Geliştirilebilir istemin çıktısı önce gösterilir; bileşenler bu boşluğa yanıt olarak öğretilir.
3. **Atölyede neden-sonuç.** 4 grup × 3 seçenek; çalıştırınca seçimin kalitesine göre zayıf, orta ya da iyi çıktı gelir ve her grup için gerekçe verilir.
4. **Doğrulama üç sınıflı.** İddialar "uyumlu", "çelişiyor" ya da "kaynakta yok" olarak sınıflanır; yapay zekâ çıktısında en zor ayrım budur.
5. **Gizlilikte tek doğru cümle yok.** Anonimleştir, paylaş ve paylaşma seçenekleri vakaya göre değişir; doğru karara ulaşana dek tekrar edilir ve gerekçe okunur.
6. **Menü ve kapılar.** Soldaki ders menüsü kademeli açılır; kilitli dersler `aria-disabled` ile bildirilir. Metin, ✓/✗ ile desteklenir, yalnızca renge bağlı değildir.
7. **Görseller kodla.** İzometrik sahneler satır içi SVG'dir (`js/izo.js`); dış dosya yoktur. `prefers-reduced-motion` desteklenir.

## Teknik özet
SCORM 1.2, `masteryscore` 80, en iyi puan ve "geçti" kalıcı. Menü davranışı, kapılar, atölye kalite kademeleri, puanlama, devam etme ve çevrimdışı çalışma 68 otomatik doğrulamayla sınandı (sahte LMS + jsdom).

## Dürüst sınırlar
Gerçek LMS, ekran okuyucu, diğer tarayıcılar ve gerçek öğrenenlerle test edilmedi. Çıktılar yapay zekâ ürünü değildir, yazılmış örneklerdir. Öğrenme etkisi ölçülmedi; bu bir prototiptir.
