# Phase 37 — MKZORA logo in the navbar: notes for future sessions

Persisted for continuity. This phase added a small "Powered by MKZORA"
credit to the global `Navbar`, reversing one specific, previously
documented design call from Phase 33.

## The request

The user uploaded the MKZORA logo image (the same wide wordmark lockup
already integrated as `public/assets/logo/mkzora-logo.png` in Phase 29/33
— confirmed by direct visual comparison, not assumed) with the
instruction "navbar place this logo."

No new brand or asset was introduced. MKZORA was already a verified,
established digital partner in `data/branding.ts` (`siteBranding.
digitalPartners`, `siteBranding.poweredBy`), already credited on the
homepage Digital Partners section and in `Footer`'s sitewide "Website
Powered By" colophon line (Phase 29/33). This phase only adds a second
place that same identity is rendered — the navbar — reusing `siteBranding.
poweredBy` exactly, with no edits to `data/branding.ts` and no new image
file.

## Reversing Phase 33's call

Phase 33's own notes recorded a deliberate decision *not* to put any
third-party mark in the primary navigation, reasoning it would compete
with the site's own identity in the one spot every page's first
impression comes from. That reasoning was sound at the time, but this
phase is a direct, explicit user instruction to do exactly that — an
explicit follow-up request overrides a prior session's own judgment call,
so it was honored, with the placement and sizing chosen to keep the
credit clearly secondary (see "Design choices" below) rather than simply
skipping the concern Phase 33 raised.

`docs/phase-33-logo-refresh-notes.md` was updated in place — not
rewritten — to mark that one paragraph as superseded, with a pointer to
this file, so it still reads correctly as a historical record of what was
true through Phase 36 without misleading a future reader about the
current state of `Navbar`.

## What changed

`components/layout/Navbar.tsx` only. Two new imports
(`BrandLogo`, `siteBranding`), no other file's exports, types, or logic
touched.

- **Desktop** (`xl:` breakpoint and up only — 1280px+): a compact
  "Powered by" caption plus the MKZORA mark (via `BrandLogo`, default
  `"plaque"` variant, `heightClassName="h-5"`, `padding="sm"`) sits to the
  left of the "Register" button, inside the same `hidden lg:flex` group
  that already held just the button. Gated to `xl:` rather than `lg:`
  deliberately: at `lg` (1024px) the five nav links plus "Register" are
  already close to filling `SectionContainer`'s `wide` max-width once the
  fixed `px-8` gutters are subtracted, and a wrong guess here can't be
  screenshotted to confirm (see Testing) — `xl:` is the conservative
  choice, not a measured one.
- **Mobile overlay** (below `lg`, when the hamburger menu is open): the
  same caption + mark, centered, below the "Register" button, with
  `pb-8` bottom spacing. This is the *overlay* only — the collapsed
  mobile header bar itself (just the wordmark + hamburger, `h-16`) was
  left alone; there's no room there for anything else without crowding
  the existing 44px touch target.

## Design choices

- **`"plaque"` variant, not `"bare"`.** The MKZORA artwork itself is
  solid black (confirmed by opening the uploaded file directly — no
  color, no white space carved out of the mark). The navbar's background
  is either fully transparent (top of page) or `bg-midnight/95` (once
  scrolled) — both dark. A bare black mark would be invisible or
  near-invisible against either state. `BrandLogo`'s default "plaque"
  variant (small ivory card, hairline antique-gold border) is exactly
  the mechanism `Footer` already relies on for the same reason (see that
  component's own doc comment), so this reuses an established pattern
  rather than inventing a new one.
- **Size and position keep it secondary.** `h-5` is smaller than every
  other on-page use of `BrandLogo` (Footer's own credit is `h-9 sm:h-10`;
  its Digital Partners row is `h-11 sm:h-12`) — deliberately the smallest
  brand-mark treatment on the whole site, since the navbar is the one
  place `data/branding.ts`'s own hierarchy comment is most easily
  violated ("event mark is always the most prominent mark wherever more
  than one brand appears together"). It sits to the *right* of the nav
  links, separated from the "AFFINITY '26" wordmark at the far left by
  the full width of the header, rather than beside it.
- **Reused `siteBranding.poweredBy`, not a new field.** Its existing alt
  text ("MKZORA — this website is designed and powered by MKZORA") was
  already accurate for this second placement; no new `BrandMark` entry
  was needed.

## What was *not* touched

- `data/branding.ts` — no edits. Same asset, same identity, same alt
  text as every other MKZORA credit on the site.
- `Footer.tsx` — no code changes; its own "Powered By" colophon line is
  unaffected and unchanged.
- The homepage Digital Partners section, `RegistrationLayout`,
  `RegistrationPass` — none of these render `Navbar`'s new credit or were
  edited; Phase 33's own restraint decision for `RegistrationPass`
  (deliberately no partner logo on the printable pass) still stands.
- No AFFINITY '26 official event fact (name, fee, prize, eligibility,
  deadline, contact) was touched — this phase is entirely a brand-asset
  placement change, same category as Phase 33.

## Testing

Code-traced the new JSX (balanced tags, correct prop types against
`BrandLogoProps`, `siteBranding.poweredBy`'s shape) and confirmed by eye
against `BrandLogo`'s own implementation that `variant` defaulting to
`"plaque"` (never explicitly passed here) is exactly what was intended —
no typo defaulting it to `"bare"`.

Not verified: this sandbox still has no `next dev`/`next build`, so the
actual rendered width at 1024–1279px (whether the new `xl:`-gated credit
would have fit at `lg:` too, or whether `xl:` was too conservative) is a
judgment call, not a measurement. If it turns out there's comfortable
room at `lg:` on the user's own machine, only the one `xl:` class on the
credit's wrapping `<div>` needs to change to `lg:`.

## Verification

- Strict `tsc --noEmit` over the pure-logic file list — **29 files**
  (unchanged — `Navbar.tsx`/`Footer.tsx` are components, not on this
  list, and neither this phase nor Phase 36 changed that list) — zero
  errors.
- `esbuild` syntax-check over every `.ts`/`.tsx` file in the repo —
  **89 files** (unchanged — no files added or removed, only
  `Navbar.tsx` edited and `Footer.tsx`'s neighboring `docs/` file edited)
  — zero failures.
- A script confirming every `@/...` import resolves — **176** (up from
  174 — `Navbar.tsx` gained two new `@/...` imports, `BrandLogo` and
  `siteBranding`; nothing else changed) — all resolve.
- Read the full edited file after editing to confirm JSX tag balance and
  prop correctness by eye, on top of `esbuild`'s own JSX parse.
- `npm run lint` / `npm run build` still cannot run in this sandbox — no
  `node_modules`, no npm registry access. Unchanged limitation from every
  previous phase.

## Still-open limitations

- Not verified in a real browser — the `xl:` breakpoint choice for the
  desktop credit, and the mobile overlay's new bottom block, are
  unverified against an actual rendered page at any of the project's
  required widths.
- This phase does not resolve the stale `components/registration/
  DetailsStep.tsx` file flagged at the end of Phase 36 as still present
  on the user's device (this session has no way to delete files there —
  see that phase's own notes). It remains a real blocker for `next build`
  on the user's machine, independent of this phase's change.
