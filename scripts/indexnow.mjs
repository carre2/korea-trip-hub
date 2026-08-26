// IndexNow submitter — pings Bing/Yandex/Seznam/Naver about new or changed URLs.
//
// IndexNow lets a site tell participating search engines "these URLs changed,
// recrawl them" instead of waiting to be discovered. Bing is the main consumer;
// the key is verified by fetching https://ktriphub.com/<KEY>.txt (served from public/).
//
// Usage:
//   node scripts/indexnow.mjs                 # submit every URL in out/sitemap.xml
//   node scripts/indexnow.mjs <url> [url...]  # submit only the given absolute URLs
//   DRY_RUN=1 node scripts/indexnow.mjs ...   # print what would be sent, don't POST
//
// The key file (public/<KEY>.txt) must be deployed and live before submitting.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const KEY = "ca7652d7adcf7e2b3811adb88cd6187d";
const HOST = "ktriphub.com";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const ENDPOINT = "https://api.indexnow.org/indexnow";
const CHUNK = 1000; // IndexNow accepts up to 10k/request; stay well under.

const __dirname = dirname(fileURLToPath(import.meta.url));

function urlsFromSitemap() {
  const p = join(__dirname, "..", "out", "sitemap.xml");
  const xml = readFileSync(p, "utf8");
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

function chunk(arr, n) {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

async function submit(urlList) {
  const body = { host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList };
  if (process.env.DRY_RUN) {
    console.log(`[dry-run] would POST ${urlList.length} urls`);
    return { status: 0, ok: true };
  }
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  });
  return { status: res.status, ok: res.ok };
}

async function main() {
  const args = process.argv.slice(2).filter((a) => /^https?:\/\//.test(a));
  const urls = args.length ? args : urlsFromSitemap();
  if (!urls.length) {
    console.error("No URLs to submit.");
    process.exit(1);
  }
  // Every URL must belong to HOST, or IndexNow rejects the whole batch.
  const bad = urls.filter((u) => new URL(u).host !== HOST);
  if (bad.length) {
    console.error(`Refusing: ${bad.length} URL(s) not on ${HOST}, e.g. ${bad[0]}`);
    process.exit(1);
  }
  console.log(`Submitting ${urls.length} URL(s) to IndexNow (key ${KEY.slice(0, 8)}…)`);
  let failed = 0;
  for (const [i, part] of chunk(urls, CHUNK).entries()) {
    const { status, ok } = await submit(part);
    // 200 = accepted, 202 = accepted (pending validation). Both are success.
    const good = ok || status === 202;
    console.log(`  batch ${i + 1}: ${part.length} urls -> HTTP ${status} ${good ? "OK" : "FAILED"}`);
    if (!good) failed++;
  }
  if (failed) process.exit(1);
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
