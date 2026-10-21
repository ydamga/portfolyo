/*
 * Modül 3 işlevsellik, veri tutarlılığı ve SCORM 1.2 davranış testleri (jsdom + sahte LMS).
 * Çalıştırma:  JSDOM_YOLU=/yol/node_modules/jsdom node test/test-modul3.js
 * Bu testler gerçek bir LMS ya da gerçek bir tarayıcı testinin yerine geçmez.
 */
"use strict";

var path = require("path");
var fs = require("fs");
var JSDOM = require(process.env.JSDOM_YOLU || "jsdom");
var mock = require("./mock-lms.js");
var KOK = path.join(__dirname, "..", "moduller", "modul-3-kpi-analizi");

var gecen = 0, kalan = 0;
function ok(k, m) { if (k) { gecen++; console.log("  ok   " + m); } else { kalan++; console.log("  HATA " + m); } }
function bekle(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

async function ac(lms) {
  var hatalar = [];
  var vc = new JSDOM.VirtualConsole();
  vc.on("jsdomError", function (e) { hatalar.push(String(e && e.message || e)); });
  var dom = await JSDOM.JSDOM.fromFile(path.join(KOK, "index.html"), {
    runScripts: "dangerously", resources: "usable", pretendToBeVisual: true, virtualConsole: vc,
    beforeParse: function (w) { if (lms) w.API = lms.API; w.scrollTo = function () {}; }
  });
  var w = dom.window;
  for (var i = 0; i < 60 && !w.document.querySelector("#icerik .mesaj, #icerik .kart"); i++) await bekle(20);
  return { w: w, hatalar: hatalar };
}
function q(w, s) { return w.document.querySelector(s); }
function qa(w, s) { return Array.prototype.slice.call(w.document.querySelectorAll(s)); }
function baslik(w) { return q(w, "#ekran-baslik").textContent; }
function metin(w) { return q(w, "#icerik").textContent.replace(/\s+/g, " "); }
function ileri(w) {
  var b = q(w, "#ileri");
  if (b.disabled) throw new Error("İleri kapalı: " + q(w, "#ipucu").textContent);
  b.click();
}
function ayril(w) { ["beforeunload", "unload", "pagehide"].forEach(function (a) { w.dispatchEvent(new w.Event(a)); }); }
function sec(w, id, deger) { var s = q(w, id); s.value = deger; s.dispatchEvent(new w.Event("change", { bubbles: true })); }

function formulCoz(w) {
  q(w, "#g0").value = "65"; q(w, "#g1").value = "%75";
  q(w, "#kontrol").click();
}
function panoCoz(w) {
  sec(w, "#f-egitim", "musteri"); sec(w, "#f-egitim", "kvkk"); sec(w, "#f-egitim", "tum");
  sec(w, "#f-donem", "agu");
  ["mem", "sinav"].forEach(function (m) { q(w, '.metrik-sekme button[data-m="' + m + '"]').click(); });
}
function yorumCoz(w) { [1, 2, 1].forEach(function (c, q2) { qa(w, '.kart[data-q="' + q2 + '"] .secenek')[c].click(); }); }
function ozetCoz(w) { qa(w, "select[data-b]").forEach(function (s) { s.value = "0"; }); q(w, "#ozet-kontrol").click(); }
function degerlendir(w, c) { for (var i = 0; i < 5; i++) { qa(w, "#icerik .secenek")[c[i]].click(); q(w, "#sonraki-soru").click(); } }
var DOGRU = [1, 2, 0, 1, 2];

async function ilerleTesteKadar(w) {
  ileri(w); ileri(w);
  formulCoz(w); ileri(w);
  panoCoz(w); ileri(w);
  yorumCoz(w); ileri(w);
  qa(w, "#icerik .secenek")[2].click(); ileri(w);
  ozetCoz(w); ileri(w);
}
function sonSet(lms, alan) { var s = null; lms.durum.setLog.forEach(function (x) { if (x[0] === alan) s = x[1]; }); return s; }

async function t1() {
  console.log("T1 Başlatma");
  var lms = mock.olustur(); var r = await ac(lms), w = r.w;
  ok(lms.veri["cmi.core.lesson_status"] === "incomplete", "durum incomplete");
  ok(baslik(w) === "Q3 eğitimleri nasıl gitti?", "ilk ekran başlığı");
  ok(qa(w, "#sekmeler button").length === 8 && qa(w, "#sekmeler button:not([disabled])").length === 1, "8 sayfa sekmesi, yalnızca ilki açık");
  ok(!/Kurgusal demo/.test(w.document.body.textContent), "kurgu şeridi yok");
  ok(lms.durum.hatalar.length === 0 && r.hatalar.length === 0, "SCORM ve JS hatası yok");
  ayril(w);
}

async function t2_formul() {
  console.log("T2 Formül sayfası");
  var lms = mock.olustur(); var r = await ac(lms), w = r.w;
  ileri(w); ileri(w);
  ok(baslik(w) === "Tamamlama oranını hesapla", "formül sayfası");
  ok(q(w, "#ileri").disabled, "hücreler dolmadan ileri kapalı");
  q(w, "#g0").value = "52"; q(w, "#g1").value = "abc"; q(w, "#kontrol").click();
  ok(/✗ D3 için tekrar bak/.test(metin(w)) && /✗ D6 için tekrar bak/.test(metin(w)), "iki yanlışta ✗ geri bildirimi");
  ok(q(w, "#g0").value === "52" && q(w, "#g1").value === "abc", "yanlış girişler yeniden çizimde korunur");
  q(w, "#g0").value = "0,65"; q(w, "#kontrol").click();
  ok(/✓ D3 doğru/.test(metin(w)) && !q(w, "#g0"), "0,65 → %65,0 kabul edilir");
  ok(/İpucu/.test(metin(w)) || /D6/.test(metin(w)), "ikinci yanlışta ipucu");
  q(w, "#g1").value = "7"; q(w, "#kontrol").click();
  ok(!q(w, "#ileri").disabled, "3. yanlışta doğru değer gösterilir ve devam açılır");
  ok(/%75,0/.test(metin(w)), "gösterilen doğru değer %75,0");
  qa(w, ".hucre").filter(function (b) { return b.getAttribute("data-hucre") === "D2"; })[0].click();
  ok(q(w, "#fx-metin").textContent === "=C2/B2" && q(w, "#ad-kutu").textContent === "D2", "hücre seçilince formül çubuğu =C2/B2");
  ayril(w);
}

async function t3_pano_veri() {
  console.log("T3 Pano ve veri tutarlılığı");
  var lms = mock.olustur(); var r = await ac(lms), w = r.w;
  ileri(w); ileri(w); formulCoz(w); ileri(w);
  function kpi() { return qa(w, "#kpi .kpi .deger").map(function (x) { return x.textContent; }); }
  ok(JSON.stringify(kpi()) === JSON.stringify(["500", "395", "%79,0", "4,1/5"]), "tümü: 500, 395, %79,0, 4,1/5 (" + kpi().join(" | ") + ")");
  var beklenen = { ofis: [120, 108, "%90,0", "4,4/5"], musteri: [80, 52, "%65,0", "3,6/5"], excel: [60, 51, "%85,0", "4,5/5"], yonetici: [40, 34, "%85,0", "4,1/5"], kvkk: [200, 150, "%75,0", "3,9/5"] };
  Object.keys(beklenen).forEach(function (id) {
    sec(w, "#f-egitim", id);
    var b = beklenen[id], k = kpi();
    ok(k[0] === String(b[0]) && k[1] === String(b[1]) && k[2] === b[2] && k[3] === b[3], id + ": " + k.join(" | "));
    // aylık toplamlar çeyreğe eşit olmalı
    var kay = 0, tam = 0;
    ["tem", "agu", "eyl"].forEach(function (d) { sec(w, "#f-donem", d); var kk = kpi(); kay += parseInt(kk[0], 10); tam += parseInt(kk[1], 10); ok(kk[3] === "—", id + " " + d + ": memnuniyet çeyrek dışında gösterilmez"); });
    sec(w, "#f-donem", "tum");
    ok(kay === b[0] && tam === b[1], id + ": aylık toplamlar çeyreğe eşit (" + kay + "/" + tam + ")");
  });
  sec(w, "#f-egitim", "tum");
  ok(!!q(w, "#grafikler svg[role=img]") && qa(w, "#grafikler svg").length === 2, "iki grafik SVG olarak çizilir");
  ok(/Haftalık tamamlama oranı çizgi grafiği/.test(q(w, "#grafikler svg").getAttribute("aria-label")), "çizgi grafiği erişilebilir etiket taşır");
  ok(qa(w, "details.tablo-karsiligi table").length === 2, "grafiklerin tablo karşılığı var");
  ok(qa(w, "#grafikler svg")[1].querySelectorAll("rect").length === 5, "çubuk grafikte 5 çubuk");
  sec(w, "#f-donem", "agu");
  ok(/yalnızca çeyrek düzeyinde/.test(metin(w)), "dönem seçilince memnuniyet açıklaması");
  ok(q(w, "#ileri").disabled, "keşif görevi bitmeden ileri kapalı");
  ayril(w);
}

async function t4_tamAkis() {
  console.log("T4 Tam doğru akış");
  var lms = mock.olustur(); var r = await ac(lms), w = r.w;
  ileri(w); ileri(w); formulCoz(w); ileri(w);
  panoCoz(w);
  ok(!q(w, "#ileri").disabled && /Tamam/.test(q(w, "#gorev").textContent), "keşif görevi tamamlanınca ileri açık");
  ileri(w);
  ok(baslik(w) === "Rakamı yorumla", "yorum sayfası");
  qa(w, '.kart[data-q="0"] .secenek')[0].click();
  ok(/Henüz değil/.test(q(w, '.kart[data-q="0"]').textContent) && q(w, "#ileri").disabled, "yanlış yanıt: tekrar dene");
  yorumCoz(w);
  ok(!q(w, "#ileri").disabled, "üç doğru yanıt sonrası ileri açık");
  ileri(w);
  qa(w, "#icerik .secenek")[0].click();
  ok(/Veriyle örtüşmüyor/.test(metin(w)) && q(w, "#ileri").disabled, "yanlış aksiyon: gerekçeyle reddedilir");
  qa(w, "#icerik .secenek")[2].click();
  ok(/Doğru seçim/.test(metin(w)) && !q(w, "#ileri").disabled, "doğru aksiyon kabul edilir");
  ileri(w);
  ok(baslik(w) === "Yönetici özeti", "özet sayfası");
  var s0 = qa(w, "select[data-b]"); s0[0].value = "1"; q(w, "#ozet-kontrol").click();
  ok(/✗/.test(metin(w)), "yanlış boşlukta ✗ işareti (renk dışında metin)");
  ozetCoz(w);
  ok(/Özet hazır/.test(metin(w)) && !q(w, "#ileri").disabled, "özet tamamlanır");
  ileri(w);
  ok(q(w, "#ileri").disabled, "test bitmeden ileri kapalı");
  degerlendir(w, DOGRU);
  ok(/5\/5 \(%100\)/.test(metin(w)), "5/5 sonuç kartı");
  ok(lms.veri["cmi.core.lesson_status"] === "passed" && lms.veri["cmi.core.score.raw"] === "100", "passed ve 100");
  ok(lms.veri["cmi.core.score.min"] === "0" && lms.veri["cmi.core.score.max"] === "100", "min/max");
  ok(/kendi verinde dene/.test(metin(w)), "kapanışta transfer önerisi");
  ok(/%100 tamamlandı/.test(q(w, "#yuzde").textContent), "ilerleme %100");
  ayril(w);
  ok(lms.veri["cmi.core.exit"] === "" && lms.durum.finishSayisi === 1, "exit boş, LMSFinish bir kez");
  ok(lms.veri["cmi.suspend_data"].length < 500, "suspend_data küçük (" + lms.veri["cmi.suspend_data"].length + ")");
  ok(lms.durum.hatalar.length === 0 && r.hatalar.length === 0, "SCORM ve JS hatası yok");
}

async function t5_ozetGosterim() {
  console.log("T5 Özet: 3 yanlış denemeden sonra değerler gösterilir");
  var lms = mock.olustur(); var r = await ac(lms), w = r.w;
  ileri(w); ileri(w); formulCoz(w); ileri(w); panoCoz(w); ileri(w); yorumCoz(w); ileri(w); qa(w, "#icerik .secenek")[2].click(); ileri(w);
  for (var i = 0; i < 3; i++) { qa(w, "select[data-b]").forEach(function (s) { s.value = "2"; }); q(w, "#ozet-kontrol").click(); }
  ok(!q(w, "#ileri").disabled && /Doğru değerler gösterildi/.test(metin(w)), "3. yanlışta doğru değerler gösterilir, devam açılır");
  ayril(w);
}

async function t6_basarisizYeniden() {
  console.log("T6 Başarısız, yeniden deneme, kalıcı geçti");
  var lms = mock.olustur(); var r = await ac(lms), w = r.w;
  await ilerleTesteKadar(w);
  degerlendir(w, [0, 0, 0, 1, 2]); // Q4, Q5 doğru, Q3 doğru (0) → 3/5
  ok(lms.veri["cmi.core.lesson_status"] === "failed" && lms.veri["cmi.core.score.raw"] === "60", "3/5 → failed / 60");
  q(w, "#yeniden-test").click();
  degerlendir(w, [1, 2, 0, 1, 0]); // 4/5
  ok(lms.veri["cmi.core.lesson_status"] === "passed" && lms.veri["cmi.core.score.raw"] === "80", "4/5 → passed / 80");
  q(w, "#yeniden-test").click();
  degerlendir(w, [0, 0, 1, 0, 0]);
  ok(lms.veri["cmi.core.lesson_status"] === "passed" && lms.veri["cmi.core.score.raw"] === "80", "düşük deneme: passed ve en iyi puan korunur");
  ok(/Deneme sayısı: 3/.test(metin(w)), "3 deneme");
  ayril(w);
  ok(lms.veri["cmi.core.exit"] === "", "geçti: exit boş");
  ok(lms.durum.hatalar.length === 0, "SCORM hata kodu yok");
}

async function t7_devam() {
  console.log("T7 Devam");
  var lms = mock.olustur(); var r = await ac(lms), w = r.w;
  ileri(w); ileri(w); formulCoz(w); ileri(w); panoCoz(w);
  ayril(w);
  ok(lms.veri["cmi.core.exit"] === "suspend" && lms.veri["cmi.core.lesson_location"] === "pano", "yarım: exit suspend, location pano");
  var lms2 = mock.olustur({ "cmi.core.lesson_status": "incomplete", "cmi.core.lesson_location": "pano", "cmi.core.entry": "resume", "cmi.suspend_data": lms.veri["cmi.suspend_data"] });
  var r2 = await ac(lms2);
  ok(baslik(r2.w) === "KPI Panosu", "kaldığı sayfa");
  ok(!q(r2.w, "#ileri").disabled, "keşif görevi ilerlemesi korunmuş");
  ok(qa(r2.w, "#sekmeler button:not([disabled])").length === 4, "önceki sayfalar açık");
  ayril(r2.w);
  var r3 = await ac(mock.olustur({ "cmi.suspend_data": "{bozuk" }));
  ok(baslik(r3.w) === "Q3 eğitimleri nasıl gitti?" && r3.hatalar.length === 0, "bozuk suspend_data: temiz başlangıç");
  ayril(r3.w);
  var r4 = await ac(mock.olustur({ "cmi.suspend_data": JSON.stringify({ e: 50, max: 50, d: [9, 9, 9, 9, 9], de: 500 }) }));
  ok(r4.hatalar.length === 0, "aralık dışı değerlerde çökme yok");
  ayril(r4.w);
}

async function t8_cevrimdisi() {
  console.log("T8 LMS yok");
  var r = await ac(null), w = r.w;
  await ilerleTesteKadar(w);
  degerlendir(w, DOGRU);
  ok(/Geçti/.test(metin(w)) && r.hatalar.length === 0, "LMS olmadan akış tamamlanır");
  ayril(w);
}

async function t9_icerik() {
  console.log("T9 İçerik ve paket");
  var js = fs.readFileSync(path.join(KOK, "js", "modul3.js"), "utf8");
  var man = fs.readFileSync(path.join(KOK, "imsmanifest.xml"), "utf8");
  var css = fs.readFileSync(path.join(KOK, "css", "modul3.css"), "utf8");
  ok(/GECME_ESIGI = 80/.test(js) && /masteryscore>80</.test(man), "eşik 80 / masteryscore 80");
  ok(/schemaversion>1\.2</.test(man), "SCORM 1.2");
  ok(!/https?:\/\//.test(js), "JS içinde dış adres yok");
  ok(!/@import|url\(http/.test(css) && /prefers-reduced-motion/.test(css), "CSS dış kaynak yok, azaltılmış hareket var");
  ok(108 / 120 === 0.9 && 52 / 80 === 0.65 && 51 / 60 === 0.85 && 34 / 40 === 0.85 && 150 / 200 === 0.75 && 395 / 500 === 0.79, "özet veri seti oranları (108/120, 52/80, 51/60, 34/40, 150/200, 395/500)");
  ok(Math.abs((90 + 65 + 85 + 85 + 75) / 5 - 80) < 1e-9, "basit ortalama 80,0 ≠ ağırlıklı 79,0 (öğretici nokta)");
  ok(Math.abs((4.4 + 3.6 + 4.5 + 4.1 + 3.9) / 5 - 4.1) < 1e-9, "memnuniyet basit ortalaması 4,1");
}

(async function () {
  var t = [t1, t2_formul, t3_pano_veri, t4_tamAkis, t5_ozetGosterim, t6_basarisizYeniden, t7_devam, t8_cevrimdisi, t9_icerik];
  for (var i = 0; i < t.length; i++) { try { await t[i](); } catch (e) { kalan++; console.log("  HATA test çöktü: " + (e && e.stack || e)); } }
  console.log("\nSonuç: " + gecen + " geçti, " + kalan + " kaldı");
  process.exit(kalan ? 1 : 0);
})();
