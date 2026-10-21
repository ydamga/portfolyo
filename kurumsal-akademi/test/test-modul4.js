/*
 * Modül 4 işlevsellik ve SCORM 1.2 davranış testleri (jsdom + sahte LMS).
 * Çalıştırma:  JSDOM_YOLU=/yol/node_modules/jsdom node test/test-modul4.js
 * Bu testler gerçek bir LMS ya da gerçek bir tarayıcı testinin yerine geçmez.
 */
"use strict";

var path = require("path");
var fs = require("fs");
var JSDOM = require(process.env.JSDOM_YOLU || "jsdom");
var mock = require("./mock-lms.js");
var KOK = path.join(__dirname, "..", "moduller", "modul-4-yapay-zeka");

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
  for (var i = 0; i < 60 && !w.document.querySelector("#icerik .cam"); i++) await bekle(20);
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
function degis(w, el) { el.dispatchEvent(new w.Event("change", { bubbles: true })); }

function problemCoz(w) { q(w, "#neden").click(); }
function bilesenCoz(w) { [0, 1, 2, 3].forEach(function (i) { qa(w, ".sekme")[i].click(); }); }
function karsiCoz(w) {
  qa(w, "input[type=checkbox]").forEach(function (c) { c.checked = [0, 2, 3].indexOf(parseInt(c.getAttribute("data-i"), 10)) >= 0; });
  q(w, "#karsi-kontrol").click();
}
function atolyeSec(w, secimler) {
  secimler.forEach(function (v, g) { var r = q(w, 'input[name="g' + g + '"][value="' + v + '"]'); r.checked = true; degis(w, r); });
}
function dogrulaCoz(w) {
  [0, 1, 2, 0].forEach(function (j, c) { q(w, '.mini[data-c="' + c + '"][data-j="' + j + '"]').click(); });
  q(w, "#dogrula-kontrol").click();
}
function gizlilikCoz(w) {
  [1, 0, 2, 2].forEach(function (j, c) { q(w, '.vaka[data-c="' + c + '"] .mini[data-j="' + j + '"]').click(); });
}
function degerlendir(w, c) { for (var i = 0; i < 5; i++) { qa(w, "#icerik .secenek")[c[i]].click(); q(w, "#sonraki-soru").click(); } }
var DOGRU = [1, 0, 2, 1, 2];

function testeKadar(w) {
  problemCoz(w); ileri(w); ileri(w);
  bilesenCoz(w); ileri(w);
  karsiCoz(w); ileri(w);
  atolyeSec(w, [0, 0, 0, 0]); q(w, "#calistir").click(); ileri(w);
  dogrulaCoz(w); ileri(w);
  gizlilikCoz(w); ileri(w);
}

async function t1() {
  console.log("T1 Başlatma");
  var lms = mock.olustur(); var r = await ac(lms), w = r.w;
  ok(lms.veri["cmi.core.lesson_status"] === "incomplete", "durum incomplete");
  ok(baslik(w) === "Belirsiz istek, genel kalan çıktı", "ilk başlık");
  ok(/Örnek çıktı/i.test(q(w, "#icerik").innerHTML), "örnek çıktı etiketi görünür");
  ok(/gerçek bir yapay zekâ servisine bağlanılmaz/.test(w.document.body.textContent), "gerçek servise bağlanmadığı belirtilir");
  ok(q(w, "#gorsel svg[role=img]").getAttribute("aria-label").length > 10, "illüstrasyon erişilebilir etiket taşır");
  ok(q(w, "#ileri").disabled, "problem açılmadan ileri kapalı");
  ok(lms.durum.hatalar.length === 0 && r.hatalar.length === 0, "SCORM ve JS hatası yok");
  var idler = qa(w, "[id]").map(function (e) { return e.id; });
  ok(idler.length === new Set(idler).size, "id'ler benzersiz");
  ayril(w);
}

