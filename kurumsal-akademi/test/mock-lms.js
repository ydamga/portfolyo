/*
 * SCORM 1.2 çalışma zamanı API'sinin (window.API) basit bir taklidi.
 * Gerçek bir LMS değildir; yalnızca veri modeli kurallarını denetler:
 *  - başlatma/bitirme sırası, hata kodları (101, 201, 301, 403, 404, 405)
 *  - lesson_status, exit, score, session_time, suspend_data sınırları
 */
"use strict";

function olustur(baslangic) {
  var veri = Object.assign({
    "cmi.core.student_id": "demo-001",
    "cmi.core.student_name": "Deneme, Kullanıcı",
    "cmi.core.lesson_location": "",
    "cmi.core.credit": "credit",
    "cmi.core.lesson_status": "not attempted",
    "cmi.core.entry": "ab-initio",
    "cmi.core.score.raw": "",
    "cmi.core.score.min": "",
    "cmi.core.score.max": "",
    "cmi.core.total_time": "0000:00:00",
    "cmi.core.exit": "",
    "cmi.core.session_time": "",
    "cmi.suspend_data": "",
    "cmi.launch_data": ""
  }, baslangic || {});

  var salt = ["cmi.core.student_id", "cmi.core.student_name", "cmi.core.credit", "cmi.core.entry", "cmi.core.total_time", "cmi.launch_data"];
  var yalnizYaz = ["cmi.core.exit", "cmi.core.session_time"];
  var durumlar = ["passed", "completed", "failed", "incomplete", "browsed"];
  var cikislar = ["time-out", "suspend", "logout", ""];

  var s = { hata: 0, basladi: false, bitti: false, finishSayisi: 0, commitSayisi: 0, setLog: [], hatalar: [] };

  function hata(kod, ayrinti) { s.hata = kod; if (kod) s.hatalar.push(kod + ":" + (ayrinti || "")); return "false"; }

  var API = {
    LMSInitialize: function () {
      s.hata = 0;
      if (s.basladi) return hata(101, "ikinci initialize");
      s.basladi = true;
      return "true";
    },
    LMSFinish: function () {
      s.hata = 0;
      if (!s.basladi || s.bitti) return hata(301, "finish");
      s.bitti = true;
      s.finishSayisi++;
      return "true";
    },
    LMSGetValue: function (k) {
      s.hata = 0;
      if (!s.basladi || s.bitti) { hata(301, "get " + k); return ""; }
      if (yalnizYaz.indexOf(k) !== -1) { hata(404, "get " + k); return ""; }
      if (!(k in veri)) { hata(201, "get " + k); return ""; }
      return String(veri[k]);
    },
    LMSSetValue: function (k, v) {
      s.hata = 0;
      if (!s.basladi || s.bitti) return hata(301, "set " + k);
      if (salt.indexOf(k) !== -1) return hata(403, "set " + k);
      if (!(k in veri)) return hata(201, "set " + k);
      v = String(v);
      if (k === "cmi.core.lesson_status" && durumlar.indexOf(v) === -1) return hata(405, "status=" + v);
      if (k === "cmi.core.exit" && cikislar.indexOf(v) === -1) return hata(405, "exit=" + v);
      if (/^cmi\.core\.score\.(raw|min|max)$/.test(k)) {
        if (!/^\d+(\.\d+)?$/.test(v) || Number(v) < 0 || Number(v) > 100) return hata(405, k + "=" + v);
      }
      if (k === "cmi.core.session_time" && !/^\d{4}:\d{2}:\d{2}(\.\d{1,2})?$/.test(v)) return hata(405, "session_time=" + v);
      if (k === "cmi.suspend_data" && v.length > 4096) return hata(405, "suspend_data uzunluk " + v.length);
      if (k === "cmi.core.lesson_location" && v.length > 255) return hata(405, "location uzunluk");
      veri[k] = v;
      s.setLog.push([k, v]);
      return "true";
    },
    LMSCommit: function () {
      s.hata = 0;
      if (!s.basladi || s.bitti) return hata(301, "commit");
      s.commitSayisi++;
      return "true";
    },
    LMSGetLastError: function () { return String(s.hata); },
    LMSGetErrorString: function (k) { return "hata " + k; },
    LMSGetDiagnostic: function () { return ""; }
  };

  return { API: API, veri: veri, durum: s };
}

module.exports = { olustur: olustur };
