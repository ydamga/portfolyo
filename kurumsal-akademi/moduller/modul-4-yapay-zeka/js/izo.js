/* Modül 4 görselleri: kodla çizilen izometrik illüstrasyonlar (dış dosya yok).
   Karakter ve sahneler özgündür; herhangi bir mevcut çizime dayanmaz. */
(function (global) {
  "use strict";

  var sayac = 0;
  var U = 30, OX = 240, OY = 262;

  function P(x, y, z) { return [OX + (x - y) * 0.866 * U, OY + (x + y) * 0.5 * U - z * U]; }
  function pts(arr) { return arr.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" "); }
  function poly(arr, fill, stroke, extra) {
    return '<polygon points="' + pts(arr) + '" fill="' + fill + '"' + (stroke ? ' stroke="' + stroke + '" stroke-width="1.2" stroke-linejoin="round"' : "") + (extra || "") + "/>";
  }

  var RENK = {
    mavi: ["#6f9bff", "#3f63e0", "#2a45b0"],
    cyan: ["#7ff0ff", "#33b9de", "#2189b5"],
    mor: ["#a78bff", "#6f55e0", "#4c38b0"],
    zemin: ["#34308f", "#26236e", "#1b1950"],
    pembe: ["#ff7fbd", "#e0508f", "#a93868"]
  };

  function kup(x, y, z, w, d, h, c, op) {
    var t = [P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)];
    var l = [P(x, y + d, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x, y + d, z + h)];
    var r = [P(x + w, y, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x + w, y, z + h)];
    var o = op ? ' opacity="' + op + '"' : "";
    return "<g" + o + ">" + poly(l, c[1]) + poly(r, c[2]) + poly(t, c[0]) + "</g>";
  }

  function silindir(x, y, z, r, h, c) {
    var m = P(x, y, z), u = P(x, y, z + h);
    var rx = 1.2247 * r * U * 0.866 / 0.866 * 0.866, ry = 0.7071 * r * U * 0.866;
    rx = r * U * 1.06; ry = r * U * 0.61;
    return '<path d="M' + (m[0] - rx) + " " + m[1] + "L" + (u[0] - rx) + " " + u[1] + "L" + (u[0] + rx) + " " + u[1] + "L" + (m[0] + rx) + " " + m[1] + 'Z" fill="' + c[1] + '"/>' +
      '<ellipse cx="' + m[0] + '" cy="' + m[1] + '" rx="' + rx + '" ry="' + ry + '" fill="' + c[1] + '"/>' +
      '<rect x="' + (m[0] - rx) + '" y="' + u[1] + '" width="' + (rx * 2) + '" height="' + (m[1] - u[1]) + '" fill="' + c[1] + '"/>' +
      '<rect x="' + (m[0]) + '" y="' + u[1] + '" width="' + rx + '" height="' + (m[1] - u[1]) + '" fill="' + c[2] + '" opacity=".6"/>' +
      '<ellipse cx="' + u[0] + '" cy="' + u[1] + '" rx="' + rx + '" ry="' + ry + '" fill="' + c[0] + '"/>';
  }

  function kure(x, y, z, r, id, c) {
    var p = P(x, y, z);
    return '<defs><radialGradient id="' + id + '" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="' + c[0] + '"/><stop offset="1" stop-color="' + c[2] + '"/></radialGradient></defs>' +
      '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + (r * U) + '" fill="url(#' + id + ')"/>';
  }

  /* Düzlemler: XZ (y sabit) ve YZ (x sabit) */
  function duzlemXZ(x0, y0, z0) { return function (u, v) { return P(x0 + u, y0, z0 + v); }; }
  function duzlemYZ(x0, y0, z0) { return function (u, v) { return P(x0, y0 + u, z0 + v); }; }

  function cam(f, w, h, icerik, aktif) {
    var cerceve = [f(0, 0), f(w, 0), f(w, h), f(0, h)];
    var s = poly(cerceve, "rgba(91,231,255,.14)", aktif ? "#9ff6ff" : "#5be7ff", ' filter="url(#parla)"');
    return s + (icerik || "");
  }
  function cubuklar(f, w, h) {
    var s = "", n = 4;
    for (var i = 0; i < n; i++) {
      var bw = w / (n * 1.6), x = w * 0.12 + i * (w * 0.8 / n), bh = h * (0.25 + 0.17 * i);
      s += poly([f(x, h * 0.1), f(x + bw, h * 0.1), f(x + bw, h * 0.1 + bh), f(x, h * 0.1 + bh)], "#7ff0ff", null, ' opacity=".85"');
    }
    return s;
  }
  function satirlar(f, w, h, n) {
    var s = "";
    for (var i = 0; i < n; i++) {
      var v = h * (0.85 - i * (0.7 / n));
      s += poly([f(w * 0.1, v), f(w * (i % 2 ? 0.7 : 0.88), v), f(w * (i % 2 ? 0.7 : 0.88), v - h * 0.05), f(w * 0.1, v - h * 0.05)], "#bff7ff", null, ' opacity=".8"');
    }
    return s;
  }

  function insan(cx, taban, olcek, renk) {
    var k = renk || {};
    var takim = k.takim || "#2b43a8", takimK = k.takimK || "#1f3282", gomlek = k.gomlek || "#e9f3ff", kravat = k.kravat || "#ff4fa3", sac = k.sac || "#22b8f0", ten = k.ten || "#f2c9a8";
    return '<g transform="translate(' + cx + " " + taban + ") scale(" + olcek + ')">' +
      '<ellipse cx="0" cy="2" rx="46" ry="11" fill="#0b0a2a" opacity=".5"/>' +
      '<path d="M-22 -118 L-26 -8 L-8 -8 L0 -90 L8 -8 L26 -8 L22 -118Z" fill="' + takimK + '"/>' +
      '<rect x="-30" y="-6" width="24" height="9" rx="4" fill="#12163a"/><rect x="6" y="-6" width="24" height="9" rx="4" fill="#12163a"/>' +
      '<path d="M-34 -230 Q-40 -176 -30 -118 L30 -118 Q40 -176 34 -230 Q20 -246 0 -246 Q-20 -246 -34 -230Z" fill="' + takim + '"/>' +
      '<path d="M-12 -240 L0 -190 L12 -240 L8 -246 L-8 -246Z" fill="' + gomlek + '"/>' +
      '<path d="M0 -236 L-5 -222 L0 -170 L5 -222Z" fill="' + kravat + '"/>' +
      '<path d="M-34 -226 Q-52 -190 -44 -140 L-32 -140 Q-36 -186 -26 -214Z" fill="' + takimK + '"/>' +
      '<path d="M34 -226 Q52 -190 44 -140 L32 -140 Q36 -186 26 -214Z" fill="' + takimK + '"/>' +
      '<rect x="-48" y="-146" width="14" height="12" rx="6" fill="' + ten + '"/><rect x="34" y="-146" width="14" height="12" rx="6" fill="' + ten + '"/>' +
      '<rect x="-7" y="-258" width="14" height="14" fill="' + ten + '"/>' +
      '<ellipse cx="0" cy="-282" rx="21" ry="25" fill="' + ten + '"/>' +
      '<path d="M-23 -286 Q-22 -312 0 -312 Q24 -312 23 -284 Q14 -300 -2 -299 Q-16 -298 -23 -286Z" fill="' + sac + '"/>' +
      "</g>";
  }

  function tablet(cx, taban, olcek) {
    return '<g transform="translate(' + cx + " " + taban + ") scale(" + olcek + ')"><rect x="22" y="-184" width="50" height="36" rx="5" transform="rotate(-12 22 -184)" fill="#101a3d" stroke="#7ff0ff" stroke-width="2"/>' +
      '<path d="M32 -172 l8 -3 l8 2 l8 -5" transform="rotate(-12 22 -184)" stroke="#7ff0ff" stroke-width="2" fill="none"/></g>';
  }

  function platform(x0, y0, w, d) {
    return kup(x0, y0, 0, w, d, 0.7, RENK.zemin) + kup(x0 + 0.15, y0 + 0.15, 0.7, w - 0.3, d - 0.3, 0.12, RENK.mor, 0.55);
  }

  function ortak() {
    var id = "izo" + (++sayac);
    return {
      id: id,
      defs: '<defs><filter id="parla" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
        '<linearGradient id="' + id + 'z" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a2a58"/><stop offset="1" stop-color="#101a36"/></linearGradient></defs>'
    };
  }

  function yildizlar() {
    var s = "";
    [[40, 60], [120, 30], [420, 80], [450, 190], [60, 300], [430, 330], [310, 22]].forEach(function (p, i) {
      s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + (1.4 + (i % 3) * .5) + '" fill="#7ff0ff" opacity="' + (0.35 + (i % 3) * .15) + '"/>';
    });
    return s;
  }

  function svg(ic, etiket, genis) {
    var o = ortak();
    return '<svg viewBox="' + (genis ? "30 10 490 390" : "40 10 400 390") + '" role="img" aria-label="' + etiket + '" focusable="false">' + o.defs + yildizlar() + ic(o) + "</svg>";
  }

  var SAHNELER = {
    /* 1 Problem: figür, soru işaretli sohbet paneli */
    problem: function () {
      return svg(function (o) {
        var f = duzlemXZ(-3.2, -2.2, 1.6);
        return platform(-3.4, -3.4, 6.8, 6.8) +
          kup(-2.6, 0.6, 0.8, 1.2, 1.2, 1.2, RENK.mavi) + kure(2.5, -1.2, 1.6, 0.8, o.id + "a", RENK.mor) +
          cam(f, 3.2, 3.2, satirlar(f, 3.2, 3.2, 4) + '<text x="' + f(2.4, 1.2)[0] + '" y="' + f(2.4, 1.2)[1] + '" font-size="34" font-weight="700" fill="#ffd166">?</text>') +
          insan(240, 252, 0.7) + tablet(240, 252, 0.7);
      }, "İzometrik sahne: belirsiz isteğe yanıt veren holografik panel ve ayakta duran bir çalışan");
    },
    /* 2 Hedefler: basamaklar, hedef ve bayrak */
    hedef: function () {
      return svg(function (o) {
        return platform(-3.4, -3.4, 6.8, 6.8) +
          kup(-2.6, -2, 0.8, 2, 2, 0.9, RENK.mavi) + kup(-0.6, -2, 0.8, 2, 2, 1.8, RENK.cyan) + kup(1.4, -2, 0.8, 2, 2, 2.7, RENK.mor) +
          '<line x1="' + P(2.4, -1, 3.5)[0] + '" y1="' + P(2.4, -1, 3.5)[1] + '" x2="' + P(2.4, -1, 5.7)[0] + '" y2="' + P(2.4, -1, 5.7)[1] + '" stroke="#e9f3ff" stroke-width="3"/>' +
          '<path d="M' + P(2.4, -1, 5.7)[0] + " " + P(2.4, -1, 5.7)[1] + "l34 10l-34 12z\" fill=\"#ff4fa3\"/>" +
          '<ellipse cx="' + P(-1.6, 1.8, 0.9)[0] + '" cy="' + P(-1.6, 1.8, 0.9)[1] + '" rx="52" ry="30" fill="none" stroke="#7ff0ff" stroke-width="3" filter="url(#parla)"/>' +
          '<ellipse cx="' + P(-1.6, 1.8, 0.9)[0] + '" cy="' + P(-1.6, 1.8, 0.9)[1] + '" rx="30" ry="17" fill="none" stroke="#a78bff" stroke-width="3"/>' +
          '<ellipse cx="' + P(-1.6, 1.8, 0.9)[0] + '" cy="' + P(-1.6, 1.8, 0.9)[1] + '" rx="9" ry="5" fill="#ff4fa3"/>';
      }, "İzometrik sahne: üç basamak, hedef tahtası ve bayrak");
    },
    /* 3 Bileşenler: dört cam katman; aktif olan parlar */
    katman: function (aktif) {
      var adlar = ["Rol ve bağlam", "Görev", "Girdi ve kısıtlar", "Çıktı biçimi"];
      var renk = [RENK.mor, RENK.mavi, RENK.cyan, RENK.pembe];
      return svg(function () {
        var s = platform(-3.4, -3.4, 6.8, 6.8);
        for (var i = 0; i < 4; i++) {
          var on = aktif === i || aktif === -1;
          s += kup(-2.2, -2.2, 1 + i * 1.15, 4.4, 4.4, 0.45, renk[i], on ? 0.95 : 0.35);
          var p = P(2.2, -2.2, 1.2 + i * 1.15);
          s += '<line x1="' + (p[0] + 6) + '" y1="' + p[1] + '" x2="' + (p[0] + 28) + '" y2="' + p[1] + '" stroke="' + (on ? "#e9f3ff" : "#5d6aa8") + '" stroke-width="1.5"/>' +
            '<text x="' + (p[0] + 32) + '" y="' + (p[1] + 4) + '" font-size="13" font-weight="' + (aktif === i ? 700 : 400) + '" fill="' + (on ? "#e9f3ff" : "#9aa6dc") + '">' + adlar[i] + "</text>";
        }
        return s;
      }, "İzometrik sahne: dört katmanlı istem yapısı" + (aktif >= 0 ? ", vurgulanan: " + adlar[aktif] : ""), true);
    },
    /* 4 Karşılaştırma: iki belge, soru işareti ve onay */
    karsilastir: function () {
      return svg(function () {
        var fa = duzlemXZ(-3.2, -2, 0.9), fb = duzlemYZ(2.2, -3.4, 0.9);
        return platform(-3.4, -3.4, 6.8, 6.8) +
          cam(fa, 3, 3.4, satirlar(fa, 3, 3.4, 3), false) + cam(fb, 3, 3.4, satirlar(fb, 3, 3.4, 5), true) +
          '<text x="' + fa(1.5, 1.6)[0] + '" y="' + fa(1.5, 1.6)[1] + '" font-size="40" font-weight="700" fill="#ffd166" text-anchor="middle">?</text>' +
          '<path d="M' + (fb(1.2, 1.5)[0] - 18) + " " + fb(1.2, 1.5)[1] + "l13 14l26 -30\" fill=\"none\" stroke=\"#6bf0a8\" stroke-width=\"7\" stroke-linecap=\"round\" stroke-linejoin=\"round\" filter=\"url(#parla)\"/>" +
          kure(0.2, 1.8, 1.2, 0.6, "k" + sayac, RENK.mor);
      }, "İzometrik sahne: geliştirilebilir ve güçlü istemin iki çıktı paneli");
    },
    /* 5 Atölye: kalite katmanları (n: iyi seçim sayısı) */
    atolye: function (n) {
      return svg(function () {
        var s = platform(-3.4, -3.4, 6.8, 6.8);
        var renk = [RENK.mor, RENK.mavi, RENK.cyan, RENK.pembe];
        for (var i = 0; i < 4; i++) {
          s += kup(-1.6, -1.6, 1 + i * 1.0, 3.2, 3.2, 0.5, renk[i], i < n ? 0.95 : 0.22);
        }
        s += '<text x="240" y="64" font-size="15" text-anchor="middle" font-weight="700" fill="#e9f3ff">İstem kalitesi: ' + n + "/4</text>";
        var m = duzlemXZ(-3.2, 1.8, 1.2);
        s += cam(m, 2.4, 2.4, cubuklar(m, 2.4, 2.4), n >= 3);
        return s;
      }, "İzometrik sahne: istem kalitesi " + n + " / 4 katman");
    },
    /* 6 Doğrula: büyüteç ve belge */
    dogrula: function () {
      return svg(function () {
        var f = duzlemXZ(-2.6, -2.6, 0.8);
        var c = P(1.6, 0.6, 3.2);
        return platform(-3.4, -3.4, 6.8, 6.8) +
          cam(f, 3.6, 4.2, satirlar(f, 3.6, 4.2, 6)) +
          '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="46" fill="rgba(127,240,255,.12)" stroke="#e9f3ff" stroke-width="7" filter="url(#parla)"/>' +
          '<line x1="' + (c[0] + 33) + '" y1="' + (c[1] + 33) + '" x2="' + (c[0] + 76) + '" y2="' + (c[1] + 76) + '" stroke="#e9f3ff" stroke-width="11" stroke-linecap="round"/>' +
          '<path d="M' + (c[0] - 18) + " " + c[1] + 'l13 14l26 -30" fill="none" stroke="#6bf0a8" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>' +
          kup(1.6, 1.6, 0.8, 1.3, 1.3, 0.8, RENK.mavi);
      }, "İzometrik sahne: belgeyi büyüteçle kaynakla karşılaştırma");
    },
    /* 7 Gizlilik: kalkan ve kilit */
    gizlilik: function () {
      return svg(function () {
        var c = P(0, 0, 3.8);
        return platform(-3.4, -3.4, 6.8, 6.8) +
          kup(-1.6, -1.6, 0.8, 3.2, 3.2, 1.2, RENK.mavi) +
          '<path d="M' + c[0] + " " + (c[1] - 74) + "l62 22v52q0 52 -62 78q-62 -26 -62 -78v-52z\" fill=\"rgba(127,240,255,.18)\" stroke=\"#7ff0ff\" stroke-width=\"4\" filter=\"url(#parla)\"/>" +
          '<rect x="' + (c[0] - 20) + '" y="' + (c[1] - 16) + '" width="40" height="34" rx="6" fill="#e9f3ff"/>' +
          '<path d="M' + (c[0] - 12) + " " + (c[1] - 16) + "v-11a12 12 0 0 1 24 0v11\" fill=\"none\" stroke=\"#e9f3ff\" stroke-width=\"6\"/>" +
          '<circle cx="' + c[0] + '" cy="' + (c[1] + 2) + '" r="5" fill="#2b43a8"/>' +
          kure(2.3, 2.0, 1.6, 0.7, "g" + sayac, RENK.pembe);
      }, "İzometrik sahne: veriyi koruyan kalkan ve kilit");
    },
    /* 8 Eylem planı: basamaklar, bayrak ve çalışan */
    eylem: function () {
      return svg(function () {
        return platform(-3.4, -3.4, 6.8, 6.8) +
          kup(0.4, -2.4, 0.8, 2.6, 2.6, 0.9, RENK.mavi) + kup(0.4, -2.4, 1.7, 1.6, 1.6, 0.9, RENK.cyan) +
          '<line x1="' + P(0.9, -1.9, 2.6)[0] + '" y1="' + P(0.9, -1.9, 2.6)[1] + '" x2="' + P(0.9, -1.9, 4.8)[0] + '" y2="' + P(0.9, -1.9, 4.8)[1] + '" stroke="#e9f3ff" stroke-width="3"/>' +
          '<path d="M' + P(0.9, -1.9, 4.8)[0] + " " + P(0.9, -1.9, 4.8)[1] + 'l34 10l-34 12z" fill="#6bf0a8"/>' +
          insan(166, 252, 0.7, { sac: "#a78bff", kravat: "#6bf0a8" }) + kure(2.4, 1.6, 1.4, 0.7, "e" + sayac, RENK.mor);
      }, "İzometrik sahne: basamaklar, bayrak ve ilerleyen çalışan");
    }
  };

  global.Izo = { sahne: function (ad, arg) { return SAHNELER[ad](arg); } };
})(window);
