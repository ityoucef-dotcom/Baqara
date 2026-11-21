/* ----- daily self-accounting (المحاسبة اليومية): deeds grouped by prayer, one tap to mark, streaks,
   synced with the prayer log (S.pl), adhkar counters (S.ad), khatma and memorisation ----- */
const MH_VIRTUE = {
  jamaa:["صَلاَةُ الْجَمَاعَةِ تَفْضُلُ صَلاَةَ الْفَذِّ بِسَبْعٍ وَعِشْرِينَ دَرَجَةً","متفق عليه: البخاري (645) ومسلم (650) عن ابن عمر رضي الله عنهما"],
  fajr2:["رَكْعَتَا الْفَجْرِ خَيْرٌ مِنَ الدُّنْيَا وَمَا فِيهَا","رواه مسلم (725) عن عائشة رضي الله عنها"],
  ratib:["مَنْ صَلَّى اثْنَتَيْ عَشْرَةَ رَكْعَةً فِي يَوْمٍ وَلَيْلَةٍ بُنِيَ لَهُ بِهِنَّ بَيْتٌ فِي الْجَنَّةِ","رواه مسلم (728) عن أم حبيبة رضي الله عنها"],
  dhuhr4:["مَنْ حَافَظَ عَلَى أَرْبَعِ رَكَعَاتٍ قَبْلَ الظُّهْرِ وَأَرْبَعٍ بَعْدَهَا حَرَّمَهُ اللَّهُ عَلَى النَّارِ","رواه أبو داود (1269) والترمذي (428) عن أم حبيبة رضي الله عنها، وصححه الألباني"],
  duha:["يُصْبِحُ عَلَى كُلِّ سُلاَمَى مِنْ أَحَدِكُمْ صَدَقَةٌ … وَيُجْزِئُ مِنْ ذَلِكَ رَكْعَتَانِ يَرْكَعُهُمَا مِنَ الضُّحَى","رواه مسلم (720) عن أبي ذر رضي الله عنه"],
  qiyam:["أَفْضَلُ الصَّلاَةِ بَعْدَ الْفَرِيضَةِ صَلاَةُ اللَّيْلِ","رواه مسلم (1163) عن أبي هريرة رضي الله عنه"],
  witr:["اجْعَلُوا آخِرَ صَلاَتِكُمْ بِاللَّيْلِ وِتْرًا","متفق عليه: البخاري (998) ومسلم (751) عن ابن عمر رضي الله عنهما"],
  quran:["اقْرَءُوا الْقُرْآنَ فَإِنَّهُ يَأْتِي يَوْمَ الْقِيَامَةِ شَفِيعًا لأَصْحَابِهِ","رواه مسلم (804) عن أبي أمامة رضي الله عنه"],
  hifz:["خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ","رواه البخاري (5027) عن عثمان رضي الله عنه"],
  fast:["مَنْ صَامَ يَوْمًا فِي سَبِيلِ اللَّهِ بَاعَدَ اللَّهُ وَجْهَهُ عَنِ النَّارِ سَبْعِينَ خَرِيفًا","متفق عليه: البخاري (2840) ومسلم (1153) عن أبي سعيد الخدري رضي الله عنه"],
  istighfar:["يَا أَيُّهَا النَّاسُ تُوبُوا إِلَى اللَّهِ، فَإِنِّي أَتُوبُ فِي الْيَوْمِ إِلَيْهِ مِائَةَ مَرَّةٍ","رواه مسلم (2702) عن الأغر المزني رضي الله عنه"],
  salat:["مَنْ صَلَّى عَلَيَّ وَاحِدَةً صَلَّى اللَّهُ عَلَيْهِ عَشْرًا","رواه مسلم (408) عن أبي هريرة رضي الله عنه"],
  tasbih:["كَلِمَتَانِ خَفِيفَتَانِ عَلَى اللِّسَانِ، ثَقِيلَتَانِ فِي الْمِيزَانِ، حَبِيبَتَانِ إِلَى الرَّحْمَنِ: سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ","متفق عليه: البخاري (6406) ومسلم (2694) عن أبي هريرة رضي الله عنه"],
  birr:["سألت النبي ﷺ: أي العمل أحب إلى الله؟ قال: «الصَّلاَةُ عَلَى وَقْتِهَا». قلت: ثم أي؟ قال: «ثُمَّ بِرُّ الْوَالِدَيْنِ»","متفق عليه: البخاري (527) ومسلم (85) عن ابن مسعود رضي الله عنه"],
  sadaqa:["مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ","رواه مسلم (2588) عن أبي هريرة رضي الله عنه"],
};
// k: storage key; src: "pl" (prayer log), "adk" (adhkar counter, auto), "mh" (manual); v: virtue; go: where "?" leads
const DMH_GROUPS = [
  {id:"fajr", n:"الفجر", pr:"fajr", it:[
    {k:"wake", t:"أذكار الاستيقاظ", go:"y"},
    {k:"r_fajr", src:"pl", t:"سنة الفجر", v:"fajr2"},
    {k:"fajr", src:"pl", t:"صلاة الفجر", v:"jamaa"},
    {k:"p_fajr", src:"adk", t:"أذكار بعد الصلاة", go:"p"},
    {k:"m", src:"adk", t:"أذكار الصباح", go:"m"},
    {k:"duha", src:"pl", t:"صلاة الضحى", v:"duha"}]},
  {id:"dhuhr", n:"الظهر", pr:"dhuhr", it:[
    {k:"r_dhuhr_b", src:"pl", t:"أربع قبل الظهر", v:"dhuhr4"},
    {k:"dhuhr", src:"pl", t:"صلاة الظهر", v:"jamaa"},
    {k:"p_dhuhr", src:"adk", t:"أذكار بعد الصلاة", go:"p"},
    {k:"r_dhuhr_a", src:"pl", t:"ركعتان بعد الظهر", v:"ratib"}]},
  {id:"asr", n:"العصر", pr:"asr", it:[
    {k:"asr", src:"pl", t:"صلاة العصر", v:"jamaa"},
    {k:"p_asr", src:"adk", t:"أذكار بعد الصلاة", go:"p"},
    {k:"e", src:"adk", t:"أذكار المساء", go:"e"}]},
  {id:"maghrib", n:"المغرب", pr:"maghrib", it:[
    {k:"maghrib", src:"pl", t:"صلاة المغرب", v:"jamaa"},
    {k:"p_maghrib", src:"adk", t:"أذكار بعد الصلاة", go:"p"},
    {k:"r_maghrib", src:"pl", t:"ركعتان بعد المغرب", v:"ratib"}]},
  {id:"isha", n:"العشاء", pr:"isha", it:[
    {k:"isha", src:"pl", t:"صلاة العشاء", v:"jamaa"},
    {k:"p_isha", src:"adk", t:"أذكار بعد الصلاة", go:"p"},
    {k:"r_isha", src:"pl", t:"ركعتان بعد العشاء", v:"ratib"}]},
  {id:"night", n:"الليل والوتر", it:[
    {k:"qiyam", t:"قيام الليل", v:"qiyam"},
    {k:"witr", src:"pl", t:"الوتر", v:"witr"},
    {k:"sleep", t:"أذكار النوم", go:"y"}]},
  {id:"quran", n:"القرآن والصيام", it:[
    {k:"tilawa", t:"ورد التلاوة", v:"quran", auto:"kh"},
    {k:"hifz", t:"ورد الحفظ", v:"hifz", auto:"hifz"},
    {k:"fast", t:"صيام تطوع", v:"fast"}]},
  {id:"day", n:"أعمال اليوم", it:[
    {k:"istighfar", t:"الاستغفار ١٠٠ مرة", v:"istighfar"},
    {k:"salat", t:"الصلاة على النبي ﷺ", v:"salat"},
    {k:"tasbih", t:"سبحان الله وبحمده", v:"tasbih"},
    {k:"birr", t:"بر الوالدين", v:"birr"},
    {k:"sadaqa", t:"صدقة", v:"sadaqa"}]},
];
let mhDate = null;
const MH_ALL = DMH_GROUPS.flatMap(g=>g.it.map(x=>Object.assign({g:g.id}, x)));
function mhHidden(){ return S.mhHide = S.mhHide || {}; }
function mhAdkDone(k, d){ const day = (S.ad||{})[d]; if (!day) return false;
  const st = day[k], L = k.startsWith("p_") ? ADHKAR.p : ADHKAR[k]; return !!(st && L && L.every((x,i)=>(st[i]||0) >= x.c)); }
