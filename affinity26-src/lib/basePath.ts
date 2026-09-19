/**
 * Phase 44 — AFFINITY '26 now deploys under https://mkzora.com/affinity26/
 * rather than a domain root (next.config.mjs's `basePath`). Next.js
 * automatically prefixes every URL IT generates — `next/link` hrefs,
 * `useRouter()`/`redirect()` navigation, and the framework's own
 * `_next/static/...` chunk URLs — with `basePath`. It does **not**
 * automatically prefix a raw string handed straight to an `<img>`/
 * `<video>`/`<source>` `src`/`poster` attribute for a file under
 * `public/` (this is a well-documented Next.js `basePath` limitation, not
 * a bug) — those few call sites have to add the prefix themselves. This
 * file is the one place that happens.
 *
 * `NEXT_PUBLIC_BASE_PATH` is set from the exact same `basePath` constant
 * next.config.mjs uses for Next's own routing (via that file's `env`
 * block), so this can never silently drift from the real basePath.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * Prefixes a root-relative `public/` asset path (e.g.
 * `"/assets/logo/college-logo.png"`) with the app's current `basePath`,
 * so it resolves correctly whether the app is running at a domain root
 * (`BASE_PATH === ""`, e.g. local dev before this phase, or any future
 * deployment target that isn't under a sub-path) or under
 * `/affinity26` as it is now.
 *
 * A path that isn't root-relative (doesn't start with `/`) — an already-
 * absolute `https://...` URL, a `tel:`/`mailto:`/`wa.me` link, a `#`
 * fragment — is returned unchanged; those are never `public/` files and
 * a basePath prefix would corrupt them.
 */
export function assetPath(path: string): string {
  if (!path.startsWith("/")) {
    return path;
  }
  return `${BASE_PATH}${path}`;
}
