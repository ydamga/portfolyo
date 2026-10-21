# Case Study: Modül 3, Eğitim KPI'larını Excel'de Okumak

## Problem
Eğitim ekipleri veriyi toplar ama yönetici özetine dönüştüremez. Eğitim bazlı oranların basit ortalaması alınır, büyük gruplar küçük gruplarla aynı ağırlığı taşır ve düşük performanslı eğitim gözden kaçar.

## Çözüm
6–7 dakikalık, Excel çalışma kitabı görünümlü bir analiz görevi. Öğrenen Q3 verisini açar, tamamlama oranını formülle hesaplar, filtreli bir panoda eğitim ve dönemleri karşılaştırır, bulguyu yorumlar, aksiyon seçer ve üç cümlelik bir yönetici özeti kurar. Son adım 5 soruluk değerlendirmedir.

## Tasarım kararları
1. **Hesap ve yorum aynı veride.** "Formülü bilen ama yorumlayamayan" boşluğunu kapatmak için aynı veri seti hem hesap hem pano hem özet ekranında kullanılır.
2. **Tutarlı veri.** 500 kayıt, 395 tamamlama: ağırlıklı oran %79,0, basit ortalama %80,0. Haftalık ve aylık kırılımlar bu toplamlara uyar; testler tutarlılığı kontrol eder. Aylarda memnuniyet ve sınav gösterilmez çünkü veri çeyreklik toplanmıştır; sahte hassasiyet üretilmez.
3. **Keşfettiren pano.** Ekranı geçmek için en az 3 farklı eğitim, 3 metrik sekmesi ve bir dönem değişikliği gerekir. Pano pasif okunmaz, kurcalanır.
4. **Esnek giriş.** "65", "%65" ve "0,65" kabul edilir; çünkü hedef biçim ezberi değil, hesabı anlamaktır. Üçüncü yanlışta yanıt açıklanır.
5. **Grafikler erişilebilir.** Çizgi ve çubuk grafikler satır içi SVG'dir; her biri `aria-label` taşır ve verinin tablo eşdeğeri açılır bölümde sunulur.
6. **Excel görünümü temsilidir.** Sayfa sekmeleri ve formül çubuğu, bir ürünü kopyalamadan çalışma kitabı mantığını anlatır.
7. **Yalnızca değerlendirme puanlanır.** Etkinlikler geri bildirim içindir; geçme eşiği %80.

## Teknik özet
SCORM 1.2, `masteryscore` 80, en iyi puan ve "geçti" kalıcı, `suspend_data` kompakt JSON. Veri tutarlılığı, formül ayrıştırma, pano filtreleri, kapılar, puanlama, devam etme ve çevrimdışı çalışma 85 otomatik doğrulamayla sınandı (sahte LMS + jsdom).

## Dürüst sınırlar
Gerçek LMS, ekran okuyucu, diğer tarayıcılar ve gerçek öğrenenlerle test edilmedi. Excel görünümü temsilidir. Öğrenme etkisi ölçülmedi; bu bir prototiptir.
