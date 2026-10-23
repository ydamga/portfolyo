#!/usr/bin/env python3
"""AI at Work: replikleri yapay zekâ (nöral TTS) ile seslendirir ve modüle bağlar.

Önce replik listesi çıkarılır (Node gerekir):
    node tools/replikleri-cikar.js

Sonra sesler üretilir:
    pip install edge-tts
    python3 tools/seslendir.py --motor edge            # ücretsiz, resmî olmayan Microsoft Edge okuma servisi
    # ya da resmî Azure AI Speech (anahtar gerekir):
    export AZURE_SPEECH_KEY=...  AZURE_SPEECH_REGION=westeurope
    python3 tools/seslendir.py --motor azure

Betik şunları yapar:
  1. assets/audio/<kimlik>.mp3 dosyalarını üretir (metni değişmeyen mevcut dosyalar atlanır; --zorla ile yenilenir),
  2. assets/audio/ses-listesi.js dosyasını yazar (her ses, ürettiği metnin özetiyle eşleşir),
  3. imsmanifest.xml içindeki SES-DOSYALARI bloğunu günceller.
Ardından  python3 build.py  ile paket yeniden oluşturulur.

Diğer seçenekler:
  --liste        Ne üretileceğini gösterir, hiçbir şey yazmaz.
  --sadece ID..  Yalnızca verilen kimlikleri üretir.
  --temizle      Üretilmiş tüm sesleri siler, listeyi ve manifest bloğunu sıfırlar.
  --motor sessiz Boru hattını denemek için SESSİZ yer tutucu dosyalar üretir (_SESSIZ_TEST.txt işareti bırakır;
                 build.py bu işaret varken paket üretmez). Gerçek ses değildir; yayınlamayın.

Seslerin kim tarafından okunacağı tools/ses-ayar.json ile değiştirilir; telaffuz düzeltmeleri tools/okunus.json
içindedir (ör. {"prompt": "prompt"}): yalnızca sese giden metni değiştirir, ekrandaki metni değiştirmez.
"""
import argparse
import asyncio
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
import wave
from xml.sax.saxutils import escape

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SES_DIZINI = os.path.join(KOK, "assets", "audio")
LISTE_JS = os.path.join(SES_DIZINI, "ses-listesi.js")
MANIFEST = os.path.join(KOK, "imsmanifest.xml")
REPLIKLER = os.path.join(KOK, "tools", "replikler.json")
AYAR = os.path.join(KOK, "tools", "ses-ayar.json")
OKUNUS = os.path.join(KOK, "tools", "okunus.json")
ISARET = os.path.join(SES_DIZINI, "_SESSIZ_TEST.txt")
UZANTILAR = (".mp3", ".wav", ".ogg", ".m4a")
BASLA = "<!-- SES-DOSYALARI-BASLA"
BITIS = "<!-- SES-DOSYALARI-BITIS -->"

VARSAYILAN_AYAR = {
    "ece": {"ses": "tr-TR-EmelNeural", "hiz": "+0%"},
    "mert": {"ses": "tr-TR-AhmetNeural", "hiz": "+0%"},
    "yonetici": {"ses": "tr-TR-AhmetNeural", "hiz": "+0%"},
}


def hata(m):
    print("HATA:", m, file=sys.stderr)
    sys.exit(1)


def fnv(metin):
    """js/icerik.js içindeki sesHash ile aynı özet (UTF-16 kod birimleri üzerinden FNV-1a, 32 bit)."""
    h = 0x811C9DC5
    b = metin.encode("utf-16-le")
    for i in range(0, len(b), 2):
        h ^= b[i] | (b[i + 1] << 8)
        h = (h * 0x01000193) & 0xFFFFFFFF
    return "%08x" % h


def json_oku(yol, varsayilan):
    if not os.path.isfile(yol):
        return varsayilan
    with open(yol, encoding="utf-8") as f:
        return json.load(f)


def mevcut_liste():
    if not os.path.isfile(LISTE_JS):
        return {}
    metin = open(LISTE_JS, encoding="utf-8").read()
    m = re.search(r"window\.SES_LISTESI\s*=\s*(\{.*\})\s*;", metin, re.S)
    return json.loads(m.group(1)) if m else {}


