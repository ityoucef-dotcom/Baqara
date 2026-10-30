// copy the published web app (repo root) into www/ for the native shell
import {cpSync, mkdirSync, rmSync, readFileSync, writeFileSync} from "node:fs";
const root = new URL("../../", import.meta.url).pathname, out = new URL("../www/", import.meta.url).pathname;
rmSync(out, {recursive:true, force:true}); mkdirSync(out, {recursive:true});
for (const f of ["index.html","manifest.webmanifest","icon-180.png","icon-192.png","icon-512.png"]) cpSync(root+f, out+f);
for (const d of ["adhan","audio","tafsir"]) cpSync(root+d, out+d, {recursive:true});
cpSync(new URL("../sounds/", import.meta.url).pathname, out+"sounds", {recursive:true});
// no service worker inside the app: files are already local
let html = readFileSync(out+"index.html","utf8");
html = html.replace("window.OFFLINE=true", "window.OFFLINE=true;window.NATIVE_APP=true");
writeFileSync(out+"index.html", html);
console.log("www ready");
