# Phase 32 — Gallery section: notes for future sessions

Persisted for continuity. Adds a new landing-page section showing four
photographs supplied directly in this session's request, with a
responsive mosaic grid and an accessible lightbox.

## Source of the photographs

Four JPGs, attached directly to the chat request (not from any of the
official brochure/document sources `docs/affinity-content-truth.md`
governs, and not requiring TRUTH MODE fact-checking the way an event
name or fee would — these are just photographs). Optimized with `sharp`
(re-encoded as progressive, `mozjpeg`-quality-82 JPEGs, capped at
1600px/1200px on their long edge — none needed to actually shrink, since
none exceeded that) and placed at `public/assets/gallery/` under
descriptive names:

- `affinity-college-gathering.jpg` (1280×960, landscape) — a large group
  photo of students in white coats/maroon scrubs across a stairwell.
- `affinity-stage-performance.jpg` (720×1280, portrait) — a performer
  singing into a handheld mic.
- `affinity-honour-moment.jpg` (720×1280, portrait) — two performers
  embracing on stage, one being presented with a silk shawl.
- `affinity-dance-performance.jpg` (1280×720, landscape) — a dancer
  mid-movement on stage.

**Alt text is deliberately plain and descriptive, never a claim about
which AFFINITY edition or date a photo is from** — nothing in the
uploaded files states that, and asserting an edition number would be
exactly the kind of unsupported factual claim the project's
source-of-truth rule exists to prevent. Two of the photographs' own
stage backdrops are visibly branded "AFFINITY 25" — that's a detail
visible *in* the photo, not something this project's copy is asserting
on the site's behalf, so it isn't repeated as running text anywhere.

## `data/gallery.ts`

A `GalleryImage[]` — `{id, src, alt, orientation}` — the same
"centralize the asset list, no path/copy hard-coded in a component"
pattern `data/branding.ts` (Phase 29) already established for logo
assets. `orientation` ("landscape" | "portrait") is a plain fact about
each source photo's own dimensions — see the "Addendum" below for why
the layout no longer reads it.

## `Gallery.tsx` — the masonry + lightbox

Split into two pieces the same way the public Events page already
splits `EventsExplorer` (client, interactive) from its Server Component
page: `GallerySection` (`components/sections/GallerySection.tsx`, Server
Component, owns the heading/`SectionContainer`) and `Gallery`
(`components/gallery/Gallery.tsx`, Client Component, owns the grid +
lightbox state).

**Masonry, not a uniform grid of rounded cards** — the project brief
explicitly warns against "repetitive rounded cards," and four
same-size thumbnails in a row would have been exactly that. A CSS
multi-column masonry (`columns-1 sm:columns-2 lg:columns-4`) instead:
each thumbnail renders at `w-full h-auto`, so it keeps its own true
aspect ratio and a taller photo simply takes a taller cell in its
column — no cropping needed to make four differently-shaped photos
read as one deliberate layout. See the Addendum immediately below for
why this replaced an earlier fixed-aspect-ratio/`object-cover` version.

## Addendum — the original mosaic cropped people out of frame

