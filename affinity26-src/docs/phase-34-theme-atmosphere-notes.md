# Phase 34 — Arabian Nights atmosphere pass: notes for future sessions

Persisted for continuity. A visual-only pass across four landing-page
sections reported as "feels long text only," adding more of this
project's own Arabian Nights motif set to each — no new facts, no new
copy, no photography.

## The request, in the user's own words

> "add images ,Arabian Nights theme elements in whole website ,The
> Story,The Theme Arabian Nights,The Cause · Blindness A Story Worth
> Seeing,Events, feels long text only , add attractive theme elements
> for whole website"

Read as: the sections named by their own on-page labels — Story
("The Story"), Theme ("The Theme" / "Arabian Nights"), Cause
("The Cause · Blindness" / "A Story Worth Seeing"), and the Events
teaser ("Events") — read as mostly paragraphs and quote blocks, and
need more of the site's own decorative visual language.

## Why no photography was added

The request opens with "add images." This project has no source of
Arabian-Nights-themed photography (palaces, deserts, lanterns as real
photos, etc.) — the only real photographs on the site are the four
AFFINITY event photos in the Phase 32 Gallery, which are documentary
photos of a past edition, not generic theme decoration, and reusing
them here would misrepresent them as something they aren't. Scraping
stock photography from the web was also not an option: it would mean
embedding third-party images with no confirmed licence for this project,
and it would work against the brief's own explicit design direction —
which never asks for photography in these sections at all. The brief's
own motif list is vector/illustrative by name: "crescent moon, stars,
lanterns, palace silhouettes, Arabian geometric patterns, subtle
ornamental borders, atmospheric lighting," and "use negative space,
typography, composition and atmosphere to create the premium look."
This phase is that list, applied more fully — not a substitute for real
imagery, but what the brief itself actually asks for. (If real Arabian
Nights artwork or photography exists and should be used, the Gallery
pattern from Phase 32 — supply the files directly in a request — is how
to add it.)

## What already existed vs. what was missing

Before this phase, the design system already had five reusable motif
components: `StarField`, `PalaceSilhouette`, `Crescent`, `Lantern`, and
`OrnamentalFrame`'s corner brackets. But their actual use across the
four flagged sections was uneven:

| Section | StarField | PalaceSilhouette | Crescent | Lantern | Geometric pattern |
| --- | --- | --- | --- | --- | --- |
| Story | ✅ (Phase 07) | — | — | — | — |
| Theme | — | ✅ (Phase 07) | ✅ (Phase 07) | — | — |
| Cause | — | — | — | — | — |
| EventsTeaser | — | — | — | — | — |

"Arabian geometric patterns" — named explicitly in the brief's own
palette/motif list — had never been built as a component at all; every
other named motif existed somewhere, but not this one. That gap is why
this phase's first step was a new component rather than just rearranging
existing ones.

## New component: `GeometricBand`

`components/design-system/GeometricBand.tsx` — a thin, tiled band of the
classic two-overlapping-squares eight-point star (rub el hizb), drawn as
flat `currentColor` line art via a native SVG `<pattern>` (crisp at any
size, no raster asset). Deliberately a thin divider-height strip, not a
full-bleed background texture behind paragraph text — the same
"texture, not spectacle" restraint `GoldDivider`/`StarField`/
`PalaceSilhouette` already follow, and static (no animation), matching
`GoldDivider`'s own documented reasoning that a decorative separator
which visibly moves reads as "gaming website." Color and opacity are
entirely up to the caller via a text-color className (`text-antique-
gold/20`, etc.), the same convention every other motif component here
uses. Exported from `components/design-system/index.ts` alongside the
rest.

## Section-by-section changes

**Story** (`components/sections/Story.tsx`): a `GeometricBand` now opens
the section (before the two-column grid), and a small `Lantern`
(`glow={false}`, so it doesn't fight the already-present parchment
texture and starfield for attention) sits beside the "The Story"
eyebrow. Nothing else changed — Story already had a starfield and a
parchment-texture panel, so it needed the least.

