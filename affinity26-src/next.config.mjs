/**
 * Phase 41: `output: "export"` added. The project's real deployment
 * target is Cloudflare Pages as a static export (confirmed by
 * docs/phase-28-cinematic-intro-notes.md), and this phase's own brief is
 * explicit that the new registration-submission flow must stay
 * compatible with `output: "export"`/`out` — no Next.js server, no API
 * routes, a client-only `fetch()` to an external Google Apps Script Web
 * App instead. This config previously had no `output` set at all, which
 * this phase treats as a gap directly in scope (not an unrelated
 * architecture change) since it's foundational to whether the new
 * submission flow the brief asks for is actually deployable as
 * specified. See docs/phase-41-confirm-registration-google-sheets-notes.md.
 */

/**
 * Phase 44 — the single source of truth for the sub-path this app is
 * deployed under. AFFINITY '26 does not get its own domain: it lives at
 * https://mkzora.com/affinity26/, alongside the existing MKZORA landing
 * page at https://mkzora.com/ (which this project never touches — it has
 * no access to and makes no changes to that site's own codebase). Every
 * other value this phase needed (`basePath` below, and
 * `NEXT_PUBLIC_BASE_PATH` for the handful of raw `<img>`/`<video>`
 * `public/` references that Next's `basePath` does NOT auto-prefix — see
 * lib/basePath.ts) is derived from this one constant, so there is exactly
 * one place to change if the deployment path ever moves.
 */
const basePath = "/affinity26";

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  output: "export",

  // Phase 44 — deploy AFFINITY '26 under https://mkzora.com/affinity26/
  // rather than at a domain root, without touching the existing MKZORA
  // homepage at https://mkzora.com/. `basePath` automatically prefixes
  // every Next-managed URL: `next/link`/`useRouter`/`redirect()`
  // navigation, and the app's own `_next/static/...` JS/CSS chunk URLs —
  // all of it already exercised in this codebase (Navbar/Footer/GoldButton/
  // SecondaryButton all route through `next/link`; ConfirmStep's
  // post-submit redirect and `/register/success`'s redirect both go
  // through `next/navigation`). It does NOT affect `assetPrefix` (not
  // needed here — AFFINITY and MKZORA share one origin, mkzora.com, so
  // there's no separate CDN domain to point static chunks at) and it does
  // NOT affect raw string paths handed straight to `<img>`/`<video>`
  // `src`/`poster` for files under `public/` — those still need manual
  // prefixing, which is exactly what `lib/basePath.ts`'s `assetPath()`
  // helper (backed by `NEXT_PUBLIC_BASE_PATH` below) exists for. See
  // docs/phase-44-mkzora-subpath-deployment-notes.md for the full audit
  // of every place this mattered.
  basePath,

  // Phase 44 — the target URL structure is explicitly trailing-slash
  // ("https://mkzora.com/affinity26/register/", not ".../register"). With
  // `output: "export"`, `trailingSlash: true` is what makes `next build`
  // emit folder-style HTML (`out/register/index.html`) instead of
  // `out/register.html` — the shape a static file host needs on disk to
  // serve a trailing-slash URL cleanly, and the one place a mismatch here
  // would otherwise cause 404s or a redirect loop once deployed.
  trailingSlash: true,

  // Phase 44 — mirrors `basePath` into a `NEXT_PUBLIC_`-prefixed variable
  // so client code can read it too (`next.config.mjs`'s own `basePath`
  // value isn't otherwise exposed to application code). See
  // lib/basePath.ts — the one file that reads this.
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
