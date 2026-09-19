# Phase 29 — Brand logo integration: notes for future sessions

Persisted for continuity. Five official brand assets — College, AFFINITY
'26 event emblem, Dhruvaas batch, and two digital partners (MKZORA,
Garudan Nexus) — supplied as chat attachments and copied byte-for-byte,
unmodified, into `public/assets/logo/` before any code was written.

## Asset verification (done before writing any code)

Every file was copied straight from the uploaded attachment with `cp`,
then `cmp -s` confirmed byte-identical to the source — no resize, no
recompress, no format conversion:

| File | Bytes | Source |
|---|---|---|
| `college-logo.png` | 499,064 | uploaded attachment `86107f00-image.png` |
| `affinity-event-logo.png` | 631,777 | uploaded attachment `af3f5e83-image.png` |
| `dhruvaas-batch-logo.png` | 1,296,412 | uploaded attachment `94c2c424-image.png` |
| `mkzora-logo.jpg` | 74,809 | uploaded attachment `871b10f8-image.jpg` |
| `garudan-nexus-logo.png` | 1,081,402 | uploaded attachment `79177fac-image.png` |

A second, independent check: three of the five (College, event emblem,
Dhruvaas) are also byte-identical to files already present on the user's
own machine in `S:\KIMS\Affinity 26\` (a pre-existing Canva export folder)
— confirmed via direct byte comparison, not filename matching. This
cross-check exists only to build confidence the right files were used; it
changed nothing about which bytes ended up in the repo.

All five source files were also inspected with Pillow: every one is a
fully opaque `RGB` image (no alpha channel) with a baked-in white/near-
white background. That fact directly shaped the design decision below.

## The "never crop" decision, and its trade-off

Several of the supplied files have a large blank margin baked into the
canvas around the actual mark — a non-destructive bounding-box analysis
(`ImageChops.difference` against a synthetic white background) found the
visible content occupies as little as ~14% of the full canvas area for
the College and MKZORA files, versus ~70% for Garudan Nexus. Cropping
each file down to its own content box would have made every mark render
at a much more consistent size — but the brief's "do not crop" rule is
stated three separate times, in the strongest terms of any rule in the
brief. This phase resolves that tension by never cropping, ever: every
logo renders its full, original file via a plain `<img>` at
`width: auto` against a caller-chosen height (`BrandLogo`,
`components/design-system/BrandLogo.tsx`) — nothing is cut, zoomed, or
repositioned inside its own frame.

The accepted, documented consequence: at any shared container height,
College and MKZORA render their visible mark noticeably smaller/fainter
than a tightly-composed file like Garudan Nexus or Dhruvaas, because more
of their own canvas is blank padding. This is a property of the supplied
source files, not something silently "fixed" here — flagging it
explicitly rather than have a future session wonder why the sizes look
uneven is the point of writing it down.

## The "plaque" container — the one lever available

Every one of the five files carries a white/near-white background baked
into its own pixels, and this site's surfaces are all dark navy — placed
directly, that would read as a stray white rectangle floating on the
page, which the brief explicitly warns against. `BrandLogo`'s default
`variant="plaque"` wraps the (untouched) logo image in a small ivory
card: a thin antique-gold hairline border, modest corner radius, a soft
shadow — read as a small royal seal/medallion, matching the material
language `OrnamentalFrame` already established elsewhere in this project,
not a generic "logo box." This only ever changes the *container*; per the
brief's own list of what's still controllable (placement, size, spacing,
surrounding container, responsive behavior, accessible labelling), never
the artwork. A `variant="bare"` escape hatch exists for contexts that are
already on a light surface (used once, for `RegistrationPass`'s print
styles — see below).

## Files added

- `data/branding.ts` — the centralized `siteBranding` structure the brief
  asked for: `college`, `event`, `batch` (each a `{ name, logo, alt }`),
  and `digitalPartners: DigitalPartner[]`. Every logo path used anywhere
  in the app is read from here — nothing elsewhere holds a literal
  `/assets/logo/...` string.
- `components/design-system/BrandLogo.tsx` — the one component that ever
  renders a brand mark. Added to the design-system barrel export.
- `components/branding/DigitalPartners.tsx` — reusable, data-driven
  (`partners: DigitalPartner[]` prop), matching the brief's instruction
  #10 verbatim. Renders every partner at equal size; only wraps a mark in
  an `<a>` when that partner's `href` is set.
- `components/sections/DigitalPartnersSection.tsx` — the homepage's
  dedicated "Digital Partners" section, mounted in `app/page.tsx`
  immediately after `EventsTeaser` and before `Footer`.

## No official partner URLs — links intentionally disabled

`DigitalPartner.href` is `undefined` for both MKZORA and Garudan Nexus in
`data/branding.ts` — no official website URL for either partner exists in
any supplied source document. Per the brief's own explicit instruction
("Do not invent website URLs... leave links disabled rather than
guessing"), `DigitalPartners` only renders an `<a>` wrapper when `href` is
set, so both partners currently render as plain, unlinked marks
everywhere they appear. This is a `[VERIFY WITH ORGANIZER]`-class gap in
the same spirit as the project's event-data truth-mode handling, even
though `data/branding.ts` doesn't use that literal marker (it's not part
of the event-data schema this project already established for that
marker) — flagged here and in the final report instead.

## Where each mark was placed, and why

- **Hero** (`components/hero/Hero.tsx`) — three marks added inside the
  existing "4. Title reveals" `animate-hero-4` group (no new animation
  stage). Top-to-bottom: a small College + Dhruvaas row (`h-10 sm:h-12`,
  "top institutional" per the brief) → the existing "Presented by…" line
  → the event emblem as a dominant seal (`h-20 sm:h-28 lg:h-32`, "main
  focal," the largest brand mark anywhere on the site) → the `<h1>`
  wordmark. No digital-partner logos in the hero at all — they get their
  own section instead, per "do not clutter the hero."
- **Digital Partners section** (new, homepage) — both partners at
  `h-14 sm:h-16`, deliberately equal. "With Gratitude" eyebrow, "Digital
  Partners" as the literal `<h2>` (the brief's own term — no "Sponsors"
  wording anywhere).
- **Footer** (`components/layout/Footer.tsx`) — a small digital-partners
  row (`h-8 sm:h-9`, the smallest treatment anywhere on the site) added
  to the closing colophon, below the existing divider/crest line — not a
  fourth grid column, since the existing three-column layout (brand /
  Quick Links / Social) is a deliberate structure the brief never asked
  to change.
- **Registration page** (`components/registration/RegistrationLayout.tsx`)
  — an optional compact institutional row (College, event, Dhruvaas)
  above "The Royal Registry" heading. College/Dhruvaas at `h-9 sm:h-10`,
  event at `h-10 sm:h-12` — a smaller gap than the Hero's, but the event
  mark is still deliberately the largest of the three, keeping the
  "event logo is always most prominent" rule true even in this quiet
  compact row. No digital-partner logos here — "do not place all logos
  around the registration form."
- **Success / Registration Pass**
  (`components/success/RegistrationPass.tsx`) — the old decorative
  pencil-line `CrestGlyph()` SVG is gone, replaced by the real event
  emblem at the same small footprint it used to occupy (`h-8 sm:h-9`,
  `variant="plaque"` on screen). A second, print-only instance uses
  `variant="bare"` (`hidden print:inline-flex`) — the pass card itself
  already switches to an ivory background in print
  (`print:bg-ivory` on `OrnamentalFrame`), so the plaque's own ivory card
  would be a redundant box-on-a-box there. Digital partners appear only
  as a single small plain-text line near the bottom ("Digital Partners —
  MKZORA · Garudan Nexus") — no partner logo images on the pass at all,
  since the brief is explicit that partner branding must never dominate
  this specific surface, and a demo pass is exactly the kind of thing a
  participant might screenshot or print.

## Deliberately not changed: the Navbar

The brief's own instruction #9 says not to replace the navbar's existing
logo treatment "unless necessary," to use a compact logo variant "ONLY if
an official compact asset exists," and explicitly "do not create a new
logo variant yourself." No compact/simplified variant of any of the five
logos was supplied — every file is the full, detailed emblem, several
with large internal blank margins (see above). Forcing the full
detailed event emblem into the navbar's small header footprint would
either look wrong at that size or require cropping/simplifying the
artwork — both against the brief's rules. `Navbar.tsx` is unchanged in
this phase; flagged explicitly under "missing/uncertain logo assets" in
the phase's final report rather than worked around.

## Verification

- Strict `tsc --noEmit` over the pure-logic file list — **26 files** (one
  new: `data/branding.ts`) — zero errors.
- `esbuild` syntax-check over every `.ts`/`.tsx` file — **83 files** (four
  new: `data/branding.ts`, `BrandLogo.tsx`, `DigitalPartners.tsx`,
  `DigitalPartnersSection.tsx`) — zero failures.
- A script confirming all `@/...` imports resolve — **180** (eleven new
  import statements across the new files and the four edited ones) — all
  resolve.
- Every logo path referenced in `data/branding.ts` confirmed to exist on
  disk under `public/assets/logo/`, matched one-to-one against the five
  files actually placed there (checked by direct `grep`, not by eye).
- A `<div>`/`</div>` balance check across the four edited page/layout
  components, as a second, independent sanity check alongside `esbuild`'s
  own JSX parse (which is the authoritative check — this was
  belt-and-suspenders, not a substitute for it).

## Addendum — see Phase 33 for the logo refresh and "Powered by" credit

All five logo files this phase placed under `public/assets/logo/`
(including `mkzora-logo.jpg`, referenced in the table above) were
replaced with newer, transparent-background versions in Phase 33, which
also raised most on-site logo sizes and added a new, separate "Website
powered by MKZORA" credit to the global footer. `mkzora-logo.jpg`
specifically no longer exists — it became `mkzora-logo.png`. This file
is kept as-is as the historical record of what Phase 29 actually shipped
with; see `docs/phase-33-logo-refresh-notes.md` for the current state.

## Still-open limitations (unchanged category since Phase 02, specific to this phase)

Reasoned from source and the DOM/CSS APIs' documented behavior, not
exercised in a real browser, since this sandbox still has no
`node_modules`/`next dev`/`next build`. Specifically unverified live:
how the plaque's ivory card actually reads against each page's real
background at real viewport sizes (320–1920px); whether the Hero's three
new marks, on top of its existing six-stage reveal and decorative layer,
feel crowded rather than composed on a real small phone screen; and
whether the print stylesheet's `variant="bare"` swap on
`RegistrationPass` renders cleanly in an actual browser print preview.
