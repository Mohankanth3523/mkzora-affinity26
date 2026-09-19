#!/usr/bin/env node
/**
 * Post-build audit of dist/. Exits non-zero on any failure.
 *
 *  A. AFFINITY (dist/affinity26/**\/*.html): every root-relative URL in an href/src/poster/action/
 *     content/srcset attribute, and every root-relative `/_next/` or `/assets/` URL string embedded
 *     in the page, must start with /affinity26/  (or be exactly "/affinity26"). External URLs
 *     (https://...) must be left untouched.
 *     ("/assets/..." and "/intro/..." prop strings are prefixed at runtime by assetPath() and are only
 *     checked for existence under dist/affinity26/.)
 *  B. Every internal AFFINITY URL that points at a file must resolve to a file inside dist/.
 *  C. MKZORA (dist/index.html): local references must stay relative (css/main.css, js/main.js,
 *     favicon/..., assets/...) and resolve to files inside dist/.
 *  D. Registration proxy (values are NEVER printed):
 *       - proxy files exist (functions/affinity26/api/register.js, worker/registerProxy.js, dist/_routes.json)
 *       - the frontend bundle calls /api/register (same-origin proxy)
 *       - NO Google Apps Script URL is present in ANY file under dist/ (pattern check, plus an exact check of the
 *         configured value when it is known on this machine)
 *       - behaviour tests of the proxy handler against a stubbed upstream (no network)
 *  E. Route and MKZORA integrity.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ENDPOINT_VAR, loadBuildEnv, PROXY_SECRET_VAR, resolveProxyEndpoint, ROOT as PROJECT_ROOT } from "./env.mjs";
import { handleRegister } from "../worker/registerProxy.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");
const BASE = "/affinity26";

const problems = [];
const note = (msg) => problems.push(msg);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}
const rel = (p) => p.slice(DIST.length).replaceAll("\\", "/");

if (!existsSync(DIST)) {
  console.error("dist/ does not exist. Run `npm run build` first.");
  process.exit(1);
}

/** Does a URL path (no query/hash) resolve to a file inside dist/ ? */
function resolves(urlPath) {
  const clean = decodeURIComponent(urlPath.split("#")[0].split("?")[0]);
  const target = join(DIST, clean);
  if (existsSync(target) && statSync(target).isFile()) return true;
  if (existsSync(target) && statSync(target).isDirectory()) return existsSync(join(target, "index.html"));
  if (!extname(clean) && existsSync(join(target, "index.html"))) return true;
  return false;
}

