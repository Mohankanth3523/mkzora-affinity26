# Phase 33 — Logo refresh + sitewide "Powered by MKZORA" credit: notes for future sessions

Persisted for continuity. Two related changes from one request: replace
all five brand-mark image files with newer versions supplied directly in
this session, make every brand mark on the site bigger and more visible,
and add a new, separate "Website powered by MKZORA" credit that appears
on every page.

## The request, in the user's own words

> "use this logo for all , make it big clearly visible and make
> attractive. use mkzora where possible website powered by mkzora, make
> it brand in the whole website"

Five images were attached — the same five brand marks Phase 29 already
integrated (MKZORA, Garudan Nexus, the AFFINITY 11th-edition event
emblem, the Dhruvaas batch crest, and the Karpaga Vinayaga college logo),
matched to their identity by shape/aspect ratio (confirmed, not guessed —
see "Matching the uploads" below) rather than assumed from message order
alone.

## Reading the request

Two distinct asks, both acted on:

1. **"Use this logo for all... make it big clearly visible and
   attractive"** — replace the five existing files under
   `public/assets/logo/` with these newer versions, and increase how
   large/prominent every brand mark renders across the site (Hero,
   `/register`'s compact identity row, the homepage Digital Partners
   section, and the footer's digital-partners row).
2. **"Use mkzora where possible, website powered by mkzora, make it
   brand in the whole website"** — MKZORA specifically (not Garudan
   Nexus) gets an additional, separate "powered by" credit that appears
   sitewide, distinct from its existing equal-footing "Digital Partner"
   listing alongside Garudan Nexus.

Nothing here touches AFFINITY '26 event facts (names, fees, prizes,
eligibility, dates, contacts) — this phase is entirely about brand-asset
files and their presentation, which TRUTH MODE's fact-invention rule
doesn't govern. Crediting MKZORA as the site's builder is the project's
own instruction from its acting developer relationship, the same way
Phase 29's original "Digital Partner" designation for MKZORA/Garudan
Nexus was.

## Matching the uploads to their identity

The five uploaded PNGs were identified by aspect ratio against the
already-known shape of each existing mark (all five already had
Phase 29 entries in `data/branding.ts`, so nothing here is a new,
unverified brand):

| Upload | Size | Aspect | Matched to |
| --- | --- | --- | --- |
| `c48fd71d-image.png` | 1774×887 | ~2:1, wide | MKZORA (wide wordmark lockup) |
| `27d63277-image.png` | 1254×1254 | 1:1 | Garudan Nexus (square crest) |
| `b2d44374-image.png` | 1246×1262 | ~1:1 | AFFINITY 11th-edition event emblem |
| `73e7067f-image.png` | 1254×1254 | 1:1 | Dhruvaas batch crest |
| `b811c7bd-image.png` | 2172×724 | ~3:1, wide | Karpaga Vinayaga college logo (wide banner) |

