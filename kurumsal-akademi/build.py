#!/usr/bin/env python3
"""SCORM 1.2 paketlerini üretir ve doğrular.

Kullanım:  python3 build.py [modül-klasörü ...]
Varsayılan: moduller/ altındaki tüm modüller.

Her modül için:
  1. ortak/ dosyalarını modülün ortak/ klasörüne kopyalar,
  2. imsmanifest.xml'i ayrıştırır, kimlik/dosya/mastery kontrolü yapar,
  3. dış (http/https) bağımlılıkları arar,
  4. imsmanifest.xml zip kökünde olacak şekilde dist/<modül>-scorm12.zip üretir.
"""
import os
import re
import shutil
import sys
import zipfile
import xml.etree.ElementTree as ET

KOK = os.path.dirname(os.path.abspath(__file__))
ORTAK = os.path.join(KOK, "ortak")
MODULLER = os.path.join(KOK, "moduller")
DIST = os.path.join(KOK, "dist")

NS = {
    "c": "http://www.imsproject.org/xsd/imscp_rootv1p1p2",
    "adlcp": "http://www.adlnet.org/xsd/adlcp_rootv1p2",
}


def hata(mesaj):
    print("HATA:", mesaj)
    sys.exit(1)


def manifest_dogrula(modul_yolu):
    yol = os.path.join(modul_yolu, "imsmanifest.xml")
    if not os.path.isfile(yol):
        hata("imsmanifest.xml yok: " + modul_yolu)
    agac = ET.parse(yol)
    kok = agac.getroot()

    kimlikler = [e.get("identifier") for e in kok.iter() if e.get("identifier")]
    if len(kimlikler) != len(set(kimlikler)):
        hata("tekrarlanan identifier var: " + str(kimlikler))

    surum = kok.findtext("c:metadata/c:schemaversion", namespaces=NS)
    if surum != "1.2":
        hata("schemaversion 1.2 olmalı, bulunan: %s" % surum)

    org = kok.find("c:organizations", NS)
    varsayilan = org.get("default")
    orglar = {o.get("identifier"): o for o in org.findall("c:organization", NS)}
    if varsayilan not in orglar:
        hata("varsayılan organization bulunamadı")

    kaynaklar = {r.get("identifier"): r for r in kok.findall("c:resources/c:resource", NS)}
    for item in orglar[varsayilan].iter("{%s}item" % NS["c"]):
        ref = item.get("identifierref")
        if ref not in kaynaklar:
            hata("item identifierref kaynağa bağlı değil: " + str(ref))
        ms = item.findtext("adlcp:masteryscore", namespaces=NS)
        if ms is not None and not (ms.isdigit() and 0 <= int(ms) <= 100):
            hata("masteryscore 0-100 olmalı: " + ms)

    dosyalar = []
    for r in kaynaklar.values():
        if r.get("{%s}scormtype" % NS["adlcp"]) != "sco":
            hata("kaynak scormtype=sco olmalı: " + r.get("identifier"))
        href = r.get("href")
        if not href or not os.path.isfile(os.path.join(modul_yolu, href)):
            hata("başlangıç dosyası yok: " + str(href))
        for f in r.findall("c:file", NS):
            h = f.get("href")
            if not os.path.isfile(os.path.join(modul_yolu, h)):
                hata("manifestteki dosya yok: " + h)
            dosyalar.append(h)
    return dosyalar


def dis_bagimlilik_tara(modul_yolu, dosyalar):
    desen = re.compile(r"(?:https?:)?//[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
    for h in dosyalar:
        if not h.endswith((".html", ".css", ".js")):
            continue
        metin = open(os.path.join(modul_yolu, h), encoding="utf-8").read()
        # SVG/XML ad alanı tanımlayıcıları ağ isteği yapmaz; yok say.
        metin = metin.replace("http://www.w3.org/2000/svg", "")
        bulunan = desen.findall(metin)
        if bulunan:
            hata("dış bağımlılık olabilir (%s): %s" % (h, bulunan[:3]))


def insa_et(modul_adi):
    modul_yolu = os.path.join(MODULLER, modul_adi)
    # ortak/ yalnızca manifestinde ortak/ dosyası listeleyen modüllere kopyalanır
    # (Modül 1 kendi sarmalayıcısını ve stilini taşır).
    with open(os.path.join(modul_yolu, "imsmanifest.xml"), encoding="utf-8") as f:
        ortak_kullaniyor = 'href="ortak/' in f.read()
    if ortak_kullaniyor:
        hedef = os.path.join(modul_yolu, "ortak")
        os.makedirs(hedef, exist_ok=True)
        for ad in os.listdir(ORTAK):
            shutil.copy2(os.path.join(ORTAK, ad), os.path.join(hedef, ad))

    dosyalar = manifest_dogrula(modul_yolu)
    dis_bagimlilik_tara(modul_yolu, dosyalar)

    os.makedirs(DIST, exist_ok=True)
    zip_yolu = os.path.join(DIST, "%s-scorm12.zip" % modul_adi)
    if os.path.exists(zip_yolu):
        os.remove(zip_yolu)
    with zipfile.ZipFile(zip_yolu, "w", zipfile.ZIP_DEFLATED) as z:
        z.write(os.path.join(modul_yolu, "imsmanifest.xml"), "imsmanifest.xml")
        for h in sorted(set(dosyalar)):
            z.write(os.path.join(modul_yolu, h), h)
    print("OK  %s  (%d dosya + manifest)  ->  %s" % (modul_adi, len(set(dosyalar)), os.path.relpath(zip_yolu, KOK)))


if __name__ == "__main__":
    adlar = sys.argv[1:] or sorted(
        d for d in os.listdir(MODULLER) if os.path.isdir(os.path.join(MODULLER, d))
    )
    for a in adlar:
        insa_et(a)
