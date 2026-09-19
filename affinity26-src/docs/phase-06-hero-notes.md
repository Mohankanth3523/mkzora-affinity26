# Phase 06 — Cinematic Hero: notes for future sessions

Persisted for continuity. See also `README.md` (project status) and
`docs/phase-05-navigation-notes.md`.

## What this phase delivered

`components/hero/Hero.tsx` — a new component, used by `app/page.tsx` in
place of the old inline hero `<section>`. Nothing else on the landing
page changed: Story/Theme/Cause/Events-teaser are still Phase 02's
placeholder markup, per the phase's explicit "implement only the hero."
Two supporting files also changed:

- `tailwind.config.ts`: added one keyframe (`hero-reveal`, a fade+rise)
  and six named animations (`hero-1` through `hero-6`), each the same
  keyframe at a different baked-in delay (0/350/700/1050/1400/1750ms).
- `app/globals.css`: the reduced-motion rule now also zeroes
  `animation-delay`/`transition-delay` (previously only duration), so a
  `prefers-reduced-motion` user sees the hero's content all at once
  immediately rather than a still-staggered sequence of instant pops —
  duration alone wasn't enough once a component (this one) started using
  meaningful delays.

## Why six named animations instead of `animate-hero-reveal` + a delay utility

First instinct was one `animate-hero-reveal` utility class paired with a
per-element `[animation-delay:Xms]` arbitrary-value class. That works,
but it depends on which of two same-specificity rules (the `animation`
shorthand vs. the `animation-delay` longhand) Tailwind happens to emit
later in its generated stylesheet — a real but non-obvious dependency on
utility ordering. Baking each delay into its own self-contained named
animation (`hero-1`…`hero-6`) removes that dependency entirely — there is
only ever one `animation-*` declaration per element, so there's nothing
for two rules to race over. Slightly more config, meaningfully more
robust, and the names double as inline documentation of the sequence
order in the component itself.

## Truth-mode audit of every string in the hero

Every fact came from `data/content.ts`'s `festivalIdentity`, used
unmodified:

- `festivalIdentity.name` → "AFFINITY '26" (rendered as-is, not
  hand-split into "AFFINITY" + "'26", to avoid any risk of subtly
  altering the source string's punctuation/spacing).
- `festivalIdentity.presentedBy` → "Dhruvaas batch". Phase 06's own
  request text spelled this "DHURVAAS BATCH" — that's a typo relative to
  the verified source data, so the source spelling was used, not the
  request's.
- `festivalIdentity.edition` → "11th Edition".
- `festivalIdentity.institution` → "Karpaga Vinayaga Institute of
  Medical Sciences **and** Research Centre" — kept the source's "and,"
  not the request text's "&".
- `THEME_LABEL` ("Arabian Nights") isn't from the brochure, but it's not
  invented either — it's the project brief's own repeated, explicit
  statement ("The official theme is ARABIAN NIGHTS"), and the existing
  Phase 02 placeholder page and `app/layout.tsx` metadata already state
  it the same way.
- `TAGLINE` ("Every Talent Becomes a Tale") is explicitly one of the
  project brief's own listed examples of *acceptable design language* —
  used and commented as design copy, kept visually and structurally
  separate from the `festivalIdentity` facts around it.
- No countdown: no verified festival date exists anywhere in
  `data/content.ts` or `docs/affinity-content-truth.md`, so none was
  added, exactly as instructed.
- No invented statistics: the only number in the hero is the edition
  ordinal, which is verified source data, not a computed/invented count.

## Decisions worth knowing about

- **Pure Server Component, zero client JS.** The whole six-step reveal
  is CSS-only (`animation-fill-mode: backwards` holds each element
  invisible until its delay elapses). This means it also works correctly
  with JavaScript disabled — CSS animations don't need JS to run — and
  needs no hydration.
- **The hero has its own decorative composition**, not just the global
  `AtmosphereBackground` showing through. It reuses the same design-
  system pieces (`StarField`, `Crescent`, `Lantern`, `PalaceSilhouette`)
  but more prominent/larger, since this is a dedicated cinematic moment,
  not ambient site-wide texture — plus one hero-only addition, a hairline
  diamond/geometric frame behind the title (`opacity-[0.07]`, an inline
  SVG, no new dependency).
- **Mobile got real, separate sizing decisions**, not a shrunk desktop
  layout: title starts at `text-4xl` (36px) on the smallest screens
  specifically so "AFFINITY '26" fits a 320px viewport with room to
  spare (checked the arithmetic, not just picked a size that looked
  plausible); the two lanterns and crescent are smaller and positioned
  higher/tighter so they never compete with the text column; institution
  text drops to 11px with tighter letter-spacing on mobile so the long
  institution name wraps to fewer lines.
- **New color usage was contrast-checked, not assumed** — `text-ivory/60`
  (the institution line, this hero's smallest/lowest-contrast text) was
  computed at 6.29–6.52:1 against both dark backgrounds, comfortably
  past the 4.5:1 AA floor. Recorded in
  `docs/design-system-accessibility.md`.
- **`app/page.tsx`'s hero `<section>` was fully replaced**, not
  augmented — the old inline hero (Phase 02 placeholder, using
  `festivalIdentity` directly in unstyled markup) is gone, replaced by
  `<Hero />`. Its `id="hero-heading"` was preserved so nothing else
  referencing that id breaks (nothing currently does, but this keeps the
  pattern consistent with the rest of the page's `aria-labelledby`
  sections).

## Still-open limitation (unchanged since Phase 02)

Same npm-registry-unreachable constraint as every prior phase. Verified
this phase with the same method as always: strict `tsc --noEmit` (zero
errors on all pure-logic/token files), esbuild syntax-check (zero errors,
47 `.ts`/`.tsx` files in the checked directories), and a script
confirming all 73 `@/...` imports resolve. **The six-stage animation
timing and the mobile layout have not been seen in a real browser** —
the arithmetic behind them (font-width estimates, animation delay
ordering, contrast ratios) is sound, but "does it actually *feel*
cinematic and not sluggish/rushed" is a judgment call that needs
`npm run dev` on a machine with real internet access to make.

## Suggested next phase

The Story / Cause / Events-teaser sections below the hero on the landing
page are the most natural next target — they're still Phase 02 plain
markup sitting directly under a now-finished cinematic hero, and the
brief lists "Event/story introduction" and the "Blindness-awareness cause
section" as its own explicit primary-goal items (3 and 4).
