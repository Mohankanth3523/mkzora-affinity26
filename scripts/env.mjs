/**
 * Shared, dependency-free environment helpers for scripts/assemble.mjs and scripts/audit.mjs.
 *
 * SECURITY: nothing in here (or in the scripts that use it) ever prints an endpoint value. Only booleans, the file
 * that supplied it, and the URL *shape* are reported.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const AFFINITY = join(ROOT, "affinity26-src");
export const ENDPOINT_VAR = "NEXT_PUBLIC_REGISTRATION_ENDPOINT";

/**
 * Environment files, lowest to highest priority. Both are gitignored `.env.local` files:
 * `affinity26-src/.env.local` is the one Next.js itself reads; a root `.env.local` may override it.
 * (`.env.example` is a template and is deliberately never read.)
 */
export const ENV_FILES = [join(AFFINITY, ".env.local"), join(ROOT, ".env.local")];

/** Decodes a file as UTF-8, UTF-8 with BOM, or UTF-16 (what Windows PowerShell's `>` / Out-File produce). */
function decode(buf) {
  if (buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xfe) return buf.subarray(2).toString("utf16le");
  if (buf.length >= 2 && buf[0] === 0xfe && buf[1] === 0xff) {
    return Buffer.from(buf.subarray(2)).swap16().toString("utf16le");
  }
  const text = buf.toString("utf8");
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

/** Parses KEY=VALUE lines (CRLF ok, `export` prefix ok, '#' comments, single/double quotes). */
export function parseEnv(text) {
  const out = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const m = line.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    let value = m[2].trim();
    const quote = value[0];
    if ((quote === '"' || quote === "'") && value.lastIndexOf(quote) > 0) {
      value = value.slice(1, value.lastIndexOf(quote));
    } else {
      value = value.replace(/\s+#.*$/, ""); // trailing inline comment on an unquoted value
    }
    out[m[1]] = value;
  }
  return out;
}

/**
 * Resolves the environment used by the build and the audit.
 * Priority: a NON-EMPTY value already in the process environment > root .env.local > affinity26-src/.env.local.
 * (An empty variable in the shell never masks a value that is in the file.)
 * Returns { env, files: [{ file, exists, hasEndpoint }], source } where `source` names where the endpoint came from.
 */
export function loadBuildEnv() {
  const fromFiles = {};
  const files = [];
  let fileSource = null;
  for (const file of ENV_FILES) {
    const exists = existsSync(file);
    let parsed = {};
    if (exists) {
      try {
        parsed = parseEnv(decode(readFileSync(file)));
      } catch {
        parsed = {};
      }
    }
    const hasEndpoint = typeof parsed[ENDPOINT_VAR] === "string" && parsed[ENDPOINT_VAR].trim() !== "";
    files.push({ file, exists, hasEndpoint });
    Object.assign(fromFiles, parsed);
    if (hasEndpoint) fileSource = file;
  }

  const env = { ...process.env };
  for (const [key, value] of Object.entries(fromFiles)) {
    if (env[key] === undefined || String(env[key]).trim() === "") env[key] = value;
  }
  const endpoint = (env[ENDPOINT_VAR] ?? "").trim();
  if (endpoint) env[ENDPOINT_VAR] = endpoint;

  let source = "none";
  if ((process.env[ENDPOINT_VAR] ?? "").trim()) source = "process environment";
  else if (endpoint && fileSource) source = fileSource.replace(ROOT, "<project>");
  return { env, files, source };
}

/** Safe description of an endpoint: never includes the value itself. */
export function describeEndpoint(value) {
  const v = (value ?? "").trim();
  if (!v) return { configured: false, format: "n/a", shapeOk: false };
  let shapeOk = false;
  try {
    const u = new URL(v);
    shapeOk = u.protocol === "https:" && u.hostname === "script.google.com" && /\/exec$/.test(u.pathname);
  } catch {
    shapeOk = false;
  }
  return { configured: true, format: shapeOk ? "/exec" : "UNEXPECTED (expected https://script.google.com/.../exec)", shapeOk };
}

/** Server-side (Cloudflare runtime) secret holding the Apps Script /exec URL. Never used at build time. */
export const PROXY_SECRET_VAR = "GOOGLE_APPS_SCRIPT_ENDPOINT";

/**
 * The Apps Script URL known to THIS machine (for the local proxy server and the audit), from the process environment
 * or .env.local. Falls back to the old NEXT_PUBLIC_ name so an existing local file keeps working. Value is never printed.
 */
export function resolveProxyEndpoint(env) {
  const v = (env[PROXY_SECRET_VAR] ?? "").trim();
  if (v) return { value: v, name: PROXY_SECRET_VAR };
  const legacy = (env[ENDPOINT_VAR] ?? "").trim();
  if (legacy) return { value: legacy, name: `${ENDPOINT_VAR} (old name - rename to ${PROXY_SECRET_VAR})` };
  return { value: "", name: "none" };
}
