/*
 * İş Başında Yapay Zekâ: işlevsellik ve SCORM 1.2 davranış testleri (jsdom + sahte LMS).
 * Çalıştırma:  JSDOM_YOLU=/yol/node_modules/jsdom node test/test-modul1.js
 * Bu testler gerçek bir LMS ya da gerçek bir tarayıcı testinin yerine geçmez.
 */
"use strict";

var path = require("path");
var fs = require("fs");
var JSDOM = require(process.env.JSDOM_YOLU || "jsdom");
var mock = require("./mock-lms.js");
var KOK = path.join(__dirname, "..", "moduller", "modul-1-ai-at-work");

var gecen = 0, kalan = 0;
function ok(k, m) { if (k) { gecen++; console.log("  ok   " + m); } else { kalan++; console.log("  HATA " + m); } }
function bekle(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

async function ac(lms, secenek) {
  secenek = secenek || {};
  var hatalar = [];
  var vc = new JSDOM.VirtualConsole();
  vc.on("jsdomError", function (e) { hatalar.push(String(e && e.message || e)); });
  var dom = await JSDOM.JSDOM.fromFile(path.join(KOK, "index.html"), {
    runScripts: "dangerously", resources: "usable", pretendToBeVisual: true, virtualConsole: vc,
    beforeParse: function (w) {
      if (lms) w.API = lms.API;
      w.scrollTo = function () {};
      if (secenek.azalt) w.matchMedia = function () { return { matches: true }; };
    }
  });
  var w = dom.window;
  for (var i = 0; i < 80 && !w.document.querySelector("#ekran-baslik").textContent; i++) await bekle(20);
  if (!secenek.animasyonlu && !secenek.azalt) w.document.getElementById("hareket").click(); // hızlı mod
  return { w: w, hatalar: hatalar };
}
function q(w, s) { return w.document.querySelector(s); }
function qa(w, s) { return Array.prototype.slice.call(w.document.querySelectorAll(s)); }
function baslik(w) { return q(w, "#ekran-baslik").textContent; }
function engelli(w, id) { return q(w, id).getAttribute("aria-disabled") === "true"; }
function ileri(w) { if (engelli(w, "#ileri")) throw new Error("İleri kapalı: " + q(w, "#ipucu").textContent); q(w, "#ileri").click(); }
function geri(w) { q(w, "#geri").click(); }
function sec(w, i) { qa(w, "#etkilesim .secenek")[i].click(); }
function ayril(w) { ["beforeunload", "pagehide", "unload"].forEach(function (a) { w.dispatchEvent(new w.Event(a)); }); }
function veri(lms) { return lms.veri["cmi.suspend_data"] ? JSON.parse(lms.veri["cmi.suspend_data"]) : null; }

var DOGRU = [1, 3, 0, 2, 1];
function bilesenler(w) { qa(w, ".bilesen").forEach(function (b) { b.click(); }); }
function sahne5ye(w) {
  sec(w, 1); ileri(w);              // S1
  bilesenler(w); ileri(w);          // S2
  sec(w, 1); ileri(w);              // S3
  sec(w, 2); ileri(w);              // S4
  sec(w, 0); ileri(w);              // S5 -> S6
}
function degerlendir(w, cevaplar) {
  for (var i = 0; i < 5; i++) { qa(w, "#etkilesim .secenek")[cevaplar[i]].click(); q(w, "#sonraki-soru").click(); }
}
function kopya(lms, ek) {
  var b = {};
  ["cmi.suspend_data", "cmi.core.lesson_location", "cmi.core.lesson_status", "cmi.core.score.raw"].forEach(function (k) { b[k] = lms.veri[k]; });
  b["cmi.core.entry"] = "resume";
  return Object.assign(b, ek || {});
}

async function t1() {
  console.log("T1 Başlatma ve temel yapı");
  var lms = mock.olustur(); var r = await ac(lms), w = r.w;
  ok(lms.veri["cmi.core.lesson_status"] === "incomplete", "durum incomplete");
  ok(baslik(w) === "Belirsiz bir istek", "ilk sahne başlığı");
  ok(lms.durum.hatalar.length === 0 && r.hatalar.length === 0, "SCORM ve JS hatası yok");
  var idler = qa(w, "[id]").map(function (e) { return e.id; });
  ok(idler.length === new Set(idler).size, "sayfadaki id'ler benzersiz");
  ok(q(w, "#ses").hidden === true, "ses düğmesi gizli (ses dosyası yok)");
  ok(!fs.readdirSync(path.join(KOK, "assets", "audio")).some(function (f) { return /\.(mp3|ogg|wav|m4a)$/i.test(f); }), "assets/audio içinde gerçekten ses dosyası yok");
  ok(q(w, "#sahne svg[role=img]").getAttribute("aria-label").length > 15, "sahne SVG'si erişilebilir etiket taşır");
  ok(/Örnek çıktı/.test(q(w, "#akis").textContent), "yapay zekâ çıktısı 'Örnek çıktı' etiketli");
  ok(q(w, "#cubuk").getAttribute("role") === "progressbar" && q(w, "#cubuk").getAttribute("aria-valuenow") === "0", "ilerleme çubuğu role=progressbar, değer 0");
  ok(/Sahne 1 \/ 7/.test(q(w, "#sahne-no").textContent), "sahne numarası görünür");
  ok(qa(w, "button").every(function (b) { return (b.textContent.trim() || b.getAttribute("aria-label")); }), "tüm düğmelerin erişilebilir adı var");
  ok(engelli(w, "#geri") && engelli(w, "#ileri"), "ilk sahnede önceki kapalı, karar yokken sonraki kapalı");
  ayril(w);
  ok(lms.durum.finishSayisi === 1, "çıkışta LMSFinish bir kez");
  ok(lms.veri["cmi.core.session_time"] && /^\d{4}:\d{2}:\d{2}/.test(lms.veri["cmi.core.session_time"]), "session_time geçerli biçimde");
}

async function t2() {
  console.log("T2 Kapılar ve sahne içi geri bildirim");
  var lms = mock.olustur(); var r = await ac(lms), w = r.w;
  // S1
  ok(engelli(w, "#ileri"), "S1: karar öncesi sonraki kapalı");
  sec(w, 0);
  var f0 = q(w, "#geribildirim").textContent;
  ok(/Henüz değil/.test(f0) && /Türkçe/.test(f0), "S1: yanlış seçeneğe özel geri bildirim");
  ok(!engelli(w, "#ileri"), "S1: karar sonrası sonraki açık");
  sec(w, 1);
  var f1 = q(w, "#geribildirim").textContent;
  ok(/Doğru seçim/.test(f1) && f1 !== f0, "S1: doğru seçeneğe farklı geri bildirim");
  ok(qa(w, ".secenek")[0].classList.contains("yanlis") && qa(w, ".secenek")[1].classList.contains("dogru"), "S1: durum sınıfları ve ✓/✗ metni");
  ok(/✓/.test(qa(w, ".secenek")[1].textContent) && /✗/.test(qa(w, ".secenek")[0].textContent), "S1: durum renk dışında metinle de bildirilir");
  ileri(w);
  // S2
  ok(baslik(w) === "İyi prompt'un anatomisi", "S2'ye geçildi");
  ok(q(w, "#seg-kap").querySelectorAll(".seg.bos").length === 5, "S2: prompt kutusu 5 boş yer tutucuyla başlar");
  qa(w, ".bilesen")[0].click();
  ok(q(w, "#seg-kap").querySelectorAll(".seg.bos").length === 4 && /Kurumsal iletişim uzmanı/.test(q(w, "#seg-kap").textContent), "S2: bileşen seçilince prompt'ta ilgili bölüm oluşur");
  ok(q(w, '.seg[data-id="rol"]').classList.contains("vurgu"), "S2: seçilen bölüm vurgulanır");
  ok(engelli(w, "#ileri") && /1 \/ 5/.test(q(w, "#ipucu").textContent), "S2: 1/5 iken sonraki kapalı, ilerleme yazılı");
  [1, 2, 3].forEach(function (i) { qa(w, ".bilesen")[i].click(); });
  ok(engelli(w, "#ileri"), "S2: 4/5 iken sonraki kapalı");
  qa(w, ".bilesen")[4].click();
  ok(!engelli(w, "#ileri") && /Beş bileşeni de keşfettin/.test(q(w, "#geribildirim").textContent), "S2: 5/5 ile açılır ve geri bildirim verilir");
  var tamPrompt = q(w, "#seg-kap").textContent.replace(/\s+/g, " ").trim();
  ok(/Kurumsal iletişim uzmanı rolünde, işe yeni başlayan çalışanlara yönelik, bir eğitim duyurusu yaz\./.test(tamPrompt) && /90 kelimeyi geçme/.test(tamPrompt), "S2: tam prompt doğru sırada oluşur");
  ileri(w);
  // S3
  ok(engelli(w, "#ileri"), "S3: karar öncesi kapalı");
  sec(w, 0);
  ok(/Seçtiğin/.test(q(w, "#ekstra").textContent) && /Bileşen kontrol listesi/.test(q(w, "#ekstra").textContent), "S3: seçimden hemen sonra iki çıktı ve kontrol listesi görünür");
  ok(/Henüz değil/.test(q(w, "#geribildirim").textContent), "S3: A için yanlış geri bildirimi");
  sec(w, 1);
  ok(/Doğru seçim/.test(q(w, "#geribildirim").textContent), "S3: B için doğru geri bildirimi");
  var kelime = parseInt((q(w, "#ekstra").textContent.match(/(\d+) kelime \(sınır: 90\)/) || [])[1], 10);
  ok(kelime > 0 && kelime <= 90, "S3: B çıktısının kelime sayısı kodla hesaplanır ve sınırın altında (" + kelime + ")");
  ileri(w);
  // S4
  ok(baslik(w) === "Her çıktıya güvenme", "S4'e geçildi");
  ok(q(w, "#akis").querySelectorAll("[data-u].uyari").length === 4, "S4: uydurma 4 parça işaretlenir");
  ok(!q(w, ".kar-mert").classList.contains("gizli"), "S4: Mert sahneye girer");
  sec(w, 1);
  ok(/Daha güvenli bir yol var/.test(q(w, "#geribildirim").textContent) && /Olası sonuç/.test(q(w, "#ekstra").textContent), "S4: 'hemen paylaş' riski ve olası sonucu gösterir");
  ok(q(w, "#akis").querySelectorAll("[data-u].uyari").length === 4, "S4: yanlış seçimde uydurma bilgiler işaretli kalır");
  sec(w, 0);
  ok(/Biçim, doğrulamanın yerini tutmaz/.test(q(w, "#geribildirim").textContent), "S4: yalnızca tasarım seçimi için ayrı geri bildirim");
  sec(w, 2);
  ok(q(w, "#akis").querySelectorAll("[data-u].yer").length === 4 && /doğrulanacak/.test(q(w, "#akis").textContent), "S4: doğru seçimde uydurma parçalar 'doğrulanacak' yer tutucusuna döner");
  ok(qa(w, "#ekstra .liste-kutusu li").length === 4, "S4: doğrulama listesi (tarih, saat, yer, koşul) açılır");
  ileri(w);
  // S5
  ok(baslik(w) === "Veri güvenliği", "S5'e geçildi");
  ok(q(w, "#akis").querySelectorAll(".hassas").length === 5, "S5: 5 hassas parça işaretli");
  sec(w, 1);
  ok(q(w, "#akis").querySelectorAll(".hassas.yer-tutucu").length === 0 && /[Yy]etkisiz/.test(q(w, "#geribildirim").textContent), "S5: olduğu gibi yapıştırma: hiçbir şey temizlenmez, risk açıklanır");
  sec(w, 2);
  ok(q(w, "#akis").querySelectorAll(".hassas.yer-tutucu").length === 2 && q(w, "#akis").querySelectorAll(".hassas:not(.yer-tutucu)").length === 3, "S5: yalnızca ad silme: 2 parça temizlenir, 3 hassas parça kalır");
  ok(/dolaylı yoldan/.test(q(w, "#ekstra").textContent), "S5: kalan veri için açıklama");
  sec(w, 0);
  ok(q(w, "#akis").querySelectorAll(".hassas.yer-tutucu").length === 5 && !/ayse\.kaya|45\.000|düşük/.test(q(w, "#taslak").textContent), "S5: doğru seçimde tüm hassas veri yer tutucuyla değişir");
  ileri(w);
  ok(baslik(w) === "Son değerlendirme", "S6'ya geçildi");
  ok(engelli(w, "#ileri"), "S6: değerlendirme bitmeden sonraki kapalı");
  ayril(w);
}

async function t3() {
  console.log("T3 Puanlama, yeniden deneme, başarı ve tamamlama");
  var lms = mock.olustur(); var r = await ac(lms), w = r.w;
  sahne5ye(w);
  // Soru bazlı geri bildirim
  qa(w, "#etkilesim .secenek")[0].click();
  ok(/Henüz değil/.test(q(w, "#geribildirim").textContent) && /Doğru cevap/.test(q(w, "#etkilesim").textContent), "S6: yanlış cevapta açıklayıcı geri bildirim ve doğru cevap işaretlenir");
  ok(qa(w, "#etkilesim .secenek").every(function (b) { return b.getAttribute("aria-disabled") === "true"; }), "S6: cevap kilitlenir (aria-disabled)");
  q(w, "#sonraki-soru").click();
  qa(w, "#etkilesim .secenek")[3].click(); ok(/✓ Doğru/.test(q(w, "#geribildirim").textContent), "S6: doğru cevapta geri bildirim");
  q(w, "#sonraki-soru").click();
  // 3/5: [yanlış, doğru, yanlış, doğru, doğru] için kalan üç soru
  qa(w, "#etkilesim .secenek")[1].click(); q(w, "#sonraki-soru").click();      // Q3 yanlış (doğru=0)
  qa(w, "#etkilesim .secenek")[2].click(); q(w, "#sonraki-soru").click();      // Q4 doğru
  qa(w, "#etkilesim .secenek")[1].click();                                      // Q5 doğru
  ok(engelli(w, "#ileri") === false, "S6: 5. cevaptan sonra sonraki açık (deneme kaydedildi)");
  q(w, "#sonraki-soru").click();
  ok(/%60/.test(q(w, "#etkilesim").textContent) && /Henüz başarılmadı/.test(q(w, "#etkilesim").textContent), "3/5: %60 ve başarısız");
  ok(lms.veri["cmi.core.lesson_status"] === "failed" && lms.veri["cmi.core.score.raw"] === "60", "3/5: failed, score.raw=60");
  ok(lms.veri["cmi.core.score.min"] === "0" && lms.veri["cmi.core.score.max"] === "100", "score.min/max 0/100");
  ok(lms.veri["cmi.core.exit"] === "suspend", "başarısızken exit=suspend");
  ok(qa(w, ".inceleme li").length === 2, "yanlışlar gözden geçirme listesinde (2)");
  ok(/Cevabın:/.test(q(w, ".inceleme").textContent) && /Doğru cevap:/.test(q(w, ".inceleme").textContent), "gözden geçirmede cevabın ve doğru cevap yazılı");
  // Tamamlama != başarı: S7'ye geç
  ileri(w);
  ok(baslik(w) === "Kapanış", "başarısız olsa da S7'ye ulaşılır");
  ok(/Modülü tamamladın, ama geçme eşiğini henüz yakalayamadın/.test(q(w, "#akis").textContent), "S7: tamamlama ve başarı ayrı gösterilir (tamamladı, başaramadı)");
  ok(/henüz geçilmedi \(failed\)/.test(q(w, "#akis").textContent), "S7: LMS'ye bildirilen durum (failed) görünür");
  ok(veri(lms).t === 1 && lms.veri["cmi.core.lesson_status"] === "failed", "tamamlama kaydı (t=1) ile durum failed birlikte");
  q(w, "#degerlendirmeye-don").click();
  ok(baslik(w) === "Son değerlendirme" && q(w, "#yeniden-dene"), "S7'den değerlendirmeye dönüş");
  // yeniden deneme: 4/5
  q(w, "#yeniden-dene").click();
  ok(veri(lms).q.every(function (x) { return x === -1; }) && veri(lms).n === 1 && veri(lms).en === 60, "yeniden dene: cevaplar sıfırlanır, deneme ve en iyi puan korunur");
  ok(engelli(w, "#ileri"), "yeniden denemede (henüz başarı yokken) sonraki kapalı");
  degerlendir(w, [1, 3, 0, 2, 0]); // son soru yanlış → 4/5
  var v = veri(lms);
  ok(v.p === 80 && v.en === 80 && v.g === 1 && v.n === 2, "4/5: eşik dahil geçer (p=80, en=80, g=1, n=2)");
  ok(lms.veri["cmi.core.lesson_status"] === "passed" && lms.veri["cmi.core.score.raw"] === "80" && lms.veri["cmi.core.exit"] === "", "4/5: passed, score.raw=80, exit boş");
  // 0 puan: başarıyı bozmaz
  q(w, "#yeniden-dene").click();
  ok(!engelli(w, "#ileri"), "daha önce başarıldıysa yeniden denerken sonraki açık (başarı kalıcı)");
  degerlendir(w, [0, 0, 1, 0, 0]); // 0/5? (Q1 doğru=1, Q2 doğru=3, Q3 doğru=0, Q4 doğru=2, Q5 doğru=1)
  v = veri(lms);
  ok(v.p === 0 && v.en === 80 && v.g === 1, "0/5 deneme: son puan 0, en iyi puan 80 ve başarı korunur");
  ok(lms.veri["cmi.core.lesson_status"] === "passed" && lms.veri["cmi.core.score.raw"] === "80", "LMS: passed ve score.raw 80 korunur");
  ayril(w);
  ok(lms.durum.finishSayisi === 1, "LMSFinish tek sefer");
}

async function t4() {
  console.log("T4 Tam doğru akış ve kapanış");
  var lms = mock.olustur(); var r = await ac(lms), w = r.w;
  sahne5ye(w);
  degerlendir(w, DOGRU);
  ok(/%100/.test(q(w, "#etkilesim").textContent) && /Tebrikler/.test(q(w, "#etkilesim").textContent), "5/5: %100 ve tebrik");
  ok(/Tüm soruları doğru yanıtladın/.test(q(w, "#etkilesim").textContent), "hata yoksa gözden geçirme listesi yerine tebrik notu");
  ok(lms.veri["cmi.core.lesson_status"] === "passed" && lms.veri["cmi.core.score.raw"] === "100", "5/5: passed, score.raw=100");
  ileri(w);
  ok(baslik(w) === "Kapanış", "S7");
  ok(qa(w, "#mesajlar .mesaj-karti").length === 3, "S7: üç temel mesaj kartı");
  ok(/Bağlamı ve görevi netleştir/.test(q(w, "#mesajlar").textContent) && /Çıktıyı doğrula ve verileri koru/.test(q(w, "#mesajlar").textContent), "S7: mesaj metinleri");
  ok(/Modülü tamamladın ve başardın/.test(q(w, "#akis").textContent), "S7: tamamlama mesajı (başarılı)");
  ok(q(w, "#akis").querySelectorAll(".dogrulandi").length === 3, "S7: yer tutucular 'doğrulandı' olarak işaretlenir");
  ok(q(w, "#cubuk").getAttribute("aria-valuenow") === "100" && /%100/.test(q(w, "#yuzde").textContent), "ilerleme %100");
  ok(engelli(w, "#ileri"), "son sahnede sonraki kapalı");
  ok(veri(lms).t === 1 && veri(lms).g === 1, "t=1 ve g=1 kaydedildi");
  ok(lms.veri["cmi.core.lesson_location"] === "s7", "lesson_location=s7");
  ok(lms.durum.hatalar.length === 0 && r.hatalar.length === 0, "SCORM/JS hatası yok");
  var uzunluk = lms.veri["cmi.suspend_data"].length;
  ok(uzunluk > 10 && uzunluk < 300, "suspend_data kompakt (" + uzunluk + " karakter)");
  ayril(w);
}

async function t5() {
  console.log("T5 Devam etme ve güvenli işleme");
  var lms = mock.olustur(); var r = await ac(lms), w = r.w;
  sec(w, 1); ileri(w); bilesenler(w); ileri(w); sec(w, 0);   // S3'te A seçili
  ayril(w);
  ok(lms.veri["cmi.core.exit"] === "suspend", "yarımken exit=suspend");
  ok(lms.veri["cmi.core.lesson_location"] === "s3", "lesson_location=s3");
  var lms2 = mock.olustur(kopya(lms)); var r2 = await ac(lms2), w2 = r2.w;
  ok(baslik(w2) === "Prompt'u iyileştir", "devam: aynı sahneden açılır");
  ok(qa(w2, "#etkilesim .secenek")[0].classList.contains("yanlis") && /Seçtiğin/.test(q(w2, "#ekstra").textContent), "devam: önceki seçim ve çıktılar geri yüklenir");
  geri(w2); geri(w2);
  ok(baslik(w2) === "Belirsiz bir istek" && qa(w2, "#etkilesim .secenek")[1].classList.contains("dogru"), "önceki sahnelere dönülür, cevaplar korunur");
  ok(lms2.veri["cmi.core.lesson_status"] === "incomplete", "devamda durum incomplete kalır");
  ayril(w2);

  // Yarım değerlendirme
  var l3 = mock.olustur(); var a = await ac(l3), w3 = a.w;
  sahne5ye(w3);
  qa(w3, "#etkilesim .secenek")[1].click(); q(w3, "#sonraki-soru").click();
  qa(w3, "#etkilesim .secenek")[0].click();            // Q2: yanlış (doğru=3)
  ayril(w3);
  var l4 = mock.olustur(kopya(l3)); var b = await ac(l4), w4 = b.w;
  ok(baslik(w4) === "Son değerlendirme" && /Soru 3 \/ 5/.test(q(w4, "#etkilesim").textContent), "yarım değerlendirme: cevaplanmamış ilk soruya dönülür");
  ok(qa(w4, ".soru-nokta li.dogru").length === 1 && qa(w4, ".soru-nokta li.yanlis").length === 1, "yarım değerlendirme: önceki cevaplar (1 doğru, 1 yanlış) korunur");
  ayril(w4);

  // Bozuk ve kötü niyetli veri
  var bozuk = [
    "{bozuk json", "[]", "null", "\"metin\"", "12345", "{\"e\":99,\"mx\":99,\"c\":\"x\",\"b\":-4,\"q\":{\"0\":1},\"r\":1,\"n\":\"abc\",\"p\":500,\"en\":1e9,\"g\":\"1\",\"t\":1}",
    "{\"e\":6,\"mx\":6,\"t\":1}", "{\"__proto__\":{\"x\":1},\"e\":2}", new Array(5000).join("x")
  ];
  var temiz = true, aciklamalar = [];
  for (var i = 0; i < bozuk.length; i++) {
    var l = mock.olustur({ "cmi.suspend_data": bozuk[i], "cmi.core.lesson_location": "s6" });
    var x = await ac(l);
    var hata = x.hatalar.length > 0 || !baslik(x.w);
    if (hata) { temiz = false; aciklamalar.push(i); }
    ok(baslik(x.w) === "Belirsiz bir istek", "bozuk veri #" + i + ": kapı kısıtı, ilk sahneye düşer (çökmez)");
    ayril(x.w);
  }
  ok(temiz, "bozuk suspend_data hiçbir durumda JS hatası üretmedi");
  // Sahte başarı: LMS passed + puan, suspend yok
  var lp = mock.olustur({ "cmi.core.lesson_status": "passed", "cmi.core.score.raw": "100", "cmi.core.lesson_location": "s1" });
  var xp = await ac(lp);
  ok(baslik(xp.w) === "Belirsiz bir istek", "LMS passed olsa da sahne kapıları korunur");
  ayril(xp.w);
  ok(lp.veri["cmi.core.lesson_status"] === "passed" && lp.veri["cmi.core.score.raw"] === "100", "LMS'te passed ve puan düşürülmez");
}

async function t6() {
  console.log("T6 Kontroller: hareket, atla, yeniden oynat, klavye, LMS yok");
  var lms = mock.olustur(); var r = await ac(lms, { animasyonlu: true }), w = r.w;
  ok(q(w, "html").getAttribute("data-hareket") === "acik" && q(w, "#hareket").getAttribute("aria-pressed") === "false", "varsayılan: animasyon açık");
  ok(q(w, "#etkilesim").hidden === true, "animasyon oynarken etkileşim gizli (karar sahnenin sonunda)");
  ok(q(w, "#atla-anim").hidden === false, "oynarken 'Animasyonu atla' görünür");
  ok(engelli(w, "#ileri") && /oynuyor/.test(q(w, "#ipucu").textContent), "oynarken ipucu: sahne oynuyor");
  await bekle(3300);
  ok(qa(w, "#balonlar .balon").length >= 1, "konuşma balonları zamanla sırayla gelir");
  ok(q(w, ".kar-ece").getAttribute("data-konus") === "1" || qa(w, "#balonlar .balon").length > 0, "konuşan karakter işaretlenir");
  q(w, "#atla-anim").click();
  ok(q(w, "#etkilesim").hidden === false && q(w, "#atla-anim").hidden === true, "atla: son durum hemen görünür, düğme gizlenir");
  ok(qa(w, "#balonlar .balon").length >= 2 && q(w, "#sohbet").textContent.indexOf("Örnek çıktı") > -1, "atla: tüm diyalog ve çıktı oluşur");
  ok(/Hmm/.test(q(w, "#transkript").textContent) && /Zamanım az/.test(q(w, "#transkript").textContent), "diyalog metni (transkript) tüm satırları içerir");
  sec(w, 1);
  // yeniden oynat cevabı silmez
  q(w, "#yeniden").click();
  ok(q(w, "#etkilesim").hidden === true && qa(w, "#balonlar .balon").length === 0, "yeniden oynat: sahne baştan oynar");
  q(w, "#atla-anim").click();
  ok(qa(w, "#etkilesim .secenek")[1].classList.contains("dogru") && !engelli(w, "#ileri"), "yeniden oynat: cevap korunur");
  // hareket azalt
  q(w, "#hareket").click();
  ok(q(w, "html").getAttribute("data-hareket") === "az" && q(w, "#hareket").getAttribute("aria-pressed") === "true", "animasyonları azalt: öznitelik ve aria-pressed");
  q(w, "#yeniden").click();
  ok(q(w, "#etkilesim").hidden === false && qa(w, "#balonlar .balon").length >= 2, "azaltılmış modda tüm diyalog ve etkileşim hemen görünür");
  // klavye
  w.document.dispatchEvent(new w.KeyboardEvent("keydown", { key: "ArrowRight", altKey: true, bubbles: true }));
  ok(baslik(w) === "İyi prompt'un anatomisi", "Alt+→ sonraki sahneye geçer");
  w.document.dispatchEvent(new w.KeyboardEvent("keydown", { key: "ArrowRight", altKey: true, bubbles: true }));
  ok(baslik(w) === "İyi prompt'un anatomisi", "Alt+→ karar verilmeden ilerlemez (kapı klavyeyle atlatılamaz)");
  w.document.dispatchEvent(new w.KeyboardEvent("keydown", { key: "ArrowLeft", altKey: true, bubbles: true }));
  ok(baslik(w) === "Belirsiz bir istek", "Alt+← önceki sahneye döner");
  ayril(w);

  // İşletim sistemi tercihi
  var r2 = await ac(mock.olustur(), { azalt: true });
  ok(q(r2.w, "html").getAttribute("data-hareket") === "az" && q(r2.w, "#hareket").getAttribute("aria-pressed") === "true", "prefers-reduced-motion: azaltılmış başlar");
  ok(q(r2.w, "#etkilesim").hidden === false, "prefers-reduced-motion: etkileşim hemen hazır");

  // LMS yok
  var r3 = await ac(null), w3 = r3.w;
  ok(r3.hatalar.length === 0 && baslik(w3) === "Belirsiz bir istek", "LMS yokken açılır, hata ekranı yok");
  sahne5ye(w3); degerlendir(w3, DOGRU); ileri(w3);
  ok(baslik(w3) === "Kapanış" && /LMS’ye bağlı değil/.test(q(w3, "#akis").textContent), "LMS yokken tüm akış çalışır; çevrimdışı mod belirtilir");
}

function t7() {
  console.log("T7 İçerik, tutarlılık ve paket");
  var html = fs.readFileSync(path.join(KOK, "index.html"), "utf8");
  var css = fs.readFileSync(path.join(KOK, "css", "styles.css"), "utf8");
  var kaynaklar = ["index.html", "css/styles.css", "js/app.js", "js/icerik.js", "js/karakterler.js", "js/scorm.js"].map(function (f) { return fs.readFileSync(path.join(KOK, f), "utf8").replace(/http:\/\/www\.w3\.org\/2000\/svg/g, ""); }).join("\n");
  ok(!/(?:https?:)?\/\/[A-Za-z0-9.-]+\.[A-Za-z]{2,}/.test(kaynaklar), "dış adres/bağımlılık yok (çevrimdışı)");
  ok(/prefers-reduced-motion/.test(css) && /data-hareket="az"/.test(css), "CSS prefers-reduced-motion ve kullanıcı seçeneğini destekler");
  ok(/:focus-visible/.test(css), "görünür odak göstergesi");
  ok(/viewport/.test(html) && /@media \(max-width/.test(css), "viewport meta ve duyarlı kurallar");
  var man = fs.readFileSync(path.join(KOK, "imsmanifest.xml"), "utf8");
  ok(/<schemaversion>1\.2<\/schemaversion>/.test(man) && /masteryscore>80</.test(man) && /adlcp:scormtype="sco"/.test(man), "manifest: SCORM 1.2, masteryscore 80, sco");
  ok(/ESIK = 80/.test(fs.readFileSync(path.join(KOK, "js", "app.js"), "utf8")), "uygulama eşiği 80");
  // içerik yapısı
  global.window = global;
  delete require.cache[require.resolve(path.join(KOK, "js", "icerik.js"))];
  require(path.join(KOK, "js", "icerik.js"));
  var IC = global.ICERIK;
  ok(IC.SAHNELER.length === 7, "7 sahne");
  ok(IC.SORULAR.length === 5, "5 değerlendirme sorusu");
  ok(IC.SORULAR.every(function (s) { return s.s.length === 4 && s.dogru >= 0 && s.dogru < 4 && s.acik.length > 20; }), "her soru 4 seçenek, doğru cevap ve açıklama içerir");
  ok(JSON.stringify(IC.SORULAR.map(function (s) { return s.dogru; })) === "[1,3,0,2,1]", "doğru şıklar farklı konumlara dağıtılmış");
  ok(new Set(IC.SORULAR.map(function (s) { return s.h; })).size === 4, "sorular H1–H4'ün dördünü de kapsar");
  var uzunDogru = IC.SORULAR.filter(function (s) { var u = s.s.map(function (x) { return x.length; }); return u[s.dogru] === Math.max.apply(null, u); }).length;
  ok(uzunDogru <= 2, "'en uzun şık doğru' ipucu aşırı değil (" + uzunDogru + "/5)");
  ok([0, 2, 3, 4].every(function (i) { var s = IC.SAHNELER[i]; var sec = (s.soru || s).secenekler; return sec.every(function (o) { return o.b && o.b.length > 20; }); }), "sahne içi her seçeneğin kendi geri bildirimi var");
}

async function t8() {
  console.log("T8 Karakter tutarlılığı (sahneler arası aynı görünüm)");
  var lms = mock.olustur(); var r = await ac(lms), w = r.w;
  var imza = {};
  function normal(el) { return el.outerHTML.replace(/ data-(ifade|poz|konus)="[^"]*"/g, "").replace(/ class="kar kar-(ece|mert)( gizli)?"/g, "").replace(/(mk|as|bg)\d+/g, "$1").replace(/ transform="[^"]*"/, ""); }
  sec(w, 1); ileri(w); bilesenler(w); ileri(w); sec(w, 1); ileri(w); sec(w, 2); ileri(w); sec(w, 0); ileri(w);
  var gor = {};
  // her sahnede Ece/Mert işaretini topla (sahneleri geri gezerek)
  for (var i = 0; i < 5; i++) {
    ["ece", "mert"].forEach(function (k) {
      var e = q(w, ".kar-" + k); var n = normal(e).replace(/ transform="[^"]*"/g, "");
      (gor[k] = gor[k] || new Set()).add(n);
    });
    geri(w);
  }
  ok(gor.ece.size === 1, "Ece her sahnede aynı çizimle (saç, kıyafet, oran) görünür");
  ok(gor.mert.size === 1, "Mert her sahnede aynı çizimle görünür");
  var ifadeler = qa(w, ".kar-ece .i").map(function (e) { return e.getAttribute("class"); });
  ok(ifadeler.length === 7, "Ece'nin yedi ifade varyantı çizili");
  ayril(w);
}

(async function () {
  await t1(); await t2(); await t3(); await t4(); await t5(); await t6(); t7(); await t8();
  console.log("\nSonuç: " + gecen + " geçti, " + kalan + " kaldı");
  process.exit(kalan ? 1 : 0);
})().catch(function (e) { console.error(e); process.exit(1); });
