// Headless Chrome via CDP: mobile-width full-page screenshots of live ktriphub pages,
// cookie banner pre-dismissed (kth_consent=denied), plus rendering local HTML slides.
// usage: node capture.mjs <outDir> <name>=<url>[@<waitMs>][#<width>x<height>] ...
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9333;
const [outDir, ...jobs] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });
const prof = path.join(process.env.TEMP || ".", "ktriphub-cdp-prof");

const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${PORT}`, `--user-data-dir=${prof}`, "--hide-scrollbars", "--no-first-run", "about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function target() {
  for (let i = 0; i < 40; i++) {
    try { const r = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: "PUT" }); if (r.ok) return r.json(); } catch {}
    await sleep(250);
  }
  throw new Error("chrome did not start");
}

const t = await target();
const ws = new WebSocket(t.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r, { once: true }));
let id = 0; const pending = new Map();
ws.addEventListener("message", (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
const cdp = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, (m) => m.error ? rej(new Error(method + ": " + m.error.message)) : res(m.result)); ws.send(JSON.stringify({ id: i, method, params })); });

await cdp("Page.enable"); await cdp("Runtime.enable");
let consentSet = false;
for (const job of jobs) {
  const m = job.match(/^([^=]+)=(.+?)(?:@(\d+))?(?:#(\d+)x(\d+))?$/);
  const [, name, url, wait = "4000", w, h] = m;
  const isFile = url.startsWith("file:");
  const width = Number(w || 390), height = Number(h || 844);
  await cdp("Emulation.setDeviceMetricsOverride", isFile
    ? { width, height, deviceScaleFactor: 1, mobile: false }
    : { width, height, deviceScaleFactor: 1080 / width, mobile: true });
  if (!isFile && !consentSet) {
    await cdp("Page.navigate", { url: "https://ktriphub.com/en/" }); await sleep(2500);
    await cdp("Runtime.evaluate", { expression: "localStorage.setItem('kth_consent','denied')" });
    consentSet = true;
  }
  await cdp("Page.navigate", { url }); await sleep(Number(wait));
  // hide floating AI-guide widget + banner so they don't cover content
  // Hide every floating (position:fixed) overlay except the site header: guide figure,
  // welcome bubble, trip nudge, consent banner.
  if (!isFile) await cdp("Runtime.evaluate", { expression: "for (const e of document.querySelectorAll('body *')) { if (getComputedStyle(e).position === 'fixed' && !e.closest('header')) e.style.display = 'none'; }" });
  const shot = await cdp("Page.captureScreenshot", { format: "png", captureBeyondViewport: !isFile, fromSurface: true });
  const file = path.join(outDir, name + ".png");
  fs.writeFileSync(file, Buffer.from(shot.data, "base64"));
  console.log("saved", file);
}
ws.close(); chrome.kill();
