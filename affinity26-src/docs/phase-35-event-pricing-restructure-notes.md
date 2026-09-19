# Phase 35 — Event & registration pricing restructuring: notes for future sessions

Persisted for continuity. The final requested restructuring of how
AFFINITY '26 events relate to the three registration packages, driven by
a newly supplied official PDF + DOCX and a very detailed specification
from the user. No unrelated section was touched.

## The core rule

Every AFFINITY '26 event is now explicitly one of two registration
modes, via a new required field on `AffinityEvent`
(`types/event.ts`'s `RegistrationMode`):

- **`"standard"`** (44 events) — covered by one of the three
  registration packages (`data/pricing.ts`: ₹480 / ₹1,100 / ₹1,500). No
  individual event fee is ever added to the package total.
- **`"direct-contact"`** (12 events) — has its own separate entry fee
  and its own registration process, handled directly by the event's
  in-charge, never through the online package flow: **Chess, Badminton,
  Athletics — Track, Shot Put, Discus Throw, Javelin Throw, Free Fire,
  PUBG, E-Football, FIFA, Short Film, Sollal Vel.**

This field was added to the existing `AffinityEvent` interface, not a
parallel data structure — the phase brief itself asked for the existing
event architecture to be reused ("do not create duplicate event
definitions"), and the existing `contact`/`fee` fields already carried
everything a `contactPeople`/`separateEntryFee` pair would have, so
those field names were kept rather than introduced as a second,
overlapping set.

## Why 12 events, not more

The user's own message numbered the Track & Field group as four
separate line items (100m/200m/400m/Relay). Both source documents
(`E3DF9C55.pdf` and the DOCX), and this app's own pre-existing data,
already model that group as four separate `AffinityEvent` records —
`athletics-track`, `javelin-throw`, `discus-throw`, `shot-put` — each
already carrying its own `id`/prizes/rules. So "the Track & Field group"
in the user's message maps onto those 4 already-existing records, not a
5th invented "Track & Field bundle" event — nothing new was invented
here, the four records were simply each marked `direct-contact`.

## The UI split

**`EventCard`** (`components/events/EventCard.tsx`): a direct-contact
event now gets a "Direct Contact Registration" chip (a new
`EventBadge` variant, styled the same dignified gold as the
category/mode chips — never the burgundy "conflicting" treatment, per
the brief's explicit "must not look like a warning area"). Its footer
*never* renders the select/selected toggle, however the caller wires
`onToggleSelect` — instead it always renders a "Contact In-Charge"
trigger that opens `EventDetailsModal`. A standard card is unchanged
from Phase 31: category/mode badges, type, contact, and either "View
Details" or "Select This Event" — still no fee/price text anywhere on
any card.

**`EventDetailsModal`** (`components/events/EventDetailsModal.tsx`): for
a direct-contact event, the footer's "Register for This Event" button
— which links into `/register?event=<id>`, the package flow — is
replaced by a static notice ("Direct-contact registration — no online
payment for this event."). The Contact section gains "Separate entry
event." above the contact list and "Please contact the event in-charge
for participation and payment details." below it. No payment button, no
checkout affordance, ever, for these 12 events, on this page.

**`EventsStep`** (`components/registration/EventsStep.tsx` — the
wizard's "Choose Your Tales" step): now splits into two headed
sections, "Standard AFFINITY Events" ("Covered by your selected
registration package.") and "Direct-Contact Events" ("These events have
separate entry procedures. Contact the respective in-charge for
participation details."), computed on top of the existing mode-tab +
search filtering (so both still narrow within each section exactly as
before). Standard cards keep the existing `onToggleSelect` wiring;
direct-contact cards are newly wired to `onViewDetails`, opening the
same `EventDetailsModal` `EventsExplorer` already used — one shared
component, not a second bespoke "contact info" widget, so the copy is
identical everywhere a direct-contact event is expanded.

**`EventsExplorer`** (`components/events/EventsExplorer.tsx` — the
public `/events` page): same two-section split, same heading/subtext
pair, existing `EVENT_GROUPS` category tabs (All/Sports/Culturals/
Online) and search unchanged. Card heading level was adjusted from
`h2` to `h3` since the new section headings now own `h2`, keeping the
page's heading outline (`h1` → `h2` section → `h3` cards) skip-free.

**`EventPreselect`** (`components/registration/EventPreselect.tsx`):
defense-in-depth guard added — even though nothing in the UI links to
`/register?event=<id>` for a direct-contact event anymore, a stale
bookmark or hand-typed URL for one of the 12 direct-contact ids is now
explicitly ignored rather than silently adding it to
`selectedEvents`.

**Pricing** (`lib/registration/pricing.ts`, `PackageStep`, `ReviewStep`,
`RegistrationSummary`): unchanged — Phase 31 already made
`calculatePricing` return exactly the selected package's own amount,
nothing else, so viewing (or, if ever forced, selecting) a
direct-contact event was already incapable of changing the total.
Verified this stayed true rather than assumed.

## Data corrections and flagged discrepancies

TRUTH MODE: source documents were never silently reconciled. Every
correction below is visible in the record's own `fee.notes` /
`verificationNotes`, not just in this file.

- **Badminton fee** — was incorrectly `{ amount: null, unit:
  "included_in_package" }` in this app's prior data (no sport-specific
  fee had ever been recorded). Corrected to `{ amount: 600, unit:
  "per_team" }` per the newly supplied source data.
- **Track & Field group contact attribution** (`athletics-track`,
  `javelin-throw`, `discus-throw`, `shot-put`) — the PDF and this app's
  prior data agree on 4 shared contacts (Kanishkar, Sharan Kumar,
  Hareni AS, Vanathy) across the whole group. The DOCX narrows this to
  just 2 names per event (Hareni AS for Track/Shot Put, Sharan Kumar for
  Discus/Javelin), omitting Kanishkar and Vanathy entirely. The fuller,
  PDF-corroborated list was kept, but `verificationStatus` was changed
  to `"conflicting"` on all four records with a note explaining the
  narrower DOCX attribution — **[VERIFY WITH ORGANIZER]**.
- **E-Football 2v2 fee unit** — the prior data's `fee.notes` read "2v2
  mode: ₹150 per team," silently picking one source's wording. One
  supplied source states ₹150 per person for 2v2, another per team. The
  note now states both without resolving either way, `verificationStatus`
  changed to `"conflicting"` — **[VERIFY WITH ORGANIZER]**, and
  participants are told to confirm directly with the in-charge before
  paying.
- **PUBG fee** — already correctly preserved both the ₹400-per-squad and
  ₹100-per-person figures from before this phase (Phase 09); the note
  was only reworded slightly for clarity, no substantive change. No
  separate payment-method selector was added, per the brief's explicit
  instruction.
- **Sollal Vel finalist fee** — this app's prior data stated "a further
  ₹350 to advance." Both newly supplied sources (the DOCX and the
  organizer's own message) state ₹380. This is a discrepancy between
  this app's *existing* data and the newly supplied sources, not a
  disagreement between the two new sources themselves — corrected to
  ₹380, with the correction itself recorded in `verificationNotes` and
  `verificationStatus` changed to `"conflicting"` so it remains visible
  and reversible rather than silently overwritten — **[VERIFY WITH
  ORGANIZER]**.

No other fee/contact figures were changed. Chess (₹250), Free Fire
(₹200/team of 4), FIFA (₹100/person), and Short Film (₹1,500) already
matched the newly supplied sources exactly and were left untouched
apart from gaining `registrationMode: "direct-contact"`.

## Verification

- Strict `tsc --noEmit` over the pure-logic file list — **29 files**
  (unchanged — no new pure-logic file was added; `types/event.ts` and
  all three `data/events/*.ts` files were already on this list) — zero
  errors.
- `esbuild` syntax-check over every `.ts`/`.tsx` file — **90 files**
  (unchanged — every file touched this phase already existed) — zero
  failures.
- A script confirming all `@/...` imports resolve — **184** (up from
  183 — `EventsStep.tsx` gained one new import,
  `EventDetailsModal`) — all resolve.
- Ran `data/events/index.ts`'s `allEvents` through `tsx` directly (not
  just type-checked) to confirm at runtime: 56 total events, exactly 44
  `"standard"` + 12 `"direct-contact"`, the 12 direct-contact ids match
  the brief's list exactly, badminton/sollal-vel/e-football's corrected
  fee objects hold the expected values, and zero events are missing a
  `registrationMode`.
- Read every edited file in full after editing to confirm JSX
  tag balance and prop correctness by eye, on top of `esbuild`'s own
  (authoritative) JSX parse.
- `npm run lint` / `npm run build` still cannot run in this sandbox — no
  `node_modules`, no npm registry access. Unchanged limitation from
  every previous phase.

## Still-open limitations

- Not verified in a real browser — this sandbox still has no `next dev`/
  `next build`. The new two-section layout's spacing/wrapping at
  in-between widths, and the `EventDetailsModal`'s new direct-contact
  footer copy, are unverified against an actual rendered page.
- The three flagged discrepancies above (Track & Field contacts,
  E-Football 2v2 unit, Sollal Vel ₹350-vs-₹380) all remain genuinely
  open — this phase's job was to preserve and surface them, not resolve
  them, and none should be treated as settled without organizer
  confirmation.
