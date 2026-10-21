/*
 * SCORM 1.2 iletişim katmanı. Modül mantığı (app.js) bu dosyadaki Koprusu nesnesi dışında
 * LMS ile konuşmaz; LMS yoksa Koprusu sessizce çevrimdışı modda kalır ve modül tek başına çalışır.
 *
 *  SCORM  : düşük seviye API sarmalayıcı (bul, başlat, al, ayarla, kaydet, bitir)
 *  Koprusu: modül durumunu SCORM 1.2 veri modeline çevirir
 *           - lesson_status : passed | failed | incomplete (başarı eşiği)
 *           - score.raw/min/max : en iyi puan (0-100)
 *           - lesson_location : sahne kimliği
 *           - suspend_data : kompakt JSON (app.js üretir; burada boyut ve biçim doğrulanır)
 *           - exit, session_time
 */
(function (global) {
  "use strict";

  var api = null;
  var bagli = false;
  var bitirildi = false;
  var hatalar = [];

  function apiBul(pencere) {
    var deneme = 0;
    while (pencere) {
      if (pencere.API) return pencere.API;
      if (!pencere.parent || pencere.parent === pencere) return null;
      if (++deneme > 500) return null;
      pencere = pencere.parent;
    }
    return null;
  }

  function apiAra() {
    var bulunan = null;
    try { bulunan = apiBul(global); } catch (e) { bulunan = null; }
    if (!bulunan && global.opener) {
      try { bulunan = apiBul(global.opener); } catch (e2) { bulunan = null; }
    }
    return bulunan;
  }

  function hataKontrol(islem, alan) {
    var kod = "0";
    try { kod = String(api.LMSGetLastError()); } catch (e) { kod = "0"; }
    if (kod !== "0") { hatalar.push({ islem: islem, alan: alan || "", kod: kod }); return false; }
    return true;
  }

  var SCORM = {
    hatalar: hatalar,
    baslat: function () {
      api = apiAra();
      if (!api) { bagli = false; return false; }
      try { bagli = String(api.LMSInitialize("")) === "true"; } catch (e) { bagli = false; }
      if (!bagli) hataKontrol("LMSInitialize");
      return bagli;
    },
    bagliMi: function () { return bagli; },
    al: function (alan) {
      if (!bagli) return "";
      var d = String(api.LMSGetValue(alan));
      hataKontrol("LMSGetValue", alan);
      return d;
    },
    ayarla: function (alan, deger) {
      if (!bagli) return false;
      var s = String(api.LMSSetValue(alan, String(deger))) === "true";
      if (!s) hataKontrol("LMSSetValue", alan);
      return s;
    },
    kaydet: function () {
      if (!bagli) return false;
      var s = String(api.LMSCommit("")) === "true";
      if (!s) hataKontrol("LMSCommit");
      return s;
    },
    bitir: function () {
      if (!bagli || bitirildi) return false;
      bitirildi = true;
      var s = String(api.LMSFinish("")) === "true";
      if (!s) hataKontrol("LMSFinish");
      bagli = false;
      return s;
    },
    /* ms -> HHHH:MM:SS.SS */
    sureBicimle: function (ms) {
      var t = Math.max(0, ms) / 1000;
      var sa = Math.floor(t / 3600), dk = Math.floor((t % 3600) / 60), sn = t % 60;
      function iki(n) { return (n < 10 ? "0" : "") + n; }
      return ("0000" + Math.min(sa, 9999)).slice(-4) + ":" + iki(dk) + ":" + iki(Math.floor(sn)) + "." + iki(Math.floor((sn % 1) * 100));
    }
  };

  var SUSPEND_SINIR = 4096;
  var baslangicZamani = Date.now();

  var Koprusu = {
    /*
     * Oturumu başlatır ve LMS'ten gelen devam verisini GÜVENLİ biçimde döndürür.
     * Dönen nesne: { bagli, konum, veri, durum, puan }  (veri: ayrıştırılmış JSON ya da null)
     */
    baslat: function () {
      baslangicZamani = Date.now();
      if (!SCORM.baslat()) return { bagli: false, konum: "", veri: null, durum: "", puan: null };

      var durum = SCORM.al("cmi.core.lesson_status");
      if (durum === "" || durum === "not attempted") {
        SCORM.ayarla("cmi.core.lesson_status", "incomplete");
        durum = "incomplete";
      }
      var konum = SCORM.al("cmi.core.lesson_location");
      var ham = SCORM.al("cmi.suspend_data");
      var veri = null;
      if (ham && ham.length <= SUSPEND_SINIR) {
        try {
          var cozulen = JSON.parse(ham);
          if (cozulen && typeof cozulen === "object" && !Array.isArray(cozulen)) veri = cozulen;
        } catch (e) { veri = null; }
      }
      var puan = parseFloat(SCORM.al("cmi.core.score.raw"));
      if (!isFinite(puan) || puan < 0 || puan > 100) puan = null;
      return { bagli: true, konum: String(konum || "").slice(0, 64), veri: veri, durum: durum, puan: puan };
    },

    /*
     * d = { konum, veriMetin, deneme, enIyi, gecti }
     * Başarı eşiği (gecti) ile tamamlama ayrıdır; 1.2'de tek durum alanı olduğundan
     * "tamamladı ama başaramadı" failed olarak raporlanır.
     */
    kaydet: function (d) {
      if (!SCORM.bagliMi()) return false;
      SCORM.ayarla("cmi.core.lesson_location", String(d.konum || "").slice(0, 255));
      var metin = String(d.veriMetin || "");
      if (metin.length <= SUSPEND_SINIR) SCORM.ayarla("cmi.suspend_data", metin);
      if (d.deneme > 0 && d.enIyi >= 0) {
        SCORM.ayarla("cmi.core.score.min", "0");
        SCORM.ayarla("cmi.core.score.max", "100");
        SCORM.ayarla("cmi.core.score.raw", String(Math.max(0, Math.min(100, Math.round(d.enIyi)))));
      }
      var durum = d.gecti ? "passed" : (d.deneme > 0 ? "failed" : "incomplete");
      SCORM.ayarla("cmi.core.lesson_status", durum);
      SCORM.ayarla("cmi.core.exit", d.gecti ? "" : "suspend");
      return SCORM.kaydet();
    },

    bitir: function (d) {
      if (!SCORM.bagliMi()) return false;
      Koprusu.kaydet(d);
      SCORM.ayarla("cmi.core.session_time", SCORM.sureBicimle(Date.now() - baslangicZamani));
      SCORM.kaydet();
      return SCORM.bitir();
    },

    bagliMi: function () { return SCORM.bagliMi(); },
    hatalar: SCORM.hatalar
  };

  global.SCORM = SCORM;
  global.Koprusu = Koprusu;
})(window);