The first version of this layout forced every thumbnail into a fixed
`aspect-[4/3]` (landscape) or `aspect-[3/4]` (portrait) box and used
`object-cover` to fill it, arranged as a 4-column/2-row dense CSS grid
on `lg`. That's a legitimate photo-grid technique in general, but on
*these* four source photos — two of which are people shot in a tall
9:16 phone-camera frame — cropping down to `3:4` cut real people out of
the visible frame, which the user reported directly ("images ...not
fully viewable of persons in the images"). Letterboxing instead of
cropping was considered and rejected: it would have fixed the
visibility problem but left visible empty bars, which isn't the
"attractive design" the original request also asked for. The masonry
layout above (this phase's second pass) is the fix that gets both:
every person in every photo stays fully visible, because there's no
crop at all, and the layout still reads as a designed mosaic rather
than a plain single-column stack, because of the varying tile heights
a masonry naturally produces from four differently-shaped photos.
`orientation` on `GalleryImage` is no longer read by the layout as a
result — kept as honest descriptive metadata rather than removed,
since it's still a true fact about each source photo.

**Lightbox reuses this project's existing modal idiom** —
`EventDetailsModal` (Phase 10): Escape closes, a focus trap keeps Tab
inside the panel, background scroll locks while open, and focus returns
to the thumbnail that opened it, on close. Two things `EventDetailsModal`
didn't need, added for a gallery specifically: `ArrowLeft`/`ArrowRight`
step to the previous/next photo (wrapping at the ends), and the caption
line under the enlarged photo is that photo's own `alt` text, so a
screen-reader user and a sighted user get the identical description
rather than two different ones.

**Reduced motion**: the thumbnail hover zoom (`scale-105`) is explicitly
disabled under `motion-reduce`, on top of the project-wide
near-zero-transition-duration rule already in `app/globals.css` — the
same belt-and-suspenders reasoning `OrnamentalFrame`'s own doc comment
gives for its hover-lift.

**`<img>`, not `next/image`** — matches the existing precedent
`BrandLogo.tsx` documents (Phase 29): this project has never configured
`next/image`'s optimizer, so a plain tag is what every other image in
the codebase already uses.

## Addendum 2 — the lightbox could grow taller than the screen

A second, separate report on the same feature: "if click and view means, not responsive for all images," describing the enlarged photo popup (the lightbox), not the thumbnail grid the first addendum already fixed. Root cause here was different but rhymed with the first bug: the `<img>` inside the lightbox was capped at `max-h-[70vh]` — a fixed fraction of the *raw viewport height* — with no regard for how much of that viewport the header bar and the caption line underneath it were already using. On a short viewport (a phone in landscape, a browser window with little vertical room, or simply a photo whose caption wrapped to two or three lines) the header + image + caption could add up to more than the screen, and because the overlay is a fixed, non-scrolling panel, whatever didn't fit was silently pushed off-screen — sometimes the close button, sometimes the caption, depending on the photo and the viewport.

Fixed by making the panel and its children cooperate through flexbox instead of each guessing a viewport fraction independently: the panel itself is capped at `max-h-[calc(100vh-2rem)]` (`sm:max-h-[calc(100vh-4rem)]`, matching its own outer padding) so it can never exceed the visible screen; the header and caption are pinned to their natural size (`shrink-0`) so they're never the ones that give way; and the image area is the single flex child allowed to shrink (`flex-1 min-h-0`), with the `<img>` itself set to `h-full w-full object-contain` so it always fills exactly the space actually left over, scaling down further on a cramped screen rather than overflowing it. `object-contain` continues to guarantee no cropping in either orientation — this fix is about the *box* the photo sizes into, not how the photo fills that box.

## Placement

`GallerySection` sits between `EventsTeaser` and `DigitalPartnersSection`
on the landing page (`app/page.tsx`) — a "look at the energy" moment
right after the events pitch, ahead of the closing partners/footer
sequence. This wasn't specified in the request, so it's recorded here as
a placement decision, not an assumed fact: easy to move if a different
spot (its own `/gallery` page, the Events page, etc.) is wanted instead.

## Verification

- Strict `tsc --noEmit` over the pure-logic file list — **29 files**
  (added `data/gallery.ts`) — zero errors.
- `esbuild` syntax-check over every `.ts`/`.tsx` file — **89 files**
  (added `data/gallery.ts`, `components/gallery/Gallery.tsx`,
  `components/sections/GallerySection.tsx`) — zero failures.
- A script confirming all `@/...` imports resolve — **183** (up from
  178) — all resolve.
- `npm run lint` / `npm run build` still cannot run in this sandbox — no
  `node_modules`, no npm registry access. Unchanged limitation from every
  previous phase.

## Still-open limitations

- CSS multi-column masonry (used here) orders items column-by-column
  rather than strictly left-to-right — with four photos across two
  columns (`sm`) or four columns (`lg`), the reading order can visually
  jump around more than a plain row-major grid would. Not considered a
  problem for four photos at this scale, but worth knowing if the photo
  count grows a lot.
- Not verified in a real browser — this sandbox still has no `next dev`/
  `next build`. Specifically unverified live: the lightbox's focus trap
  and Escape/Arrow-key behavior, and real mobile tap-target sizing on the
  masonry's thumbnails and the lightbox's now flex-based sizing.
