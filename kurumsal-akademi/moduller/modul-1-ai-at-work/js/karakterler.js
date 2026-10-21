/*
 * Görsel sistem: özgün SVG karakterler (Ece, Mert), yapay zekâ asistanı ve ofis sahnesi.
 * Dış görsel, yazı tipi veya kütüphane yoktur; hepsi burada çizilir.
 * Vyond/Powtoon varlığı kullanılmamıştır.
 *
 * İfade, poz ve konuşma durumu SVG üzerindeki data-* öznitelikleriyle değişir
 * (CSS hangi varyantın görüneceğini seçer), bu yüzden yeniden çizim gerekmez.
 */
(function (global) {
  "use strict";

  var sayac = 0;

  var KISI = {
    ece: {
      ad: "Ece",
      ten: "#b9764f", tenGolge: "#9b5e3c", yanak: "#e0785f",
      sac: "#2a1a16", sacAcik: "#4a2f27",
      ust: "#f2594a", ustKoyu: "#c93f33", gomlek: "#ffffff",
      dudak: "#8f2f3c"
    },
    mert: {
      ad: "Mert",
      ten: "#e6b08a", tenGolge: "#cb9269", yanak: "#e58f78",
      sac: "#1f2330", sacAcik: "#3a4054",
      ust: "#1d9a8a", ustKoyu: "#146f63", gomlek: "#f4f7fb",
      dudak: "#8a3b3b"
    }
  };

  /* Ortak yüz iskeleti: kaş yolları ve ağız. Merkez (120,112). */
  function agizCizgi(d, k, kalin) {
    return '<path d="' + d + '" fill="none" stroke="' + k.dudak + '" stroke-width="' + (kalin || 3.4) + '" stroke-linecap="round" stroke-linejoin="round"/>';
  }
  function kas(d, k) {
    return '<path d="' + d + '" fill="none" stroke="' + k.sac + '" stroke-width="4.4" stroke-linecap="round"/>';
  }
  function ifadeVaryanti(ad, kasS, kasD, agiz, k) {
    return '<g class="i i-' + ad + '">' + kas(kasS, k) + kas(kasD, k) + agiz + "</g>";
  }
  function ifadeler(k) {
    return [
      ifadeVaryanti("notr", "M92 99 Q102 95 112 98", "M128 98 Q138 95 148 99", agizCizgi("M110 143 Q120 146 130 143", k), k),
      ifadeVaryanti("gulumse", "M92 98 Q102 93 112 97", "M128 97 Q138 93 148 98",
        agizCizgi("M106 140 Q120 154 134 140", k) +
        '<path d="M109 142 Q120 150 131 142 Q120 146 109 142 Z" fill="#fff" opacity=".92"/>', k),
      ifadeVaryanti("mutlu", "M92 95 Q102 89 112 94", "M128 94 Q138 89 148 95",
        '<path d="M104 138 Q120 162 136 138 Z" fill="#6d1f2b"/>' +
        '<path d="M106 139 Q120 146 134 139 Z" fill="#fff"/>' +
        '<path d="M112 151 Q120 146 128 151 Q120 158 112 151 Z" fill="#e56a7c"/>', k),
      ifadeVaryanti("dusunceli", "M92 100 Q102 97 112 99", "M128 92 Q138 87 148 95",
        agizCizgi("M111 145 Q121 141 131 145", k), k),
      ifadeVaryanti("hayalkirikligi", "M92 103 Q102 97 112 93", "M128 93 Q138 97 148 103",
        agizCizgi("M109 147 Q120 139 131 147", k), k),
      ifadeVaryanti("saskin", "M91 91 Q102 85 113 90", "M127 90 Q138 85 149 91",
        '<ellipse cx="120" cy="146" rx="6.5" ry="8.5" fill="#6d1f2b"/>' +
        '<ellipse cx="120" cy="143.5" rx="4" ry="2.4" fill="#e56a7c" opacity=".0"/>', k),
      ifadeVaryanti("ciddi", "M92 99 L112 98", "M128 98 L148 99", agizCizgi("M111 144 L129 144", k), k)
    ].join("");
  }

  function yuz(k, gozluk) {
    var goz = "";
    [102, 138].forEach(function (cx) {
      goz += '<ellipse class="goz-beyaz" cx="' + cx + '" cy="114" rx="9.6" ry="10.6" fill="#fff"/>';
    });
    var gb = '<g class="gb">';
    [102, 138].forEach(function (cx) {
      gb += '<circle cx="' + cx + '" cy="115" r="5.2" fill="#2a1a16"/>' +
        '<circle cx="' + (cx + 1.8) + '" cy="112.6" r="1.8" fill="#fff"/>';
    });
    gb += "</g>";
    var kapak = "", yari = "";
    [102, 138].forEach(function (cx) {
      kapak += '<ellipse class="kapak" cx="' + cx + '" cy="114" rx="10.4" ry="11.4" fill="' + k.ten + '"/>';
      yari += '<path class="yari" d="M' + (cx - 10) + " 114 a10 11 0 0 1 20 0 Z" + '" fill="' + k.ten + '"/>' +
        '<path class="yari" d="M' + (cx - 10) + " 114 L" + (cx + 10) + " 114" + '" stroke="' + k.tenGolge + '" stroke-width="1.4"/>';
    });
    var burun = '<path d="M118 121 Q113 131 120 133 Q124 133 124 130" fill="none" stroke="' + k.tenGolge + '" stroke-width="2.4" stroke-linecap="round"/>';
    var yanaklar = '<circle cx="90" cy="132" r="8.5" fill="' + k.yanak + '" opacity=".28"/><circle cx="150" cy="132" r="8.5" fill="' + k.yanak + '" opacity=".28"/>';
    var acik = '<ellipse class="agiz-konus" cx="120" cy="144" rx="7" ry="6" fill="#5a1b26"/>';
    var gl = "";
    if (gozluk) {
      gl = '<g fill="none" stroke="#25293a" stroke-width="3.2"><circle cx="102" cy="114" r="14.5"/><circle cx="138" cy="114" r="14.5"/><path d="M116.5 112 Q120 109 123.5 112"/><path d="M87.5 112 L78 109 M152.5 112 L162 109" stroke-linecap="round"/></g>' +
        '<path d="M92 104 Q98 100 106 102" stroke="#fff" stroke-width="1.6" fill="none" opacity=".55" stroke-linecap="round"/>';
    }
    return goz + gb + kapak + yari + burun + yanaklar + ifadeler(k) + acik + gl;
  }

  /* ---------------- ECE ---------------- */
  function ece() {
    var k = KISI.ece;
    var arka = '<ellipse cx="120" cy="150" rx="56" ry="62" fill="' + k.sac + '"/>' +
      '<circle cx="120" cy="40" r="23" fill="' + k.sac + '"/>' +
      '<path d="M100 44 Q120 28 140 44" fill="none" stroke="' + k.sacAcik + '" stroke-width="3" stroke-linecap="round"/>' +
      '<rect x="102" y="56" width="36" height="8" rx="4" fill="#ffc233"/>';
    var govde = '<path d="M34 326 L34 264 Q34 220 84 207 L106 201 L120 215 L134 201 L156 207 Q206 220 206 264 L206 326 Z" fill="' + k.ust + '"/>' +
      '<path d="M104 203 L120 252 L136 203 L120 215 Z" fill="' + k.gomlek + '"/>' +
      '<path d="M106 201 L86 216 L108 266 L120 252 Z" fill="' + k.ustKoyu + '"/>' +
      '<path d="M134 201 L154 216 L132 266 L120 252 Z" fill="' + k.ustKoyu + '"/>' +
      '<path d="M104 160 L104 203 Q120 218 136 203 L136 160 Z" fill="' + k.ten + '"/>' +
      '<path d="M104 176 Q120 196 136 176 L136 190 Q120 208 104 190 Z" fill="' + k.tenGolge + '" opacity=".55"/>' +
      /* yaka kartı */
      '<path d="M108 203 L98 250 M132 203 L142 250" stroke="#ffffff" stroke-width="2" opacity=".85" fill="none"/>' +
      '<rect x="132" y="248" width="26" height="17" rx="3" fill="#fff"/><rect x="136" y="253" width="12" height="3" rx="1.5" fill="#f2594a"/><rect x="136" y="258" width="18" height="2.4" rx="1.2" fill="#b8c1d6"/>';
    var altYaz = '<path d="M34 270 Q22 300 30 326 L58 326 Q54 296 62 262 Z" fill="' + k.ustKoyu + '" opacity=".55"/>' +
      '<path d="M206 270 Q218 300 210 326 L182 326 Q186 296 178 262 Z" fill="' + k.ustKoyu + '" opacity=".55"/>';
    var altCene = '<path d="M34 270 Q22 300 30 326 L58 326 Q54 296 62 262 Z" fill="' + k.ustKoyu + '" opacity=".55"/>';
    var ustCene = '<path d="M200 262 Q226 296 204 314 Q196 318 192 312 Q150 296 150 180" fill="none" stroke="' + k.ust + '" stroke-width="25" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M200 262 Q226 296 204 314 Q196 318 192 312 Q150 296 150 180" fill="none" stroke="' + k.ustKoyu + '" stroke-width="2" opacity=".35" stroke-linecap="round" transform="translate(7,0)"/>' +
      '<circle cx="150" cy="168" r="12.5" fill="' + k.ten + '"/><path d="M142 164 Q150 158 158 164" fill="none" stroke="' + k.tenGolge + '" stroke-width="1.6" opacity=".6"/>';
    var kafa = '<ellipse cx="76" cy="118" rx="7" ry="10.5" fill="' + k.ten + '"/><ellipse cx="164" cy="118" rx="7" ry="10.5" fill="' + k.ten + '"/>' +
      '<circle cx="76" cy="130" r="3.4" fill="#ffc233"/><circle cx="164" cy="130" r="3.4" fill="#ffc233"/>' +
      '<ellipse cx="120" cy="112" rx="43" ry="49" fill="' + k.ten + '"/>' +
      '<path d="M84 140 Q120 178 156 140 Q156 160 120 164 Q84 160 84 140 Z" fill="' + k.tenGolge + '" opacity=".16"/>' +
      yuz(k, false) +
      '<path d="M77 108 C73 66 98 51 122 51 C150 51 169 68 164 108 C161 90 148 78 128 76 C112 74 92 82 84 112 Z" fill="' + k.sac + '"/>' +
      '<path d="M84 112 C78 128 80 142 86 152 C84 138 86 124 92 106 Z" fill="' + k.sac + '"/>' +
      '<path d="M96 66 Q122 56 150 68" fill="none" stroke="' + k.sacAcik + '" stroke-width="2.6" stroke-linecap="round" opacity=".7"/>';
    return { arka: arka, govde: govde, pozlar: { yaz: [altYaz, ""], cene: [altCene, ustCene] }, kafa: kafa };
  }

  /* ---------------- MERT ---------------- */
  function mert() {
    var k = KISI.mert;
    var cid = "mk" + (++sayac);
    var arka = "";
    var govde = '<path d="M30 326 L30 264 Q30 222 80 209 L104 203 Q120 217 136 203 L160 209 Q210 222 210 264 L210 326 Z" fill="' + k.ust + '"/>' +
      '<path d="M100 205 L120 232 L140 205 L131 196 L120 208 L109 196 Z" fill="' + k.gomlek + '"/>' +
      '<path d="M104 203 Q120 224 136 203" fill="none" stroke="' + k.ustKoyu + '" stroke-width="8" stroke-linecap="round"/>' +
      '<path d="M104 160 L104 205 Q120 219 136 205 L136 160 Z" fill="' + k.ten + '"/>' +
      '<path d="M104 178 Q120 198 136 178 L136 192 Q120 210 104 192 Z" fill="' + k.tenGolge + '" opacity=".55"/>' +
      '<path d="M64 300 Q74 270 80 232 M176 300 Q166 270 160 232" stroke="' + k.ustKoyu + '" stroke-width="2" fill="none" opacity=".35"/>';
    /* Sağ (görüntüde sağ) elde tablet: arkası görünür */
    var tablet = '<path d="M206 266 Q232 292 200 300" fill="none" stroke="' + k.ust + '" stroke-width="25" stroke-linecap="round"/>' +
      '<g transform="rotate(-7 190 268)"><rect x="168" y="240" width="40" height="56" rx="6" fill="#3a4254"/><rect x="170" y="242" width="36" height="52" rx="4" fill="#4a5470"/><circle cx="188" cy="250" r="2.4" fill="#9aa6c4"/></g>' +
      '<circle cx="200" cy="296" r="11.5" fill="' + k.ten + '"/>';
    var kolAsagi = '<path d="M34 270 Q22 300 30 326 L58 326 Q54 296 62 262 Z" fill="' + k.ustKoyu + '" opacity=".55"/>';
    function el(cx, cy, yukari) {
      return '<circle cx="' + cx + '" cy="' + cy + '" r="13" fill="' + k.ten + '"/>' +
        '<path d="M' + (cx - 9) + " " + (cy - 8) + " L" + (cx - 9) + " " + (cy - 19) + " M" + (cx - 3) + " " + (cy - 11) + " L" + (cx - 3) + " " + (cy - 23) + " M" + (cx + 3) + " " + (cy - 11) + " L" + (cx + 3) + " " + (cy - 22) + " M" + (cx + 9) + " " + (cy - 8) + " L" + (cx + 9) + " " + (cy - 17) +
        '" stroke="' + k.ten + '" stroke-width="5.6" stroke-linecap="round"/>' + (yukari ? "" : "");
    }
    var kolAnlat = '<g class="jest-anlat"><path d="M36 266 Q8 270 14 234" fill="none" stroke="' + k.ust + '" stroke-width="25" stroke-linecap="round"/>' + el(14, 214) + "</g>";
    var kolUyar = '<g class="jest-uyar"><path d="M36 266 Q4 262 10 206" fill="none" stroke="' + k.ust + '" stroke-width="25" stroke-linecap="round"/>' + el(10, 186) + "</g>";
    var kolGoster = '<path d="M36 268 Q10 262 -22 242" fill="none" stroke="' + k.ust + '" stroke-width="25" stroke-linecap="round"/>' +
      '<circle cx="-28" cy="240" r="12.5" fill="' + k.ten + '"/><path d="M-38 238 L-52 232" stroke="' + k.ten + '" stroke-width="6" stroke-linecap="round"/>';
    var kafa = '<ellipse cx="75" cy="118" rx="7" ry="10.5" fill="' + k.ten + '"/><ellipse cx="165" cy="118" rx="7" ry="10.5" fill="' + k.ten + '"/>' +
      '<ellipse cx="120" cy="112" rx="45" ry="50" fill="' + k.ten + '"/>' +
      '<clipPath id="' + cid + '"><ellipse cx="120" cy="112" rx="45" ry="50"/></clipPath>' +
      '<path clip-path="url(#' + cid + ')" d="M70 118 Q76 152 100 163 Q120 170 140 163 Q164 152 170 118 Q160 138 144 143 Q120 151 96 143 Q80 138 70 118 Z" fill="' + k.sac + '" opacity=".5"/>' +
      yuz(k, true) +
      '<path d="M77 106 C72 62 98 54 121 54 C148 54 170 62 164 106 C160 88 148 76 126 74 C102 74 86 84 77 106 Z" fill="' + k.sac + '"/>' +
      '<path d="M98 64 Q124 54 150 66" fill="none" stroke="' + k.sacAcik + '" stroke-width="2.6" stroke-linecap="round" opacity=".75"/>';
    return {
      arka: arka, govde: govde,
      sabit: tablet,
      pozlar: { dur: [kolAsagi, ""], anlat: [kolAnlat, ""], uyar: [kolUyar, ""], goster: [kolGoster, ""] },
      kafa: kafa
    };
  }

  function karakterGrubu(adi, ifade, poz, donusum, hareketSinifi, gizli) {
    var c = adi === "ece" ? ece() : mert();
    var altlar = "", ustler = "";
    Object.keys(c.pozlar).forEach(function (p) {
      altlar += '<g class="poz poz-' + p + '">' + c.pozlar[p][0] + "</g>";
      ustler += '<g class="poz poz-' + p + '">' + c.pozlar[p][1] + "</g>";
    });
    /* Dış grup yalnızca konumlandırır (transform özniteliği); animasyonlar iç gruplarda. */
    return '<g class="kar kar-' + adi + (gizli ? " gizli" : "") + '" data-kar="' + adi + '" data-ifade="' + ifade + '" data-poz="' + poz + '" data-konus="0" transform="' + donusum + '">' +
      '<g class="' + (hareketSinifi || "") + '"><g class="nefes">' + c.arka + c.govde + (c.sabit || "") + altlar +
      '<g class="kafa">' + c.kafa + "</g>" + ustler + "</g></g></g>";
  }

  /* ---------------- ASİSTAN (robot) ---------------- */
  function asistan(durum, donusum) {
    var id = "as" + (++sayac);
    return '<g class="asistan" data-durum="' + durum + '" ' + (donusum ? 'transform="' + donusum + '"' : "") + ">" +
      '<defs><linearGradient id="' + id + 'g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5b7cfa"/><stop offset="1" stop-color="#3b3fc4"/></linearGradient></defs>' +
      '<ellipse class="halka" cx="60" cy="52" rx="52" ry="46" fill="none" stroke="#6ff0d4" stroke-width="2"/>' +
      '<line x1="60" y1="16" x2="60" y2="2" stroke="#8a93b8" stroke-width="3" stroke-linecap="round"/><circle class="anten" cx="60" cy="2" r="5" fill="#ffc233"/>' +
      '<rect x="22" y="76" width="76" height="62" rx="22" fill="url(#' + id + 'g)"/>' +
      '<rect x="40" y="92" width="40" height="8" rx="4" fill="#fff" opacity=".28"/><circle cx="60" cy="116" r="6" fill="#6ff0d4"/>' +
      '<rect x="12" y="16" width="96" height="66" rx="26" fill="url(#' + id + 'g)"/>' +
      '<rect x="19" y="23" width="82" height="52" rx="20" fill="#141a45"/>' +
      '<g class="a-goz a-normal"><rect x="38" y="38" width="12" height="18" rx="6" fill="#6ff0d4"/><rect x="70" y="38" width="12" height="18" rx="6" fill="#6ff0d4"/><path d="M50 64 Q60 70 70 64" fill="none" stroke="#6ff0d4" stroke-width="3" stroke-linecap="round"/></g>' +
      '<g class="a-goz a-yaziyor"><circle class="nokta n1" cx="44" cy="48" r="5" fill="#6ff0d4"/><circle class="nokta n2" cx="60" cy="48" r="5" fill="#6ff0d4"/><circle class="nokta n3" cx="76" cy="48" r="5" fill="#6ff0d4"/></g>' +
      '<g class="a-goz a-uyari"><rect x="38" y="38" width="12" height="18" rx="6" fill="#ffc233"/><rect x="70" y="38" width="12" height="18" rx="6" fill="#ffc233"/><path d="M52 66 L68 66" stroke="#ffc233" stroke-width="3" stroke-linecap="round"/></g>' +
      '<circle cx="14" cy="104" r="8" fill="#4a55d6"/><circle cx="106" cy="104" r="8" fill="#4a55d6"/>' +
      "</g>";
  }

  /* ---------------- SAHNE ---------------- */
  var TONLAR = {
    sicak:  ["#ffeede", "#ffd9bd", "#f4c7a3"],
    nane:   ["#e5f7f1", "#c5ece0", "#a8dccd"],
    lavanta: ["#efeaff", "#d9d0ff", "#c3b6f5"],
    amber:  ["#fff3d6", "#ffe3a0", "#f6cf72"],
    gece:   ["#2b3a6b", "#202c57", "#18224a"],
    gunes:  ["#fff1e0", "#ffd7b0", "#ffc08a"]
  };

  var IKONLAR = {
    bos: "",
    ampul: '<path d="M320 96 a34 34 0 0 1 20 62 v14 h-40 v-14 a34 34 0 0 1 20 -62 Z M304 184 h32 M308 196 h24" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>',
    buyutec: '<circle cx="312" cy="128" r="34" fill="none" stroke="#fff" stroke-width="8"/><path d="M337 153 L366 184" stroke="#fff" stroke-width="10" stroke-linecap="round"/>',
    kalkan: '<path d="M320 90 L366 108 V148 C366 178 346 196 320 208 C294 196 274 178 274 148 V108 Z" fill="none" stroke="#fff" stroke-width="7" stroke-linejoin="round"/><path d="M298 146 l16 16 l30 -34" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>',
    onay: '<circle cx="320" cy="140" r="48" fill="none" stroke="#fff" stroke-width="8"/><path d="M296 142 l17 17 l32 -36" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>',
    soru: '<circle cx="320" cy="140" r="48" fill="none" stroke="#fff" stroke-width="8"/><path d="M302 124 Q302 106 320 106 Q338 106 338 122 Q338 134 320 142 V152" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round"/><circle cx="320" cy="168" r="4.6" fill="#fff"/>'
  };

  function arkaPlan(ton, ikon) {
    var t = TONLAR[ton] || TONLAR.sicak;
    var gece = ton === "gece";
    var id = "bg" + (++sayac);
    var pencere = gece ? ["#101a3d", "#1b2a5e"] : ["#cfe9ff", "#eaf6ff"];
    var panel = gece ? "#ffffff" : "#1b2a4e";
    return '<defs>' +
      '<linearGradient id="' + id + 'w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + t[0] + '"/><stop offset="1" stop-color="' + t[1] + '"/></linearGradient>' +
      '<linearGradient id="' + id + 's" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + pencere[0] + '"/><stop offset="1" stop-color="' + pencere[1] + '"/></linearGradient>' +
      "</defs>" +
      '<rect width="640" height="364" fill="url(#' + id + 'w)"/>' +
      '<g opacity="' + (gece ? ".08" : ".05") + '" fill="' + panel + '"><rect x="80" y="0" width="3" height="364"/><rect x="240" y="0" width="3" height="364"/><rect x="400" y="0" width="3" height="364"/><rect x="560" y="0" width="3" height="364"/></g>' +
      /* pencere */
      '<g><rect x="438" y="34" width="166" height="124" rx="8" fill="' + (gece ? "#0d1530" : "#ffffff") + '"/><rect x="446" y="42" width="150" height="108" rx="4" fill="url(#' + id + 's)"/>' +
      '<g fill="' + (gece ? "#2a3a78" : "#b7d4ee") + '"><rect x="452" y="108" width="22" height="42"/><rect x="478" y="92" width="26" height="58"/><rect x="508" y="116" width="20" height="34"/><rect x="532" y="84" width="24" height="66"/><rect x="560" y="104" width="30" height="46"/></g>' +
      (gece ? '<circle cx="470" cy="62" r="9" fill="#ffe9a8"/><g fill="#ffe9a8"><circle cx="520" cy="58" r="1.6"/><circle cx="560" cy="70" r="1.4"/><circle cx="500" cy="78" r="1.2"/></g>' : '<circle cx="562" cy="64" r="12" fill="#ffe08a" opacity=".9"/>') +
      '<path d="M521 42 V150 M446 96 H596" stroke="' + (gece ? "#0d1530" : "#fff") + '" stroke-width="5"/></g>' +
      /* duvar simgesi */
      '<g class="duvar-ikon" opacity="' + (gece ? ".42" : ".55") + '"><circle cx="320" cy="140" r="78" fill="#fff" opacity="' + (gece ? ".07" : ".32") + '"/>' + (IKONLAR[ikon] || "") + "</g>" +
      /* raf ve bitki */
      '<rect x="22" y="112" width="132" height="8" rx="3" fill="' + (gece ? "#41507f" : "#c79a6b") + '"/>' +
      '<g><rect x="34" y="78" width="14" height="34" rx="2" fill="#f2594a"/><rect x="50" y="86" width="12" height="26" rx="2" fill="#3b5bdb"/><rect x="64" y="72" width="15" height="40" rx="2" fill="#ffc233"/><rect x="82" y="84" width="12" height="28" rx="2" fill="#1d9a8a"/></g>' +
      '<g><rect x="108" y="92" width="34" height="20" rx="3" fill="#fff" opacity=".9"/><rect x="113" y="98" width="24" height="3" rx="1.5" fill="#b8c1d6"/><rect x="113" y="104" width="16" height="3" rx="1.5" fill="#b8c1d6"/></g>' +
      '<g><circle cx="196" cy="60" r="19" fill="#fff" opacity="' + (gece ? ".9" : ".95") + '"/><circle cx="196" cy="60" r="19" fill="none" stroke="#1b2a4e" stroke-width="3"/><path d="M196 60 V47 M196 60 L206 66" stroke="#1b2a4e" stroke-width="2.6" stroke-linecap="round"/></g>' +
      /* zemin ve masa */
      '<rect y="364" width="640" height="76" fill="' + t[2] + '"/>' +
      '<rect y="368" width="640" height="72" fill="#6b4a3a" opacity=".12"/>' +
      '<path d="M0 396 H640" stroke="#fff" stroke-width="2" opacity=".18"/>';
  }

  function masaOnu() {
    return '<rect x="0" y="352" width="640" height="16" fill="#e0a869"/>' +
      '<rect x="0" y="352" width="640" height="4" fill="#f2c88e"/>' +
      '<rect x="0" y="368" width="640" height="72" fill="#b27a47"/>' +
      '<rect x="0" y="368" width="640" height="5" fill="#8f5f34" opacity=".6"/>' +
      '<g fill="#8f5f34" opacity=".5"><rect x="126" y="388" width="170" height="40" rx="4"/><rect x="344" y="388" width="170" height="40" rx="4"/></g>' +
      '<g fill="#d8b07c" opacity=".7"><rect x="206" y="404" width="10" height="4" rx="2"/><rect x="424" y="404" width="10" height="4" rx="2"/></g>';
  }

  function dizustu() {
    return '<g class="dizustu">' +
      '<path d="M92 304 H248 L262 352 H78 Z" fill="#d3daec"/><path d="M92 304 H248 L250 310 H90 Z" fill="#eef2fb"/>' +
      '<circle cx="170" cy="332" r="6.5" fill="#fff" opacity=".65"/>' +
      '<rect x="70" y="350" width="200" height="6" rx="3" fill="#aeb7cf"/></g>';
  }

  function kupa() {
    return '<g><rect x="560" y="328" width="24" height="26" rx="4" fill="#fff"/><rect x="560" y="338" width="24" height="6" fill="#f2594a"/><path d="M584 334 q10 0 10 9 q0 9 -10 9" fill="none" stroke="#fff" stroke-width="4"/></g>' +
      '<g><rect x="30" y="326" width="44" height="28" rx="5" fill="#d1633f"/><path d="M52 326 C34 306 30 288 42 276 C46 290 52 296 52 310 C52 292 62 282 74 280 C74 298 66 312 52 326 Z" fill="#34a37a"/><path d="M52 326 C48 300 56 284 70 270 C74 290 66 310 52 326 Z" fill="#26805d"/></g>';
  }

  /*
   * sahne(o): o = { ton, ikon, ece:{ifade,poz}|null, mert:{ifade,poz}|null, asistan:'bosta'|'yaziyor'|'uyari'|null, etiket }
   */
  function sahne(o) {
    var s = '<svg class="sahne-svg" viewBox="0 0 640 440" role="img" aria-label="' + (o.etiket || "Ofis sahnesi") + '" xmlns="http://www.w3.org/2000/svg" focusable="false">';
    s += arkaPlan(o.ton || "sicak", o.ikon || "bos");
    if (o.asistan) s += asistan(o.asistan, "translate(272,214) scale(.92)");
    if (o.mert) s += karakterGrubu("mert", o.mert.ifade || "notr", o.mert.poz || "dur", "translate(394,78) scale(.88)", "gir-sag", o.mertGizli);
    if (o.ece) s += karakterGrubu("ece", o.ece.ifade || "notr", o.ece.poz || "yaz", "translate(66,92) scale(.85)", "gir-sol");
    s += masaOnu();
    if (o.ece) s += dizustu();
    s += kupa();
    return s + "</svg>";
  }

  /* Sohbet penceresi ve başlıklar için küçük asistan simgesi */
  function asistanSimge(durum) {
    return '<svg class="asistan-simge" viewBox="-6 -6 132 156" aria-hidden="true" focusable="false">' + asistan(durum || "bosta") + "</svg>";
  }

  /* Küçük yüz portresi (balon etiketi için) */
  function portre(adi, ifade) {
    var k = KISI[adi];
    var c = adi === "ece" ? ece() : mert();
    return '<svg class="portre" viewBox="56 30 128 150" aria-hidden="true" focusable="false"><g class="kar kar-' + adi + '" data-ifade="' + (ifade || "notr") + '" data-konus="0">' +
      c.arka + '<path d="M104 160 L104 205 L136 205 L136 160 Z" fill="' + k.ten + '"/>' + c.kafa + "</g></svg>";
  }

  function ayarla(kok, adi, ozellikler) {
    var el = kok.querySelector('[data-kar="' + adi + '"]');
    if (!el) return;
    Object.keys(ozellikler).forEach(function (a) { el.setAttribute("data-" + a, ozellikler[a]); });
  }

  global.Karakterler = {
    sahne: sahne,
    asistanSimge: asistanSimge,
    portre: portre,
    ayarla: ayarla,
    adlar: { ece: KISI.ece.ad, mert: KISI.mert.ad },
    IFADELER: ["notr", "gulumse", "mutlu", "dusunceli", "hayalkirikligi", "saskin", "ciddi"],
    POZLAR: { ece: ["yaz", "cene"], mert: ["dur", "anlat", "uyar", "goster"] }
  };
})(window);
