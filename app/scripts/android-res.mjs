// bundle the full adhan recordings as Android raw resources (res/raw/adhan_<name>.mp3)
import {cpSync, mkdirSync, readdirSync} from "node:fs";
const root = new URL("../../", import.meta.url).pathname, raw = new URL("../android/app/src/main/res/raw/", import.meta.url).pathname;
mkdirSync(raw, {recursive:true});
for (const f of readdirSync(root+"adhan")) if (f.endsWith(".mp3")) cpSync(root+"adhan/"+f, raw+"adhan_"+f.toLowerCase());
console.log("android sounds ready");