def liste_yaz(liste):
    govde = json.dumps(liste, ensure_ascii=False, indent=2, sort_keys=True)
    with open(LISTE_JS, "w", encoding="utf-8") as f:
        f.write(
            "/*\n * Ses listesi: tools/seslendir.py tarafından üretildi; elle düzenlemeyin.\n"
            " * Biçim: { \"<replik kimliği>\": { d: \"<dosya>\", h: \"<metin özeti>\" } }\n"
            " * Boşsa ya da özet metinle uyuşmuyorsa modül o replik için sessiz çalışır.\n */\n"
            "window.SES_LISTESI = " + govde + ";\n"
        )


def manifest_guncelle():
    dosyalar = sorted(f for f in os.listdir(SES_DIZINI) if f.lower().endswith(UZANTILAR))
    metin = open(MANIFEST, encoding="utf-8").read()
    a = metin.find(BASLA)
    b = metin.find(BITIS)
    if a < 0 or b < 0 or b < a:
        hata("imsmanifest.xml içinde SES-DOSYALARI-BASLA/BITIS işaretleri bulunamadı")
    satir_sonu = metin.index("\n", a) + 1
    blok = "".join('      <file href="assets/audio/%s"/>\n' % f for f in dosyalar)
    metin = metin[:satir_sonu] + blok + "      " + metin[b:]
    with open(MANIFEST, "w", encoding="utf-8") as f:
        f.write(metin)
    return len(dosyalar)


def okunus_uygula(metin, sozluk):
    # Büyük/küçük harfe duyarsız eşleşir; sözcük büyük harfle başlıyorsa karşılığı da büyük harfle başlar.
    # Not: Python'un \b ve IGNORECASE'i Türkçe İ/ı çiftini özel işlemez; anahtarları küçük harfle yazın.
    for k, v in sozluk.items():
        def degistir(m, v=v):
            return v[:1].upper() + v[1:] if m.group(0)[:1].isupper() else v
        metin = re.sub(r"(?<!\w)%s(?!\w)" % re.escape(k), degistir, metin, flags=re.IGNORECASE)
    # Tırnak ve üç nokta okunuşu etkilemesin
    return metin.replace("“", "").replace("”", "").replace("…", "...")


# ---------------- Motorlar ----------------
def uret_edge(metin, ayar, yol):
    try:
        import edge_tts  # noqa: F401
    except ImportError:
        hata("edge-tts kurulu değil: pip install edge-tts")

    async def calistir():
        c = edge_tts.Communicate(metin, ayar["ses"], rate=ayar.get("hiz", "+0%"))
        await c.save(yol)

    asyncio.run(calistir())


def uret_azure(metin, ayar, yol):
    anahtar = os.environ.get("AZURE_SPEECH_KEY")
    bolge = os.environ.get("AZURE_SPEECH_REGION")
    if not anahtar or not bolge:
        hata("AZURE_SPEECH_KEY ve AZURE_SPEECH_REGION ortam değişkenleri gerekli")
    ssml = (
        "<speak version='1.0' xml:lang='tr-TR'><voice name='%s'><prosody rate='%s'>%s</prosody></voice></speak>"
        % (ayar["ses"], ayar.get("hiz", "+0%"), escape(metin))
    )
    istek = urllib.request.Request(
        "https://%s.tts.speech.microsoft.com/cognitiveservices/v1" % bolge,
        data=ssml.encode("utf-8"),
        headers={
            "Ocp-Apim-Subscription-Key": anahtar,
            "Content-Type": "application/ssml+xml",
            "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
            "User-Agent": "ai-at-work-seslendir",
        },
    )
    try:
        with urllib.request.urlopen(istek, timeout=60) as r, open(yol, "wb") as f:
            f.write(r.read())
    except urllib.error.URLError as e:
        raise RuntimeError(str(e))


