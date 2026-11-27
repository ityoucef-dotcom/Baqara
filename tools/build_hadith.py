"""Build data/hadith/{bukhari,muslim,tirmidhi}.json.
Texts and gradings: fawazahmed0/hadith-api (Unlicense); Arabic book titles: AhmedBaset/hadith-json."""
import json, os, re, urllib.request
OUT = os.path.join(os.path.dirname(__file__), "..", "data", "hadith"); os.makedirs(OUT, exist_ok=True)
CACHE = "/tmp/hd"
def get(name, url):
    p = os.path.join(CACHE, name)
    if not os.path.exists(p): os.makedirs(CACHE, exist_ok=True); urllib.request.urlretrieve(url, p)
    return json.load(open(p))
G = {"Sahih":"صحيح","Hasan":"حسن","Hasan Sahih":"حسن صحيح","Daif":"ضعيف","Very Daif":"ضعيف جداً","Mawdu":"موضوع","Munkar":"منكر","Shadh":"شاذ",
     "Sahih Isnaad":"صحيح الإسناد","Hasan Isnaad":"حسن الإسناد","Daif Isnaad":"ضعيف الإسناد","Very Daif Isnaad":"ضعيف الإسناد جداً","Sahih Hadith":"صحيح",
     "Sahih Muquf":"صحيح موقوف","Sahih Isnaad Mauquf":"صحيح الإسناد موقوف","Daif Isnaad Maqtu":"ضعيف الإسناد مقطوع","Sahih Mutawatir":"صحيح متواتر",
     "Sahih Matn":"صحيح المتن","Sahih Isnaad Maqtu":"صحيح الإسناد مقطوع","Daif Maqtu":"ضعيف مقطوع","Hasan Sahih Isnaad":"حسن صحيح الإسناد","Maqtu":"مقطوع",
     "Sahih Lighairihi":"صحيح لغيره","Hasan Lighairihi":"حسن لغيره"}
META = {"bukhari": ("صحيح البخاري", "الإمام محمد بن إسماعيل البخاري (ت ٢٥٦هـ)"),
        "muslim": ("صحيح مسلم", "الإمام مسلم بن الحجاج النيسابوري (ت ٢٦١هـ)"),
        "tirmidhi": ("جامع الترمذي", "الإمام أبو عيسى محمد بن عيسى الترمذي (ت ٢٧٩هـ)")}
for b, (title, author) in META.items():
    f = get(f"ara-{b}.json", f"https://raw.githubusercontent.com/fawazahmed0/hadith-api/1/editions/ara-{b}.min.json")
    a = get(f"ab-{b}.json", f"https://raw.githubusercontent.com/AhmedBaset/hadith-json/main/db/by_book/the_9_books/{b}.json")
    ar = {c["english"].strip().lower(): c["arabic"].strip() for c in a["chapters"]}
    secs = f["metadata"]["sections"]
    books = []
    for k, v in sorted(secs.items(), key=lambda x: int(x[0])):
        if not v and k == "0": continue
        books.append([int(k), ar.get(v.strip().lower(), v) if v else "المقدمة"])
    if b == "muslim" and "0" in secs: books = [[0, "مقدمة الإمام مسلم"]] + [x for x in books if x[0] != 0]
    H = []
    for h in f["hadiths"]:
        t = re.sub(r"\s+", " ", h["text"].replace("‏", "")).strip()
        if not t: continue
        n = h.get("arabicnumber") or h["hadithnumber"]
        n = int(n) if float(n).is_integer() else n
        row = [n, h["reference"]["book"], t]
        if b == "tirmidhi":
            g = {x["name"]: x["grade"] for x in h.get("grades", [])}
            alb = g.get("Al-Albani"); row.append(G.get(alb, alb) if alb else "")
        H.append(row)
    used = {r[1] for r in H}; books = [x for x in books if x[0] in used]
    json.dump({"id": b, "title": title, "author": author, "books": books, "h": H}, open(os.path.join(OUT, b + ".json"), "w"), ensure_ascii=False, separators=(",", ":"))
    print(b, len(books), len(H), os.path.getsize(os.path.join(OUT, b + ".json")))
