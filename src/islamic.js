/* ----- Islamic visual layer + practical "now" card + grouped "more" menu ----- */
Object.assign(ICONS, {
  mosque:'<path d="M12 2.5v1.8"/><path d="M12 4.3c-1.2.9-1.8 1.9-1.6 2.9h3.2c.2-1-.4-2-1.6-2.9z"/><path d="M7 12.2a5 5 0 0 1 10 0"/><path d="M6.5 12.2h11v8.3h-11z"/><path d="M10.5 20.5v-2.8a1.5 1.5 0 0 1 3 0v2.8"/><path d="M3.2 20.5V9.5l1-1.6 1 1.6v11M18.8 20.5V9.5l1-1.6 1 1.6v11"/><path d="M2 20.5h20"/>',
  quran:'<path d="M12 7.2C10.2 6 7.6 5.5 4.5 5.7v8.6c3.1-.2 5.7.3 7.5 1.5 1.8-1.2 4.4-1.7 7.5-1.5V5.7c-3.1-.2-5.7.3-7.5 1.5zM12 7.2v8.6"/><path d="M5 21l14-4.6M19 21L5 16.4"/>',
  beads:'<circle cx="15.3" cy="13.5" r="1.25"/><circle cx="17.3" cy="10.7" r="1.25"/><circle cx="17.3" cy="7.3" r="1.25"/><circle cx="15.3" cy="4.5" r="1.25"/><circle cx="12.0" cy="3.4" r="1.25"/><circle cx="8.7" cy="4.5" r="1.25"/><circle cx="6.7" cy="7.3" r="1.25"/><circle cx="6.7" cy="10.7" r="1.25"/><circle cx="8.7" cy="13.5" r="1.25"/><path d="M12 14.6v3M10.3 21.6l1.7-4 1.7 4"/>',
  moon:'<path d="M14.5 3.6a8.4 8.4 0 1 0 6 12.6 7 7 0 0 1-6-12.6z"/><path d="M18.3 4.6l.55 1.25 1.25.55-1.25.55-.55 1.25-.55-1.25-1.25-.55 1.25-.55z"/>',
  qibla:'<path d="M4 8l8-4 8 4v9.2l-8 4-8-4z"/><path d="M4 8l8 4 8-4M12 12v9.2"/><path d="M4 10.6l8 4 8-4"/>',
  hands:'<path d="M8 21v-5l-3-4V6.5a1.5 1.5 0 0 1 3 0V11"/><path d="M16 21v-5l3-4V6.5a1.5 1.5 0 0 0-3 0V11"/><path d="M8 11l2.2-6.3a1.3 1.3 0 0 1 2.5.6L11 12M16 11l-2.2-6.3a1.3 1.3 0 0 0-2.5.6"/>',
  friday:'<rect x="5.6" y="5.6" width="12.8" height="12.8" rx="1"/><rect x="5.6" y="5.6" width="12.8" height="12.8" rx="1" transform="rotate(45 12 12)"/><circle cx="12" cy="12" r="2.4"/>',
  lantern:'<path d="M12 1.8v2"/><path d="M10.2 3.8h3.6l1.2 2.6H9z"/><path d="M9 6.4h6l1.6 2.6v7.6L15 19H9l-1.6-2.4V9z"/><path d="M7.4 9h9.2M7.4 16.6h9.2"/><path d="M12 10.8c-1.1 1.1-1.1 2.8 0 3.9 1.1-1.1 1.1-2.8 0-3.9z"/><path d="M12 19v2.6"/>',
  mihrab:'<path d="M5 21V11a7 7 0 0 1 14 0v10"/><path d="M8.8 21v-6.5a3.2 3.2 0 0 1 6.4 0V21"/><path d="M3 21h18"/><path d="M12 2.5v1.5"/>',
  mat:'<path d="M5.5 2.5h13v19h-13z"/><path d="M9 21.5v-6.3a3 3 0 0 1 6 0v6.3"/><path d="M5.5 5.5h13M8 2.5v3M12 2.5v3M16 2.5v3"/>',
  calendar:'<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="M13.6 12.4a3 3 0 1 0 1.8 4.6 2.4 2.4 0 0 1-1.8-4.6z"/>',
  dome:'<path d="M12 2.5v2"/><path d="M5 13a7 7 0 0 1 14 0"/><path d="M4 13h16v8H4z"/><path d="M10 21v-3.5a2 2 0 0 1 4 0V21"/>',
});
const LANTERN_SVG = c=>`<svg class="isl-lan ${c}" viewBox="0 0 40 110" aria-hidden="true"><path d="M20 0v34" stroke="currentColor" stroke-width="1"/><path d="M14 34h12l3 7H11z" fill="currentColor" opacity=".9"/><path d="M11 41h18l4 8v26l-4 7H11l-4-7V49z" fill="currentColor" opacity=".22" stroke="currentColor" stroke-width="1.3"/><path d="M7 49h26M7 75h26M15 41v41M25 41v41" stroke="currentColor" stroke-width=".9" opacity=".7"/><path d="M20 53c-3.4 3.4-3.4 9 0 12.4 3.4-3.4 3.4-9 0-12.4z" fill="#ffd36b"/><path d="M14 82h12l-6 9z" fill="currentColor" opacity=".9"/><path d="M20 91v8" stroke="currentColor" stroke-width="1"/><circle cx="20" cy="101" r="2" fill="currentColor"/></svg>`;
/* what is recommended right now: up to three actions, each one tap away */
function nowActions(){
  const now = new Date(), t = dayTimes(now), out = [], P = (S.pl||{})[todayStr()]||{}, fri = now.getDay()===5;
  const add = (icon, title, sub, fn, hue)=>out.push({icon, title, sub, fn, hue});
  const adk = k=>()=>{ adkTab = k; setTab("adhkar"); };
  let n; try { n = upcomingNight(now); } catch(e){}
  if (n && now >= n.third && now < n.end) add("lantern", "الثلث الأخير من الليل", "قيام الليل والدعاء، ينزل ربنا إلى السماء الدنيا", adk("j"), 40);
  const cur = currentPrayer(now, t);
  if (cur && now - t[cur] < 45*60000 && !mhAdkDone("p_"+cur, todayStr())) add("beads", `أذكار بعد صلاة ${PNAMES[cur]}`, "التسبيح وآية الكرسي والمعوذات", adk("p"), 175);
  const np = nextPrayer(now), mins = Math.round((np.at - now)/60000);
  if (mins <= 20 && mins >= 0) add("mosque", `صلاة ${npName(np)} بعد ${mins} دقيقة`, "تهيّأ وتوضّأ، والدعاء بين الأذان والإقامة لا يُرد", ()=>setTab("prayer"), 155);
  if (now >= t.fajr && now < t.dhuhr && !adhkarDone("m")) add("sun", "أذكار الصباح", "حصّن يومك من أوله", adk("m"), 45);
  if (now >= new Date(+t.sunrise + 20*60000) && now < new Date(+t.dhuhr - 15*60000) && !P.duha) add("mat", "صلاة الضحى", "ركعتان تجزئ عن صدقة كل مفصل", ()=>setTab("muhasaba"), 95);
  if (fri && now < t.maghrib){ let j; try { j = jumuaHour(now); } catch(e){}
    if (j && now >= j.start) add("hands", "ساعة الإجابة يوم الجمعة", "آخر ساعة قبل المغرب، فأكثر من الدعاء", adk("f"), 340);
    else add("friday", "يوم الجمعة: سورة الكهف", "والإكثار من الصلاة على النبي ﷺ", ()=>{ try { openMushafAt(kahfPage(), "18:1"); } catch(e){ adk("f")(); } }, 150); }
  if (now >= t.asr && now < t.isha && !adhkarDone("e")) add("moon", "أذكار المساء", "حصّن ليلتك قبل أن تغرب الشمس", adk("e"), 265);
  const kh = KH(); if (kh && khToday() <= kh.days && kh.done[khToday()] !== todayStr()){ const p = khPart(khToday(), kh.days); add("quran", "ورد الختمة", `الصفحات ${AR(p.a)}–${AR(p.b)}`, ()=>setTab("khatma"), 25); }
  if (now >= new Date(+t.isha + 60*60000) || (n && now < t.fajr && now < n.third)){ add("moon", "أذكار النوم", "آية الكرسي والمعوذات قبل أن تنام", adk("y"), 230); add("check", "حاسب نفسك", "راجع أعمال يومك في المحاسبة", ()=>setTab("muhasaba"), 150); }
  if (!out.length) add("check", "المحاسبة اليومية", "تابع أعمال يومك", ()=>setTab("muhasaba"), 150);
  return out.slice(0, 3);
}
function greetLine(){ const h = new Date().getHours(); return h < 4 ? "ليلة مباركة" : h < 12 ? "صباح الخير والبركة" : h < 17 ? "طاب يومك" : "مساء الخير والبركة"; }
const _rhIsl = renderHome;
renderHome = function(){ _rhIsl();
  const wrap = $("#view .wrap.home"); if (!wrap) return;
  const now = new Date(), h = hp(now), acts = nowActions();
  let gd; try { gd = new Intl.DateTimeFormat("ar",{weekday:"long",day:"numeric",month:"long"}).format(now); } catch(e){ gd = ""; }
  const first = wrap.querySelector(".hsec"); if (first) first.remove();
  wrap.insertAdjacentHTML("afterbegin", `<section class="isl-hero">
      ${LANTERN_SVG("l1")}${LANTERN_SVG("l2")}
      <div class="isl-in"><span class="isl-salam">السلام عليكم ورحمة الله</span><b class="isl-greet">${greetLine()}</b>
        <span class="isl-date">${gd} · <span class="hij">${hijri(now)}</span></span></div>
      <div class="isl-now"><span class="isl-nowh">${ic("star")}الآن</span>
        ${acts.map((a,i)=>`<button class="isl-act" data-now="${i}" style="--hue:${a.hue}"><span class="hti">${ic(a.icon)}</span><span class="isl-at"><b>${a.title}</b><small>${a.sub}</small></span>${ic("next")}</button>`).join("")}</div>
      ${typeof skySVG==="function" ? skySVG() : ""}
    </section>`);
  wrap.querySelectorAll("[data-now]").forEach(b=>b.addEventListener("click", e=>{ e.stopPropagation(); buzz(); acts[+b.dataset.now].fn(); }));
};
/* grouped "more" menu */
openMore = function(){
  const G = [
    ["القرآن الكريم", [["mushaf","المصحف","quran"],["khatma","ختمة القرآن","book"],["surahs","سور الحفظ","list"],["plan","خطة الحفظ","calendar"],["rules","أحكام التجويد","palette"],["method","طريقة الحفظ","compass"]]],
    ["العبادات اليومية", [["muhasaba","المحاسبة اليومية","check"],["prayer","الصلاة والأذان","mosque"],["adhkar","الأذكار","beads"],["tasbih","السبحة","beads"],["qibla","القبلة","qibla"],["fast","صيام التطوع","moon"]]],
    ["العلم الشرعي", [["library","المكتبة","library"],["lib-hadith","كتب الحديث","scroll"],["lib-mine","ملاحظاتي","pen"]]],
    ["المزيد", [["stats","تقدّمي","chart"],["sermons","دروس ومواعظ","play"],["settings","الإعدادات","gear"]]],
  ];
  openSheet(`<h2 id="shTitle">المزيد</h2>${G.map(([t,L])=>`<div class="mg"><h3 class="mg-h">${t}</h3><div class="tiles">${L.map(([k,n,i])=>`<button class="tile ${tab===k?"on":""}" data-go2="${k}"><span class="ti">${ic(i)}</span>${n}</button>`).join("")}</div></div>`).join("")}`);
  document.querySelectorAll("[data-go2]").forEach(b=>b.onclick=()=>{ const g = b.dataset.go2;
    if (g==="settings") return openSettings();
    closeSheet();
    if (g==="tasbih"){ adkTab = "t"; setTab("adhkar"); }
    else if (g.startsWith("lib")){ if (typeof LB!=="undefined"){ LB.view = "home"; LB.seg = g==="lib-hadith" ? "hadith" : g==="lib-mine" ? "mine" : "books"; } setTab("library"); }
    else if (g==="qibla" || g==="fast"){ setTab("prayer"); setTimeout(()=>{ const x = g==="fast" ? $("#fastPanel") : [...document.querySelectorAll("#view h2")].find(h=>/القبلة/.test(h.textContent))?.closest("section"); if (!x) return; const d = x.querySelector("details.accd"); if (d) d.open = true; x.scrollIntoView({behavior:"smooth", block:"start"}); }, 80); }
    else setTab(g); });
};
// distinct Islamic icons on home tiles and nav
NAV_MAIN.forEach(x=>{ if (x[0]==="prayer") x[2] = "mosque"; if (x[0]==="mushaf") x[2] = "quran"; if (x[0]==="adhkar") x[2] = "beads"; });
