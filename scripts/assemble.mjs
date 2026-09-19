#!/usr/bin/env node
/**
 * Assembles the final Cloudflare deployment directory (`dist/`):
 *
 *   dist/                      <- MKZORA landing page (served at  https://mkzora.com/)
 *   dist/404.html              <- root 404 page
 *   dist/affinity26/           <- AFFINITY '26 static export (served at https://mkzora.com/affinity26/)
 *
 * Steps (always in this order):
 *   1. clear the previous dist/
 *   2. copy the MKZORA landing files into dist/
 *   3. run a FRESH AFFINITY '26 production build (stale out/ and .next/ are deleted first)
 *   4. copy the CONTENTS of affinity26-src/out/ into dist/affinity26/
 *   5. add the root 404.html and verify the result
 *
 * 6. run the path audit (scripts/audit.mjs); set SKIP_AUDIT=1 to skip it
 *
 * Windows / paths with spaces: npm is never given a path on its command line. The AFFINITY build runs with an
 * explicit `cwd` (affinity26-src) and the fixed arguments ["run", "build"], so a project folder such as
 * "C:\\Users\\me\\My Projects\\mkzora_affinity26" cannot be split at the space.
 *
 * Prerequisite: `npm ci --prefix affinity26-src` (the root `npm run build` does this first).
 * No global packages are required; only Node >= 18.18 and npm.
 */
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ENDPOINT_VAR, loadBuildEnv, PROXY_SECRET_VAR, resolveProxyEndpoint } from "./env.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const LANDING = join(ROOT, "landing");
const AFFINITY = join(ROOT, "affinity26-src");
const AFFINITY_OUT = join(AFFINITY, "out");
const AFFINITY_NEXT = join(AFFINITY, ".next");
const DIST = join(ROOT, "dist");
const DIST_AFFINITY = join(DIST, "affinity26");
const NOT_FOUND_SRC = join(ROOT, "scripts", "404.html");

/** Only these landing entries are deployed (docs/ and README.md stay out of the public site). */
const LANDING_PUBLIC = ["index.html", "favicon.ico", "css", "js", "assets", "favicon"];

const log = (msg) => console.log(`[assemble] ${msg}`);
const fail = (msg) => {
  console.error(`\n[assemble] ERROR: ${msg}\n`);
  process.exit(1);
};

if (!existsSync(join(AFFINITY, "node_modules"))) {
  fail(
    "affinity26-src/node_modules is missing. Run `npm ci --prefix affinity26-src` first " +
      "(or simply `npm run build` from the project root, which does it for you)."
  );
}
if (!existsSync(join(LANDING, "index.html"))) fail("landing/index.html not found.");

// --- environment (values are NEVER printed) ---
// The Apps Script URL is a SERVER-SIDE secret used only by the Cloudflare proxy (functions/affinity26/api/register.js).
// The browser bundle must never contain it, so it is not needed at build time and is removed from the Next.js build
// environment below. Nothing here can fail a build because the secret is missing.
const { env: buildEnv, files: envFiles } = loadBuildEnv();
const proxy = resolveProxyEndpoint(buildEnv);
for (const f of envFiles) log(`env file ${f.file.replace(ROOT, "<project>")}: ${f.exists ? "found" : "not found"}`);
log(
  proxy.value
    ? `${PROXY_SECRET_VAR}: present in this environment (source: ${proxy.name}) - used only by the local proxy/audit, NOT passed to the build; value not printed`
    : `${PROXY_SECRET_VAR}: not set here. That is fine for the build; set it as a Cloudflare secret (and in .env.local for \`npm run preview\`).`
);
if ((buildEnv[ENDPOINT_VAR] ?? "").trim()) {
  console.warn(
    `[assemble] NOTE: ${ENDPOINT_VAR} is the OLD way of configuring registration and is now ignored (and blanked for the build). ` +
      `Rename it to ${PROXY_SECRET_VAR} in your .env.local.`
  );
}

// 1. clear previous dist/
log("Clearing dist/ ...");
rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });

// 2. copy MKZORA landing files (unchanged) into dist/
log("Copying MKZORA landing files into dist/ ...");
for (const entry of LANDING_PUBLIC) {
  const src = join(LANDING, entry);
  if (!existsSync(src)) fail(`landing/${entry} is missing.`);
  cpSync(src, join(DIST, entry), { recursive: true });
}

// 3. fresh AFFINITY build — never reuse a stale out/ or .next/
log("Removing stale affinity26-src/out and affinity26-src/.next ...");
rmSync(AFFINITY_OUT, { recursive: true, force: true });
rmSync(AFFINITY_NEXT, { recursive: true, force: true });

if (!existsSync(join(AFFINITY, "package.json"))) {
  fail(`affinity26-src/package.json not found.\n  Expected: ${join(AFFINITY, "package.json")}`);
}

/**
 * Locates npm's own JavaScript entry point (npm-cli.js) so npm can be run as `node npm-cli.js ...`:
 * no `.cmd` shim, no shell, no command-line quoting. Nothing here depends on where the project lives.
 *  1. `npm_execpath` — set by npm when this script was started via `npm run ...`.
 *  2. The npm bundled next to the running Node binary (standard Windows / macOS / Linux installs).
 */