function mhAuto(x, d){
  if (x.src==="adk") return mhAdkDone(x.k, d);
  if (x.auto==="kh"){ const k = KH(); return !!(k && Object.values(k.done||{}).includes(d)); }
  if (x.auto==="hifz") return Object.values(S.done||{}).includes(d);
  return false;
}
function mhGet(x, d){
  if (x.src==="pl") return !!((S.pl||{})[d]||{})[x.k];
  return !!((S.mh||{})[d]||{})[x.k] || mhAuto(x, d);
}
function mhSet(x, d, v){
  if (x.src==="pl"){ const L = plDay(d); if (v) L[x.k] = 1; else delete L[x.k]; }
  else { S.mh = S.mh || {}; const L = S.mh[d] = S.mh[d] || {}; if (v) L[x.k] = 1; else { delete L[x.k]; if (mhAuto(x, d)) toast("هذا العمل يُعلَّم تلقائياً من قسمه"); } }
  save();
}
const mhShift = (d, n)=>{ const x = new Date(d+"T12:00:00"); x.setDate(x.getDate()+n); return dstr(x); };
function mhStreak(x, d){ let n = 0, c = mhGet(x, d) ? d : mhShift(d, -1); while (n < 400 && mhGet(x, c)){ n++; c = mhShift(c, -1); } return n; }
function mhItems(){ const h = mhHidden(); return MH_ALL.filter(x=>!h[x.k]); }
function mhScore(d){ const L = mhItems(); const n = L.filter(x=>mhGet(x, d)).length; return {n, t:L.length}; }
function mhNowGroup(){ const now = new Date(), t = dayTimes(now); let g = "fajr";
  for (const k of ["fajr","dhuhr","asr","maghrib","isha"]) if (t[k] <= now) g = k;
  if (now < t.fajr) g = "night"; return g; }
