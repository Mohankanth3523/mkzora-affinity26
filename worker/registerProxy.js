/**
 * AFFINITY '26 registration proxy (runs on Cloudflare: Pages Function / Worker runtime; also used by
 * scripts/serve-local.mjs for local testing).
 *
 *   Browser  --POST-->  /affinity26/api/register  --POST (server-to-server)-->  Google Apps Script /exec  --> Sheet
 *
 * Why: Google Apps Script /exec responses carry no Access-Control-Allow-Origin header, so a browser cannot read
 * them cross-origin. Here the browser only talks to its own origin; this code talks to Google.
 *
 * SECURITY
 *  - The Apps Script URL comes ONLY from the secret `GOOGLE_APPS_SCRIPT_ENDPOINT` (env). It is never written to a
 *    response, an error message, a header or a log line.
 *  - The request body is forwarded verbatim (the Apps Script validates it and recomputes the price itself).
 *  - Only POST (and the CORS preflight OPTIONS) are served; everything else is 405.
 *  - Cross-origin callers are refused unless their Origin is in the optional `ALLOWED_ORIGINS` list.
 *
 * Standard Web APIs only (Request / Response / fetch / AbortController), no dependencies.
 */

export const ENDPOINT_ENV = "GOOGLE_APPS_SCRIPT_ENDPOINT";

const MAX_BODY_BYTES = 16 * 1024; // a registration payload is < 2 KB
const UPSTREAM_TIMEOUT_MS = 25_000; // Apps Script's own lock wait is up to 30 s
const GENERIC_FAILURE = "Registration could not be submitted. Please check your connection and try again.";

function json(status, body, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...headers,
    },
  });
}

function fail(status, message, headers) {
  return json(status, { success: false, message }, headers);
}

