/*
 * Modül 2 işlevsellik ve SCORM 1.2 davranış testleri (jsdom + sahte LMS).
 * Çalıştırma:  JSDOM_YOLU=/yol/node_modules/jsdom node test/test-modul2.js
 * Bu testler gerçek bir LMS ya da gerçek bir tarayıcı testinin yerine geçmez.
 */
"use strict";

var path = require("path");
var fs = require("fs");
var JSDOM = require(process.env.JSDOM_YOLU || "jsdom");
var VirtualConsole = JSDOM.VirtualConsole;
var JSDOMClass = JSDOM.JSDOM;
var mock = require("./mock-lms.js");

var KOK = path.join(__dirname, "..", "moduller", "modul-2-zor-gorusme");
var DOGRU = [1, 2, 0, 2, 1]; // değerlendirme doğru şıkları
var IYI = [1, 2, 0];         // görüşmedeki en güçlü seçimler

var gecen = 0, kalan = 0;
function ok(kosul, mesaj) {
  if (kosul) { gecen++; console.log("  ok   " + mesaj); }
  else { kalan++; console.log("  HATA " + mesaj); }
}
function bekle(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

async function ac(lms) {
  var jsHatalari = [];
  var vc = new VirtualConsole();
  vc.on("jsdomError", function (e) { jsHatalari.push(String(e && e.message || e)); });
  var dom = await JSDOMClass.fromFile(path.join(KOK, "index.html"), {
    runScripts: "dangerously",
    resources: "usable",
    pretendToBeVisual: true,
    virtualConsole: vc,
    beforeParse: function (w) {
      if (lms) w.API = lms.API;
      w.scrollTo = function () {};
    }
  });
  var w = dom.window;
  for (var i = 0; i < 60 && !w.document.querySelector("#sahne .balon"); i++) await bekle(20);
  return { w: w, jsHatalari: jsHatalari };
}

function q(w, s) { return w.document.querySelector(s); }
function qa(w, s) { return Array.prototype.slice.call(w.document.querySelectorAll(s)); }
function baslik(w) { return q(w, "#ekran-baslik").textContent; }
function sahneMetni(w) { return q(w, "#sahne").textContent.replace(/\s+/g, " "); }
function ileri(w) {
  var b = q(w, "#ileri");
  if (b.disabled) throw new Error("İleri devre dışı: " + q(w, "#ipucu").textContent);
  b.click();
}
function ayril(w) {
  ["beforeunload", "unload", "pagehide"].forEach(function (a) { w.dispatchEvent(new w.Event(a)); });
}
function yuzde(w) { return parseInt(q(w, "#halka-y").textContent, 10); }
function beceriSayisi(w) { return qa(w, "#beceriler li.acik").length; }

function modeleGec(w) { ileri(w); qa(w, "#sahne .secim").forEach(function (b) { b.click(); }); }
function turSec(w, i) { qa(w, "#sahne .secim")[i].click(); }
function gorusmeyiOyna(w, secimler) {
  modeleGec(w);
  ileri(w); // gor1
  for (var t = 0; t < 3; t++) {
    turSec(w, secimler[t]);
    ileri(w);
  }
  // özet ekranındayız
}
function degerlendir(w, cevaplar) {
  for (var i = 0; i < 5; i++) {
    qa(w, "#sahne .secim")[cevaplar[i]].click();
    q(w, "#sonraki-soru").click();
  }
}

function sonSet(lms, alan) {
  var son = null;
  lms.durum.setLog.forEach(function (x) { if (x[0] === alan) son = x[1]; });
  return son;
}

async function t1_baslatma() {
  console.log("T1 Başlatma, ad, SVG");
  var lms = mock.olustur();
  var r = await ac(lms), w = r.w;
  ok(lms.durum.basladi, "LMSInitialize çağrıldı");
  ok(lms.veri["cmi.core.lesson_status"] === "incomplete", "durum incomplete");
  ok(q(w, "#kullanici-ad").textContent === "Kullanıcı", "ad “Soyad, Ad” biçiminden ayrıştırıldı");
  ok(q(w, "#kullanici-harf").textContent === "K", "avatar harfi K");
  ok(/Merhaba Kullanıcı/.test(sahneMetni(w)), "karşılama adı içeriyor");
  ok(baslik(w) === "Hoş geldin", "ilk ekran başlığı");
  ok(qa(w, "#ray button").length === 8, "kenar çubuğunda 8 adım");
  ok(qa(w, "#ray button:not([disabled])").length === 1, "yalnızca ilk adım açık");
  ok(r.jsHatalari.length === 0, "JS hatası yok " + r.jsHatalari.join("|"));
  ok(lms.durum.hatalar.length === 0, "SCORM hata kodu yok " + lms.durum.hatalar.join("|"));
  var idler = qa(w, "[id]").map(function (e) { return e.id; });
  ok(idler.length === new Set(idler).size, "sayfadaki id'ler benzersiz (SVG gradyanları dahil)");
  ok(qa(w, "#sahne svg[role=img]").length === 1, "yalnızca büyük karakter ekran okuyucuya açık");
  ok(q(w, "#sahne .mini svg").getAttribute("aria-hidden") === "true", "küçük avatar dekoratif");
  ayril(w);
}

async function t1b_adlar() {
  console.log("T1b Ad ayrıştırma");
  var durumlar = [["Damga, Yasin", "Yasin", "Y"], ["Ayşe Yılmaz", "Ayşe Yılmaz", "A"], ["", "Katılımcı", "K"], ["Aksoy,", "Aksoy", "A"], ["Demir, İpek", "İpek", "İ"]];
  for (var i = 0; i < durumlar.length; i++) {
    var lms = mock.olustur({ "cmi.core.student_name": durumlar[i][0] });
    var r = await ac(lms);
    ok(q(r.w, "#kullanici-ad").textContent === durumlar[i][1] && q(r.w, "#kullanici-harf").textContent === durumlar[i][2],
      "“" + durumlar[i][0] + "” -> " + durumlar[i][1] + " / " + durumlar[i][2]);
    ayril(r.w);
  }
}

async function t2_gating() {
  console.log("T2 Kapılar ve gezinme");
  var lms = mock.olustur();
  var r = await ac(lms), w = r.w;
  ileri(w);
  ok(baslik(w).indexOf("SBI") === 0, "ikinci ekran: model");
  ok(q(w, "#ileri").disabled, "model: kartlar açılmadan ileri kapalı");
  qa(w, "#sahne .secim")[0].click();
  qa(w, "#sahne .secim")[1].click();
  ok(q(w, "#ileri").disabled, "model: iki kart yetmez");
  ok(/Davranış/.test(q(w, "#sbi-detay").textContent), "açılan kartın açıklaması görünür");
  qa(w, "#sahne .secim")[2].click();
  ok(!q(w, "#ileri").disabled, "model: üç kart sonrası ileri açık");
  ok(/Görüldü/.test(qa(w, "#sahne .secim")[0].textContent), "görülen kart işaretlendi (metinle)");
  ileri(w);
  ok(baslik(w).indexOf("Görüşme 1/3") === 0, "görüşme 1");
  ok(q(w, "#ileri").disabled, "görüşme: yanıt seçilmeden ileri kapalı");
  ok(q(w, "#ipucu").textContent.length > 0, "ipucu metni gösteriliyor");
  ok(qa(w, "#ray button:not([disabled])").length === 3, "kenar çubuğu: ileri adımlar kilitli");
  turSec(w, 1);
  ok(!q(w, "#ileri").disabled, "yanıttan sonra ileri açık");
  ok(qa(w, "#sahne .secim[aria-disabled=true]").length === 3, "yanıtlanan seçenekler kilitli");
  turSec(w, 0);
  ok(durumSecimi(w) === 1, "ikinci tıklama seçimi değiştirmez");
  qa(w, "#ray button")[0].click();
  ok(baslik(w) === "Hoş geldin", "kenar çubuğuyla geri gidilebiliyor");
  ok(qa(w, "#ray button:not([disabled])").length === 3, "ileri gidince erişim korunuyor");
  ayril(w);
}

function durumSecimi(w) {
  var b = qa(w, "#sahne .secim").filter(function (x) { return /Seçimin/.test(x.textContent); })[0];
  return b ? parseInt(b.getAttribute("data-i"), 10) : -1;
}

async function t3_tamDogru() {
  console.log("T3 Tam doğru akış");
  var lms = mock.olustur();
  var r = await ac(lms), w = r.w;
  modeleGec(w); ileri(w);
  turSec(w, 1);
  ok(/Güven \+12/.test(q(w, "#gb").textContent) && /Netlik \+15/.test(q(w, "#gb").textContent), "tur 1 değişim chip'leri (artı)");
  ok(q(w, "#mg-d").textContent === "62/100" && q(w, "#mn-d").textContent === "45/100", "göstergeler 62 / 45");
  ok(beceriSayisi(w) === 1, "1 beceri kazanıldı");
  ileri(w);
  ok(/Tamam, dinliyorum/.test(sahneMetni(w)), "tur 2 açılışı: güven yüksek -> açık Elif");
  turSec(w, 2);
  ok(q(w, "#mg-d").textContent === "72/100" && q(w, "#mn-d").textContent === "65/100", "göstergeler 72 / 65");
  ileri(w);
  ok(/Lojistik/.test(sahneMetni(w)) && /sorumluluk bende/.test(sahneMetni(w)), "tur 3 açılışı: kök neden anlatılıyor");
  turSec(w, 0);
  ok(q(w, "#mg-d").textContent === "82/100" && q(w, "#mn-d").textContent === "80/100", "göstergeler 82 / 80");
  ok(beceriSayisi(w) === 3, "3 beceri kazanıldı");
  ileri(w);
  ok(/Ortak plan/.test(sahneMetni(w)), "özet: Ortak plan");
  ok(/3\/3/.test(sahneMetni(w)), "özet: 3/3 güçlü seçim");
  ileri(w);
  ok(baslik(w).indexOf("Değerlendirme") === 0, "değerlendirme ekranı");
  ok(q(w, "#ileri").disabled, "değerlendirme: bitmeden ileri kapalı");
  degerlendir(w, DOGRU);
  ok(/Doğru|Geçti/.test(sahneMetni(w)) && /5\/5 \(%100\)/.test(sahneMetni(w)), "5/5 sonuç kartı");
  ok(lms.veri["cmi.core.lesson_status"] === "passed", "LMS durumu passed");
  ok(lms.veri["cmi.core.score.raw"] === "100" && lms.veri["cmi.core.score.min"] === "0" && lms.veri["cmi.core.score.max"] === "100", "puan 100 (0–100)");
  ok(beceriSayisi(w) === 4, "4. beceri kazanıldı");
  ileri(w);
  ok(baslik(w).indexOf("Uygulama") === 0 && /Geçti/.test(sahneMetni(w)), "sonuç ekranı: geçti");
  ok(q(w, "#ileri").disabled, "son ekranda ileri kapalı");
  ok(yuzde(w) === 100, "ilerleme %100");
  ok(r.jsHatalari.length === 0, "JS hatası yok " + r.jsHatalari.join("|"));
  ayril(w);
  ok(lms.veri["cmi.core.exit"] === "", "geçti: exit boş");
  ok(lms.durum.finishSayisi === 1, "LMSFinish bir kez");
  ok(/^\d{4}:\d{2}:\d{2}/.test(lms.veri["cmi.core.session_time"]), "session_time biçimi");
  ok(lms.veri["cmi.suspend_data"].length < 400, "suspend_data küçük (" + lms.veri["cmi.suspend_data"].length + ")");
  ok(lms.durum.hatalar.length === 0, "SCORM hata kodu yok " + lms.durum.hatalar.join("|"));
}

async function t4_kaldiYenidenGecer() {
  console.log("T4 Başarısız, yeniden deneme, kalıcı geçti");
  var lms = mock.olustur();
  var r = await ac(lms), w = r.w;
  gorusmeyiOyna(w, IYI); ileri(w);
  degerlendir(w, [0, 0, 0, 2, 1]); // Q3, Q4, Q5 doğru: 3/5 = %60
  ok(lms.veri["cmi.core.lesson_status"] === "failed", "60 puan: failed");
  ok(lms.veri["cmi.core.score.raw"] === "60", "ham puan 60");
  ok(/Geçilmedi/.test(sahneMetni(w)), "sonuç kartı: Geçilmedi (metin)");
  ok(/Doğrulanmış|Henüz kazanılmadı/.test(q(w, "#beceriler").textContent) && beceriSayisi(w) === 3, "4. beceri kazanılmadı");
  ileri(w);
  ok(/Geçilmedi/.test(sahneMetni(w)) && !!q(w, "#teste-don"), "sonuç ekranı: geçilmedi + geri dön düğmesi");
  q(w, "#teste-don").click();
  ok(baslik(w).indexOf("Değerlendirme") === 0, "değerlendirmeye dönüldü");
  ok(q(w, "#ileri") !== null, "ekran açık");
  q(w, "#yeniden-test").click();
  ok(/Soru 1\/5/.test(sahneMetni(w)), "yeniden deneme 1. sorudan başlar");
  degerlendir(w, [1, 2, 0, 2, 0]); // 4/5 = 80
  ok(lms.veri["cmi.core.lesson_status"] === "passed" && lms.veri["cmi.core.score.raw"] === "80", "80 puan: passed (eşik dahil)");
  q(w, "#yeniden-test").click();
  degerlendir(w, [0, 0, 0, 0, 0]); // 0
  ok(lms.veri["cmi.core.lesson_status"] === "passed", "daha düşük deneme geçti durumunu bozmaz");
  ok(lms.veri["cmi.core.score.raw"] === "80", "en iyi puan korunur");
  ok(/%80/.test(sahneMetni(w)) && /Deneme sayısı: 3/.test(sahneMetni(w)), "sonuç: en iyi %80, 3 deneme");
  ok(lms.durum.hatalar.length === 0, "SCORM hata kodu yok " + lms.durum.hatalar.join("|"));
  ayril(w);
}

async function t5_dallanma() {
  console.log("T5 Dallanma ve sonuç türleri");
  var lms = mock.olustur();
  var r = await ac(lms), w = r.w;
  modeleGec(w); ileri(w);
  turSec(w, 0); // zayıf açılış
  ok(q(w, "#gb").className.indexOf("kotu") >= 0, "zayıf seçim: geri bildirim kutusu 'kotu'");
  ok(/Geliştirilebilir ✗/.test(q(w, "#sahne").textContent), "zayıf seçim işareti metinle de belirtilir");
  ok(/Daha güçlü ✓/.test(q(w, "#sahne").textContent), "en güçlü seçenek gösterilir");
  ileri(w);
  ok(/Anladım, konu raporlar/.test(sahneMetni(w)), "güven düşük: Elif savunmada açıyor");
  turSec(w, 0);
  ileri(w);
  ok(/anlatsam da bir şey değişecek/.test(sahneMetni(w)), "kötü 2. seçim: Elif kapalı");
  turSec(w, 2);
  ok(q(w, "#mg-d").textContent === "0/100" && q(w, "#mn-d").textContent === "34/100", "sınırlama: güven 0, netlik 34");
  ileri(w);
  ok(/Kopuk görüşme/.test(sahneMetni(w)), "sonuç: Kopuk görüşme");
  ok(/0\/3/.test(sahneMetni(w)), "0/3 güçlü seçim");
  q(w, "#yeniden-gor").click();
  ok(baslik(w).indexOf("Görüşme 1/3") === 0 && beceriSayisi(w) === 0, "yeniden dene: 1. görüşme, beceriler sıfır");
  ok(qa(w, "#ray button:not([disabled])").length >= 3, "yeniden denemede kenar çubuğu tutarlı");
  ok(!qa(w, "#ray button")[5].disabled === false, "özet adımı yeniden kilitli");
  // orta + orta + orta -> Sıcak/Gergin
  turSec(w, 2); ileri(w);
  turSec(w, 1); ileri(w);
  turSec(w, 1); ileri(w);
  ok(/Sıcak ama belirsiz|Net ama gergin/.test(sahneMetni(w)), "orta seçimler: karışık sonuç");
  ayril(w);
}

async function t6_devam() {
  console.log("T6 Devam (suspend_data)");
  var lms = mock.olustur();
  var r = await ac(lms), w = r.w;
  gorusmeyiOyna(w, IYI); ileri(w);
  degerlendir(w, [0, 0, 0, 2, 1]);
  ayril(w);
  ok(lms.veri["cmi.core.exit"] === "suspend", "geçilmedi: exit suspend");
  var lms2 = mock.olustur({
    "cmi.core.lesson_status": lms.veri["cmi.core.lesson_status"],
    "cmi.core.lesson_location": lms.veri["cmi.core.lesson_location"],
    "cmi.core.entry": "resume",
    "cmi.suspend_data": lms.veri["cmi.suspend_data"],
    "cmi.core.score.raw": lms.veri["cmi.core.score.raw"]
  });
  var r2 = await ac(lms2);
  ok(baslik(r2.w).indexOf("Değerlendirme") === 0, "kaldığı ekrandan devam eder");
  ok(/Deneme sayısı: 1/.test(sahneMetni(r2.w)) && /%60/.test(sahneMetni(r2.w)), "değerlendirme sonucu korunmuş");
  ok(beceriSayisi(r2.w) === 3, "kazanılan beceriler korunmuş");
  ok(lms2.veri["cmi.core.lesson_status"] === "failed", "durum bozulmadı (failed)");
  qa(r2.w, "#ray button")[2].click();
  ok(/Seçimin/.test(sahneMetni(r2.w)), "görüşme seçimleri geri yüklendi");
  ayril(r2.w);

  var lms3 = mock.olustur({ "cmi.suspend_data": "{bozuk json" });
  var r3 = await ac(lms3);
  ok(baslik(r3.w) === "Hoş geldin" && r3.jsHatalari.length === 0, "bozuk suspend_data: temiz başlangıç");
  ayril(r3.w);

  var lms4 = mock.olustur({ "cmi.suspend_data": JSON.stringify({ e: 99, max: 99, k: [9, 9, 9], d: [7, 7, 7, 7, 7], de: 150 }) });
  var r4 = await ac(lms4);
  ok(r4.jsHatalari.length === 0, "aralık dışı değerlerde çökme yok");
  ok(qa(r4.w, "#ray button:not([disabled])").length >= 1, "ekran/erişim sınırlandı");
  ayril(r4.w);
}

async function t7_cevrimdisi() {
  console.log("T7 LMS yokken (çevrimdışı)");
  var r = await ac(null), w = r.w;
  gorusmeyiOyna(w, IYI); ileri(w);
  degerlendir(w, DOGRU);
  ileri(w);
  ok(/Geçti/.test(sahneMetni(w)), "LMS olmadan da akış tamamlanır");
  ok(r.jsHatalari.length === 0, "JS hatası yok " + r.jsHatalari.join("|"));
  ayril(w);
}

async function t8_sonEkran() {
  console.log("T8 Uygulama ekranı");
  var lms = mock.olustur();
  var r = await ac(lms), w = r.w;
  gorusmeyiOyna(w, IYI); ileri(w);
  degerlendir(w, DOGRU); ileri(w);
  var onizleme = q(w, "#sbi-onizleme");
  ok(/burada görünür/.test(onizleme.textContent), "boş önizleme açıklaması");
  q(w, "#sbi-s").value = "Cuma toplantısında <b>x</b>";
  q(w, "#sbi-s").dispatchEvent(new w.Event("input"));
  q(w, "#sbi-b").value = "rapor 10:00'da geldi";
  q(w, "#sbi-b").dispatchEvent(new w.Event("input"));
  ok(/Durum/.test(onizleme.textContent) && /Davranış/.test(onizleme.textContent), "önizleme etiketli (renk tek başına değil)");
  ok(onizleme.querySelector("b") === null && /&lt;|<b>/.test(onizleme.innerHTML.replace(/&lt;b&gt;/g, "&lt;")) , "kullanıcı metni HTML olarak yorumlanmaz");
  ok(onizleme.innerHTML.indexOf("<b>x</b>") === -1, "enjeksiyon yok");
  var kutular = qa(w, ".taahhut input");
  kutular[1].checked = true; kutular[1].dispatchEvent(new w.Event("change"));
  ok(JSON.parse(lms.veri["cmi.suspend_data"]).tk[1] === 1, "taahhüt suspend_data'ya yazıldı");
  ok(lms.veri["cmi.suspend_data"].indexOf("Cuma toplantısında") === -1, "kullanıcı metni LMS'e gönderilmez");
  ayril(w);
}

async function t9_icerik() {
  console.log("T9 İçerik ve paket tutarlılığı");
  var kaynak = fs.readFileSync(path.join(KOK, "js", "modul2.js"), "utf8");
  var gorsel = fs.readFileSync(path.join(KOK, "js", "gorsel.js"), "utf8");
  var manifest = fs.readFileSync(path.join(KOK, "imsmanifest.xml"), "utf8");
  ok(/GECME_ESIGI = 80/.test(kaynak), "geçme eşiği 80");
  ok(/masteryscore>80</.test(manifest), "manifest masteryscore = 80");
  ok(!/https?:\/\//.test((kaynak + gorsel).replace(/http:\/\/www\.w3\.org\/2000\/svg/g, "")), "JS içinde dış adres yok");
  ok(/schemaversion>1\.2</.test(manifest), "SCORM 1.2");
  var html = fs.readFileSync(path.join(KOK, "index.html"), "utf8");
  ok(/lang="tr"/.test(html) && !/Kurgusal demo/.test(html), "tr dili, kurgu şeridi yok");
  var css = fs.readFileSync(path.join(KOK, "css", "modul2.css"), "utf8");
  ok(/prefers-reduced-motion/.test(css), "azaltılmış hareket desteği");
  ok(!/@import|url\(http/.test(css), "CSS dış kaynak yok");
  // doğru şık dağılımı ve en güçlü seçenek konumları değişken
  ok(new Set(DOGRU).size === 3, "doğru şıklar farklı konumlarda");
  ok(new Set(IYI).size === 3, "güçlü görüşme seçenekleri farklı konumlarda");
}

(async function () {
  var testler = [t1_baslatma, t1b_adlar, t2_gating, t3_tamDogru, t4_kaldiYenidenGecer, t5_dallanma, t6_devam, t7_cevrimdisi, t8_sonEkran, t9_icerik];
  for (var i = 0; i < testler.length; i++) {
    try { await testler[i](); }
    catch (e) { kalan++; console.log("  HATA test çöktü: " + (e && e.stack || e)); }
  }
  console.log("\nSonuç: " + gecen + " geçti, " + kalan + " kaldı");
  process.exit(kalan ? 1 : 0);
})();
