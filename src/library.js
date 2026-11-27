/* ----- المكتبة: أمهات كتب السنة (OpenITI) + كتب الحديث التسعة إلا مسند أحمد والدارمي (hadith-api) ----- */
Object.assign(ICONS, {
  library:'<path d="M4 19.5V5a1 1 0 0 1 1-1h3v15.5M8 4h3v15.5M11 5.5l3-1 4.2 14.5-3 .9z"/><path d="M3 19.5h18"/>',
  scroll:'<path d="M7 4h11a2 2 0 0 1 0 4h-1v10a2 2 0 0 1-2 2H6a2 2 0 0 1 0-4h1z"/><path d="M7 16V6a2 2 0 0 0-4 0v1h4M10 9h5M10 12h5"/>',
  search:'<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>',
  pen:'<path d="M4 20l1-4 11-11 3 3-11 11z"/><path d="M14 7l3 3"/>',
  copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  download:'<path d="M12 4v11M7.5 10.5L12 15l4.5-4.5M5 19.5h14"/>',
  ext:'<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  x:'<path d="M6 6l12 12M18 6L6 18"/>',
});
const LIB_DIR = "data/";
const HCOLS = [["bukhari","صحيح البخاري"],["muslim","صحيح مسلم"],["abudawud","سنن أبي داود"],["tirmidhi","جامع الترمذي"],["nasai","سنن النسائي"],["ibnmajah","سنن ابن ماجه"],["malik","موطأ الإمام مالك"]];
const HGRADED = new Set(["tirmidhi","abudawud","nasai","ibnmajah"]);
const LCATS = [["السيرة","السيرة النبوية والشمائل","star"],["العقيدة","العقيدة","shield"],["الحديث وشروحه","الحديث وشروحه","scroll"],["التفسير","التفسير","book"],["التزكية والرقائق","التزكية والرقائق","heart"],["الفقه","الفقه","book"],["ابن تيمية","كتب شيخ الإسلام ابن تيمية","book"],["الصحابة","سير الصحابة","scroll"]];
const LCOL = [["y","#f6d86b"],["g","#8fdca8"],["b","#9cc8f5"],["k","#f3a6c8"]];
const LB = { bc:"", view:"home", seg:"books", q:"", book:null, ch:0, col:null, hb:null, hq:"", hf:"all", lim:25, sel:null, act:null, cat:null };
const LBD = { books:{}, hcol:{}, norm:{} };
function LS(){ S.lib = S.lib || {}; S.lib.hl = S.lib.hl || {}; S.lib.nt = S.lib.nt || {}; S.lib.pos = S.lib.pos || {}; return S.lib; }
// Arabic search: ignore harakat, tatweel and letter variants
const lbNorm = s => String(s).replace(/[ؐ-ًؚ-ٰٟۖ-ۭـ‏‎]/g,"").replace(/[إأآٱ]/g,"ا").replace(/ى/g,"ي").replace(/ة/g,"ه").replace(/ؤ/g,"و").replace(/ئ/g,"ي");
function lbNormMap(s){ let n = "", m = []; for (let i=0;i<s.length;i++){ const c = lbNorm(s[i]); if (c){ n += c; m.push(i); } } m.push(s.length); return [n, m]; }
function lbSnippet(text, q, span=70){
  const [n, m] = lbNormMap(text), qi = n.indexOf(lbNorm(q)); if (qi < 0) return esc(text.slice(0, span*2)) + "…";
  const a = m[qi], b = m[qi + lbNorm(q).length], s0 = Math.max(0, a - span), e0 = Math.min(text.length, b + span);
  return (s0>0?"…":"") + esc(text.slice(s0, a)) + `<mark class="lb-q">${esc(text.slice(a, b))}</mark>` + esc(text.slice(b, e0)) + (e0<text.length?"…":"");
}
async function lbCat(){ if (!LB.cat){ const r = await fetch(LIB_DIR+"library/catalog.json"); LB.cat = await r.json(); } return LB.cat; }
const lbPath = (kind, id) => LIB_DIR + kind + "/" + id + ".json";
async function lbIsSaved(kind, id){
  if (window.NATIVE_APP) return true;
  try { const c = await caches.open("lib-v1"); return !!(await c.match(new URL(lbPath(kind,id), location.href).pathname)); } catch(e){ return false; }
}
async function lbLoad(kind, id){
  const store = kind==="library" ? LBD.books : LBD.hcol; if (store[id]) return store[id];
  const url = lbPath(kind, id); let r;
  try { const c = await caches.open("lib-v1"); r = await c.match(new URL(url, location.href).pathname); } catch(e){}
  if (!r){ r = await fetch(url); if (!r.ok) throw new Error("http " + r.status);
    try { const c = await caches.open("lib-v1"); await c.put(new URL(url, location.href).pathname, r.clone()); } catch(e){} }
  return store[id] = await r.json();
}
function lbSize(kind, id){ const z = {"sira_hisham": 2.6, "riyad": 1.2, "sacdi": 5.3, "minhaj": 1.0, "lataif": 1.1, "ibn_kathir": 15.2, "zad": 5.4, "adhkar_nawawi": 1.1, "jamic_ulum": 1.8, "sahaba": 4.0, "ibnmajah": 3.8, "abudawud": 5.2, "tirmidhi": 5.5, "muslim": 7.5, "malik": 1.7, "nasai": 5.2, "bukhari": 8.5}; return z[id] ? `${AR(z[id])} م.ب` : "أقل من ١ م.ب"; }