async function t2_menu() {
  console.log("T2 Menü ve gezinme");
  var r = await ac(mock.olustur()), w = r.w;
  var m = q(w, "#menu-ac");
  ok(q(w, "#cekmece").hidden && m.getAttribute("aria-expanded") === "false", "menü kapalı");
  m.click();
  ok(!q(w, "#cekmece").hidden && m.getAttribute("aria-expanded") === "true", "menü açılır");
  ok(qa(w, "#liste button:not([disabled])").length === 1, "yalnızca erişilebilen bölüm açık");
  w.document.dispatchEvent(new w.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  ok(q(w, "#cekmece").hidden, "Escape menüyü kapatır");
  problemCoz(w); ileri(w);
  ok(baslik(w) === "Bu modülün hedefleri" && !q(w, "#ileri").disabled, "hedefler sayfası serbest");
  q(w, "#geri").click();
  ok(baslik(w) === "Belirsiz istek, genel kalan çıktı", "geri çalışır");
  ayril(w);
}

async function t3_kapilar() {
  console.log("T3 Etkinlik kapıları");
  var r = await ac(mock.olustur()), w = r.w;
  problemCoz(w); ileri(w); ileri(w);
  ok(q(w, "#ileri").disabled, "bileşenler: hepsi açılmadan ileri kapalı");
  qa(w, ".sekme")[0].click(); qa(w, ".sekme")[1].click(); qa(w, ".sekme")[2].click();
  ok(q(w, "#ileri").disabled, "üç bileşen yetmez");
  ok(/Neden önemli/.test(metin(w)) && qa(w, ".parca.aktif").length === 1, "açıklama ve istem vurgusu");
  ok(/Girdi ve kısıtlar/.test(q(w, "#gorsel svg").getAttribute("aria-label")), "illüstrasyon seçili bileşeni belirtir");
  qa(w, ".sekme")[3].click();
  ok(!q(w, "#ileri").disabled, "dört bileşen sonrası ileri açık");
  ileri(w);
  // karşılaştırma
  qa(w, "input[type=checkbox]")[1].checked = true; q(w, "#karsi-kontrol").click();
  ok(/Henüz değil/.test(metin(w)) && q(w, "#ileri").disabled, "yanlış işaretleme reddedilir");
  karsiCoz(w);
  ok(/Doğru\./.test(metin(w)) && !q(w, "#ileri").disabled, "doğru işaretleme kabul edilir");
  ileri(w);
  // atölye
  q(w, "#calistir").click();
  ok(/dört grupta da/.test(metin(w)) && q(w, "#ileri").disabled, "seçim yapmadan çalıştırılamaz");
  atolyeSec(w, [1, 1, 1, 1]);
  ok(/\[Rol ve bağlam: seçilmedi\]/.test(q(w, "#onizleme").textContent) === false, "önizleme seçimleri yansıtır");
  q(w, "#calistir").click();
  ok(/İstem kalitesi: 0\/4/.test(metin(w)) && /genel kuralları içeriyor/.test(metin(w)), "0/4: genel geçer çıktı");
  ok(/0 \/ 4/.test(q(w, "#gorsel svg").getAttribute("aria-label")), "illüstrasyon kaliteyi gösterir");
  atolyeSec(w, [0, 0, 1, 1]); q(w, "#calistir").click();
  ok(/İstem kalitesi: 2\/4/.test(metin(w)) && /Başka ayrıntılar belgede/.test(metin(w)), "2/4: orta çıktı");
  atolyeSec(w, [0, 0, 0, 0]); q(w, "#calistir").click();
  ok(/İstem kalitesi: 4\/4/.test(metin(w)) && /Doğrulanacaklar: Madde 2/.test(metin(w)), "4/4: iyi çıktı ve doğrulama bölümü");
  ok(/✓/.test(metin(w)) && /✗/.test(metin(w)) === false, "tüm gruplarda ✓ (metinle)");
  atolyeSec(w, [2, 2, 2, 2]); q(w, "#calistir").click();
  ok(/Tahmin etmeye açıkça izin vermek|Tahmin etmeye/i.test(metin(w)) || /tahmin/.test(metin(w)), "uydurmaya yol açan seçenek gerekçelendirilir");
  ok(!q(w, "#ileri").disabled, "çalıştırma sonrası ileri açık");
  ayril(w);
}

async function t4_dogrulaGizlilik() {
  console.log("T4 Doğrulama ve gizlilik");
  var r = await ac(mock.olustur()), w = r.w;
  problemCoz(w); ileri(w); ileri(w); bilesenCoz(w); ileri(w); karsiCoz(w); ileri(w);
  atolyeSec(w, [0, 0, 0, 0]); q(w, "#calistir").click(); ileri(w);
  ok(baslik(w) === "Çıktıyı doğrula", "doğrulama ekranı");
  q(w, "#dogrula-kontrol").click();
  ok(/Bir seçenek seç/.test(metin(w)) && q(w, "#ileri").disabled, "boş bırakılanlar uyarılır");
  [0, 0, 0, 0].forEach(function (j, c) { q(w, '.mini[data-c="' + c + '"][data-j="' + j + '"]').click(); });
  q(w, "#dogrula-kontrol").click();
  ok(/Henüz değil/.test(metin(w)) && /✗/.test(metin(w)), "yanlış sınıflama ✗ ve metinle bildirilir");
  dogrulaCoz(w);
  ok(/Hepsi doğru/.test(metin(w)) && !q(w, "#ileri").disabled, "doğru sınıflama kabul edilir");
  ileri(w);
  ok(baslik(w) === "Gizlilik kararları", "gizlilik ekranı");
  q(w, '.vaka[data-c="0"] .mini[data-j="0"]').click();
  ok(/Daha güvenli bir seçenek var/.test(metin(w)) && q(w, "#ileri").disabled, "riskli karar reddedilir");
  gizlilikCoz(w);
  ok(qa(w, ".mini.dogru").length === 4 && !q(w, "#ileri").disabled, "dört vaka doğru çözülünce ileri açık");
  ayril(w);
}

async function t5_tamAkis() {
  console.log("T5 Tam akış, puan ve eylem planı");
  var lms = mock.olustur(); var r = await ac(lms), w = r.w;
  testeKadar(w);
  ok(baslik(w) === "Değerlendirme ve eylem planı" && q(w, "#ileri").disabled, "test sayfası, bitmeden ileri kapalı");
  degerlendir(w, DOGRU);
  ok(/5\/5 \(%100\)/.test(metin(w)), "5/5 sonuç kartı");
  ok(lms.veri["cmi.core.lesson_status"] === "passed" && lms.veri["cmi.core.score.raw"] === "100", "passed ve 100");
  ok(lms.veri["cmi.core.score.min"] === "0" && lms.veri["cmi.core.score.max"] === "100", "min/max");
  var s0 = q(w, "#plan0"), s1 = q(w, "#plan1"), s2 = q(w, "#plan2");
  s0.value = "1"; degis(w, s0); s1.value = "0"; degis(w, s1);
  ok(q(w, "#plan-ozet").textContent.trim() === "", "plan eksikken özet gösterilmez");
  s2.value = "1"; degis(w, s2);
  ok(/Kişisel kuralların/.test(q(w, "#plan-ozet").textContent) && /e-posta taslağı yazmak/.test(q(w, "#plan-ozet").textContent), "plan özeti oluşur");
  ok(JSON.parse(lms.veri["cmi.suspend_data"]).p.join() === "1,0,1", "plan seçimleri (indeks) suspend_data'da");
  ok(/%100 tamamlandı/.test(q(w, "#yuzde").textContent) && q(w, "#cubuk").getAttribute("aria-valuenow") === "100", "ilerleme çubuğu %100");
  ayril(w);
  ok(lms.veri["cmi.core.exit"] === "" && lms.durum.finishSayisi === 1, "exit boş, LMSFinish bir kez");
  ok(lms.veri["cmi.suspend_data"].length < 500, "suspend_data küçük (" + lms.veri["cmi.suspend_data"].length + ")");
  ok(lms.durum.hatalar.length === 0 && r.hatalar.length === 0, "SCORM ve JS hatası yok " + r.hatalar.join("|"));
}

async function t6_kaldiYeniden() {
  console.log("T6 Başarısız, yeniden deneme, kalıcı geçti");
  var lms = mock.olustur(); var r = await ac(lms), w = r.w;
  testeKadar(w);
  degerlendir(w, [0, 1, 0, 1, 2]); // Q4, Q5 doğru → 2/5
  ok(lms.veri["cmi.core.lesson_status"] === "failed" && lms.veri["cmi.core.score.raw"] === "40", "2/5 → failed / 40");
  ok(/Geçilmedi/.test(metin(w)), "Geçilmedi (metinle)");
  q(w, "#yeniden-test").click();
  ok(/Soru 1\/5/.test(metin(w)), "yeniden deneme 1. sorudan başlar");
  degerlendir(w, [1, 0, 2, 1, 0]); // 4/5
  ok(lms.veri["cmi.core.lesson_status"] === "passed" && lms.veri["cmi.core.score.raw"] === "80", "4/5 → passed / 80");
  q(w, "#yeniden-test").click();
  degerlendir(w, [0, 1, 0, 0, 0]);
  ok(lms.veri["cmi.core.lesson_status"] === "passed" && lms.veri["cmi.core.score.raw"] === "80", "daha düşük deneme geçti durumunu ve en iyi puanı bozmaz");
  ok(/Deneme sayısı: 3/.test(metin(w)), "3 deneme");
  ayril(w);
  ok(lms.durum.hatalar.length === 0, "SCORM hata kodu yok");
}

async function t7_devam() {
  console.log("T7 Devam");
  var lms = mock.olustur(); var r = await ac(lms), w = r.w;
  problemCoz(w); ileri(w); ileri(w); bilesenCoz(w); ileri(w); karsiCoz(w); ileri(w);
  atolyeSec(w, [0, 1, 0, 2]);
  ayril(w);
  ok(lms.veri["cmi.core.exit"] === "suspend" && lms.veri["cmi.core.lesson_location"] === "atolye", "yarım: exit suspend, location atolye");
  var lms2 = mock.olustur({ "cmi.core.lesson_status": "incomplete", "cmi.core.lesson_location": "atolye", "cmi.core.entry": "resume", "cmi.suspend_data": lms.veri["cmi.suspend_data"] });
  var r2 = await ac(lms2);
  ok(baslik(r2.w) === "İstem atölyesi", "kaldığı ekran");
  ok(q(r2.w, 'input[name="g1"][value="1"]').checked && q(r2.w, 'input[name="g3"][value="2"]').checked, "atölye seçimleri geri yüklendi");
  ok(qa(r2.w, "#liste button:not([disabled])").length === 5, "önceki bölümler menüde açık");
  ayril(r2.w);
  var r3 = await ac(mock.olustur({ "cmi.suspend_data": "{bozuk" }));
  ok(baslik(r3.w) === "Belirsiz istek, genel kalan çıktı" && r3.hatalar.length === 0, "bozuk suspend_data: temiz başlangıç");
  ayril(r3.w);
  var r4 = await ac(mock.olustur({ "cmi.suspend_data": JSON.stringify({ e: 40, max: 40, w: [9, 9, 9, 9], d: [9, 9, 9, 9, 9], p: [9, 9, 9] }) }));
  ok(r4.hatalar.length === 0, "aralık dışı değerlerde çökme yok");
  ayril(r4.w);
}

async function t8_cevrimdisi() {
  console.log("T8 LMS yok");
  var r = await ac(null), w = r.w;
  testeKadar(w);
  degerlendir(w, DOGRU);
  ok(/Geçti/.test(metin(w)) && r.hatalar.length === 0, "LMS olmadan akış tamamlanır");
  ayril(w);
}

async function t9_icerik() {
  console.log("T9 İçerik ve paket");
  var js = fs.readFileSync(path.join(KOK, "js", "modul4.js"), "utf8");
  var izo = fs.readFileSync(path.join(KOK, "js", "izo.js"), "utf8");
  var man = fs.readFileSync(path.join(KOK, "imsmanifest.xml"), "utf8");
  var css = fs.readFileSync(path.join(KOK, "css", "modul4.css"), "utf8");
  ok(/GECME_ESIGI = 80/.test(js) && /masteryscore>80</.test(man), "eşik 80 / masteryscore 80");
  ok(/schemaversion>1\.2</.test(man), "SCORM 1.2");
  ok(!/https?:\/\//.test(js + izo) && !/@import|url\(http/.test(css), "dış adres yok");
  ok(/prefers-reduced-motion/.test(css), "azaltılmış hareket");
  ok(!/fetch\(|XMLHttpRequest|WebSocket/.test(js + izo), "ağ çağrısı yok (gerçek yapay zekâ servisi çağrılmıyor)");
  ok(DOGRU.length === 5 && new Set(DOGRU).size === 3, "doğru şıklar farklı konumlarda");
}

(async function () {
  var t = [t1, t2_menu, t3_kapilar, t4_dogrulaGizlilik, t5_tamAkis, t6_kaldiYeniden, t7_devam, t8_cevrimdisi, t9_icerik];
  for (var i = 0; i < t.length; i++) { try { await t[i](); } catch (e) { kalan++; console.log("  HATA test çöktü: " + (e && e.stack || e)); } }
  console.log("\nSonuç: " + gecen + " geçti, " + kalan + " kaldı");
  process.exit(kalan ? 1 : 0);
})();
