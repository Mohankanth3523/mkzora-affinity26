# Phase 24 — Cause section structure/responsive fix: notes for future sessions

Persisted for continuity. See also `docs/phase-08-cause-notes.md` (the
section's original build) and `docs/phase-23-theme-section-notes.md`
(the previous fix, for the sibling Theme section, prompted by the same
kind of report).

## What prompted this phase

The user reported that "The Cause · Blindness / A Story Worth Seeing"
was also "not responsive and not in proper structure" — the same
wording used for the Theme section just before this. Unlike Theme,
Cause was not a leftover Phase 02 placeholder; it was a real,
custom-built Phase 08 section. So this wasn't "unstyled markup," it was
a genuine structural gap: **Cause was the only landing-page section
built with no `OrnamentalFrame` (or any bordered panel) around its
content at all** — just centered text floating directly on the page's
atmosphere background. Story and Theme both wrap their content in
bordered, corner-bracketed frame panels; Cause didn't, which is very
likely what read as "not in proper structure" once Theme was upgraded
to have that same treatment.

A second, more concrete issue was also found on re-inspection: the
closing pull-quote (`<blockquote>`) had no explicit width — as a child
of a `flex flex-col items-center` column, it shrank to fit its own text
content rather than taking a consistent width. That meant its left
border/left-aligned text sat at a different horizontal position
relative to the wider description paragraph above it depending on how
the quote's own text happened to wrap at a given viewport width — an
inconsistent, viewport-dependent misalignment rather than a fixed,
deliberate layout, which reads exactly like "not responsive" even
though nothing was actually overflowing or breaking.

## What changed

`components/sections/Cause.tsx`:

1. **The whole content column is now wrapped in an `OrnamentalFrame`**
   (`padding="lg"`, the same border + four corner brackets Story's and
   Theme's panels use), instead of being bare text sitting directly on
   the section's background. This is the same structural device every
   other landing-page section already uses — Cause was the one
   remaining exception.
2. **The blockquote gained `w-full`** (alongside its existing
   `max-w-xl`), so it now consistently spans up to that max width at
   every viewport size instead of shrinking to whatever width its own
   text happens to wrap to. Its left border now lines up at the same
   horizontal position as the description paragraph above it,
   consistently, at every width — a small size gap (`mt-2 sm:mt-4`) was
   also added to match the responsive spacing rhythm used elsewhere in
   the section (the divider/description above it already step up their
   own spacing at `sm`).

No content, copy, or facts changed — same eyebrow, same heading, same
`aboutCause.description`, same connected-event aside, same restrained
"no per-scroll animation" `LightAperture` backdrop behind it all. This
was a structural/layout fix, not a content or design-language change.

## Why the aperture backdrop still works with a frame in front of it

`LightAperture` (the soft gold beam + concentric rings) sits behind the
frame (`z-0` vs. the content's `z-10`) and is absolutely positioned at
the section's very top, independent of the frame. Since
`OrnamentalFrame`'s background is a translucent `bg-royal-navy/60`, not
fully opaque, the upper portion of the aperture's glow still shows
through faintly behind the frame's top edge — closer, if anything, to
the "light falling from above" effect the section was always going for,
rather than being hidden by the new frame.

## Responsive check (the specific complaint)

- `OrnamentalFrame`'s own padding (`p-8 sm:p-12`) stacks with
  `SectionContainer`'s existing `px-4 sm:px-6 lg:px-8` gutters — at
  320px that's 16px (container) + 32px (frame) = 48px per side, leaving
  224px of actual content width. Every text element inside (`p`, `h2`,
  `blockquote`) is a plain block element with a `max-w-*` cap, none of
  them a non-wrapping flex row, so nothing has any overflow risk at that
  width — text simply wraps.
- The frame's four corner-bracket SVGs are fixed-size (`h-6 w-6 sm:h-8
  sm:w-8`) and absolutely positioned relative to the frame itself, so
  they scale the same way they already do on every other
  `OrnamentalFrame` in the project (Story's panel, Theme's two quote
  panels, every registration-wizard card) — nothing new to verify there.
- The blockquote's new `w-full max-w-xl` means it's exactly as wide as
  the frame allows (up to 36rem) at every breakpoint, rather than a
  width that depended on line-wrapping — this is the actual fix for the
  "not responsive" complaint, since the old version could visibly shift
  its own alignment as the viewport (and therefore the text's wrap
  points) changed.

## Verification

- Strict `tsc --noEmit` over the pure-logic file list — unaffected
  (`Cause.tsx` isn't a pure-logic file on that list) — zero errors.
- `esbuild` syntax-check over every `.ts`/`.tsx` file — 76 files,
  unchanged from Phase 23 (an edit to an existing file, no new file) —
  zero failures.
- A script confirming all `@/...` imports resolve — 165, unchanged from
  Phase 23 (`OrnamentalFrame` was already imported elsewhere in the
  barrel export Cause already used).

## Still-open limitation (unchanged since Phase 02)

Reasoned from source, not watched in a real browser — same standing gap
every phase's notes have flagged. If this still doesn't look right once
viewed live, the next useful detail to report is exactly *what* looks
off (overlapping text, a gap that's too big/small, a specific width) —
that's a much faster fix than "not responsive" alone, which this phase
had to work backward from static reasoning about the CSS.