All five are genuine RGBA PNGs with real alpha transparency — verified
by sampling each file's four corners and center pixel programmatically,
not assumed. This is a change from Phase 29's originals, which that
phase's own notes documented as having a baked-in near-white background
(which is why `BrandLogo`'s default "plaque" ivory-card framing exists —
see that component's updated doc comment). The plaque framing is kept
regardless: it's this site's own deliberate "royal seal" presentation of
a brand mark, not only a fix for the old white-background problem.

## Image processing

Re-encoded with `sharp` (same tool Phase 32 used for the gallery
photographs): PNG output, palette-based compression (`palette: true`,
`compressionLevel: 9`), and resized only where a source exceeded 1400px
on its long edge (`fit: "inside", withoutEnlargement: true`, so nothing
was ever upscaled). Alpha transparency was preserved through the whole
pipeline — verified on the output files, not assumed. Two files
(`college-logo.png`, `mkzora-logo.png`) were downsized from their
originals; the other three were already under the cap and passed through
at their native resolution.

`mkzora-logo.jpg` (Phase 29's original file) was deleted and replaced
with `mkzora-logo.png` — the new upload has real transparency, which
`.jpg` cannot represent, so keeping the old extension would have forced
either a lossy format for a transparent image or a re-introduced opaque
background the source file doesn't have. `data/branding.ts` was updated
to the new path; a search confirmed no other file still referenced the
old `.jpg` path after the change.

| File | Before | After |
| --- | --- | --- |
| `affinity-event-logo.png` | 631,777 B | 408,001 B |
| `college-logo.png` | 499,064 B | 143,260 B |
| `dhruvaas-batch-logo.png` | 1,296,412 B | 675,243 B |
| `garudan-nexus-logo.png` | 1,081,402 B | 237,133 B |
| `mkzora-logo.jpg` → `mkzora-logo.png` | 74,809 B | 17,901 B |

## `data/branding.ts` — the `poweredBy` field

MKZORA's identity (`name`/`logo`/`alt`) is now defined once, in a
module-scope `mkzoraMark` object, and reused by both `digitalPartners`
(where it sits beside Garudan Nexus, equally sized, exactly as Phase 29
set up) and a new `poweredBy` field with its own alt text
("MKZORA — this website is designed and powered by MKZORA"). This keeps
MKZORA's name/logo/alt from ever drifting apart between the two places
it's now credited, rather than hand-copying the same three strings
twice. `poweredBy` is deliberately *not* folded into the
`digitalPartners` array — it's a different kind of credit (one specific
partner, in a "built by" role) from "equal treatment among digital
partners," which is still a true rule for the two-item array itself.

## Where sizes grew, and where they deliberately didn't

Every logo instance the "make it big, clearly visible" request plausibly
covers grew by roughly one Tailwind height step, while the existing
"AFFINITY event emblem is always the most prominent mark" hierarchy rule
(Phase 29) was kept intact — event mark height was raised in the same
step as (or a larger step than) whatever sits next to it, everywhere:

| Location | Mark | Before | After |
| --- | --- | --- | --- |
| `Hero` | College / Dhruvaas | `h-10 sm:h-12` | `h-12 sm:h-14` |
| `Hero` | Event emblem | `h-20 sm:h-28 lg:h-32` | `h-24 sm:h-32 lg:h-40` |
| `RegistrationLayout` | College / Dhruvaas | `h-9 sm:h-10` | `h-11 sm:h-12` |
| `RegistrationLayout` | Event emblem | `h-10 sm:h-12` | `h-12 sm:h-14` |
| `DigitalPartners` (homepage section) | MKZORA / Garudan Nexus | `h-14 sm:h-16` | `h-20 sm:h-24 lg:h-28` |
| `Footer` | MKZORA / Garudan Nexus | `h-8 sm:h-9` | `h-11 sm:h-12` |
| `Footer` (new) | "Powered By" MKZORA | — | `h-9 sm:h-10` |

**`RegistrationPass` was deliberately left unchanged** — both its event
emblem's size and its plain-text (no logo image) digital-partners line.
That page's own Phase 29 doc comment explains why: it's a printable,
screenshot-able registration pass, exactly the surface where a bigger or
logo'd partner credit is most likely to read as the partner "dominating"
a participant's own document, which the original brief explicitly
warned against. Growing everything else while leaving this one page's
restraint in place is a deliberate, recorded choice, not an oversight.

The primary `Navbar` was also left untouched at the time — it had never
rendered any image logos (it was a text wordmark + nav links only), and
the request didn't ask for one to be added there. A third-party
"powered by" mark in primary navigation would also read as competing
with the site's own identity in the one spot every page's first
impression comes from — the footer (see below) was, at the time, the
only place this kind of credit appeared.

**Superseded in Phase 37**: an explicit follow-up request asked for this
exact logo to be placed in the navbar, reversing this one call. `Navbar`
now carries its own small "Powered by MKZORA" credit (desktop `xl:`+ and
the mobile overlay), reusing this same `siteBranding.poweredBy` entry —
see docs/phase-37-navbar-mkzora-credit-notes.md. This footer credit is
unchanged.

## The sitewide "Powered by MKZORA" credit

Added as a new, separate block in `Footer`'s closing colophon, below the
existing Digital Partners row, with its own "Website Powered By" label
and MKZORA's mark at `h-9 sm:h-10`. `Footer` mounts once, in
`app/layout.tsx`'s root layout, and renders on every route — the landing
page, `/events`, `/rules`, `/contact`, `/register`, and the success page
all share the exact same `Footer` instance. That's what makes this one
addition satisfy "brand in the whole website" without needing to touch
every individual page.

## Verification

- Strict `tsc --noEmit` over the pure-logic file list — **29 files**
  (unchanged; `data/branding.ts` was already listed) — zero errors.
- `esbuild` syntax-check over every `.ts`/`.tsx` file — **89 files**
  (unchanged — no files added or removed, only edited) — zero failures.
- A script confirming all `@/...` imports resolve — **183** (unchanged)
  — all resolve.
- Grepped the full source tree for `mkzora-logo.jpg` after deleting that
  file — the only remaining match is the historical record in
  `docs/phase-29-brand-logo-integration-notes.md`, which is correct (it
  describes what was true in Phase 29, not the current state).
- `npm run lint` / `npm run build` still cannot run in this sandbox — no
  `node_modules`, no npm registry access. Unchanged limitation from every
  previous phase.

## Still-open limitations

- Not verified in a real browser — this sandbox still has no `next dev`/
  `next build`. Specifically unverified live: that the enlarged marks
  still wrap onto a sensible number of lines at the narrowest supported
  widths (320–375px) in the Hero's and Footer's flex-wrap rows, and that
  the new transparent PNGs render their alpha channel correctly across
  browsers (expected to be fine — `<img>` + standard PNG alpha has no
  known compatibility gap — but not something this sandbox can screenshot
  to confirm).
- The `poweredBy` credit's exact wording ("Website Powered By") and
  placement (directly under the Digital Partners row, its own small
  block) were design decisions this session made to satisfy "make it
  brand in the whole website" — the request didn't specify exact copy or
  position, so this is recorded here as a decision, not an assumed fact,
  the same way Phase 32's gallery placement was.
