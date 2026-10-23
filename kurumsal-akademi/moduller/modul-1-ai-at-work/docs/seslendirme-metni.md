# Seslendirme metni

Bu dosya `node tools/replikleri-cikar.js` ile `js/icerik.js` içinden üretilir; elle düzenlemeyin.
Her satır tek bir ses dosyasına karşılık gelir (`assets/audio/<kimlik>.mp3`). Metin değişirse sesi yeniden üretin; eski ses otomatik atlanır.
Kurgusal demo: kişiler ve veriler gerçek değildir. Sesler yapay zekâ ile üretilir.

Toplam: 24 replik · 219 kelime


## Sahne 1

| Kimlik | Kim | Metin |
|---|---|---|
| `s1-b0` | Yönetici (mesaj) | “Ece, işe yeni başlayanlar için bir eğitim duyurusu lazım. Öğleye kadar hazırlayabilir misin?” |
| `s1-b1` | Ece | Zamanım az. Yapay zekâ asistanından yardım isteyeyim. |
| `s1-b4` | Ece | Hmm… Kime, ne zaman, ne için? Bu metin işime yaramaz. |

## Sahne 2

| Kimlik | Kim | Metin |
|---|---|---|
| `s2-b0` | Mert | Ece, asistan zihnini okuyamaz. Ona beş şeyi söylersen sonuç değişir. |
| `s2-b1` | Ece | Beş şey mi? Göster bakalım. |
| `s2-bl-rol` | Mert | Önce rol ve bağlam. Asistana “kim gibi” yanıt vermesi gerektiğini söyle. |
| `s2-bl-gorev` | Mert | Görev: tam olarak ne yapmasını istediğini tek cümleyle yaz. |
| `s2-bl-kitle` | Mert | Hedef kitle: metni kim okuyacak? Dil ve ton buna göre değişir. |
| `s2-bl-cikti` | Mert | Çıktı biçimi: başlık mı, madde mi, e-posta mı? Biçimi sen belirle. |
| `s2-bl-kisit` | Mert | Kısıtlar: uzunluk, ton ve “bilmediğini uydurma” gibi sınırlar ver. |
| `s2-bitis` | Ece | Anladım! Ne istediğimi açıkça söylemem gerekiyormuş. |

## Sahne 3

| Kimlik | Kim | Metin |
|---|---|---|
| `s3-b0` | Mert | Şimdi sıra sende. İnsan Kaynakları, yeni başlayanlar için bir eğitim duyurusu istiyor. |
| `s3-b1` | Mert | İki prompt var. Hangisini asistana gönderirdin? |
| `s3-o0` | Mert | A'da rol, hedef kitle, biçim ve kısıt yok. Sonuç yine genel kalır. |
| `s3-o1` | Mert | B bağlamı, hedef kitleyi, biçimi ve kısıtları veriyor. Fark çıktıda görünüyor. |

## Sahne 4

| Kimlik | Kim | Metin |
|---|---|---|
| `s4-b1` | Ece | Harika, duyuru hazır! Hemen herkese göndereyim. |
| `s4-b2` | Mert | Dur bir dakika! Bu tarihi, saati ve yeri sen mi verdin? |
| `s4-b3` | Ece | Hayır… Asistan kendisi eklemiş gibi görünüyor. |

## Sahne 5

| Kimlik | Kim | Metin |
|---|---|---|
| `s5-b0` | Ece | Duyuruyu kişiselleştirmek için çalışan bilgilerini de ekleyeyim mi? |
| `s5-b2` | Mert | Bir dakika. Bu bilgileri nereye yazdığını biliyor musun? |

## Sahne 6

| Kimlik | Kim | Metin |
|---|---|---|
| `s6-b0` | Mert | Son tur! Beş kısa soru. Geçmek için en az 4 doğru gerekiyor. |

## Sahne 7

| Kimlik | Kim | Metin |
|---|---|---|
| `s7-b0` | Ece | Şimdi biliyorum: önce bağlamı ve görevi netleştireyim, çıktıyı ve kısıtları belirteyim. |
| `s7-b2` | Ece | Çıktıyı kaynağından doğruladım. Metinde kişisel veri de yok. |
| `s7-b3` | Mert | Harika iş, Ece! Duyuruyu güvenle gönderebilirsin. |
