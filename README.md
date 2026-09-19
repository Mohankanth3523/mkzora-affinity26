# MKZORA + AFFINITY '26 — combined static deployment

One Cloudflare static deployment that serves two sites from the same domain:

| URL | Site | Source |
| --- | --- | --- |
| `https://mkzora.com/` | MKZORA landing page (plain HTML/CSS/JS) | `landing/` |
| `https://mkzora.com/affinity26/` | AFFINITY '26 (Next.js static export) | `affinity26-src/` |
| `https://mkzora.com/affinity26/register/` | Registration | `affinity26-src/app/register/` |
| `https://mkzora.com/affinity26/events/` | Events | `affinity26-src/app/events/` |
| `https://mkzora.com/affinity26/rules/` | Rules | `affinity26-src/app/rules/` |
| `https://mkzora.com/affinity26/contact/` | Contact | `affinity26-src/app/contact/` |
| `https://mkzora.com/affinity26/success/` | Registration confirmation | `affinity26-src/app/success/` |

AFFINITY '26 has no online payment system: registrations are POSTed to a same-origin Cloudflare proxy
(`/affinity26/api/register`), which forwards them to a Google Apps Script Web App that writes to Google Sheets.

## Layout

```
mkzora_affinity26/
├── landing/            copy of the original MKZORA site (unchanged)
├── affinity26-src/     copy of the original AFFINITY '26 Next.js source (unchanged; basePath "/affinity26",
│                       trailingSlash, output "export")
├── functions/affinity26/api/register.js   Cloudflare Pages Function: POST /affinity26/api/register
├── worker/registerProxy.js                the proxy logic (Apps Script call, CORS, error handling)
├── scripts/
│   ├── assemble.mjs    builds AFFINITY and assembles dist/ (also writes dist/_routes.json)
│   ├── audit.mjs       post-build audit: URLs, assets, proxy files, proxy tests, "no Apps Script URL in dist/"
│   ├── serve-local.mjs local preview of dist/ + the same proxy (npm run preview)
│   ├── env.mjs         .env.local loader shared by the scripts
│   └── 404.html        source of the root 404 page (copied to dist/404.html)
├── dist/               GENERATED deployment directory (gitignored)
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

`dist/` after a build:

```
dist/
├── index.html, css/, js/, assets/, favicon/     MKZORA (paths stay relative, exactly as in landing/)
├── 404.html                                     root 404 page
└── affinity26/                                  contents of affinity26-src/out/
    ├── index.html, events/, rules/, register/, contact/, success/
    ├── _next/                                   JS/CSS/fonts (URLs are /affinity26/_next/...)
    ├── assets/, intro/                          logos, gallery, lamp, genie, video
    └── 404.html