function renderMuhasaba(){
  const today = todayStr(); if (!mhDate || mhDate > today) mhDate = today;
  const d = mhDate, isToday = d===today, sc = mhScore(d), edit = !!renderMuhasaba.edit, hid = mhHidden(), cur = isToday ? mhNowGroup() : null;
  let dl; try { dl = new Intl.DateTimeFormat("ar",{weekday:"long",day:"numeric",month:"long"}).format(new Date(d+"T12:00:00")); } catch(e){ dl = d; }
  const h = hp(new Date(d+"T12:00:00"));
  const week = []; for (let i=6;i>=0;i--){ const x = mhShift(today, -i), s = mhScore(x); week.push({x, f: s.t ? s.n/s.t : 0}); }
  const card = x=>{ const on = mhGet(x, d), st = mhStreak(x, d), off = hid[x.k];
    if (off && !edit) return "";
    return `<div class="mh-it ${on?"on":""} ${off?"off":""}" data-mh="${x.k}" role="button" tabindex="0" aria-pressed="${on}">
      <span class="mh-ck">${ic(edit ? (off?"eye":"check") : on?"check":"plus")}</span><b>${x.t}</b>
      ${st>1 && !edit ? `<span class="mh-st">${ic("flame")}${AR(st)}</span>` : ""}
      ${(x.v||x.go) && !edit ? `<button class="mh-q" data-mhq="${x.k}" aria-label="فضل هذا العمل">؟</button>` : ""}</div>`; };
  $("#view").innerHTML = `<div class="wrap mh" style="gap:14px">
    <section class="panel mh-head">
      <div class="mh-nav"><button class="btn ghost icon" id="mhPrev" aria-label="اليوم السابق">${ic("prev")}</button>
        <div class="mh-date"><b>${isToday?"اليوم":dl}</b><small>${isToday?dl+" · ":""}${h?AR(h.d)+" "+HMONTHS[h.m-1]:""}</small></div>
        <button class="btn ghost icon" id="mhNext" aria-label="اليوم التالي" ${isToday?"disabled":""}>${ic("next")}</button></div>
      <div class="mh-sum"><span class="hring">${ringSVG(sc.t ? sc.n/sc.t : 0, AR(Math.round(sc.t ? sc.n/sc.t*100 : 0))+"٪")}</span>
        <div><b class="mh-big">${AR(sc.n)} <small>من ${AR(sc.t)} عملاً</small></b>
        <p class="small muted">${sc.n===sc.t && sc.t ? "ما شاء الله، أتممت أعمال اليوم كلها. تقبّل الله منك." : isToday ? "اضغط على العمل بعد أدائه. الصلوات والأذكار تُعلَّم تلقائياً من أقسامها." : "يمكنك تدارك ما فاتك تسجيله في هذا اليوم."}</p></div></div>
      <div class="mh-week">${week.map(w=>`<button class="mh-wd ${w.x===d?"on":""}" data-mhd="${w.x}"><i style="--h:${Math.round(w.f*100)}%"></i><small>${["أحد","اثن","ثلا","أرب","خمي","جمع","سبت"][new Date(w.x+"T12:00:00").getDay()]}</small></button>`).join("")}</div>
    </section>
    ${DMH_GROUPS.map(g=>{ const L = g.it.filter(x=>edit || !hid[x.k]); if (!L.length) return "";
      const n = L.filter(x=>!hid[x.k] && mhGet(x, d)).length, t = L.filter(x=>!hid[x.k]).length, tt = g.pr && isToday ? hm(dayTimes(new Date())[g.pr]) : "";
      return `<section class="panel mh-g ${g.id===cur?"now":""} ${n===t&&t?"full":""}" id="mhg_${g.id}">
        <div class="mh-gh"><h3>${g.n}${tt?` <span class="small muted num">${tt}</span>`:""}${g.id===cur?` <span class="tagc">الآن</span>`:""}</h3><span class="mh-gc num">${n===t&&t?ic("check"):""}${AR(n)}/${AR(t)}</span></div>
        <div class="mh-grid">${g.it.map(card).join("")}</div></section>`; }).join("")}
    <div class="row" style="justify-content:center"><button class="btn ${edit?"primary":"ghost"}" id="mhEdit">${ic(edit?"check":"gear")}${edit?"تم":"اختر الأعمال التي تتابعها"}</button></div>
    ${edit?`<p class="small muted" style="text-align:center">اضغط على العمل لإخفائه أو إظهاره. الأعمال المخفية لا تُحسب في النسبة.</p>`:""}
  </div>`;
  const V = $("#view");
  V.onclick = e=>{
    const q = e.target.closest("[data-mhq]"); if (q){ e.stopPropagation(); return mhInfo(MH_ALL.find(x=>x.k===q.dataset.mhq)); }
    const w = e.target.closest("[data-mhd]"); if (w){ mhDate = w.dataset.mhd; return renderMuhasaba(); }
    const c = e.target.closest("[data-mh]"); if (!c) return;
    const x = MH_ALL.find(y=>y.k===c.dataset.mh);
    if (edit){ if (hid[x.k]) delete hid[x.k]; else hid[x.k] = 1; save(); return renderMuhasaba(); }
    const v = !mhGet(x, d); mhSet(x, d, v); buzz(v ? [20,30,20] : 8);
    const y = window.scrollY; renderMuhasaba(); window.scrollTo(0, y);
    if (v && mhScore(d).n === mhScore(d).t) toast("أتممت أعمال اليوم كلها، تقبّل الله منك");
  };
  $("#mhPrev").onclick = ()=>{ mhDate = mhShift(d, -1); renderMuhasaba(); };
  $("#mhNext").onclick = ()=>{ if (!isToday){ mhDate = mhShift(d, 1); renderMuhasaba(); } };
  $("#mhEdit").onclick = ()=>{ renderMuhasaba.edit = !edit; renderMuhasaba(); };
  if (isToday && cur && !renderMuhasaba.scrolled){ renderMuhasaba.scrolled = true; const el = $("#mhg_"+cur); if (el && cur!=="fajr") setTimeout(()=>el.scrollIntoView({behavior:"smooth", block:"start"}), 150); }
}
function mhInfo(x){
  const v = x.v && MH_VIRTUE[x.v];
  const goLbl = {m:"أذكار الصباح", e:"أذكار المساء", p:"أذكار بعد الصلاة", y:"أذكار اليوم والليلة"}[x.go];
  openSheet(`<h2 id="shTitle">${x.t}</h2>
    ${v ? `<div class="hadith">${/^سألت/.test(v[0]) ? v[0] : `قال رسول الله ﷺ: «${v[0]}»`}<span class="src">${v[1]}</span></div>` : ""}
    ${x.src==="pl" ? `<p class="small muted">مرتبط بسجل «صلواتي» في صفحة الصلاة، فما تعلّمه هنا يظهر هناك أيضاً.</p>` : ""}
    ${x.src==="adk" ? `<p class="small muted">يُعلَّم تلقائياً عند إتمام العدّ في صفحة الأذكار، ويمكنك تعليمه يدوياً.</p>` : ""}
    ${x.auto ? `<p class="small muted">يُعلَّم تلقائياً عند إتمام ${x.auto==="kh"?"ورد الختمة":"ورد الحفظ"} لهذا اليوم.</p>` : ""}
    <div class="row">${x.go ? `<button class="btn primary" id="mhGo">${ic("beads")}افتح ${goLbl}</button>` : ""}
      ${x.auto ? `<button class="btn primary" id="mhGo">${ic("book")}افتح ${x.auto==="kh"?"الختمة":"الحفظ"}</button>` : ""}
      <button class="btn ghost" data-close>إغلاق</button></div>`);
  const g = $("#mhGo"); if (g) g.onclick = ()=>{ closeSheet(); if (x.go){ adkTab = x.go; setTab("adhkar"); } else setTab(x.auto==="kh" ? "khatma" : "today"); };
}
Object.assign(ICONS, {plus:'<path d="M12 6v12M6 12h12"/>'});
const _rmMh = renderMethod;
renderMethod = function(){ if (tab==="muhasaba") return renderMuhasaba(); _rmMh(); };
NAV_MORE.unshift(["muhasaba","المحاسبة اليومية","check"]);
const _rhMh = renderHome;
renderHome = function(){ _rhMh();
  const duo = $("#view .hduo"); if (!duo) return; const s = mhScore(todayStr());
  duo.insertAdjacentHTML("afterend", `<button class="hmemo mh-home" id="mhHome"><span class="hti" style="--hue:150">${ic("check")}</span>
    <div><b>المحاسبة اليومية</b><small>${s.n===s.t ? "أتممت أعمال اليوم، تقبّل الله منك" : `أنجزت ${AR(s.n)} من ${AR(s.t)} عملاً اليوم`}</small><span class="hbar"><i style="width:${s.t?s.n/s.t*100:0}%"></i></span></div>
    <span class="hmc">${ic("next")}</span></button>`);
  $("#mhHome").onclick = e=>{ e.stopPropagation(); buzz(); setTab("muhasaba"); };
};
TAB_TITLE.muhasaba = "المحاسبة اليومية";
