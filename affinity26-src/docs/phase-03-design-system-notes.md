# Phase 03 — AFFINITY '26 Design System: notes for future sessions

Persisted so a future session (or a different device) can pick this project
up without re-deriving these decisions. See also `README.md` (project
status), `docs/design-system-accessibility.md` (full contrast matrix), and
the Phase 00/02 notes for earlier decisions.

## What this phase delivered

A complete, reusable visual design system — **not** the final pages.
Explicit instruction was "Do not build the complete pages yet," so
`app/page.tsx`, `app/events/page.tsx`, the registration wizard step
components, etc. are still Phase 02's plain placeholder markup. They do
not yet import from `components/design-system/`.

1. **`styles/tokens.ts`** — single source of truth for colors, font
   families, spacing scale, radii, shadows, borders, transitions, and
   container widths. Values are exactly the palette given in the project
   brief (Midnight #070A18 / Royal Navy #0D1530 / Antique Gold #C9A24D /
   Warm Gold #E8C76A / Burgundy #3A1024 / Desert Sand #D9C19A / Ivory
   #F7F0DE / Emerald #0F6658) — nothing invented.
2. **`tailwind.config.ts`** — imports `styles/tokens.ts` and extends
   Tailwind's theme with it (kebab-case utility names: `royal-navy`,
   `antique-gold`, etc.), rather than duplicating the values.
3. **`app/layout.tsx`** — wires `next/font/google` for Cinzel (display),
   Cormorant Garamond (accent/italic), and Inter (body), each exposed as a
   CSS variable (`--font-display`/`--font-accent`/`--font-body`) that
   `styles/tokens.ts`'s `fontFamilies` references. Also adds a
   skip-to-content link and sets the dark base background/text directly
   on `<body>` to avoid a flash of unstyled (light) background.
4. **`app/globals.css`** — base layer (focus-visible ring, selection
   color, heading font mapping), the `twinkle`/`lantern-glow` keyframes,
   and the single project-wide `prefers-reduced-motion` rule that
   collapses all animation/transition durations — individual components
   don't each need their own reduced-motion media query.
5. **`components/design-system/`** — all 11 requested components, each a
   plain presentational component (no data-layer or registration-state
   knowledge): `SectionContainer`, `SectionHeading`, `GoldDivider`,
   `GoldButton`, `SecondaryButton`, `OrnamentalFrame`, `EventBadge`,
   `StarField`, `Lantern`, `Crescent`, `PalaceSilhouette`. Import from
   `@/components/design-system` (barrel `index.ts`).

## Decisions worth knowing about

- **No large border-radius token.** The brief explicitly calls out
  "repetitive rounded cards" as something to avoid, so `styles/tokens.ts`
  `radii` tops out at `lg` (0.5rem) and most components use small/no
  radius. Premium/ornamental feel comes from `OrnamentalFrame`'s gold
  corner brackets and hairline borders instead of rounded corners or
  glassmorphism/blur.
- **StarField positions are deterministic, not `Math.random()`.**
  `styles/star-positions.ts` is a pre-generated array (Python
  `random.seed(2026)`, 48 stars) so server and client render identical
  markup — using `Math.random()` at render time would cause a React
  hydration mismatch.
- **No new npm dependency was added**, including `lucide-react` (which
  the project brief lists as a suggested technology). `EventBadge`'s two
  icon needs (a dot, an alert-triangle) are hand-authored inline SVG
  instead. Given the npm registry is unreachable in this sandbox (see
  below) and Phase 00's "don't install unnecessary deps" rule, adding an
  unverified new dependency for two small glyphs was judged not worth the
  risk. If `lucide-react` is wanted later, it's a low-risk addition on a
  machine with real npm access.
- **Color pairings are contrast-checked, not assumed** — see
  `docs/design-system-accessibility.md`. This caught a real mistake
  before it shipped: an early draft comment in `styles/tokens.ts` claimed
  gold/sand text was safe on an emerald background; the actual computed
  ratios show only **ivory** clears AA-normal-text on emerald
  (antiqueGold fails even at large-text size, 2.86:1). `EventBadge`'s
  `mode="online"` chip (the only emerald-fill use in this phase) uses
  ivory text for this reason.
- **`EventBadge` props are a discriminated union**
  (`variant: "category" | "mode" | "verification"`, each pairing with its
  own `value` type). This pattern can silently lose TypeScript's
  discriminated-union narrowing when the props are destructured before
  branching — it was isolated and re-verified under a real `tsc --strict`
  pass rather than assumed safe (see README's verification section).
- **`Navbar`/`Footer` were deliberately left as Phase 02 placeholders.**
  They're layout components, not one of the 11 named design-system
  components, and restyling them is page-level work this phase's "do not
  build the complete pages yet" instruction puts out of scope.
- **Fixed a pre-existing doc-location bug while here:** `docs/frontend-
  audit.md` and `docs/affinity-content-truth.md` (Phase 01 deliverables)
  had only ever been written to `/home/claude/AFFINITY26/docs/`, one
  directory above the actual Next.js project
  (`/home/claude/AFFINITY26/affinity26-frontend/`) — so `README.md`'s own
  relative links to `docs/frontend-audit.md` were broken inside the
  shipped repo. Copied both into
  `affinity26-frontend/docs/` so the repo is self-contained. The outer
  copies were left in place rather than deleted.

## Still-open limitation (unchanged from Phase 02)

The npm registry, PyPI, and jsdelivr are unreachable from this sandbox
(confirmed `403 host_not_allowed`), so nothing here has been through a
real `npm install && npm run build`. This phase's code was verified with
globally-preinstalled TypeScript 6.0.3 (strict-mode `tsc --noEmit` on
every non-JSX file) and esbuild (syntax-check on all 46 `.ts`/`.tsx`
files, plus a script confirming all 55 `@/...` imports resolve to real
files) — see `README.md` for the full list of what was and wasn't
checked. In particular, **whether the three Google Fonts actually fetch
correctly at build time has not been tested** — that needs a real
`npm run build` on a machine with internet access.

## Suggested next phase

Wire the design system into the actual pages (Landing/Hero, Events
explorer, the 6-step registration wizard, Rules, Success/pass, Contact) —
this was explicitly deferred, not skipped. `EventBadge` in particular was
designed anticipating `data/events/*.ts`'s `category`/`mode`/
`verificationStatus` fields, so it should drop into the eventual Events
explorer cards directly.
