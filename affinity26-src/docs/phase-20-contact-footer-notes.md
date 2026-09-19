# Phase 20 — Contact & Footer (/contact "The Royal Herald", global Footer "The Story Continues"): notes for future sessions

Persisted for continuity. See also `README.md` (project status) and
`docs/phase-19-rules-page-notes.md`.

## What this phase delivered

- `lib/contact/contactLinks.ts` (new) — three pure formatting helpers:
  `toTelHref` (mirrors the exact `tel:` convention `EventDetailsModal`
  already uses — whitespace stripped, no invented country-code prefix),
  `toWhatsAppHref` (`data/contacts.ts`'s `generalWhatsApp` → a
  `https://wa.me/<digits>` link), and `toInstagramHref` (`instagramHandle`
  → `https://instagram.com/<handle>`). None of these add a new fact —
  they only reformat an already-verified phone number/handle into a
  clickable URL.
- `components/contact/ContactIcons.tsx` (new) — three small hand-drawn
  glyphs (handset, speech bubble, camera) for phone/WhatsApp/Instagram.
  Deliberately generic shapes, not redrawn WhatsApp/Instagram brand
  marks — the visible text next to each glyph names the channel.
- `components/contact/ContactContent.tsx` (new) — the four categories
  the brief names (Organising Secretaries, Registration Desk,
  Registration WhatsApp, Instagram), each its own `<section>`/`<h2>` with
  an `OrnamentalFrame` card. Phone numbers are real `tel:` links,
  WhatsApp opens `wa.me`, Instagram opens `instagram.com` — all in a new
  tab for the two external ones (`target="_blank" rel="noopener
  noreferrer"`).
- `app/contact/page.tsx` (rewritten) — the Phase 02 placeholder now
  renders "The Royal Herald" heading and `ContactContent`.
- `components/layout/Footer.tsx` (rewritten) — "The Story Continues":
  three columns (brand/institution, Quick Links, Social) plus one
  closing line, replacing the Phase 02 inline-styled placeholder.

## Truth-mode audit

- **No email, website, address, or social account was invented.**
  `data/contacts.ts` (§11 of `docs/affinity-content-truth.md`) has no
  email or website field at all, and this phase didn't add one anywhere
  — not on the Contact page, not in the Footer. The only social account
  is the one already-verified Instagram handle; no other platform
  (Twitter/X, Facebook, LinkedIn, YouTube, a "contact us" email address)
  appears anywhere, because none is stated in the source material.
- **Phone numbers are the identical digits already in `data/contacts.ts`,
  just wrapped in a `tel:` href.** `toTelHref` doesn't reformat, validate,
  or add a country code — it strips whitespace only, matching
  `EventDetailsModal`'s existing convention exactly, so a phone number
  now looks and behaves the same everywhere it appears in the app.
- **Only two of `data/contacts.ts`'s six groups are rendered on
  `/contact`.** The phase instruction names exactly four categories
  (Organising Secretaries, Registration Desk, Registration WhatsApp,
  Instagram) — Treasuries, Accommodation, Sports Secretaries, and
  Cultural Secretaries stay in `data/contacts.ts` untouched and fully
  intact, just not rendered by this page. This is a scoping choice, not
  a truth-mode omission: nothing was deleted, hidden as false, or
  contradicted — those four groups are simply available for a future
  phase to surface (e.g. an "Other Committees" expansion, or folding
  Accommodation's contacts into a future Accommodation-specific section)
  without needing new data work.
- **The Footer's "Institution" line and edition/batch line are the same
  `festivalIdentity` fields** already used on the landing page/Navbar —
  no new institutional fact was introduced, and no closing "©" or "All
  rights reserved" line was added, since that reads as a legal claim
  the source material doesn't make.

## Decisions worth knowing about

- **"Registration WhatsApp" (the phase's label) is `data/contacts.ts`'s
  `generalWhatsApp`**, which the source table itself calls "General
  WhatsApp (from original registration docx)" (§11). Same number, just a
  heading-label choice to match the phase's own wording — not a
  different, second WhatsApp number.
- **The Footer's Quick Links point at `/events`, `/rules`, `/register`,
  and `/contact`** — the brief's own list ("Events, Rules, Registration,
  Contact"). `/register` is the registration wizard's entry route (same
  target the Navbar's own CTA already uses), not a new page.
- **Contact glyphs are generic, not brand marks.** A literal WhatsApp or
  Instagram logo redraw was avoided — the handset/speech-bubble/camera
  shapes are plain line art in the same style as `EventBadge`'s existing
  glyphs, and the adjacent text (not the icon) is what actually
  identifies each channel.
- **The Footer stays deliberately narrow** — brand identity, four
  navigation links, and the two social/WhatsApp links only. It does not
  repeat the Organising Secretaries/Registration Desk phone lists
  `/contact` already owns; duplicating full contact rosters into global
  chrome shown on every page would work against the brief's own "keep
  the footer elegant and compact" instruction.
- **Footer heading labels ("Quick Links", "Social") are `<p>` elements,
  not `<h2>`/`<h3>`.** The footer is global chrome repeated on every
  route; making its two group labels real page headings would add two
  more entries to every single page's heading outline app-wide. The
  Quick Links list is still wrapped in a labelled `<nav
  aria-label="Footer quick links">` landmark for AT users navigating by
  landmarks instead.

## Still-open limitation (unchanged since Phase 02)

Same npm-registry-unreachable constraint as every prior phase. Verified
this phase with the same method as always: strict `tsc --noEmit` over
the pure-logic file set — now 24 files (up from 22; `data/contacts.ts`
and `lib/contact/contactLinks.ts` added — `data/contacts.ts` existed
since Phase 02 but had never been added to the explicitly-checked list
until now) — zero errors; esbuild syntax-check over every `.ts`/`.tsx`
file in the project — 75 files (up from 72: `ContactIcons.tsx`,
`ContactContent.tsx`, `contactLinks.ts`), zero failures; a script
confirming all 163 `@/...` imports resolve (up from 156). **Not yet seen
in a real browser** — specifically untested: whether `tel:`/`wa.me`
links actually open the expected app on a real phone, whether the
Footer's three-column grid collapses cleanly to one column on mobile
without the brand block's tagline/institution text wrapping awkwardly,
and keyboard-only tab order through the Contact page's four cards and
the Footer's links.

## Suggested next phase

Every brief-listed page now has real content — Theme and the landing
page's Events teaser are the only items still outstanding since Phase
02. A pass focused specifically on real-browser verification (the
standing limitation repeated in every phase's notes) would also be
valuable now that the full site is content-complete.
