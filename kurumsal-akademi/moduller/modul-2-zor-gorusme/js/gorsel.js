/*
 * Modül 2 görsel sistemi: SVG karakterler (Selin, Elif), ofis sahnesi ve simgeler.
 * Dış görsel, yazı tipi veya kütüphane kullanılmaz; her şey bu dosyada çizilir.
 */
(function (global) {
  "use strict";

  var sayac = 0;

  var KISILER = {
    selin: {
      ad: "Selin", unvan: "İK İş Ortağı",
      ten: ["#fff0e4", "#f5cdb0", "#d9a07f"],
      sac: ["#1f130d", "#4a3122", "#8a6244"],
      iris: ["#8b5a35", "#4b2f1d"],
      stil: "kusa", giyim: "ceket",
      ana: ["#3d86f5", "#2559cf", "#142f78"],
      ruj: "#b4455a"
    },
    elif: {
      ad: "Elif", unvan: "Satış Operasyon Analisti",
      ten: ["#f6d6bc", "#e0a582", "#b87b57"],
      sac: ["#120b09", "#2f1e18", "#6a4636"],
      iris: ["#6b4128", "#2b1a10"],
      stil: "uzun", giyim: "kazak",
      ana: ["#cc5384", "#a03459", "#5f1d38"],
      ruj: "#9c3a4e"
    }
  };

  /* Brow yolları ve ağız: sol/sağ kaş, ağız çizgisi, göz açıklığı, yanak, bakış */
  var IFADELER = {
    notr:    { kasS: "M108 106 Q123 99 139 104",  kasD: "M161 104 Q177 99 192 106",  agiz: "M138 170 Q150 173 162 170", agizTur: "cizgi", ry: 8.4, yanak: 0.20, bak: [0, 0] },
    gulumse: { kasS: "M108 104 Q123 96 139 102",  kasD: "M161 102 Q177 96 192 104",  agiz: "M135 167 Q150 181 165 167", agizTur: "gulus", ry: 7.4, yanak: 0.34, bak: [0, 0] },
    endise:  { kasS: "M108 109 Q124 104 139 95",  kasD: "M161 95 Q176 104 192 109",  agiz: "M139 174 Q150 166 161 174", agizTur: "cizgi", ry: 8.8, yanak: 0.16, bak: [0, 1] },
    savunma: { kasS: "M108 99 Q124 100 139 107",  kasD: "M161 107 Q176 100 192 99",  agiz: "M141 171 L159 171",        agizTur: "duz",   ry: 6.2, yanak: 0.10, bak: [-1, 0] },
    kapali:  { kasS: "M108 108 Q124 106 139 100", kasD: "M161 100 Q176 106 192 108", agiz: "M141 174 Q150 169 159 174", agizTur: "cizgi", ry: 6.6, yanak: 0.10, bak: [-2, 3] },
    rahat:   { kasS: "M108 105 Q123 98 139 103",  kasD: "M161 103 Q177 98 192 105",  agiz: "M137 168 Q150 177 163 168", agizTur: "cizgi", ry: 8.0, yanak: 0.28, bak: [0, 0] }
  };

  function goz(id, cx, ry, k, bak) {
    var cy = 124, rx = 13;
    var ix = cx + bak[0], iy = cy + bak[1];
    var klip = id + "-c" + cx;
    return '<g class="goz">' +
      '<clipPath id="' + klip + '"><ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '"/></clipPath>' +
      '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="#f7f9fd"/>' +
      '<g clip-path="url(#' + klip + ')">' +
      '<circle cx="' + ix + '" cy="' + iy + '" r="7.4" fill="url(#' + id + '-iris)"/>' +
      '<circle cx="' + ix + '" cy="' + iy + '" r="3.5" fill="#0b0706"/>' +
      '<circle cx="' + (ix + 2.4) + '" cy="' + (iy - 2.6) + '" r="2" fill="#fff" opacity=".95"/>' +
      '<circle cx="' + (ix - 2.4) + '" cy="' + (iy + 2.6) + '" r="1" fill="#fff" opacity=".6"/>' +
      '<rect x="' + (cx - rx) + '" y="' + (cy - ry) + '" width="' + (rx * 2) + '" height="' + (ry * 0.9) + '" fill="url(#' + id + '-lid)"/>' +
      "</g>" +
      '<path d="M' + (cx - rx - 1) + " " + (cy + 0.5) + " Q" + cx + " " + (cy - ry * 1.55) + " " + (cx + rx + 1) + " " + (cy + 0.5) + '" fill="none" stroke="#150d0a" stroke-width="2.7" stroke-linecap="round"/>' +
      '<path d="M' + (cx + rx - 1) + " " + (cy - 1) + " l 4 -3" + '" stroke="#150d0a" stroke-width="1.8" stroke-linecap="round" fill="none"/>' +
      '<path d="M' + (cx - rx + 2) + " " + (cy + ry * 0.9) + " Q" + cx + " " + (cy + ry * 1.6) + " " + (cx + rx - 2) + " " + (cy + ry * 0.9) + '" fill="none" stroke="' + k.ten[2] + '" stroke-width="1" opacity=".55"/>' +
      '<path d="M' + (cx - rx + 1) + " " + (cy - ry - 3) + " Q" + cx + " " + (cy - ry * 2.2 - 3) + " " + (cx + rx - 1) + " " + (cy - ry - 3) + '" fill="none" stroke="' + k.ten[2] + '" stroke-width="1.3" opacity=".5"/>' +
      "</g>";
  }

  function agiz(k, e) {
    if (e.agizTur === "gulus") {
      return '<path d="' + e.agiz + ' Q150 172 135 167 Z" fill="#a8334b"/>' +
        '<path d="M139 168.5 Q150 175 161 168.5 Q150 171.5 139 168.5 Z" fill="#fdfdfd"/>' +
        '<path d="' + e.agiz + '" fill="none" stroke="' + k.ruj + '" stroke-width="2.6" stroke-linecap="round"/>';
    }
    if (e.agizTur === "duz") {
      return '<path d="' + e.agiz + '" stroke="' + k.ruj + '" stroke-width="3.4" stroke-linecap="round" fill="none"/>';
    }
    return '<path d="' + e.agiz + '" fill="none" stroke="' + k.ruj + '" stroke-width="3" stroke-linecap="round"/>' +
      '<path d="M143 ' + (e.agiz.indexOf("Q150 17") > -1 ? 176 : 175) + ' Q150 179 157 ' + (e.agiz.indexOf("Q150 17") > -1 ? 176 : 175) + '" fill="none" stroke="#fff" stroke-width="1" opacity=".0"/>';
  }

  function arkaSac(k, id) {
    var g = "url(#" + id + "-sac)";
    if (k.stil === "kusa") {
      return '<path d="M84 126 C76 62 116 36 150 36 C188 36 226 62 216 126 C216 162 220 192 213 214 C190 226 110 226 87 214 C80 192 84 162 84 126 Z" fill="' + g + '"/>';
    }
    return '<path d="M82 128 C72 64 114 34 150 34 C190 34 228 64 218 128 C230 196 244 258 230 338 C200 352 100 352 70 338 C56 258 70 196 82 128 Z" fill="' + g + '"/>';
  }

  function onSac(k, id) {
    var g = "url(#" + id + "-sac)";
    var vurgu = k.sac[2];
    if (k.stil === "kusa") {
      return '<path d="M97 128 C90 80 118 52 152 52 C190 52 212 82 203 128 C199 104 188 90 170 84 C150 98 126 94 112 80 C103 92 99 110 97 128 Z" fill="' + g + '"/>' +
        '<path d="M90 120 C80 154 86 188 102 212 C114 190 114 152 112 112 Z" fill="' + g + '"/>' +
        '<path d="M210 120 C220 154 214 188 198 212 C186 190 186 152 188 112 Z" fill="' + g + '"/>' +
        '<path d="M120 66 C140 56 168 58 186 72" fill="none" stroke="' + vurgu + '" stroke-width="3" stroke-linecap="round" opacity=".55"/>' +
        '<path d="M100 150 C98 172 102 192 108 204" fill="none" stroke="' + vurgu + '" stroke-width="2.4" stroke-linecap="round" opacity=".4"/>' +
        '<path d="M200 150 C202 172 198 192 192 204" fill="none" stroke="' + vurgu + '" stroke-width="2.4" stroke-linecap="round" opacity=".35"/>';
    }
    return '<path d="M97 130 C88 80 118 50 150 50 C184 50 214 80 203 130 C197 100 176 80 150 72 C124 80 103 100 97 130 Z" fill="' + g + '"/>' +
      '<path d="M122 62 C142 54 168 56 184 68" fill="none" stroke="' + vurgu + '" stroke-width="3" stroke-linecap="round" opacity=".5"/>';
  }

  function onSacUzun(k, id) {
    var g = "url(#" + id + "-sac)";
    return '<path d="M92 126 C78 176 84 236 70 308 C98 290 112 214 112 130 Z" fill="' + g + '"/>' +
      '<path d="M208 126 C222 176 216 236 230 308 C202 290 188 214 188 130 Z" fill="' + g + '"/>' +
      '<path d="M96 200 C94 240 90 268 82 296" fill="none" stroke="' + k.sac[2] + '" stroke-width="2.6" stroke-linecap="round" opacity=".4"/>' +
      '<path d="M204 200 C206 240 210 268 218 296" fill="none" stroke="' + k.sac[2] + '" stroke-width="2.6" stroke-linecap="round" opacity=".35"/>';
  }

  var TORSO = "M26 500 L26 440 C26 350 40 306 92 288 L126 276 C136 283 164 283 174 276 L208 288 C260 306 274 350 274 440 L274 500 Z";
  var KAYDIR = 'transform="translate(0,-40)"';

  /* Gövdenin alt katmanı: gövde + (ceket için) gömlek */
  function govdeAlt(k, id) {
    var s = "<g " + KAYDIR + '><path d="' + TORSO + '" fill="url(#' + id + '-ana)"/>';
    if (k.giyim === "ceket") {
      s += '<path d="M122 268 L150 400 L178 268 Z" fill="url(#' + id + '-bluz)"/>';
    } else {
      s += '<path d="M58 332 C48 384 48 414 50 460" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="2"/>' +
        '<path d="M242 332 C252 384 252 414 250 460" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="2"/>' +
        '<path d="M70 330 C100 322 120 340 130 372 M230 330 C200 322 180 340 170 372" fill="none" stroke="rgba(255,255,255,.14)" stroke-width="3" stroke-linecap="round"/>';
    }
    return s + "</g>";
  }

  /* Gövdenin üst katmanı: yaka, kolye, ışık vurgusu (boyundan sonra çizilir) */
  function govdeUst(k, id) {
    var s = "<g " + KAYDIR + ">";
    if (k.giyim === "ceket") {
      s += '<path d="M126 276 L92 292 L114 356 L150 404 L134 326 Z" fill="' + k.ana[2] + '" stroke="rgba(255,255,255,.38)" stroke-width="1.4" stroke-linejoin="round"/>' +
        '<path d="M174 276 L208 292 L186 356 L150 404 L166 326 Z" fill="' + k.ana[2] + '" stroke="rgba(255,255,255,.38)" stroke-width="1.4" stroke-linejoin="round"/>' +
        '<path d="M150 404 L150 500" stroke="' + k.ana[2] + '" stroke-width="2" opacity=".7"/>' +
        '<circle cx="150" cy="424" r="3.6" fill="' + k.ana[2] + '" stroke="rgba(255,255,255,.45)" stroke-width="1"/>';
    } else {
      s += '<path d="M116 278 C128 316 172 316 184 278" fill="none" stroke="' + k.ana[0] + '" stroke-width="9" stroke-linecap="round"/>' +
        '<path d="M116 278 C128 316 172 316 184 278" fill="none" stroke="rgba(255,255,255,.24)" stroke-width="2" stroke-linecap="round"/>' +
        '<path d="M131 292 Q150 324 169 292" fill="none" stroke="#e8c36a" stroke-width="1.2"/>' +
        '<circle cx="150" cy="320" r="4.4" fill="#f1d27c" stroke="#b8923a" stroke-width="1"/>';
    }
    s += '<path d="' + TORSO + '" fill="url(#' + id + '-rim)"/>' +
      '<path d="M40 332 C60 306 84 296 108 292" fill="none" stroke="rgba(255,255,255,.3)" stroke-width="5" stroke-linecap="round"/>' +
      '<path d="M26 440 C26 350 40 306 92 288 L126 276" fill="none" stroke="rgba(0,0,0,.12)" stroke-width="2"/>';
    return s + "</g>";
  }

  function boyun(k, id) {
    var alt = k.giyim === "kazak"
      ? "L127 226 C127 266 173 266 173 226"
      : "L127 224 L150 268 L173 224";
    return '<path d="M127 178 ' + alt + ' L173 178 Z" fill="url(#' + id + '-boyun)"/>' +
      '<path d="M127 188 Q150 218 173 188 L173 206 Q150 232 127 206 Z" fill="' + k.ten[2] + '" opacity=".6"/>';
  }

  /* Tam karakter ya da yakın çekim (yüz) SVG'si */
  function karakter(kisi, ifade, secenek) {
    var k = KISILER[kisi];
    var e = IFADELER[ifade] || IFADELER.notr;
    var o = secenek || {};
    var id = "k" + (++sayac);
    var gor = k.stil === "kusa" ? "0 0 300 440" : "0 0 300 440";
    if (o.yakin) gor = "62 28 176 190";

    var defs =
      '<defs>' +
      '<radialGradient id="' + id + '-ten" cx="38%" cy="30%" r="80%"><stop offset="0" stop-color="' + k.ten[0] + '"/><stop offset=".6" stop-color="' + k.ten[1] + '"/><stop offset="1" stop-color="' + k.ten[2] + '"/></radialGradient>' +
      '<linearGradient id="' + id + '-boyun" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="' + k.ten[1] + '"/><stop offset=".5" stop-color="' + k.ten[0] + '"/><stop offset="1" stop-color="' + k.ten[2] + '"/></linearGradient>' +
      '<linearGradient id="' + id + '-sac" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + k.sac[1] + '"/><stop offset=".5" stop-color="' + k.sac[0] + '"/><stop offset="1" stop-color="' + k.sac[1] + '"/></linearGradient>' +
      '<linearGradient id="' + id + '-ana" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + k.ana[0] + '"/><stop offset=".55" stop-color="' + k.ana[1] + '"/><stop offset="1" stop-color="' + k.ana[2] + '"/></linearGradient>' +
      '<linearGradient id="' + id + '-bluz" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#cfd9ee"/></linearGradient>' +
      '<linearGradient id="' + id + '-rim" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8fe8ff" stop-opacity="0"/><stop offset=".7" stop-color="#8fe8ff" stop-opacity="0"/><stop offset="1" stop-color="#6fe3ff" stop-opacity=".22"/></linearGradient>' +
      '<radialGradient id="' + id + '-iris" cx="50%" cy="40%" r="60%"><stop offset="0" stop-color="' + k.iris[0] + '"/><stop offset="1" stop-color="' + k.iris[1] + '"/></radialGradient>' +
      '<linearGradient id="' + id + '-lid" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + k.ten[2] + '" stop-opacity=".55"/><stop offset="1" stop-color="' + k.ten[2] + '" stop-opacity="0"/></linearGradient>' +
      '</defs>';

    var BAS = 'transform="translate(150 192) scale(1.12) translate(-150 -192)"';
    var ust = '<g ' + BAS + '>' + arkaSac(k, id) + "</g>";
    if (!o.yakin) ust += govdeAlt(k, id);
    ust += boyun(k, id);
    if (!o.yakin) ust += govdeUst(k, id);

    var yuz =
      '<path d="M150 55 C112 55 96 90 98 128 C100 166 122 193 150 193 C178 193 200 166 202 128 C204 90 188 55 150 55 Z" fill="url(#' + id + '-ten)"/>' +
      '<path d="M100 132 C102 170 124 193 150 193 C176 193 198 170 200 132 C196 174 176 188 150 188 C124 188 104 174 100 132 Z" fill="' + k.ten[2] + '" opacity=".28"/>' +
      '<ellipse cx="136" cy="84" rx="30" ry="14" fill="#fff" opacity=".16"/>' +
      '<ellipse cx="113" cy="152" rx="14" ry="8" fill="#ff7f8c" opacity="' + e.yanak + '"/>' +
      '<ellipse cx="187" cy="152" rx="14" ry="8" fill="#ff7f8c" opacity="' + e.yanak + '"/>' +
      '<path d="M150 128 C148.5 142 144 150 145.5 156 Q150 160 154.5 156 C156 150 151.5 142 150 128" fill="' + k.ten[2] + '" opacity=".22"/>' +
      '<path d="M144 157 Q150 161 156 157" fill="none" stroke="' + k.ten[2] + '" stroke-width="1.7" stroke-linecap="round" opacity=".7"/>' +
      goz(id, 124, e.ry, k, e.bak) + goz(id, 176, e.ry, k, e.bak) +
      '<path d="' + e.kasS + '" fill="none" stroke="' + k.sac[0] + '" stroke-width="3.6" stroke-linecap="round"/>' +
      '<path d="' + e.kasD + '" fill="none" stroke="' + k.sac[0] + '" stroke-width="3.6" stroke-linecap="round"/>' +
      agiz(k, e);

    var on = onSac(k, id);
    var uzunOn = (!o.yakin && k.stil === "uzun") ? onSacUzun(k, id) : "";

    return '<svg class="' + (o.sinif || "karakter-svg") + '" viewBox="' + gor + '" xmlns="http://www.w3.org/2000/svg" ' + (o.etiket === "" ? 'aria-hidden="true"' : 'role="img" aria-label="' + (o.etiket || k.ad) + '"') + ' focusable="false">' +
      defs + ust + "<g " + BAS + ">" + yuz + on + uzunOn + "</g></svg>";
  }

  /* Ofis sahnesi (bulanık derinlik + holografik paneller) */
  function arka() {
    var id = "a" + (++sayac);
    var sehir = "";
    var bin = [[490, 210, 40], [534, 170, 56], [596, 232, 38], [640, 150, 62], [708, 200, 44], [756, 120, 58], [820, 190, 48], [874, 140, 54], [934, 220, 50]];
    bin.forEach(function (b, i) {
      sehir += '<rect x="' + b[0] + '" y="' + (380 - b[1]) + '" width="' + b[2] + '" height="' + b[1] + '" fill="rgba(110,176,255,' + (0.18 + (i % 3) * 0.06) + ')"/>';
      for (var y = 0; y < 5; y++) {
        sehir += '<rect x="' + (b[0] + 8) + '" y="' + (380 - b[1] + 16 + y * 24) + '" width="6" height="8" fill="rgba(255,236,170,.45)"/>' +
          '<rect x="' + (b[0] + b[2] - 16) + '" y="' + (380 - b[1] + 28 + y * 24) + '" width="6" height="8" fill="rgba(190,235,255,.4)"/>';
      }
    });
    var direk = "";
    for (var i = 0; i <= 8; i++) direk += '<line x1="' + (i * 125) + '" y1="70" x2="' + (i * 125) + '" y2="400" stroke="rgba(255,255,255,.22)" stroke-width="2"/>';
    var bokeh = "";
    var bk = [[120, 90, 14], [310, 60, 10], [560, 80, 18], [780, 70, 12], [900, 110, 16], [440, 300, 12], [700, 330, 20], [250, 380, 9]];
    bk.forEach(function (b) { bokeh += '<circle cx="' + b[0] + '" cy="' + b[1] + '" r="' + b[2] + '" fill="rgba(160,230,255,.16)"/>'; });
    var masa = "";
    [[500, 392, 150], [700, 398, 170], [880, 394, 120]].forEach(function (m) {
      masa += '<rect x="' + m[0] + '" y="' + m[1] + '" width="' + m[2] + '" height="22" rx="4" fill="rgba(6,24,52,.75)"/>' +
        '<rect x="' + (m[0] + 24) + '" y="' + (m[1] - 38) + '" width="46" height="32" rx="3" fill="rgba(90,220,255,.55)"/>' +
        '<rect x="' + (m[0] + 78) + '" y="' + (m[1] - 30) + '" width="38" height="26" rx="3" fill="rgba(140,200,255,.4)"/>';
    });

    return '<svg class="arka-svg" viewBox="0 0 1000 560" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' +
      "<defs>" +
      '<linearGradient id="' + id + '-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a2243"/><stop offset=".55" stop-color="#14447a"/><stop offset="1" stop-color="#1a5f98"/></linearGradient>' +
      '<linearGradient id="' + id + '-zemin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f78b4" stop-opacity=".85"/><stop offset="1" stop-color="#0c2f58"/></linearGradient>' +
      '<linearGradient id="' + id + '-cam" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8fe6ff" stop-opacity=".28"/><stop offset="1" stop-color="#8fe6ff" stop-opacity=".04"/></linearGradient>' +
      '<radialGradient id="' + id + '-isik" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#5fe4ff" stop-opacity=".55"/><stop offset="1" stop-color="#5fe4ff" stop-opacity="0"/></radialGradient>' +
      '<filter id="' + id + '-b" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="3.2"/></filter>' +
      '<filter id="' + id + '-p" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="9"/></filter>' +
      "</defs>" +
      '<rect width="1000" height="560" fill="url(#' + id + '-bg)"/>' +
      '<g filter="url(#' + id + '-b)">' + sehir + '<rect x="0" y="70" width="1000" height="330" fill="url(#' + id + '-cam)"/>' + direk + masa + bokeh + "</g>" +
      '<g filter="url(#' + id + '-p)" opacity=".95">' +
      '<rect x="60" y="22" width="880" height="9" rx="4" fill="#dff7ff"/><rect x="140" y="44" width="720" height="6" rx="3" fill="#bfeaff"/><rect x="220" y="62" width="560" height="4" rx="2" fill="#9fdcff"/></g>' +
      '<path d="M0 400 L1000 400 L1000 560 L0 560 Z" fill="url(#' + id + '-zemin)"/>' +
      '<g stroke="rgba(190,235,255,.10)" stroke-width="2"><path d="M500 400 L60 560"/><path d="M500 400 L260 560"/><path d="M500 400 L500 560"/><path d="M500 400 L740 560"/><path d="M500 400 L940 560"/></g>' +
      '<ellipse cx="190" cy="548" rx="260" ry="46" fill="url(#' + id + '-isik)"/>' +
      /* holografik paneller */
      '<g fill="none" stroke="#6fe6ff" stroke-width="1.6" opacity=".78">' +
      '<rect x="64" y="110" width="176" height="112" rx="10" fill="rgba(60,170,230,.14)"/>' +
      '<path d="M84 200 V170 M104 200 V150 M124 200 V176 M144 200 V138 M164 200 V160 M184 200 V128 M204 200 V150" stroke-width="7" stroke-linecap="round"/>' +
      '<path d="M84 128 H150" stroke-width="3" stroke-linecap="round" opacity=".8"/>' +
      '<rect x="28" y="248" width="126" height="76" rx="10" fill="rgba(60,170,230,.12)"/>' +
      '<path d="M44 300 L66 280 L88 292 L110 264 L136 276" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<rect x="806" y="96" width="150" height="104" rx="10" fill="rgba(60,170,230,.12)"/>' +
      '<circle cx="860" cy="150" r="26" stroke-width="7" opacity=".9"/><path d="M860 124 A26 26 0 0 1 886 150" stroke="#b9f4ff" stroke-width="7"/>' +
      '<path d="M902 128 H940 M902 148 H932 M902 168 H938" stroke-width="3" stroke-linecap="round"/>' +
      "</g>" +
      "</svg>";
  }

  /* Basit çizgi simgeleri (24x24, Feather tarzı) */
  var IKONLAR = {
    mesaj: '<path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.1A8.4 8.4 0 1 1 21 11.5z"/>',
    hedef: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    goz: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/>',
    katman: '<path d="M12 2 2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>',
    kisiler: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/>',
    grafik: '<path d="M18 20V10M12 20V4M6 20v-6"/>',
    onay: '<path d="M22 11.1V12a10 10 0 1 1-5.9-9.1"/><path d="M22 4 12 14l-3-3"/>',
    ok: '<path d="M7 17 17 7M7 7h10v10"/>',
    kilit: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    begeni: '<path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.3a2 2 0 0 0 2-1.7l1.4-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>',
    yildiz: '<path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1L12 2z"/>',
    isik: '<path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2z"/>',
    tekrar: '<path d="M1 4v6h6"/><path d="M3.5 15a9 9 0 1 0 2.1-9.4L1 10"/>'
  };

  function ikon(ad, boyut, sinif) {
    return '<svg class="' + (sinif || "ikon") + '" width="' + (boyut || 22) + '" height="' + (boyut || 22) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + (IKONLAR[ad] || "") + "</svg>";
  }

  global.Gorsel = { kisiler: KISILER, karakter: karakter, arka: arka, ikon: ikon };
})(window);
