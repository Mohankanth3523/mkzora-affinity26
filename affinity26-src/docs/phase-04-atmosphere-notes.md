# Phase 04 — Global Arabian Nights Atmosphere: notes for future sessions

Persisted for continuity. See also `README.md` (project status) and
`docs/phase-03-design-system-notes.md` (the components this phase reuses).

## What this phase delivered

**One new component**, `components/layout/AtmosphereBackground.tsx`,
mounted **once** in `app/layout.tsx` (inside `<body>`, before `<Navbar />`).
Nothing else changed except a one-line fix inside an existing Phase 03
component (see below) and doc/README updates. No new page, section, or
route was added — this was explicitly scoped as "global visual
environment only."

The component is a single `position: fixed; inset: 0; pointer-events:
none; aria-hidden="true"` layer, given a negative `z-index` so it paints
behind `<Navbar />`/`<main>`/`<Footer />` but in front of `<body>`'s own
flat background color. Being `fixed` and out of normal flow, it cannot
affect document height/scrolling, and being `pointer-events-none` plus
`aria-hidden`, it cannot intercept clicks or be announced by assistive
tech — both requirements from the brief ("must not interfere with...
buttons, forms, scrolling... accessibility").

Composition, back to front:

1. `bg-night-vignette` — the same radial-gradient token from Phase 03,
   now used as the site's constant sky rather than a per-section
   treatment.
2. A faint Arabian geometric lattice (`GeometricLattice`, a local helper
   in the same file) — two overlapping squares per tile (a real,
   traditional Islamic motif, not an invented pattern), opacity `0.035`.
3. One soft warm radial glow near the top — suggests moonlight/lantern
   warmth without a literal light-source graphic.
4. `StarField` (Phase 03, reused as-is, deterministic positions), wrapped
   in an extra `opacity-60` since this is now a full-time backdrop rather
   than a single hero section.
5. `Crescent` (Phase 03, reused), fixed top-right, `warm-gold/50`.
6. `PalaceSilhouette` (Phase 03, reused) along the bottom, colored
   `text-royal-navy` (not gold) so it reads as a barely-there horizon
   against the `midnight` sky rather than a decorative gold motif.
7. Two `Lantern`s (Phase 03, reused) framing the top corners — kept to a
   pair, not tiled/repeated, so this stays atmosphere rather than
   clutter.
8. `ViewportOrnamentalFrame` (a local helper) — a hairline
   `antique-gold/10` border plus four corner brackets around the whole
   viewport, inset with `max(10px, env(safe-area-inset-*))` so it never
   draws under a phone's notch or home-indicator.

No new `@keyframes` or motion was introduced. `StarField`'s twinkle and
`Lantern`'s glow already collapse under `prefers-reduced-motion` via the
one global rule in `app/globals.css` (from Phase 03) — this phase relies
on that existing gate rather than adding a new one, per the brief's
"support reduced motion" requirement.

## A real bug this phase caught and fixed

`PalaceSilhouette`'s default `preserveAspectRatio` was `"xMidYMax slice"`
(cover behavior) from Phase 03, written before it had an actual full-
viewport-width caller to test against. Worked through the arithmetic for
a real use (viewport ~1440px wide, atmosphere strip ~120px tall vs. the
graphic's native ~585×170 / 3.4:1 aspect ratio): "slice" scales to *cover*
the container, and since the container's aspect ratio here is far wider
than the graphic's, covering the width means overshooting the height by
~4×, which crops nearly all of it away — only the very bottoms of the
towers would render, no domes. Changed the default to `"xMidYMax meet"`
(contain), so any caller gets the *whole* skyline, centered and scaled to
fit, always. No existing page used this component before this phase, so
changing its default carried no risk of breaking something else.

## Decisions worth knowing about

- **Composition, not new primitives.** Nothing here duplicates a Phase 03
  component. `GeometricLattice` and `ViewportOrnamentalFrame` are new,
  but both are private helpers in this one file, not additions to
  `components/design-system/`'s 11-component public set — they're
  atmosphere-specific, not general-purpose reusable pieces the brief
  asked for by name.
- **Palace silhouette is navy, not gold**, deliberately — a gold skyline
  at low opacity still reads as a decorative motif; a `royal-navy`-on-
  `midnight` skyline reads as *distance*, which is closer to what
  "atmospheric" should mean here.
- **Total decorative element count was kept low on purpose**: one sky
  gradient, one pattern texture, one glow, one star field, one moon, one
  skyline, two lanterns, one frame — nine things, most barely visible.
  The brief explicitly warns against the site reading as "a fantasy
  game," and a background that's individually subtle but collectively
  busy would fail that instruction just as much as one loud element
  would.
- **Why this lives in `components/layout/`, not `components/design-
  system/`:** it's a singleton tied to the root layout (like `Navbar`/
  `Footer`), not a reusable atomic component meant to be dropped into
  arbitrary places.

## Still-open limitation (unchanged since Phase 02)

Same npm-registry-unreachable constraint as every prior phase — verified
with global TypeScript 6.0.3 (`tsc --noEmit`, zero errors on all pure-
logic files) and esbuild (zero syntax errors across all 47 `.ts`/`.tsx`
files; all 60 `@/...` imports resolve to real files). The CSS stacking
argument for why `AtmosphereBackground` actually paints behind content
(not on top of it) is reasoned from the CSS spec in this doc and in the
component's own comments, not confirmed by looking at a rendered browser
— that still needs `npm run dev` on a machine with real internet access.

## Suggested next phase

Wire the design system (Phase 03) and this atmosphere (Phase 04) into an
actual page — most naturally the landing page's hero section — since both
are still sitting unused behind Phase 02's plain placeholder markup.
