/* Modül 4: Yapay Zekâyı İş Yerinde Güvenle Kullanmak
   Gerçek bir yapay zekâ servisine bağlanmaz; tüm çıktılar önceden yazılmış örneklerdir.
   SCORM 1.2. Dış bağımlılık yok. */
(function () {
  "use strict";

  var SCORM = window.SCORM;
  var Izo = window.Izo;
  var GECME_ESIGI = 80;
  var EKRANLAR = ["problem", "hedef", "bilesen", "karsi", "atolye", "dogrula", "gizlilik", "test"];
  var BASLIKLAR = [
    "Belirsiz istek, genel kalan çıktı",
    "Bu modülün hedefleri",
    "Etkili bir istemin dört bileşeni",
    "Geliştirilebilir ve güçlü istem",
    "İstem atölyesi",
    "Çıktıyı doğrula",
    "Gizlilik kararları",
    "Değerlendirme ve eylem planı"
  ];

  /* ---------- İçerik ---------- */

  var KURGU_ETIKET = '<span class="kurgu-etiket">Örnek çıktı</span>';
  var CIKTI_ZAYIF = "Politika, şirketin çalışma düzeniyle ilgili genel kuralları içeriyor. Çalışanların kurallara uyması beklenir. Ayrıntılar için belgeye bakabilirsiniz.";
  var CIKTI_ORTA = "Uzaktan çalışma politikası, haftada 2 güne kadar uzaktan çalışmaya izin veriyor, yönetici onayı gerektiriyor ve dizüstü bilgisayar sağlıyor. Başka ayrıntılar belgede yer alıyor.";
  var CIKTI_IYI = "1. Haftada en çok 2 gün uzaktan çalışılabilir (Madde 2).\n2. Başvuru yöneticinin yazılı onayına bağlıdır (Madde 4).\n3. Şirket dizüstü bilgisayar sağlar; ek donanım desteği yoktur (Madde 6).\n\nDoğrulanacaklar: Madde 2’deki gün sayısının tüm ekipler için geçerli olup olmadığı.";

  var BILESENLER = [
    { ad: "Rol ve bağlam", ne: "Modelin kim olarak, kimin için yazdığını söyler.", neden: "Ton, ayrıntı düzeyi ve varsayımlar buna göre belirlenir.", ornek: "İK iş ortağısın. Okuyucular hukuk bilgisi olmayan ekip liderleri." },
    { ad: "Görev", ne: "Yapılmasını istediğin işi tek ve net bir eylemle verir.", neden: "“Özetle” ile “karar gerektiren maddeleri öne çıkararak özetle” çok farklı çıktılar üretir.", ornek: "Aşağıdaki uzaktan çalışma politikasını, karar gerektiren maddeleri öne çıkararak özetle." },
    { ad: "Girdi ve kısıtlar", ne: "Kullanılacak kaynağı ve yapılmaması gerekenleri belirtir.", neden: "Uydurma bilgiyi azaltır ve hangi bilgiye dayanıldığını belli eder.", ornek: "Yalnızca verdiğim metne dayan. Metinde yoksa “metinde yok” yaz." },
    { ad: "Çıktı biçimi", ne: "Yanıtın biçimini, uzunluğunu ve yapısını tanımlar.", neden: "Çıktıyı doğrudan kullanılabilir yapar ve karşılaştırmayı kolaylaştırır.", ornek: "3 madde yaz, her madde en çok 20 kelime olsun. Sonda “Doğrulanacaklar” bölümü ekle." }
  ];
  // Karşılaştırma ekranında geliştirilebilir istem yalnızca görevi içerir (indeks 1).
  var KARSI_DOGRU = [0, 2, 3]; // eksik bileşenler

  var ATOLYE = [
    { ad: "Rol ve bağlam", s: [
      { m: "Okuyucular hukuk bilgisi olmayan ekip liderleri; sen bir İK iş ortağısın.", iyi: true, a: "Rol ve okuyucu belli. Ton ve ayrıntı düzeyi buna göre ayarlanır." },
      { m: "Sen çok bilgili bir uzmansın.", iyi: false, a: "Genel bir rol işe yarar ama okuyucuyu ve bağlamı söylemez." },
      { m: "Rol belirtme.", iyi: false, a: "Rol ve okuyucu belli olmadığında varsayımlar tahmine kalır." }] },
    { ad: "Görev", s: [
      { m: "Aşağıdaki politikayı, karar gerektiren maddeleri öne çıkararak özetle.", iyi: true, a: "Tek bir eylem ve net bir öncelik veriyor." },
      { m: "Özetle.", iyi: false, a: "Neyin öne çıkarılacağı belli değil; çıktı genel kalır." },
      { m: "Politika hakkında bir şeyler yaz.", iyi: false, a: "Görev belirsiz; her türlü çıktı kabul edilmiş olur." }] },
    { ad: "Girdi ve kısıtlar", s: [
      { m: "Yalnızca verdiğim metne dayan; metinde yoksa “metinde yok” yaz.", iyi: true, a: "Kaynağı sınırlar ve uydurmayı azaltır." },
      { m: "Mümkün olduğunca kısa tut.", iyi: false, a: "Uzunluk kısıtı var ama kaynak ve doğruluk kısıtı yok." },
      { m: "Eksik kalan yerleri tahminle tamamla.", iyi: false, a: "Tahmin etmeye açıkça izin vermek uydurmaya davetiyedir." }] },
    { ad: "Çıktı biçimi", s: [
      { m: "3 madde, her biri en çok 20 kelime; sonda “Doğrulanacaklar” bölümü.", iyi: true, a: "Biçim, uzunluk ve doğrulama bölümü belli; çıktı kullanıma hazır." },
      { m: "Güzel ve akıcı bir metin olsun.", iyi: false, a: "“Güzel” ölçülebilir değil; yapı ve uzunluk belirsiz." },
      { m: "Olabildiğince uzun ve ayrıntılı yaz.", iyi: false, a: "Uzunluk hedefi okunabilirliği ve doğrulamayı zorlaştırır." }] }
  ];

  var KAYNAK_METIN = [
    "Madde 2: Çalışanlar haftada en çok 2 gün uzaktan çalışabilir.",
    "Madde 4: Uzaktan çalışma, yöneticinin yazılı onayına bağlıdır.",
    "Madde 6: Şirket dizüstü bilgisayar sağlar; ek donanım desteği verilmez."
  ];
  var IDDIALAR = [
    { m: "Çalışanlar haftada en çok 2 gün uzaktan çalışabilir.", d: 0, a: "Madde 2 ile aynı." },
    { m: "Uzaktan çalışma için yönetici onayı gerekmez.", d: 1, a: "Madde 4 yazılı yönetici onayını şart koşar; çıktı tersini söylüyor." },
    { m: "Politika, yılda bir kez ergonomik koltuk yenilemesi öngörür.", d: 2, a: "Kaynakta böyle bir madde yok. Model akıcı ama uydurma bir ayrıntı eklemiş." },
    { m: "Şirket dizüstü bilgisayar sağlar.", d: 0, a: "Madde 6 ile aynı." }
  ];
  var IDDIA_SECENEK = ["Kaynakla uyumlu", "Kaynakla çelişiyor", "Kaynakta yok"];

  var VAKALAR = [
    { m: "Müşteri şikâyet e-postasını (ad, telefon, adres içeriyor) özetletmek istiyorsun.", d: 1, a: "Kişisel veriyi önce kaldır ya da maskele, sonra kurumun onayladığı araçta kullan." },
    { m: "Herkese açık web sitesindeki ürün tanıtım metnini sadeleştirmek istiyorsun.", d: 0, a: "Metin zaten herkese açık; gizlilik riski yok. Çıktıyı yine de doğrula." },
    { m: "Henüz açıklanmamış çeyrek finansal sonuç tablosunu analiz ettirmek istiyorsun.", d: 2, a: "Açıklanmamış finansal bilgi gizlidir; onaylı bir ortam ve izin yoksa paylaşma." },
    { m: "Bir çalışanın performans değerlendirme notlarından geri bildirim taslağı yazdırmak istiyorsun.", d: 2, a: "Kişisel ve hassas veri. Kurum politikası izin vermiyorsa paylaşma; taslağı kendin yaz." }
  ];
  var VAKA_SECENEK = ["Paylaş", "Anonimleştir", "Paylaşma"];

  var SORULAR = [
    { s: "Etkili bir istemin temel bileşenleri hangileridir?",
      c: ["Uzunluk, ton ve emoji", "Rol ve bağlam, görev, girdi ve kısıtlar, çıktı biçimi", "Yalnızca görev"],
      d: 1, a: "Dört bileşen birlikte belirsizliği azaltır: kim için, ne iş, hangi kaynak ve sınırlarla, hangi biçimde." },
    { s: "Çıktıdaki bir tarih ve rakamı yönetici sunumuna koymadan önce ne yapmalısın?",
      c: ["Kaynak belgeyle karşılaştırıp doğrulamalıyım.", "Akıcı yazıldıysa doğrudur, doğrulamam gerekmez.", "Aracın ne kadar kendinden emin yazdığına bakmalıyım."],
      d: 0, a: "Akıcılık ve kendinden emin ton doğruluğu garanti etmez. Sayı, tarih ve isimler kaynakla karşılaştırılmalıdır." },
    { s: "Bir müşteri e-postasını özetletmeden önce en uygun adım hangisi?",
      c: ["E-postayı olduğu gibi yapıştırmak", "Yalnızca müşterinin adını silmek", "Ad, telefon ve adresi kaldırıp kurumun onayladığı araçta kullanmak"],
      d: 2, a: "Kişisel veriyi ayıklamak ve onaylı araç kullanmak riski düşürür. Yalnızca adı silmek yeterli değildir; telefon ve adres de kimliği ortaya çıkarır." },
    { s: "Araç, metinde olmayan bir bilgiyi kesin bir dille yazdı. Bu neyi gösterir?",
      c: ["Aracın bu bilgiyi bildiğini", "Üretken modellerin akıcı ama yanlış (uydurma) içerik üretebildiğini", "Metnin eksik olduğunu"],
      d: 1, a: "Model, kaynakta olmayan ama makul görünen ayrıntı üretebilir. Bu yüzden kaynakla karşılaştırma gerekir." },
    { s: "Hangi kısıt, uydurma riskini en çok azaltır?",
      c: ["“Yaratıcı ol.”", "“Kısa yaz.”", "“Yalnızca verdiğim metne dayan; metinde yoksa bunu belirt.”"],
      d: 2, a: "Kaynağı sınırlamak ve eksiği belirtmeyi istemek modelin tahmin etmesini engeller." }
  ];

  var PLAN = [
    { et: "Yapay zekâyı şu iş için kullanacağım:", c: ["toplantı notlarını özetlemek", "e-posta taslağı yazmak", "rapor başlığı önerileri almak"] },
    { et: "Çıktıyı şöyle doğrulayacağım:", c: ["kaynak metinle karşılaştırarak", "sayı, tarih ve isimleri tek tek kontrol ederek", "konunun uzmanına danışarak"] },
    { et: "Gizlilik kuralım:", c: ["kişisel veriyi kaldırmadan paylaşmam", "kurumun onayladığı araç dışında paylaşmam", "gizli belgeleri yüklemem"] }
  ];

  /* ---------- Durum ---------- */

  function varsayilan() {
    return {
      e: 0, max: 0,
      r: 0,                        // problem açıldı
      t: [0, 0, 0, 0],             // bileşen sekmeleri görüldü
      k: 0, ka: 0,                 // karşılaştırma çözüldü, deneme
      w: [-1, -1, -1, -1],         // atölye seçimleri
      wr: 0, wb: 0,                // atölye çalıştırıldı, en iyi kalite
      v: [-1, -1, -1, -1], vo: 0, va: 0, // doğrulama
      g: [0, 0, 0, 0],             // gizlilik vakaları çözüldü
      d: [-1, -1, -1, -1, -1],     // değerlendirme
      de: -1, dg: 0, dd: 0,
      p: [-1, -1, -1]              // eylem planı
    };
  }

  var durum = varsayilan();
  var baslangicZamani = new Date().getTime();
  var soruGoster = null;
  var aktifBilesen = -1;
  var icerikEl, gorselEl, geriEl, ileriEl, ipucuEl, yuzdeEl, cubukEl, dolguEl, listeEl, cekmeceEl, menuEl, baslikEl;

  function birlestir(taban, kaynak) {
    Object.keys(taban).forEach(function (k) {
      var t = taban[k], v = kaynak ? kaynak[k] : undefined;
      if (v === undefined || v === null) return;
      if (Array.isArray(t)) {
        if (Array.isArray(v) && v.length === t.length) taban[k] = v.map(function (x, i) { return typeof x === "number" ? x : t[i]; });
      } else if (typeof t === "number" && typeof v === "number") taban[k] = v;
    });
    return taban;
  }

  function aralik(dizi, sinir) { return dizi.map(function (x) { return x >= 0 && x < sinir ? x : -1; }); }

  function durumYukle() {
    var s = SCORM.al("cmi.suspend_data");
    if (!s) return;
    try { durum = birlestir(varsayilan(), JSON.parse(s)); } catch (e) { durum = varsayilan(); }
    durum.e = Math.max(0, Math.min(EKRANLAR.length - 1, durum.e | 0));
    durum.max = Math.max(durum.e, Math.min(EKRANLAR.length - 1, durum.max | 0));
    durum.w = aralik(durum.w, 3);
    durum.v = aralik(durum.v, 3);
    durum.p = aralik(durum.p, 3);
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

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function $(s, k) { return (k || document).querySelector(s); }
  function $$(s, k) { return Array.prototype.slice.call((k || document).querySelectorAll(s)); }
  function harf(i) { return String.fromCharCode(65 + i); }
  function hepsi(d) { return d.every(function (x) { return x === 1; }); }
  function cevapSayisi() { return durum.d.filter(function (x) { return x >= 0; }).length; }
  function puanHesapla() {
    var dogru = 0;
    for (var i = 0; i < SORULAR.length; i++) if (durum.d[i] === SORULAR[i].d) dogru++;
    return { dogru: dogru, puan: Math.round(dogru * 100 / SORULAR.length) };
  }
  function ilkCevapsiz() { for (var i = 0; i < durum.d.length; i++) if (durum.d[i] < 0) return i; return -1; }
  function iyiSayisi() {
    var n = 0;
    durum.w.forEach(function (x, g) { if (x >= 0 && ATOLYE[g].s[x].iyi) n++; });
    return n;
  }
  function gorselCiz(ad, arg) { gorselEl.innerHTML = Izo.sahne(ad, arg); }

  /* ---------- Kapılar ---------- */

  function kapiTamam(i) {
    var ad = EKRANLAR[i];
    if (ad === "problem") return durum.r === 1;
    if (ad === "bilesen") return hepsi(durum.t);
    if (ad === "karsi") return durum.k > 0;
    if (ad === "atolye") return durum.wr === 1;
    if (ad === "dogrula") return durum.vo === 1;
    if (ad === "gizlilik") return hepsi(durum.g);
    if (ad === "test") return cevapSayisi() === SORULAR.length;
    return true;
  }

  function erisilebilir(i) {
    if (i > durum.max) return false;
    for (var j = 0; j < i; j++) if (!kapiTamam(j)) return false;
    return true;
  }

  var KAPI_MESAJ = {
    problem: "Devam etmek için “Daha iyi ne yapılabilirdi?” düğmesine bas.",
    bilesen: "Devam etmek için dört bileşeni de aç.",
    karsi: "Devam etmek için eksik bileşenleri işaretleyip kontrol et.",
    atolye: "Devam etmek için dört grupta seçim yapıp istemi çalıştır.",
    dogrula: "Devam etmek için dört iddiayı sınıflandırıp kontrol et.",
    gizlilik: "Devam etmek için dört vakayı da doğru karara bağla.",
    test: "Devam etmek için 5 soruyu da yanıtla."
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
    aktifBilesen = -1;
    cekmeceKapat();
    ciz();
    durumKaydet();
    if (odak) {
      baslikEl.focus();
      try { window.scrollTo(0, 0); } catch (e) { /* yoksay */ }
    }
  }

  /* ---------- Ekranlar ---------- */

  var EKRAN_FN = {};

  EKRAN_FN.problem = function () {
    gorselCiz("problem");
    var acik = durum.r === 1;
    icerikEl.innerHTML =
      '<div class="cam">' + KURGU_ETIKET +
      '<div class="balon kullanici"><span class="kim">Sen</span>Şu politikayı özetle.<br><span class="dosya">uzaktan-calisma-politikasi.pdf · 12 sayfa</span></div>' +
      '<div class="balon ai"><span class="kim">Yapay zekâ asistanı</span>' + esc(CIKTI_ZAYIF) + "</div></div>" +
      (acik ? "" : '<div class="satir"><button type="button" class="dugme" id="neden">Daha iyi ne yapılabilirdi?</button></div>') +
      '<div id="neden-alan" tabindex="-1" role="status" aria-live="polite">' + (acik ? nedenHtml() : "") + "</div>";
    var b = $("#neden");
    if (b) b.addEventListener("click", function () {
      durum.r = 1;
      durumKaydet();
      ciz();
      $("#neden-alan").focus();
    });
  };

  function nedenHtml() {
    return '<div class="geribildirim"><strong>Yanıt “doğru” görünüyor ama kullanılamaz, çünkü istek belirsizdi:</strong><ul>' +
      "<li><strong>Kim için?</strong> Okuyucu belli değil; ton ve ayrıntı düzeyi tahmin edildi.</li>" +
      "<li><strong>Ne istendi?</strong> “Özetle” yeterince net değil: karar gerektiren maddeler mi, tüm başlıklar mı?</li>" +
      "<li><strong>Nasıl bir çıktı?</strong> Biçim ve uzunluk söylenmedi; çıktı genel geçer kaldı.</li></ul></div>";
  }

  EKRAN_FN.hedef = function () {
    gorselCiz("hedef");
    var h = [
      ["Etkili bir istemin bileşenlerini belirle", "Rol ve bağlam, görev, girdi ve kısıtlar, çıktı biçimi."],
      ["Çıktıyı değerlendir ve doğrulama ihtiyacını gör", "Hangi iddia kaynakla uyumlu, hangisi çelişiyor ya da uydurma?"],
      ["Gizli ve kişisel veri risklerini tanı", "Ne zaman paylaş, anonimleştir ya da paylaşma kararı ver."]
    ].map(function (x, i) {
      return '<div class="hedef"><span class="no" aria-hidden="true">' + (i + 1) + "</span><div><strong>" + x[0] + "</strong>" + x[1] + "</div></div>";
    }).join("");
    icerikEl.innerHTML = '<div class="hedefler">' + h + "</div>" +
      '<div class="cam"><p><strong>Süre:</strong> yaklaşık 6–7 dakika. <strong>Puanlama:</strong> uygulamalar geri bildirim içindir, puana girmez. Yalnızca sondaki 5 soruluk değerlendirme puanlanır (geçme %' + GECME_ESIGI + ").</p>" +
      '<p class="soluk">Bu modül gerçek bir yapay zekâ servisine bağlanmaz. Gösterilen çıktılar önceden yazılmış örneklerdir. Gerçek kararlarda kurumunun yapay zekâ ve veri politikası esastır.</p></div>';
  };

  EKRAN_FN.bilesen = function () {
    gorselCiz("katman", aktifBilesen);
    var sekmeler = BILESENLER.map(function (b, i) {
      return '<button type="button" class="sekme" data-i="' + i + '" aria-pressed="' + (aktifBilesen === i ? "true" : "false") + '">' + b.ad + (durum.t[i] ? '<span class="tik" aria-hidden="true">✓</span><span class="sr-only"> (görüldü)</span>' : "") + "</button>";
    }).join("");
    var istem = BILESENLER.map(function (b, i) {
      return '<span class="parca ' + (aktifBilesen === i ? "aktif" : aktifBilesen >= 0 ? "sonuk" : "") + '">' + esc(b.ornek) + "</span>";
    }).join("");
    var aciklama = aktifBilesen >= 0
      ? '<div class="cam" id="bilesen-aciklama"><h2>' + BILESENLER[aktifBilesen].ad + "</h2><p>" + BILESENLER[aktifBilesen].ne + "</p><p><strong>Neden önemli?</strong> " + BILESENLER[aktifBilesen].neden + "</p></div>"
      : '<div class="cam" id="bilesen-aciklama"><p class="soluk">Bir bileşen seçtiğinde açıklaması ve istemdeki karşılığı vurgulanır.</p></div>';
    icerikEl.innerHTML = '<div class="sekmeler" role="group" aria-label="İstem bileşenleri">' + sekmeler + "</div>" + aciklama +
      '<div class="cam"><h2>Örnek istem</h2><pre class="istem">' + istem + "</pre></div>";
    $$(".sekme", icerikEl).forEach(function (b) {
      b.addEventListener("click", function () {
        aktifBilesen = parseInt(b.getAttribute("data-i"), 10);
        durum.t[aktifBilesen] = 1;
        durumKaydet();
        ciz();
        $('.sekme[data-i="' + aktifBilesen + '"]').focus();
      });
    });
  };

  EKRAN_FN.karsi = function () {
    gorselCiz("karsilastir");
    var cozuldu = durum.k > 0;
    var isimler = BILESENLER.map(function (b, i) {
      var isaretli = cozuldu && KARSI_DOGRU.indexOf(i) >= 0;
      return '<label class="radyo' + (isaretli ? " iyi-secim" : "") + '"><input type="checkbox" data-i="' + i + '"' + (isaretli ? " checked" : "") + (cozuldu ? " disabled" : "") + "><span>" + b.ad + "</span></label>";
    }).join("");
    icerikEl.innerHTML =
      '<div class="iki"><div class="cam"><h2>Geliştirilebilir istem</h2><pre class="istem">Politikayı özetle.</pre>' + KURGU_ETIKET + "<p>" + esc(CIKTI_ZAYIF) + "</p></div>" +
      '<div class="cam"><h2>Güçlü istem</h2><pre class="istem">' + esc(BILESENLER.map(function (b) { return b.ornek; }).join("\n")) + "</pre>" + KURGU_ETIKET + '<pre class="istem">' + esc(CIKTI_IYI) + "</pre></div></div>" +
      '<fieldset class="secenek-grup" style="margin-top:12px"><legend>Geliştirilebilir istemde hangi bileşenler eksik?</legend>' + isimler + "</fieldset>" +
      (cozuldu ? "" : '<div class="satir"><button type="button" class="dugme" id="karsi-kontrol">Kontrol et</button></div>') +
      '<div id="karsi-gb" tabindex="-1" role="status" aria-live="polite">' + (cozuldu ? karsiSonuc(true) : "") + "</div>";
    var k = $("#karsi-kontrol");
    if (k) k.addEventListener("click", karsiKontrol);
  };

  function karsiSonuc(dogru) {
    return '<div class="geribildirim ' + (dogru ? "iyi" : "kotu") + '"><strong>' + (dogru ? "Doğru." : "Henüz değil.") + "</strong> Geliştirilebilir istemde yalnızca <em>görev</em> var (“özetle”). <strong>Rol ve bağlam</strong>, <strong>girdi ve kısıtlar</strong> ve <strong>çıktı biçimi</strong> eksik; bu yüzden çıktı genel kaldı." +
      "</div>";
  }

  function karsiKontrol() {
    var secili = $$("input[type=checkbox]", icerikEl).filter(function (c) { return c.checked; }).map(function (c) { return parseInt(c.getAttribute("data-i"), 10); }).sort();
    var dogru = secili.length === KARSI_DOGRU.length && secili.every(function (x, i) { return x === KARSI_DOGRU[i]; });
    durum.ka += 1;
    if (dogru || durum.ka >= 3) {
      durum.k = dogru ? 1 : 2;
      durumKaydet();
      ciz(); kromGuncelle();
      var gb = $("#karsi-gb");
      if (!dogru) gb.innerHTML = '<div class="geribildirim"><strong>Doğru yanıt gösterildi.</strong> Eksik olanlar: rol ve bağlam, girdi ve kısıtlar, çıktı biçimi.</div>';
      gb.focus();
      return;
    }
    var gb2 = $("#karsi-gb");
    gb2.innerHTML = '<div class="geribildirim kotu"><strong>Henüz değil.</strong> İpucu: geliştirilebilir istemde yalnızca bir şey var. Hangi bileşenin metni orada yer alıyor, hangileri hiç yok?</div>';
    gb2.focus();
  }

  EKRAN_FN.atolye = function () {
    var n = iyiSayisi();
    gorselCiz("atolye", n);
    var gruplar = ATOLYE.map(function (g, gi) {
      var radyolar = g.s.map(function (o, oi) {
        return '<label class="radyo"><input type="radio" name="g' + gi + '" value="' + oi + '"' + (durum.w[gi] === oi ? " checked" : "") + "><span>" + esc(o.m) + "</span></label>";
      }).join("");
      return '<fieldset class="secenek-grup"><legend>' + g.ad + "</legend>" + radyolar + "</fieldset>";
    }).join("");
    icerikEl.innerHTML = '<p class="soluk">Geliştirilebilir istemi güçlendir: her grupta bir seçenek seç, istemi çalıştır ve geri bildirimi oku. İstediğin kadar değiştirebilirsin.</p>' + gruplar +
      '<div class="cam"><h2>Gönderilecek istem</h2><pre class="istem" id="onizleme"></pre></div>' +
      '<div class="satir"><button type="button" class="dugme" id="calistir">İstemi çalıştır</button></div>' +
      '<div id="atolye-sonuc" tabindex="-1" role="status" aria-live="polite"></div>';
    onizlemeGuncelle();
    $$("input[type=radio]", icerikEl).forEach(function (r) {
      r.addEventListener("change", function () {
        var gi = parseInt(r.name.slice(1), 10);
        durum.w[gi] = parseInt(r.value, 10);
        durumKaydet();
        onizlemeGuncelle();
        gorselCiz("atolye", iyiSayisi());
      });
    });
    $("#calistir").addEventListener("click", atolyeCalistir);
    if (durum.wr === 1 && durum.w.every(function (x) { return x >= 0; })) atolyeSonuc(false);
  };

  function onizlemeGuncelle() {
    var satirlar = durum.w.map(function (x, g) { return x >= 0 ? ATOLYE[g].s[x].m : "[" + ATOLYE[g].ad + ": seçilmedi]"; });
    $("#onizleme").textContent = satirlar.join("\n");
  }

  function atolyeCalistir() {
    if (durum.w.some(function (x) { return x < 0; })) {
      var s = $("#atolye-sonuc");
      s.innerHTML = '<div class="geribildirim kotu">Önce dört grupta da bir seçenek seç.</div>';
      s.focus();
      return;
    }
    var n = iyiSayisi();
    durum.wr = 1;
    if (n > durum.wb) durum.wb = n;
    durumKaydet();
    atolyeSonuc(true);
    kromGuncelle();
  }

  function atolyeSonuc(odak) {
    var n = iyiSayisi();
    var cikti = n >= 4 ? CIKTI_IYI : n >= 2 ? CIKTI_ORTA : CIKTI_ZAYIF;
    var seviye = n >= 4 ? "iyi" : n >= 2 ? "" : "kotu";
    var gerekce = durum.w.map(function (x, g) {
      var o = ATOLYE[g].s[x];
      return "<li><span class=\"isaret " + (o.iyi ? "iyi" : "kotu") + '">' + (o.iyi ? "✓" : "✗") + "</span> <strong>" + ATOLYE[g].ad + ":</strong> " + o.a + "</li>";
    }).join("");
    var s = $("#atolye-sonuc");
    s.innerHTML = '<div class="cam" style="margin-top:12px">' + KURGU_ETIKET + '<pre class="istem">' + esc(cikti) + "</pre></div>" +
      '<div class="geribildirim ' + seviye + '"><strong>İstem kalitesi: ' + n + "/4.</strong> " + (n === 4 ? "Dört bileşen de yerinde; çıktı kullanıma hazır ve doğrulama bölümü içeriyor." : "Çıktı seçimlerine göre değişti. Daha iyi bir sonuç için ✗ olan gruplara bak.") + "<ul>" + gerekce + "</ul></div>";
    if (odak) s.focus();
  }

  EKRAN_FN.dogrula = function () {
    gorselCiz("dogrula");
    var cozuldu = durum.vo === 1;
    var kaynak = KAYNAK_METIN.map(function (k) { return esc(k); }).join("<br>");
    var iddialar = IDDIALAR.map(function (c, i) {
      var secs = IDDIA_SECENEK.map(function (s, j) {
        var sinif = "";
        if (cozuldu && j === c.d) sinif = " dogru";
        return '<button type="button" class="mini' + sinif + '" data-c="' + i + '" data-j="' + j + '" aria-pressed="' + (durum.v[i] === j ? "true" : "false") + '"' + (cozuldu ? ' aria-disabled="true"' : "") + ">" + s + (cozuldu && j === c.d ? " ✓" : "") + "</button>";
      }).join("");
      return '<div class="vaka"><p><strong>' + (i + 1) + ".</strong> " + esc(c.m) + '</p><div class="secim-satir" role="group" aria-label="İddia ' + (i + 1) + '">' + secs + '</div><div class="iddia-gb" data-c="' + i + '"></div></div>';
    }).join("");
    icerikEl.innerHTML = '<div class="cam"><h2>Kaynak metin</h2><p>' + kaynak + "</p></div>" +
      '<div class="cam">' + KURGU_ETIKET + "<h2>Yapay zekâ özeti: iddiaları kaynakla karşılaştır</h2>" + iddialar + "</div>" +
      (cozuldu ? "" : '<div class="satir"><button type="button" class="dugme" id="dogrula-kontrol">Kontrol et</button></div>') +
      '<div id="dogrula-gb" tabindex="-1" role="status" aria-live="polite"></div>';
    if (cozuldu) {
      IDDIALAR.forEach(function (c, i) { $('.iddia-gb[data-c="' + i + '"]').innerHTML = '<p class="soluk"><span class="isaret iyi">✓</span> ' + esc(c.a) + "</p>"; });
    }
    $$(".mini", icerikEl).forEach(function (b) {
      b.addEventListener("click", function () {
        if (durum.vo === 1) return;
        var c = parseInt(b.getAttribute("data-c"), 10), j = parseInt(b.getAttribute("data-j"), 10);
        durum.v[c] = j;
        $$('.mini[data-c="' + c + '"]').forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        durumKaydet();
      });
    });
    var k = $("#dogrula-kontrol");
    if (k) k.addEventListener("click", dogrulaKontrol);
  };

  function dogrulaKontrol() {
    var bos = 0, yanlis = 0;
    IDDIALAR.forEach(function (c, i) {
      var alan = $('.iddia-gb[data-c="' + i + '"]');
      if (durum.v[i] < 0) { bos++; alan.innerHTML = '<p class="soluk"><span class="isaret kotu">✗</span> Bir seçenek seç.</p>'; return; }
      if (durum.v[i] === c.d) alan.innerHTML = '<p class="soluk"><span class="isaret iyi">✓</span> Doğru. ' + esc(c.a) + "</p>";
      else { yanlis++; alan.innerHTML = '<p class="soluk"><span class="isaret kotu">✗</span> Henüz değil. Kaynak metne tekrar bak.</p>'; }
    });
    var gb = $("#dogrula-gb");
    if (!bos && !yanlis) {
      durum.vo = 1; durumKaydet();
      ciz(); kromGuncelle();
      $("#dogrula-gb").innerHTML = '<div class="geribildirim iyi"><strong>Hepsi doğru.</strong> Akıcı bir özet bile hata (2. iddia) ve uydurma (3. iddia) içerebilir. Sayı, tarih ve kuralları kaynakla karşılaştır.</div>';
      $("#dogrula-gb").focus();
      return;
    }
    durum.va += 1;
    durumKaydet();
    if (durum.va >= 3) {
      durum.vo = 1; durumKaydet();
      ciz(); kromGuncelle();
      $("#dogrula-gb").innerHTML = '<div class="geribildirim"><strong>Doğru yanıtlar gösterildi.</strong> Akıcı bir özet bile hata ve uydurma içerebilir; kaynakla karşılaştır.</div>';
      $("#dogrula-gb").focus();
      return;
    }
    gb.innerHTML = '<div class="geribildirim kotu">' + (bos ? bos + " iddia boş. " : "") + (yanlis ? yanlis + " iddiayı tekrar kontrol et (✗). " : "") + "Her iddiayı kaynak metindeki maddeyle tek tek karşılaştır.</div>";
    gb.focus();
    kromGuncelle();
  }

  EKRAN_FN.gizlilik = function () {
    gorselCiz("gizlilik");
    var vakalar = VAKALAR.map(function (v, i) {
      var cozuldu = durum.g[i] === 1;
      var secs = VAKA_SECENEK.map(function (s, j) {
        return '<button type="button" class="mini' + (cozuldu && j === v.d ? " dogru" : "") + '" data-c="' + i + '" data-j="' + j + '"' + (cozuldu ? ' aria-disabled="true"' : "") + ">" + s + (cozuldu && j === v.d ? " ✓" : "") + "</button>";
      }).join("");
      return '<div class="vaka" data-c="' + i + '"><p><strong>' + (i + 1) + ".</strong> " + esc(v.m) + '</p><div class="secim-satir" role="group" aria-label="Vaka ' + (i + 1) + '">' + secs + '</div><div class="vaka-gb" role="status" aria-live="polite">' + (cozuldu ? '<p class="soluk"><span class="isaret iyi">✓</span> ' + esc(v.a) + "</p>" : "") + "</div></div>";
    }).join("");
    icerikEl.innerHTML = '<p class="soluk">Her vaka için karar ver: olduğu gibi paylaş, kişisel veriyi kaldırarak (anonimleştirerek) paylaş ya da paylaşma. Gerçek kararlarda kurumunun politikası esastır.</p>' + vakalar;
    $$(".mini", icerikEl).forEach(function (b) {
      b.addEventListener("click", function () {
        var c = parseInt(b.getAttribute("data-c"), 10), j = parseInt(b.getAttribute("data-j"), 10);
        if (durum.g[c] === 1) return;
        var alan = $('.vaka[data-c="' + c + '"] .vaka-gb');
        if (j === VAKALAR[c].d) {
          durum.g[c] = 1; durumKaydet();
          ciz(); kromGuncelle();
          var yeni = $('.vaka[data-c="' + c + '"] .mini.dogru');
          if (yeni) yeni.focus();
        } else {
          b.classList.add("yanlis");
          b.textContent = VAKA_SECENEK[j] + " ✗";
          alan.innerHTML = '<p class="soluk"><span class="isaret kotu">✗</span> Daha güvenli bir seçenek var. Veri türünü ve kimin görebileceğini düşün, başka bir seçenek dene.</p>';
        }
      });
    });
  };

  function soruEkrani(q) {
    gorselCiz(q % 2 ? "karsilastir" : "dogrula");
    var Q = SORULAR[q];
    var secili = durum.d[q];
    var cevaplandi = secili >= 0;
    var secs = Q.c.map(function (c, i) {
      var sinif = "", dm = "";
      if (cevaplandi) {
        if (i === Q.d) { sinif = "dogru"; dm = i === secili ? "Doğru ✓" : "Doğru cevap ✓"; }
        else if (i === secili) { sinif = "yanlis"; dm = "Henüz değil ✗"; }
      }
      return '<button type="button" class="secenek ' + sinif + '" data-i="' + i + '"' + (cevaplandi ? ' aria-disabled="true"' : "") + '><span class="harf" aria-hidden="true">' + harf(i) + '</span><span class="metin-s">' + esc(c) + "</span>" + (dm ? '<span class="durum">' + dm + "</span>" : "") + "</button>";
    }).join("");
    var alt = cevaplandi ? '<div class="geribildirim ' + (secili === Q.d ? "iyi" : "kotu") + '" id="gb" tabindex="-1" role="status"><strong>' + (secili === Q.d ? "Doğru." : "Henüz değil.") + "</strong> " + esc(Q.a) + '</div><div class="satir"><button type="button" class="dugme" id="sonraki-soru">' + (q === SORULAR.length - 1 ? "Sonucu gör" : "Sonraki soru") + "</button></div>" : "";
    icerikEl.innerHTML = '<div class="cam"><p class="soru-basi">Soru ' + (q + 1) + "/" + SORULAR.length + "</p><p>" + esc(Q.s) + '</p><div class="secenekler" role="group" aria-label="Yanıt seçenekleri">' + secs + "</div>" + alt + "</div>";
    if (!cevaplandi) {
      $$(".secenek", icerikEl).forEach(function (b) {
        b.addEventListener("click", function () { soruCevapla(q, parseInt(b.getAttribute("data-i"), 10)); });
      });
    } else {
      $("#sonraki-soru").addEventListener("click", function () {
        soruGoster = q === SORULAR.length - 1 ? -1 : q + 1;
        ciz();
        icerikEl.focus();
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
    } else durumKaydet();
    soruEkrani(q);
    kromGuncelle();
    var gb = $("#gb"); if (gb) gb.focus();
  }

  function planOzet() {
    if (durum.p.some(function (x) { return x < 0; })) return "";
    return "<strong>Kişisel kuralların:</strong><ul>" + PLAN.map(function (p, i) { return "<li>" + esc(p.et) + " <strong>" + esc(p.c[durum.p[i]]) + "</strong>.</li>"; }).join("") + "</ul>";
  }

  function sonucKarti() {
    gorselCiz("eylem");
    var h = puanHesapla();
    var gecti = h.puan >= GECME_ESIGI;
    var planHtml = PLAN.map(function (p, i) {
      return '<label for="plan' + i + '">' + p.et + '</label><select id="plan' + i + '" data-i="' + i + '"><option value="-1">Seç…</option>' + p.c.map(function (c, j) { return '<option value="' + j + '"' + (durum.p[i] === j ? " selected" : "") + ">" + esc(c) + "</option>"; }).join("") + "</select>";
    }).join("");
    icerikEl.innerHTML = '<div class="cam"><h2>Değerlendirme sonucu</h2><div class="skorlar">' +
      '<div class="skor ' + (gecti ? "iyi" : "kotu") + '"><span class="e">Bu deneme</span><span class="d">' + h.dogru + "/" + SORULAR.length + " (%" + h.puan + ")</span></div>" +
      '<div class="skor"><span class="e">En iyi puan</span><span class="d">%' + Math.max(0, durum.de) + "</span></div>" +
      '<div class="skor ' + (durum.dg ? "iyi" : "kotu") + '"><span class="e">Durum</span><span class="d">' + (durum.dg ? "Geçti ✓" : "Geçilmedi ✗") + "</span></div></div>" +
      '<p class="soluk">Geçme eşiği %' + GECME_ESIGI + " (en az 4/5). Deneme sayısı: " + durum.dd + ". SCORM 1.2’de tek durum alanı olduğu için LMS’e “passed” ya da “failed” gönderilir.</p>" +
      '<div class="satir"><button type="button" class="dugme ikincil" id="yeniden-test">Yeniden dene</button></div></div>' +
      '<div class="cam plan"><h2>Eylem planın</h2><p class="soluk">Kendi işin için bir kullanım, bir doğrulama ve bir gizlilik kuralı seç. Seçimlerin yalnızca bu oturumda tutulur ve puana girmez.</p>' + planHtml + '<div id="plan-ozet" style="margin-top:10px" role="status" aria-live="polite">' + (planOzet() ? '<div class="geribildirim iyi">' + planOzet() + "</div>" : "") + "</div></div>";
    $("#yeniden-test").addEventListener("click", function () {
      durum.d = [-1, -1, -1, -1, -1];
      soruGoster = 0;
      durumKaydet();
      ciz();
      icerikEl.focus();
    });
    $$(".plan select", icerikEl).forEach(function (s) {
      s.addEventListener("change", function () {
        durum.p[parseInt(s.getAttribute("data-i"), 10)] = parseInt(s.value, 10);
        durumKaydet();
        var o = planOzet();
        $("#plan-ozet").innerHTML = o ? '<div class="geribildirim iyi">' + o + "</div>" : "";
      });
    });
  }

  EKRAN_FN.test = function () {
    if (soruGoster === null) soruGoster = ilkCevapsiz();
    if (soruGoster === -1) sonucKarti();
    else soruEkrani(soruGoster);
  };

  /* ---------- Krom ---------- */

  function ilerlemeYuzde() {
    var say = 0;
    for (var i = 0; i < EKRANLAR.length; i++) {
      if (i > durum.max) break;
      if (kapiTamam(i)) say++;
    }
    return Math.round(say * 100 / EKRANLAR.length);
  }

  function cekmeceKapat() {
    if (!cekmeceEl) return;
    cekmeceEl.hidden = true;
    menuEl.setAttribute("aria-expanded", "false");
  }

  function listeCiz() {
    listeEl.innerHTML = EKRANLAR.map(function (a, i) {
      var aktif = i === durum.e, acik = erisilebilir(i);
      var tik = i < durum.max && kapiTamam(i) && !aktif;
      return '<li><button type="button" data-i="' + i + '"' + (aktif ? ' aria-current="step"' : "") + (acik ? "" : " disabled") + '><span class="no">' + (i + 1) + "</span><span>" + BASLIKLAR[i] + (tik ? ' <span aria-hidden="true">✓</span><span class="sr-only">(tamamlandı)</span>' : "") + "</span></button></li>";
    }).join("");
    $$("button", listeEl).forEach(function (b) { b.addEventListener("click", function () { git(parseInt(b.getAttribute("data-i"), 10), true); }); });
  }

  function kromGuncelle() {
    baslikEl.textContent = BASLIKLAR[durum.e];
    var mesaj = ileriIzni();
    geriEl.disabled = durum.e === 0;
    ileriEl.disabled = !!mesaj;
    ipucuEl.textContent = durum.e >= EKRANLAR.length - 1 ? "" : mesaj;
    var y = ilerlemeYuzde();
    yuzdeEl.textContent = "%" + y + " tamamlandı";
    dolguEl.style.width = y + "%";
    cubukEl.setAttribute("aria-valuenow", y);
    listeCiz();
  }

  function ciz() {
    EKRAN_FN[EKRANLAR[durum.e]]();
    kromGuncelle();
  }

  function basla() {
    icerikEl = $("#icerik"); gorselEl = $("#gorsel"); geriEl = $("#geri"); ileriEl = $("#ileri"); ipucuEl = $("#ipucu");
    yuzdeEl = $("#yuzde"); cubukEl = $("#cubuk"); dolguEl = $("#cubuk-dolgu"); listeEl = $("#liste"); cekmeceEl = $("#cekmece");
    menuEl = $("#menu-ac"); baslikEl = $("#ekran-baslik");
    if (SCORM.baslat()) {
      var s = SCORM.al("cmi.core.lesson_status");
      if (s === "not attempted" || s === "") SCORM.ayarla("cmi.core.lesson_status", "incomplete");
      durumYukle();
    }
    geriEl.addEventListener("click", function () { git(durum.e - 1, true); });
    ileriEl.addEventListener("click", function () { if (!ileriIzni()) git(durum.e + 1, true); });
    menuEl.addEventListener("click", function () {
      var acik = !cekmeceEl.hidden;
      cekmeceEl.hidden = acik;
      menuEl.setAttribute("aria-expanded", acik ? "false" : "true");
      if (!acik) { var b = $("button:not(:disabled)", listeEl); if (b) b.focus(); }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !cekmeceEl.hidden) { cekmeceKapat(); menuEl.focus(); }
    });
    window.addEventListener("beforeunload", oturumuBitir);
    window.addEventListener("unload", oturumuBitir);
    window.addEventListener("pagehide", oturumuBitir);
    ciz();
    durumKaydet();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", basla);
  else basla();
})();
