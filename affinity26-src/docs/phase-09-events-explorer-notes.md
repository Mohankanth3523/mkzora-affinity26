# Phase 09 — The Royal Courts (Events Explorer): notes for future sessions

Persisted for continuity. See also `README.md` (project status) and
`docs/phase-08-cause-notes.md`.

## What this phase delivered

`app/events/page.tsx` was rewritten from the Phase 02 plain-list
placeholder into a thin Server Component: it reads `allEvents` from
`data/events/*` and hands it to a new client component. Three new
files:

- `components/events/EventsExplorer.tsx` — the interactive shell
  (`"use client"`): heading + supporting line, a category filter (All /
  Sports / Culturals / Online), a search input, a live result count, the
  responsive card grid, and an empty state.
- `components/events/EventCard.tsx` — one event's summary card. Pure
  presentational, no hooks — takes an `AffinityEvent` and renders it,
  nothing else. Deliberately kept reusable (no dependency on
  `EventsExplorer`'s state) for wherever else a compact event summary is
  needed later, e.g. the registration wizard's own event-selection step.
- `lib/events/formatFee.ts` — one pure function, `formatEventFee`,
  turning an event's `fee` field into display copy.

No other route, section, or shared component changed.

## Truth-mode audit

Every event shown is one of the ~56 records already in `data/events/*`
(unchanged this phase — Phase 09 is presentation only, no new event data
was written). What's new is *how much of each record now reaches the
screen*:

- **Fee**: `formatEventFee` never invents a number. When `fee.amount` is
  a real figure, it's shown with its unit ("₹100 per person"). When
  `fee.amount` is `null` — true for most sports/cultural events, since
  the brochure only states explicit fees for Chess, Track & Field,
  Short Film, the online bundle, and each esports title (§5) — the card
  says "Included in registration package" (when `fee.unit ===
  "included_in_package"`) or the plain "Fee not stated"
  (`"unspecified"`). Neither branch guesses a rupee amount.
- **Limited-slot indicator**: rendered *only* when
  `limitedSlots.isLimited === true` in the source data (e.g. Cricket's
  "first 36 teams"), and only ever shows the source's own cap number
  when one exists — never a live "X of 36 remaining" count, since this
  frontend has no real registration numbers to report. The phase's own
  "do not show fake availability" instruction is enforced structurally:
  there is no code path that can render a slots-remaining figure at
  all, fabricated or otherwise.
- **Verification flag**: `EventCard` shows `EventBadge
  variant="verification"` whenever an event's `verificationStatus` isn't
  `"confirmed"` — this is the first place in the actual UI (as opposed
  to code comments and `docs/affinity-content-truth.md`) that a
  pending-organizer or conflicting fact becomes visible to a site
  visitor. Confirmed events don't show the badge, to keep ~40 "Confirmed"
  chips from turning into visual noise — the badge's job is to flag the
  exceptions, not decorate the majority.
- **Category/mode grouping**: the explorer's three filter groups
  (Sports / Culturals / Online) are a UI-level regrouping of the five
  real `EventCategory` values (`sports` → Sports;
  `cultural-onstage`/`cultural-offstage` → Culturals;
  `online-cultural`/`online-esports` → Online) — a navigational
  convenience, not a new fact, so it's defined locally in
  `EventsExplorer.tsx` rather than added to `data/events/`.

## Decisions worth knowing about

- **"Selection state" was read as the category filter's active/pressed
  state**, not a per-card shortlist mechanism. The phase brief lists
  "selection state" alongside "category filtering... event cards...
  responsive grid/list... event badges" — read most simply, it's asking
  for the filter chips to visibly show which one is active
  (`aria-pressed`, a filled gold chip vs. an outlined one), which the
  explorer also needs anyway for the filtering to be usable and
  accessible. A per-card "add to my picks" toggle was considered and
  deliberately not built: the project brief's own primary-goal list has
  "Event selection" as its own separate item (10), tied to the
  registration wizard's step 02 and its real `selectedEvents` state in
  `lib/registration/`. Building a second, local-only selection
  mechanism here risked shipping something that looks like registration
  progress but isn't connected to it — worse for truth-mode integrity
  than not building it at all. If a future phase wants a browsing
  shortlist distinct from wizard selection, it should be built
  deliberately as that, not backed into this phase's reading of one
  bullet point.
- **No event-details modal/drawer.** Cards are not clickable-to-expand.
  The project brief's primary-goal list has "Event details modal/drawer"
  as item 7, separate from "Events explorer" (item 5) — treated as its
  own future phase, consistent with every prior phase's "implement only
  X" discipline.
- **`EventsExplorer` is a client component; `EventCard` is not written
  as one.** `EventCard` has no hooks and no `"use client"` directive —
  it's a plain function component that happens to be rendered from
  within a client tree. This keeps it usable from a future Server
  Component context too (e.g. a static teaser list) without forcing it
  to carry client-only weight it doesn't need.
- **Search matches name and description, not every field.** Matching
  against contact names/phone numbers or rule text would surface
  confusing results (e.g. typing a coordinator's name and getting an
  unrelated event back); name + description is the same scope a user
  would expect from a search box labeled for events.
- **No new color-opacity pairings.** Every color used (badge chips via
  the existing `EventBadge`, `text-antique-gold`/`text-ivory`/
  `text-desert-sand` full-opacity, the active filter chip's
  `bg-antique-gold text-midnight` — the same pairing already verified
  for `GoldButton`) reuses combinations already checked in
  `docs/design-system-accessibility.md`. No table update was needed
  this phase.
- **Focus rings come from the existing global `:focus-visible` rule**
  (`app/globals.css`, Phase 03) — the filter buttons and search input
  don't define their own focus styling, so they inherit the same
  on-brand warm-gold outline as every other interactive element in the
  project, rather than risking a competing/duplicate ring.

## Still-open limitation (unchanged since Phase 02)

Same npm-registry-unreachable constraint as every prior phase. Verified
this phase with the same method as always: strict `tsc --noEmit` (zero
errors — and for the first time, this pass now also includes the full
`data/events/*` layer and `lib/events/formatFee.ts`, not just the
smaller pure-logic files checked in earlier phases), esbuild
syntax-check (zero errors, all 53 `.ts`/`.tsx` files in the project, up
from 50 in Phase 08), and a script confirming all 85 `@/...` imports
resolve (up from 79). **The actual filtering/search UX, the grid's
responsive behavior at real breakpoints, and whether ~56 cards read as
"premium" rather than "busy" have not been seen in a real browser** —
this is the largest amount of repeated content (badges, fee lines,
descriptions) the design system has had to carry at once so far, so
it's the phase where an in-browser check would matter most before
calling this "done."

## Suggested next phase

The event details modal/drawer (primary-goal item 7) is the natural
next step now that cards exist to trigger it from — each card could open
a drawer with the event's full `rules`, `prize`, `contact`, and
`eligibility` fields, none of which are shown on the card itself yet.
Alternatively, Theme is still the one remaining Phase 02 placeholder on
the landing page (between Story and Cause) if finishing that narrative
flow first is preferred.
