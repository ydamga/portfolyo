# Case Study: Modül 1, İş Başında Yapay Zekâ: Daha İyi Prompt, Daha Güvenilir Sonuç

## Problem
Çalışanlar üretken yapay zekâyı belirsiz isteklerle kullanır ("Bana bir eğitim duyurusu hazırla."), genel kalan bir metin alır. Daha kötüsü, asistanın verilmemiş tarih, saat ve yer uydurduğu çıktıyı doğrulamadan paylaşır ve prompt'a çalışan bilgisi ekler. Sorun aracı tanımamak değil; **isteği kurmak, çıktıyı sorgulamak ve veriyi korumak** alışkanlığının olmamasıdır.

## Hedef kitle ve hedefler
Farklı departmanlardaki kurumsal profesyoneller.
1. Etkili bir prompt'un temel bileşenlerini belirler (H1).
2. Geliştirilebilir bir prompt'u iyileştirir (H2).
3. Yapay zekâ çıktısını doğrular (H3).
4. Gizli veya kişisel bilgilerin paylaşılmasına ilişkin riskleri tanır (H4).

## Çözüm
Yaklaşık 6–7 dakikalık, yedi sahneli, animasyonlu bir mikro öğrenme. Pazarlama ekibinden Ece, yöneticisinden gelen "işe yeni başlayanlar için eğitim duyurusu" talebini yapay zekâ asistanıyla hazırlamaya çalışır; iş arkadaşı Mert her adımda onu durdurur ve bir sonraki alışkanlığı gösterir. Öğrenen her sahnede Ece'nin yerine karar verir.

## Tasarım kararları

| Karar | Gerekçe |
|---|---|
| Karakterli anlatı (Ece, Mert, asistan) | Konu bir kural listesi değil, gündelik bir iş anında kazanılan alışkanlıktır. Karakterlerin ifadesi (hayal kırıklığı, şaşkınlık, onay) karara bağlı geri bildirimi duygusal olarak da taşır. |
| Karakterler SVG ile sıfırdan çizildi | Vyond/Powtoon varlığı ya da hazır karakter kullanılmadı. İfade ve poz CSS ile değişir; dış dosya yoktur, paket çevrimdışı çalışır. |
| Hareket yalnızca mesajı taşır | Balonların sırası, prompt'un parça parça oluşması, uydurma bilginin işaretlenmesi, kişisel verinin karartılması. Süs amaçlı döngü yoktur. Animasyon atlanabilir, yeniden oynatılabilir, azaltılabilir; işletim sisteminin `prefers-reduced-motion` tercihi de dikkate alınır. |
| Önce sonuç, sonra kural | Sahne 1'de belirsiz isteğin genel çıktısı gösterilir; beş bileşen (rol/bağlam, görev, hedef kitle, çıktı biçimi, kısıtlar) bu boşluğa yanıt olarak öğretilir. |
| A/B karşılaştırmada iki çıktı yan yana | Geliştirilebilir ve güçlü prompt'un sonuçları aynı ekranda; bileşen kontrol listesi farkın nedenini gösterir. |
| Doğru seçimde uydurma bilgi "doğrulanacak" yer tutucusuna döner | H3'ü soyut bir uyarı yerine görünür bir dönüşümle öğretir. Yanlış seçimde işaretler kalır. |
| Kısmi çözüm ayrı bir sonuçtur | Sahne 5'te yalnızca adları silmek "yeterli" sayılmaz; kalan hassas veri işaretli kalır. Üç seçeneğin üç farklı sonucu vardır. |
| Sahne içi kararlar puansız | Keşif ve geri bildirim için. Yalnızca Sahne 6'daki 5 soru puanlanır (%80 = 4/5), her hedef en az bir soruyla ölçülür. |
| Ses yok, iddia da yok | `assets/audio/` boş olduğu için ses düğmesi gizlidir. Tüm diyalog sahnede ve "Diyalog metni" bölümünde yazılıdır. |

## Etkileşimler
Neden seçme · beş bileşen kartıyla prompt kurma · A/B prompt ve çıktı karşılaştırma · uydurma bilgiyi yakalama · hassas veriyi karartma · gerekçeli 5 soruluk değerlendirme · yanlışları gözden geçirme · sınırsız yeniden deneme · kaldığı yerden devam.

## SCORM
SCORM 1.2; `passed` / `failed` / `incomplete`, en iyi puan, `lesson_location` (sahne kimliği), kompakt `suspend_data`, bozuk devam verisine karşı güvenli işleme. Modül kendi sarmalayıcısını (`js/scorm.js`) taşır; ortak `ortak/` dosyalarını kullanmaz. 142 otomatik doğrulama, sahte LMS ile.

## Ayrıntı
- Storyboard ve görsel yön: `moduller/modul-1-ai-at-work/docs/storyboard.md`
- Test sonuçları: `moduller/modul-1-ai-at-work/docs/test-ve-dogrulama.md` ve `docs/02-test-ve-dogrulama.md`
