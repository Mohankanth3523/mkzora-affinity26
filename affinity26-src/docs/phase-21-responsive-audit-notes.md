# Phase 21 — Responsive Design Audit: notes for future sessions

Persisted for continuity. See also `README.md` (project status) and the
prior phase-notes docs.

## What this phase was

Not a new feature phase — a **audit-and-fix pass** across every page and
component built so far, per the brief's own "Do not add new functionality
... Fix genuine issues only. Do not unnecessarily redesign working
components." No new pages, routes, or data were added.

## Method (no live browser available in this sandbox)

The standing sandbox constraint is unchanged since Phase 02: the npm
registry is unreachable (`curl` to `registry.npmjs.org` returns `403
host_not_allowed`), so there is no `node_modules`, no `next dev`, and no
way to actually render the site in a browser at the nine requested widths
(320 / 375 / 390 / 430 / 768 / 1024 / 1280 / 1440 / 1920px).

Instead, this phase was a **manual static audit**: every component listed
in the phase brief's "Check" list was read in full and reasoned about
against Tailwind's (unmodified — confirmed via `tailwind.config.ts`, no
custom `screens` key) default breakpoints (`sm` 640 / `md` 768 / `lg`
1024 / `xl` 1280 / `2xl` 1536), mapping the nine requested widths onto
those buckets (320/375/390/430 → base; 768 → md; 1024 → lg; 1280 & 1440 →
xl; 1920 → still the widest, "2xl-and-up," bucket, since nothing wider is
defined). For each component, the brief's checklist was applied literally:
horizontal overflow, text clipping, tiny buttons, broken grids, modal
overflow, poor spacing, unreadable text, touch target problems, sticky
elements, mobile navigation problems.

**Every page and component the brief names was read and audited**: Navbar,
Hero (+ StarField/Lantern/PalaceSilhouette), Story, Cause, the Events
explorer + EventCard, EventDetailsModal, the registration wizard shell
(RegistrationLayout/Progress/Navigation), ParticipantStep, DetailsStep
(team members), PackageStep + PricingBreakdown, ReviewStep, ConfirmStep,
the success Registration Pass, the Rules Accordion/RulesContent, Contact,
and the Footer.

## Genuine issues found and fixed (2)

