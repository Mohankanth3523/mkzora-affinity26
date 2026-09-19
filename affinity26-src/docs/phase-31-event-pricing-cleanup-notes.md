# Phase 31 — Event selection & package pricing cleanup: notes for future sessions

Persisted for continuity. This phase did not touch the underlying event
data, add a route, or rebuild the registration wizard — it simplified two
already-implemented UI surfaces (the Events step's cards, and the pricing
model that feeds the Package step / Review / running summary) that had
grown more information-dense than the brief now wants participants to see.

## What "clutter" meant, concretely

Before this phase, `EventCard` (shared by the public `/events` explorer
and the registration wizard's Events step) showed, per event: a category
badge, a mode badge, a type + **fee** line (`formatEventFee`), an optional
description, and — only when relevant — a "Limited — First N" badge and a
data-verification badge (`EventBadge variant="verification"`, e.g. the
literal phrase **"Pending Organizer Confirmation"**). The registration
wizard additionally echoed each event's fee in three more places: the
Events step's own "Your Chosen Tales" mini-list, the Details step's
individual-entry list, and the Review step's Events section.

The phase brief names several of those exact phrases as clutter to
remove — "Included in registration package," "Limited — First 36,"
"Pending organizer confirmation" — and is explicit that **no** individual
event fee may appear anywhere in the participant-facing registration UI,
full stop, replacing all of it with a strictly package-level pricing
model. All five of the fee-echoing spots above were changed; the
underlying `AffinityEvent.fee` field was **not** touched or removed from
`data/events/*` — it's still there, just no longer read by any
participant-facing component except the pricing calculator itself, which
now also ignores it (see below).

## `EventCard` — what's left

Per the brief's own four questions, in this order: category badge + mode
badge, event name, `TYPE_LABEL[event.type]` ("Individual"/"Team"/etc.),
an optional short description, then a **Contact** block reading
`event.contact` (every AFFINITY '26 event in the source data already has
at least one named contact with a phone number — verified by grep across
all three `data/events/*.ts` files before writing this — so the "To be
announced" fallback exists for correctness/future-proofing but isn't
currently exercised by any real record). A limited-slot indicator, when
`limitedSlots.isLimited === true`, is now the bare words "Limited Slots"
in small, low-emphasis type — never the numeric cap
(`limitedSlots.cap`), which the brief calls out by name as the kind of
detail to drop. The data-verification badge is gone from the card
entirely (still shown in `EventDetailsModal`, one click away — the brief
only asks for it off the *card*, and a genuine data-confidence caveat is
still worth surfacing somewhere).

## Events step — mode tabs replace category tabs

`EventsStep` (`components/registration/EventsStep.tsx`) used to filter by
the same three-way Sports/Culturals/Online category grouping
(`lib/events/eventGroups.ts`) the public Events Explorer still uses. This
phase's brief asks specifically for **All Events / Offline / Online** —
a mode-based split, not a category-based one — with "All Events" showing
both groups "visually separated." That's what's there now: a local
`ModeTab` type (`"all" | "offline" | "online"`), search still filtering
within whichever tab is active, and — only on the "All" tab — two
sub-headed sections ("Offline / On-Campus Events" / "Online Events"),
each rendered only if it has at least one matching event after search.
"Offline"/"Online" render one flat grid of just that mode.

**Scope decision, recorded on purpose:** this new mode-tab set was
applied only to the registration wizard's Events step, not to the public
`/events` Events Explorer page (`components/events/EventsExplorer.tsx`),
which keeps its existing Sports/Culturals/Online category filter
unchanged. The phase brief's own step numbering ("STEP 2 CHOOSE YOUR
TALES") and its repeated framing around the registration flow read as
scoped to the wizard specifically, and the brief's "DO NOT MODIFY... 
unrelated registration steps unless a small integration change is
absolutely required" leans toward not touching a page outside the
registration flow that wasn't asked about. `EventCard`'s pricing/clutter
removal *does* apply to both pages, since it's the same shared component
and the brief's "remove from event cards" instructions read as general,
not wizard-scoped. If the public Events Explorer should also switch to
All/Offline/Online tabs, that's a small, low-risk follow-up — flag it and
a future phase can do it in isolation.

**Event mode classification was never ambiguous.** Every sports and
cultural (onstage or offstage) event has `mode: "offline"`; every online
cultural and esports event has `mode: "online"` — confirmed by grepping
all three `data/events/*.ts` files (18 + 25 offline, 13 online = 56
total, matching `eventCounts.total`). Nothing was reclassified, and there
were no ambiguous events to report.

## Pricing — rewritten from event-fee-aware to package-only

`lib/registration/pricing.ts` used to compute a total from the selected
package's base price *plus* every selected event's own `fee.amount`
(Chess, Track & Field, Short Film, the online bundle, each esports
title), with a hard-coded special case that replaced the base package
with a flat ₹250 for a Chess-only registration
(`docs/affinity-content-truth.md` §5). The phase brief is explicit and
repeats itself across several sections: "Do NOT add individual event fees
to the displayed total," with worked examples (Registration → ₹480,
+Food → ₹1,100, +Food+Accommodation → ₹1,500) that are simply the three
official package prices, unmodified.