def uret_sessiz(metin, ayar, yol):
    """YALNIZCA TEST: metin uzunluğuyla orantılı süreli sessiz WAV. Gerçek ses değildir."""
    sure = max(1.0, len(metin.split()) * 0.38)
    with wave.open(yol, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(16000)
        w.writeframes(b"\x00\x00" * int(16000 * sure))


MOTORLAR = {"edge": (uret_edge, ".mp3"), "azure": (uret_azure, ".mp3"), "sessiz": (uret_sessiz, ".wav")}


def temizle():
    n = 0
    for f in os.listdir(SES_DIZINI):
        if f.lower().endswith(UZANTILAR) or f == "_SESSIZ_TEST.txt":
            os.remove(os.path.join(SES_DIZINI, f))
            n += 1
    liste_yaz({})
    manifest_guncelle()
    print("Temizlendi: %d dosya silindi, liste ve manifest bloğu sıfırlandı." % n)


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--motor", choices=sorted(MOTORLAR), default="edge")
    p.add_argument("--zorla", action="store_true", help="mevcut sesleri de yeniden üret")
    p.add_argument("--liste", action="store_true", help="yalnızca planı göster")
    p.add_argument("--sadece", nargs="+", metavar="ID", help="yalnızca bu kimlikleri üret")
    p.add_argument("--temizle", action="store_true", help="üretilmiş sesleri sil ve sıfırla")
    a = p.parse_args()

    if a.temizle:
        temizle()
        return
    if not os.path.isfile(REPLIKLER):
        hata("tools/replikler.json yok. Önce: node tools/replikleri-cikar.js")
    replikler = json_oku(REPLIKLER, [])
    for r in replikler:  # Node tarafı ile Python özeti aynı mı?
        if fnv(r["metin"]) != r["h"]:
            hata("özet uyuşmazlığı (%s): replikler.json eski olabilir; node tools/replikleri-cikar.js çalıştırın" % r["id"])
    ayar = dict(VARSAYILAN_AYAR)
    ayar.update(json_oku(AYAR, {}))
    sozluk = json_oku(OKUNUS, {})
    uret, uzanti = MOTORLAR[a.motor]
    mevcut = mevcut_liste()
    hedef = [r for r in replikler if not a.sadece or r["id"] in a.sadece]
    if a.sadece:
        bilinmeyen = set(a.sadece) - {r["id"] for r in replikler}
        if bilinmeyen:
            hata("bilinmeyen kimlik: %s" % ", ".join(sorted(bilinmeyen)))

    plan = []
    for r in hedef:
        dosya = r["id"] + uzanti
        eski = mevcut.get(r["id"])
        guncel = (eski and eski["h"] == r["h"] and eski["d"] == "assets/audio/" + dosya
                  and os.path.isfile(os.path.join(KOK, eski["d"])))
        plan.append((r, dosya, bool(guncel) and not a.zorla))
    yeni = [x for x in plan if not x[2]]
    print("%d replik, %d üretilecek, %d güncel (atlanacak). Motor: %s" % (len(plan), len(yeni), len(plan) - len(yeni), a.motor))
    if a.liste:
        for r, dosya, atla in plan:
            print("  %-14s %-9s %-18s %s" % (r["id"], r["kim"], ayar[r["kim"]]["ses"], "atla" if atla else "ÜRET"))
        return
    if a.motor == "sessiz":
        print("UYARI: SESSİZ TEST dosyaları üretiliyor; bunlar gerçek ses değildir ve yayınlanmamalıdır.")
        open(ISARET, "w", encoding="utf-8").write("Bu klasördeki sesler sessiz test dosyalarıdır. Gerçek ses için: python3 tools/seslendir.py --temizle ve ardından --motor edge ya da azure.\n")

    liste = dict(mevcut)
    basarisiz = []
    for r, dosya, atla in plan:
        if atla:
            continue
        yol = os.path.join(SES_DIZINI, dosya)
        metin = okunus_uygula(r["metin"], sozluk)
        for deneme in range(3):
            try:
                uret(metin, ayar[r["kim"]], yol)
                if not os.path.isfile(yol) or os.path.getsize(yol) < 100:
                    raise RuntimeError("boş çıktı")
                break
            except SystemExit:
                raise
            except Exception as e:  # ağ ya da servis hatası
                if deneme == 2:
                    print("  BAŞARISIZ %s: %s" % (r["id"], e), file=sys.stderr)
                    basarisiz.append(r["id"])
                    if os.path.isfile(yol):
                        os.remove(yol)
                else:
                    time.sleep(1.5 * (deneme + 1))
        else:
            continue
        if r["id"] not in basarisiz:
            liste[r["id"]] = {"d": "assets/audio/" + dosya, "h": r["h"]}
            print("  tamam  %s (%s)" % (r["id"], ayar[r["kim"]]["ses"]))

    # Listede bulunup artık replik olmayan girişleri ayıkla
    gecerli = {r["id"] for r in replikler}
    liste = {k: v for k, v in liste.items() if k in gecerli}
    liste_yaz(liste)
    n = manifest_guncelle()
    print("ses-listesi.js yazıldı (%d replik), manifestte %d ses dosyası." % (len(liste), n))
    if basarisiz:
        print("Üretilemeyenler: %s. Komutu yeniden çalıştırmak yalnızca eksikleri tamamlar." % ", ".join(basarisiz), file=sys.stderr)
        sys.exit(2)
    print("Sıradaki adım: python3 build.py")


if __name__ == "__main__":
    main()
