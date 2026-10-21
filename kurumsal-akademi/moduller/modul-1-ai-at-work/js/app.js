/*
 * İş Başında Yapay Zekâ: modül mantığı ve arayüz.
 * LMS ile yalnızca Koprusu (js/scorm.js) üzerinden konuşur; Koprusu yoksa ya da LMS bulunamazsa
 * modül çevrimdışı çalışır.
 *
 * Bölümler: 1) yardımcılar  2) durum ve kalıcılık  3) hareket tercihi  4) sahne ve diyalog
 *           5) animasyon motoru ve eylemler  6) sahne arayüzleri  7) gezinme  8) başlatma
 */
(function () {
  "use strict";

  var IC = window.ICERIK;
  var SAHNELER = IC.SAHNELER, SORULAR = IC.SORULAR, CIKTILAR = IC.CIKTILAR;
  var K = window.Karakterler;
  var KOP = window.Koprusu;
  var ESIK = 80;
  var TOPLAM = SAHNELER.length;
  /* assets/audio/ içinde ses dosyası yok: ses denetimi bu yüzden gizli kalır. */
  var SES_VAR = false;
  var HARF = ["A", "B", "C", "D", "E"];

  /* ================= 1) Yardımcılar ================= */
  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; });
  }
  function kelimeSay(m) { return String(m).trim().split(/\s+/).filter(Boolean).length; }
  function liste(nodeList) { return Array.prototype.slice.call(nodeList); }

  var el = {
    kok: document.documentElement, sahne: $("sahne"), balonlar: $("balonlar"), transkript: $("transkript"),
    sahneAd: $("sahne-ad"), baslik: $("ekran-baslik"), hedef: $("hedef"), panel: $("panel"),
    akis: $("akis"), etkilesim: $("etkilesim"), geri: $("geribildirim"), ekstra: $("ekstra"),
    geriBtn: $("geri"), ileriBtn: $("ileri"), ipucu: $("ipucu"),
    sahneNo: $("sahne-no"), yuzde: $("yuzde"), cubuk: $("cubuk"), dolgu: $("cubuk-dolgu"), noktalar: $("noktalar"),
    yeniden: $("yeniden"), hareket: $("hareket"), atla: $("atla-anim"), ses: $("ses")
  };

  /* ================= 2) Durum ve kalıcılık ================= */
  /*
   * e: sahne, mx: ulaşılan en ileri sahne, c: sahne içi kararlar [s1,s3,s4,s5], b: bileşen maskesi (5 bit),
   * q: değerlendirme cevapları, r: bu denemenin kaydı yapıldı mı, n: deneme sayısı, p: son puan,
   * en: en iyi puan, g: başarı (kalıcı), t: tamamlama (Sahne 7'ye ulaştı)
   */
  var D;
  var C_INDEKS = { 0: 0, 2: 1, 3: 2, 4: 3 };

  function varsayilan() {
    return { e: 0, mx: 0, c: [-1, -1, -1, -1], b: 0, q: [-1, -1, -1, -1, -1], r: 0, n: 0, p: -1, en: -1, g: 0, t: 0 };
  }
  function sayiAl(v, min, max, yedek) {
    var n = Number(v);
    if (!isFinite(n)) return yedek;
    n = Math.floor(n);
    return n >= min && n <= max ? n : yedek;
  }
  function soruSecenekSayilari() {
    return [SAHNELER[0].soru.secenekler.length, SAHNELER[2].secenekler.length, SAHNELER[3].soru.secenekler.length, SAHNELER[4].soru.secenekler.length];
  }
  /* LMS'ten gelen veri güvenilmez kabul edilir: aralık, tür ve tutarlılık denetlenir. */
  function birlestir(veri, lms) {
    var d = varsayilan();
    veri = (veri && typeof veri === "object") ? veri : {};
    d.e = sayiAl(veri.e, 0, TOPLAM - 1, 0);
    d.mx = Math.max(d.e, sayiAl(veri.mx, 0, TOPLAM - 1, 0));
    var sayilar = soruSecenekSayilari();
    if (Array.isArray(veri.c)) for (var i = 0; i < 4; i++) d.c[i] = sayiAl(veri.c[i], -1, sayilar[i] - 1, -1);
    d.b = sayiAl(veri.b, 0, 31, 0);
    if (Array.isArray(veri.q)) for (var j = 0; j < 5; j++) d.q[j] = sayiAl(veri.q[j], -1, SORULAR[j].s.length - 1, -1);
    d.n = sayiAl(veri.n, 0, 999, 0);
    d.p = sayiAl(veri.p, -1, 100, -1);
    d.en = sayiAl(veri.en, -1, 100, -1);
    d.g = veri.g === 1 ? 1 : 0;
    d.t = veri.t === 1 ? 1 : 0;
    d.r = (veri.r === 1 && d.q.every(function (x) { return x >= 0; })) ? 1 : 0;
    if (d.en >= ESIK) d.g = 1;
    if (lms && lms.durum === "passed") {
      d.g = 1;
      if (d.en < 0 && lms.puan !== null) d.en = Math.round(lms.puan);
      if (d.n < 1) d.n = 1;
    }
    return d;
  }

  function tamamSahne(i) {
    switch (i) {
      case 1: return D.b === 31;
      case 5: return D.r === 1 || D.g === 1;
      case 6: return D.t === 1;
      default: return D.c[C_INDEKS[i]] >= 0;
    }
  }
  function izinliSahne() {
    var i = 0;
    while (i < TOPLAM - 1 && tamamSahne(i)) i++;
    return i;
  }
  function yuzdeHesapla() {
    var n = 0;
    for (var i = 0; i < TOPLAM; i++) if (tamamSahne(i)) n++;
    return Math.round(n / TOPLAM * 100);
  }

  var kapandi = false;
  function yuk(bitir) {
    return { konum: SAHNELER[D.e].id, veriMetin: JSON.stringify(D), deneme: D.n, enIyi: D.en, gecti: !!D.g };
  }
  function kaydet() { try { KOP.kaydet(yuk()); } catch (e) { /* LMS hatası modülü durdurmaz */ } }
  function oturumuKapat() {
    if (kapandi) return;
    kapandi = true;
    try { KOP.bitir(yuk()); } catch (e) { /* yoksay */ }
  }

  /* ================= 3) Hareket tercihi ================= */
  var az = false;
  function hareketAyarla(v) {
    az = !!v;
    el.kok.setAttribute("data-hareket", az ? "az" : "acik");
    el.hareket.setAttribute("aria-pressed", az ? "true" : "false");
  }

  /* ================= 4) Sahne ve diyalog ================= */
  var motor = { jeton: 0, zamanlar: [], oynuyor: false };
  function zamanla(fn, ms) { var id = setTimeout(fn, ms); motor.zamanlar.push(id); return id; }
  function iptalEt() {
    motor.jeton++;
    motor.zamanlar.forEach(clearTimeout);
    motor.zamanlar = [];
    motor.oynuyor = false;
  }

  function sahneCiz(s) {
    var m = s.mert || { ifade: "notr", poz: "dur" };
    el.sahne.innerHTML = K.sahne({ ton: s.ton, ikon: s.ikon, etiket: s.etiket, ece: s.ece, mert: m, mertGizli: !s.mert, asistan: s.asistan });
  }
  function karakterDurum(kim, o) { K.ayarla(el.sahne, kim, o); }
  function asistanDurum(d) { var a = el.sahne.querySelector(".asistan"); if (a) a.setAttribute("data-durum", d); }
  function mertGoster() { var m = el.sahne.querySelector(".kar-mert"); if (m) m.classList.remove("gizli"); }
  function konusAyarla(kim) {
    if (az) kim = "";
    ["ece", "mert"].forEach(function (k) { karakterDurum(k, { konus: k === kim ? "1" : "0" }); });
  }
  function beatDurum(b) {
    if (b.ece) karakterDurum("ece", b.ece);
    if (b.mert) { mertGoster(); karakterDurum("mert", b.mert); }
    if (b.asistan) asistanDurum(b.asistan);
  }

  function transkriptEkle(ad, metin) {
    var li = document.createElement("li");
    li.innerHTML = "<b>" + esc(ad) + ":</b> " + esc(metin);
    el.transkript.appendChild(li);
  }
  var AD = { ece: "Ece", mert: "Mert", asistan: "Asistan" };
  function balon(kim, metin, hizli) {
    liste(el.balonlar.children).forEach(function (b) { b.classList.add("eski"); b.classList.remove("yeni"); });
    var b = document.createElement("div");
    b.className = "balon " + kim + (hizli ? "" : " yeni");
    b.innerHTML = '<span class="ad">' + AD[kim] + "</span>" + esc(metin);
    el.balonlar.appendChild(b);
    el.balonlar.scrollTop = el.balonlar.scrollHeight;
    transkriptEkle(AD[kim], metin);
  }
  /* Beat zaman çizelgesi dışında (etkileşimden sonra) kısa konuşma */
  function konusAnlik(kim, metin, durum) {
    if (durum) { if (durum.ece) karakterDurum("ece", durum.ece); if (durum.mert) { mertGoster(); karakterDurum("mert", durum.mert); } }
    balon(kim, metin, az);
    konusAyarla(kim);
    zamanla(function () { konusAyarla(""); }, Math.min(2600, 700 + metin.length * 30));
  }

  /* ================= 5) Animasyon motoru ve eylemler ================= */
  function beatSure(b) {
    if (b.sure) return b.sure;
    if (b.eylem === "yazma") return b.prompt.length * 42 + 800;
    if (b.metin) return 1500 + b.metin.length * 28;
    return 1200;
  }

  function sohbet() {
    var s = $("sohbet");
    if (s) return s;
    el.akis.insertAdjacentHTML("beforeend",
      '<div class="sohbet bolum" role="group" aria-label="Yapay zekâ asistanı sohbet penceresi">' +
      '<div class="sohbet-ust">' + K.asistanSimge("bosta") + "<span>Yapay zekâ asistanı</span></div>" +
      '<div class="sohbet-icerik" id="sohbet"></div></div>');
    return $("sohbet");
  }
  function mesaj(tip, html) {
    var m = document.createElement("div");
    m.className = "msg " + tip;
    m.innerHTML = html;
    sohbet().appendChild(m);
    return m;
  }
  function daktilo(hedefEl, metin, hizli) {
    if (hizli) { hedefEl.textContent = metin; return; }
    hedefEl.innerHTML = '<span class="t"></span><span class="imlec" aria-hidden="true"></span>';
    var t = hedefEl.querySelector(".t"), i = 0;
    (function adim() {
      i++;
      t.textContent = metin.slice(0, i);
      if (i < metin.length) zamanla(adim, 40);
      else { var im = hedefEl.querySelector(".imlec"); if (im) im.remove(); }
    })();
  }

  /* Çıktı paragraflarını HTML'e çevirir; [YER TUTUCU] ve işaretli (u) parçalar özel sınıf alır. */
  function parcaHtml(p) {
    if (Array.isArray(p)) {
      return p.map(function (r) {
        return r.u ? '<span class="isaretli" data-u="' + r.u + '" data-t="' + esc(r.t) + '">' + esc(r.t) + "</span>" : esc(r.t);
      }).join("");
    }
    var h = esc(p.t).replace(/\[([^\]]+)\]/g, function (m, ic) { return '<span class="isaretli yer" data-yer="' + esc(ic) + '">[' + ic + "]</span>"; });
    return p.b ? '<span class="baslik-satir">' + h + "</span>" : h;
  }
  function ciktiHtml(paralar, ek) {
    return '<span class="kurgu-etiket">Örnek çıktı</span>' + paralar.map(function (p) { return "<p>" + parcaHtml(p) + "</p>"; }).join("") + (ek || "");
  }

  var EYLEM = {
    bildirim: function (b, h) {
      el.akis.insertAdjacentHTML("beforeend",
        '<div class="bildirim bolum" role="note"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="2.5" y="5" width="19" height="14" rx="3" fill="#ffc233"/><path d="M3.5 7l8.5 6 8.5-6" stroke="#7a5200" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        "<div><b>Yöneticiden yeni mesaj</b>" + esc(b.metin) + "</div></div>");
      transkriptEkle("Yönetici (mesaj)", b.metin);
    },
    yazma: function (b, h) {
      var m = mesaj("kullanici", "");
      daktilo(m, b.prompt, h);
      transkriptEkle("Ece (prompt)", b.prompt);
    },
    cikti: function (b) {
      mesaj("asistan", ciktiHtml(CIKTILAR[b.cikti]));
    },
    "cikti-s4": function (b, h) {
      var s = SAHNELER[3];
      var m = mesaj("kullanici", "");
      daktilo(m, s.istem, h);
      transkriptEkle("Ece (prompt)", s.istem);
      function cevap() { mesaj("asistan", ciktiHtml(s.cikti)); }
      if (h) cevap(); else zamanla(cevap, s.istem.length * 42 + 500);
    },
    isaretle: function () { s4Uygula("uyari"); },
    hassas: function () {
      var s = SAHNELER[4];
      var govde = s.taslak.map(function (r) {
        return r.h ? '<span class="hassas" data-h="' + r.h + '" data-t="' + esc(r.t) + '" data-y="' + esc(r.y) + '">' + esc(r.t) + "</span>" : esc(r.t);
      }).join("");
      el.akis.insertAdjacentHTML("beforeend",
        '<div class="prompt-kutusu bolum" id="taslak-kutu"><span class="etiket">Ece\'nin taslak prompt\'u</span><span id="taslak">' + govde + "</span></div>" +
        '<p class="hedef">Sarı işaretli parçalar kişisel ya da gizli veridir.</p>');
    },
    kur: function (b, h) {
      var s = SAHNELER[1];
      var spans = s.siralama.map(function (id) {
        var bl = s.bilesenler.filter(function (x) { return x.id === id; })[0];
        return '<span class="seg dolu c-' + id + '" data-id="' + id + '">' + esc(bl.seg) + "</span>";
      });
      el.akis.insertAdjacentHTML("beforeend",
        '<div class="prompt-kutusu bolum" id="kur-kutu"><span class="etiket">Ece\'nin yeni prompt\'u</span><span id="kur-segler"></span></div>');
      var kap = $("kur-segler");
      spans.forEach(function (sp, i) {
        if (h) kap.insertAdjacentHTML("beforeend", sp + " ");
        else zamanla(function () { kap.insertAdjacentHTML("beforeend", sp + " "); }, 300 + i * 520);
      });
    },
    "cikti-final": function () {
      mesaj("asistan", ciktiHtml(CIKTILAR.iyi));
    },
    dogrula: function (b, h) {
      var yerler = liste(el.akis.querySelectorAll(".isaretli.yer"));
      function isle(y) { y.classList.remove("yer"); y.classList.add("dogrulandi"); y.textContent = y.getAttribute("data-yer") + " ✓"; }
      yerler.forEach(function (y, i) { if (h) isle(y); else zamanla(function () { isle(y); }, 350 + i * 450); });
      el.akis.insertAdjacentHTML("beforeend",
        '<ul class="liste-kutusu"><li><b>✓</b> Tarih, saat ve kayıt bağlantısı kaynaktan kontrol edildi.</li><li><b>✓</b> Metinde kişisel ya da gizli veri yok.</li></ul>');
    },
    mesajlar: function (b, h) {
      var s = SAHNELER[6];
      el.akis.insertAdjacentHTML("beforeend", '<ol class="mesaj-kartlari bolum" id="mesajlar"></ol>');
      var ol = $("mesajlar");
      s.mesajlar.forEach(function (m, i) {
        function ekle() { ol.insertAdjacentHTML("beforeend", '<li class="mesaj-karti"><span class="no" aria-hidden="true">' + (i + 1) + "</span><span>" + esc(m) + "</span></li>"); }
        if (h) ekle(); else zamanla(ekle, 200 + i * 550);
      });
      function bant() { el.akis.insertAdjacentHTML("beforeend", kapanisBanti()); var d = $("degerlendirmeye-don"); if (d) d.addEventListener("click", function () { sahneyeGit(5, false); }); }
      if (h) bant(); else zamanla(bant, 200 + s.mesajlar.length * 550 + 300);
    }
  };

  function oynat(s, hizli) {
    iptalEt();
    el.balonlar.innerHTML = "";
    el.transkript.innerHTML = "";
    var j = motor.jeton, i = 0;
    motor.oynuyor = !hizli;
    oynuyorGoster();
    function bitti() {
      motor.oynuyor = false;
      konusAyarla("");
      el.etkilesim.hidden = false;
      oynuyorGoster();
      altGuncelle();
    }
    function adim() {
      if (j !== motor.jeton) return;
      if (i >= s.beats.length) { bitti(); return; }
      var b = s.beats[i++];
      beatDurum(b);
      if (b.eylem && EYLEM[b.eylem]) EYLEM[b.eylem](b, hizli);
      if (b.kim && b.metin) { balon(b.kim, b.metin, hizli); if (!hizli) konusAyarla(b.kim); } else if (!hizli) konusAyarla("");
      if (hizli) adim(); else zamanla(adim, beatSure(b));
    }
    adim();
  }
  function oynuyorGoster() {
    el.atla.hidden = !(motor.oynuyor && !az);
  }

  /* ================= 6) Sahne arayüzleri ================= */
  /* Ortak: seçenek sorusu. Seçim kaydedilir; başka seçenek de incelenebilir (sonuçları görmek için). */
  function secenekSorusu(kok, soru, cIdx, kanca) {
    var son = D.c[cIdx];
    kok.innerHTML = '<p class="soru-metni" id="soru-metni">' + esc(soru.metin) + "</p>" +
      '<ul class="secenekler" aria-labelledby="soru-metni">' + soru.secenekler.map(function (s, i) {
        return '<li><button type="button" class="secenek" data-i="' + i + '" aria-pressed="false"><span class="harf">' + (s.harf || HARF[i]) + '</span><span class="metin">' + esc(s.m) + '<span class="durum"></span></span></button></li>';
      }).join("") + "</ul>";
    var dugmeler = liste(kok.querySelectorAll(".secenek"));
    var denenen = {};
    function isaretle(i) {
      var dogru = i === soru.dogru;
      denenen[i] = true;
      dugmeler.forEach(function (d, k) {
        d.setAttribute("aria-pressed", k === i ? "true" : "false");
        d.classList.toggle("secildi", k === i);
        if (denenen[k]) {
          d.classList.remove("dogru", "yanlis");
          d.classList.add(k === soru.dogru ? "dogru" : "yanlis");
          d.querySelector(".durum").textContent = k === soru.dogru ? "✓ Doğru seçim" : "✗ Yeterli değil";
        }
      });
      var s = soru.secenekler[i];
      el.geri.innerHTML = '<div class="geri-bildirim ' + (dogru ? "dogru" : "yanlis") + '" role="status"><h3>' + (dogru ? "✓ Doğru seçim" : "✗ Henüz değil") + "</h3><p>" + esc(s.b) + "</p>" +
        (dogru ? "" : "<p><em>İstersen başka bir seçeneği de inceleyebilirsin.</em></p>") + "</div>" +
        (soru.sonuc ? '<div class="ipucu-kutu">' + esc(soru.sonuc) + "</div>" : "");
    }
    function sec(i, sessiz) {
      var ilk = D.c[cIdx] < 0;
      D.c[cIdx] = i;
      isaretle(i);
      if (kanca) kanca(i, sessiz, ilk);
      kaydet();
      altGuncelle();
      ilerlemeGuncelle();
    }
    dugmeler.forEach(function (d) {
      d.addEventListener("click", function () { sec(parseInt(d.getAttribute("data-i"), 10), false); });
    });
    if (son >= 0) { sec(son, true); }
  }

  /* ---- Sahne 1 ---- */
  function hazirS1(s) {
    secenekSorusu(el.etkilesim, s.soru, 0, function (i) { karakterDurum("ece", s.soru.secenekler[i].ece); });
  }

  /* ---- Sahne 2 ---- */
  function hazirS2(s) {
    var spans = s.siralama.map(function (id) {
      var bl = s.bilesenler.filter(function (x) { return x.id === id; })[0];
      return '<span class="seg bos c-' + id + '" data-id="' + id + '">[ ' + esc(bl.ad) + " ]</span>";
    }).join(" ");
    el.akis.innerHTML = '<div class="prompt-kutusu" role="group" aria-label="Örnek prompt: seçtiğin bileşenler burada oluşur"><span class="etiket">Örnek prompt: bileşenler seçtikçe oluşur</span><span id="seg-kap">' + spans + "</span></div>";
    el.etkilesim.innerHTML = '<p class="soru-metni">Bir bileşen seç ve prompt\'ta nasıl göründüğüne bak:</p>' +
      '<ul class="bilesenler" id="bilesenler">' + s.bilesenler.map(function (b, i) {
        return '<li><button type="button" class="bilesen" data-i="' + i + '" aria-pressed="false"><span class="no">' + b.no + "</span><span>" + esc(b.ad) + '</span><span class="ok" aria-hidden="true"></span></button></li>';
      }).join("") + '</ul><div id="bilesen-aciklama" aria-live="polite"></div><p class="hedef" id="bilesen-sayac" style="margin-top:10px"></p>';
    var dugmeler = liste(el.etkilesim.querySelectorAll(".bilesen"));

    function segDoldur(id, vurgu) {
      var bl = s.bilesenler.filter(function (x) { return x.id === id; })[0];
      var sp = el.akis.querySelector('.seg[data-id="' + id + '"]');
      if (!sp) return;
      if (sp.classList.contains("bos")) {
        sp.classList.remove("bos"); sp.classList.add("dolu"); sp.textContent = bl.seg;
      }
    }
    function durumGoster() {
      dugmeler.forEach(function (d, i) {
        var gor = (D.b >> i) & 1;
        d.classList.toggle("gorulen", !!gor);
        d.querySelector(".ok").textContent = gor ? "✓" : "";
      });
      var n = 0; for (var i = 0; i < 5; i++) n += (D.b >> i) & 1;
      $("bilesen-sayac").textContent = n < 5 ? "İncelenen bileşen: " + n + " / 5" : "";
    }
    function vurgula(id) {
      liste(el.akis.querySelectorAll(".seg")).forEach(function (x) { x.classList.toggle("vurgu", x.getAttribute("data-id") === id); });
    }
    function bitisGoster(sessiz) {
      el.geri.innerHTML = '<div class="geri-bildirim dogru" role="status"><h3>✓ Beş bileşeni de keşfettin</h3><p>Rol/bağlam, görev, hedef kitle, çıktı biçimi ve kısıtlar birlikte, asistanın tahmin etmesini azaltır.</p></div>';
      if (!sessiz) konusAnlik("ece", s.bitis.ece, { ece: { ifade: "mutlu", poz: "yaz" }, mert: { ifade: "mutlu", poz: "dur" } });
    }
    dugmeler.forEach(function (d, i) {
      d.addEventListener("click", function () {
        var b = s.bilesenler[i];
        var oncekiMaske = D.b;
        D.b = D.b | (1 << i);
        dugmeler.forEach(function (x) { x.setAttribute("aria-pressed", x === d ? "true" : "false"); });
        segDoldur(b.id); vurgula(b.id); durumGoster();
        $("bilesen-aciklama").innerHTML = '<div class="bilesen-aciklama"><b>' + esc(b.ad) + ":</b> " + esc(b.mert) + "</div>";
        if (D.b === 31 && oncekiMaske !== 31) bitisGoster(false);
        else if (D.b !== 31) { el.geri.innerHTML = ""; konusAnlik("mert", b.mert, { mert: { ifade: "gulumse", poz: "anlat" } }); zamanla(function () { karakterDurum("mert", { poz: "dur" }); }, 2400); }
        kaydet(); altGuncelle(); ilerlemeGuncelle();
      });
    });
    s.bilesenler.forEach(function (b, i) { if ((D.b >> i) & 1) segDoldur(b.id); });
    durumGoster();
    if (D.b === 31) bitisGoster(true);
  }

  /* ---- Sahne 3 ---- */
  function ciktiKarsilastir(secili) {
    var iyi = CIKTILAR.iyi, genel = CIKTILAR.genel;
    var kelimeA = kelimeSay(genel.map(function (p) { return p.t; }).join(" "));
    var kelimeB = kelimeSay(iyi.map(function (p) { return p.t; }).join(" "));
    var s = SAHNELER[2];
    var tablo = '<table class="mini-tablo"><caption>Bileşen kontrol listesi</caption><thead><tr><th scope="col">Bileşen</th><th scope="col">A</th><th scope="col">B</th></tr></thead><tbody>' +
      s.kontrol.map(function (k) { return "<tr><th scope=\"row\">" + esc(k.ad) + "</th><td class=\"" + (k.a ? "e" : "h") + "\">" + (k.a ? "✓ var" : "✗ yok") + "</td><td class=\"" + (k.b ? "e" : "h") + "\">" + (k.b ? "✓ var" : "✗ yok") + "</td></tr>"; }).join("") + "</tbody></table>";
    el.ekstra.innerHTML = '<div class="bolum"><p class="soru-metni">Aynı görev, iki prompt, iki sonuç:</p><div class="cikti-ikili">' +
      '<div class="cikti zayif' + (secili === 0 ? " secili" : "") + '"><h4>Prompt A\'nın çıktısı' + (secili === 0 ? '<span class="secili-rozet">Seçtiğin</span>' : "") + "</h4>" + ciktiHtml(genel, '<p class="meta">' + kelimeA + " kelime · genel ve kullanılamaz</p>") + "</div>" +
      '<div class="cikti iyi' + (secili === 1 ? " secili" : "") + '"><h4>Prompt B\'nin çıktısı' + (secili === 1 ? '<span class="secili-rozet">Seçtiğin</span>' : "") + "</h4>" + ciktiHtml(iyi, '<p class="meta">' + kelimeB + " kelime (sınır: 90) · yer tutucular var, tarih uydurulmadı</p>") + "</div></div>" + tablo + "</div>";
  }
  function hazirS3(s) {
    var soru = { metin: s.gorev, dogru: s.dogru, secenekler: s.secenekler };
    secenekSorusu(el.etkilesim, soru, 1, function (i, sessiz) {
      var o = s.secenekler[i];
      karakterDurum("ece", o.ece);
      ciktiKarsilastir(i);
      if (!sessiz) konusAnlik("mert", o.mert, { mert: { ifade: i === s.dogru ? "gulumse" : "dusunceli", poz: "anlat" } });
    });
  }

  /* ---- Sahne 4 ---- */
  function s4Uygula(mod, sessiz) {
    var s = SAHNELER[3];
    liste(el.akis.querySelectorAll("[data-u]")).forEach(function (sp) {
      var n = sp.getAttribute("data-u");
      sp.className = "isaretli";
      sp.textContent = sp.getAttribute("data-t");
      if (mod === "uyari") sp.classList.add("uyari");
      else if (mod === "duzelt") { sp.classList.add("yer"); sp.textContent = s.uydurma[n]; }
    });
  }
  function hazirS4(s) {
    secenekSorusu(el.etkilesim, s.soru, 2, function (i) {
      var o = s.soru.secenekler[i];
      karakterDurum("ece", o.ece);
      var dogru = i === s.soru.dogru;
      s4Uygula(dogru ? "duzelt" : "uyari");
      asistanDurum(dogru ? "bosta" : "uyari");
      el.ekstra.innerHTML = '<div class="sonuc-kutu"><b>Olası sonuç:</b> ' + esc(o.sonuc) + "</div>" +
        (dogru ? '<ul class="liste-kutusu">' + s.dogrulama.map(function (d) { return "<li><b>" + esc(d.ad) + ":</b> kaynak → " + esc(d.kaynak) + "</li>"; }).join("") + "</ul>" : "");
    });
  }

  /* ---- Sahne 5 ---- */
  function hassasUygula(temizle, hizli) {
    liste(el.akis.querySelectorAll(".hassas")).forEach(function (sp) {
      sp.className = "hassas";
      sp.textContent = sp.getAttribute("data-t");
      var n = parseInt(sp.getAttribute("data-h"), 10);
      if (temizle.indexOf(n) < 0) return;
      function bitir() { sp.classList.remove("karartildi"); sp.classList.add("yer-tutucu"); sp.textContent = sp.getAttribute("data-y"); }
      if (hizli || az) bitir();
      else { sp.classList.add("karartildi"); zamanla(bitir, 800); }
    });
  }
  function hazirS5(s) {
    secenekSorusu(el.etkilesim, s.soru, 3, function (i, sessiz) {
      var o = s.soru.secenekler[i];
      karakterDurum("ece", o.ece);
      hassasUygula(o.temizle, sessiz);
      asistanDurum(i === s.soru.dogru ? "bosta" : "uyari");
      el.ekstra.innerHTML = '<div class="sonuc-kutu"><b>Olası sonuç:</b> ' + esc(o.sonuc) + "</div>";
    });
  }

  /* ---- Sahne 6: değerlendirme ---- */
  var qGor = 0;
  function ilkCevapsiz() {
    for (var i = 0; i < 5; i++) if (D.q[i] < 0) return i;
    return 5;
  }
  function denemeKaydet() {
    var dogru = 0;
    for (var i = 0; i < 5; i++) if (D.q[i] === SORULAR[i].dogru) dogru++;
    var puan = dogru * 20;
    D.n += 1; D.p = puan;
    if (puan > D.en) D.en = puan;
    if (puan >= ESIK) D.g = 1;
    D.r = 1;
  }
  function soruGoster(k) {
    qGor = k;
    var q = SORULAR[k];
    var cevap = D.q[k];
    var noktalar = SORULAR.map(function (x, i) {
      var c = D.q[i];
      var sinif = c < 0 ? (i === k ? "simdi" : "") : (c === x.dogru ? "dogru" : "yanlis");
      return '<li class="' + sinif + '"></li>';
    }).join("");
    el.etkilesim.innerHTML = '<ol class="soru-nokta" aria-hidden="true">' + noktalar + "</ol>" +
      '<div class="soru-bilgi"><span>Soru ' + (k + 1) + " / 5</span><span>Hedef " + q.h + "</span></div>" +
      '<p class="soru-metni" id="soru-metni" style="margin-top:4px">' + esc(q.metin) + "</p>" +
      '<ul class="secenekler" aria-labelledby="soru-metni">' + q.s.map(function (m, i) {
        return '<li><button type="button" class="secenek" data-i="' + i + '" aria-disabled="false"><span class="harf">' + HARF[i] + '</span><span class="metin">' + esc(m) + '<span class="durum"></span></span></button></li>';
      }).join("") + "</ul>";
    el.geri.innerHTML = ""; el.ekstra.innerHTML = "";
    var dugmeler = liste(el.etkilesim.querySelectorAll(".secenek"));
    function cevapGoster(i) {
      var dogru = i === q.dogru;
      dugmeler.forEach(function (d, idx) {
        d.setAttribute("aria-disabled", "true");
        if (idx === i) { d.classList.add(dogru ? "dogru" : "yanlis"); d.querySelector(".durum").textContent = dogru ? "✓ Doğru" : "✗ Henüz değil"; }
        else if (idx === q.dogru) { d.classList.add("dogru"); d.querySelector(".durum").textContent = "✓ Doğru cevap"; }
        else d.classList.add("soluk");
      });
      var son = k === 4;
      el.geri.innerHTML = '<div class="geri-bildirim ' + (dogru ? "dogru" : "yanlis") + '" role="status"><h3>' + (dogru ? "✓ Doğru" : "✗ Henüz değil") + "</h3><p>" + esc(q.acik) + "</p></div>" +
        '<div class="eylem-satiri"><button type="button" class="dugme" id="sonraki-soru">' + (son ? "Sonucu gör" : "Sonraki soru") + "</button></div>";
      $("sonraki-soru").addEventListener("click", function () { if (son) sonucGoster(); else soruGoster(k + 1); });
    }
    dugmeler.forEach(function (d) {
      d.addEventListener("click", function () {
        if (D.q[k] >= 0) return;
        var i = parseInt(d.getAttribute("data-i"), 10);
        D.q[k] = i;
        if (D.q.every(function (x) { return x >= 0; })) denemeKaydet();
        karakterDurum("ece", { ifade: i === q.dogru ? "mutlu" : "dusunceli", poz: "yaz" });
        cevapGoster(i);
        el.etkilesim.querySelector(".soru-nokta").outerHTML = '<ol class="soru-nokta" aria-hidden="true">' + SORULAR.map(function (x, n) { var c = D.q[n]; return '<li class="' + (c < 0 ? (n === k ? "simdi" : "") : (c === x.dogru ? "dogru" : "yanlis")) + '"></li>'; }).join("") + "</ol>";
        kaydet(); altGuncelle(); ilerlemeGuncelle();
      });
    });
    if (cevap >= 0) cevapGoster(cevap);
  }
  function sonucGoster() {
    var puan = D.p >= 0 ? D.p : 0;
    var gecti = puan >= ESIK;
    var yanlislar = [];
    for (var i = 0; i < 5; i++) if (D.q[i] !== SORULAR[i].dogru) yanlislar.push(i);
    el.geri.innerHTML = ""; el.ekstra.innerHTML = "";
    var basariMetni = D.g ? "Başarıldı" : "Henüz başarılmadı";
    el.etkilesim.innerHTML = '<div class="sonuc-kart"><div class="halka-puan" style="--p:' + puan + ";--halka-renk:" + (gecti ? "#0f7d3f" : "#b3261e") + '" role="img" aria-label="Bu denemedeki puan: yüzde ' + puan + '"><div>%' + puan + "</div></div>" +
      '<h3 class="sonuc-baslik ' + (gecti ? "gecti" : "kaldi") + '" id="sonuc-baslik">' + (gecti ? "Tebrikler, eşiği geçtin!" : "Eşiğe çok yaklaştın, yeniden dene") + "</h3>" +
      '<p class="hedef" style="margin:4px 0 0">Geçme eşiği: %' + ESIK + " (en az 4 / 5 doğru)</p></div>" +
      '<dl class="durum-satirlari"><div><dt>Bu denemedeki puan</dt><dd>%' + puan + "</dd></div><div><dt>En iyi puan</dt><dd>%" + Math.max(D.en, 0) + "</dd></div><div><dt>Deneme sayısı</dt><dd>" + D.n + "</dd></div><div><dt>Başarı durumu</dt><dd>" + basariMetni + "</dd></div></dl>" +
      (yanlislar.length ? '<h3 style="margin:14px 0 4px;font-size:1rem">Daha iyi ne yapılabilirdi?</h3><ul class="inceleme">' + yanlislar.map(function (n) {
        var q = SORULAR[n];
        return "<li><b>Soru " + (n + 1) + ": " + esc(q.metin) + '</b><span class="sen">Cevabın: ' + esc(q.s[D.q[n]]) + '</span><br><span class="dogru-c">Doğru cevap: ' + esc(q.s[q.dogru]) + "</span><br>" + esc(q.acik) + "</li>";
      }).join("") + "</ul>" : '<p class="ipucu-kutu">Tüm soruları doğru yanıtladın.</p>') +
      '<div class="eylem-satiri"><button type="button" class="dugme ikincil" id="yeniden-dene">Değerlendirmeyi yeniden dene</button></div>';
    karakterDurum("ece", { ifade: gecti ? "mutlu" : "dusunceli", poz: "yaz" });
    $("yeniden-dene").addEventListener("click", function () {
      D.q = [-1, -1, -1, -1, -1]; D.r = 0;
      kaydet();
      soruGoster(0);
      altGuncelle(); ilerlemeGuncelle();
    });
    altGuncelle(); ilerlemeGuncelle();
  }
  function hazirS6() {
    var k = ilkCevapsiz();
    if (D.r === 1) sonucGoster(); else soruGoster(Math.min(k, 4));
  }

  /* ---- Sahne 7 ---- */
  function kapanisBanti() {
    var gecti = !!D.g;
    var lms = KOP.bagliMi()
      ? "LMS’ye bildirilen durum: " + (gecti ? "başarılı (passed)" : "henüz geçilmedi (failed)") + " · En iyi puan: %" + Math.max(D.en, 0)
      : "Bu oturum bir LMS’ye bağlı değil; ilerleme kaydedilmiyor (çevrimdışı mod).";
    return '<div class="tamam-bant ' + (gecti ? "" : "uyari") + '" id="tamam-bant"><h3>' + (gecti ? "Modülü tamamladın ve başardın!" : "Modülü tamamladın, ama geçme eşiğini henüz yakalayamadın") + "</h3>" +
      "<p>" + (gecti ? "Daha iyi prompt yazmayı, çıktıyı doğrulamayı ve verileri korumayı gösterdin. Bu hafta kendi işinde bir görevi bu üç adımla dene." : "Tamamlama ve başarı ayrı izlenir. Başarı için değerlendirmeyi yeniden deneyebilirsin.") + "</p>" +
      '<p style="font-size:.85rem;color:#4b5878;font-weight:600">' + esc(lms) + "</p>" +
      (gecti ? "" : '<div class="eylem-satiri" style="justify-content:flex-start"><button type="button" class="dugme" id="degerlendirmeye-don">Değerlendirmeye dön</button></div>') + "</div>";
  }
  function hazirS7() { /* içerik beat eylemleriyle oluşur */ }

  var HAZIR = [hazirS1, hazirS2, hazirS3, hazirS4, hazirS5, hazirS6, hazirS7];

  /* ================= 7) Gezinme ================= */
  function engelMesaji(i) {
    switch (i) {
      case 0: return "Devam etmek için bir seçenek seç.";
      case 1:
        var n = 0; for (var k = 0; k < 5; k++) n += (D.b >> k) & 1;
        return "Devam etmek için beş bileşeni de incele (" + n + " / 5).";
      case 2: return "Devam etmek için bir prompt seç.";
      case 3: return "Devam etmek için bir adım seç.";
      case 4: return "Devam etmek için güvenli yaklaşımı seç.";
      case 5: return "Devam etmek için değerlendirmeyi bitir.";
      default: return "";
    }
  }
  function altGuncelle() {
    var i = D.e;
    var engelli = i < TOPLAM - 1 && !tamamSahne(i);
    var son = i === TOPLAM - 1;
    el.geriBtn.setAttribute("aria-disabled", i === 0 ? "true" : "false");
    el.ileriBtn.setAttribute("aria-disabled", engelli || son ? "true" : "false");
    var m;
    if (motor.oynuyor && engelli) m = "Sahne oynuyor. Beklemek istemezsen “Animasyonu atla”.";
    else if (engelli) m = engelMesaji(i);
    else if (son) m = D.g ? "Modülü tamamladın. Pencereyi kapatabilirsin." : "Modül tamamlandı. Başarı için değerlendirmeyi yeniden deneyebilirsin.";
    else m = "Hazırsan sonraki sahneye geç.";
    el.ipucu.textContent = m;
  }
  function ilerlemeGuncelle() {
    var i = D.e;
    el.sahneNo.textContent = "Sahne " + (i + 1) + " / " + TOPLAM + " · " + SAHNELER[i].ad;
    var y = yuzdeHesapla();
    el.yuzde.textContent = "%" + y + " tamamlandı";
    el.dolgu.style.width = y + "%";
    el.cubuk.setAttribute("aria-valuenow", String(y));
    el.cubuk.setAttribute("aria-valuetext", "Sahne " + (i + 1) + " / " + TOPLAM + ", yüzde " + y + " tamamlandı");
    el.noktalar.innerHTML = SAHNELER.map(function (s, n) {
      return '<li class="' + (n === i ? "simdi" : (tamamSahne(n) ? "bitti" : "")) + '"></li>';
    }).join("");
  }

  function sahneyeGit(i, canlandir) {
    i = Math.max(0, Math.min(TOPLAM - 1, i));
    var s = SAHNELER[i];
    var hizli = az || (!canlandir && tamamSahne(i));
    iptalEt();
    D.e = i; D.mx = Math.max(D.mx, i);
    if (i === TOPLAM - 1 && (D.r === 1 || D.g === 1)) D.t = 1;
    el.baslik.textContent = s.ad;
    el.hedef.textContent = s.hedef;
    el.sahneAd.textContent = "Sahne " + (i + 1) + ": " + s.ad;
    sahneCiz(s);
    el.balonlar.innerHTML = ""; el.transkript.innerHTML = "";
    el.akis.innerHTML = ""; el.geri.innerHTML = ""; el.ekstra.innerHTML = "";
    el.etkilesim.innerHTML = ""; el.etkilesim.hidden = true;
    HAZIR[i](s);
    ilerlemeGuncelle();
    kaydet();
    oynat(s, hizli);
    altGuncelle();
    try { window.scrollTo(0, 0); } catch (e) { /* jsdom */ }
  }

  function ileri() {
    if (el.ileriBtn.getAttribute("aria-disabled") === "true") return;
    sahneyeGit(D.e + 1, false);
    try { el.panel.focus({ preventScroll: true }); } catch (e) { /* yoksay */ }
  }
  function geri() {
    if (el.geriBtn.getAttribute("aria-disabled") === "true") return;
    sahneyeGit(D.e - 1, false);
    try { el.panel.focus({ preventScroll: true }); } catch (e) { /* yoksay */ }
  }

  /* ================= 8) Başlatma ================= */
  function olaylar() {
    el.ileriBtn.addEventListener("click", ileri);
    el.geriBtn.addEventListener("click", geri);
    el.yeniden.addEventListener("click", function () { sahneyeGit(D.e, true); });
    el.atla.addEventListener("click", function () { sahneyeGit(D.e, false); var s = SAHNELER[D.e]; oynat(s, true); });
    el.hareket.addEventListener("click", function () {
      hareketAyarla(!az);
      if (az && motor.oynuyor) oynat(SAHNELER[D.e], true);
      else if (az) { konusAyarla(""); }
      oynuyorGoster();
    });
    el.ses.addEventListener("click", function () { /* ses dosyası yok; düğme gizli */ });
    document.addEventListener("keydown", function (e) {
      if (!e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key === "ArrowRight") { e.preventDefault(); ileri(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); geri(); }
    });
    window.addEventListener("beforeunload", oturumuKapat);
    window.addEventListener("pagehide", oturumuKapat);
    window.addEventListener("unload", oturumuKapat);
  }

  function baslat() {
    var lms = { bagli: false, konum: "", veri: null, durum: "", puan: null };
    try { lms = KOP.baslat(); } catch (e) { /* LMS yoksa çevrimdışı */ }
    D = birlestir(lms.veri, lms);
    if (!lms.veri && lms.konum) {
      for (var i = 0; i < TOPLAM; i++) if (SAHNELER[i].id === lms.konum) D.e = i;
    }
    var izin = izinliSahne();
    D.e = Math.min(D.e, izin);
    D.mx = Math.min(Math.max(D.mx, D.e), izin);

    var tercih = false;
    try { tercih = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); } catch (e) { tercih = false; }
    hareketAyarla(tercih);
    el.ses.hidden = !SES_VAR;
    olaylar();
    sahneyeGit(D.e, false);
  }

  baslat();
})();