`calculatePricing` now does exactly that: `total` is always the selected
package's own `amount`, independent of which or how many events are
selected. `PackageStep`'s old "Chess-only registration" callout (the UI
text explaining the ₹250 override) was removed along with it — leaving
that text in place would have described behavior the calculator no
longer performs, which would have been actively misleading rather than
merely simplified.

**This is a deliberate frontend-display simplification, not a
correction of the source.** Nothing in `data/pricing.ts` or
`data/events/*` was edited — the official Chess-only-₹250 rule is still
documented, verbatim, in `docs/affinity-content-truth.md` §5. A new
"Frontend display note" was added directly under that table (and a
corresponding bullet under §15, "Information requiring organizer
verification") recording, permanently, that the displayed total no
longer reflects that override, and flagging **[VERIFY WITH ORGANIZER]**
how a real Chess-only registrant's payment should reconcile with the
flat package price the UI now shows before this is ever connected to
real payment collection. This is exactly the "identify the conflict...
mark it as [VERIFY WITH ORGANIZER]... do not fabricate a resolution"
posture the project's TRUTH MODE section asks for, applied to a
tension this phase's own explicit instruction created rather than one
found in the source.

`RegistrationSummary.tsx` (the wizard's running sidebar) needed **no
changes** — it was already reading only `state.pricing.total`, never a
line-item breakdown, so it was already package-only in effect once
`pricing.ts` stopped adding event fees to that total. `PricingBreakdown`
(used by `PackageStep` and `ReviewStep`'s "Fees" section) also needed no
structural changes: it now simply renders one line (the package's own
label and amount) plus the identical Total below it — slightly redundant
visually, but not the kind of clutter the brief named, and changing that
component's layout wasn't asked for.

## Truth-mode housekeeping

- `formatEventFee` (`lib/events/formatFee.ts`) is now unused by any
  participant-facing component — left in place, unexported-nothing,
  since it's a pure, correct utility a future admin/backend view could
  still use, and the brief's "do not silently delete source data" spirit
  extends naturally to not deleting working code that might be wanted
  again.
- `data/pricing.ts`'s `AFFINITY_TAG_REPLACEMENT_FEE`,
  `ACCOMMODATION_CAUTION_DEPOSIT`, and `baseIncludesUnlistedEvents` are
  now unused by any calculator — also left in place; they're transcribed
  source facts, not code this phase has any reason to delete.
- Every `AffinityEvent.fee` value in `data/events/*` is untouched.

## Verification

- Strict `tsc --noEmit` over the pure-logic file list — still **28
  files** (no new pure-logic file was added this phase; `pricing.ts` was
  rewritten in place) — zero errors.
- `esbuild` syntax-check over every `.ts`/`.tsx` file — still **86
  files** — zero failures.
- A script confirming all `@/...` imports resolve — **178** (down from
  184: this phase net-removed six import statements — five
  `formatEventFee` imports across `EventCard.tsx`, `EventsStep.tsx`,
  `EventDetailsModal.tsx`, `DetailsStep.tsx`, `ReviewStep.tsx`, plus
  `EventsStep.tsx`'s old `eventGroups` import replaced by a smaller
  `eventLabels` one) — all resolve.
- `npm run lint` / `npm run build` / a real project-wide `tsc --noEmit`
  still cannot run in this sandbox — no `node_modules`, no npm registry
  access. Unchanged limitation from every previous phase; see the
  README's own "Verification could not be fully automated" section.

## Still-open limitations

- The public `/events` Events Explorer was deliberately left on its old
  Sports/Culturals/Online category filter (see "Scope decision" above) —
  flag this if the user actually wants All/Offline/Online there too.
- The Chess-only pricing reconciliation gap above is now durably
  documented but genuinely unresolved — an organizer needs to say how a
  Chess-only registrant is actually charged before this connects to real
  payment collection.
- Real browser/mobile verification of the new tab UI (tap targets,
  section-heading screen-reader announcement order between the two "All
  Events" subsections) hasn't happened — this sandbox still has no
  `next dev`/`next build`.