Both are the same underlying CSS bug, found in two places: a flex row
(`display: flex`) holding a text element next to a fixed-width sibling,
with no `min-w-0` on the text element. Flex items default to `min-width:
auto`, which for a text-containing element equals its own max-content
width (the width the text would need on a single, unwrapped line) — so
when that computed width is wider than the row actually has room for, the
browser does **not** shrink or wrap the text to fit; it lets the element
overflow the row instead, unless another rule (like `flex-wrap` on the
parent) intervenes first. Both fixes below add `min-w-0` (i.e., "you are
allowed to shrink/wrap below your own content width") to the text-holding
child, which is the standard fix for this specific flexbox behavior.

1. **`components/events/EventDetailsModal.tsx`** — the modal header is a
   `flex` row: a `flex flex-col gap-2` block (category/mode badges + the
   `<h2>` event name) beside a `shrink-0` 44px close button, with no
   `flex-wrap` on the row (there's nowhere for it to wrap to — the close
   button has to stay in the header). Several real event names are long
   enough to trigger this — e.g. `"Athletics — Track (100m / 200m / 400m
   / 4×100m Relay)"` (54 characters) and `"Rapunzel (Hairstyle
   Competition)"` — and at 320–430px (px-6 padding + the 44px button +
   gap leaves roughly 200px for the title), the un-fixed header would let
   the title overflow past the modal's right edge instead of wrapping to
   a second line. **Fix:** added `min-w-0` to the title/badges wrapper
   div, so the `<h2>` now wraps normally within the space actually
   available.
2. **`components/registration/PricingBreakdown.tsx`** — the price-
   breakdown's line-item rows (`<dt>{line.label}</dt>` /
   `<dd>{amount}</dd>` in a `flex items-baseline justify-between gap-4`
   row, deliberately *not* `flex-wrap`, since it's meant to read as a
   two-column ledger) can carry a genuinely long label:
   `lib/registration/pricing.ts` builds each event-fee line as
   `` `${event.name} fee` `` or, for a per-person fee split across a
   roster, `` `${event.name} fee (${teamMembers.length} participants)` ``
   — for the same long event names above, this can exceed 70 characters.
   This component is reused on three screens (`PackageStep`, `ReviewStep`
   via `bare`, and `ConfirmStep`'s "Payment Summary"), so the bug would
   have shown up in all three. **Fix:** added `min-w-0` to `<dt>` (so the
   label wraps onto a second line instead of overflowing) and `shrink-0`
   to `<dd>` (so the ₹ amount itself is never the thing that gets
   compressed).

Both fixes were re-verified with the same esbuild syntax-check used all
phase (see Verification below) and are pure Tailwind class additions —
no logic, markup structure, or visible content changed for the
already-short labels that were never at risk.

## Reviewed and deliberately left unchanged

- **`RegistrationProgress.tsx`'s step-indicator circles are 36×36px
  (`h-9 w-9`) below the `sm` breakpoint**, growing to the project's usual
  44px (`min-h-11`) standard at `sm` and up. This is smaller than every
  other interactive element in the codebase. It was not changed: six
  steps have to fit across a 320px screen (container padding leaves
  ~288px, minus 5× `gap-1`, leaves ~44.6px per step on average) — bumping
  every circle to a flat 44px leaves only ~0.6px of average slack for the
  connecting hairlines between them, which is too tight to be a safe
  change without an actual browser to check against, and 36px already
  clears the WCAG 2.5.8 (AA) 24×24px minimum target size by a wide
  margin. Flagged here rather than changed, per "fix genuine issues only
  ... do not unnecessarily redesign."
- **`components/sections/Cause.tsx`'s closing blockquote is `text-left`
  inside an otherwise `text-center` flex column.** This is intentional,
  documented in the component's own comments as a deliberate "quiet
  aside" treatment (an attributed pull-quote reads oddly center-aligned),
  and doesn't create any overflow or clipping risk at any width — the
  blockquote has its own `max-w-xl` and the parent column centers the
  whole block. Not a bug.
- Every other checked component (Navbar, Hero, Story, EventsExplorer,
  EventCard, the registration wizard shell, ParticipantStep, DetailsStep's
  dynamic team-member rows, PackageStep, ReviewStep, ConfirmStep, the
  Registration Pass, Rules' Accordion, Contact, Footer) already handles
  narrow widths correctly: consistent 44px touch targets, `flex-wrap` used
  wherever a row could plausibly overflow with real (sometimes long) data,
  grids that collapse to one column below `sm`/`lg` as appropriate, and no
  fixed-width elements that could force horizontal scroll. No changes were
  made to any of these.

## Verification

Same trio as every phase, re-run after the two fixes above:

- Strict `tsc --noEmit` (`strict: true`, `noUncheckedIndexedAccess: true`)
  over the pure-logic file list — unchanged at 24 files (this phase's two
  edits were both `.tsx` components, which this list doesn't cover) —
  zero errors.
- `esbuild` syntax-check over every `.ts`/`.tsx` file in the project — 75
  files, unchanged from Phase 20 (no new files this phase, only edits to
  two existing ones) — zero failures.
- A script confirming all `@/...` imports resolve — 163, unchanged from
  Phase 20.

## Still-open limitation (unchanged since Phase 02)

Everything above is a **static reading of the Tailwind classes**, not a
rendered-browser observation. The two fixed bugs are the kind of thing
that's easy to reason about correctly from source (flexbox min-width
behavior is well-documented and deterministic), but this phase could not
literally place the page at 320px and look. A real-browser pass — DevTools
responsive mode at the nine listed widths, clicking through every route —
is still the one thing every phase's notes have flagged as outstanding,
and remains the most valuable next verification step now that a full
manual audit has also been completed.

## Suggested next phase

The project brief's full page list is now content-complete and has had
one full responsive-audit pass. The two likely next steps: (1) a real-
browser verification pass once this project can run on a machine with
npm access, or (2) the Theme/landing-page-Events-teaser items still noted
as "not built yet" in `README.md`.
