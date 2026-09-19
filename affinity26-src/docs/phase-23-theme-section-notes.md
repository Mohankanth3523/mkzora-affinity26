# Phase 23 — "The Theme — Arabian Nights" section: notes for future sessions

Persisted for continuity. See also `README.md` (project status) and
`docs/phase-07-story-notes.md` / `docs/phase-08-cause-notes.md` (the two
sibling landing-page sections this one was built to match).

## What prompted this phase

The landing page's Theme section had been left as the Phase 02
placeholder since the project started — a bare, unstyled `<section>`
with a plain `<h2>` and `<p>`, no container, no responsive classes, and
none of the design-system components every other section already uses
(`README.md`'s status list even flagged it explicitly: "❌ Not built yet,
on purpose: Theme..."). The user reported exactly that: "not responsive
and not in proper structure." This phase replaces it with a real
component built from the same primitives as Story/Cause.

## What this phase delivered

- **`components/sections/Theme.tsx`** (new): a centered heading ("The
  Theme" eyebrow with a small `Crescent` mark, then "Arabian Nights" as
  the `<h2 id="theme-heading">`, matching Story's/Cause's heading
  treatment exactly), a `GoldDivider`, and — below it — both of the
  source material's verbatim theme descriptions shown side by side as
  two attributed quote panels (`OrnamentalFrame` + `<blockquote>`/
  `<cite>`, one per column on `lg` and up, stacking to one column below
  it). A single low-opacity `PalaceSilhouette` runs along the section's
  bottom edge as the one decorative touch — reusing the same component
  `Hero`/`AtmosphereBackground` already use, not a new asset.
- **`data/content.ts`** gained one new field,
  `aboutThemeBrochureVariant` — the brochure's own theme description
  (`docs/affinity-content-truth.md` §2: "This year, step into a world of
  timeless tales, vibrant colours, and the grandeur of Arabian
  culture..."). The existing `aboutTheme` field only ever held the
  *other* verbatim description (the wordings-document version); the
  brochure's own wording had never been transcribed into the data layer
  at all until now, even though §2 explicitly names both as real,
  non-conflicting source text.
- **`app/page.tsx`** now renders `<Theme />` in place of the inline
  placeholder markup, and the unused `aboutTheme` import was removed
  (that data now lives inside `Theme.tsx`, matching how `Story`/`Cause`
  own their own data imports rather than the page importing on their
  behalf).

## Truth-mode audit

- **Both quotes are real, verbatim source text**, not paraphrased or
  invented. `docs/affinity-content-truth.md` §2 states plainly: "Two
  verbatim descriptions exist across the source docs (both consistent,
  no conflict — the brochure's is the newer/longer version)." This
  phase's only content addition (`aboutThemeBrochureVariant`) is that
  second description, copied exactly, not a summary of it.
- **"Arabian Nights" as the heading is not this component's own
  invention** — it's the literal theme name, stated directly and
  repeatedly by the project brief itself ("The official theme is
  ARABIAN NIGHTS") and confirmed as the theme name in
  `docs/affinity-content-truth.md` §2's own section title. It was
  already the placeholder's heading text; this phase only changed how
  it's presented, not what it says.
- **No new claim, statistic, or achievement was added.** Both quotes are
  shown as attributed quotations (`<cite>`), the same treatment
  `Story.tsx` already established for `aboutAffinityBrochureVariant` —
  so if either source document is ever revised, only the string in
  `data/content.ts` needs to change, never this component.

## Why this design (not a copy of Story or Cause)

Story is an asymmetric editorial layout (large type on the left, one
quote panel on the right) and Cause is a single centered column with one
description plus one small aside. Theme needed to read as visually
distinct from both while still fitting the same system, so it uses a
third, simpler shape: a centered heading over a symmetric two-panel
grid — deliberately chosen because there are genuinely *two* equally-
weighted, non-conflicting sources to show here (unlike Story, where one
quote is clearly the primary description and the brochure line is a
supporting aside), so presenting them as two parallel panels rather than
one-primary-one-aside reflects what the source material actually is.

## Responsive behavior (the specific complaint this phase addresses)

- The two quote panels are `grid-cols-1 lg:grid-cols-2` — a single
  stacked column at 320/375/390/430/768px, side-by-side only at 1024px
  and up. This is the same breakpoint every other two-column section in
  the project already uses, chosen deliberately over `sm`/`md` so two
  full quote paragraphs never get squeezed into a half-width column on a
  phone or small tablet.
- The heading scales `text-4xl sm:text-5xl lg:text-6xl`, identical to
  Cause's own heading scale (already audited safe in Phase 21).
  `SectionContainer`'s standard `px-4 sm:px-6 lg:px-8` gutters apply, so
  there's a real side margin at every width, not edge-to-edge text.
  `SectionContainer` also caps the whole section at `width="content"`
  (75rem) so the two quote panels never stretch into uncomfortably wide
  reading columns at 1440/1920px.
- The `PalaceSilhouette` backdrop is `absolute` inside an
  `overflow-hidden` parent `<section>`, the same containment pattern
  already used (and already audited, Phase 21) for `Cause`'s
  `LightAperture` and `Hero`'s own use of the same component — it cannot
  cause horizontal overflow at any width.
- Neither quote panel uses a non-wrapping flex row for its text (the
  Phase 21 bug class fixed in `EventDetailsModal`/`PricingBreakdown`) —
  both are plain block-level `<blockquote>`/`<p>`/`<cite>` elements,
  which wrap naturally with no risk of the min-width flexbox overflow
  those fixes addressed.

## Verification

Same trio as every phase:

- Strict `tsc --noEmit` over the pure-logic file list — still 24 files
  (`data/content.ts` was already on this list since Phase 02; this
  phase's edit to it is covered by the existing entry, no new entry
  needed) — zero errors.
- `esbuild` syntax-check over every `.ts`/`.tsx` file — **76 files, up
  from 75** (one new file: `components/sections/Theme.tsx`) — zero
  failures.
- A script confirming all `@/...` imports resolve — **165, up from
  163** (`Theme.tsx`'s own imports, plus `app/page.tsx` gaining one new
  import for `Theme` in place of the one it dropped for `aboutTheme`) —
  all resolve.

## Still-open limitation (unchanged since Phase 02)

Verified by strict typecheck, syntax-check, import resolution, and a
manual re-read of the actual Tailwind classes against the project's
already-established (and Phase-21-audited) responsive patterns — not by
opening this in a real browser, since this sandbox still has no
`node_modules`/`next dev`. A real-browser pass remains the one
outstanding verification step every phase's notes have flagged.

## Suggested next phase

The landing page's Events teaser (still the Phase 02 placeholder) is now
the one remaining "not built yet" item in `README.md`.
