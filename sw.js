/* offline cache for the Baqarah companion: app shell precached, recitations cached on demand or by "download all" */
const SHELL = "shell-b22df92d", AUDIO = "audio-v1";
const SHELL_FILES = ["./", "index.html", "manifest.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png", "adhan/madinah.mp3"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(SHELL_FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== SHELL && k !== AUDIO).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

// Safari's <audio> asks for byte ranges; answer them from the cached full file
async function ranged(req, res){
  const range = req.headers.get("range");
  if (!range) return res;
  const buf = await res.arrayBuffer(), size = buf.byteLength;
  const m = /bytes=(\d*)-(\d*)/.exec(range) || [];
  let start = m[1] ? +m[1] : 0, end = m[2] ? +m[2] : size - 1;
  if (!m[1] && m[2]){ start = size - +m[2]; end = size - 1; }
  end = Math.min(end, size - 1);
  return new Response(buf.slice(start, end + 1), { status: 206, headers: {
    "Content-Type": res.headers.get("Content-Type") || "audio/mpeg",
    "Content-Range": `bytes ${start}-${end}/${size}`, "Content-Length": String(end - start + 1), "Accept-Ranges": "bytes" } });
}

self.addEventListener("fetch", e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin) return;
  const isMedia = /\.mp3$/.test(url.pathname);
  if (isMedia){
    e.respondWith((async () => {
      const key = url.origin + url.pathname;
      let hit = await caches.match(key);
      if (!hit){
        const net = await fetch(key);
        if (!net.ok) return net;
        if (/\/audio\//.test(url.pathname)){ const c = await caches.open(AUDIO); await c.put(key, net.clone()); }
        hit = net;
      }
      return ranged(req, hit);
    })());
    return;
  }
  // app shell: cached copy first, refresh it in the background
  e.respondWith((async () => {
    const c = await caches.open(SHELL);
    const key = req.mode === "navigate" ? "index.html" : req;
    const hit = await c.match(key, { ignoreSearch: true });
    const net = fetch(req).then(r => { if (r.ok) c.put(key, r.clone()); return r; }).catch(() => null);
    return hit || (await net) || new Response("", { status: 504 });
  })());
});
