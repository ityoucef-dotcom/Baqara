/* choose the reciter: a sheet listing masters of tajweed, each with a short sample */
let recSample = null;
function openReciters(back){
  const cur = reciter();
  openSheet(`<h2 id="shTitle">اختر القارئ</h2>
    <p class="small muted" style="margin:0 2px 10px">قرّاء متقنون للتجويد، والتلاوة آية آية حتى يعمل التكرار والتسميع. اضغط ${ic("play")} لتسمع الفاتحة.</p>
    <div class="recl">${RECITERS.map(r=>`<div class="rec ${r===cur?"on":""}">
      <button class="rec-pick" data-rec="${r.id}"><span class="rec-av">${ic(r===cur?"check":"mic")}</span><span><b>${r.n}</b><small>${r.t}${r===RECITERS[0]?" · البقرة مضمّنة في التطبيق":""}</small></span></button>
      <button class="btn icon rec-play" data-recp="${r.id}" aria-label="استمع إلى ${r.n}">${ic("play")}</button></div>`).join("")}</div>`);
  const stopS = ()=>{ if (recSample){ recSample.pause(); recSample = null; } document.querySelectorAll(".rec-play").forEach(b=>b.innerHTML = ic("play")); };
  document.querySelectorAll("[data-recp]").forEach(b=>b.onclick = ()=>{
    const was = b.dataset.playing==="1"; stopS(); document.querySelectorAll("[data-recp]").forEach(x=>x.dataset.playing="");
    if (was) return;
    recSample = new Audio(AUDIO_BASE + b.dataset.recp + "/001001.mp3"); let i = 1;
    recSample.onended = ()=>{ if (++i > 4 || !recSample) return stopS(); recSample.src = AUDIO_BASE + b.dataset.recp + "/00100" + i + ".mp3"; recSample.play().catch(()=>{}); };
    recSample.play().catch(()=>{ toast("تعذّر التشغيل، تحقّق من الاتصال"); stopS(); });
    b.dataset.playing = "1"; b.innerHTML = ic("pause");
  });
  document.querySelectorAll("[data-rec]").forEach(b=>b.onclick = ()=>{
    stopS(); S.prefs.reciter = b.dataset.rec; save(); buzz();
    try { if (PL.el && !PL.el.paused) PL.el.pause(); if (PL.q && PL.q.length) plUI(); } catch(e){}
    toast(`القارئ: ${reciterName()}`);
    if (back) back(); else { closeSheet(); render(); }
  });
}
Object.assign(ICONS, { mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7"/>' });
if (!ICONS.pause) ICONS.pause = '<rect x="6.5" y="5" width="3.5" height="14" rx="1"/><rect x="14" y="5" width="3.5" height="14" rx="1"/>';
const _osRec = openSettings;
openSettings = function(){ _osRec();
  const rows = document.querySelectorAll(".set .set-r"); const after = [...rows].find(r=>/سرعة التلاوة/.test(r.textContent)) || rows[0];
  if (!after) return;
  after.insertAdjacentHTML("beforebegin", `<div class="set-r"><span>القارئ</span><button class="btn" id="setRec">${ic("mic")}${reciter().n}</button></div>`);
  document.getElementById("setRec").onclick = ()=>openReciters(openSettings);
};
// tap the reciter name under the player to change it
document.addEventListener("click", e=>{ if (e.target.closest("#plSub") && !PL.waiting) openReciters(); });
