# Phase 40 — Mobile navbar logo responsiveness fix: notes for future sessions

Persisted for continuity. A narrow, targeted fix: the "Powered by MKZORA"
credit Phase 37 added to the global navbar was invisible in the collapsed
(hamburger) header bar at every width below 1280px — not clipped or
overlapping anything, simply never rendered there. This phase makes it
visible in that bar on every phone and tablet width, without touching
anything else about the navbar.

## The request

A screenshot-free bug report: on mobile, the MKZORA digital-partner logo
in the navbar is "not visible / is being clipped / hidden." The brief
asked to fix only the responsive navbar/logo behavior — explicitly not to
redesign the navbar, change the desktop navbar unnecessarily, remove the
logo, replace it with text, or touch the logo artwork itself — and to
investigate the actual cause first rather than assuming one.

## Investigation — the actual cause

Read `components/layout/Navbar.tsx` (the only place this credit is
rendered outside the footer) and `data/branding.ts` (the asset/identity
registry). The collapsed header bar (`<div className="flex h-16 items-
center justify-between sm:h-20">`) had four children:

1. The "AFFINITY '26" wordmark `Link` — always visible.
2. `<nav>` — `hidden lg:block` (nav links, ≥1024px only).
3. A `<div className="hidden items-center gap-5 lg:flex">` holding the
   Register button, itself containing a `<div className="hidden items-
   center gap-2 xl:flex">` — the MKZORA "Powered by" credit — nested one
   level deeper.
4. The hamburger trigger `<button>` — `lg:hidden` (<1024px only).

The credit's own visibility condition was the *intersection* of its
parent's `lg:flex` and its own `xl:flex` — meaning `display: none` at
every width below **1280px**, full stop. This isn't a clipping, z-index,
overflow, or positioning bug — the element was structurally never
rendered as visible at any phone or tablet width, in the bar that's
actually on screen without the user doing anything. It only became
reachable at all below 1024px by opening the full-screen mobile overlay
(the hamburger's own `role="dialog"`), which already carries its own,
separate copy of the same credit (added in Phase 37, unrelated to this
bug). "Visible only after opening the menu" is not the same claim as
"visible in the navbar," which is what the brief's own mockup
(`AFFINITY '26 ... MKZORA ... ☰`, all three elements in the same
collapsed bar) asks for.

Confirmed via `PIL`: `mkzora-logo.png` is a 1400×700px transparent PNG,
aspect ratio exactly 2:1 (not a wide wordmark banner) — so a compact
badge at a small height has a small, predictable width and was never the
actual constraint here.

Also checked (all clean, not part of this bug): `BrandLogo.tsx` (always
renders at `width: auto` against a caller height — no cropping/stretch
logic to get wrong); `SectionContainer.tsx` (fixed, generous horizontal
gutters — `px-4 sm:px-6 lg:px-8` — not a squeeze source);
`tailwind.config.ts` (no custom `screens` override — `sm`/`lg`/`xl` are
Tailwind's stock 640/1024/1280px, so the breakpoint reasoning above holds
exactly).

## The fix

One new element, one new class each on two existing ones, nothing else.

**`components/layout/Navbar.tsx`**: the hamburger `<button>` (previously
a bare `lg:hidden` sibling in the collapsed bar) is now wrapped in a new
`<div className="flex min-w-0 items-center gap-2 sm:gap-3 lg:hidden">`
alongside a second, compact `BrandLogo` badge (`heightClassName="h-4
sm:h-5"`, same `plaque` variant, `padding="sm"`, `siteBranding.poweredBy`
— the same identity Phase 37 already used, just a smaller instance of
it). This group is visible at exactly the same widths the hamburger
trigger itself always was (<1024px) — every phone and the 768–834px
tablet range the brief calls out — with no dependency on the overlay
being open. `shrink-0` on the badge and the button (and `min-w-0` on the
group) keep both from being squeezed if space is ever tight, per the
brief's own "use `flex-shrink`... so elements remain inside the
viewport" guidance.

**Deliberately not carrying a "Powered by" text label** — only the logo
— unlike the desktop credit, matching the brief's own mockup
(`MKZORA`, not `Powered by MKZORA`, in the compact bar) and keeping the
badge's footprint minimal on the narrowest phones.

**Completely untouched:** the existing `xl:`-gated "Powered by MKZORA +
Register" group (true desktop, ≥1280px, looks exactly as it did before
this phase); the mobile overlay's own MKZORA credit (still there,
unchanged — it's what keeps the logo visible while the overlay covers
this new compact badge, satisfying the brief's own "when the menu opens,
MKZORA logo should remain correctly positioned"); nav links, desktop
spacing/typography, the AFFINITY '26 wordmark, the hamburger's own
behavior/aria wiring, `BrandLogo.tsx`, `data/branding.ts`, the logo
artwork itself, and every other page/route/data file in the project.

