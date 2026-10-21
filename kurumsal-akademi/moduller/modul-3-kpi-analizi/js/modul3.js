/* Modül 3: Eğitim KPI'larını Excel'de Okumak
   SCORM 1.2. Dış bağımlılık yok. */
(function () {
  "use strict";

  var SCORM = window.SCORM;
  var GECME_ESIGI = 80;
  var EKRANLAR = ["problem", "hedef", "formul", "pano", "yorum", "aksiyon", "ozet", "test"];
  var SEKME = [
    { ad: "Problem", baslik: "Q3 eğitimleri nasıl gitti?" },
    { ad: "Hedefler", baslik: "Bu modülün hedefleri" },
    { ad: "Formül", baslik: "Tamamlama oranını hesapla" },
    { ad: "Pano", baslik: "KPI Panosu" },
    { ad: "Yorum", baslik: "Rakamı yorumla" },
    { ad: "Aksiyon", baslik: "Veriden aksiyona" },
    { ad: "Özet", baslik: "Yönetici özeti" },
    { ad: "Test", baslik: "Değerlendirme ve kapanış" }
  ];

  /* ---------- Veri seti (2026 Q3) ---------- */
  /* hk: haftalık kayıt (12 hafta), ht: haftalık tamamlayan (aynı kohort). Toplamlar k ve t ile tutarlıdır. */
  var EGITIMLER = [
    { id: "ofis", ad: "Ofis Güvenliği", kisa: ["Ofis", "Güvenliği"], k: 120, t: 108, mem: 4.4, sinav: 86,
      hk: [11, 9, 14, 9, 13, 11, 7, 12, 7, 11, 8, 8], ht: [11, 9, 11, 7, 12, 11, 6, 10, 7, 9, 8, 7] },
    { id: "musteri", ad: "Müşteri İletişimi", kisa: ["Müşteri", "İletişimi"], k: 80, t: 52, mem: 3.6, sinav: 71,
      hk: [6, 6, 7, 10, 6, 9, 9, 7, 7, 4, 4, 5], ht: [3, 4, 4, 7, 4, 5, 6, 5, 4, 3, 3, 4] },
    { id: "excel", ad: "Excel Temelleri", kisa: ["Excel", "Temelleri"], k: 60, t: 51, mem: 4.5, sinav: 78,
      hk: [6, 5, 7, 4, 5, 7, 3, 4, 3, 5, 6, 5], ht: [5, 4, 6, 3, 4, 6, 3, 4, 3, 4, 4, 5] },
    { id: "yonetici", ad: "Yeni Yönetici Programı", kisa: ["Yeni", "Yönetici"], k: 40, t: 34, mem: 4.1, sinav: 74,
      hk: [4, 5, 5, 3, 4, 4, 2, 3, 2, 2, 2, 4], ht: [3, 4, 4, 3, 3, 3, 2, 3, 2, 2, 2, 3] },
    { id: "kvkk", ad: "Kişisel Verilerin Korunması Farkındalığı", kisa: ["KVKK", "Farkındalığı"], k: 200, t: 150, mem: 3.9, sinav: 81,
      hk: [17, 24, 25, 14, 14, 15, 15, 17, 19, 14, 10, 16], ht: [11, 17, 20, 10, 10, 11, 12, 11, 16, 11, 8, 13] }
  ];
  var DONEMLER = [
    { id: "tum", ad: "Tüm çeyrek (Q3)", a: 0, b: 12 },
    { id: "tem", ad: "Temmuz (H1–H4)", a: 0, b: 4 },
    { id: "agu", ad: "Ağustos (H5–H8)", a: 4, b: 8 },
    { id: "eyl", ad: "Eylül (H9–H12)", a: 8, b: 12 }
  ];
  var METRIKLER = [
    { id: "oran", ad: "Tamamlama %", max: 100 },
    { id: "mem", ad: "Memnuniyet (5)", max: 5 },
    { id: "sinav", ad: "Sınav ort. (100)", max: 100 }
  ];

  function topla(d) { return d.reduce(function (a, b) { return a + b; }, 0); }
  function bul(id) { for (var i = 0; i < EGITIMLER.length; i++) if (EGITIMLER[i].id === id) return EGITIMLER[i]; return null; }
  function ondalik(n, b) { return (Math.round(n * Math.pow(10, b)) / Math.pow(10, b)).toFixed(b).replace(".", ","); }
  function yuzdeMetin(n) { return "%" + ondalik(n, 1); }

  function hesapla(egitimId, donemId) {
    var dn = DONEMLER.filter(function (x) { return x.id === donemId; })[0];
    var liste = egitimId === "tum" ? EGITIMLER : [bul(egitimId)];
    var kay = 0, tam = 0;
    liste.forEach(function (e) {
      kay += topla(e.hk.slice(dn.a, dn.b));
      tam += topla(e.ht.slice(dn.a, dn.b));
    });
    var mem = null, sinav = null;
    if (donemId === "tum") {
      mem = topla(liste.map(function (e) { return e.mem; })) / liste.length;
      sinav = topla(liste.map(function (e) { return e.sinav; })) / liste.length;
    }
    return { kay: kay, tam: tam, oran: kay ? tam * 100 / kay : 0, mem: mem, sinav: sinav };
  }

  function haftalikOran(egitimId) {
    var liste = egitimId === "tum" ? EGITIMLER : [bul(egitimId)];
    var o = [];
    for (var h = 0; h < 12; h++) {
      var k = 0, t = 0;
      liste.forEach(function (e) { k += e.hk[h]; t += e.ht[h]; });
      o.push(k ? t * 100 / k : 0);
    }
    return o;
  }

  /* ---------- Sorular ve içerik ---------- */

  var YORUM = [
    { s: "Müdür “toplam tamamlama oranı kaç?” diye soruyor. Hangisi doğru?",
      c: ["%80,0: beş eğitimin oranlarının basit ortalaması", "%79,0: toplam tamamlayan ÷ toplam kayıtlı (395 ÷ 500)", "%75,0: en düşük iki oranın ortalaması"],
      d: 1, a: "Eğitimlerin kayıt sayıları farklıdır (40 ile 200 arası). Büyük eğitimler sonucu daha çok etkilemelidir; bu yüzden toplam ÷ toplam hesaplanır. Basit ortalama (%80,0) küçük eğitimleri olduğundan fazla ağırlıklandırır." },
    { s: "Hangi eğitim hem tamamlamada hem memnuniyette en geride?",
      c: ["Kişisel Verilerin Korunması Farkındalığı", "Ofis Güvenliği", "Müşteri İletişimi"],
      d: 2, a: "Müşteri İletişimi: %65,0 tamamlama ve 3,6/5 memnuniyet. KVKK eğitimi de düşük (%75,0 ve 3,9) ama Müşteri İletişimi iki ölçüde de en alttadır." },
    { s: "Bu iki düşük değer birlikte neyi gösterir?",
      c: ["Katılımcıların kesin olarak isteksiz olduğunu", "Eğitimin tasarımında ya da akışında bir sorun olabileceğini; nedenini araştırmak gerekir", "Memnuniyet anketinin hatalı olduğunu"],
      d: 1, a: "Birlikte düşük çıkan iki ölçü bir sinyaldir, kanıt değil. Neden için ek veri gerekir (hangi modülde bırakıldı, açık uçlu yorumlar)." }
  ];

  var AKSIYONLAR = [
    { m: "Ofis Güvenliği içeriğini baştan tasarla.", iyi: false,
      a: "Bu eğitim en iyi performansa yakın: %90,0 tamamlama, 4,4 memnuniyet. Kaynağı en sorunlu yere ayırmak gerekir." },
    { m: "Tüm eğitimler için tamamlama süresini kısalt ve hatırlatma sayısını artır.", iyi: false,
      a: "Sorun tüm eğitimlerde değil. Veri, tek bir eğitimde belirgin düşüşü gösteriyor; geniş kapsamlı bir önlem gereksiz maliyet ve yorgunluk yaratır." },
    { m: "Müşteri İletişimi’nde bırakma noktalarını ve yorumları incele; içeriği gözden geçirip 3 ay sonra aynı metriklerle yeniden ölç.", iyi: true,
      a: "Veri en zayıf noktayı (%65,0 ve 3,6) gösteriyor. Neden analizi, hedefli bir iyileştirme ve aynı ölçütle yeniden ölçüm döngüyü kapatır." },
    { m: "Memnuniyet anketini kaldır; düşük puanlar moral bozuyor.", iyi: false,
      a: "Sorunu ölçmeyi bırakmak sorunu çözmez. Memnuniyet verisi iyileştirmenin ana girdisidir." }
  ];

  var OZET_BOSLUKLAR = [
    { c: ["500", "450", "400"], d: 0 },
    { c: ["395", "385", "405"], d: 0 },
    { c: ["%79,0", "%80,0", "%75,0"], d: 0 },
    { c: ["Müşteri İletişimi", "Kişisel Verilerin Korunması", "Ofis Güvenliği"], d: 0 },
    { c: ["%65,0", "%75,0", "%90,0"], d: 0 },
    { c: ["3,6", "3,9", "4,4"], d: 0 },
    { c: ["içeriği gözden geçirip 3 ay sonra aynı ölçütlerle yeniden ölçmek", "eğitimi tamamen kaldırmak", "memnuniyet anketini kaldırmak"], d: 0 }
  ];

  var SORULAR = [
    { s: "B4 hücresinde kayıtlı sayısı 60, C4 hücresinde tamamlayan sayısı 51. Tamamlama oranı için doğru formül ve sonuç hangisi?",
      c: ["=B4/C4 → %117,6", "=C4/B4 → %85,0", "=C4-B4 → -9"],
      d: 1, a: "Oran = tamamlayan ÷ kayıtlı = 51 ÷ 60 = 0,85 → %85,0. Ters bölme %100’ü aşan anlamsız bir oran verir." },
    { s: "X eğitiminde 10 kayıt/10 tamamlayan (%100), Y eğitiminde 90 kayıt/10 tamamlayan (%11,1). Toplam tamamlama oranı kaçtır?",
      c: ["%55,6 (iki oranın basit ortalaması)", "%100", "%20,0 (20 ÷ 100)"],
      d: 2, a: "Toplam tamamlayan 20, toplam kayıtlı 100: %20,0. Basit ortalama küçük eğitimi (X) olduğundan fazla etkiler." },
    { s: "Ofis Güvenliği’nin memnuniyeti 4,4, Müşteri İletişimi’nin 3,6. En doğru yorum hangisi?",
      c: ["Müşteri İletişimi’nde 0,8 puanlık geride kalış var; tamamlama (%65,0) ile birlikte izlenmeli.", "Eğitmen kesinlikle yetersiz.", "Fark anlamsız çünkü puanlar ondalıklı."],
      d: 0, a: "Fark somut bir sinyaldir ama nedeni bilinmez. Diğer metriklerle birlikte okunmalı, neden yargısı kanıtsız verilmemeli." },
    { s: "Düşük tamamlama oranının NEDENİNİ anlamak için hangi ek veri en çok işe yarar?",
      c: ["Toplam kayıt sayısının artışı", "Katılımcıların hangi modülde bıraktığı ve açık uçlu geri bildirimleri", "Eğitimin adı"],
      d: 1, a: "Oran ne kadar sorunu gösterir; neden için davranış ve geri bildirim verisi gerekir." },
    { s: "Yönetici özetinin ilk cümlesi hangisi olmalı?",
      c: ["“Excel’de 14 sayfa hazırladım.”", "“Veriler genel olarak iyi.”", "“Q3’te 500 kayıttan 395’i tamamlandı (%79,0); en zayıf alan Müşteri İletişimi (%65,0 ve 3,6/5).”"],
      d: 2, a: "Yönetici önce sonucu, rakamla ve en önemli bulguyla duymak ister; yöntem ayrıntısı sonra gelir." }
  ];

  /* ---------- Durum ---------- */

  function varsayilan() {
    return {
      e: 0, max: 0,
      f: [0, 0], fa: [0, 0],          // formül hücreleri: 0 bekliyor, 1 doğru, 2 gösterildi; deneme sayısı
      pm: [0, 0, 0],                  // metrik sekmeleri görüldü
      pe: [0, 0, 0, 0, 0, 0],         // seçilen eğitimler (0: tümü, 1–5: eğitimler)
      pd: 0,                          // dönem filtresi değişti
      y: [0, 0, 0],                   // yorum soruları çözüldü
      a: 0,                           // en iyi aksiyon seçildi
      o: 0, oa: 0,                    // özet tamamlandı, kontrol sayısı
      d: [-1, -1, -1, -1, -1],        // değerlendirme yanıtları
      de: -1, dg: 0, dd: 0
    };
  }

  var durum = varsayilan();
  var baslangicZamani = new Date().getTime();
  var kullanici = { e: "tum", d: "tum", m: "oran" };
  var soruGoster = null;
  var icerikEl, geriEl, ileriEl, ipucuEl, sekmeEl, baslikEl, yuzdeEl;

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

  function durumYukle() {
    var s = SCORM.al("cmi.suspend_data");
    if (!s) return;
    try { durum = birlestir(varsayilan(), JSON.parse(s)); } catch (e) { durum = varsayilan(); }
    durum.e = Math.max(0, Math.min(EKRANLAR.length - 1, durum.e | 0));
    durum.max = Math.max(durum.e, Math.min(EKRANLAR.length - 1, durum.max | 0));
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
  function hepsi(d) { return d.every(function (x) { return x > 0; }); }
  function cevapSayisi() { return durum.d.filter(function (x) { return x >= 0; }).length; }
  function puanHesapla() {
    var dogru = 0;
    for (var i = 0; i < SORULAR.length; i++) if (durum.d[i] === SORULAR[i].d) dogru++;
    return { dogru: dogru, puan: Math.round(dogru * 100 / SORULAR.length) };
  }
  function ilkCevapsiz() { for (var i = 0; i < durum.d.length; i++) if (durum.d[i] < 0) return i; return -1; }
  function sayiAyikla(s) {
    var t = String(s).trim().replace("%", "").replace(",", ".");
    if (!t || isNaN(t)) return null;
    var n = parseFloat(t);
    return n <= 1 ? n * 100 : n;
  }

  /* ---------- Kapılar ve gezinme ---------- */

  function panoTamam() {
    return hepsi(durum.pm) && topla(durum.pe.map(function (x) { return x ? 1 : 0; })) >= 3 && durum.pd === 1;
  }

  function kapiTamam(i) {
    var ad = EKRANLAR[i];
    if (ad === "formul") return durum.f[0] > 0 && durum.f[1] > 0;
    if (ad === "pano") return panoTamam();
    if (ad === "yorum") return hepsi(durum.y);
    if (ad === "aksiyon") return durum.a === 1;
    if (ad === "ozet") return durum.o === 1;
    if (ad === "test") return cevapSayisi() === SORULAR.length;
    return true;
  }

  function erisilebilir(i) {
    if (i > durum.max) return false;
    for (var j = 0; j < i; j++) if (!kapiTamam(j)) return false;
    return true;
  }

  var KAPI_MESAJ = {
    formul: "Devam etmek için iki hücreyi de doldur (Kontrol et).",
    pano: "Devam etmek için keşif görevini tamamla.",
    yorum: "Devam etmek için üç soruyu da doğru yanıtla.",
    aksiyon: "Devam etmek için veriyle en iyi örtüşen aksiyonu seç.",
    ozet: "Devam etmek için özet cümlelerini tamamla.",
    test: "Devam etmek için 5 soruyu da yanıtla."
  };

  function ileriIzni() {
    if (durum.e >= EKRANLAR.length - 1) return "Bu son sayfa.";
    if (!kapiTamam(durum.e)) return KAPI_MESAJ[EKRANLAR[durum.e]] || "";
    return "";
  }

  function git(i, odak) {
    i = Math.max(0, Math.min(EKRANLAR.length - 1, i));
    durum.e = i;
    durum.max = Math.max(durum.max, i);
    soruGoster = null;
    ciz();
    durumKaydet();
    if (odak) {
      baslikEl.focus();
      try { window.scrollTo(0, 0); } catch (e) { /* yoksay */ }
    }
  }

  /* ---------- Grafikler (SVG) ---------- */

  function cizgiGrafik(egitimId, donemId) {
    var o = haftalikOran(egitimId);
    var dn = DONEMLER.filter(function (x) { return x.id === donemId; })[0];
    var W = 420, H = 230, sol = 38, sag = 12, ust = 14, alt = 34;
    var gw = W - sol - sag, gh = H - ust - alt;
    function x(i) { return sol + gw * i / 11; }
    function y(v) { return ust + gh * (1 - v / 100); }
    var s = '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' + esc(cizgiAciklama(o)) + '">';
    [0, 25, 50, 75, 100].forEach(function (g) {
      s += '<line x1="' + sol + '" x2="' + (W - sag) + '" y1="' + y(g) + '" y2="' + y(g) + '" stroke="#dfe6e1"/>' +
        '<text x="' + (sol - 6) + '" y="' + (y(g) + 4) + '" font-size="10" text-anchor="end" fill="#4b5d52">' + g + "</text>";
    });
    var pts = o.map(function (v, i) { return x(i).toFixed(1) + "," + y(v).toFixed(1); }).join(" ");
    s += '<polyline points="' + pts + '" fill="none" stroke="#1f6f3f" stroke-width="2.4" stroke-linejoin="round"/>';
    o.forEach(function (v, i) {
      var icinde = i >= dn.a && i < dn.b;
      s += '<circle cx="' + x(i).toFixed(1) + '" cy="' + y(v).toFixed(1) + '" r="4.2" fill="' + (icinde ? "#1f6f3f" : "#fff") + '" stroke="#1f6f3f" stroke-width="2"' + (icinde ? "" : ' opacity=".55"') + "/>";
      s += '<text x="' + x(i).toFixed(1) + '" y="' + (H - 14) + '" font-size="10" text-anchor="middle" fill="#4b5d52">H' + (i + 1) + "</text>";
    });
    return s + "</svg>";
  }

  function cizgiAciklama(o) {
    var mn = 0, mx = 0;
    o.forEach(function (v, i) { if (v < o[mn]) mn = i; if (v > o[mx]) mx = i; });
    return "Haftalık tamamlama oranı çizgi grafiği. En düşük hafta H" + (mn + 1) + " (" + yuzdeMetin(o[mn]) + "), en yüksek hafta H" + (mx + 1) + " (" + yuzdeMetin(o[mx]) + "). Tablo karşılığı aşağıdadır.";
  }

  function degerAl(e, m) { return m === "oran" ? e.t * 100 / e.k : m === "mem" ? e.mem : e.sinav; }
  function degerMetin(v, m) { return m === "oran" ? yuzdeMetin(v) : m === "mem" ? ondalik(v, 1) : String(Math.round(v)); }

  function cubukGrafik(egitimId, metrik) {
    var M = METRIKLER.filter(function (x) { return x.id === metrik; })[0];
    var W = 420, H = 230, sol = 30, sag = 8, ust = 18, alt = 44;
    var gw = W - sol - sag, gh = H - ust - alt;
    var s = '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' + esc(M.ad + " çubuk grafiği: " + EGITIMLER.map(function (e) { return e.kisa.join(" ") + " " + degerMetin(degerAl(e, metrik), metrik); }).join("; ")) + '">';
    var adim = M.max === 5 ? 1 : 25;
    for (var g = 0; g <= M.max; g += adim) {
      var yy = ust + gh * (1 - g / M.max);
      s += '<line x1="' + sol + '" x2="' + (W - sag) + '" y1="' + yy + '" y2="' + yy + '" stroke="#dfe6e1"/><text x="' + (sol - 5) + '" y="' + (yy + 4) + '" font-size="10" text-anchor="end" fill="#4b5d52">' + g + "</text>";
    }
    var bw = gw / EGITIMLER.length;
    EGITIMLER.forEach(function (e, i) {
      var v = degerAl(e, metrik), h = gh * v / M.max;
      var secili = egitimId === e.id;
      var fill = egitimId === "tum" ? "#2f8f5b" : secili ? "#14532d" : "#9fc9ae";
      var bx = sol + i * bw + bw * 0.18;
      s += '<rect x="' + bx.toFixed(1) + '" y="' + (ust + gh - h).toFixed(1) + '" width="' + (bw * 0.64).toFixed(1) + '" height="' + h.toFixed(1) + '" rx="3" fill="' + fill + '"/>';
      s += '<text x="' + (bx + bw * 0.32).toFixed(1) + '" y="' + (ust + gh - h - 4).toFixed(1) + '" font-size="10.5" font-weight="700" text-anchor="middle" fill="#16251c">' + degerMetin(v, metrik) + "</text>";
      s += '<text x="' + (bx + bw * 0.32).toFixed(1) + '" y="' + (H - 24) + '" font-size="10" text-anchor="middle" fill="#4b5d52">' + e.kisa[0] + "</text>";
      s += '<text x="' + (bx + bw * 0.32).toFixed(1) + '" y="' + (H - 11) + '" font-size="10" text-anchor="middle" fill="#4b5d52">' + e.kisa[1] + "</text>";
    });
    return s + "</svg>";
  }

  function tabloKarsiligi() {
    var satirlar = EGITIMLER.map(function (e) {
      return "<tr><td>" + esc(e.ad) + "</td><td>" + e.k + "</td><td>" + e.t + "</td><td>" + yuzdeMetin(e.t * 100 / e.k) + "</td><td>" + ondalik(e.mem, 1) + "</td><td>" + e.sinav + "</td></tr>";
    }).join("");
    var o = haftalikOran(kullanici.e);
    var hafta = o.map(function (v, i) { return "<tr><td>H" + (i + 1) + "</td><td>" + yuzdeMetin(v) + "</td></tr>"; }).join("");
    return '<details class="tablo-karsiligi"><summary>Grafiklerin tablo karşılığı</summary>' +
      '<table class="kucuk-tablo"><caption class="sr-only">Eğitim bazında Q3 özeti</caption><thead><tr><th>Eğitim</th><th>Kayıtlı</th><th>Tamamlayan</th><th>Tamamlama</th><th>Memnuniyet</th><th>Sınav ort.</th></tr></thead><tbody>' + satirlar + "</tbody></table>" +
      '<table class="kucuk-tablo"><caption class="sr-only">Seçili eğitimin haftalık tamamlama oranı</caption><thead><tr><th>Hafta</th><th>Tamamlama</th></tr></thead><tbody>' + hafta + "</tbody></table></details>";
  }

  function kpiHtml() {
    var h = hesapla(kullanici.e, kullanici.d);
    var memYazi = h.mem === null ? "—" : ondalik(h.mem, 1) + "/5";
    return '<div class="kpi"><span class="deger">' + h.kay + '</span><span class="etiket">Kayıtlı</span></div>' +
      '<div class="kpi"><span class="deger">' + h.tam + '</span><span class="etiket">Tamamlayan</span></div>' +
      '<div class="kpi"><span class="deger">' + yuzdeMetin(h.oran) + '</span><span class="etiket">Tamamlama</span></div>' +
      '<div class="kpi"><span class="deger">' + memYazi + '</span><span class="etiket">Memnuniyet' + (kullanici.e === "tum" && h.mem !== null ? " (basit ort.)" : "") + "</span></div>";
  }

  function grafikHtml() {
    var secEg = kullanici.e === "tum" ? "Tüm eğitimler" : bul(kullanici.e).ad;
    var sekme = METRIKLER.map(function (m) {
      return '<button type="button" data-m="' + m.id + '" aria-pressed="' + (kullanici.m === m.id ? "true" : "false") + '">' + m.ad + "</button>";
    }).join("");
    var not = kullanici.d !== "tum" ? '<p class="grafik-not" role="note">Memnuniyet ve sınav ortalaması yalnızca çeyrek düzeyinde toplandı; seçili dönemde gösterilemez.</p>' : "";
    return '<div class="grafik-kart"><h2>Haftalık tamamlama % (kaydolan kohortu)</h2><p class="alt-yazi">' + esc(secEg) + ". Seçili dönemdeki haftalar dolu noktalarla gösterilir.</p>" + cizgiGrafik(kullanici.e, kullanici.d) + "</div>" +
      '<div class="grafik-kart"><h2>Eğitimlere göre karşılaştırma</h2><div class="metrik-sekme" role="group" aria-label="Metrik">' + sekme + "</div>" + cubukGrafik(kullanici.e, kullanici.m) + "</div>" +
      not;
  }

  function gorevHtml() {
    var secilen = topla(durum.pe.map(function (x) { return x ? 1 : 0; }));
    function sat(tamam, metin) { return '<li class="' + (tamam ? "tamam" : "") + '"><span class="kutu">' + (tamam ? "Tamam ✓" : "Bekliyor") + "</span><span>" + metin + "</span></li>"; }
    return '<ul class="gorev">' + sat(hepsi(durum.pm), "Üç metrik sekmesini de aç (Tamamlama, Memnuniyet, Sınav) · " + topla(durum.pm) + "/3") +
      sat(secilen >= 3, "Eğitim filtresinde en az 3 farklı seçim yap (Tümü dahil) · " + Math.min(secilen, 3) + "/3") +
      sat(durum.pd === 1, "Dönem filtresini değiştir") + "</ul>";
  }

  /* ---------- Ekranlar ---------- */

  var EKRAN_FN = {};

  EKRAN_FN.problem = function () {
    var satirlar = EGITIMLER.map(function (e, i) {
      return "<tr><th class=\"satir-no\" scope=\"row\">" + (i + 2) + "</th><td>" + esc(e.ad) + "</td><td class=\"sayi\">" + e.k + "</td><td class=\"sayi\">" + e.t + "</td><td class=\"sayi\">?</td><td class=\"sayi\">" + ondalik(e.mem, 1) + "</td><td class=\"sayi\">" + e.sinav + "</td></tr>";
    }).join("");
    icerikEl.innerHTML =
      '<div class="mesaj"><span class="avatar" aria-hidden="true">ZA</span><div><span class="kim">Zeynep Arslan · Eğitim Direktörü</span>' +
      "<strong>Cuma sunumu için tek sayfalık özet lazım.</strong>" +
      "<p>Q3 eğitimleri nasıl gitti? Rakam ve öneri istiyorum; ham tabloyu sana bırakıyorum.</p></div></div>" +
      '<p class="soluk" style="margin:14px 0 6px">Elindeki ham veri:</p>' +
      '<div class="kaydirma"><table class="sayfa" aria-label="Ham eğitim verisi"><thead><tr><th class="kose"></th><th scope="col">Eğitim</th><th scope="col">Kayıtlı</th><th scope="col">Tamamlayan</th><th scope="col">Tamamlama %</th><th scope="col">Memnuniyet (5)</th><th scope="col">Sınav ort. (100)</th></tr></thead><tbody>' + satirlar + "</tbody></table></div>" +
      '<p style="margin-top:12px">Tamamlama oranı sütunu boş. Bu modülde onu hesaplayacak, panoda okuyacak ve yöneticiye anlatacağın bir özete dönüştüreceksin.</p>';
  };

  EKRAN_FN.hedef = function () {
    var h = [
      ["Tamamlama oranını hesapla", "Kayıtlı ve tamamlayan sayılarından oranı çıkarırsın."],
      ["Memnuniyet ve sınav sonuçlarını yorumla", "Rakamı kıyaslar, ağırlıklı ve basit ortalamayı ayırt edersin."],
      ["Veriden iyileştirme önerisi çıkar", "Bulguyu aksiyona ve 3 cümlelik yönetici özetine dönüştürürsün."]
    ].map(function (x, i) {
      return '<div class="hedef"><span class="no" aria-hidden="true">' + (i + 1) + "</span><div><strong>" + x[0] + "</strong>" + x[1] + "</div></div>";
    }).join("");
    icerikEl.innerHTML = '<div class="hedefler">' + h + "</div>" +
      '<div class="kart"><p><strong>Süre:</strong> yaklaşık 6–7 dakika. <strong>Puanlama:</strong> uygulama sayfaları geri bildirim içindir, puana girmez. Yalnızca sondaki 5 soruluk değerlendirme puanlanır (geçme %' + GECME_ESIGI + ").</p>" +
      '<p class="soluk">Veriler içsel olarak tutarlıdır. Excel görünümü temsili bir sunumdur.</p></div>';
  };

  function formulIndeks(sayfaSatiri) { return sayfaSatiri === 3 ? 0 : 1; }

  EKRAN_FN.formul = function () {
    var satirlar = EGITIMLER.map(function (e, i) {
      var sat = i + 2;
      var hedefMi = sat === 3 || sat === 6;
      var fi = hedefMi ? formulIndeks(sat) : -1;
      var dTd;
      if (hedefMi && durum.f[fi] === 0) {
        dTd = '<td class="giris sayi"><input class="hucre-giris" id="g' + fi + '" type="text" inputmode="decimal" autocomplete="off" data-hucre="D' + sat + '" aria-label="D' + sat + ": " + esc(e.ad) + ' tamamlama yüzdesi"></td>';
      } else {
        dTd = '<td class="sayi' + (hedefMi ? " dogru" : "") + '"><button type="button" class="hucre" data-hucre="D' + sat + '" data-fx="=C' + sat + "/B" + sat + '">' + yuzdeMetin(e.t * 100 / e.k) + (hedefMi ? " ✓" : "") + "</button></td>";
      }
      return '<tr><th class="satir-no" scope="row">' + sat + "</th>" +
        '<td><button type="button" class="hucre" data-hucre="A' + sat + '" data-fx="' + esc(e.ad) + '">' + esc(e.ad) + "</button></td>" +
        '<td class="sayi"><button type="button" class="hucre" data-hucre="B' + sat + '" data-fx="' + e.k + '">' + e.k + "</button></td>" +
        '<td class="sayi"><button type="button" class="hucre" data-hucre="C' + sat + '" data-fx="' + e.t + '">' + e.t + "</button></td>" +
        dTd +
        '<td class="sayi"><button type="button" class="hucre" data-hucre="E' + sat + '" data-fx="' + e.mem + '">' + ondalik(e.mem, 1) + "</button></td>" +
        '<td class="sayi"><button type="button" class="hucre" data-hucre="F' + sat + '" data-fx="' + e.sinav + '">' + e.sinav + "</button></td></tr>";
    }).join("");
    var gerekli = durum.f[0] === 0 || durum.f[1] === 0;
    icerikEl.innerHTML =
      '<p>Tamamlama oranı = <strong>tamamlayan ÷ kayıtlı</strong>. Sarı hücrelere oranı yaz (örn. 65, 65,0 ya da %65). Diğer hücrelere tıklayarak formül çubuğunu incele.</p>' +
      '<div class="formul-cubugu"><span class="ad-kutu" id="ad-kutu">A1</span><span class="fx" aria-hidden="true">fx</span><span class="fx-metin" id="fx-metin">Bir hücre seç</span></div>' +
      '<div class="kaydirma"><table class="sayfa" aria-label="Eğitim verisi, Excel görünümü"><thead><tr><th class="kose"></th>' +
      ["A", "B", "C", "D", "E", "F"].map(function (k) { return '<th scope="col">' + k + "</th>"; }).join("") + "</tr></thead><tbody>" +
      '<tr><th class="satir-no" scope="row">1</th><td class="baslik">Eğitim</td><td class="baslik">Kayıtlı</td><td class="baslik">Tamamlayan</td><td class="baslik">Tamamlama %</td><td class="baslik">Memnuniyet</td><td class="baslik">Sınav ort.</td></tr>' +
      satirlar +
      '<tr class="toplam"><th class="satir-no" scope="row">7</th><td>Toplam</td><td class="sayi">500</td><td class="sayi">395</td><td class="sayi">?</td><td class="sayi">—</td><td class="sayi">—</td></tr></tbody></table></div>' +
      '<p class="soluk" style="margin-top:6px">D7 (toplam oran) hücresini sonraki sayfada yorumlayacağız.</p>' +
      (gerekli ? '<div class="satir"><button type="button" class="dugme" id="kontrol">Kontrol et</button></div>' : "") +
      '<div id="formul-gb" tabindex="-1" role="status" aria-live="polite"></div>';
    $$(".hucre", icerikEl).forEach(function (b) { b.addEventListener("click", function () { hucreSec(b); }); });
    $$(".hucre-giris", icerikEl).forEach(function (g) {
      g.addEventListener("focus", function () {
        $("#ad-kutu").textContent = g.getAttribute("data-hucre");
        $("#fx-metin").textContent = "Formülü düşün: tamamlayan ÷ kayıtlı";
      });
    });
    var k = $("#kontrol");
    if (k) k.addEventListener("click", formulKontrol);
    if (!gerekli) $("#formul-gb").innerHTML = '<div class="geribildirim iyi">Her iki hücre de tamam. Excel’de bu hücrelerin formülü <strong>=C3/B3</strong> ve <strong>=C6/B6</strong> olurdu; sonuç hücre biçimiyle yüzde gösterilir.</div>';
  };

  function hucreSec(b) {
    $$(".hucre.secili", icerikEl).forEach(function (x) { x.classList.remove("secili"); });
    b.classList.add("secili");
    $("#ad-kutu").textContent = b.getAttribute("data-hucre");
    $("#fx-metin").textContent = b.getAttribute("data-fx");
  }

  function formulKontrol() {
    var mesajlar = [];
    [3, 6].forEach(function (sat) {
      var fi = formulIndeks(sat);
      if (durum.f[fi] !== 0) return;
      var e = EGITIMLER[sat - 2];
      var dogru = e.t * 100 / e.k;
      var g = $("#g" + fi);
      var n = sayiAyikla(g.value);
      durum.fa[fi] += 1;
      if (n !== null && Math.abs(n - dogru) <= 0.05) {
        durum.f[fi] = 1;
        mesajlar.push("✓ D" + sat + " doğru: " + e.t + " ÷ " + e.k + " = " + yuzdeMetin(dogru) + ".");
      } else if (durum.fa[fi] >= 3) {
        durum.f[fi] = 2;
        mesajlar.push("D" + sat + " için doğru değer " + yuzdeMetin(dogru) + " (" + e.t + " ÷ " + e.k + "). Gösterildi, devam edebilirsin.");
      } else if (durum.fa[fi] === 2) {
        mesajlar.push("✗ D" + sat + " için tekrar bak. İpucu: " + e.t + " ÷ " + e.k + " işlemini yap ve 100 ile çarp.");
      } else {
        mesajlar.push("✗ D" + sat + " için tekrar bak. Oran = tamamlayan ÷ kayıtlı (C ÷ B).");
      }
    });
    durumKaydet();
    var tum = durum.f[0] > 0 && durum.f[1] > 0;
    var girilen = {};
    [0, 1].forEach(function (fi) { var g = $("#g" + fi); if (g) girilen[fi] = g.value; });
    ciz();
    Object.keys(girilen).forEach(function (fi) { var g = $("#g" + fi); if (g) g.value = girilen[fi]; });
    var gb = $("#formul-gb");
    gb.innerHTML = '<div class="geribildirim ' + (tum ? "iyi" : "kotu") + '">' + mesajlar.map(esc).join("<br>") + "</div>";
    gb.focus();
  }

  EKRAN_FN.pano = function () {
    var egSec = '<option value="tum">Tüm eğitimler</option>' + EGITIMLER.map(function (e) { return '<option value="' + e.id + '">' + esc(e.ad) + "</option>"; }).join("");
    var dnSec = DONEMLER.map(function (d) { return '<option value="' + d.id + '">' + d.ad + "</option>"; }).join("");
    icerikEl.innerHTML =
      '<div class="filtreler"><div class="filtre"><label for="f-egitim">Eğitim</label><select id="f-egitim">' + egSec + "</select></div>" +
      '<div class="filtre"><label for="f-donem">Dönem</label><select id="f-donem">' + dnSec + "</select></div></div>" +
      '<div class="kpi-seridi" id="kpi" role="group" aria-label="Anahtar göstergeler" aria-live="polite">' + kpiHtml() + "</div>" +
      '<div class="grafikler" id="grafikler">' + grafikHtml() + "</div>" +
      tabloKarsiligi() +
      '<div class="kart" style="margin-top:14px"><h2>Keşif görevi</h2><div id="gorev">' + gorevHtml() + "</div></div>";
    $("#f-egitim").value = kullanici.e;
    $("#f-donem").value = kullanici.d;
    $("#f-egitim").addEventListener("change", function () {
      kullanici.e = this.value;
      var idx = this.value === "tum" ? 0 : 1 + EGITIMLER.indexOf(bul(this.value));
      durum.pe[idx] = 1;
      panoYenile();
    });
    $("#f-donem").addEventListener("change", function () {
      kullanici.d = this.value;
      durum.pd = 1;
      panoYenile();
    });
    baglaMetrik();
    // ilk gösterilen metrik görüldü sayılır
    metrikGoruldu(kullanici.m);
  };

  function baglaMetrik() {
    $$(".metrik-sekme button", icerikEl).forEach(function (b) {
      b.addEventListener("click", function () {
        kullanici.m = b.getAttribute("data-m");
        metrikGoruldu(kullanici.m);
        panoYenile();
        var yeni = $('.metrik-sekme button[data-m="' + kullanici.m + '"]');
        if (yeni) yeni.focus();
      });
    });
  }

  function metrikGoruldu(m) {
    var i = METRIKLER.map(function (x) { return x.id; }).indexOf(m);
    if (i >= 0 && !durum.pm[i]) { durum.pm[i] = 1; durumKaydet(); }
    var g = $("#gorev");
    if (g) g.innerHTML = gorevHtml();
    kromGuncelle();
  }

  function panoYenile() {
    $("#kpi").innerHTML = kpiHtml();
    $("#grafikler").innerHTML = grafikHtml();
    baglaMetrik();
    var td = $(".tablo-karsiligi");
    if (td) { var acik = td.open; td.outerHTML = tabloKarsiligi(); if (acik) $(".tablo-karsiligi").open = true; }
    $("#gorev").innerHTML = gorevHtml();
    durumKaydet();
    kromGuncelle();
  }

  function secenekHtml(i, metin, sinif, dm, kilitli) {
    return '<button type="button" class="secenek ' + (sinif || "") + '" data-i="' + i + '"' + (kilitli ? ' aria-disabled="true"' : "") + '><span class="harf" aria-hidden="true">' + harf(i) + '</span><span class="metin">' + esc(metin) + "</span>" + (dm ? '<span class="durum">' + dm + "</span>" : "") + "</button>";
  }

  EKRAN_FN.yorum = function () {
    icerikEl.innerHTML = YORUM.map(function (Q, q) {
      var cozuldu = durum.y[q] === 1;
      var secs = Q.c.map(function (c, i) {
        return secenekHtml(i, c, cozuldu && i === Q.d ? "dogru" : "", cozuldu && i === Q.d ? "Doğru ✓" : "", cozuldu);
      }).join("");
      return '<div class="kart" style="margin-bottom:12px" data-q="' + q + '"><p class="soru-basi">' + (q + 1) + ". " + esc(Q.s) + '</p><div class="secenekler">' + secs + '</div><div class="gb" role="status" aria-live="polite">' +
        (cozuldu ? '<div class="geribildirim iyi"><strong>Doğru.</strong> ' + esc(Q.a) + "</div>" : "") + "</div></div>";
    }).join("");
    $$(".kart[data-q]", icerikEl).forEach(function (kart) {
      var q = parseInt(kart.getAttribute("data-q"), 10);
      $$(".secenek", kart).forEach(function (b) {
        b.addEventListener("click", function () {
          if (durum.y[q] === 1) return;
          var i = parseInt(b.getAttribute("data-i"), 10);
          var gb = $(".gb", kart);
          if (i === YORUM[q].d) {
            durum.y[q] = 1;
            durumKaydet();
            ciz();
            var yeni = $('.kart[data-q="' + q + '"] .geribildirim');
            if (yeni) { yeni.setAttribute("tabindex", "-1"); yeni.focus(); }
          } else {
            b.classList.add("yanlis");
            var dm = $(".durum", b); if (!dm) { dm = document.createElement("span"); dm.className = "durum"; b.appendChild(dm); }
            dm.textContent = "Henüz değil ✗";
            gb.innerHTML = '<div class="geribildirim kotu"><strong>Henüz değil.</strong> Başka bir seçenek dene. İpucu: eğitimlerin kayıt sayılarının farklı olduğunu ve düşük değerlerin neyi kanıtlayıp neyi kanıtlamadığını düşün.</div>';
          }
          kromGuncelle();
        });
      });
    });
  };

  EKRAN_FN.aksiyon = function () {
    var cozuldu = durum.a === 1;
    var secs = AKSIYONLAR.map(function (a, i) {
      return secenekHtml(i, a.m, cozuldu && a.iyi ? "dogru" : "", cozuldu && a.iyi ? "En iyi ✓" : "", cozuldu);
    }).join("");
    var gb = "";
    if (cozuldu) {
      var iyi = AKSIYONLAR.filter(function (a) { return a.iyi; })[0];
      gb = '<div class="geribildirim iyi" id="aks-gb" tabindex="-1"><strong>Doğru seçim.</strong> ' + esc(iyi.a) + "</div>";
    }
    icerikEl.innerHTML = '<div class="kart"><p>Veri en çok nereyi işaret ediyor? Müdürün “önerin ne?” sorusuna yanıt olarak <strong>bir</strong> aksiyon seç. Veriyle örtüşmeyen seçeneklerde nedenini göreceksin.</p>' +
      '<div class="secenekler" role="group" aria-label="Aksiyon seçenekleri">' + secs + '</div><div id="aks-alan" role="status" aria-live="polite">' + gb + "</div></div>";
    $$(".secenek", icerikEl).forEach(function (b) {
      b.addEventListener("click", function () {
        if (durum.a === 1) return;
        var i = parseInt(b.getAttribute("data-i"), 10);
        if (AKSIYONLAR[i].iyi) {
          durum.a = 1;
          durumKaydet();
          ciz();
          $("#aks-gb").focus();
        } else {
          b.classList.add("yanlis");
          if (!$(".durum", b)) { var dm = document.createElement("span"); dm.className = "durum"; dm.textContent = "Veriyle örtüşmüyor ✗"; b.appendChild(dm); }
          $("#aks-alan").innerHTML = '<div class="geribildirim kotu"><strong>Veriyle örtüşmüyor.</strong> ' + esc(AKSIYONLAR[i].a) + " Başka bir seçenek dene.</div>";
        }
        kromGuncelle();
      });
    });
  };

  var OZET_PARCALAR = [
    "Q3’te toplam ", " kişi kaydoldu ve ", " kişi eğitimi tamamladı; toplam tamamlama oranı ", ". En düşük değerler ", " eğitiminde: tamamlama ", " ve memnuniyet ", "/5. Önerim: Müşteri İletişimi’nde ", "."
  ];

  EKRAN_FN.ozet = function () {
    var html = "";
    OZET_PARCALAR.forEach(function (p, i) {
      html += esc(p);
      if (i < OZET_BOSLUKLAR.length) {
        var B = OZET_BOSLUKLAR[i];
        var cozuldu = durum.o === 1;
        html += '<select data-b="' + i + '" aria-label="Boşluk ' + (i + 1) + '"' + (cozuldu ? " disabled" : "") + "><option value=\"-1\">Seç…</option>" +
          B.c.map(function (c, j) { return '<option value="' + j + '"' + (cozuldu && j === B.d ? " selected" : "") + ">" + esc(c) + "</option>"; }).join("") + '</select><span class="isaret" data-i="' + i + '"></span>';
      }
    });
    icerikEl.innerHTML = '<div class="kart"><p class="soluk">Müdüre gidecek 3 cümlelik özeti rakamlarla tamamla. Bir önceki sayfalardaki bulgulara dön.</p><p class="ozet-metin">' + html + '</p>' +
      (durum.o === 1 ? "" : '<div class="satir"><button type="button" class="dugme" id="ozet-kontrol">Kontrol et</button></div>') +
      '<div id="ozet-gb" tabindex="-1" role="status" aria-live="polite">' +
      (durum.o === 1 ? '<div class="geribildirim iyi"><strong>Özet hazır.</strong> İlk cümle sonucu rakamla, ikinci cümle en zayıf alanı, üçüncü cümle aksiyonu ve ölçütü verir. Müdür tek bakışta karar verebilir.</div>' : "") + "</div></div>";
    var k = $("#ozet-kontrol");
    if (k) k.addEventListener("click", ozetKontrol);
  };

  function ozetKontrol() {
    var selects = $$("select[data-b]", icerikEl);
    var tum = true, yanlisSayi = 0, bos = 0;
    selects.forEach(function (s) {
      var i = parseInt(s.getAttribute("data-b"), 10);
      var v = parseInt(s.value, 10);
      var isaret = $('.isaret[data-i="' + i + '"]');
      s.classList.remove("dogru", "yanlis");
      isaret.className = "isaret"; isaret.textContent = "";
      if (v < 0) { bos++; tum = false; return; }
      if (v === OZET_BOSLUKLAR[i].d) { s.classList.add("dogru"); isaret.className = "isaret dogru"; isaret.textContent = "✓"; }
      else { s.classList.add("yanlis"); isaret.className = "isaret yanlis"; isaret.textContent = "✗"; tum = false; yanlisSayi++; }
    });
    var gb = $("#ozet-gb");
    if (tum) {
      durum.o = 1; durumKaydet();
      ciz(); kromGuncelle();
      $("#ozet-gb").focus();
      return;
    }
    durum.oa += 1;
    durumKaydet();
    if (durum.oa >= 3) {
      durum.o = 1; durumKaydet();
      ciz(); kromGuncelle();
      $("#ozet-gb").innerHTML = '<div class="geribildirim"><strong>Doğru değerler gösterildi.</strong> Toplam kayıt 500, tamamlayan 395, oran %79,0; en zayıf eğitim Müşteri İletişimi (%65,0 ve 3,6/5).</div>';
      $("#ozet-gb").focus();
      return;
    }
    gb.innerHTML = '<div class="geribildirim kotu">' + (bos ? bos + " boşluk boş. " : "") + (yanlisSayi ? yanlisSayi + " boşluğu tekrar kontrol et (✗). " : "") +
      "İpucu: toplam değerler Formül sayfasındaki toplam satırından; en zayıf eğitim Pano’daki karşılaştırmadan okunur.</div>";
    gb.focus();
    kromGuncelle();
  }

  function soruEkrani(q) {
    var Q = SORULAR[q];
    var secili = durum.d[q];
    var cevaplandi = secili >= 0;
    var secs = Q.c.map(function (c, i) {
      var sinif = "", dm = "";
      if (cevaplandi) {
        if (i === Q.d) { sinif = "dogru"; dm = i === secili ? "Doğru ✓" : "Doğru cevap ✓"; }
        else if (i === secili) { sinif = "yanlis"; dm = "Henüz değil ✗"; }
      }
      return secenekHtml(i, c, sinif, dm, cevaplandi);
    }).join("");
    var alt = cevaplandi ? '<div class="geribildirim ' + (secili === Q.d ? "iyi" : "kotu") + '" id="gb" tabindex="-1" role="status"><strong>' + (secili === Q.d ? "Doğru." : "Henüz değil.") + "</strong> " + esc(Q.a) + '</div><div class="satir"><button type="button" class="dugme" id="sonraki-soru">' + (q === SORULAR.length - 1 ? "Sonucu gör" : "Sonraki soru") + "</button></div>" : "";
    icerikEl.innerHTML = '<div class="kart"><p class="soru-basi">Soru ' + (q + 1) + "/" + SORULAR.length + "</p><p>" + esc(Q.s) + '</p><div class="secenekler" role="group" aria-label="Yanıt seçenekleri">' + secs + "</div>" + alt + "</div>";
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

  function sonucKarti() {
    var h = puanHesapla();
    var gecti = h.puan >= GECME_ESIGI;
    icerikEl.innerHTML = '<div class="kart"><h2>Değerlendirme sonucu</h2><div class="skorlar">' +
      '<div class="skor ' + (gecti ? "iyi" : "kotu") + '"><span class="e">Bu deneme</span><span class="d">' + h.dogru + "/" + SORULAR.length + " (%" + h.puan + ")</span></div>" +
      '<div class="skor"><span class="e">En iyi puan</span><span class="d">%' + Math.max(0, durum.de) + "</span></div>" +
      '<div class="skor ' + (durum.dg ? "iyi" : "kotu") + '"><span class="e">Durum</span><span class="d">' + (durum.dg ? "Geçti ✓" : "Geçilmedi ✗") + "</span></div></div>" +
      '<p class="soluk">Geçme eşiği %' + GECME_ESIGI + " (en az 4/5). Deneme sayısı: " + durum.dd + ". SCORM 1.2’de tek durum alanı olduğu için LMS’e “passed” ya da “failed” gönderilir.</p>" +
      '<div class="satir"><button type="button" class="dugme ikincil" id="yeniden-test">Yeniden dene</button></div></div>' +
      '<div class="kart" style="margin-top:12px"><h2>Bu hafta kendi verinde dene</h2><ol style="margin:0;padding-left:20px"><li>Bir eğitiminin kayıtlı ve tamamlayan sayısını al.</li><li>Tamamlama oranını eğitim bazında ve toplam ÷ toplam olarak hesapla.</li><li>En zayıf alanı seç; bir neden hipotezi, bir aksiyon ve bir ölçüt yaz.</li></ol></div>';
    $("#yeniden-test").addEventListener("click", function () {
      durum.d = [-1, -1, -1, -1, -1];
      soruGoster = 0;
      durumKaydet();
      ciz();
      icerikEl.focus();
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
      var gerekli = ["formul", "pano", "yorum", "aksiyon", "ozet", "test"].indexOf(EKRANLAR[i]) >= 0;
      if (!gerekli || kapiTamam(i)) say++;
    }
    return Math.round(say * 100 / EKRANLAR.length);
  }

  function kromGuncelle() {
    sekmeEl.innerHTML = SEKME.map(function (r, i) {
      var aktif = i === durum.e, acik = erisilebilir(i);
      var tik = i < durum.max && kapiTamam(i) && !aktif;
      return '<li><button type="button" data-i="' + i + '"' + (aktif ? ' aria-current="page"' : "") + (acik ? "" : " disabled") +
        ' aria-label="' + (i + 1) + ". " + r.ad + (tik ? " (tamamlandı)" : "") + '">' + (i + 1) + ". " + r.ad + (tik ? '<span class="tik" aria-hidden="true">✓</span>' : "") + "</button></li>";
    }).join("");
    $$("button", sekmeEl).forEach(function (b) { b.addEventListener("click", function () { git(parseInt(b.getAttribute("data-i"), 10), true); }); });
    baslikEl.textContent = SEKME[durum.e].baslik;
    var mesaj = ileriIzni();
    geriEl.disabled = durum.e === 0;
    ileriEl.disabled = !!mesaj;
    ipucuEl.textContent = durum.e >= EKRANLAR.length - 1 ? "" : mesaj;
    yuzdeEl.textContent = "%" + ilerlemeYuzde() + " tamamlandı";
  }

  function ciz() {
    EKRAN_FN[EKRANLAR[durum.e]]();
    kromGuncelle();
  }

  function basla() {
    icerikEl = $("#icerik"); geriEl = $("#geri"); ileriEl = $("#ileri"); ipucuEl = $("#ipucu");
    sekmeEl = $("#sekmeler"); baslikEl = $("#ekran-baslik"); yuzdeEl = $("#yuzde");
    if (SCORM.baslat()) {
      var s = SCORM.al("cmi.core.lesson_status");
      if (s === "not attempted" || s === "") SCORM.ayarla("cmi.core.lesson_status", "incomplete");
      durumYukle();
    }
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
