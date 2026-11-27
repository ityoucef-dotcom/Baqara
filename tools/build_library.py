"""Build the in-app library from OpenITI mARkdown texts (CC BY-NC-SA 4.0, https://openiti.org).
Usage: python3 tools/build_library.py /path/to/openiti/0750ah  (clone with sparse checkout of the two author folders)."""
import json, re, sys, os
ROOT = sys.argv[1] if len(sys.argv) > 1 else "/home/claude/openiti/0750ah"
OUT = os.path.join(os.path.dirname(__file__), "..", "data", "library")
T = "data/0728IbnTaymiyya/0728IbnTaymiyya."
BOOKS = [  # id, file, title (as printed)
  ("ubudiyya", T+"Cubudiyya/0728IbnTaymiyya.Cubudiyya.Shamela0022647-ara1", "العبودية"),
  ("amrad", T+"AmradQulub/0728IbnTaymiyya.AmradQulub.Shamela0001512-ara1", "أمراض القلوب وشفاؤها"),
  ("kalim", T+"KalimTayyib/0728IbnTaymiyya.KalimTayyib.Shamela0021578-ara1", "الكلم الطيب"),
  ("wasitiyya", T+"CaqidaWasitiyya/0728IbnTaymiyya.CaqidaWasitiyya.Sham19Y0018098-ara1", "العقيدة الواسطية"),
  ("furqan", T+"FurqanBaynaAwliya/0728IbnTaymiyya.FurqanBaynaAwliya.Shamela0021499-ara1", "الفرقان بين أولياء الرحمن وأولياء الشيطان"),
  ("sabr", T+"QacidaFiSabr/0728IbnTaymiyya.QacidaFiSabr.Shamela0012153-ara1", "قاعدة في الصبر"),
  ("tazkiya", T+"FaslFiTazkiyyatNafs/0728IbnTaymiyya.FaslFiTazkiyyatNafs.Sham19Y0133364-ara1", "فصل في تزكية النفس"),
  ("tuhfa", T+"TuhfaCiraqiyya/0728IbnTaymiyya.TuhfaCiraqiyya.Shamela0006827-ara1", "التحفة العراقية في الأعمال القلبية"),
  ("wasiyya", T+"WasiyyaSughra/0728IbnTaymiyya.WasiyyaSughra.ShamAY0034399-ara1", "الوصية الصغرى"),
  ("tawba", T+"Tawba/0728IbnTaymiyya.Tawba.JK000903-ara1", "التوبة"),
  ("tawakkul", T+"RisalaFiTahqiqTawakkul/0728IbnTaymiyya.RisalaFiTahqiqTawakkul.JK000899-ara1", "رسالة في تحقيق التوكل"),
  ("shukr", T+"RisalaFiTahqiqShukr/0728IbnTaymiyya.RisalaFiTahqiqShukr.JK000900-ara1", "رسالة في تحقيق الشكر"),
  ("zuhd", T+"ZuhdWaWarac/0728IbnTaymiyya.ZuhdWaWarac.Shamela0006826-ara1", "الزهد والورع والعبادة"),
  ("mahabba", T+"QacidaFiMahabba/0728IbnTaymiyya.QacidaFiMahabba.Shamela0011289-ara1", "قاعدة في المحبة"),
  ("rafc", T+"RafcMalam/0728IbnTaymiyya.RafcMalam.Shamela0004118-ara1", "رفع الملام عن الأئمة الأعلام"),
  ("tafsir", T+"MuqaddimaFiUsulTafsir/0728IbnTaymiyya.MuqaddimaFiUsulTafsir.Shamela0012081-ara1", "مقدمة في أصول التفسير"),
  ("siyasa", T+"SiyasaSharciyya/0728IbnTaymiyya.SiyasaSharciyya.Shamela0031237-ara1", "السياسة الشرعية"),
  ("khulafa", T+"RisalaFiFadlKhulafaRashidin/0728IbnTaymiyya.RisalaFiFadlKhulafaRashidin.Shamela0038157-ara1", "رسالة في فضل الخلفاء الراشدين"),
]
SIYAR = "data/0748Dhahabi/0748Dhahabi.SiyarAclamNubala/0748Dhahabi.SiyarAclamNubala.Shamela0010906-ara1.mARkdown"

def clean(s):
    s = re.sub(r"PageV\d+P\d+", "", s); s = re.sub(r"\bms\d+\b", "", s)
    s = s.replace("NOTMATCH", "").replace("AUT ", "")
    return re.sub(r"\s+", " ", s).strip()

