"""Build more library books from OpenITI mARkdown (CC BY-NC-SA 4.0, https://openiti.org).
Usage: python3 tools/build_library_more.py DIR   (DIR holds the raw OpenITI files named below)."""
import json, re, sys, os
SRC = sys.argv[1] if len(sys.argv) > 1 else "/home/claude/openiti/sel"
OUT = os.path.join(os.path.dirname(__file__), "..", "data", "library")
AR = str.maketrans("0123456789", "٠١٢٣٤٥٦٧٨٩")
# id, file prefix, title, author
BOOKS = [
 ("sira_hisham", "0213IbnHisham.SiraNabawiyya", "السيرة النبوية (سيرة ابن هشام)", "عبد الملك بن هشام (ت ٢١٣هـ)، تهذيب سيرة ابن إسحاق (ت ١٥١هـ)"),
 ("shamail", "0279Tirmidhi.ShamailMuhammadiyya", "الشمائل المحمدية", "الإمام أبو عيسى الترمذي (ت ٢٧٩هـ)"),
 ("zad", "0751IbnQayyimJawziyya.ZadMacad", "زاد المعاد في هدي خير العباد", "الإمام ابن قيم الجوزية (ت ٧٥١هـ)"),
 ("fusul_sira", "0774IbnKathir.FusulMinSira", "الفصول في سيرة الرسول ﷺ", "الحافظ إسماعيل بن كثير (ت ٧٧٤هـ)"),
 ("mukhtasar_sira", "1206IbnCabdWahhab.MukhtasarSira", "مختصر سيرة الرسول ﷺ", "الشيخ محمد بن عبد الوهاب (ت ١٢٠٦هـ)"),
 ("usul_sunna", "0241IbnHanbal.UsulSunna", "أصول السنة", "الإمام أحمد بن حنبل (ت ٢٤١هـ)"),
 ("tahawiyya", "0321Tahawi.MatnCaqida", "العقيدة الطحاوية", "الإمام أبو جعفر الطحاوي (ت ٣٢١هـ)"),
 ("barbahari", "0329Barbahari.SharhSunna", "شرح السنة", "الإمام الحسن بن علي البربهاري (ت ٣٢٩هـ)"),
 ("lumca", "0620IbnQudamaMaqdisi.LumcatIctiqad", "لمعة الاعتقاد", "الإمام موفق الدين ابن قدامة المقدسي (ت ٦٢٠هـ)"),
 ("kitab_tawhid", "1206IbnCabdWahhab.Tawhid", "كتاب التوحيد", "الشيخ محمد بن عبد الوهاب (ت ١٢٠٦هـ)"),
 ("thalatha", "1206IbnCabdWahhab.ThalathatUsul", "ثلاثة الأصول وأدلتها", "الشيخ محمد بن عبد الوهاب (ت ١٢٠٦هـ)"),
 ("kashf", "1206IbnCabdWahhab.KashfShubuhat", "كشف الشبهات", "الشيخ محمد بن عبد الوهاب (ت ١٢٠٦هـ)"),
 ("arbain", "0676Nawawi.ArbacunaNawawiyya", "الأربعون النووية", "الإمام يحيى بن شرف النووي (ت ٦٧٦هـ)"),
 ("riyad", "0676Nawawi.RiyadSalihin", "رياض الصالحين", "الإمام يحيى بن شرف النووي (ت ٦٧٦هـ)"),
 ("adhkar_nawawi", "0676Nawawi.Adhkar", "الأذكار", "الإمام يحيى بن شرف النووي (ت ٦٧٦هـ)"),
 ("jamic_ulum", "0795IbnRajabHanbali.JamicCulumWaHikam", "جامع العلوم والحكم في شرح خمسين حديثاً من جوامع الكلم", "الحافظ ابن رجب الحنبلي (ت ٧٩٥هـ)"),
 ("bulugh", "0852IbnHajarCasqalani.BulughMaram", "بلوغ المرام من أدلة الأحكام", "الحافظ ابن حجر العسقلاني (ت ٨٥٢هـ)"),
 ("minhaj", "0689AhmadIbnCabdRahmanIbnQudama.MukhtasarMinhajQasidin", "مختصر منهاج القاصدين", "الإمام نجم الدين أحمد بن عبد الرحمن ابن قدامة المقدسي (ت ٦٨٩هـ)"),
 ("wabil", "0751IbnQayyimJawziyya.WabilSayyib", "الوابل الصيب من الكلم الطيب", "الإمام ابن قيم الجوزية (ت ٧٥١هـ)"),
 ("fawaid", "0751IbnQayyimJawziyya.Fawaid", "الفوائد", "الإمام ابن قيم الجوزية (ت ٧٥١هـ)"),
 ("cuddat", "0751IbnQayyimJawziyya.CuddatSabirin", "عدة الصابرين وذخيرة الشاكرين", "الإمام ابن قيم الجوزية (ت ٧٥١هـ)"),
 ("lataif", "0795IbnRajabHanbali.LataifMacarif", "لطائف المعارف فيما لمواسم العام من الوظائف", "الحافظ ابن رجب الحنبلي (ت ٧٩٥هـ)"),
 ("cumdat_fiqh", "0620IbnQudamaMaqdisi.CumdatFiqh", "عمدة الفقه", "الإمام موفق الدين ابن قدامة المقدسي (ت ٦٢٠هـ)"),
 ("ibn_kathir", "0774IbnKathir.TafsirQuran", "تفسير القرآن العظيم (تفسير ابن كثير)", "الحافظ إسماعيل بن كثير (ت ٧٧٤هـ)"),
 ("sacdi", "1376CabdRahmanSacdi.TaysirKarimRahman", "تيسير الكريم الرحمن في تفسير كلام المنان (تفسير السعدي)", "الشيخ عبد الرحمن بن ناصر السعدي (ت ١٣٧٦هـ)"),
]
def clean(s):
    s = re.sub(r"PageV\d+P\d+", "", s); s = re.sub(r"\bms\d+\b", "", s)
    s = s.replace("NOTMATCH", "").replace("AUT ", "")
    s = re.sub(r"(?:^|\s)\$+(?=\s)", " ", " " + s + " ")
    return re.sub(r"\s+", " ", s).strip()
