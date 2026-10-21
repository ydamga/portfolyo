/* Modül 2: Zor Görüşmeyi Yönetmek
   SCORM 1.2. Dış bağımlılık yok. */
(function () {
  "use strict";

  var G = window.Gorsel;
  var SCORM = window.SCORM;

  var GECME_ESIGI = 80;
  var EKRANLAR = ["tanisma", "model", "gor1", "gor2", "gor3", "ozet", "degerlendirme", "sonuc"];
  var RAY = [
    { ad: "Tanışma", ikon: "kisiler", baslik: "Hoş geldin" },
    { ad: "Model", ikon: "katman", baslik: "SBI modeli: yargısız geri bildirim" },
    { ad: "Açılış", ikon: "mesaj", baslik: "Görüşme 1/3: Açılış" },
    { ad: "Gözlem", ikon: "goz", baslik: "Görüşme 2/3: Gözleme dayalı geri bildirim" },
    { ad: "Çözüm", ikon: "isik", baslik: "Görüşme 3/3: Çözüm ve takip" },
    { ad: "Özet", ikon: "grafik", baslik: "Görüşme özeti" },
    { ad: "Test", ikon: "hedef", baslik: "Değerlendirme (5 soru)" },
    { ad: "Sonuç", ikon: "yildiz", baslik: "Uygulama ve sonuç" }
  ];

  var BECERILER = [
    { ad: "Güvenli açılış", ikon: "mesaj" },
    { ad: "Gözleme dayalı geri bildirim", ikon: "goz" },
    { ad: "Ortak çözüm ve takip", ikon: "onay" },
    { ad: "Doğrulanmış bilgi (%80+)", ikon: "yildiz" }
  ];

  /* ---------- İçerik ---------- */

  var SBI = [
    {
      h: "S", ad: "Durum", en: "Situation",
      soru: "Ne zaman, nerede oldu?",
      zayif: "Hep böylesin.",
      guclu: "Mart ayı bölge raporunda…"
    },
    {
      h: "B", ad: "Davranış", en: "Behavior",
      soru: "Ne gözlemledin? Yorum değil, görülebilir ya da ölçülebilir olan.",
      zayif: "Dikkatsizsin.",
      guclu: "…bölge toplamı hatalıydı ve rapor cuma sabahı geldi."
    },
    {
      h: "I", ad: "Etki", en: "Impact",
      soru: "Sonucu ne oldu? Ekip, müşteri ya da iş için.",
      zayif: "Bu bana saygısızlık.",
      guclu: "Bölge müdürü toplantıya doğru veriyle giremedi."
    }
  ];

  var TONLAR = {
    iyi: { etiket: "En güçlü ✓", sinif: "dogru" },
    orta: { etiket: "Kısmen işe yarar ~", sinif: "secildi" },
    zayif: { etiket: "Geliştirilebilir ✗", sinif: "yanlis" }
  };

  /* iyi: en güçlü seçeneğin indisi. s: seçenekler. g/n: Güven/Netlik değişimi. */
  var TURLAR = [
    {
      iyi: 1,
      ozet: "Amacı ve yöntemi söylemek, söz hakkı vermek",
      s: [
        { m: "Evet, Elif. Raporlarında epey sorun var ve bu böyle devam edemez.", t: "zayif", g: -18, n: 0,
          tepki: { ifade: "savunma", metin: "Epey sorun mu? Hangi sorunlar? Hiç örnek vermeden böyle başlamanız beni zor durumda bırakıyor." },
          geri: "“Epey sorun” genelleme ve yargı. Elif savunmaya geçti ve neyin konuşulacağı yine de netleşmedi." },
        { m: "Geldiğin için teşekkürler. Amacım suçlamak değil; rapor teslimlerinde birlikte bir çözüm bulmak. Birkaç somut örnekle başlayıp önce senin görüşünü de dinlemek istiyorum.", t: "iyi", g: 12, n: 15,
          tepki: { ifade: "rahat", metin: "Anladım, teşekkür ederim. Dinliyorum." },
          geri: "Amaç, yöntem ve söz hakkı ilk cümlede netleşti. Bu, kaygıyı düşürür ve güveni artırır." },
        { m: "Önemli bir şey değil, küçük bir konu. Sadece kısaca konuşalım dedim.", t: "orta", g: 3, n: -8,
          tepki: { ifade: "endise", metin: "Küçük bir konuysa neden özel görüşme çağrısı geldi ki? Şimdi daha çok merak ediyorum." },
          geri: "Rahatlatmak istedin ama konuyu küçümsemek netliği düşürdü. Söylediğin ile durum (özel görüşme) çelişti." }
      ]
    },
    {
      iyi: 2,
      ozet: "Durum, davranış ve etkiyi söyleyip açık soru sormak",
      s: [
        { m: "Sen hep geç teslim ediyorsun ve hep dikkatsizsin.", t: "zayif", g: -15, n: 0,
          tepki: { ifade: "kapali", metin: "Hep mi? Bu görüşmede sadece suçlanıyorum gibi hissediyorum." },
          geri: "“Hep” ve “dikkatsiz” yargıdır ve kanıtlanamaz. Kişiliğe değil gözlenebilir davranışa dönmek gerekir." },
        { m: "Raporların sık gecikiyor, hatalar da çıkıyor. Bu da performansını olumsuz etkiliyor.", t: "orta", g: -3, n: 6,
          tepki: { ifade: "endise", metin: "Evet, yoğunluk vardı. Ama tam olarak hangi raporlar? Anlamam lazım." },
          geri: "Olgu var ama tarih, örnek ve etki belirsiz. Elif neyi düzeltmesi gerektiğini bilemiyor." },
        { m: "Mart ayı bölge raporu cuma sabahı geldi ve bölge toplamı hatalıydı. Bu yüzden bölge müdürü toplantıya doğru veriyle giremedi. Senin gözünden ne yaşandı?", t: "iyi", g: 10, n: 20,
          tepki: { ifade: "notr", metin: "Haklısınız, toplamdaki hata bende. Neler olduğunu anlatayım." },
          geri: "Durum, davranış ve etki ayrı ve gözlenebilir söylendi, sonra açık bir soru geldi. Kişi değil davranış konuşuluyor." }
      ]
    },
    {
      iyi: 0,
      ozet: "Ortak çözüm, net sorumluluk ve takip tarihi",
      s: [
        { m: "Bunu paylaştığın için teşekkürler; veri gecikmesi önemli bir bilgi. Önce sen ne önerirsin? Sonra netleştirelim: ben Lojistik ile veri saatini konuşayım, sen toplam kontrolünü rapora ekle. İki hafta sonra birlikte bakalım.", t: "iyi", g: 10, n: 15,
          tepki: { ifade: "gulumse", metin: "Bu işe yarar. Kontrol adımını ekleyip önümüzdeki raporda deneyeyim." },
          geri: "Kök neden dinlendi, sorumluluk iki tarafa net dağıldı, takip tarihi kondu ve Elif öneri sunmaya davet edildi." },
        { m: "Tamam. Bundan sonra raporlar zamanında gelsin yeter, gerisini sen halledersin.", t: "orta", g: 2, n: -5,
          tepki: { ifade: "endise", metin: "Peki, deneyeceğim." },
          geri: "Beklenti var ama kök neden, destek ve takip tarihi yok. Aynı sorun yeniden çıkabilir." },
        { m: "Veri sorun değil, sorumluluk sende. Bir hata daha olursa resmi uyarı yazarım.", t: "zayif", g: -18, n: 4,
          tepki: { ifade: "kapali", metin: "Anlaşıldı. Başka diyeceğim yok." },
          geri: "Net bir sınır koydun ama kök nedeni görmezden gelip tehdit ettin. Netlik biraz arttı, işbirliği ve güven zarar gördü." }
      ]
    }
  ];

  function acilisMetni(tur) {
    if (tur === 0) return { ifade: "endise", metin: "Merhaba. Beni görüşmeye çağırmışsınız… Bir sorun mu var?" };
    if (tur === 1) {
      var m = metreHesapla(1);
      return m.g >= 55
        ? { ifade: "notr", metin: "Tamam, dinliyorum. Hangi rapordan bahsediyorsunuz?" }
        : { ifade: "savunma", metin: "Anladım, konu raporlar. Söyleyecekleriniz neyse söyleyin." };
    }
    var t = TURLAR[1].s[durum.k[1]];
    var ton = t ? t.t : "orta";
    if (ton === "iyi") return { ifade: "rahat", metin: "Aslında Lojistik’ten gelen veriler perşembe 16:00’dan sonra geliyor. Toplamı kontrol etmeye vakit kalmadı ve hata öyle çıktı. Yine de sorumluluk bende." };
    if (ton === "orta") return { ifade: "endise", metin: "Veriler çoğu zaman geç geliyor. Kontrol etmediğim için hatayı ben yaptım sanırım." };
    return { ifade: "kapali", metin: "Veriler geç geliyor ama anlatsam da bir şey değişecek gibi durmuyor." };
  }

  var SONUCLAR = {
    plan: { ad: "Ortak plan", ifade: "gulumse", metin: "Elif ve sen ortak bir plana vardınız. Güven ve netlik birlikte yüksek." },
    gergin: { ad: "Net ama gergin", ifade: "notr", metin: "Beklentiler net, ancak ilişki zarar gördü. Savunma ve işbirliği riski sürüyor." },
    sicak: { ad: "Sıcak ama belirsiz", ifade: "notr", metin: "İlişki korundu ama kimin neyi ne zaman yapacağı belirsiz. Sorun yinelenebilir." },
    kopuk: { ad: "Kopuk görüşme", ifade: "endise", metin: "Güven ve netliği artırmak için başka bir yaklaşım deneyebilirsin." }
  };

  var SORULAR = [
    { s: "SBI modelinde “Davranış” kısmına hangi cümle uyar?",
      c: ["“Toplantıda ilgisizdin.”", "“Toplantıda telefonuna baktın ve iki soruya yanıt vermedin.”", "“Tavrın hiç profesyonel değil.”"],
      d: 1, a: "Davranış gözlenebilir olmalıdır. “İlgisiz” ve “profesyonel değil” yorumdur; telefona bakmak ve yanıt vermemek görülebilir." },
    { s: "Deniz’in müşteri notları eksik. Görüşmeye hangi cümleyle başlarsın?",
      c: ["“Sana biraz kızgınım, kendini açıkla.”", "“Müşteri notlarında şikâyet var, hepsi senin yüzünden.”", "“Müşteri notlarını konuşmak istiyorum. Amacım birlikte çözüm bulmak; önce örneklere bakıp senin görüşünü dinleyeceğim.”"],
      d: 2, a: "Güçlü açılış amacı, yöntemi ve söz hakkını söyler. Diğer ikisi suçlama ya da duygu boşaltmadır." },
    { s: "Çalışan görüşmede savunmaya geçti. En iyi yaklaşım hangisi?",
      c: ["Duyguyu kabul edip olguya dönmek: “Zor göründüğünü anlıyorum; örneğe birlikte bakalım.”", "Sesini yükseltip konuyu bitirmek", "Görüşmeyi kesip e-postayla bildirmek"],
      d: 0, a: "Önce duyguyu kabul etmek savunmayı düşürür, ardından olguya dönmek konuyu korur. Sesi yükseltmek ve kaçmak çatışmayı büyütür." },
    { s: "Aşağıdakilerden hangisi “Etki” cümlesidir?",
      c: ["“Bu bana saygısızlık.”", "“Herkes senden şikâyetçi.”", "“Rapor geç geldiği için ekip toplantısına eksik veriyle girdik.”"],
      d: 2, a: "Etki, davranışın somut sonucunu anlatır. “Saygısızlık” yorum, “herkes” ise kanıtsız genellemedir." },
    { s: "Görüşmeyi kapatırken en güçlü adım hangisi?",
      c: ["“Umarım düzelir.”", "Ortak karar, net sorumluluk ve takip tarihini yazılı özetlemek", "“Herkes ne yapacağını bilir.”"],
      d: 1, a: "Kimin neyi ne zaman yapacağı ve ne zaman tekrar bakılacağı netleşmezse görüşme etkisiz kalır." }
  ];

  var TAAHHUTLER = [
    "Görüşmeyi amacımı söyleyerek açacağım.",
    "Yargı yerine gözlenebilir davranış ve etkiyi anlatacağım.",
    "Görüşmeyi tarihli bir takip adımıyla kapatacağım."
  ];

  /* ---------- Durum ---------- */

  function varsayilan() {
    return {
      e: 0, max: 0,
      m: [0, 0, 0],            // SBI kartları görüldü
      k: [-1, -1, -1],         // görüşme seçimleri
      kd: 0,                   // görüşme tekrar sayısı
      d: [-1, -1, -1, -1, -1], // değerlendirme yanıtları
      de: -1,                  // en iyi puan
      dg: 0,                   // geçti (kalıcı)
      dd: 0,                   // tamamlanan deneme
      tk: [0, 0, 0]            // taahhütler
    };
  }

  var durum = varsayilan();
  var baslangicZamani = new Date().getTime();
  var kullaniciAd = "Katılımcı";
  var soruGoster = null;
  var sbiSecili = -1;
  var sahneEl, geriEl, ileriEl, ipucuEl, rayEl, baslikEl;

  function birlestir(taban, kaynak) {
    Object.keys(taban).forEach(function (k) {
      var t = taban[k], v = kaynak ? kaynak[k] : undefined;
      if (v === undefined || v === null) return;
      if (Array.isArray(t)) {
        if (Array.isArray(v) && v.length === t.length) {
          taban[k] = v.map(function (x, i) { return typeof x === "number" ? x : t[i]; });
        }
      } else if (typeof t === "number" && typeof v === "number") {
        taban[k] = v;
      }
    });
    return taban;
  }

  function durumYukle() {
    var s = SCORM.al("cmi.suspend_data");
    if (!s) return;
    try {
      durum = birlestir(varsayilan(), JSON.parse(s));
    } catch (e) {
      durum = varsayilan();
    }
    durum.e = Math.max(0, Math.min(EKRANLAR.length - 1, durum.e | 0));
    durum.max = Math.max(durum.e, Math.min(EKRANLAR.length - 1, durum.max | 0));
    durum.k = durum.k.map(function (x, i) { return x >= 0 && x < TURLAR[i].s.length ? x : -1; });
    durum.d = durum.d.map(function (x, i) { return x >= 0 && x < SORULAR[i].c.length ? x : -1; });
  }

  function durumKaydet() {
    if (!SCORM.bagliMi()) return;
    SCORM.ayarla("cmi.suspend_data", JSON.stringify(durum));
    SCORM.ayarla("cmi.core.lesson_location", EKRANLAR[durum.e]);
    SCORM.kaydet();
  }

  function sonuclariRaporla() {
    if (!SCORM.bagliMi()) return;
    SCORM.ayarla("cmi.core.score.min", "0");
    SCORM.ayarla("cmi.core.score.max", "100");
    SCORM.ayarla("cmi.core.score.raw", String(Math.max(0, durum.de)));
    SCORM.ayarla("cmi.core.lesson_status", durum.dg ? "passed" : "failed");
    durumKaydet();
  }

  function oturumuBitir() {
    if (!SCORM.bagliMi()) return;
    SCORM.ayarla("cmi.core.session_time", SCORM.sureBicimle(new Date().getTime() - baslangicZamani));
    SCORM.ayarla("cmi.core.exit", durum.dg ? "" : "suspend");
    durumKaydet();
    SCORM.bitir();
  }

  /* ---------- Yardımcılar ---------- */

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function $(sel, kok) { return (kok || document).querySelector(sel); }
  function $$(sel, kok) { return Array.prototype.slice.call((kok || document).querySelectorAll(sel)); }
  function harf(i) { return String.fromCharCode(65 + i); }
  function sinirla(x) { return Math.max(0, Math.min(100, x)); }

  function adCoz(ham) {
    var s = String(ham || "").trim();
    if (!s) return "Katılımcı";
    if (s.indexOf(",") >= 0) {
      var parcalar = s.split(",");
      var ad = parcalar.slice(1).join(" ").trim();
      s = ad || parcalar[0].trim();
    }
    return s || "Katılımcı";
  }

  function metreHesapla(adet) {
    var g = 50, n = 30;
    for (var i = 0; i < adet && i < TURLAR.length; i++) {
      var k = durum.k[i];
      if (k >= 0) {
        g = sinirla(g + TURLAR[i].s[k].g);
        n = sinirla(n + TURLAR[i].s[k].n);
      }
    }
    return { g: g, n: n };
  }

  function guclu() {
    var c = 0;
    for (var i = 0; i < TURLAR.length; i++) if (durum.k[i] === TURLAR[i].iyi) c++;
    return c;
  }

  function sonucTuru() {
    var m = metreHesapla(3);
    if (m.g >= 65 && m.n >= 65) return "plan";
    if (m.g < 50 && m.n < 50) return "kopuk";
    return m.g >= m.n ? "sicak" : "gergin";
  }

  function cevapSayisi() { return durum.d.filter(function (x) { return x >= 0; }).length; }
  function puanHesapla() {
    var dogru = 0;
    for (var i = 0; i < SORULAR.length; i++) if (durum.d[i] === SORULAR[i].d) dogru++;
    return { dogru: dogru, puan: Math.round(dogru * 100 / SORULAR.length) };
  }
  function ilkCevapsiz() {
    for (var i = 0; i < durum.d.length; i++) if (durum.d[i] < 0) return i;
    return -1;
  }

  /* ---------- Kapılar ve gezinme ---------- */

  function kapiTamam(i) {
    var ad = EKRANLAR[i];
    if (ad === "model") return durum.m.every(function (x) { return x === 1; });
    if (ad === "gor1") return durum.k[0] >= 0;
    if (ad === "gor2") return durum.k[1] >= 0;
    if (ad === "gor3") return durum.k[2] >= 0;
    if (ad === "degerlendirme") return cevapSayisi() === SORULAR.length;
    if (ad === "sonuc") return !!durum.dg;
    return true;
  }

  function erisilebilir(i) {
    if (i > durum.max) return false;
    for (var j = 0; j < i; j++) if (!kapiTamam(j)) return false;
    return true;
  }

  var KAPI_MESAJ = {
    model: "Devam etmek için S, B ve I kartlarının üçünü de aç.",
    gor1: "Devam etmek için bir yanıt seç.",
    gor2: "Devam etmek için bir yanıt seç.",
    gor3: "Devam etmek için bir yanıt seç.",
    degerlendirme: "Devam etmek için 5 soruyu da yanıtla."
  };

  function ileriIzni() {
    if (durum.e >= EKRANLAR.length - 1) return "Bu son ekran.";
    if (!kapiTamam(durum.e)) return KAPI_MESAJ[EKRANLAR[durum.e]] || "";
    return "";
  }

  function git(i, odak) {
    i = Math.max(0, Math.min(EKRANLAR.length - 1, i));
    durum.e = i;
    durum.max = Math.max(durum.max, i);
    soruGoster = null;
    sbiSecili = -1;
    ciz();
    durumKaydet();
    if (odak) {
      baslikEl.focus();
      if (window.scrollTo) { try { window.scrollTo(0, 0); } catch (e) { /* yoksay */ } }
    }
  }

  /* ---------- Sahne ---------- */

  function sahneKur(kisi, ifade, govde) {
    var K = G.kisiler[kisi];
    sahneEl.innerHTML =
      G.arka() +
      '<div class="k-kutu">' + G.karakter(kisi, ifade, { etiket: K.ad + ", " + K.unvan }) + "</div>" +
      '<div class="ad-etiket"><span class="mini">' + G.karakter(kisi, ifade, { yakin: true, etiket: "" }) +
      "</span><span><strong>" + esc(K.ad) + "</strong><small>" + esc(K.unvan) + "</small></span></div>" +
      '<div class="sahne-govde">' + govde + "</div>";
  }

  function balon(kim, icerik) {
    return '<div class="balon"><p class="kim">' + kim + "</p>" + icerik + "</div>";
  }

  function secimDugmesi(i, metin, sinif, durumMetin, kilitli) {
    return '<button type="button" class="secim ' + (sinif || "") + '" data-i="' + i + '"' +
      (kilitli ? ' aria-disabled="true"' : "") + ">" +
      '<span class="simge" aria-hidden="true">' + harf(i) + "</span>" +
      '<span class="metin">' + esc(metin) + "</span>" +
      (durumMetin ? '<span class="durum">' + esc(durumMetin) + "</span>" : "") + "</button>";
  }

  function degisimHtml(g, n) {
    function chip(ad, d) {
      var sinif = d > 0 ? "art" : d < 0 ? "azal" : "esit";
      var ok = d > 0 ? "↑" : d < 0 ? "↓" : "→";
      var isaret = d > 0 ? "+" + d : d < 0 ? "−" + Math.abs(d) : "±0";
      return '<span class="' + sinif + '">' + ad + " " + isaret + " " + ok + "</span>";
    }
    return '<div class="degisim">' + chip("Güven", g) + chip("Netlik", n) + "</div>";
  }

  /* ---------- Ekranlar ---------- */

  var EKRAN_FN = {};

  EKRAN_FN.tanisma = function () {
    var hedefler = [
      ["Güvenli açılış", "Görüşmeyi amaç ve söz hakkıyla aç."],
      ["Gözleme dayalı geri bildirim", "Durum, davranış ve etkiyi yargısız anlat."],
      ["Ortak çözüm ve takip", "Sorumluluğu ve tarihi netleştirerek kapat."]
    ].map(function (h, i) {
      return '<div class="hedef"><span class="no" aria-hidden="true">' + (i + 1) + "</span><div><strong>" + h[0] + "</strong><span>" + h[1] + "</span></div></div>";
    }).join("");
    sahneKur("selin", "gulumse",
      balon("Selin · İK İş Ortağı",
        "<p>Merhaba " + esc(kullaniciAd) + "! Ben Selin. Bu kısa modülde zor bir performans görüşmesini birlikte prova edeceğiz.</p>" +
        "<p>Vaka: Satış operasyon analisti Elif’in haftalık raporları üç kez geç geldi ve sonuncusunda bölge toplamı hatalı. Sen Elif’in ekip liderisin ve bu hafta onunla görüşeceksin.</p>") +
      '<div class="cam"><h2>Bu modülde neler yapacaksın?</h2>' + hedefler +
      '<p class="soluk">Yaklaşık 6–7 dakika. Görüşme performansın geri bildirimdir ve puanlanmaz. Yalnızca sondaki 5 soruluk değerlendirme puanlanır (geçme: %' + GECME_ESIGI + ").</p></div>");
  };

  EKRAN_FN.model = function () {
    var dugmeler = SBI.map(function (b, i) {
      return '<button type="button" class="secim' + (durum.m[i] ? " bakildi" : "") + '" data-i="' + i + '" aria-pressed="false">' +
        '<span class="simge" aria-hidden="true">' + b.h + "</span>" +
        '<span class="metin"><strong>' + b.ad + "</strong> (" + b.en + ")</span>" +
        '<span class="durum">' + (durum.m[i] ? "Görüldü ✓" : "Aç") + "</span></button>";
    }).join("");
    sahneKur("selin", "notr",
      balon("Selin · İK İş Ortağı",
        "<p>Zor görüşmelerde en sık hata, yargıyla başlamak. <strong>SBI</strong> modeli bunu önler: önce durumu, sonra davranışı, en sonda etkiyi söylersin.</p><p>Her karta tıkla.</p>") +
      '<div class="secimler" role="group" aria-label="SBI adımları">' + dugmeler + "</div>" +
      '<div class="cam" id="sbi-detay" aria-live="polite"><p class="soluk">Bir karta tıkladığında açıklama burada görünür.</p></div>');
    $$(".secim", sahneEl).forEach(function (b) {
      b.addEventListener("click", function () { sbiAc(parseInt(b.getAttribute("data-i"), 10)); });
    });
  };

  function sbiAc(i) {
    durum.m[i] = 1;
    sbiSecili = i;
    var b = SBI[i];
    $$(".secim", sahneEl).forEach(function (d, j) {
      d.setAttribute("aria-pressed", j === i ? "true" : "false");
      if (durum.m[j]) {
        d.classList.add("bakildi");
        $(".durum", d).textContent = "Görüldü ✓";
      }
      d.classList.toggle("secildi", j === i);
    });
    var tum = durum.m.every(function (x) { return x === 1; });
    $("#sbi-detay").innerHTML =
      "<h2>" + b.h + ": " + b.ad + "</h2><p>" + b.soru + "</p>" +
      '<p class="alinti"><strong>Geliştirilebilir örnek:</strong> “' + b.zayif + "”</p>" +
      '<p class="alinti"><strong>Güçlü örnek:</strong> “' + b.guclu + "”</p>" +
      (tum ? '<p class="soluk">Son adım: SBI’dan sonra bir soru sor: “Senin gözünden ne yaşandı?” Böylece görüşme monolog olmaz.</p>' : "");
    durumKaydet();
    kromGuncelle();
  }

  function turEkrani(tur) {
    var T = TURLAR[tur];
    var secili = durum.k[tur];
    var cevaplandi = secili >= 0;
    var ac = acilisMetni(tur);
    var gosterilen = cevaplandi ? T.s[secili].tepki : ac;
    var dugmeler = T.s.map(function (s, i) {
      var sinif = "", dm = "";
      if (cevaplandi) {
        if (i === secili) {
          sinif = TONLAR[s.t].sinif;
          dm = "Seçimin · " + TONLAR[s.t].etiket;
        } else if (i === T.iyi) {
          sinif = "bakildi";
          dm = "Daha güçlü ✓";
        }
      }
      return secimDugmesi(i, s.m, sinif, dm, cevaplandi);
    }).join("");
    var gb = "";
    if (cevaplandi) {
      var s = T.s[secili];
      gb = '<div class="geribildirim ' + (s.t === "iyi" ? "iyi" : s.t === "zayif" ? "kotu" : "") + '" id="gb" tabindex="-1" role="status">' +
        "<strong>Koç notu (Selin):</strong> " + esc(s.geri) + degisimHtml(s.g, s.n) +
        (s.t !== "iyi" ? "<p>En güçlü seçenek: <strong>" + esc(T.ozet) + "</strong>.</p>" : "") + "</div>";
    }
    sahneKur("elif", gosterilen.ifade,
      balon("Elif" + (cevaplandi ? " (yanıtın sonrası)" : ""), "<p>" + esc(gosterilen.metin) + "</p>") +
      '<div class="secimler" role="group" aria-label="Yanıt seçenekleri">' + dugmeler + "</div>" + gb);
    if (!cevaplandi) {
      $$(".secim", sahneEl).forEach(function (b) {
        b.addEventListener("click", function () { turSec(tur, parseInt(b.getAttribute("data-i"), 10)); });
      });
    }
  }

  function turSec(tur, i) {
    if (durum.k[tur] >= 0) return;
    durum.k[tur] = i;
    durumKaydet();
    turEkrani(tur);
    kromGuncelle();
    var gb = $("#gb");
    if (gb) gb.focus();
  }

  EKRAN_FN.gor1 = function () { turEkrani(0); };
  EKRAN_FN.gor2 = function () { turEkrani(1); };
  EKRAN_FN.gor3 = function () { turEkrani(2); };

  EKRAN_FN.ozet = function () {
    var tur = sonucTuru();
    var S = SONUCLAR[tur];
    var m = metreHesapla(3);
    var gs = guclu();
    var satirlar = TURLAR.map(function (T, i) {
      var s = T.s[durum.k[i]];
      var ton = s ? TONLAR[s.t].etiket : "—";
      return "<li><b>" + RAY[i + 2].ad + ":</b> seçimin: " + ton + ". En güçlü: " + esc(T.ozet) + ".</li>";
    }).join("");
    sahneKur("selin", S.ifade,
      balon("Selin · İK İş Ortağı", "<p><strong>" + S.ad + ".</strong> " + S.metin + "</p>") +
      '<div class="cam"><h2>Görüşme özeti</h2>' +
      '<div class="skorlar">' +
      '<div class="skor ' + (m.g >= 65 ? "iyi" : m.g < 50 ? "kotu" : "") + '"><span class="e">Güven</span><span class="d">' + m.g + "/100</span></div>" +
      '<div class="skor ' + (m.n >= 65 ? "iyi" : m.n < 50 ? "kotu" : "") + '"><span class="e">Netlik</span><span class="d">' + m.n + "/100</span></div>" +
      '<div class="skor ' + (gs === 3 ? "iyi" : "") + '"><span class="e">En güçlü seçim</span><span class="d">' + gs + "/3</span></div></div>" +
      '<ul class="zaman">' + satirlar + "</ul>" +
      '<p class="soluk">Bu özet geri bildirimdir ve puana girmez. İstediğin kadar yeniden deneyebilirsin.</p>' +
      '<div class="eylem-satir"><button type="button" class="dugme ikincil" id="yeniden-gor">' + G.ikon("tekrar", 16) + " Görüşmeyi yeniden dene</button></div></div>");
    $("#yeniden-gor").addEventListener("click", function () {
      durum.k = [-1, -1, -1];
      durum.kd += 1;
      git(2, true);
    });
  };

  function soruEkrani(q) {
    var Q = SORULAR[q];
    var secili = durum.d[q];
    var cevaplandi = secili >= 0;
    var dugmeler = Q.c.map(function (c, i) {
      var sinif = "", dm = "";
      if (cevaplandi) {
        if (i === Q.d) { sinif = "dogru"; dm = i === secili ? "Doğru ✓" : "Doğru cevap ✓"; }
        else if (i === secili) { sinif = "yanlis"; dm = "Henüz değil ✗"; }
      }
      return secimDugmesi(i, c, sinif, dm, cevaplandi);
    }).join("");
    var alt = "";
    if (cevaplandi) {
      var dogru = secili === Q.d;
      alt = '<div class="geribildirim ' + (dogru ? "iyi" : "kotu") + '" id="gb" tabindex="-1" role="status"><strong>' +
        (dogru ? "Doğru." : "Henüz değil.") + "</strong> " + esc(Q.a) + "</div>" +
        '<div class="eylem-satir"><button type="button" class="dugme parlak" id="sonraki-soru">' +
        (q === SORULAR.length - 1 ? "Sonucu gör" : "Sonraki soru") + "</button></div>";
    }
    sahneKur("selin", "notr",
      balon("Selin · Soru " + (q + 1) + "/" + SORULAR.length, "<p>" + esc(Q.s) + "</p>") +
      '<div class="secimler" role="group" aria-label="Yanıt seçenekleri">' + dugmeler + "</div>" + alt);
    if (!cevaplandi) {
      $$(".secim", sahneEl).forEach(function (b) {
        b.addEventListener("click", function () { soruCevapla(q, parseInt(b.getAttribute("data-i"), 10)); });
      });
    } else {
      $("#sonraki-soru").addEventListener("click", function () {
        soruGoster = q === SORULAR.length - 1 ? -1 : q + 1;
        ciz();
        sahneEl.focus();
      });
    }
  }

  function soruCevapla(q, i) {
    if (durum.d[q] >= 0) return;
    durum.d[q] = i;
    if (cevapSayisi() === SORULAR.length) {
      var p = puanHesapla().puan;
      durum.dd += 1;
      if (p > durum.de) durum.de = p;
      if (p >= GECME_ESIGI) durum.dg = 1;
      sonuclariRaporla();
    } else {
      durumKaydet();
    }
    soruEkrani(q);
    kromGuncelle();
    var gb = $("#gb");
    if (gb) gb.focus();
  }

  function degerlendirmeSonucu() {
    var h = puanHesapla();
    var gecti = h.puan >= GECME_ESIGI;
    sahneKur("selin", gecti ? "gulumse" : "endise",
      balon("Selin · İK İş Ortağı", gecti
        ? "<p>Harika, bu denemede eşiği geçtin. Görüşme araçlarını doğru kullanıyorsun.</p>"
        : "<p>Eşiğe ulaşmak için biraz daha pratik yeter. SBI kartlarına dönüp yeniden deneyebilirsin.</p>") +
      '<div class="cam"><h2>Değerlendirme sonucu</h2><div class="skorlar">' +
      '<div class="skor ' + (gecti ? "iyi" : "kotu") + '"><span class="e">Bu deneme</span><span class="d">' + h.dogru + "/" + SORULAR.length + " (%" + h.puan + ")</span></div>" +
      '<div class="skor"><span class="e">En iyi puan</span><span class="d">%' + Math.max(0, durum.de) + "</span></div>" +
      '<div class="skor ' + (durum.dg ? "iyi" : "kotu") + '"><span class="e">Durum</span><span class="d">' + (durum.dg ? "Geçti ✓" : "Geçilmedi ✗") + "</span></div></div>" +
      '<p class="soluk">Geçme eşiği %' + GECME_ESIGI + " (en az 4/5). Deneme sayısı: " + durum.dd + ".</p>" +
      '<div class="eylem-satir">' +
      '<button type="button" class="dugme ikincil" id="yeniden-test">' + G.ikon("tekrar", 16) + " Yeniden dene</button>" +
      '<button type="button" class="dugme ikincil" id="modele-don">SBI kartlarına dön</button></div></div>');
    $("#yeniden-test").addEventListener("click", function () {
      durum.d = [-1, -1, -1, -1, -1];
      soruGoster = 0;
      durumKaydet();
      ciz();
      sahneEl.focus();
    });
    $("#modele-don").addEventListener("click", function () { git(1, true); });
  }

  EKRAN_FN.degerlendirme = function () {
    if (soruGoster === null) soruGoster = ilkCevapsiz();
    if (soruGoster === -1) degerlendirmeSonucu();
    else soruEkrani(soruGoster);
  };

  function sbiOnizleme() {
    var s = $("#sbi-s").value.trim(), b = $("#sbi-b").value.trim(), i = $("#sbi-i").value.trim();
    var hedef = $("#sbi-onizleme");
    if (!s && !b && !i) {
      hedef.innerHTML = "<small>Üç kutuyu doldurdukça cümlen burada görünür.</small>";
      return;
    }
    hedef.innerHTML =
      (s ? '<span class="s"><i>Durum</i>' + esc(s) + "</span> " : "") +
      (b ? '<span class="b"><i>Davranış</i>' + esc(b) + "</span> " : "") +
      (i ? '<span class="e"><i>Etki</i>' + esc(i) + "</span> " : "") +
      "<small>Sonra sor: “Senin gözünden ne yaşandı?”</small>";
  }

  EKRAN_FN.sonuc = function () {
    var gecti = !!durum.dg;
    var taahhut = TAAHHUTLER.map(function (t, i) {
      return '<label><input type="checkbox" data-i="' + i + '"' + (durum.tk[i] ? " checked" : "") + "><span>" + t + "</span></label>";
    }).join("");
    sahneKur("selin", gecti ? "gulumse" : "endise",
      balon("Selin · İK İş Ortağı", gecti
        ? "<p>Tebrikler " + esc(kullaniciAd) + "! Şimdi bunu gerçek bir görüşmeye taşıyalım.</p>"
        : "<p>Henüz %" + GECME_ESIGI + " eşiğine ulaşmadın. Değerlendirmeye dönüp yeniden deneyebilirsin.</p>") +
      '<div class="cam"><h2>Sonuç</h2><div class="skorlar">' +
      '<div class="skor"><span class="e">En iyi puan</span><span class="d">%' + Math.max(0, durum.de) + "</span></div>" +
      '<div class="skor"><span class="e">Geçme eşiği</span><span class="d">%' + GECME_ESIGI + "</span></div>" +
      '<div class="skor ' + (gecti ? "iyi" : "kotu") + '"><span class="e">Durum</span><span class="d">' + (gecti ? "Geçti ✓" : "Geçilmedi ✗") + "</span></div></div>" +
      '<p class="soluk">SCORM 1.2’de tek durum alanı olduğu için LMS’e “passed” ya da “failed” gönderilir.</p>' +
      (gecti ? "" : '<div class="eylem-satir"><button type="button" class="dugme ikincil" id="teste-don">Değerlendirmeye dön</button></div>') +
      "</div>" +
      '<div class="cam"><h2>Uygulama: kendi SBI cümlen</h2>' +
      '<p class="soluk">Sıradaki gerçek görüşmen için yaz. Bu metin yalnızca bu sayfada kalır ve LMS’e gönderilmez. Puana girmez.</p>' +
      '<div class="alan-grup">' +
      '<div><label for="sbi-s">Durum: ne zaman, nerede?</label><textarea id="sbi-s" rows="2"></textarea></div>' +
      '<div><label for="sbi-b">Davranış: ne gözlemledin?</label><textarea id="sbi-b" rows="2"></textarea></div>' +
      '<div><label for="sbi-i">Etki: sonucu ne oldu?</label><textarea id="sbi-i" rows="2"></textarea></div></div>' +
      '<div class="onizleme" id="sbi-onizleme" aria-live="polite"></div>' +
      '<h2 style="margin-top:14px">Taahhüdün</h2><div class="taahhut">' + taahhut + "</div></div>");
    $$("#sbi-s, #sbi-b, #sbi-i").forEach(function (t) { t.addEventListener("input", sbiOnizleme); });
    sbiOnizleme();
    $$(".taahhut input", sahneEl).forEach(function (c) {
      c.addEventListener("change", function () {
        durum.tk[parseInt(c.getAttribute("data-i"), 10)] = c.checked ? 1 : 0;
        durumKaydet();
      });
    });
    var t = $("#teste-don");
    if (t) t.addEventListener("click", function () { git(6, true); });
  };

  /* ---------- Yan paneller ve krom ---------- */

  var HALKA_C = 2 * Math.PI * 70;

  function halkaKur() {
    $("#halka").innerHTML =
      '<svg viewBox="0 0 180 180" role="img" aria-label="Modül ilerlemesi">' +
      '<defs><linearGradient id="halka-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#35d8ff"/><stop offset="1" stop-color="#2f6fe0"/></linearGradient></defs>' +
      '<circle class="m" cx="90" cy="90" r="70"/>' +
      '<circle class="p" id="halka-p" cx="90" cy="90" r="70" transform="rotate(-90 90 90)" stroke-dasharray="' + HALKA_C.toFixed(2) + '" stroke-dashoffset="' + HALKA_C.toFixed(2) + '"/>' +
      '<text class="yuzde" id="halka-y" x="90" y="98">0%</text>' +
      '<text class="alt" x="90" y="118">Modül ilerlemesi</text></svg>';
  }

  function ilerlemeYuzde() {
    var say = 0;
    for (var i = 0; i < EKRANLAR.length; i++) {
      if (i > durum.max) break;
      var ad = EKRANLAR[i];
      var gerekli = ad === "model" || ad === "gor1" || ad === "gor2" || ad === "gor3" || ad === "degerlendirme" || ad === "sonuc";
      if (!gerekli || kapiTamam(i)) say++;
    }
    return Math.round(say * 100 / EKRANLAR.length);
  }

  function metreKur() {
    $("#metreler").innerHTML =
      '<div class="metre"><div class="metre-ust"><span>Güven</span><span id="mg-d"></span></div>' +
      '<div class="metre-iz" id="mg-iz" role="progressbar" aria-label="Güven" aria-valuemin="0" aria-valuemax="100"><div class="metre-dolgu" id="mg-b"></div></div>' +
      "<p>Elif’in sana güveni</p></div>" +
      '<div class="metre netlik"><div class="metre-ust"><span>Netlik</span><span id="mn-d"></span></div>' +
      '<div class="metre-iz" id="mn-iz" role="progressbar" aria-label="Netlik" aria-valuemin="0" aria-valuemax="100"><div class="metre-dolgu" id="mn-b"></div></div>' +
      "<p>Beklentilerin ne kadar anlaşıldığı</p></div>";
  }

  function beceriDurumlari() {
    return [
      durum.k[0] === TURLAR[0].iyi,
      durum.k[1] === TURLAR[1].iyi,
      durum.k[2] === TURLAR[2].iyi,
      !!durum.dg
    ];
  }

  function kromGuncelle() {
    /* kenar çubuğu */
    rayEl.innerHTML = RAY.map(function (r, i) {
      var aktif = i === durum.e;
      var acik = erisilebilir(i);
      var tik = i < durum.max && kapiTamam(i) && !aktif;
      return '<li><button type="button" data-i="' + i + '"' + (aktif ? ' aria-current="step"' : "") + (acik ? "" : " disabled") +
        ' aria-label="' + (i + 1) + ". " + r.ad + (tik ? " (tamamlandı)" : "") + '">' +
        '<span class="ikon-kutu">' + G.ikon(r.ikon, 22) + "</span><span>" + r.ad + "</span>" +
        (tik ? '<span class="tik" aria-hidden="true">✓</span>' : "") + "</button></li>";
    }).join("");
    $$("button", rayEl).forEach(function (b) {
      b.addEventListener("click", function () { git(parseInt(b.getAttribute("data-i"), 10), true); });
    });

    /* başlık */
    baslikEl.textContent = RAY[durum.e].baslik;

    /* alt gezinme */
    var mesaj = ileriIzni();
    geriEl.disabled = durum.e === 0;
    ileriEl.disabled = !!mesaj;
    ipucuEl.textContent = durum.e >= EKRANLAR.length - 1 ? "" : mesaj;

    /* kullanıcı */
    $("#kullanici-ad").textContent = kullaniciAd;
    $("#kullanici-harf").textContent = kullaniciAd.charAt(0).toLocaleUpperCase("tr");

    /* ilerleme halkası */
    var y = ilerlemeYuzde();
    $("#halka-p").setAttribute("stroke-dashoffset", (HALKA_C * (1 - y / 100)).toFixed(2));
    $("#halka-y").textContent = y + "%";
    $("#halka svg").setAttribute("aria-label", "Modül ilerlemesi yüzde " + y);

    /* beceriler */
    var bd = beceriDurumlari();
    $("#beceriler").innerHTML = BECERILER.map(function (b, i) {
      return '<li class="' + (bd[i] ? "acik" : "") + '"><span class="b-ikon">' + G.ikon(b.ikon, 18) + "</span><span>" + b.ad +
        "<small>" + (bd[i] ? "Kazanıldı ✓" : "Henüz kazanılmadı") + "</small></span></li>";
    }).join("");

    /* göstergeler */
    var kart = $("#metre-kart");
    var gorus = durum.e >= 2 && durum.e <= 5;
    kart.hidden = !gorus;
    var m = metreHesapla(3);
    $("#mg-b").style.width = m.g + "%";
    $("#mn-b").style.width = m.n + "%";
    $("#mg-d").textContent = m.g + "/100";
    $("#mn-d").textContent = m.n + "/100";
    $("#mg-iz").setAttribute("aria-valuenow", m.g);
    $("#mn-iz").setAttribute("aria-valuenow", m.n);
  }

  function ciz() {
    EKRAN_FN[EKRANLAR[durum.e]]();
    kromGuncelle();
  }

  /* ---------- Başlatma ---------- */

  function basla() {
    sahneEl = $("#sahne");
    geriEl = $("#geri");
    ileriEl = $("#ileri");
    ipucuEl = $("#ipucu");
    rayEl = $("#ray");
    baslikEl = $("#ekran-baslik");

    if (SCORM.baslat()) {
      var s = SCORM.al("cmi.core.lesson_status");
      if (s === "not attempted" || s === "") SCORM.ayarla("cmi.core.lesson_status", "incomplete");
      kullaniciAd = adCoz(SCORM.al("cmi.core.student_name"));
      durumYukle();
    }

    halkaKur();
    metreKur();

    geriEl.addEventListener("click", function () { git(durum.e - 1, true); });
    ileriEl.addEventListener("click", function () { if (!ileriIzni()) git(durum.e + 1, true); });

    window.addEventListener("beforeunload", oturumuBitir);
    window.addEventListener("unload", oturumuBitir);
    window.addEventListener("pagehide", oturumuBitir);

    ciz();
    durumKaydet();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", basla);
  else basla();
})();