def parse(lines):
    """-> list of chapters {t, l, p:[paragraphs]}"""
    chs, cur, para = [], {"t": "", "l": 1, "p": []}, None
    def flush():
        nonlocal para
        if para is not None:
            x = clean(para)
            if x and not re.fullmatch(r"[\d\s\(\)\-–]*", x): cur["p"].append(x)
        para = None
    for ln in lines:
        ln = ln.rstrip("\n")
        if ln.startswith("#META#") or ln.startswith("######OpenITI"): continue
        m = re.match(r"^### (\|+|\$+)\s*(.*)$", ln)
        if m:
            flush()
            if cur["p"] or cur["t"]: chs.append(cur)
            mark = m.group(1); t = clean(m.group(2))
            t = re.sub(r"^(?:CHECK|AUTO|EDITOR\|?|\$|\|)+\s*", "", t).strip(" -:|[]")
            t = re.sub(r"^\d+\s*-\s*", "", t); t = re.sub(r"\s*\*+.*$", "", t) if mark[0] == "$" else t
            cur = {"t": t, "l": len(mark) if mark[0] == "|" else 3, "p": []}
            continue
        if ln.startswith("# "): flush(); para = ln[2:]
        elif ln.startswith("~~") and para is not None: para += " " + ln[2:]
        elif ln.strip() and para is not None: para += " " + ln
    flush(); chs.append(cur)
    chs = [c for c in chs if c["p"]]  # headings without text add nothing to read
    # untitled long runs -> split for easy reading
    out = []
    AR = str.maketrans("0123456789", "٠١٢٣٤٥٦٧٨٩")
    for c in chs:
        if len(c["p"]) > 60 or sum(map(len, c["p"])) > 24000:
            base = c["t"] or "القسم"; parts, cur, n = [], [], 0
            for x in c["p"]:
                cur.append(x); n += len(x)
                if len(cur) >= 40 or n > 12000: parts.append(cur); cur, n = [], 0
            if cur: parts.append(cur)
            for k, ps in enumerate(parts):
                x = {"t": base if k == 0 and c["t"] else f"{base} ({str(k+1).translate(AR)})", "l": c["l"], "p": ps}
                if k: x["k"] = 1  # continuation: hidden from the table of contents
                out.append(x)
        else: out.append(c)
    for c in out:
        if not c["t"] or c["t"].startswith("بسم الله"): c["t"] = "المقدمة" if out.index(c) == 0 else "تتمة"
    return out

def body(path):
    L = open(os.path.join(ROOT, path), encoding="utf-8").read().split("\n")
    i = next((k for k, x in enumerate(L) if "#META#Header#End" in x), -1)
    return L[i+1:]

os.makedirs(OUT, exist_ok=True)
info = {}
for bid, path, title in BOOKS:
    ch = parse(body(path))
    b = {"id": bid, "title": title, "author": "شيخ الإسلام أحمد بن عبد الحليم ابن تيمية (ت ٧٢٨هـ)", "src": "OpenITI: " + os.path.basename(path), "ch": ch}
    json.dump(b, open(os.path.join(OUT, bid + ".json"), "w"), ensure_ascii=False, separators=(",", ":"))
    info[bid] = (len(ch), sum(len(" ".join(c["p"])) for c in ch))
# companions: al-Khulafa al-Rashidun and the Companions, Siyar volumes 1 (from the caliphs) to 3
L = body(SIYAR); full = open(os.path.join(ROOT, SIYAR), encoding="utf-8").read().split("\n")
a = next(k for k, x in enumerate(full) if x.startswith("### |  [سير الخلفاء الراشدين]"))
paras = [k for k, x in enumerate(full) if x.startswith("### |PARATEXT|")]
e = paras[3]  # start of volume 4 (tabi'un)
ch = [c for c in parse(full[a+1:e]) if c["t"] != "PARATEXT"]
b = {"id": "sahaba", "title": "سير الخلفاء الراشدين والصحابة", "author": "الإمام شمس الدين الذهبي (ت ٧٤٨هـ)، من «سير أعلام النبلاء» (المجلدات ١–٣)", "src": "OpenITI: " + os.path.basename(SIYAR), "ch": ch}
json.dump(b, open(os.path.join(OUT, "sahaba.json"), "w"), ensure_ascii=False, separators=(",", ":"))
info["sahaba"] = (len(ch), sum(len(" ".join(c["p"])) for c in ch))
for k, v in info.items(): print(k, v)