## Why the 1024–1279px range (tablet/small-laptop, "desktop mode" already
active — nav links + Register showing, no hamburger) was left alone

That range sits on the *desktop* side of this codebase's own existing
`lg` boundary (nav links, Register button, and no hamburger are already
what render there), and its own MKZORA credit was already gated slightly
narrower (to `xl`, 1280px) by a Phase 37 design choice, not by this bug.
Widening that gate risks crowding a row that already holds five nav
links, "Powered by MKZORA," and the Register button — a change this
sandbox has no real browser to verify visually — and the brief is
explicit: "do not change the desktop navbar unnecessarily." The reported
bug ("not visible on mobile") describes the hamburger-mode bar
specifically, where the credit wasn't deferred to a later breakpoint —
it was entirely absent from the visible bar at every width. That's the
gap this phase closes; the pre-existing, narrower 1024–1279px desktop gap
is a different, smaller, already-somewhat-intentional-looking question
left for a future session if the organizer wants it changed.

## Testing

This sandbox still has no `next dev`/`next build`/real browser (see
Verification below), so nothing here was screenshotted. What was checked:

- Structural correctness via `esbuild` (full-file JSX parse — confirms
  balanced tags, no syntax errors introduced) and the `@/...`
  import-resolution script — both already covered in the full verification
  pass below.
- `BrandLogo` prop usage (`src`/`alt`/`heightClassName`/`padding`/
  `className`) checked by hand against `BrandLogoProps`'s own interface
  in `components/design-system/BrandLogo.tsx` — every prop passed is one
  the component already declares, and this is the same prop shape the
  existing Phase 37 desktop credit already uses successfully, just a
  smaller `heightClassName`.
- A hand-computed width budget for the narrowest supported viewport
  (320px): left wordmark block (`Crescent` icon + "AFFINITY '26" text,
  ~115px) + right group (compact MKZORA badge at `h-4`/32px-wide logo +
  plaque padding + hairline border, ~50px, plus an 8px gap, plus the
  44px hamburger tap target, ~102px total) + `SectionContainer`'s fixed
  32px of horizontal gutter (`px-4` × 2) ≈ 249px of required width inside
  a 320px viewport — roughly 70px of slack for the `justify-between` gap
  between the two groups, well before any collision. The MKZORA logo's
  own 2:1 aspect ratio (confirmed via `PIL`, not assumed) is what keeps
  this budget small — it was never at risk of being a wide banner that
  eats the row.
- Confirmed `tailwind.config.ts` doesn't override `screens` or disable
  `shrink`/`min-w` core plugins, so the breakpoint and shrink-behavior
  reasoning above holds against the project's actual config, not just
  Tailwind's documented defaults.

Not verified: this sandbox still has no `next dev`/`next build`/real
browser, so the actual rendered layout at 320/360/375/390/414/430/768/
834/1024px and true desktop widths, the mobile-menu-open state, and
scroll behavior with the fixed header are all reasoned through by hand
(see the width budget above) rather than screenshotted or measured
against a live DOM.

## Verification

- Strict `tsc --noEmit` over the pure-logic file list — **29 files**
  (unchanged — `Navbar.tsx` is a `.tsx` component with `react`/`next`
  imports, never on this pure-logic list, exactly as it was through
  Phase 37) — zero errors.
- `esbuild` syntax-check over every `.ts`/`.tsx` file in the repo —
  **89 files** (unchanged — one file edited in place, none added or
  removed) — zero failures.
- A script confirming every `@/...` import resolves — **179**
  (unchanged from Phase 39 — this phase added no new import;
  `BrandLogo`/`siteBranding` were already imported into `Navbar.tsx`
  since Phase 37) — all resolve.
- `npm run lint` / `npm run build` still cannot run in this sandbox — no
  `node_modules`, no npm registry access (confirmed again this phase —
  same restricted-network limitation documented since Phase 01).

## Still-open limitations

- Not verified in a real browser at any width — see "Not verified" under
  Testing above. The width budget is a hand calculation from known
  Tailwind utility values and the logo's actual (PIL-confirmed) pixel
  dimensions, not a measurement of a live rendered page.
- The 1024–1279px desktop-mode gap (nav links + Register visible, MKZORA
  credit still `xl`-gated) is unchanged from before this phase — see
  "Why the 1024–1279px range... was left alone" above. Flagged here, not
  fixed, since it's a different, pre-existing, narrower question than the
  reported "not visible on mobile" bug this phase closes.
