/*
 * SCORM 1.2 sarmalayıcı (Kurumsal Akademi)
 *
 * - LMS API nesnesini (window.API) üst pencerelerde ve opener'da arar.
 * - Her çağrıdan sonra hata kodunu okur ve SCORM.hatalar listesine yazar.
 * - LMS bulunamazsa sessizce çevrimdışı moda geçer; içerik tek başına çalışır.
 * - bitir() yalnızca bir kez LMSFinish çağırır.
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
    if (kod !== "0") {
      hatalar.push({ islem: islem, alan: alan || "", kod: kod });
      return false;
    }
    return true;
  }

  var SCORM = {
    hatalar: hatalar,

    baslat: function () {
      api = apiAra();
      if (!api) { bagli = false; return false; }
      bagli = String(api.LMSInitialize("")) === "true";
      if (!bagli) hataKontrol("LMSInitialize");
      return bagli;
    },

    bagliMi: function () { return bagli; },

    al: function (alan) {
      if (!bagli) return "";
      var deger = String(api.LMSGetValue(alan));
      hataKontrol("LMSGetValue", alan);
      return deger;
    },

    ayarla: function (alan, deger) {
      if (!bagli) return false;
      var sonuc = String(api.LMSSetValue(alan, String(deger))) === "true";
      if (!sonuc) hataKontrol("LMSSetValue", alan);
      return sonuc;
    },

    kaydet: function () {
      if (!bagli) return false;
      var sonuc = String(api.LMSCommit("")) === "true";
      if (!sonuc) hataKontrol("LMSCommit");
      return sonuc;
    },

    bitir: function () {
      if (!bagli || bitirildi) return false;
      bitirildi = true;
      var sonuc = String(api.LMSFinish("")) === "true";
      if (!sonuc) hataKontrol("LMSFinish");
      bagli = false;
      return sonuc;
    },

    /* Milisaniyeyi SCORM 1.2 süre biçimine çevirir: HHHH:MM:SS.SS */
    sureBicimle: function (ms) {
      var toplamSn = Math.max(0, ms) / 1000;
      var sa = Math.floor(toplamSn / 3600);
      var dk = Math.floor((toplamSn % 3600) / 60);
      var sn = toplamSn % 60;
      function iki(n) { return (n < 10 ? "0" : "") + n; }
      return ("0000" + Math.min(sa, 9999)).slice(-4) + ":" + iki(dk) + ":" + iki(Math.floor(sn)) + "." + iki(Math.floor((sn % 1) * 100));
    }
  };

  global.SCORM = SCORM;
})(window);