**Theme** (`components/sections/Theme.tsx`) — the richest treatment,
deliberately, since this is the one section literally named after the
theme itself:
- A static `StarField` was added (this section had none before).
- A `GeometricBand` now opens and closes the section.
- Two `Lantern`s (default glow on) flank the "Arabian Nights" heading —
  hidden below `sm` (`hidden sm:inline-block`) so the heading doesn't
  get crowded on narrow phones, matching the project's existing "design
  the mobile composition deliberately, don't just shrink desktop"
  standard.
- Each of the two quote panels gets its own small `GeometricBand` above
  its text, so the two "flat blockquote cards" the user's report was
  most likely describing now open with a motif instead of jumping
  straight into a paragraph.

**Cause** (`components/sections/Cause.tsx`) — intentionally the
lightest touch of the four. This section's restraint is a documented,
deliberate choice from Phase 08 ("respectful... not exploitative or
overly dramatic" for a blindness-awareness cause), so it wasn't given
Theme's lantern pair. It gets a small `Crescent` beside the eyebrow
(the same quiet placement `Theme`/`Footer`/the nav wordmark already use
for it) and one `GeometricBand`, placed at the very end of the content
— after the connected-event blockquote, not before the heading — so it
never competes with the existing `LightAperture` motif for the first
thing a reader's eye meets.

**EventsTeaser** (`components/sections/EventsTeaser.tsx`) — the
starkest gap: before this phase, it was the only landing section with
*zero* atmosphere elements of any kind. Added a static `StarField`, a
`PalaceSilhouette` along the bottom edge (same treatment `Theme` uses,
so the page's atmosphere doesn't visibly switch on and off between
sections), a `GeometricBand` opening the section, and a small `Lantern`
beside the "Events" eyebrow. Separately, the three stat cards
(Sports/Culturals/Online) previously showed only a number and a label —
now each gets a small flat-line glyph (`SportsGlyph`: crossed blades,
`CulturalsGlyph`: a performance mask, `OnlineGlyph`: a plain screen),
defined locally in the file the same way `Gallery.tsx` keeps its own
small `ArrowGlyph`/`CloseGlyph` local rather than promoting them to the
shared design system until a second consumer needs them. These glyphs
are original line art, not stand-ins for any official iconography — no
source document defines event-category icons, so nothing here claims to
be official.

## Verification

- Strict `tsc --noEmit` over the pure-logic file list — **29 files**
  (unchanged; none of this phase's edited files are on that list — they
  all use JSX) — zero errors.
- `esbuild` syntax-check over every `.ts`/`.tsx` file — **90 files** (one
  new: `components/design-system/GeometricBand.tsx`) — zero failures.
- A script confirming all `@/...` imports resolve — **183** (unchanged —
  every edited file already had an `import { ... } from
  "@/components/design-system"` line; this phase only added more named
  imports to those existing lines, and `GeometricBand.tsx` itself only
  imports from `react`, not `@/...`) — all resolve.
- Read each edited section file in full after editing to confirm JSX
  tag balance and prop correctness by eye, on top of `esbuild`'s own
  (authoritative) JSX parse.
- `npm run lint` / `npm run build` still cannot run in this sandbox — no
  `node_modules`, no npm registry access. Unchanged limitation from every
  previous phase.

## Still-open limitations

- Not verified in a real browser — this sandbox still has no `next dev`/
  `next build`. Specifically unverified live: whether Theme's two
  flanking lanterns and the "Arabian Nights" heading wrap sensibly at
  in-between widths (the `hidden sm:inline-block` breakpoint was chosen
  by reasoning about the heading's own font-size classes, not measured
  against a rendered layout), and whether the new `GeometricBand` tiles
  read as a deliberate pattern rather than a moiré at very small physical
  sizes on a real high-density phone screen.
- This phase covered the four sections the report named plus the new
  `GeometricBand` component itself — it did not sweep every other
  section on the site (Hero, the Events Explorer page, Rules, Contact,
  the registration wizard, etc.) for the same "add more atmosphere"
  treatment. Per the project's own "work incrementally, don't implement
  everything at once" instruction, those are logical next candidates if
  more of the site should get the same pass, but weren't assumed to be
  in scope here since the request named specific sections.
