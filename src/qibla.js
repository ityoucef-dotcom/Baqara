/* live qibla compass: follows the phone's heading and the current GPS position */
const QB = { on:false, heading:null, pos:null, watch:null, aligned:false, lastBuzz:0, src:"" };
window.__qb = QB;
function qbBearing(){ const c = QB.pos || cityNow(); return qiblaBearing(c.lat, c.lng); }
function qbScreenAngle(){ const o = (screen.orientation && screen.orientation.angle) || window.orientation || 0; return +o || 0; }
function qbOnOrient(e){
  let h = null;
  if (typeof e.webkitCompassHeading === "number" && !isNaN(e.webkitCompassHeading)) { h = e.webkitCompassHeading; QB.src = "ios"; }
  else if (e.absolute && typeof e.alpha === "number") { h = 360 - e.alpha; QB.src = "abs"; }
  else if (e.type === "deviceorientation" && typeof e.alpha === "number" && QB.src !== "abs" && QB.src !== "ios") { h = 360 - e.alpha; QB.src = "rel"; }
  if (h === null) return;
  h = (h + qbScreenAngle() + 360) % 360;
  // smooth small jitter, taking the 0/360 wrap into account
  if (QB.heading === null) QB.heading = h; else { let d = ((h - QB.heading + 540) % 360) - 180; QB.heading = (QB.heading + d*0.35 + 360) % 360; }
  qbPaint();
}
function qbPaint(){
  const dial = document.getElementById("qbDial"); if (!dial) return;
  const b = qbBearing(), info = document.getElementById("qbInfo"), box = document.getElementById("qbBox");
  if (QB.heading === null){ if (info) info.innerHTML = "حرّك الهاتف على شكل الرقم ٨ إن لم يتحرك المؤشر."; return; }
  dial.style.transform = `rotate(${(-QB.heading).toFixed(1)}deg)`;
  dial.querySelectorAll("text").forEach(t=>t.setAttribute("transform", `rotate(${QB.heading.toFixed(1)} ${t.getAttribute("x")} ${(+t.getAttribute("y")-5)})`));
  const off = ((b - QB.heading + 540) % 360) - 180, a = Math.abs(off), ok = a <= 4;
  if (box) box.classList.toggle("aligned", ok);
  if (info) info.innerHTML = ok ? `<b class="qb-ok">${ic("check")}أنت الآن متّجه إلى القبلة</b>` : `استدر ${off > 0 ? "يميناً" : "يساراً"} <b class="num">${AR(Math.round(a))}°</b>`;
  if (ok && !QB.aligned && Date.now() - QB.lastBuzz > 1500){ try { navigator.vibrate && navigator.vibrate([40,40,40]); } catch(e){} QB.lastBuzz = Date.now(); }
  QB.aligned = ok;
}
async function qbStart(){
  if (!QB.on){
    window.addEventListener("deviceorientationabsolute", qbOnOrient);
    window.addEventListener("deviceorientation", qbOnOrient);
    QB.on = true;
  }
  qbMeta();
  // iOS asks the user first; never wait on it forever
  try {
    if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function"){
      const r = await Promise.race([DeviceOrientationEvent.requestPermission(), new Promise(res=>setTimeout(()=>res("timeout"), 4000))]);
      if (r === "denied") toast("اسمح للتطبيق باستعمال الحركة والاتجاه من إعدادات الهاتف");
    }
  } catch(e){}
  if (navigator.geolocation && QB.watch === null){
    QB.watch = navigator.geolocation.watchPosition(p=>{ QB.pos = {lat:p.coords.latitude, lng:p.coords.longitude, acc:p.coords.accuracy}; qbMeta(); qbPaint(); }, ()=>{}, {enableHighAccuracy:true, maximumAge:60000, timeout:20000});
  }
  qbMeta();
  setTimeout(()=>{ if (QB.heading === null){ const i = document.getElementById("qbInfo"); if (i) i.textContent = "لم يصل اتجاه البوصلة من الجهاز. افتح البرنامج من الهاتف (لا الحاسوب) وتأكّد من السماح بالحركة والاتجاه."; } }, 2500);
}
function qbMeta(){
  const m = document.getElementById("qbMeta"); if (!m) return;
  const b = qbBearing(), c = QB.pos;
  m.innerHTML = `القبلة <b class="num">${AR(Math.round(b))}°</b> من الشمال · ${c ? `حسب موقعك الحالي${c.acc ? ` (بدقة ${AR(Math.round(c.acc))} م)` : ""}` : `حسب مدينة ${cityNow().name}`}`;
  const btn = document.getElementById("qbGo"); if (btn) btn.hidden = QB.on;
}
const _qhOld = qiblaHTML;
qiblaHTML = function(){
  const b = qbBearing();
  const ticks = Array.from({length:72},(_,i)=>{ const a = i*5*Math.PI/180, big = i%18===0, mid = i%6===0, r1 = big?92:mid?96:99; return `<line x1="${(110+r1*Math.sin(a)).toFixed(1)}" y1="${(110-r1*Math.cos(a)).toFixed(1)}" x2="${(110+104*Math.sin(a)).toFixed(1)}" y2="${(110-104*Math.cos(a)).toFixed(1)}" class="${big?"tk2":"tk"}"/>`; }).join("");
  const lbl = [["ش",0],["ق",90],["ج",180],["غ",270]].map(([t,d])=>{ const a = d*Math.PI/180; return `<text x="${(110+80*Math.sin(a)).toFixed(1)}" y="${(110-80*Math.cos(a)+5).toFixed(1)}" text-anchor="middle" class="${d===0?"tn":""}">${t}</text>`; }).join("");
  const ka = b*Math.PI/180, kx = 110+70*Math.sin(ka), ky = 110-70*Math.cos(ka);
  return `<section class="panel" id="qiblaPanel"><div class="ph"><span class="badge">${ic("qibla")}</span><h2>اتجاه القبلة</h2></div>
    <div class="qb" id="qbBox">
      <div class="qb-stage">
        <div class="qb-mark" aria-hidden="true"></div>
        <svg viewBox="0 0 220 220" class="qb-svg" role="img" aria-label="بوصلة القبلة">
          <g id="qbDial" class="qb-dial">
            <circle cx="110" cy="110" r="106" class="qb-r1"/>${ticks}${lbl}
            <line x1="110" y1="110" x2="${kx.toFixed(1)}" y2="${ky.toFixed(1)}" class="qb-ray"/>
            <g transform="translate(${(kx-11).toFixed(1)} ${(ky-11).toFixed(1)}) rotate(${b.toFixed(1)} 11 11)"><rect width="22" height="22" rx="2.5" class="kaaba"/><rect y="5" width="22" height="4" class="kband"/></g>
          </g>
          <circle cx="110" cy="110" r="6" class="qb-c"/>
        </svg>
      </div>
      <p class="qb-info" id="qbInfo" aria-live="polite">اضغط الزر ثم أمسك الهاتف مستوياً.</p>
      <button class="btn primary" id="qbGo">${ic("compass")}تشغيل البوصلة الحيّة</button>
      <p class="small muted" id="qbMeta"></p>
      <p class="small muted">أمسك الهاتف مستوياً بعيداً عن المعادن والمغناطيس، فإذا اضطرب المؤشر فحرّك الهاتف في الهواء على شكل الرقم ٨ لمعايرة البوصلة. السهم الأعلى هو اتجاه وجهك.</p>
    </div></section>`;
};
document.addEventListener("click", e=>{ if (e.target.closest("#qbGo")) qbStart(); });
// after any re-render, restore the live state
new MutationObserver(()=>{ if (document.getElementById("qbDial") && !document.getElementById("qbDial").dataset.done){ document.getElementById("qbDial").dataset.done = 1; qbMeta(); qbPaint(); } }).observe(document.body, {childList:true, subtree:true});