function findNpmCli() {
  const candidates = [];
  const fromEnv = process.env.npm_execpath;
  if (fromEnv && /^npm-cli\.c?js$/i.test(basename(fromEnv))) candidates.push(fromEnv);
  const nodeDir = dirname(process.execPath);
  candidates.push(
    join(nodeDir, "node_modules", "npm", "bin", "npm-cli.js"), // Windows installer layout
    join(nodeDir, "..", "lib", "node_modules", "npm", "bin", "npm-cli.js") // Unix layout
  );
  return candidates.find((c) => existsSync(c));
}

/**
 * Runs `npm <args>` inside `cwd`. The directory is ONLY passed through spawn's `cwd` option; the argument list
 * contains fixed words such as ["run", "build"], never a path, so a folder name with spaces cannot be split.
 *  1. Preferred: `node <npm-cli.js> <args>` — spawn(process.execPath, [...]) with no shell.
 *  2. Fallback: `npm.cmd` on Windows (`shell: true` is required there by Node >= 18.20 for .cmd files; safe because
 *     no path is on the command line) or plain `npm` elsewhere.
 * npm-specific variables inherited from the root `npm run build` are dropped so the nested npm resolves its
 * project from `cwd` (affinity26-src) instead of the root project.
 */
function runNpm(args, cwd, env) {
  const childEnv = { ...env };
  for (const key of Object.keys(childEnv)) {
    const k = key.toLowerCase();
    if (
      k === "npm_package_json" ||
      k === "npm_config_local_prefix" ||
      k === "npm_command" ||
      k.startsWith("npm_lifecycle_") ||
      k.startsWith("npm_package_")
    ) {
      delete childEnv[key];
    }
  }
  const options = { cwd, env: childEnv, stdio: "inherit" };
  const npmCli = findNpmCli();
  if (npmCli) {
    return { how: `"${process.execPath}" "${npmCli}"`, result: spawnSync(process.execPath, [npmCli, ...args], options) };
  }
  if (process.platform === "win32") {
    return { how: "npm.cmd (shell, no paths in command)", result: spawnSync("npm.cmd", args, { ...options, shell: true }) };
  }
  return { how: "npm", result: spawnSync("npm", args, options) };
}

log("Running AFFINITY '26 production build (next build) ...");
log(`AFFINITY cwd: ${AFFINITY}`);
const { how, result: build } = runNpm(["run", "build"], AFFINITY, {
  ...buildEnv,
  // Blank (not delete): Next's .env loader never overrides a variable that is already defined, so an old
  // .env.local line cannot leak the Apps Script URL into the client bundle.
  [ENDPOINT_VAR]: "",
  [PROXY_SECRET_VAR]: "",
  NEXT_TELEMETRY_DISABLED: "1",
});
if (build.error || build.status !== 0) {
  fail(
    `AFFINITY build failed.\n` +
      `  working directory : ${AFFINITY}\n` +
      `  command           : ${how} run build\n` +
      `  exit code         : ${build.status}${build.signal ? ` (signal ${build.signal})` : ""}\n` +
      (build.error ? `  spawn error       : ${build.error.message}\n` : "")
  );
}
if (!existsSync(join(AFFINITY_OUT, "index.html"))) {
  fail(
    "AFFINITY build finished but affinity26-src/out/index.html was not generated " +
      `(is \`output: "export"\` still set?).\n  working directory : ${AFFINITY}`
  );
}

// 4. copy out/ CONTENTS into dist/affinity26/ (not flattened into the root)
log("Copying fresh AFFINITY out/ into dist/affinity26/ ...");
mkdirSync(DIST_AFFINITY, { recursive: true });
cpSync(AFFINITY_OUT, DIST_AFFINITY, { recursive: true });

// 5. root 404 page
if (!existsSync(NOT_FOUND_SRC)) fail("scripts/404.html is missing.");
cpSync(NOT_FOUND_SRC, join(DIST, "404.html"));

// 5b. Cloudflare Pages: run the Functions only for the proxy route; everything else is served as static files.
writeFileSync(join(DIST, "_routes.json"), JSON.stringify({ version: 1, include: ["/affinity26/api/*"], exclude: [] }, null, 2) + "\n");

// verify the result
const required = [
  "_routes.json",
  "index.html",
  "404.html",
  "css/main.css",
  "js/main.js",
  "favicon/favicon.svg",
  "favicon.ico",
  "assets/images/mkzora-og.jpg",
  "affinity26/og/affinity26-og.jpg",
  "affinity26/favicon.ico",
  "affinity26/index.html",
  "affinity26/events/index.html",
  "affinity26/rules/index.html",
  "affinity26/register/index.html",
  "affinity26/contact/index.html",
  "affinity26/success/index.html",
  "affinity26/_next",
];
const missing = required.filter((p) => !existsSync(join(DIST, p)));
if (missing.length > 0) fail(`dist/ is incomplete. Missing:\n  - ${missing.join("\n  - ")}`);

let files = 0;
let bytes = 0;
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p);
    else {
      files += 1;
      bytes += s.size;
    }
  }
})(DIST);
log(`Done. dist/ contains ${files} files (${(bytes / 1024 / 1024).toFixed(1)} MB).`);

// 6. path audit
if (process.env.SKIP_AUDIT === "1") {
  log("SKIP_AUDIT=1 — path audit skipped. Run `npm run audit` manually.");
} else {
  log("Running path audit ...");
  const audit = spawnSync(process.execPath, [join(ROOT, "scripts", "audit.mjs")], {
    cwd: ROOT,
    env: process.env,
    stdio: "inherit",
  });
  if (audit.error || audit.status !== 0) fail("Path audit failed (see the problems listed above).");
}