dist/_routes.json                                Pages: run Functions only for /affinity26/api/*
```

`landing/docs/` and `landing/README.md` are intentionally not deployed.

## Requirements

- Node.js 18.18 or newer (Node 20/22 recommended) and npm. No global packages.
- Internet access during the build: `npm ci` downloads packages and Next.js downloads the Google Fonts used by
  the AFFINITY layout (`next/font/google`: Cinzel, Cormorant Garamond, Inter).

## Build

```bash
npm run build
```

which is equivalent to:

```bash
npm ci --prefix affinity26-src
node scripts/assemble.mjs        # clears dist/, copies landing, runs a FRESH `next build`, copies out/ -> dist/affinity26/
```

`assemble.mjs` deletes any existing `affinity26-src/out/` and `affinity26-src/.next/` before building, so a stale
export can never be deployed. Then verify:

```bash
npm run audit
```

Preview locally (serves `dist/` like Cloudflare Pages, including the registration proxy; see *Local development*):

```bash
npm run preview        # open http://localhost:3000/ and http://localhost:3000/affinity26/
```

## Registration proxy (why it exists)

A browser cannot read a response from a Google Apps Script `/exec` URL: Google does not send
`Access-Control-Allow-Origin`, so the browser reports a CORS error even though Apps Script returns HTTP 200.
(`mode: "no-cors"` is not a fix: it hides the response, so the site could never show the registration ID.)
So the browser only ever talks to its own origin and a server-side function talks to Google:

```
Browser
  |  POST https://mkzora.com/affinity26/api/register      (same origin, no CORS problem)
  v
Cloudflare Pages Function  functions/affinity26/api/register.js  ->  worker/registerProxy.js
  |  POST (server-to-server) to the secret GOOGLE_APPS_SCRIPT_ENDPOINT
  v
Google Apps Script /exec  ->  Google Sheet
```

- **Public endpoint:** `POST /affinity26/api/register` (also answers `OPTIONS`; any other method gets `405`).
- **Contract (unchanged):** the request body is the same JSON payload as before; the response is
  `{ "success": true, "registrationId": "AF26-00001", "message": "Registration confirmed" }` or
  `{ "success": false, "message": "..." }`. HTTP status: `200` success, `422` Apps Script rejected the data,
  `400` malformed body, `403` foreign origin, `405` wrong method, `413` body too large, `502/504` upstream problem,
  `503` secret not configured.
- **Static + function together:** the deployment stays one static Pages project. `dist/_routes.json` makes Cloudflare
  run the function only for `/affinity26/api/*`; every other URL is a plain static file, exactly as before.
- **Nothing in the frontend knows the Apps Script URL.** The bundle only contains `/affinity26/api/register`.
  The Apps Script code and deployment are untouched.

## Environment variable / secret

| Name | Where | Purpose |
| --- | --- | --- |
| `GOOGLE_APPS_SCRIPT_ENDPOINT` | Cloudflare Pages **secret** (production) / root `.env.local` (local preview) | Apps Script Web App `/exec` URL, used only by the proxy |
| `ALLOWED_ORIGINS` (optional) | same | comma-separated extra origins allowed to call the proxy |

- It is **not** needed at build time and is deliberately blanked in the Next.js build environment; builds never fail
  because it is missing. It is read when a registration is submitted.
- `NEXT_PUBLIC_REGISTRATION_ENDPOINT` (the old direct-call variable) is obsolete and ignored. If it is still in your
  `.env.local`, rename it to `GOOGLE_APPS_SCRIPT_ENDPOINT` (the local scripts also accept the old name, with a note).
- Never commit `.env.local` (it is gitignored) and never put the URL in `.env.example`, source files or docs.

## Cloudflare Pages settings

| Setting | Value |
| --- | --- |
| Framework preset | None |
| Build command | `npm ci --prefix affinity26-src && node scripts/assemble.mjs` |
| Build output directory | `dist` |
| Root directory | *(repository root — leave blank; the `functions/` folder must be in the root)* |
| Environment variable | `NODE_VERSION` = `22` (or `20`) |
| **Secret** (Production, and Preview if used) | `GOOGLE_APPS_SCRIPT_ENDPOINT` = your Apps Script `/exec` URL |

(`npm run build` is the same thing and can be used as the build command instead.)

Add the secret in the dashboard: *Workers & Pages -> your project -> Settings -> Variables and Secrets -> Add ->
Type: **Secret** -> name `GOOGLE_APPS_SCRIPT_ENDPOINT` -> paste the URL -> Save*, then **redeploy** (a secret is
picked up by new deployments). Or from a terminal: `npx wrangler pages secret put GOOGLE_APPS_SCRIPT_ENDPOINT --project-name <project>`.

## Production deployment

1. Push this project to the Git repository connected to the Pages project (`.env.local` stays local).
2. Pages settings and the secret as in the table above.
3. Deploy. Pages runs the build command, publishes `dist/` and compiles `functions/` from the repository root.
4. Direct upload instead of Git: run `npm run build`, then `npx wrangler pages deploy dist --project-name <project>`
   **from the project root** (Wrangler picks up `./functions` there).
5. Domain: `https://mkzora.com/` -> MKZORA, `https://mkzora.com/affinity26/` -> AFFINITY '26 (unchanged).

## Local development and testing

`next dev` cannot serve the proxy (static-export projects have no server routes), so test the real thing:

```bash
# once: put the secret in .env.local at the project root (copy .env.example)
npm run build
npm run preview          # http://localhost:3000/  and  http://localhost:3000/affinity26/register/
```

`npm run preview` serves `dist/` like Cloudflare Pages and runs the same proxy code at
`POST /affinity26/api/register` on localhost, so the browser again only talks to its own origin. `PORT=4000 npm run preview`
changes the port. `npm run dev:affinity` (plain `next dev`) is fine for UI work, but registration submission will not
work there.

## How to test registration

1. `npm run preview`, open `http://localhost:3000/affinity26/register/`, complete the wizard and confirm.
2. Expected: you land on the success page with an `AF26-` ID, and one new row appears in the `Registrations` sheet.
   (Every real submission writes a row; delete test rows afterwards.)
3. Without any Google call, the proxy responds correctly to:
   `curl -i -X OPTIONS -H "Origin: http://localhost:3000" http://localhost:3000/affinity26/api/register` (204 + CORS headers) and
   `curl -i http://localhost:3000/affinity26/api/register` (405).
4. `npm run preview` prints a startup check (one GET, no data sent) and, on any upstream problem, a one-line
   `[proxy] upstream FAILURE: stage=... class=...` in the terminal. Only status, content-type, the final hostname, error
   name/code, a sanitized message and a fixed classification are printed (never the URL, body or personal data), and
   nothing extra reaches the browser. Cloudflare production passes no diagnostic callback and logs nothing.
5. Failure meanings on the confirmation step: `503` secret missing; `502` Google returned something that is not JSON
   (usually the deployment is not *Execute as: Me / Anyone*, or the secret points at an old deployment); `504` timeout.

## Verifying the Apps Script URL is NOT exposed

```bash
npm run audit
```

prints, among other lines, `Apps Script URL in dist: ABSENT (N files scanned)`, `Frontend -> proxy: PASSED` and
`Proxy handler tests: 9/9 passed`. It fails if any file under `dist/` contains a `script.google.com/macros/s/` URL, or
(when the secret is set on your machine) the exact configured value. You can also check in the browser: DevTools ->
Network shows the registration call going to `/affinity26/api/register` on your own domain, and *Sources* -> search
for `script.google.com` finds nothing.

## 404 behaviour

`dist/404.html` is the site-wide 404. Because a root `404.html` exists, Cloudflare Pages serves it (with status 404)
for any URL that matches no file, instead of falling back to the MKZORA home page. Every valid AFFINITY route is a real
file (`affinity26/<route>/index.html`), so valid routes never reach it.

## Notes

- To change the deployment sub-path, edit `basePath` in `affinity26-src/next.config.mjs` (and the `/affinity26/`
  links in `scripts/404.html`, and `BASE` in `scripts/audit.mjs`).
- The original source folders (`mkzora/` and `affinity26-frontend/`) were copied, not moved; they are untouched.

## Favicons, social preview images and MKZORA links

- **MKZORA (`/`)**: favicons are in `landing/favicon/` plus `landing/favicon.ico` (copied to `dist/favicon.ico`, so `https://mkzora.com/favicon.ico` returns the MKZORA mark). Social preview image: `landing/assets/images/mkzora-og.jpg` (1200×630). Head tags (title, description, robots, canonical, Open Graph, Twitter) are in `landing/index.html`.
- **AFFINITY (`/affinity26/`)**: favicons and the social image live in `affinity26-src/public/` (`favicon.ico`, `favicon-32x32.png`, `favicon-192x192.png`, `apple-touch-icon.png`, `og/affinity26-og.jpg`). All metadata is defined in `affinity26-src/lib/seo.ts` (site-wide values + per-page canonical / og:url helper).
- **MKZORA links inside AFFINITY** (`Powered by MKZORA` in the navbar and footer, the MKZORA digital-partner logo) are plain `<a href="/">` links (component `BrandLink`, value `MKZORA_HOME_HREF` in `data/branding.ts`). Never use `next/link` for them: it would prefix the `/affinity26` base path.
- `npm run audit` verifies all of the above against `dist/` (metadata present, every referenced favicon / OG image exists, MKZORA logos link to `/`, AFFINITY links keep `/affinity26/`).

## Event countdown and location

- `affinity26-src/lib/countdown.ts` holds the event clock (pure functions). Start: **1 Oct 2026 00:00:00 IST** (`2026-10-01T00:00:00+05:30`); the event stays "live" until **3 Oct 2026 23:59:59 IST**, then the countdown switches to the thank-you message. A fixed `+05:30` offset is used, so the result never depends on the visitor's timezone.
- `components/countdown/EventCountdown.tsx` (client component, one 1-second interval, cleaned up on unmount) is shown in the home-page hero.
- `data/location.ts` holds the official Google Maps link; `components/location/LocationButton.tsx` renders it as a "View Event Location" / "Get Directions" button (new tab, `rel="noopener noreferrer"`) in the hero, on `/affinity26/contact/` and in the footer. The raw URL is never displayed.
