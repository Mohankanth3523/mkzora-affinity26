# Phase 22 — Motion System: notes for future sessions

Persisted for continuity. See also `README.md` (project status) and the
prior phase-notes docs, especially `docs/phase-21-responsive-audit-notes.md`
(the previous audit-style phase).

## What this phase was

An audit of every animation already in the project, followed by a small
set of deliberate additions/adjustments to make the motion language
consistent across Hero / Sections / Cards / Buttons / Forms — per the
phase brief's own five categories — while explicitly avoiding the
brief's "Avoid" list (parallax, spinning, bouncing, constant floating,
long animations, distracting particles). Not a redesign: every change
below is a small class-level addition to an existing component, nothing
was restructured.

## Audit: what already existed (before this phase)

- **Hero** (`components/hero/Hero.tsx`, `tailwind.config.ts`'s
  `hero-reveal` keyframe + `animate-hero-1`…`-6`): a six-stage staggered
  fade-up-and-in (stars → crescent → lanterns → title → supporting text →
  CTA), pure CSS, no JS. Present since Phase 06.
- **Sections** (`components/design-system/ScrollReveal.tsx`): a
  scroll-triggered fade-up, defaulting to visible so a hydration failure
  can never hide content, used by Story and Cause (the two landing-page
  sections meant to be scrolled into). Present since Phase 07.
- **Modal** (`components/events/EventDetailsModal.tsx`,
  `modal-backdrop`/`modal-panel` keyframes): a 200–250ms fade/rise on
  open. Present since Phase 10.
- **Accordion** (`components/design-system/Accordion.tsx`): a chevron
  rotate plus a `grid-template-rows` 0fr/1fr expand/collapse, both
  250ms. Present since Phase 19.
- **Ambient decoration**: `StarField`'s `twinkle` (opacity-only,
  3.7–7.2s per star, deterministic and staggered) and `Lantern`'s
  `lantern-glow` (opacity + a 6% scale pulse, 3.6s loop) — both very
  subtle, both automatically collapsed by the project-wide
  `prefers-reduced-motion` rule in `app/globals.css`.
- **Buttons/links/inputs**: color-only `transition-colors`/
  `transition-[background-color,...]` on hover, already applied fairly
  consistently across `GoldButton`, `SecondaryButton`, the Navbar, the
  Footer, Contact links, Accordion headings, and form inputs (border
  color swaps to `error-rose` on validation failure).