/** CORS headers for an allowed cross-origin caller. Same-origin requests need none, but sending them is harmless. */
function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function isAllowedOrigin(origin, request, env) {
  if (origin === new URL(request.url).origin) return true; // same-origin (the normal production case)
  const extra = String(env?.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return extra.includes(origin);
}

/** Only ever report the SHAPE problem, never the value. */
function validEndpoint(value) {
  try {
    const u = new URL(String(value ?? "").trim());
    return u.protocol === "https:" && u.hostname === "script.google.com";
  } catch {
    return false;
  }
}


// ---------- safe diagnostics (used by scripts/serve-local.mjs only; production passes no `diagnose` callback) ----------
// Nothing here ever returns the Apps Script URL, a query string, a request body or registration data: only
// status, content-type, the final HOSTNAME, error name/code, a sanitized short message and a fixed classification.

/** Removes any URL and the configured endpoint from a message, and caps its length. */
function sanitize(text, endpoint) {
  let out = String(text ?? "");
  if (endpoint) out = out.split(endpoint).join("<endpoint>");
  out = out.replace(/https?:\/\/[^\s"')]+/gi, "<url>").replace(/\s+/g, " ").trim();
  return out.slice(0, 200);
}

export function safeHost(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return undefined;
  }
}

/** Classifies a thrown fetch error (undici puts the real reason in `err.cause`). */
export function describeFetchError(err, endpoint) {
  const cause = err && typeof err === "object" ? err.cause : undefined;
  const name = String(err?.name ?? "Error");
  const code = String(cause?.code ?? err?.code ?? "");
  const message = sanitize([err?.message, cause?.message].filter(Boolean).join(" | "), endpoint);
  let cls = "other network error";
  let hint = "";
  if (name === "AbortError" || /TIMEOUT|ETIMEDOUT/i.test(code)) {
    cls = "timeout";
    hint = "Google did not answer in time; check your internet connection, VPN or firewall.";
  } else if (/ENOTFOUND|EAI_AGAIN|EAI_NODATA/i.test(code)) {
    cls = "DNS failure";
    hint = "The hostname could not be resolved; check internet/DNS.";
  } else if (/ECONNREFUSED|ECONNRESET|EHOSTUNREACH|ENETUNREACH|EPIPE|UND_ERR_SOCKET/i.test(code)) {
    cls = "connection failure";
    hint = "The connection was refused or dropped; check firewall, VPN or proxy (Node's fetch ignores HTTPS_PROXY).";
  } else if (/CERT|SELF_SIGNED|UNABLE_TO_VERIFY|ERR_TLS|SSL/i.test(code) || /certificate|tls|ssl/i.test(message)) {
    cls = "TLS failure";
    hint = "A certificate was rejected; antivirus/proxy HTTPS inspection is a common cause (see NODE_EXTRA_CA_CERTS).";
  } else if (/redirect/i.test(message) || /redirect/i.test(code)) {
    cls = "redirect failure";
    hint = "The redirect from script.google.com could not be followed.";
  }
  return { errorName: name, errorCode: code || undefined, errorMessage: message, class: cls, hint };
}

/** Fixed, non-sensitive classification of a non-JSON upstream body. Never returns any of the body. */
export function classifyBody(text) {
  const t = String(text ?? "").toLowerCase();
  if (t.trim() === "") return "empty response";
  if (/accounts\.google\.com|servicelogin|sign in|signin/.test(t)) {
    return "Google sign-in page (deployment access is not 'Anyone', or 'Execute as' is not 'Me')";
  }
  if (/script function not found|dopost/.test(t)) return "Apps Script error: doPost not found (stale or wrong deployment)";
  if (/unable to open the file|file you have requested|page not found|error 404|\b404\b/.test(t)) {
    return "Google 404 page (wrong or deleted deployment id)";
  }
  if (/authorization required|needs access|permission/.test(t)) return "Google authorization page (script needs authorizing / access)";
  if (/<html|<!doctype/.test(t)) return "other HTML page";
  return "text that is not JSON";
}

function diag(diagnose, info) {
  if (typeof diagnose !== "function") return;
  try {
    diagnose(info);
  } catch {
    /* diagnostics must never affect the response */
  }
}

/** `fetchImpl` and `diagnose` exist only for scripts/audit.mjs (network-free tests) and scripts/serve-local.mjs (local terminal diagnostics). */
export async function handleRegister(request, env = {}, fetchImpl = fetch, diagnose = undefined) {
  const origin = request.headers.get("Origin");
  let cors = {};
  if (origin) {
    if (!isAllowedOrigin(origin, request, env)) {
      return fail(403, "Origin not allowed.");
    }
    cors = corsHeaders(origin);
  }

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: { ...cors, "Cache-Control": "no-store" } });
  }
  if (request.method !== "POST") {
    return fail(405, "Method not allowed.", { ...cors, Allow: "POST, OPTIONS" });
  }

  const endpoint = String(env?.[ENDPOINT_ENV] ?? "").trim();
  if (!endpoint || !validEndpoint(endpoint)) {
    // Configuration problem on the server. Say so without saying anything about the value.
    return fail(503, "Registration service is not configured.", cors);
  }

  // Read the body with a hard size cap.
  const declared = Number(request.headers.get("Content-Length") ?? "0");
  if (declared > MAX_BODY_BYTES) return fail(413, "Request too large.", cors);
  let raw;
  try {
    raw = await request.text();
  } catch {
    return fail(400, "Malformed request body.", cors);
  }
  if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) return fail(413, "Request too large.", cors);

  // Must be a JSON object; forwarded EXACTLY as received (field validation belongs to the Apps Script).
  try {
    const parsed = JSON.parse(raw);
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("not an object");
  } catch {
    return fail(400, "Malformed request body.", cors);
  }

  // Server-to-server call. text/plain keeps it a plain POST; Apps Script answers with a 302 to a
  // script.googleusercontent.com URL that `fetch` follows automatically (the follow-up is a GET, as Apps Script expects).
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
  let upstream;
  try {
    upstream = await fetchImpl(endpoint, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: raw,
      redirect: "follow",
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    // Never return `err` to the browser (its message can contain the URL). The optional local diagnostic gets a
    // sanitized description only.
    const timedOut = err && typeof err === "object" && err.name === "AbortError";
    diag(diagnose, { stage: "fetch-threw", ...describeFetchError(err, endpoint) });
    return fail(timedOut ? 504 : 502, GENERIC_FAILURE, cors);
  }

  const meta = {
    status: upstream.status,
    contentType: (upstream.headers.get("content-type") ?? "").split(";")[0].trim() || undefined,
    finalHost: safeHost(upstream.url),
    redirected: Boolean(upstream.redirected),
  };

  let text;
  try {
    text = await upstream.text();
  } catch (err) {
    clearTimeout(timer);
    diag(diagnose, { stage: "reading-response", ...meta, ...describeFetchError(err, endpoint) });
    return fail(502, GENERIC_FAILURE, cors);
  }
  clearTimeout(timer);

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    // e.g. a Google sign-in / error HTML page: wrong deployment access or a stale deployment.
    diag(diagnose, { stage: "non-json-response", ...meta, class: classifyBody(text) });
    return fail(502, GENERIC_FAILURE, cors);
  }
  if (!upstream.ok) {
    diag(diagnose, { stage: "upstream-non-2xx", ...meta, class: "HTTP error status with a JSON body" });
    return fail(502, GENERIC_FAILURE, cors);
  }
  if (data === null || typeof data !== "object" || typeof data.success !== "boolean") {
    diag(diagnose, { stage: "unexpected-json-shape", ...meta, class: "JSON without a boolean `success` field" });
    return fail(502, GENERIC_FAILURE, cors);
  }
  diag(diagnose, { stage: data.success === true ? "ok" : "apps-script-rejected", ...meta });

  // Preserve exactly the contract fields; drop anything else.
  if (data.success === true && typeof data.registrationId === "string" && data.registrationId.trim() !== "") {
    const out = { success: true, registrationId: data.registrationId };
    if (typeof data.message === "string") out.message = data.message;
    return json(200, out, cors);
  }
  if (data.success === false) {
    const message = typeof data.message === "string" && data.message.trim() !== "" ? data.message : GENERIC_FAILURE;
    return json(422, { success: false, message }, cors);
  }
  return fail(502, GENERIC_FAILURE, cors);
}
