# Phase 44 — Prepare AFFINITY '26 for https://mkzora.com/affinity26/:
notes for future sessions

Persisted for continuity. See also `README.md` (project status) and
`docs/backend-integration-map.md`.

## What this phase delivered

AFFINITY '26 will not get its own domain — it deploys as a sub-path of
the existing MKZORA site, at `https://mkzora.com/affinity26/`, alongside
(never replacing) the existing MKZORA homepage at `https://mkzora.com/`.
This phase makes the Next.js app itself correct under that sub-path. It
does **not** deploy anything, and makes **zero** changes outside this
repository — there is no MKZORA codebase anywhere in this project's
workspace to accidentally touch.

- `next.config.mjs` (edited) — added `basePath: "/affinity26"`,
  `trailingSlash: true`, and an `env: { NEXT_PUBLIC_BASE_PATH:
  "/affinity26" }` block, all three derived from one new `basePath`
  const at the top of the file (a single source of truth — see the
  file's own new comments for why each option exists).
- `lib/basePath.ts` (new) — exports `BASE_PATH` (reads
  `NEXT_PUBLIC_BASE_PATH`) and `assetPath(path)`, which prefixes a
  root-relative `public/`-file path with the current base path and
  passes anything else (an absolute URL, `tel:`, `mailto:`, a `#`
  fragment) through unchanged.
- `components/design-system/BrandLogo.tsx`, `components/gallery/
  Gallery.tsx` (two call sites), `components/intro/CinematicIntro.tsx`
  (four call sites) — every raw `<img>`/`<video>`/`poster` `src` pointing
  at a `public/` file now goes through `assetPath()`. These were the
  **only** such call sites in the entire codebase (verified by grep, not
  assumed — see "Truth-mode / audit" below).
- `app/layout.tsx` — added `metadataBase: new URL("https://mkzora.com/
  affinity26/")` to the root `metadata` export, a forward-looking
  correctness fix (see "Decisions worth knowing about").

**No other file changed.** In particular: no navigation component
(`Navbar`, `Footer`, `GoldButton`, `SecondaryButton`, `EventDetailsModal`,
`ContactContent`, `RegistrationPass`, `ConfirmStep`,
`app/register/success/page.tsx`) needed any edit — see "Navigation" below
for why.

## Truth-mode / instruction-compliance audit

- **"Do NOT modify the existing MKZORA landing page... Do not change:
  MKZORA homepage / existing HTML / CSS / JS / branding / SEO /
  navigation."** This project's workspace contains only the AFFINITY '26
  Next.js app — there is no MKZORA source anywhere in it, so there was
  nothing to accidentally touch. Every edit this phase made is inside
  `affinity26-frontend/`.
- **"Ensure static assets also resolve correctly... use Next.js-aware
  asset paths... do not hard-code absolute URLs unless they correctly
  account for the /affinity26 base path."** Checked exhaustively, not
  assumed: grepped every `.tsx`/`.ts` file for `src="/`, `poster="/`,
  `href="/` and every asset-extension string literal
  (`.png|.jpg|.svg|.mp4|.webm|.ico|.webp|.gif|.woff2?|.json`). Every
  `href` on a route (not an asset) goes through `next/link`'s `Link`
  component (`GoldButton`/`SecondaryButton`/`Navbar`/`Footer`/
  `EventDetailsModal`/`ContactContent`/`RegistrationPass` all confirmed
  by reading their imports) or `next/navigation`'s `useRouter()`/
  `redirect()` (`ConfirmStep.tsx`'s post-submit `router.push("/success")`,
  `app/register/success/page.tsx`'s `redirect("/success")`) — both are
  automatically `basePath`-aware in Next.js, so **zero navigation code
  needed to change**. The only raw, non-Next-managed asset references
  were the seven call sites listed above, all now fixed.
- **"Do NOT hard-code the URL inside... unless it accounts for the base
  path"** (re-checked for the Google Sheets endpoint specifically, since
  Phase 43 just wired it up): `NEXT_PUBLIC_REGISTRATION_ENDPOINT` points
  at an external `script.google.com` URL — a different origin entirely,
  never subject to this app's own `basePath` at all. Nothing about this
  phase's `basePath` change affects it, and nothing needed to change in
  `lib/registration/submissionConfig.ts`/`submitRegistration.ts`.
- **"Do NOT create incorrect root URLs"** (SEO/robots/sitemap section):
  checked whether this project has a sitemap, `robots.txt`/`robots.ts`,
  a web app manifest, or a favicon — **it has none of these** (grepped
  `app/` and `public/` for every standard Next.js file-convention name;
  zero matches). There was nothing already wrong to fix, and nothing was
  invented — adding a sitemap/robots file wasn't asked for and isn't
  scoped to "prepare the existing app for a sub-path," so none was
  added. This is flagged as a real gap below, not silently left out.
- **"Do NOT deploy anything."** No deployment action was taken — no
  build was pushed anywhere, no Cloudflare configuration was touched
  (this session has no access to any Cloudflare account or dashboard at
  all). See "Exact deployment structure required" in the final report
  for why the actual server-side placement of this app's `out/` output
  is a decision this phase can describe but not make or execute.

## Navigation — why nothing needed to change

This was the single most important thing to verify correctly rather than
assume, since a wrong answer here would silently break every internal
link once deployed. Next.js's `basePath` config automatically prefixes:
`next/link`'s `<Link href="...">` (both when Next resolves the route
internally, e.g. `href="/register"`, and when a query string is appended,
e.g. `EventDetailsModal`'s `href={\`/register?event=${event.id}\`}`),
`useRouter()`'s `push`/`replace`, and `redirect()` from `next/
navigation`. Every single internal navigation call in this codebase goes
through one of those three — confirmed by reading every file's own
imports, not by pattern-matching `href=` strings alone (a plain `<a
href="/...">` would **not** get the prefix automatically, and this
codebase was checked specifically for that case: the only bare `<a>`
tag with a root-relative-looking href is `ContactContent.tsx`'s
`href={toTelHref(phone)}`, which builds a `tel:` URI, not a path — safe,
unaffected). `app/layout.tsx`'s `href="#main-content"` skip-link is a
same-page fragment, also unaffected by `basePath`.

## Asset paths — why these seven call sites, and no others

Grepped every `.ts`/`.tsx` file for every raw string ending in a known
asset extension, and separately for `src=`/`poster=` attributes with a
literal leading `/`. Total: three files, seven render call sites,
backed by twelve actual binary files under `public/` (five brand logos,
four gallery photos, three cinematic-intro assets — one of which,
`affinity-lamp.png`, is referenced twice, as both the intro's static
`<img>` and its `<video>`'s `poster`). `data/branding.ts` and `data/
gallery.ts` themselves were **not** changed — they still store plain
`public/`-relative path strings exactly as before (their own doc
comments already say so); `assetPath()` is applied once, at the single
point each of those strings actually becomes a DOM `src` attribute
(`BrandLogo`, `Gallery`), which is a much smaller, more auditable change
than rewriting every stored path in two data files. This project has
never used `next/image` anywhere (confirmed — a documented Phase 28/29
precedent, not new to this phase), so there was no `next/image`-specific
`basePath` behavior to reconcile.

**The `public/intro/` video/lamp/genie files themselves are not present
in this cloud sandbox's own copy of the repository** (only the five
logo and four gallery files are — likely because of this sandbox's
limited disk allowance, and those files having only ever been committed
directly to the organizer's own computer). This didn't block this
phase's work — fixing `CinematicIntro.tsx`'s three path strings requires
only the source file, not the binary assets themselves — but it does
mean this phase could not visually confirm the intro still plays
correctly; that remains an open item, same in kind as every prior
phase's "not seen in a real browser" caveat.

## Decisions worth knowing about

- **`basePath` was set unconditionally — not gated behind
  `NODE_ENV === "production"`.** Next.js's official subpath-deployment
  docs sometimes show a `NODE_ENV`-conditional basePath (empty locally,
  the real value in production) specifically so local dev keeps running
  at the bare `localhost:3000/` root. This phase deliberately did **not**
  do that: the phase brief's own "Testing" section explicitly asks to
  verify `/affinity26/`, `/affinity26/register/`, `/affinity26/events/`,
  `/affinity26/rules/` — i.e., to test *the real deployed shape*, not a
  dev-only approximation of it. A `NODE_ENV`-conditional basePath would
  make local dev diverge from production exactly where a subpath bug is
  most likely to hide, defeating that test requirement. The trade-off,
  stated plainly: `npm run dev` now serves the app at
  `http://localhost:3000/affinity26/`, not the bare `http://
  localhost:3000/` root — visiting the bare root during local dev will
  404. This is expected `basePath` behavior, not a break, and is the
  correct behavior to test against since it matches production exactly.
- **`trailingSlash: true` was added, not just `basePath`.** The target
  URL structure in the brief is explicitly trailing-slash
  (`.../affinity26/register/`). With `output: "export"`,
  `trailingSlash: true` is what makes `next build` emit
  `out/register/index.html` (folder-style) instead of
  `out/register.html` — the on-disk shape a static file host needs to
  serve a trailing-slash URL without a redirect or a 404. Without this,
  the brief's own target URLs would not cleanly resolve.
- **No `assetPrefix` was added.** `assetPrefix` is for serving
  `_next/static/...` chunks from a *different* origin (a CDN domain).
  AFFINITY '26 and MKZORA share one origin (`mkzora.com`) — only the path
  differs — so `basePath` alone already correctly prefixes
  `_next/static/...` URLs in the generated HTML; adding `assetPrefix`
  here would be redundant at best, and risks pointing static chunks at
  the wrong place if ever misconfigured.
- **`metadataBase` was added even though nothing was "accidentally"
  broken by it yet** (no canonical/OG-image metadata exists anywhere in
  this codebase today) — a forward-looking, low-risk, single-line fix
  directly responsive to the brief's own "AFFINITY '26 should have its
  own metadata... do not accidentally set canonical URLs to
  https://mkzora.com/" instruction, so the very first time any page adds
  an OG image or canonical link, it resolves correctly by default rather
  than needing to be remembered.
- **No sitemap/robots/manifest file was created.** The brief's own
  instruction here is conditional — "if present, ensure AFFINITY URLs
  correctly use /affinity26/" — and none are present. Inventing one
  wasn't asked for and would be exactly the kind of "do not attempt
  every feature at once" scope creep the project's own standing
  operating rules warn against. Flagged as a real, open gap (see
  "Suggested next phase") rather than silently left undone.

## Still-open limitations

- **No real `next build` was run.** This sandbox still has no npm
  registry access (unchanged since every earlier phase). What *was*
  verified: strict `tsc --noEmit` over the pure-logic file set including
  the new `lib/basePath.ts` (zero errors), an esbuild syntax pass over
  all 89 `.ts`/`.tsx` files (zero errors, up from 88), a script
  confirming all 187 `@/...` imports resolve (up from 184), `next.config.
  mjs` itself successfully parsed as a real ES module with `node` and its
  exported config object inspected directly (confirms the literal shape:
  `basePath: "/affinity26"`, `trailingSlash: true`,
  `env.NEXT_PUBLIC_BASE_PATH: "/affinity26"` — not just that the
  comments claim this), and `assetPath()` was executed at real JS
  runtime with `NEXT_PUBLIC_BASE_PATH` both set and unset, confirming it
  produces exactly `/affinity26/assets/logo/mkzora-logo.png`-shaped
  output. **This is not the same claim as "a real `next build` with
  `output: export` + `basePath` + `trailingSlash` together succeeds and
  produces the expected `out/` tree"** — that combination has never been
  exercised in this project before, and only a real `next build` (which
  this sandbox cannot run) can confirm it. This is the single most
  important remaining verification step before deployment.
- **The cinematic intro's actual binary assets aren't in this sandbox's
  own copy of the repo** (see above) — the path *strings* were fixed and
  verified, but the intro's actual on-screen behavior under `/affinity26/`
  has not been, and cannot be, visually confirmed from here.
- **No sitemap, robots.txt, or web manifest exists.** Not a regression
  from this phase — confirmed these never existed in this project at
  all — but worth having on record as a real gap.

## Suggested next phase

1. Run `npm run build` locally (now that `.env.local` has the real
   registration endpoint from Phase 43) and inspect the real `out/`
   tree: confirm it contains `out/index.html`, `out/register/index.html`,
   `out/events/index.html`, `out/rules/index.html`, `out/contact/
   index.html`, `out/success/index.html`, and that every asset URL inside
   those HTML files' source actually reads `/affinity26/...`, not a bare
   `/...` — the brief's own "after build, inspect out/" testing step.
2. Decide, on the Cloudflare side (outside this repo, and outside what
   this session can do), **how** `out/`'s contents physically end up
   served at `mkzora.com/affinity26/*` without touching the existing
   MKZORA deployment. Two standard shapes, spelled out in this phase's
   final report: (a) copy `out/`'s contents into a `affinity26/`
   subfolder of whatever the *existing* MKZORA Cloudflare Pages
   project already serves from its root, or (b) deploy this app as its
   *own*, separate Cloudflare Pages project, then add a Cloudflare
   route/Worker on `mkzora.com/affinity26/*` pointing at it. Which one
   applies depends on how the existing MKZORA Cloudflare project is
   already set up — information this session doesn't have.
3. Once deployed, run the brief's own responsive/testing checklist
   against the real `https://mkzora.com/affinity26/` URL (not
   `localhost`) — that's the first environment where MKZORA's own
   existing CSS/JS/fonts on the same origin could theoretically collide
   with AFFINITY's, something no amount of local testing can rule out.
4. If wanted, add a sitemap/robots file scoped correctly to
   `/affinity26/` — flagged as a real gap this phase found but was not
   asked to fill.
