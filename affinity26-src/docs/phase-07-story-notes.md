# Phase 07 — Enter the Story: notes for future sessions

Persisted for continuity. See also `README.md` (project status) and
`docs/phase-06-hero-notes.md`.

## What this phase delivered

`components/sections/Story.tsx` — a new Server Component, used by
`app/page.tsx` in place of the old Phase 02 placeholder `<section
aria-labelledby="story-heading">`. Nothing else on the landing page
changed: Theme/Cause/Events-teaser are still Phase 02 plain markup, per
the phase's "build the story/introduction section" (not "rebuild the
landing page"). One new reusable component was added to support it:

- `components/design-system/ScrollReveal.tsx` — a small client component
  (the barrel's only one) that fades a wrapped block up into place the
  first time it's scrolled into view. Exported from
  `components/design-system/index.ts` alongside everything else.

## Truth-mode audit of every string in this section

Everything comes from `data/content.ts`, used unmodified:

- `aboutAffinity` — rendered as plain prose, verbatim. This is the
  sober, first-person organizer description: three days of sports and
  cultural events, competitive spirit, no numbers, no superlatives.
- `aboutAffinityBrochureVariant` — rendered **verbatim, in full**, as an
  attributed blockquote (`— From the official AFFINITY '26 brochure`),
  not paraphrased or trimmed. This is the one place in the section a
  headcount ("thousands of medical students from across India") and a
  superlative ("bigger, bolder, and more magical than ever before")
  appear — and they appear as the *brochure's own quoted words*, not as
  a claim this component is making. That's the deliberate resolution to
  the phase's "do not invent participant numbers... do not invent
  achievements" instruction: rather than silently drop the brochure's
  more vivid self-description, or launder it into unattributed prose,
  it's quoted and sourced so every reader can see exactly whose claim it
  is.
- `festivalIdentity.taglines` (both entries, exact source punctuation:
  "Beyond the Sands, A Kingdom Awaits." and "A Legacy Forged in
  Struggle" — note the second has no trailing period in the source data,
  left as-is) — rendered as a small stacked pair, not edited to match.
- `festivalIdentity.edition` / `festivalIdentity.institution` — the
  left-column meta line, same source strings Hero already uses.
- No history, no participant counts, no achievements were added outside
  of what's quoted above. Nothing in this section is invented "design
  copy" standing in for a fact — the only non-sourced text is the
  eyebrow label "The Story" and the heading "Enter the Story" itself,
  which are structural/navigational labels, not claims.

## Decisions worth knowing about

- **Editorial grid, not a card.** `grid-cols-1 lg:grid-cols-[1fr_1.1fr]`
  — large display typography (`text-5xl` → `text-7xl`) on the left,
  a bordered "story panel" (`OrnamentalFrame`) on the right, per the
  phase's explicit "large typography on one side, story panel on the
  other" and "editorial composition instead of a generic card grid."
  Deliberately hand-built rather than reusing `SectionHeading` (which
  every other section uses) — reusing it here would have made Story
  look like every other section, undercutting the "not generic" ask.
- **Parchment texture, not literal parchment.** A local `ParchmentTexture`
  helper (same pattern as `AtmosphereBackground`'s `GeometricLattice`):
  an inline SVG `feTurbulence` filter, tinted desert-sand (`#D9C19A`) via
  `feColorMatrix`, at 7% opacity. Explicitly *not* a cream/beige page —
  that would clash with the established dark palette and read as the
  generic "warm cream + serif" AI-design default the project brief
  itself warns against. The effect is closer to "a page catching lantern
  light" than "a photo of old paper."
- **Explicit z-index around the texture, not incidental.** The texture
  layer is `absolute` with no z-index in `OrnamentalFrame`'s existing gold
  corner-bracket markup (also `absolute`, also no explicit z-index) —
  two auto-stacked positioned layers is exactly the kind of ambiguous
  paint-order situation this project has caught real bugs in before
  (see `Navbar`'s mobile-overlay close button, Phase 05). Fixed by
  giving the texture an explicit `z-0` and the text content `z-10`, so
  "text always paints above the texture" is guaranteed by the numbers,
  not by DOM-order incidence. (The texture painting *below* the gold
  corner brackets was left unresolved as genuinely inconsequential — at
  7% opacity, a faint tint over a hairline gold bracket isn't a
  readability or a visibility problem.)
- **Subtle stars via an existing, documented use-case.** `StarField`'s
  own doc comment already names `animated={false}` for exactly this
  situation — "behind body text where motion would be distracting" —
  so Story uses it directly rather than inventing a new sparser variant.
- **`ScrollReveal` defaults to visible, not hidden.** The failure mode
  this avoids: a client-only reveal effect that starts at `opacity: 0`
  and depends on `IntersectionObserver`/hydration to ever show the
  content is a real accessibility and robustness risk (JS errors
  upstream, disabled JS, a slow hydration race) — the words on the page
  must never depend on a client effect firing correctly. So both the
  server-rendered and first client-rendered pass show the content
  immediately; only *after* mount does it check `prefers-reduced-motion`
  and whether the element is currently off-screen, and only then does it
  hide-then-reveal. Reduced-motion users, and anyone whose content loads
  already in view, never see any movement.
- **New color-opacity pairings were contrast-checked, not assumed** —
  `text-desert-sand/80` (left-column meta line) and `text-warm-gold/80`
  (blockquote attribution, this section's smallest text at 12px) both
  compute at 6.96–7.86:1 against midnight/royalNavy, comfortably past
  the 4.5:1 AA floor. Recorded in `docs/design-system-accessibility.md`
  (§ item 9).
- **`id="story-heading"` was preserved** on the `<h2>` itself (not moved
  to the `<section>` or a wrapper) — `Navbar`'s existing `Story` link
  points at `/#story-heading`, and nothing about that anchor changed.

## Still-open limitation (unchanged since Phase 02)

Same npm-registry-unreachable constraint as every prior phase. Verified
this phase with the same method as always: strict `tsc --noEmit` (zero
errors on all pure-logic/token files — none of which changed this
phase), esbuild syntax-check (zero errors, all 49 `.ts`/`.tsx` files in
the project, up from 47 in Phase 06), and a script confirming all 76
`@/...` imports resolve (up from 73). **The two-column layout, the
parchment texture, and the scroll-reveal timing have not been seen in a
real browser** — the reasoning behind them (stacking order, contrast
ratios, the reduced-motion/off-screen branching in `ScrollReveal`) is
sound, but whether the editorial composition actually reads as
"editorial" rather than just "two boxes side by side," and whether the
reveal timing feels right, are judgment calls that need `npm run dev` on
a machine with real internet access to make.

## Suggested next phase

Theme and the Blindness-awareness Cause section are the two remaining
Phase 02 placeholders directly below Story on the landing page, and the
brief lists the cause section as its own explicit primary-goal item
(item 4). Cause in particular has real, verified source content already
in `data/content.ts` (`aboutCause`) ready to be given the same
truth-mode treatment as this phase.