ENDS = tuple(".:!؟?»\"”)]﴾﴿")
NUMHEAD = re.compile(r"^\[?\s*[\d٠-٩]+(?:\s*/\s*[\d٠-٩]+)?\s*[\-–ـ]?\s*\]?$")
TITLE = ""
def parse(lines, bid):
    chs, cur, para, page = [], {"t": "", "l": 1, "p": []}, None, False
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
            mark = m.group(1); t = clean(m.group(2))
            if re.fullmatch(r"\[?ص:\s*[\d٠-٩]+\]?", t): page = True; continue  # printed page number
            if para is not None and ("»" in t or "«" in t) and not clean(para).endswith(ENDS): para += " " + t; continue  # quote broken into a heading
            flush(); page = False
            t = re.sub(r"^(?:CHECK|AUTO|EDITOR\|?|\$|\|)+\s*", "", t).strip(" -:|")
            if bid == "sacdi":
                sm = re.match(r"^\[?\d+\s*-\s*(سورة .*?)\]?$", t)
                if sm: t = sm.group(1)
                else:
                    vm = re.match(r"^\[?(\d+)\.(\d+)(?:-(\d+))?\]?$", t)
                    if vm:  # verse group: becomes a label paragraph inside the surah
                        a, b = vm.group(2), vm.group(3)
                        para = ("الآيات " + a.translate(AR) + "–" + b.translate(AR)) if b else ("الآية " + a.translate(AR)); flush(); continue
            if NUMHEAD.match(t) or not t:  # numbered hadith heading: keep inside the current chapter
                para = "(" + re.sub(r"[\[\]\s\-–ـ]", "", t).translate(AR) + ") " if t else ""; continue
            if cur["p"] or cur["t"]: chs.append(cur)
            t = t.replace("[", "").replace("]", "").strip("() ")
            if bid == "minhaj": t = re.sub(r"^[\d٠-٩]+\s+", "", t)
            cur = {"t": t, "l": len(mark) if mark[0] == "|" else 3, "p": []}
            continue
        if re.fullmatch(r"#\s*PageV\d+P\d+\s*", ln) or re.fullmatch(r"~~\s*PageV\d+P\d+\s*", ln): page = True; continue
        if ln.startswith("# "):
            txt = ln[2:]
            if para is not None and (page or para.rstrip().endswith("PageV")) and not clean(para).endswith(ENDS) and len(clean(para)) > 0 and not re.match(r"^\s*[\d٠-٩]+\s", txt):
                para += " " + txt  # page break inside a sentence
            elif para is not None and para.endswith(") ") and len(para) < 12: para += txt
            else: flush(); para = txt
            page = False
        elif ln.startswith("~~") and para is not None: para += " " + ln[2:]
        elif ln.strip() and para is not None: para += " " + ln
    flush(); chs.append(cur)
    chs = [c for c in chs if c["p"]]
    out = []
    for c in chs:
        if len(c["p"]) > 60 or sum(map(len, c["p"])) > 24000:
            base = c["t"] or TITLE; parts, cu, n = [], [], 0
            for x in c["p"]:
                cu.append(x); n += len(x)
                if len(cu) >= 40 or n > 12000: parts.append(cu); cu, n = [], 0
            if cu: parts.append(cu)
            for k, ps in enumerate(parts):
                x = {"t": base if k == 0 else f"{base} ({str(k+1).translate(AR)})", "l": c["l"], "p": ps}
                if k: x["k"] = 1
                out.append(x)
        else: out.append(c)
    for i, c in enumerate(out):
        if c["t"] == "القسم": c["t"] = TITLE
        if not c["t"] or c["t"].startswith("بسم الله"): c["t"] = "المقدمة" if i == 0 else "تتمة"
    return out
files = os.listdir(SRC); info = {}
for bid, pre, title, author in BOOKS:
    fn = next(f for f in files if f.startswith(pre + "."))
    L = open(os.path.join(SRC, fn), encoding="utf-8").read().split("\n")
    i = next((k for k, x in enumerate(L) if "#META#Header#End" in x), -1)
    TITLE = title; ch = parse(L[i+1:], bid)
    json.dump({"id": bid, "title": title, "author": author, "src": "OpenITI: " + fn, "ch": ch},
              open(os.path.join(OUT, bid + ".json"), "w"), ensure_ascii=False, separators=(",", ":"))
    info[bid] = (len(ch), len([c for c in ch if not c.get("k")]), round(os.path.getsize(os.path.join(OUT, bid + ".json"))/1e6, 2))
for k, v in info.items(): print(k, v)
