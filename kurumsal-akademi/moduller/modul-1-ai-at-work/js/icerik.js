/*
 * İçerik verisi: sahneler, diyaloglar, seçenekler, örnek çıktılar ve değerlendirme.
 * Mantık app.js içindedir; bu dosya yalnızca veri taşır.
 */
(function (global) {
  "use strict";

  var SAHNELER = [
    {
      id: "s1", ad: "Belirsiz bir istek", hedef: "H1 · Daha iyi ne yapılabileceğini fark et",
      ton: "sicak", ikon: "soru",
      etiket: "Ofis sahnesi: Ece masasında, yanında küçük yapay zekâ asistanı. Ece düşünceli.",
      ece: { ifade: "notr", poz: "yaz" }, mert: null, asistan: "bosta",
      beats: [
        { eylem: "bildirim", ece: { ifade: "dusunceli", poz: "yaz" }, sure: 2600,
          metin: "“Ece, işe yeni başlayanlar için bir eğitim duyurusu lazım. Öğleye kadar hazırlayabilir misin?”" },
        { kim: "ece", ece: { ifade: "gulumse", poz: "yaz" }, metin: "Zamanım az. Yapay zekâ asistanından yardım isteyeyim." },
        { eylem: "yazma", ece: { ifade: "notr", poz: "yaz" }, asistan: "yaziyor", prompt: "Bana bir eğitim duyurusu hazırla." },
        { eylem: "cikti", cikti: "genel", ece: { ifade: "dusunceli", poz: "cene" }, asistan: "bosta", sure: 1800 },
        { kim: "ece", ece: { ifade: "hayalkirikligi", poz: "cene" }, metin: "Hmm… Kime, ne zaman, ne için? Bu metin işime yaramaz." }
      ],
      soru: {
        metin: "Sence bu prompt neden yeterince etkili değil?",
        dogru: 1,
        secenekler: [
          { m: "Yapay zekâ Türkçe duyuru yazamaz.",
            b: "Yapay zekâ asistanları Türkçe metin üretebilir. Sorun dilde değil, isteğin içeriğinde.",
            ece: { ifade: "dusunceli", poz: "cene" } },
          { m: "Hedef kitle, amaç ve biçim gibi bağlam verilmedi.",
            b: "Doğru. Asistan boşlukları tahminle doldurdu. Belirsiz bir istek, genel ve kullanılamaz bir sonuç üretir.",
            ece: { ifade: "gulumse", poz: "yaz" } },
          { m: "Prompt kısa olduğu için asistan yavaş çalıştı.",
            b: "Sorun hız değil, netlik. Önemli olan prompt'un uzunluğu değil, istenenin ne kadar açık tanımlandığıdır.",
            ece: { ifade: "dusunceli", poz: "cene" } }
        ],
        sonuc: "Yapay zekâ, ne istediğini bilmediğinde tahmin eder. Tahmin genelde genel geçer olur."
      }
    },
    {
      id: "s2", ad: "İyi prompt'un anatomisi", hedef: "H1 · Beş bileşeni tanı",
      ton: "nane", ikon: "ampul",
      etiket: "Ofis sahnesi: Mert, Ece'ye elindeki tabletle bir şeyler anlatıyor. İkisi de gülümsüyor.",
      ece: { ifade: "notr", poz: "yaz" }, mert: { ifade: "notr", poz: "dur" }, asistan: "bosta",
      beats: [
        { kim: "mert", mert: { ifade: "gulumse", poz: "anlat" }, ece: { ifade: "gulumse", poz: "yaz" },
          metin: "Ece, asistan zihnini okuyamaz. Ona beş şeyi söylersen sonuç değişir." },
        { kim: "ece", ece: { ifade: "dusunceli", poz: "yaz" }, mert: { ifade: "gulumse", poz: "dur" },
          metin: "Beş şey mi? Göster bakalım." }
      ],
      bilesenler: [
        { id: "rol", ad: "Rol / bağlam", seg: "Kurumsal iletişim uzmanı rolünde,", no: 1,
          mert: "Önce rol ve bağlam. Asistana “kim gibi” yanıt vermesi gerektiğini söyle." },
        { id: "gorev", ad: "Görev", seg: "bir eğitim duyurusu yaz.", no: 2,
          mert: "Görev: tam olarak ne yapmasını istediğini tek cümleyle yaz." },
        { id: "kitle", ad: "Hedef kitle", seg: "işe yeni başlayan çalışanlara yönelik,", no: 3,
          mert: "Hedef kitle: metni kim okuyacak? Dil ve ton buna göre değişir." },
        { id: "cikti", ad: "Çıktı biçimi", seg: "Başlık, amaç, tarih için yer tutucu ve kayıt çağrısı içersin.", no: 4,
          mert: "Çıktı biçimi: başlık mı, madde mi, e-posta mı? Biçimi sen belirle." },
        { id: "kisit", ad: "Kısıtlar ve kalite ölçütleri", seg: "90 kelimeyi geçme, sıcak ama profesyonel ol, bilinmeyen tarihleri uydurma.", no: 5,
          mert: "Kısıtlar: uzunluk, ton ve “bilmediğini uydurma” gibi sınırlar ver." }
      ],
      /* Cümledeki sıra (görev cümlenin ortasında) */
      siralama: ["rol", "kitle", "gorev", "cikti", "kisit"],
      bitis: { ece: "Anladım! Ne istediğimi açıkça söylemem gerekiyormuş." }
    },
    {
      id: "s3", ad: "Prompt'u iyileştir", hedef: "H2 · İyi ve geliştirilebilir prompt'u ayırt et",
      ton: "lavanta", ikon: "onay",
      etiket: "Ofis sahnesi: Mert görevi veriyor, Ece iki prompt arasında düşünüyor.",
      ece: { ifade: "notr", poz: "yaz" }, mert: { ifade: "notr", poz: "dur" }, asistan: "bosta",
      beats: [
        { kim: "mert", mert: { ifade: "gulumse", poz: "anlat" }, ece: { ifade: "notr", poz: "yaz" },
          metin: "Şimdi sıra sende. İnsan Kaynakları, yeni başlayanlar için bir eğitim duyurusu istiyor." },
        { kim: "mert", mert: { ifade: "dusunceli", poz: "dur" }, ece: { ifade: "dusunceli", poz: "yaz" },
          metin: "İki prompt var. Hangisini asistana gönderirdin?" }
      ],
      gorev: "İnsan Kaynakları ekibi, işe yeni başlayan çalışanlara yönelik bir eğitim duyurusu hazırlatacak. Hangi prompt'u gönderirsin?",
      dogru: 1,
      secenekler: [
        { harf: "A", m: "Bir eğitim duyurusu yaz.",
          mert: "A'da rol, hedef kitle, biçim ve kısıt yok. Sonuç yine genel kalır.",
          b: "A tek başına anlaşılır görünüyor ama rol, hedef kitle, biçim ve kısıt içermiyor. Asistan yine tahmin yürütür ve genel bir metin üretir.",
          ece: { ifade: "hayalkirikligi", poz: "yaz" } },
        { harf: "B", m: "Kurumsal iletişim uzmanı rolünde, işe yeni başlayan çalışanlara yönelik, 90 kelimeyi geçmeyen, sıcak ama profesyonel bir eğitim duyurusu yaz. Başlık, amaç, tarih bilgisi için yer tutucu ve kayıt çağrısı içersin. Bilinmeyen tarihleri kendin uydurma.",
          mert: "B bağlamı, hedef kitleyi, biçimi ve kısıtları veriyor. Fark çıktıda görünüyor.",
          b: "Doğru. B; rol, hedef kitle, çıktı biçimi ve kısıtları içerdiği için asistanın tahmin yürütmesine gerek bırakmaz. “Tarihleri uydurma” kısıtı da bir sonraki sahnenin habercisi.",
          ece: { ifade: "mutlu", poz: "yaz" } }
      ],
      kontrol: [
        { ad: "Rol / bağlam", a: false, b: true },
        { ad: "Hedef kitle", a: false, b: true },
        { ad: "Çıktı biçimi", a: false, b: true },
        { ad: "Kısıtlar (uzunluk, ton, uydurma yasağı)", a: false, b: true }
      ]
    },
    {
      id: "s4", ad: "Her çıktıya güvenme", hedef: "H3 · Çıktıyı paylaşmadan önce doğrula",
      ton: "amber", ikon: "buyutec",
      etiket: "Ofis sahnesi: Mert elini kaldırıp Ece'yi durduruyor, asistan uyarı veriyor.",
      ece: { ifade: "gulumse", poz: "yaz" }, mert: null, asistan: "bosta",
      beats: [
        { eylem: "cikti-s4", ece: { ifade: "gulumse", poz: "yaz" }, asistan: "yaziyor", sure: 2600 },
        { kim: "ece", ece: { ifade: "mutlu", poz: "yaz" }, asistan: "bosta",
          metin: "Harika, duyuru hazır! Hemen herkese göndereyim." },
        { kim: "mert", eylem: "isaretle", mert: { ifade: "saskin", poz: "uyar" }, ece: { ifade: "saskin", poz: "yaz" }, asistan: "uyari",
          metin: "Dur bir dakika! Bu tarihi, saati ve yeri sen mi verdin?" },
        { kim: "ece", ece: { ifade: "dusunceli", poz: "cene" }, mert: { ifade: "ciddi", poz: "dur" },
          metin: "Hayır… Asistan kendisi eklemiş gibi görünüyor." }
      ],
      istem: "Yeni çalışanlar için kısa bir oryantasyon duyurusu yaz.",
      cikti: [
        [{ t: "Oryantasyon Günü Duyurusu", b: true }],
        [{ t: "Aramıza yeni katılan arkadaşlarımızı oryantasyon gününe bekliyoruz!" }],
        [{ t: "Eğitim " }, { u: 1, t: "14 Mart’ta" }, { t: ", " }, { u: 2, t: "saat 10:00’da" }, { t: ", " }, { u: 3, t: "3. kat toplantı salonunda" }, { t: " başlayacak. " }, { u: 4, t: "Katılım zorunludur." }]
      ],
      uydurma: { 1: "[tarih doğrulanacak]", 2: "[saat doğrulanacak]", 3: "[yer doğrulanacak]", 4: "[katılım koşulu doğrulanacak]" },
      soru: {
        metin: "Ece paylaşmak üzere. Sonraki adım ne olmalı?",
        dogru: 2,
        secenekler: [
          { m: "Metnin daha profesyonel görünmesi için yalnızca tasarımını değiştir.",
            b: "Görünüm iyileşir ama uydurma bilgi aynen kalır. Biçim, doğrulamanın yerini tutmaz.",
            sonuc: "Şık ama yanlış bir duyuru gider. Çalışanlar yanlış gün ve yerde bekler.",
            ece: { ifade: "dusunceli", poz: "cene" } },
          { m: "Metni hemen paylaş.",
            b: "Daha güvenli bir yol var. Tarih, saat ve yer asistanın tahminiydi. Yanlış bilgi paylaşıldıktan sonra düzeltmek hem zaman hem güven kaybettirir.",
            sonuc: "Yanlış bilgi herkese ulaşır; düzeltme e-postası gerekir ve duyurunun güveni zedelenir.",
            ece: { ifade: "saskin", poz: "yaz" } },
          { m: "Tarihi ve diğer kritik bilgileri doğrula.",
            b: "Doğru. Yapay zekâ akıcı yazar ama gerçekte olmayan bilgi de üretebilir. Kritik bilgiyi güvenilir kaynaktan kontrol etmek, paylaşan kişinin sorumluluğudur.",
            sonuc: "Doğrulanmamış bilgiler “doğrulanacak” olarak işaretlendi. Kaynaktan teyit edilince duyuru güvenle gider.",
            ece: { ifade: "mutlu", poz: "yaz" } }
        ],
        sonuc: "Akıcı bir metin, doğru bir metin demek değildir."
      },
      dogrulama: [
        { ad: "Tarih", kaynak: "İK eğitim takvimi" },
        { ad: "Saat", kaynak: "Eğitim sorumlusu" },
        { ad: "Yer", kaynak: "Oda rezervasyon sistemi" },
        { ad: "Katılım koşulu", kaynak: "İK politikası ya da yönetici" }
      ]
    },
    {
      id: "s5", ad: "Veri güvenliği", hedef: "H4 · Kişisel ve gizli veriyi koru",
      ton: "gece", ikon: "kalkan",
      etiket: "Ofis sahnesi (akşam): Ece düşünceli, Mert ciddi bir yüzle asistanı gösteriyor.",
      ece: { ifade: "dusunceli", poz: "cene" }, mert: null, asistan: "bosta",
      beats: [
        { kim: "ece", ece: { ifade: "dusunceli", poz: "cene" },
          metin: "Duyuruyu kişiselleştirmek için çalışan bilgilerini de ekleyeyim mi?" },
        { eylem: "hassas", asistan: "uyari", sure: 2000 },
        { kim: "mert", mert: { ifade: "ciddi", poz: "goster" }, ece: { ifade: "saskin", poz: "yaz" },
          metin: "Bir dakika. Bu bilgileri nereye yazdığını biliyor musun?" }
      ],
      taslak: [
        { t: "Aşağıdaki çalışanlar için kişisel birer hoş geldin mesajı yaz: " },
        { h: 1, t: "Ayşe Kaya", y: "[Çalışan A]" }, { t: " (" },
        { h: 2, t: "ayse.kaya@ornek.test", y: "[çıkarıldı]" }, { t: ", " },
        { h: 3, t: "maaş: 45.000 TL", y: "[çıkarıldı]" }, { t: "), " },
        { h: 4, t: "Can Demir", y: "[Çalışan B]" }, { t: " (" },
        { h: 5, t: "performans notu: düşük", y: "[çıkarıldı]" }, { t: ")." }
      ],
      soru: {
        metin: "Güvenli yaklaşım hangisi?",
        dogru: 0,
        secenekler: [
          { m: "Kişisel bilgileri çıkarır, anonim örnek kullanır, kurum politikasını kontrol ederim.",
            b: "Doğru. Kişisel ve gizli veriler yetkisiz araçlara girilmez. Onaylı bir araç olsa bile kurumun bilgi güvenliği politikası izlenir ve mümkünse anonimleştirilmiş örnek kullanılır.",
            sonuc: "Hassas parçalar çıkarıldı. Prompt artık kimseyi tanımlamıyor; asistan yalnızca kalıbı görüyor.",
            temizle: [1, 2, 3, 4, 5],
            ece: { ifade: "mutlu", poz: "yaz" } },
          { m: "Listeyi olduğu gibi yapıştırırım; araç zaten yardım etmek için var.",
            b: "Daha güvenli bir yol var. Yetkisiz bir araca girilen kişisel veri kontrolünüzden çıkar. Maaş, e-posta ve performans notu hem çalışanları hem kurumu riske atar.",
            sonuc: "Ad, e-posta, maaş ve performans notu yetkisiz bir araca gider. Veriyi geri almak mümkün olmayabilir.",
            temizle: [],
            ece: { ifade: "saskin", poz: "yaz" } },
          { m: "Yalnızca adları silerim; maaş ve performans notu kalabilir.",
            b: "İyi bir başlangıç, bir adım daha var. Ad silinse bile maaş, e-posta ve performans notu kişiyi tanımlayabilir ve hassastır. Anonimleştirme yalnızca ad silmekten ibaret değildir.",
            sonuc: "Adlar gizlendi ama e-posta, maaş ve performans notu hâlâ prompt'ta; kişi dolaylı yoldan tanımlanabilir.",
            temizle: [1, 4],
            ece: { ifade: "dusunceli", poz: "cene" } }
        ],
        sonuc: "Şüphedeysen paylaşma: önce veriyi çıkar, sonra politikaya bak."
      }
    },
    {
      id: "s6", ad: "Son değerlendirme", hedef: "H1–H4 · Öğrendiklerini dene",
      ton: "nane", ikon: "soru",
      etiket: "Ofis sahnesi: Mert ve Ece son değerlendirme için hazır.",
      ece: { ifade: "notr", poz: "yaz" }, mert: { ifade: "gulumse", poz: "dur" }, asistan: "bosta",
      beats: [
        { kim: "mert", mert: { ifade: "gulumse", poz: "anlat" }, ece: { ifade: "gulumse", poz: "yaz" },
          metin: "Son tur! Beş kısa soru. Geçmek için en az 4 doğru gerekiyor." }
      ]
    },
    {
      id: "s7", ad: "Kapanış", hedef: "Transfer · İşte uygula",
      ton: "gunes", ikon: "onay",
      etiket: "Ofis sahnesi: Ece mutlu, Mert onaylıyor, asistan sakin.",
      ece: { ifade: "mutlu", poz: "yaz" }, mert: { ifade: "gulumse", poz: "dur" }, asistan: "bosta",
      beats: [
        { eylem: "kur", kim: "ece", ece: { ifade: "mutlu", poz: "yaz" }, asistan: "yaziyor", sure: 3200,
          metin: "Şimdi biliyorum: önce bağlamı ve görevi netleştireyim, çıktıyı ve kısıtları belirteyim." },
        { eylem: "cikti-final", asistan: "bosta", ece: { ifade: "gulumse", poz: "yaz" }, sure: 1800 },
        { kim: "ece", eylem: "dogrula", ece: { ifade: "gulumse", poz: "yaz" },
          metin: "Çıktıyı kaynağından doğruladım. Metinde kişisel veri de yok." },
        { kim: "mert", mert: { ifade: "mutlu", poz: "anlat" }, ece: { ifade: "mutlu", poz: "yaz" },
          metin: "Harika iş, Ece! Duyuruyu güvenle gönderebilirsin." },
        { eylem: "mesajlar", mert: { ifade: "gulumse", poz: "dur" }, sure: 600 }
      ],
      mesajlar: [
        "Bağlamı ve görevi netleştir.",
        "İstenen çıktıyı ve kısıtları belirt.",
        "Çıktıyı doğrula ve verileri koru."
      ]
    }
  ];

  var SORULAR = [
    {
      h: "H1", metin: "Bir meslektaşın “toplantı notlarını özetle” diye yazdı ve sonucu dağınık buldu. Hangi ek, sonucu en çok netleştirir?",
      dogru: 1,
      s: [
        "İsteği aynı cümleyle iki kez yazıp acele ettiğini belirtmek",
        "Özetin okuyucusunu, 5 madde sınırını ve sorumlu kişileri belirtmek",
        "Cümlenin başına “lütfen”, sonuna teşekkür ekleyip tonu nazikleştirmek",
        "Aynı notu birkaç kez yükleyip en kısa görünen özeti seçmek"
      ],
      acik: "Hedef kitle, biçim ve kalite ölçütü eklemek belirsizliği azaltır. Nezaket sözcükleri ya da tekrar, asistanın neyi nasıl yapacağını netleştirmez."
    },
    {
      h: "H2", metin: "Gecikmiş bir sipariş için müşteriye özür e-postası yazdıracaksın. Hangi prompt en güçlüdür?",
      dogru: 3,
      s: [
        "Müşteriye gecikme hakkında kısa bir e-posta yaz.",
        "Müşteri hizmetleri uzmanı olarak özür dileyen, ayrıntılı ve uzun bir e-posta yaz; müşteriyi memnun edecek yeni teslim tarihini sen belirle.",
        "Özür e-postası lazım; hızlı yaz, kısa tut ve müşteriyi sakinleştir.",
        "Müşteri hizmetleri uzmanı olarak, 80 kelimeyi geçmeyen empatik bir özür yaz; tarih için yer tutucu bırak, tarih uydurma."
      ],
      acik: "Güçlü prompt rol, ton, uzunluk ve yer tutucuyla tarih uydurmayı yasaklar. 2. seçenek ayrıntılı görünür ama asistana tarih uydurma izni verir; bu da doğrulama sorunu yaratır."
    },
    {
      h: "H3", metin: "Asistan, raporuna “Pazar payımız %37’ye yükseldi” yazdı ama kaynak göstermedi. Raporu yöneticine göndermeden önce ne yapmalısın?",
      dogru: 0,
      s: [
        "Rakamı resmî ya da iç kaynaklarla kontrol eder, doğrulayamazsam çıkarırım.",
        "Rakam makul göründüğü için olduğu gibi gönderir, itiraz gelirse düzeltirim.",
        "Asistana “emin misin?” diye sorar, “evet” derse metni olduğu gibi gönderirim.",
        "Rakamı “yaklaşık” sözcüğüyle yumuşatır ve gönderirim."
      ],
      acik: "Asistanın kendi çıktısını onaylaması bağımsız bir doğrulama değildir. Yumuşatmak ya da makul bulmak da hatayı ortadan kaldırmaz; kaynakla karşılaştırmak gerekir."
    },
    {
      h: "H4", metin: "Müşteri şikâyet e-postalarını (ad, telefon, sipariş numarası) özetletmek istiyorsun ama kurumun onayladığı bir araç yok. En güvenli yaklaşım hangisi?",
      dogru: 2,
      s: [
        "E-postaları ücretsiz bir araca yapıştırır, işim bitince sohbet geçmişini silerim",
        "Yalnızca telefon numaralarını silip kalan metni özetlenmek üzere araca yapıştırırım",
        "Politikayı kontrol eder, gerekirse yalnızca anonim örnekle çalışırım",
        "Gizli sekme kullanıp tüm e-postaları ve müşteri bilgilerini araca yapıştırırım"
      ],
      acik: "Kişisel veri yetkisiz araca girdikten sonra silmek ya da gizli sekme kullanmak kontrolü geri getirmez. Ad ve sipariş numarası da kimliği belirler; önce politika, sonra anonimleştirme."
    },
    {
      h: "H4", metin: "Prompt'una ekleyeceğin çalışan örneğini anonimleştirmek istiyorsun. Hangisi en uygun örnektir?",
      dogru: 1,
      s: [
        "Ayşe K., Pazarlama ekibi, 31 yaşında, İstanbul ofisi",
        "Çalışan A, işe yeni başlayan, Pazarlama ekibi",
        "ayse.k@kurum.test, Pazarlama ekibi, işe yeni başlayan",
        "Sicil no 0042, Pazarlama ekibi, işe yeni başlayan"
      ],
      acik: "Ad, e-posta ve sicil numarası doğrudan kimlik belirtir. Yaş ve şehir gibi dolaylı bilgiler de kişiyi ortaya çıkarabilir. Genel ve tanımlayıcı olmayan bir örnek en güvenlisidir."
    }
  ];
  /* Örnek çıktılar (gerçek bir model çağrılmaz) */
  var CIKTILAR = {
    genel: [
      { t: "Değerli çalışanlarımız," },
      { t: "Yakında bir eğitim düzenlenecektir. Katılımınız önemlidir. Detaylar daha sonra paylaşılacaktır." }
    ],
    iyi: [
      { t: "Aramıza Hoş Geldin Eğitimi", b: true },
      { t: "Yeni yolculuğunda sana eşlik etmek için buradayız! Bu eğitimde şirketimizi, ekibini ve temel süreçlerimizi tanıyacaksın." },
      { t: "Tarih: [TARİH] · Saat: [SAAT]" },
      { t: "Yerini ayırtmak için [KAYIT BAĞLANTISI] adresinden kaydol." }
    ]
  };

  global.ICERIK = { SAHNELER: SAHNELER, SORULAR: SORULAR, CIKTILAR: CIKTILAR };
})(window);