// ---------- A + B: AFFINITY HTML ----------
const affinityHtml = walk(join(DIST, "affinity26")).filter((f) => f.endsWith(".html"));
const attrRe = /\b(href|src|poster|action|srcset|content|data-src)=("([^"]*)"|'([^']*)')/g;
const urlStringRe = /(["'(])(\/(?:_next|assets|intro)\/[^"'\s)\\]*)/g;
const stats = { pages: affinityHtml.length, attrUrls: 0, internalOk: 0, external: 0, mkzoraHome: 0 };
const externalSeen = new Set();
const runtimePrefixed = new Set();

for (const file of affinityHtml) {
  const html = readFileSync(file, "utf8");

  for (const m of html.matchAll(attrRe)) {
    const attr = m[1];
    const value = (m[3] ?? m[4] ?? "").trim();
    if (!value) continue;
    const candidates = attr === "srcset" ? value.split(",").map((s) => s.trim().split(/\s+/)[0]) : [value];
    for (const url of candidates) {
      stats.attrUrls += 1;
      if (/^(https?:)?\/\//.test(url)) {
        stats.external += 1;
        externalSeen.add(url.split("?")[0].slice(0, 90));
        continue;
      }
      if (/^(mailto:|tel:|#|data:|javascript:)/.test(url)) continue;
      if (attr === "content" && !url.startsWith("/")) continue; // meta content text
      if (url.startsWith("/")) {
        if (url === "/" && attr === "href") {
          // The ONE allowed root-relative link out of AFFINITY: the MKZORA home link (a plain <a href="/"> that resolves
          // to https://mkzora.com/). Its destination and its use on MKZORA logos only are verified in section F below.
          stats.mkzoraHome += 1;
          continue;
        }
        if (url === BASE || url.startsWith(BASE + "/") || url.startsWith(BASE + "?") || url.startsWith(BASE + "#")) {
          stats.internalOk += 1;
          const p = url.startsWith(BASE + "?") || url.startsWith(BASE + "#") ? "/" : url.slice(BASE.length) || "/";
          if (!resolves("/affinity26" + (p === "/" ? "/" : p))) note(`${rel(file)}: ${attr}="${url}" does not resolve to a file in dist/`);
        } else {
          note(`${rel(file)}: ${attr}="${url}" is root-relative but NOT under ${BASE}/`);
        }
      }
    }
  }

  // URL strings embedded in inline scripts (Next flight data).
  //  - "/_next/..." must never appear unprefixed (framework URLs are prefixed by basePath).
  //  - "/assets/..." and "/intro/..." are public-file paths passed as component props (data/gallery.ts,
  //    data/branding.ts); components add the prefix at runtime through assetPath(). They are therefore
  //    legitimate unprefixed here, but the file they name must exist under dist/affinity26/.
  for (const m of html.matchAll(urlStringRe)) {
    const url = m[2];
    if (url.startsWith("/_next/")) {
      note(`${rel(file)}: embedded URL string "${url.slice(0, 80)}" is missing the ${BASE} prefix`);
    } else {
      runtimePrefixed.add(url.split("?")[0]);
    }
  }
}

for (const url of runtimePrefixed) {
  if (!resolves(BASE + url)) note(`public asset "${url}" (prefixed at runtime by assetPath) is missing from dist${BASE}${url}`);
}

// ---------- D: registration proxy ----------
const proxyFiles = ["functions/affinity26/api/register.js", "worker/registerProxy.js"];
for (const f of proxyFiles) if (!existsSync(join(PROJECT_ROOT, f))) note(`proxy file missing: ${f}`);
let routesOk = false;
try {
  const routes = JSON.parse(readFileSync(join(DIST, "_routes.json"), "utf8"));
  routesOk = Array.isArray(routes.include) && routes.include.includes("/affinity26/api/*");
} catch {
  routesOk = false;
}
if (!routesOk) note('dist/_routes.json is missing or does not include "/affinity26/api/*"');

// Every text file that ships must be free of the Apps Script URL.
const { env: auditEnv } = loadBuildEnv();
const known = (process.env.AUDIT_EXPECT_ENDPOINT || resolveProxyEndpoint(auditEnv).value || "").trim();
const TEXT_EXT = new Set([".js", ".mjs", ".html", ".css", ".json", ".txt", ".map", ".svg", ".xml", ".webmanifest"]);
const shipped = walk(DIST).filter((f) => TEXT_EXT.has(extname(f).toLowerCase()));
const urlPattern = /script\.google\.com\/macros\/s\//i;
let patternHits = 0;
let exactHits = 0;
for (const f of shipped) {
  const text = readFileSync(f, "utf8");
  if (urlPattern.test(text)) {
    patternHits += 1;
    note(`${rel(f)}: contains a Google Apps Script URL - it must exist ONLY as the server-side secret`);
  }
  if (known && text.includes(known)) {
    exactHits += 1;
    note(`${rel(f)}: contains the configured Apps Script endpoint value`);
  }
}

// The frontend must call the same-origin proxy.
const chunkFiles = walk(join(DIST, "affinity26", "_next")).filter((f) => f.endsWith(".js"));
const proxyChunks = chunkFiles.filter((f) => readFileSync(f, "utf8").includes("/api/register"));
if (proxyChunks.length === 0) note('the AFFINITY bundle does not reference "/api/register"');

// Behaviour of the proxy handler with a stubbed upstream (fake URL, no network).
const FAKE = "https://script.google.com/macros/s/AUDIT_STUB_ID/exec";
const ORIGIN = "https://mkzora.com";
const REG = ORIGIN + "/affinity26/api/register";
const payload = JSON.stringify({ fullName: "Audit", package: "Registration" });
const stub = (body, init = {}) => async () => new Response(body, { status: 200, ...init });
const call = (method, opts = {}) =>
  handleRegister(
    new Request(REG, { method, headers: { Origin: ORIGIN, "Content-Type": "text/plain;charset=utf-8", ...(opts.headers ?? {}) }, body: method === "POST" ? (opts.body ?? payload) : undefined }),
    "env" in opts ? opts.env : { [PROXY_SECRET_VAR]: FAKE },
    opts.fetch ?? stub("{}"),
    opts.diagnose
  );
const proxyTests = [];
async function test(name, fn) {
  try {
    const failure = await fn();
    proxyTests.push([name, !failure]);
    if (failure) note(`proxy test "${name}" failed: ${failure}`);
  } catch (e) {
    proxyTests.push([name, false]);
    note(`proxy test "${name}" threw: ${e.message}`);
  }
}
await test("POST success passes JSON through", async () => {
  let seen;
  const r = await call("POST", { fetch: async (u, init) => { seen = { u, init }; return new Response('{"success":true,"registrationId":"AF26-00001","message":"Registration confirmed","extra":1}'); } });
  const j = await r.json();
  if (r.status !== 200 || j.success !== true || j.registrationId !== "AF26-00001" || j.message !== "Registration confirmed") return "contract fields not preserved";
  if ("extra" in j) return "unexpected upstream field leaked";
  if (seen.init.body !== payload || seen.init.method !== "POST") return "payload was not forwarded verbatim";
  if (r.headers.get("Access-Control-Allow-Origin") !== ORIGIN) return "missing Access-Control-Allow-Origin";
  if (!/application\/json/.test(r.headers.get("Content-Type") ?? "")) return "wrong Content-Type";
});
await test("upstream success:false is returned with its message", async () => {
  const r = await call("POST", { fetch: stub('{"success":false,"message":"Full name is required."}') });
  const j = await r.json();
  if (r.status !== 422 || j.success !== false || j.message !== "Full name is required.") return "unexpected result";
});
await test("OPTIONS preflight answered (204 + CORS headers)", async () => {
  const r = await call("OPTIONS");
  const h = (n) => r.headers.get(n) ?? "";
  if (r.status !== 204 || !h("Access-Control-Allow-Methods").includes("POST") || !h("Access-Control-Allow-Headers").includes("Content-Type") || h("Access-Control-Allow-Origin") !== ORIGIN) return "bad preflight response";
});
await test("unsupported methods -> 405", async () => {
  for (const m of ["GET", "PUT", "DELETE"]) if ((await call(m)).status !== 405) return `${m} was not rejected with 405`;
});
await test("upstream HTML (wrong deployment / sign-in page) -> 502 without details", async () => {
  const r = await call("POST", { fetch: stub("<html>Sign in</html>") });
  const t = await r.text();
  if (r.status !== 502 || t.includes("Sign in") || t.includes("google")) return "bad handling of non-JSON upstream";
});
await test("upstream network error -> 502, URL not leaked", async () => {
  const r = await call("POST", { fetch: async () => { throw new TypeError("fetch failed for " + FAKE); } });
  const t = await r.text();
  if (r.status !== 502 || t.includes("AUDIT_STUB_ID") || t.includes("script.google.com")) return "error leaked or wrong status";
});
await test("missing secret -> 503, nothing leaked", async () => {
  const r = await call("POST", { env: {} });
  const t = await r.text();
  if (r.status !== 503 || t.includes("script.google.com")) return "bad missing-secret handling";
});
await test("local diagnostics never contain the URL, body or personal data", async () => {
  const seen = [];
  const collect = (i) => seen.push(i);
  await call("POST", { fetch: async () => { throw Object.assign(new TypeError("fetch failed " + FAKE), { cause: Object.assign(new Error("getaddrinfo ENOTFOUND " + FAKE), { code: "ENOTFOUND" }) }); } , diagnose: collect });
  await call("POST", { fetch: stub("<html>accounts.google.com Sign in Audit</html>"), diagnose: collect });
  await call("POST", { fetch: stub('{"success":true,"registrationId":"AF26-00001"}'), diagnose: collect });
  const dump = JSON.stringify(seen);
  if (seen.length !== 3) return "expected 3 diagnostic events";
  if (dump.includes("AUDIT_STUB_ID") || dump.includes("macros/s/") || dump.includes('"Audit"') || dump.includes("Full name")) return "diagnostics leaked sensitive data";
  if (!dump.includes("DNS failure") || !dump.includes("Google sign-in page")) return "classification missing";
});
await test("non-JSON request body -> 400", async () => {
  if ((await call("POST", { body: "not json" })).status !== 400) return "not rejected";
});
await test("foreign Origin -> 403", async () => {
  const r = await call("POST", { headers: { Origin: "https://evil.example" } });
  if (r.status !== 403) return "cross-origin caller accepted";
});
const proxyPassed = proxyTests.filter(([, ok]) => ok).length;

// ---------- C: MKZORA ----------
const mk = readFileSync(join(DIST, "index.html"), "utf8");
const mkLocal = [];
for (const m of mk.matchAll(/\b(href|src)="([^"]*)"/g)) {
  const url = m[2];
  if (!url || /^(https?:)?\/\//.test(url) || /^(#|mailto:|tel:|data:)/.test(url)) continue;
  mkLocal.push(url);
  if (url.startsWith("/")) note(`dist/index.html: ${m[1]}="${url}" is root-absolute (MKZORA uses relative paths)`);
  else if (!resolves("/" + url)) note(`dist/index.html: ${m[1]}="${url}" does not resolve to a file in dist/`);
}
for (const must of ["css/main.css", "js/main.js", "favicon.ico", "favicon/favicon.svg", "favicon/favicon-16x16.png", "favicon/favicon.png", "favicon/favicon-192x192.png", "favicon/apple-touch-icon.png"]) {
  if (!mkLocal.includes(must)) note(`dist/index.html: expected reference "${must}" not found`);
}


// ---------- F: SEO metadata, favicons, OG images, MKZORA navigation ----------
const decodeEntities = (v) => v.replaceAll("&amp;", "&").replaceAll("&#x27;", "'").replaceAll("&#39;", "'").replaceAll("&quot;", '"');
const attrsOf = (tag) => Object.fromEntries([...tag.matchAll(/([a-zA-Z:-]+)=("([^"]*)"|'([^']*)')/g)].map((m) => [m[1], decodeEntities(m[3] ?? m[4] ?? "")]));
function readHead(html) {
  const head = html.slice(0, html.indexOf("</head>") === -1 ? html.length : html.indexOf("</head>"));
  const metas = [...head.matchAll(/<meta\b[^>]*>/g)].map((m) => attrsOf(m[0]));
  const links = [...head.matchAll(/<link\b[^>]*>/g)].map((m) => attrsOf(m[0]));
  const title = decodeEntities((head.match(/<title[^>]*>([\s\S]*?)<\/title>/) ?? [, ""])[1]);
  const meta = (key) => metas.find((m) => m.name === key || m.property === key)?.content ?? "";
  return { title, meta, links };
}
const ORIGIN_RE = /^https:\/\/mkzora\.com(\/.*)$/;
/** An https://mkzora.com/... URL must point to a real file in dist/ (the production origin maps 1:1 onto dist/). */
function checkProdUrl(where, label, url) {
  const m = ORIGIN_RE.exec(url);
  if (!m) return note(`${where}: ${label} "${url}" is not an absolute https://mkzora.com/ URL`);
  if (!resolves(m[1])) note(`${where}: ${label} "${url}" does not exist in dist/`);
}
function checkHead(where, html, exp) {
  const h = readHead(html);
  const req = (label, value, want) => {
    if (!value) return note(`${where}: ${label} is missing`);
    if (want !== undefined && value !== want) note(`${where}: ${label} is "${value}" (expected "${want}")`);
  };
  req("<title>", h.title, exp.title);
  req("meta description", h.meta("description"), exp.description);
  req("meta robots", h.meta("robots") || (exp.robotsOptional ? "-" : ""));
  const canonical = h.links.find((l) => l.rel === "canonical")?.href;
  req("canonical", canonical, exp.canonical);
  req("og:title", h.meta("og:title"), exp.ogTitle);
  req("og:description", h.meta("og:description"), exp.description);
  req("og:url", h.meta("og:url"), exp.canonical);
  req("og:type", h.meta("og:type"), "website");
  req("twitter:card", h.meta("twitter:card"), "summary_large_image");
  req("twitter:title", h.meta("twitter:title"));
  req("twitter:description", h.meta("twitter:description"));
  for (const k of ["og:image", "twitter:image"]) {
    const v = h.meta(k);
    if (!v) note(`${where}: ${k} is missing`);
    else {
      if (exp.image && v !== exp.image) note(`${where}: ${k} is "${v}" (expected "${exp.image}")`);
      checkProdUrl(where, k, v);
    }
  }
  const icons = h.links.filter((l) => /(^|\s)(icon|apple-touch-icon)(\s|$)/.test(l.rel ?? ""));
  if (icons.length === 0) note(`${where}: no favicon <link rel="icon"> found`);
  for (const l of icons) {
    if (exp.iconScope === "mkzora") {
      if (l.href.includes("affinity26")) note(`${where}: icon "${l.href}" must not point at AFFINITY assets`);
      const local = l.href.replace(/^https:\/\/mkzora\.com\//, "").replace(/^\//, "");
      if (!resolves("/" + local)) note(`${where}: icon "${l.href}" does not exist in dist/`);
    } else {
      if (!l.href.startsWith("https://mkzora.com/affinity26/")) note(`${where}: icon "${l.href}" is not under https://mkzora.com/affinity26/`);
      else checkProdUrl(where, "icon", l.href);
    }
  }
  return h;
}

const MK_DESC = "MKZORA is a digital marketing and web development agency helping businesses build their brand, reach more customers, and grow online.";
const mkHead = checkHead("dist/index.html", mk, {
  title: "MKZORA — Digital Marketing & Web Development",
  ogTitle: "MKZORA — Digital Marketing & Web Development",
  description: MK_DESC,
  canonical: "https://mkzora.com/",
  image: "https://mkzora.com/assets/images/mkzora-og.jpg",
  iconScope: "mkzora",
});
if (readHead(mk).meta("og:image").includes("affinity26")) note("dist/index.html: MKZORA homepage must not use the AFFINITY OG image");

const AFF_DESC = "AFFINITY '26 — 11th edition inter-medical collegiate fest by Dhruvaas at Karpaga Vinayaga Institute of Medical Sciences & Research Centre, October 1–3, 2026.";
const AFF_IMAGE = "https://mkzora.com/affinity26/og/affinity26-og.jpg";
const affRoutes = { "": "AFFINITY '26 — 11th Edition | Karpaga Vinayaga", events: null, rules: null, register: null, contact: null, success: null };
let affMetaPages = 0;
for (const route of Object.keys(affRoutes)) {
  const file = join(DIST, "affinity26", route, "index.html");
  if (!existsSync(file)) continue;
  const html = readFileSync(file, "utf8");
  const where = `dist/affinity26/${route ? route + "/" : ""}index.html`;
  const canonical = `https://mkzora.com/affinity26/${route ? route + "/" : ""}`;
  checkHead(where, html, {
    title: affRoutes[route] ?? undefined,
    ogTitle: route === "" ? "AFFINITY '26 — 11th Edition" : undefined,
    description: route === "" ? AFF_DESC : undefined,
    canonical,
    image: AFF_IMAGE,
    iconScope: "affinity",
  });
  if (route !== "" ) {
    const d = readHead(html).meta("description");
    if (!d) note(`${where}: meta description is missing`);
  }
  affMetaPages += 1;

  // MKZORA navigation: every MKZORA logo must be a plain link to "/" (https://mkzora.com/), never under /affinity26.
  const anchors = [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)];
  const mkAnchors = anchors.filter((a) => /alt="MKZORA/.test(a[2]));
  if (mkAnchors.length === 0) note(`${where}: no linked MKZORA logo found`);
  for (const a of mkAnchors) {
    const href = attrsOf("<a " + a[1] + ">").href;
    if (href !== "/") note(`${where}: an MKZORA logo links to "${href}" (must be "/" = https://mkzora.com/)`);
  }
  const unlinkedMk = [...html.matchAll(/<img\b[^>]*alt="MKZORA[^>]*>/g)].length - mkAnchors.reduce((n, a) => n + [...a[2].matchAll(/<img\b[^>]*alt="MKZORA[^>]*>/g)].length, 0);
  if (unlinkedMk > 0) note(`${where}: ${unlinkedMk} MKZORA logo image(s) are not inside a link`);
  // AFFINITY's own navigation must still use the /affinity26 base path
  if (!anchors.some((a) => attrsOf("<a " + a[1] + ">").href === "/affinity26/")) note(`${where}: AFFINITY home link "/affinity26/" not found`);
  for (const r of ["events", "rules", "register", "contact"]) {
    if (!anchors.some((a) => attrsOf("<a " + a[1] + ">").href === `/affinity26/${r}/`)) note(`${where}: internal link "/affinity26/${r}/" not found`);
  }
}
for (const f of ["favicon.ico", "affinity26/favicon.ico", "affinity26/apple-touch-icon.png", "assets/images/mkzora-og.jpg", "affinity26/og/affinity26-og.jpg"]) {
  if (!existsSync(join(DIST, f))) note(`dist/${f} is missing`);
}

// ---------- E: route integrity ----------
for (const r of ["index.html", "events/index.html", "rules/index.html", "register/index.html", "contact/index.html", "success/index.html"]) {
  if (!existsSync(join(DIST, "affinity26", r))) note(`route missing: dist/affinity26/${r}`);
}
for (const r of ["index.html", "css/main.css", "js/main.js", "favicon.ico", "favicon/favicon.svg", "assets/images/mkzora-og.jpg"]) {
  if (!existsSync(join(DIST, r))) note(`MKZORA root file missing: dist/${r}`);
}

// ---------- 404 ----------
if (!existsSync(join(DIST, "404.html"))) note("dist/404.html missing");

console.log(`AFFINITY pages scanned : ${stats.pages}`);
console.log(`Attribute URLs checked : ${stats.attrUrls} (internal under ${BASE}: ${stats.internalOk}, external: ${stats.external})`);
console.log(`Runtime-prefixed assets : ${runtimePrefixed.size} (all exist under dist${BASE}/)`);
console.log(`External hosts seen    : ${[...externalSeen].sort().join(", ") || "(none)"}`);
console.log(`MKZORA local refs      : ${mkLocal.join(", ")}`);
console.log(`MKZORA metadata        : ${mkHead.title ? "title/description/canonical/OG/Twitter/favicons checked" : "PROBLEM"}; OG image https://mkzora.com/assets/images/mkzora-og.jpg`);
console.log(`AFFINITY metadata      : ${affMetaPages} pages checked (title/description/canonical/OG/Twitter/favicons; OG image ${AFF_IMAGE})`);
console.log(`MKZORA navigation      : MKZORA logos link to "/" (https://mkzora.com/) on ${affMetaPages} AFFINITY pages; AFFINITY internal links keep /affinity26/`);
console.log(`Proxy files present    : ${proxyFiles.every((f) => existsSync(join(PROJECT_ROOT, f))) ? "YES" : "NO"} (functions/affinity26/api/register.js, worker/registerProxy.js)`);
console.log(`dist/_routes.json      : ${routesOk ? 'OK (Functions run only for /affinity26/api/*)' : "PROBLEM"}`);
console.log(`Frontend -> proxy      : ${proxyChunks.length > 0 ? `PASSED (/affinity26/api/register referenced in ${proxyChunks.length} JS chunk(s))` : "FAILED"}`);
console.log(`Apps Script URL in dist: ${patternHits === 0 && exactHits === 0 ? `ABSENT (${shipped.length} files scanned)` : "FOUND - see problems"}`);
console.log(`Exact-value check      : ${known ? "performed (value not printed)" : `skipped (${PROXY_SECRET_VAR} not set on this machine; the URL-pattern check above still ran)`}`);
console.log(`Proxy handler tests    : ${proxyPassed}/${proxyTests.length} passed`);

if (problems.length > 0) {
  console.error(`\nAUDIT FAILED — ${problems.length} problem(s):`);
  for (const p of problems.slice(0, 60)) console.error("  - " + p);
  if (problems.length > 60) console.error(`  ... and ${problems.length - 60} more`);
  process.exit(1);
}
console.log("\nAUDIT PASSED");