- **One global gate**: `app/globals.css`'s `@media
  (prefers-reduced-motion: reduce)` collapses every animation/transition
  duration and delay to ~0 project-wide — every component above relies
  on this one rule rather than repeating its own media query (a few,
  like Accordion, also add a belt-and-braces `motion-reduce:` Tailwind
  variant on top, which is redundant with the global rule but harmless).

**Nothing in the existing system violated the brief's "Avoid" list**: no
parallax, no spinning, no bouncing/overshoot easing (the one custom
easing curve, `ease-ornamental`
(`cubic-bezier(0.16, 1, 0.3, 1)`), is a pure ease-out with no rebound),
no continuously-floating (translating) elements, and the two infinite
loops (`twinkle`, `lantern-glow`) are opacity/scale-only ambient texture,
not literal moving particles.

## What this phase changed

1. **Hero timing tightened — "cinematic but short."** The six-stage
   sequence previously ran 900ms per stage with a 350ms stagger,
   finishing at ~2650ms before the CTA was fully visible. That reads as
   cinematic but not short. Tightened to 700ms per stage / 220ms stagger
   (finishes at ~1800ms) — same six stages, same easing curve, same
   order, just faster (`tailwind.config.ts`'s `animate-hero-1`…`-6`
   values).
2. **Cards now get a small hover response.** Before this phase, neither
   `EventCard` nor `PackageStep`'s package-choice cards had *any* hover
   feedback on the card itself — only the buttons/links inside them did.
   Added an opt-in `interactive` prop to `OrnamentalFrame`
   (`components/design-system/OrnamentalFrame.tsx`, default `false`) that
   adds a small hover lift (`-translate-y-1`, 4px) plus the same
   `shadow-gold-glow` token `GoldButton` already uses, and a slightly
   brighter border. Deliberately opt-in and applied to exactly the two
   places the brief means by "cards" — `EventCard` (the Events explorer
   /wizard grid) and `PackageStep`'s three package cards — not every
   `OrnamentalFrame` use, since most of them (`ReviewSection`, the
   Registration Pass, Contact's cards, Rules' pull-quote-style panels)
   are read-only display panels that shouldn't visually invite a click
   that isn't there.
3. **Buttons get a small press micro-interaction.** `GoldButton` and
   `SecondaryButton` already had hover color/glow feedback but nothing
   for the moment of the click itself. Added `active:scale-[0.97]`
   (a 3% scale-down while held) to both shared button components' base
   class, `transform`-only so it's cheap and compositor-friendly. Left
   every other, lower-emphasis inline text button (Accordion headings,
   Footer/Contact links, EventCard's "View Details"/"Select This Event"
   footer, RegistrationProgress's step circles) with color-only feedback,
   since a scale-press only reads naturally on an actual filled/bordered
   button, not plain text.
4. **Selection-state color swaps now transition instead of snapping.**
   Two spots changed a border/background color instantly on state change
   with no `transition-colors`, inconsistent with the rest of the app:
   `DetailsStep.tsx`'s captain-selection row (border/tint swap when a
   different roster member is chosen as captain) and
   `RegistrationProgress.tsx`'s connecting hairlines between step
   circles (color swap as steps complete). Both now carry
   `transition-colors duration-base`, matching the pattern already used
   everywhere else selection/validation state changes color. (`EventCard`
   and `PackageStep`'s own selected-state gold ring didn't need a
   separate fix — Tailwind's `ring` utility is a `box-shadow`, and the
   new `interactive` class above already transitions `box-shadow`, so
   the ring now fades in smoothly as a side effect.)

No new keyframes, no new dependencies, no new dedicated "motion" file —
every change is a class-level addition to an existing component, using
tokens (`duration-base`, `ease-ornamental`, `shadow-gold-glow`) that
already existed.

## Reviewed and deliberately left unchanged

- **The ambient loops (`twinkle`, `lantern-glow`) stay as they are.**
  Both are opacity/scale-only, both are already gated by the global
  `prefers-reduced-motion` rule, and neither moves an element's position
  (no "floating"). Slowing or removing them would be a stylistic
  preference, not a fix for a brief violation.
- **`ScrollReveal` was not added to every page.** Only Story and Cause
  use it. Every other route's heading (Events, Rules, Contact, the
  registration wizard, the success pass) renders at the very top of a
  short page, already inside the viewport on first paint —
  `ScrollReveal`'s own logic (see its doc comment) skips the
  hide-then-reveal step entirely when the element is already in view on
  mount, so wrapping those headings in it would add a component with no
  visible effect almost all of the time. Reserved for actual scrolled-
  into-view content, which is what Story/Cause are.
- **The Accordion's `grid-template-rows` transition** is the one
  animation in the project that isn't purely `transform`/`opacity` (it
  animates a grid track size, which affects layout/paint, not just
  compositing). This is a deliberate, already-documented tradeoff from
  Phase 19 — there's no cheaper way to animate from a collapsed to an
  `auto`-height panel — and it only runs on an explicit user click, not
  continuously, so the performance cost is negligible in practice.
- **No new entrance animation was added to the Events explorer's card
  grid, the Rules accordion list, or any other listing.** The brief asks
  for hover feedback on cards, not staggered entrance animation for
  grids — adding one would be "animation for animation's sake" the brief
  explicitly warns against.

## Verification

Same trio as every phase:

- Strict `tsc --noEmit` over the pure-logic file list (unchanged at 24
  files — every edit this phase was a `.tsx` component or
  `tailwind.config.ts`, neither of which this list covers) — zero
  errors.
- `esbuild` syntax-check over every `.ts`/`.tsx` file — 75 files,
  unchanged from Phase 21 (no new files this phase) — zero failures.
- A script confirming all `@/...` imports resolve — 163, unchanged from
  Phase 21.

## Still-open limitation (unchanged since Phase 02)

Everything above was reasoned from source (Tailwind classes, keyframe
timings) rather than watched in a real browser — this sandbox still has
no `node_modules`/`next dev`. The hover-lift/press-scale additions are
simple, well-understood CSS (`transform`/`box-shadow`/`border-color`
transitions), but actually *feeling* whether 4px/3%/700ms land right is
something only a real browser pass can confirm. This is the same
standing gap every phase's notes have flagged.

## Suggested next phase

The full brief-listed page set is content-complete, has had one
responsive audit, and now one motion-consistency pass. The two
likely next steps remain: (1) a real-browser verification pass once this
project can run on a machine with npm access — now also the moment to
sanity-check this phase's timings/hover feel by eye — or (2) the
Theme/landing-page-Events-teaser items still noted as "not built yet" in
`README.md`.
