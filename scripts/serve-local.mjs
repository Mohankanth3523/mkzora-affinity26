#!/usr/bin/env node
/**
 * Local preview of the FINAL site: serves dist/ like Cloudflare Pages does (directory index, trailing-slash redirect,
 * root 404.html) AND runs the same registration proxy code as production at  POST /affinity26/api/register.
 *
 *   npm run build      (once)
 *   npm run preview    ->  http://localhost:3000/  and  http://localhost:3000/affinity26/register/
 *
 * The Apps Script URL is read from GOOGLE_APPS_SCRIPT_ENDPOINT in the environment or the root .env.local
 * (gitignored). It is used only server-side here and is never printed or sent to the browser.
 * PORT=4000 npm run preview  changes the port.
 */
import { createServer } from "node:http";
import { existsSync, statSync, createReadStream } from "node:fs";
import { extname, join, normalize, resolve, sep } from "node:path";
import { classifyBody, describeFetchError, handleRegister, safeHost } from "../worker/registerProxy.js";
import { ENDPOINT_VAR, loadBuildEnv, resolveProxyEndpoint, ROOT, PROXY_SECRET_VAR } from "./env.mjs";

const DIST = join(ROOT, "dist");
const PORT = Number(process.env.PORT || 3000);
const API_PATH = "/affinity26/api/register";

if (!existsSync(join(DIST, "index.html"))) {
  console.error("dist/ not found. Run `npm run build` first.");
  process.exit(1);
}

const { env } = loadBuildEnv();
const proxy = resolveProxyEndpoint(env);

/**
 * Local-only terminal diagnostics. Only sanitized fields are ever printed: status, content-type, final hostname,
 * error name/code/message (URLs stripped) and a fixed classification. Never the Apps Script URL, query string,
 * request body or registration data. Nothing here reaches the browser response.
 */
function logDiagnostic(info) {
  const parts = [];
  for (const key of ["stage", "status", "contentType", "finalHost", "redirected", "class", "errorName", "errorCode", "errorMessage", "hint"]) {
    if (info[key] === undefined || info[key] === "") continue;
    const v = info[key];
    parts.push(`${key}=${typeof v === "string" && /[^\w.\-\/]/.test(v) ? JSON.stringify(v) : v}`);
  }
  const ok = info.stage === "ok" || info.stage === "apps-script-rejected";
  (ok ? console.log : console.error)(`[proxy] upstream ${ok ? "response" : "FAILURE"}: ${parts.join(" ")}`);
}

const proxyEnv = { [PROXY_SECRET_VAR]: proxy.value, ALLOWED_ORIGINS: env.ALLOWED_ORIGINS ?? "" };

const MIME = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".avif": "image/avif",
  ".gif": "image/gif", ".ico": "image/x-icon", ".mp4": "video/mp4", ".webm": "video/webm", ".mp3": "audio/mpeg",
  ".woff": "font/woff", ".woff2": "font/woff2", ".ttf": "font/ttf", ".txt": "text/plain; charset=utf-8",
  ".map": "application/json", ".webmanifest": "application/manifest+json",
};

function send(res, status, headers, stream) {
  res.writeHead(status, headers);
  if (stream) stream.pipe(res);
  else res.end();
}

function sendFile(res, file, status = 200) {
  send(res, status, { "Content-Type": MIME[extname(file).toLowerCase()] || "application/octet-stream" }, createReadStream(file));
}

async function handleApi(req, res, url) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const request = new Request(url, {
    method: req.method,
    headers: req.headers,
    body: req.method === "GET" || req.method === "HEAD" ? undefined : Buffer.concat(chunks),
  });
  const response = await handleRegister(request, proxyEnv, undefined, logDiagnostic);
  const headers = {};
  response.headers.forEach((v, k) => (headers[k] = v));
  res.writeHead(response.status, headers);
  res.end(Buffer.from(await response.arrayBuffer()));
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host || `localhost:${PORT}`}`);
    if (url.pathname === API_PATH) return await handleApi(req, res, url.href);

    let pathname;
    try {
      pathname = decodeURIComponent(url.pathname);
    } catch {
      return send(res, 400, { "Content-Type": "text/plain" });
    }
    const target = resolve(DIST, "." + normalize(pathname));
    if (target !== DIST && !target.startsWith(DIST + sep)) return send(res, 403, { "Content-Type": "text/plain" });

    if (existsSync(target) && statSync(target).isFile()) return sendFile(res, target);
    if (existsSync(target) && statSync(target).isDirectory() && existsSync(join(target, "index.html"))) {
      if (!pathname.endsWith("/")) return send(res, 301, { Location: pathname + "/" + url.search });
      return sendFile(res, join(target, "index.html"));
    }
    return sendFile(res, join(DIST, "404.html"), 404);
  } catch {
    send(res, 500, { "Content-Type": "text/plain" });
  }
});

/** Startup check: ONE GET to the Web App (its doGet only answers "endpoint is live"). Sends no registration data, writes no row. */
async function startupCheck() {
  const endpoint = proxy.value;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000);
  try {
    const r = await fetch(endpoint, { redirect: "follow", signal: controller.signal });
    const text = await r.text();
    let live = false;
    try {
      live = JSON.parse(text)?.success === true;
    } catch {
      live = false;
    }
    logDiagnostic({
      stage: live ? "ok" : "startup-check-not-json",
      status: r.status,
      contentType: (r.headers.get("content-type") ?? "").split(";")[0].trim(),
      finalHost: safeHost(r.url),
      redirected: r.redirected,
      class: live ? "Apps Script doGet answered: endpoint is live" : classifyBody(text),
    });
  } catch (err) {
    logDiagnostic({ stage: "startup-check-fetch-threw", ...describeFetchError(err, endpoint) });
  } finally {
    clearTimeout(timer);
  }
}

server.listen(PORT, () => {
  console.log(`\nServing dist/ at  http://localhost:${PORT}/`);
  console.log(`AFFINITY '26:      http://localhost:${PORT}/affinity26/register/`);
  console.log(`Proxy endpoint:    POST ${API_PATH}`);
  if (!proxy.value) {
    console.log(`${PROXY_SECRET_VAR}: NOT configured - the proxy will answer 503. Add it to .env.local (see .env.example).`);
    return;
  }
  console.log(`${PROXY_SECRET_VAR}: configured (value not printed)`);
  if (proxy.name !== PROXY_SECRET_VAR) {
    console.log(`WARNING: it was read from the OLD name ${ENDPOINT_VAR}. Rename that line in your .env.local to ${PROXY_SECRET_VAR}.`);
  }
  console.log("Startup check (a single GET, no data sent, no sheet row written) ...");
  startupCheck();
});