/* ---------- text with highlights ---------- */
function lbMarked(key, text){
  const h = LS().hl[key]; if (!h || !h.r || !h.r.length) return esc(text);
  const R = h.r.slice().sort((a,b)=>a[0]-b[0]); let out = "", i = 0;
  for (const [s,e,c] of R){ if (s < i) continue; out += esc(text.slice(i, s)) + `<mark class="lb-hl lb-${c}">${esc(text.slice(s, e))}</mark>`; i = e; }
  return out + esc(text.slice(i));
}
function lbPara(key, text, extra=""){
  const h = LS().hl[key], nt = LS().nt[key];
  return `<div class="lb-p ${h&&h.c?"lb-"+h.c+"bg":""}" data-k="${key}" ${extra}><span class="lb-t">${lbMarked(key, text)}</span>${nt?`<div class="lb-note">${ic("pen")}${esc(nt)}</div>`:""}</div>`;
}
// selection offsets inside one .lb-t
function lbOffset(root, node, off){ let n = 0; const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let t; while ((t = w.nextNode())){ if (t === node) return n + off; n += t.length; } return n; }
document.addEventListener("selectionchange", ()=>{
  if (tab !== "library") return;
  const s = document.getSelection(); if (!s || s.isCollapsed || !s.rangeCount){ return; }
  const r = s.getRangeAt(0), a = r.startContainer.parentElement && r.startContainer.parentElement.closest(".lb-t"), b = r.endContainer.parentElement && r.endContainer.parentElement.closest(".lb-t");
  if (!a || a !== b) return;
  const p = a.closest(".lb-p"), st = lbOffset(a, r.startContainer, r.startOffset), en = lbOffset(a, r.endContainer, r.endOffset);
  if (en > st){ LB.sel = {k:p.dataset.k, s:st, e:en}; lbBar(p, true); }
});
function lbTextOf(k){ const el = document.querySelector(`.lb-p[data-k="${CSS.escape(k)}"] .lb-t`); return el ? el.textContent : ""; }
function lbBar(p, sel){
  document.querySelectorAll(".lb-p.on").forEach(x=>x.classList.remove("on")); p.classList.add("on"); LB.act = p.dataset.k;
  let bar = document.getElementById("lbBar");
  if (!bar){ bar = document.createElement("div"); bar.id = "lbBar"; bar.className = "lb-bar"; document.body.appendChild(bar); }
  const isH = LB.act.startsWith("h:");
  bar.innerHTML = `<div class="lb-bar-in"><span class="small muted">${sel?"لوّن النص المحدد":"لوّن الفقرة"}</span>
    <div class="lb-cols">${LCOL.map(([c,v])=>`<button data-lc="${c}" style="--c:${v}" aria-label="لون"></button>`).join("")}<button data-lc="" class="lb-clr" aria-label="إزالة التلوين">${ic("x")}</button></div>
    <div class="lb-acts"><button class="btn" data-la="note">${ic("pen")}ملاحظة</button><button class="btn" data-la="copy">${ic("copy")}نسخ</button>${isH?`<button class="btn" data-la="sharh">${ic("ext")}الشرح</button>`:""}<button class="btn icon" data-la="close" aria-label="إغلاق">${ic("x")}</button></div></div>`;
  bar.hidden = false;
  bar.querySelectorAll("button").forEach(b=>b.addEventListener("pointerdown", e=>e.preventDefault()));
}
function lbCloseBar(){ const b = document.getElementById("lbBar"); if (b) b.hidden = true; document.querySelectorAll(".lb-p.on").forEach(x=>x.classList.remove("on")); LB.act = null; LB.sel = null; }
document.addEventListener("click", e=>{
  const bar = e.target.closest("#lbBar");
  if (bar){
    const k = LB.act; if (!k) return; const L = LS();
    const lc = e.target.closest("[data-lc]"), la = e.target.closest("[data-la]");
    if (lc){
      const c = lc.dataset.lc, h = L.hl[k] = L.hl[k] || {};
      if (LB.sel && LB.sel.k === k){ h.r = (h.r||[]).filter(([s,e2])=>e2 <= LB.sel.s || s >= LB.sel.e); if (c) h.r.push([LB.sel.s, LB.sel.e, c]); }
      else { if (c) h.c = c; else { delete h.c; delete h.r; } }
      if (!h.c && !(h.r&&h.r.length)) delete L.hl[k];
      save(); buzz(); try { document.getSelection().removeAllRanges(); } catch(_){}
      lbCloseBar(); renderLibrary(true); return;
    }
    if (la){
      const a = la.dataset.la;
      if (a==="close") return lbCloseBar();
      if (a==="copy"){ const t = lbTextOf(k); navigator.clipboard && navigator.clipboard.writeText(t + "\n— " + lbCite(k)).then(()=>toast("نُسخ النص مع مصدره")).catch(()=>toast("تعذّر النسخ")); return; }
      if (a==="sharh"){ const t = lbNorm(lbTextOf(k)), q = (t.match(/[\"«](.{12,60}?)\s/)||[])[1] || t.split(" ").slice(-12).join(" "); window.open("https://dorar.net/hadith/search?q=" + encodeURIComponent(q.trim()), "_blank", "noopener"); return; }
      if (a==="note"){ lbNoteSheet(k); return; }
    }
    return;
  }
  if (tab !== "library") return;
  const p = e.target.closest(".lb-p");
  if (p && !e.target.closest("a,button,textarea,input")){ const s = document.getSelection(); if (s && !s.isCollapsed) return; LB.sel = null; if (LB.act === p.dataset.k) return lbCloseBar(); lbBar(p, false); return; }
});
function lbCite(k){
  const [t, id, a, b] = k.split(":");
  if (t === "h"){ const C = LBD.hcol[id], h = C && C.h[+a]; return `${C?C.title:""} (${h?AR(Math.floor(h[0])):""})`; }
  const B = LBD.books[id]; return B ? `${B.title} لـ${B.author.split("(")[0].trim()}` : "";
}
function lbNoteSheet(k){
  const cur = LS().nt[k] || "";
  openSheet(`<h2 id="shTitle">ملاحظتك</h2><p class="small muted" style="margin:0 2px 8px">${esc(lbCite(k))}</p>
    <textarea id="lbNt" class="lb-ta" rows="6" placeholder="اكتب فائدة أو تعليقاً…">${esc(cur)}</textarea>
    <div class="row" style="margin-top:10px"><button class="btn primary" id="lbNtS">${ic("check")}حفظ</button>${cur?`<button class="btn" id="lbNtD">حذف الملاحظة</button>`:""}</div>`);
  setTimeout(()=>{ const t = $("#lbNt"); t && t.focus(); }, 250);
  $("#lbNtS").onclick = ()=>{ const v = $("#lbNt").value.trim(); if (v) LS().nt[k] = v; else delete LS().nt[k]; save(); closeSheet(); lbCloseBar(); renderLibrary(true); toast("حُفظت الملاحظة"); };
  const d = $("#lbNtD"); if (d) d.onclick = ()=>{ delete LS().nt[k]; save(); closeSheet(); lbCloseBar(); renderLibrary(true); };
}
// my own summary for a chapter / hadith book
function lbMine(key, label){
  const v = LS().nt[key] || "";
  return `<details class="lb-mine" ${v?"open":""}><summary>${ic("pen")}${label}${v?" ✓":""}</summary>
    <textarea class="lb-ta" data-mine="${key}" rows="4" placeholder="اكتب ملخصك بكلماتك، يُحفظ تلقائياً">${esc(v)}</textarea></details>`;
}
document.addEventListener("input", e=>{ const t = e.target.closest("[data-mine]"); if (!t) return; const k = t.dataset.mine, v = t.value.trim(); if (v) LS().nt[k] = v; else delete LS().nt[k]; clearTimeout(t._t); t._t = setTimeout(save, 400); });

/* ---------- hadith topic summaries by the book title ---------- */
const HTOP = [
  [/الوحي/,"كيف بدأ نزول الوحي على النبي ﷺ وأحواله."],[/الإيمان/,"حقيقة الإيمان وأركانه وشعبه، وزيادته ونقصه، وعلامات النفاق."],[/العلم/,"فضل العلم وآداب طلبه وتبليغه والفتيا."],
  [/الطهارة|الوضوء|الغسل|التيمم/,"أحكام الطهارة: الوضوء والغسل والتيمم ونواقضها وصفة الماء."],[/الحيض/,"أحكام الحيض والاستحاضة والنفاس."],
  [/مواقيت/,"أوقات الصلوات الخمس وفضل المحافظة عليها."],[/الأذان/,"الأذان والإقامة وصفة الصلاة والجماعة والإمامة."],[/الجمعة/,"فضل يوم الجمعة وصلاتها وخطبتها وآدابها."],
  [/الخوف/,"صفة صلاة الخوف."],[/العيدين|العيد/,"صلاة العيدين وسننهما."],[/الوتر/,"صلاة الوتر ووقتها وعدد ركعاتها."],[/الاستسقاء/,"صلاة الاستسقاء والدعاء لنزول المطر."],
  [/الكسوف/,"صلاة الكسوف والخسوف."],[/سجود القرآن|سجود التلاوة/,"سجود التلاوة ومواضعه."],[/تقصير|السفر/,"قصر الصلاة وجمعها في السفر وآدابه."],
  [/التهجد|قيام الليل|التطوع/,"قيام الليل وصلاة التطوع والسنن الرواتب."],[/السهو/,"سجود السهو وأسبابه."],[/الجنائز/,"أحكام الجنائز: الغسل والتكفين والصلاة والدفن والتعزية."],
  [/الزكاة/,"وجوب الزكاة وأنصبتها ومصارفها وفضل الصدقة."],[/الحج|المناسك|العمرة|المحصر|جزاء الصيد|فضائل المدينة/,"مناسك الحج والعمرة وأحكام الإحرام والمحظورات وفضل الحرمين."],
  [/الصوم|الصيام|التراويح|ليلة القدر|الاعتكاف/,"الصيام: فرضه وآدابه ومفسداته وقيام رمضان وليلة القدر والاعتكاف."],
  [/البيوع|السلم|الشفعة|الإجارة|الحوالة|الكفالة|الوكالة|المزارعة|المساقاة|الاستقراض|الخصومات|اللقطة|المظالم|الشركة|الرهن|العتق|المكاتب|الهبة|المساقاة/,"المعاملات: البيع والشراء والإجارة والرهن والهبة وأداء الحقوق وتحريم الظلم."],
  [/الشهادات/,"الشهادات وأحكامها وتزكية الشهود."],[/الصلح/,"الإصلاح بين الناس وأحكام الصلح."],[/الشروط/,"الشروط في العقود والمعاملات."],
  [/الوصايا/,"أحكام الوصية والوقف."],[/الجهاد|السير|الخمس|الجزية|الإمارة|المغازي/,"الجهاد وفضله وآدابه، والغزوات والسرايا، وأحكام الغنائم والإمارة."],
  [/بدء الخلق/,"بدء الخلق: السماوات والأرض والملائكة والجنة والنار والجن."],[/الأنبياء|أحاديث الأنبياء/,"قصص الأنبياء عليهم السلام."],
  [/المناقب|فضائل الصحابة|فضائل أصحاب|مناقب/,"فضائل النبي ﷺ وأصحابه وآل بيته رضي الله عنهم."],[/التفسير|تفسير القرآن/,"تفسير آيات من القرآن وأسباب نزولها."],
  [/فضائل القرآن|القراءات|ثواب القرآن/,"فضائل القرآن وتلاوته وجمعه وآداب قراءته."],[/النكاح|الرضاع|الطلاق|اللعان|العدة|النفقات/,"النكاح والطلاق والرضاع والعدة والنفقة وحقوق الزوجين."],
  [/الأطعمة|العقيقة|الذبائح|الصيد|الأضاحي|الأشربة/,"الأطعمة والأشربة والذبائح والأضاحي والعقيقة وآدابها."],[/المرضى|الطب/,"عيادة المريض والتداوي والرقية."],
  [/اللباس|الزينة/,"اللباس والزينة وما يحل منهما وما يحرم."],[/الأدب|البر والصلة|البر/,"الأخلاق والآداب: بر الوالدين وصلة الرحم وحسن الجوار وحفظ اللسان."],
  [/الاستئذان|السلام/,"آداب الاستئذان والسلام والمجالس."],[/الدعوات|الذكر والدعاء|الدعاء/,"الأذكار والأدعية وفضل الاستغفار."],[/الرقاق|الزهد|صفة القيامة|الرقائق|التوبة/,"الرقائق: الزهد في الدنيا والتوبة والاستعداد للآخرة."],
  [/القدر/,"الإيمان بالقضاء والقدر."],[/الأيمان|النذور|الكفارات/,"الأيمان والنذور وكفاراتها."],[/الفرائض/,"المواريث وقسمتها."],[/الحدود|المحاربين|الديات|القسامة|القصاص/,"الحدود والقصاص والديات."],
  [/الإكراه|الحيل/,"أحكام الإكراه وتحريم الحيل على الشرع."],[/التعبير|الرؤيا/,"الرؤيا وتعبيرها وآدابها."],[/الفتن|أشراط الساعة/,"الفتن وأشراط الساعة والعصمة منها."],
  [/الأحكام|الأقضية/,"القضاء والأحكام وآداب القاضي وطاعة ولاة الأمر في المعروف."],[/التمني/,"ما يجوز من التمني وما يُكره."],[/أخبار الآحاد/,"قبول خبر الواحد الثقة في الدين."],
  [/الاعتصام/,"الاعتصام بالكتاب والسنة وذم البدع والتنطع."],[/التوحيد/,"توحيد الله وأسماؤه وصفاته والرد على المخالفين."],[/الجنة|صفة الجنة/,"صفة الجنة ونعيمها وأهلها."],[/جهنم|النار/,"صفة النار وأهوالها، أعاذنا الله منها."],
  [/المساجد/,"المساجد ومواضع الصلاة وأحكامها."],[/صلاة المسافرين/,"صلاة المسافرين وقصرها وقيام الليل."],[/السلام/,"آداب السلام."],[/الألفاظ/,"الألفاظ المنهي عنها من الأدب."],[/الشعر/,"الشعر ما يحمد منه وما يذم."],
  [/المقدمة|مقدمة/,"مقدمة المصنف في منهجه وفي التحذير من الكذب على النبي ﷺ."],[/العلل/,"كلام الترمذي في علل الأحاديث ومنهجه في كتابه."],[/الأمثال/,"الأمثال التي ضربها النبي ﷺ."],[/صفة المنافقين/,"صفات المنافقين وأحكامهم."],
];
const hTopic = t => { for (const [re, s] of HTOP) if (re.test(t)) return s; return ""; };
function hGradeCls(g){ if (!g) return ""; if (/ضعيف|موضوع|منكر|شاذ/.test(g)) return "bad"; if (/صحيح|حسن/.test(g)) return "ok"; return "mid"; }
function hCard(id, i, h, q){
  const key = `h:${id}:${i}`, g = HGRADED.has(id) ? h[3] : (id==="malik" ? "" : "صحيح");
  const body = q ? `<span class="lb-t">${lbSnippet(h[2], q, 160)}</span>` : `<span class="lb-t">${lbMarked(key, h[2])}</span>`;
  const H = LS().hl[key], nt = LS().nt[key];
  return `<article class="lb-p lb-h ${H&&H.c?"lb-"+H.c+"bg":""}" data-k="${key}">
    <div class="lb-hh"><span class="lb-num">${AR(Math.floor(h[0]))}</span>${g?`<span class="lb-gr ${hGradeCls(g)}">${g}${HGRADED.has(id)?` <small>(الألباني)</small>`:""}</span>`:""}${q?`<button class="btn lb-open" data-hopen="${i}">فتح في بابه</button>`:""}</div>
    ${body}${nt?`<div class="lb-note">${ic("pen")}${esc(nt)}</div>`:""}</article>`;
}
function hNormAll(id){ if (!LBD.norm[id]) LBD.norm[id] = LBD.hcol[id].h.map(h=>lbNorm(h[2])); return LBD.norm[id]; }

/* ---------- views ---------- */
async function renderLibrary(keep){
  const v = $("#view"), y = keep ? scrollY : 0; LS();
  if (!keep) lbCloseBar();
  const head = (title, back, sub="")=>`<div class="lb-head">${back?`<button class="btn icon" data-lb="back" aria-label="رجوع">${ic("prev")}</button>`:""}<div><b>${title}</b>${sub?`<small>${sub}</small>`:""}</div></div>`;
  try {
    if (LB.view === "home"){
      const cat = await lbCat();
      const q = lbNorm(LB.q.trim());
      const books = cat.books.filter(b=>!q || lbNorm(b.title + " " + b.sum + " " + b.tag + " " + b.cat + " " + (b.by||"") + " " + b.author).includes(q));
      const saved = {}; await Promise.all([...cat.books.map(b=>lbIsSaved("library", b.id).then(x=>saved[b.id]=x)), ...HCOLS.map(([id])=>lbIsSaved("hadith", id).then(x=>saved[id]=x))]);
      const card = b=>`<article class="lb-card"><button class="lb-cmain" data-lbopen="${b.id}"><span class="lb-ci">${ic((LCATS.find(c=>c[0]===b.cat)||[])[2]||"book")}</span><span><b>${b.title}</b><small>${b.by||""} · ${b.tag}</small></span></button>
        <div class="lb-cact">${saved[b.id]?`<span class="lb-saved">${ic("check")}محمّل</span>`:`<button class="btn" data-lbdl="${b.id}">${ic("download")}تحميل <small>${lbSize("library", b.id)}</small></button>`}<button class="btn primary" data-lbopen="${b.id}">قراءة</button></div></article>`;
      v.innerHTML = `<div class="wrap lb" style="gap:14px">
        <section class="lb-hero"><span class="lb-hi">${ic("library")}</span><div><b>المكتبة</b><small>أمهات كتب السنة: السيرة والعقيدة والحديث والتفسير والتزكية، مع البحث والتلوين والملاحظات</small></div></section>
        <div class="seg lb-seg"><button class="${LB.seg==="books"?"on":""}" data-lbseg="books">${ic("book")}الكتب</button><button class="${LB.seg==="hadith"?"on":""}" data-lbseg="hadith">${ic("scroll")}كتب الحديث</button><button class="${LB.seg==="mine"?"on":""}" data-lbseg="mine">${ic("pen")}ملاحظاتي</button></div>
        ${LB.seg==="books" ? `<label class="lb-search">${ic("search")}<input id="lbQ" type="search" placeholder="ابحث عن كتاب أو موضوع: الصبر، التوبة، أبو بكر…" value="${esc(LB.q)}"></label>
          <div class="chips-x lb-cats"><button class="chip ${!LB.bc?"on":""}" data-lbcat="">الكل <small>${AR(cat.books.length)}</small></button>${LCATS.map(([c,t])=>`<button class="chip ${LB.bc===c?"on":""}" data-lbcat="${c}">${t}</button>`).join("")}${cat.mss?`<button class="chip ${LB.bc==="mss"?"on":""}" data-lbcat="mss">مخطوطات</button>`:""}</div>
          ${LCATS.filter(([c])=>!LB.bc||LB.bc===c).map(([c,t])=>{ const L = books.filter(b=>b.cat===c); return L.length?`<h2 class="hsec">${t}</h2><div class="lb-list">${L.map(card).join("")}</div>`:""; }).join("") || (LB.bc==="mss"?"":`<p class="muted">لا يوجد كتاب بهذا الاسم.</p>`)}
          ${cat.mss && (!LB.bc||LB.bc==="mss") ? `<h2 class="hsec">مخطوطات قديمة</h2><p class="small muted">صور مخطوطات أصلية محفوظة في مكتبات عالمية، تُفتح على موقع المكتبة (تحتاج إنترنت).</p><div class="lb-list">${cat.mss.filter(m=>!q||lbNorm(m.t+" "+m.d).includes(q)).map(m=>`<a class="lb-card lb-ms" href="${m.url}" target="_blank" rel="noopener"><span class="lb-cmain"><span class="lb-ci">${ic("scroll")}</span><span><b>${esc(m.t)}</b><small>${esc(m.date)} · ${esc(m.lib)}</small><small class="lb-msd">${esc(m.d)}</small></span></span><span class="btn">${ic("ext")}عرض المخطوطة</span></a>`).join("")}</div>` : ""}
          <p class="small muted">${esc(cat.note)}</p>`
        : LB.seg==="hadith" ? `<div class="lb-list">${HCOLS.map(([id,t])=>`<article class="lb-card"><button class="lb-cmain" data-hcol="${id}"><span class="lb-ci">${ic("scroll")}</span><span><b>${t}</b><small>${HGRADED.has(id)?"مع حكم الشيخ الألباني على كل حديث":id==="malik"?"أقدم ما وصلنا من كتب السنة المصنفة، رواية يحيى الليثي":"كل أحاديثه المسندة صحيحة"}</small></span></button>
            <div class="lb-cact">${saved[id]?`<span class="lb-saved">${ic("check")}محمّل</span>`:`<button class="btn" data-hdl="${id}">${ic("download")}تحميل <small>${lbSize("hadith", id)}</small></button>`}<button class="btn primary" data-hcol="${id}">تصفّح</button></div></article>`).join("")}</div>
          <p class="small muted">النصوص من مشروع hadith-api المفتوح، وأحكام السنن الأربع من تحقيق الشيخ الألباني. زر «الشرح» يفتح شروح الحديث في موسوعة الدرر السنية (يحتاج إنترنت).</p>`
        : lbMineHTML()}
      </div>`;
      const qi = $("#lbQ"); if (qi){ qi.oninput = ()=>{ LB.q = qi.value; clearTimeout(qi._t); qi._t = setTimeout(async ()=>{ const pos = qi.selectionStart; await renderLibrary(true); const n = $("#lbQ"); if (n){ n.focus(); n.setSelectionRange(pos,pos); } }, 250); }; }
    }
    else if (LB.view === "book" || LB.view === "chapter"){
      const cat = await lbCat(), meta = cat.books.find(b=>b.id===LB.book);
      v.innerHTML = `<div class="wrap lb"><p class="muted">${ic("download")} جارٍ فتح الكتاب…</p></div>`;
      const B = await lbLoad("library", LB.book);
      if (LB.view === "chapter"){
        const c = B.ch[LB.ch]; LS().pos[LB.book] = LB.ch; save();
        const prev = LB.ch>0, next = LB.ch < B.ch.length-1;
        v.innerHTML = `<div class="wrap lb" style="gap:12px">${head(c.t, true, B.title)}
          <div class="lb-read">${c.p.map((t,i)=>lbPara(`b:${B.id}:${LB.ch}:${i}`, t)).join("")}</div>
          ${lbMine(`bs:${B.id}:${LB.ch}`, "ملخصي لهذا الفصل")}
          <div class="lb-nav"><button class="btn" data-lbch="${LB.ch-1}" ${prev?"":"disabled"}>${ic("prev")}السابق</button><span class="small muted">${AR(LB.ch+1)} / ${AR(B.ch.length)}</span><button class="btn primary" data-lbch="${LB.ch+1}" ${next?"":"disabled"}>التالي${ic("next")}</button></div>
          <p class="small muted">اضغط على أي فقرة لتلوينها أو كتابة ملاحظة عليها، أو حدّد جزءاً منها ثم اختر اللون.</p></div>`;
      } else {
        const tabB = LB.btab || "sum", q = LB.bq || "";
        let body = "";
        if (tabB === "sum"){
          body = `<section class="panel lb-sum"><p>${esc(meta.sum)}</p><h3>أهم الفوائد</h3><ol>${meta.pts.map(p=>`<li>${esc(p)}</li>`).join("")}</ol>
            ${LS().pos[B.id]!=null?`<button class="btn primary" data-lbch="${LS().pos[B.id]}">${ic("book")}تابع القراءة: ${esc(B.ch[LS().pos[B.id]].t)}</button>`:`<button class="btn primary" data-lbch="0">${ic("book")}ابدأ القراءة</button>`}</section>
            ${lbMine(`bn:${B.id}`, "ملخصي للكتاب")}`;
        } else if (tabB === "toc"){
          const ppl = meta.people || [];
          body = `<div class="lb-toc">${B.ch.map((c,i)=>{ if (c.k) return ""; const pp = ppl.find(p=>c.t.startsWith(p.m) || c.t.includes(p.m)); const mine = LS().nt[`bs:${B.id}:${i}`];
            return `<button class="lb-ti l${Math.min(c.l,3)} ${LS().pos[B.id]===i?"cur":""}" data-lbch="${i}"><b>${esc(c.t)}</b>${pp?`<small>${esc(pp.s)}</small>`:""}${mine?`<small class="lb-my">${ic("pen")}${esc(mine.slice(0,90))}</small>`:""}</button>`; }).join("")}</div>`;
        } else {
          let res = [];
          if (q.trim().length >= 2){ const nq = lbNorm(q.trim());
            B.ch.forEach((c,ci)=>{ if (lbNorm(c.t).includes(nq)) res.push([ci,-1,c.t]); c.p.forEach((t,pi)=>{ if (res.length<150 && lbNorm(t).includes(nq)) res.push([ci,pi,t]); }); }); }
          body = `<label class="lb-search">${ic("search")}<input id="lbBq" type="search" placeholder="ابحث في هذا الكتاب…" value="${esc(q)}"></label>
            <p class="small muted">${q.trim().length>=2 ? `${AR(res.length)}${res.length>=150?"+":""} نتيجة` : "اكتب كلمتين على الأقل"}</p>
            <div class="lb-res">${res.map(([ci,pi,t])=>`<button class="lb-ri" data-lbch="${ci}" data-lbp="${pi}"><small>${esc(B.ch[ci].t)}</small><span>${pi<0?`<mark class="lb-q">${esc(t)}</mark>`:lbSnippet(t, q)}</span></button>`).join("")}</div>`;
        }
        v.innerHTML = `<div class="wrap lb" style="gap:12px">${head(B.title, true, B.author)}
          <div class="seg lb-seg"><button class="${tabB==="sum"?"on":""}" data-lbt="sum">الملخص</button><button class="${tabB==="toc"?"on":""}" data-lbt="toc">الفهرس</button><button class="${tabB==="q"?"on":""}" data-lbt="q">${ic("search")}بحث</button></div>
          ${body}</div>`;
        const bi = $("#lbBq"); if (bi){ bi.oninput = ()=>{ LB.bq = bi.value; clearTimeout(bi._t); bi._t = setTimeout(async ()=>{ await renderLibrary(true); const n = $("#lbBq"); if (n){ n.focus(); const L = n.value.length; n.setSelectionRange(L,L); } }, 350); }; }
      }
    }
    else if (LB.view === "col" || LB.view === "hbook"){
      v.innerHTML = `<div class="wrap lb"><p class="muted">${ic("download")} جارٍ تحميل ${HCOLS.find(x=>x[0]===LB.col)[1]}… قد يستغرق ذلك قليلاً أول مرة.</p></div>`;
      const C = await lbLoad("hadith", LB.col), id = LB.col;
      const pass = h => !HGRADED.has(id) || LB.hf==="all" || (LB.hf==="ok" ? hGradeCls(h[3])==="ok" : hGradeCls(h[3])==="bad");
      const filt = HGRADED.has(id) ? `<div class="seg lb-seg sm">${[["all","الكل"],["ok","الصحيح والحسن"],["bad","الضعيف"]].map(([k,l])=>`<button class="${LB.hf===k?"on":""}" data-hf="${k}">${l}</button>`).join("")}</div>` : "";
      if (LB.view === "col"){
        const q = LB.hq.trim(); let list = "";
        if (q.length >= 2){
          const N = hNormAll(id), nq = lbNorm(q), hits = [];
          for (let i=0;i<N.length && hits.length<LB.lim+1;i++) if (N[i].includes(nq) && pass(C.h[i])) hits.push(i);
          list = `<p class="small muted">${hits.length>LB.lim?`أول ${AR(LB.lim)} نتيجة`:`${AR(hits.length)} نتيجة`}</p>${hits.slice(0,LB.lim).map(i=>hCard(id, i, C.h[i], q)).join("")}${hits.length>LB.lim?`<button class="btn lb-more" data-hmore>عرض المزيد</button>`:""}`;
        } else {
          const cnt = {}; C.h.forEach(h=>{ if (pass(h)) cnt[h[1]] = (cnt[h[1]]||0)+1; });
          list = `<div class="lb-toc">${C.books.filter(([n])=>cnt[n]).map(([n,t])=>{ const mine = LS().nt[`hs:${id}:${n}`], tp = hTopic(t);
            return `<button class="lb-ti" data-hb="${n}"><b>${esc(t)}</b><small>${AR(cnt[n])} حديثاً${tp?" · "+tp:""}</small>${mine?`<small class="lb-my">${ic("pen")}${esc(mine.slice(0,90))}</small>`:""}</button>`; }).join("")}</div>`;
        }
        v.innerHTML = `<div class="wrap lb" style="gap:12px">${head(C.title, true, C.author)}
          <label class="lb-search">${ic("search")}<input id="lbHq" type="search" placeholder="ابحث في ${C.title}: كلمة من الحديث أو اسم راوٍ…" value="${esc(LB.hq)}"></label>${filt}${list}</div>`;
        const hi = $("#lbHq"); if (hi){ hi.oninput = ()=>{ LB.hq = hi.value; LB.lim = 25; clearTimeout(hi._t); hi._t = setTimeout(async ()=>{ await renderLibrary(true); const n = $("#lbHq"); if (n){ n.focus(); const L = n.value.length; n.setSelectionRange(L,L); } }, 400); }; }
      } else {
        const bk = C.books.find(b=>b[0]===LB.hb), idx = [];
        C.h.forEach((h,i)=>{ if (h[1]===LB.hb && pass(h)) idx.push(i); });
        const tp = hTopic(bk[1]);
        v.innerHTML = `<div class="wrap lb" style="gap:12px">${head(bk[1], true, C.title)}
          ${tp?`<section class="lb-topic">${ic("scroll")}<span><b>موضوع هذا الكتاب</b>${tp}</span></section>`:""}
          ${lbMine(`hs:${id}:${LB.hb}`, "ملخصي لهذا الكتاب")}${filt}
          ${idx.slice(0, LB.lim).map(i=>hCard(id, i, C.h[i])).join("")}
          ${idx.length>LB.lim?`<button class="btn lb-more" data-hmore>عرض المزيد (${AR(idx.length-LB.lim)})</button>`:""}</div>`;
      }
    }
  } catch(e){
    v.innerHTML = `<div class="wrap lb">${head("تعذّر الفتح", true)}<p>تعذّر تحميل الملف. تأكّد من الاتصال بالإنترنت ثم أعد المحاولة، وبعد التحميل أول مرة يعمل بدون إنترنت.</p></div>`;
  }
  if (keep) scrollTo(0, y); else scrollTo(0, 0);
  if (LB.jump){ const el = document.querySelector(`.lb-p[data-k="${CSS.escape(LB.jump)}"]`); LB.jump = null; if (el){ el.scrollIntoView({block:"center"}); el.classList.add("flash"); setTimeout(()=>el.classList.remove("flash"), 1800); } }
}
function lbMineHTML(){
  const L = LS(), keys = new Set([...Object.keys(L.nt), ...Object.keys(L.hl)]);
  const rows = [...keys].filter(k=>/^(b|h|bs|bn|hs):/.test(k)).map(k=>{ const [t,id,a,b] = k.split(":");
    const where = t==="h" ? `${(HCOLS.find(x=>x[0]===id)||[,""])[1]} · حديث رقم ${AR(+a+1)} في الترتيب` : t==="hs" ? `${(HCOLS.find(x=>x[0]===id)||[,""])[1]} · ملخص كتاب` : t==="bn" ? "ملخص الكتاب" : t==="bs" ? "ملخص فصل" : "فقرة";
    const bookT = t[0]==="b" ? ((LB.cat&&LB.cat.books.find(x=>x.id===id))||{}).title||id : "";
    return {k, t, id, a, b, where: bookT ? bookT + " · " + where : where, note: L.nt[k], hl: L.hl[k]}; });
  if (!rows.length) return `<p class="muted">لم تكتب ملاحظات أو تلوّن نصوصاً بعد. اضغط على أي فقرة في كتاب أو حديث لتبدأ.</p>`;
  return `<div class="lb-res">${rows.reverse().map(r=>`<button class="lb-ri" data-mgo="${r.k}"><small>${esc(r.where)}${r.hl?` <i class="lb-dot lb-${(r.hl.c||(r.hl.r&&r.hl.r[0]&&r.hl.r[0][2]))}bg"></i>`:""}</small><span>${r.note?esc(r.note):"نص ملوّن"}</span></button>`).join("")}</div>`;
}
document.addEventListener("click", async e=>{
  if (tab !== "library") return;
  const t = e.target.closest("[data-lb],[data-lbseg],[data-lbcat],[data-lbopen],[data-lbdl],[data-hdl],[data-hcol],[data-lbt],[data-lbch],[data-hb],[data-hf],[data-hmore],[data-hopen],[data-mgo]"); if (!t) return;
  const d = t.dataset; buzz();
  if (d.lb === "back"){
    if (LB.view==="chapter"){ LB.view = "book"; LB.btab = LB.btab || "toc"; }
    else if (LB.view==="hbook"){ LB.view = "col"; LB.lim = 25; }
    else { LB.view = "home"; }
    return renderLibrary();
  }
  if (d.lbseg){ LB.seg = d.lbseg; return renderLibrary(); }
  if (d.lbopen){ LB.book = d.lbopen; LB.view = "book"; LB.btab = "sum"; LB.bq = ""; return renderLibrary(); }
  if (d.lbcat != null){ LB.bc = d.lbcat; return renderLibrary(true); }
  if (d.lbdl || d.hdl){ t.disabled = true; t.innerHTML = "جارٍ التحميل…"; try { await lbLoad(d.lbdl?"library":"hadith", d.lbdl||d.hdl); toast("حُمّل وصار يعمل بدون إنترنت"); } catch(_){ toast("تعذّر التحميل"); } return renderLibrary(true); }
  if (d.hcol){ LB.col = d.hcol; LB.view = "col"; LB.hq = ""; LB.lim = 25; LB.hf = "all"; return renderLibrary(); }
  if (d.lbt){ LB.btab = d.lbt; return renderLibrary(); }
  if (d.lbch != null && !t.disabled){ LB.ch = +d.lbch; LB.view = "chapter"; if (d.lbp && +d.lbp >= 0) LB.jump = `b:${LB.book}:${LB.ch}:${d.lbp}`; return renderLibrary(); }
  if (d.hb){ LB.hb = +d.hb; LB.view = "hbook"; LB.lim = 25; return renderLibrary(); }
  if (d.hf){ LB.hf = d.hf; LB.lim = 25; return renderLibrary(true); }
  if (t.hasAttribute("data-hmore")){ LB.lim += 25; return renderLibrary(true); }
  if (d.hopen){ const C = LBD.hcol[LB.col], i = +d.hopen; LB.hb = C.h[i][1]; LB.view = "hbook"; const same = C.h.map((h,j)=>[h,j]).filter(([h])=>h[1]===LB.hb).map(x=>x[1]); LB.lim = Math.ceil((same.indexOf(i)+1)/25)*25; LB.jump = `h:${LB.col}:${i}`; return renderLibrary(); }
  if (d.mgo){ const [k, id, a, b] = d.mgo.split(":");
    if (k==="h"){ LB.col = id; const C = await lbLoad("hadith", id); const i = +a; LB.hb = C.h[i][1]; const same = C.h.map((h,j)=>[h,j]).filter(([h])=>h[1]===LB.hb).map(x=>x[1]); LB.lim = Math.ceil((same.indexOf(i)+1)/25)*25; LB.view = "hbook"; LB.jump = d.mgo; }
    else if (k==="hs"){ LB.col = id; LB.hb = +a; LB.view = "hbook"; LB.lim = 25; }
    else if (k==="bn"){ LB.book = id; LB.view = "book"; LB.btab = "sum"; }
    else { LB.book = id; LB.ch = +a; LB.view = "chapter"; if (k==="b") LB.jump = d.mgo; }
    return renderLibrary(); }
});
const _rmLib = renderMethod;
renderMethod = function(){ if (tab==="library") return renderLibrary(); _rmLib(); };
TAB_TITLE.library = "المكتبة";
// home: a "knowledge" row
const _rhLib = renderHome;
renderHome = function(){ _rhLib();
  const wrap = $("#view .wrap.home"); if (!wrap) return;
  const secs = [...wrap.querySelectorAll(".hsec")], quran = secs.find(h=>/القرآن/.test(h.textContent));
  const html = `<h2 class="hsec">العلم الشرعي</h2><div class="hgrid lb-hg">
    <button class="htile" data-lbgo="books" style="--hue:30"><span class="hti">${ic("library")}</span><b>المكتبة</b><small>السيرة والعقيدة والتفسير والتزكية</small></button>
    <button class="htile" data-lbgo="hadith" style="--hue:200"><span class="hti">${ic("scroll")}</span><b>كتب الحديث</b><small>الصحيحان والسنن والموطأ</small></button>
    <button class="htile" data-lbgo="mine" style="--hue:300"><span class="hti">${ic("pen")}</span><b>ملاحظاتي</b><small>ما لوّنته وكتبته</small></button></div>`;
  const grid = quran && quran.nextElementSibling; if (grid) grid.insertAdjacentHTML("afterend", html); else wrap.insertAdjacentHTML("beforeend", html);
  wrap.querySelectorAll("[data-lbgo]").forEach(b=>b.addEventListener("click", e=>{ e.stopPropagation(); buzz(); LB.seg = b.dataset.lbgo; LB.view = "home"; setTab("library"); }));
};

/* ===== about / credits ===== */
Object.assign(ICONS,{mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',phone:'<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>'});
const ABOUT_HTML = ()=>`<div class="about-card"><b>عن البرنامج</b>
  <p>رفيق المسلم — من تصميم وإعداد <strong>بلهادية يوسف</strong></p>
  <a href="mailto:ityoucef@gmail.com">${ic("mail")}ityoucef@gmail.com</a>
  <a href="tel:+966540606677" dir="ltr">${ic("phone")}+966 54 060 6677</a>
  <small>© ${new Date().getFullYear()} بلهادية يوسف — برنامج مفتوح المصدر بترخيص GPL-3.0</small></div>`;
const _osAbout = openSettings;
openSettings = function(){ _osAbout();
  const set = document.querySelector(".set"); if (set && !set.querySelector(".about-card")) set.insertAdjacentHTML("beforeend", ABOUT_HTML());
};
