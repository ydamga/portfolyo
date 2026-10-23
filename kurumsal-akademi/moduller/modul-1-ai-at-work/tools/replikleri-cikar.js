/*
 * Seslendirilecek repliklerin listesini js/icerik.js dosyasından çıkarır.
 *   node tools/replikleri-cikar.js            -> tools/replikler.json ve docs/seslendirme-metni.md yazar
 *   node tools/replikleri-cikar.js --stdout   -> yalnızca JSON'u ekrana yazar
 * Harici bağımlılık yoktur.
 */
"use strict";
var fs = require("fs");
var path = require("path");
var vm = require("vm");

var KOK = path.join(__dirname, "..");
var kod = fs.readFileSync(path.join(KOK, "js", "icerik.js"), "utf8");
var pencere = {};
vm.runInNewContext(kod, { window: pencere, Math: Math });
var IC = pencere.ICERIK;
var liste = IC.replikler();

var AD = { ece: "Ece", mert: "Mert", yonetici: "Yönetici (mesaj)" };
if (process.argv.indexOf("--stdout") >= 0) {
  process.stdout.write(JSON.stringify(liste, null, 2) + "\n");
  process.exit(0);
}

fs.writeFileSync(path.join(__dirname, "replikler.json"), JSON.stringify(liste, null, 2) + "\n", "utf8");

var md = ["# Seslendirme metni", "",
  "Bu dosya `node tools/replikleri-cikar.js` ile `js/icerik.js` içinden üretilir; elle düzenlemeyin.",
  "Her satır tek bir ses dosyasına karşılık gelir (`assets/audio/<kimlik>.mp3`). Metin değişirse sesi yeniden üretin; eski ses otomatik atlanır.",
  "Kurgusal demo: kişiler ve veriler gerçek değildir. Sesler yapay zekâ ile üretilir.", "",
  "Toplam: " + liste.length + " replik · " + liste.reduce(function (n, r) { return n + r.metin.split(/\s+/).length; }, 0) + " kelime", ""];
var sahne = "";
liste.forEach(function (r) {
  if (r.sahne !== sahne) { sahne = r.sahne; md.push("", "## Sahne " + sahne.slice(1), "", "| Kimlik | Kim | Metin |", "|---|---|---|"); }
  md.push("| `" + r.id + "` | " + (AD[r.kim] || r.kim) + " | " + r.metin.replace(/\|/g, "\\|") + " |");
});
fs.writeFileSync(path.join(KOK, "docs", "seslendirme-metni.md"), md.join("\n") + "\n", "utf8");
console.log(liste.length + " replik yazıldı: tools/replikler.json, docs/seslendirme-metni.md");
