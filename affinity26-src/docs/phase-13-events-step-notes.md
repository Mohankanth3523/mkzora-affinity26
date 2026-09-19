# Phase 13 — Choose Your Tales (Step 02): notes for future sessions

Persisted for continuity. See also `README.md` (project status) and
`docs/phase-12-participant-step-notes.md`.

## What this phase delivered

- `components/registration/EventsStep.tsx` (rewritten) — the real
  multi-select event picker, under the heading "Choose Your Tales".
- `lib/events/eventGroups.ts` (new) — the Sports/Culturals/Online
  category-group taxonomy, extracted from `EventsExplorer.tsx` (Phase 09)
  once this step needed the identical grouping.
- `components/events/EventsExplorer.tsx` (edited) — refactored to import
  the grouping from the new shared module instead of its own private
  copy; no behavioural change, purely a dedupe.
- `components/events/EventCard.tsx` (edited) — gained an optional
  `selected`/`onToggleSelect` mode: a full-width select/selected toggle
  at the card's foot plus a subtle gold ring around the whole card,
  independent of (and not used together with) the existing
  `onViewDetails` mode.
- `lib/registration/validation.ts` (edited) — added
  `isEventsStepValid(selectedEvents)`.
- `components/registration/RegistrationNavigation.tsx` (edited) — added a
  second, simpler gating mechanism (`NEXT_DISABLED_BY_STEP`) alongside
  Phase 12's form-submit one, for steps that only need a boolean "can
  advance" check with no per-field errors — Events is the first user.

## Truth-mode audit

Nothing here is a new fact. `EventsStep` reads `allEvents` straight from
`data/events/*` (unchanged this phase) and renders each event through the
same `EventCard` the public Events Explorer already uses — same fee
formatting (`formatEventFee`, never a fabricated number), same
limited-slot indicator (only shown when `limitedSlots.isLimited` is
explicitly `true` in the source data — no "3 spots left" style copy,
since this frontend has no live registration count to report), same
verification badge for any event whose `verificationStatus` isn't
`"confirmed"`. The brief's "Do not show fake remaining slots" and
"Do not invent restrictions" are satisfied by *not adding anything new* —
every one of those display rules already existed in `EventCard` before
this phase; this step just reuses it in select-mode instead of
building a parallel, possibly-inconsistent rendering of the same event
data.

## Decisions worth knowing about

- **"Valid event selected" means "at least one event is selected," and
  nothing more.** The brief's own "Do not invent restrictions" rules out
  building an eligibility-matching engine (e.g. cross-checking the
  participant's year of study, captured in Step 01, against an event's
  free-text `eligibility` field) — no source document defines eligibility
  as a structured, machine-checkable rule; it's prose the organizer
  would need to actually verify a registration against. Inventing an
  enforcement layer on top of that prose would itself be inventing a
  restriction the source material doesn't state as automatic. So
  `isEventsStepValid` is intentionally just `selectedEvents.length > 0` —
  documented explicitly in `lib/registration/validation.ts` so a future
  session doesn't mistake this for an oversight.
- **A second "Next" gating mechanism, alongside Phase 12's.** Phase 12
  introduced the native-`form`-attribute technique because Participant
  needed per-field errors and focus management. Events needs neither —
  just a single boolean ("is anything selected") — so a plain
  `disabled` attribute plus a one-line reason (`NEXT_DISABLED_BY_STEP` /
  `NEXT_DISABLED_REASON` in `RegistrationNavigation.tsx`) is enough, and
  simpler than forcing every gated step through the form-submit pattern
  regardless of whether it actually needs field-level validation. The two
  mechanisms are independent and keyed by step, so adding gating to a
  future step is just adding one more entry to whichever map fits its
  actual shape of validation.
- **The disabled state has a visible, non-color-only explanation.** A
  `role="status"` line ("Select at least one event to continue.") appears
  under the Back/Next row whenever Next is disabled, and the button's own
  `aria-label` also carries the reason — a disabled button with no
  visible explanation is a common accessibility gap this avoids.
- **`EventCard`'s new selection mode is a full-width footer button, not a
  small checkbox in the corner.** Deliberately chosen for "make mobile
  interaction excellent": on the single-column mobile grid, a full-width
  `min-h-11` button spanning the card's whole footer is a far larger,
  easier tap target than a small checkbox would be, while still using a
  real checkbox-style glyph (empty square / checked square, hand-drawn to
  match `EventBadge`'s existing no-icon-library convention) so the
  selected state reads instantly at a glance, not just from the label
  text change ("Select This Event" → "Selected").
- **A gold ring (`ring-1 ring-antique-gold`), not a background/border
  color swap, marks a selected card.** `OrnamentalFrame` already owns
  its own border/background classes internally; overriding those via a
  second, conflicting utility class passed through `className` would
  depend on Tailwind's generated-stylesheet ordering rather than the
  passed class string's order, which is fragile and unproven elsewhere in
  this codebase. `ring-*` is a different CSS property (`box-shadow`) than
  `border-color`, so it always layers additively on top of
  `OrnamentalFrame`'s existing styling with no specificity race.
- **The "Your Chosen Tales" summary panel lives inside `EventsStep`
  itself, right below the heading — not only in `RegistrationSummary`'s
  sidebar.** `RegistrationLayout`'s two-column grid (Phase 11) only
  becomes side-by-side at `lg`; below that, the sidebar renders *after*
  all of `children`, meaning on a phone the running summary sits far
  below the entire event grid. A dedicated, local, always-near-the-top
  selected-list — with its own per-event "Remove" button, distinct from
  toggling a card off — keeps the "what have I picked so far, and how do
  I undo it" answer close at hand while scrolling through the grid on a
  small screen, which is exactly what "make mobile interaction excellent"
  and the brief's explicit "selected events summary" / "remove event"
  bullets ask for. It intentionally doesn't recompute or display a
  running price total — `RegistrationSummary` already owns that
  (`state.pricing.total`), and duplicating pricing logic in a second
  place would risk the two disagreeing later.
- **Search/filter behaviour is a deliberate re-implementation of
  `EventsExplorer`'s, not an import of the whole component.** The two
  have different footers (`onViewDetails` vs `onToggleSelect`) and
  `EventsExplorer` also owns its own page-level `<h1>` and the details
  modal, neither of which belongs inside a wizard step. Sharing the
  category-grouping data (`lib/events/eventGroups.ts`) removes the one
  piece of real duplication (the taxonomy itself); the surrounding JSX
  stays step-specific on purpose.

## Still-open limitation (unchanged since Phase 02)

Same npm-registry-unreachable constraint as every prior phase. Verified
this phase with the same method as always: strict `tsc --noEmit` over the
pure-logic file set (zero errors — `lib/events/eventGroups.ts` and the
`isEventsStepValid` addition to `lib/registration/validation.ts` both
join this pass), esbuild syntax-check (zero errors, all 64 `.ts`/`.tsx`
files, up from 63 in Phase 12), and a script confirming all 122 `@/...`
imports resolve (up from 115). **Not yet seen in a real browser.** This
phase is especially worth a real click-through given how much of it is
interaction: selecting/deselecting via the card footer vs. the summary
panel's "Remove" button should stay in sync in both directions; the ring
highlight should be visually obvious at a glance; the disabled-Next state
and its reason text should appear/disappear correctly as the selection
count crosses zero; and the mobile single-column layout should be
checked directly (not just inferred from Tailwind breakpoints) at
375px/390px for real tap-target comfort.

## Suggested next phase

Step 03 — Details (per-event team rosters for non-individual events) is
the natural next step, following the same pattern: real styled fields,
validation scoped to what's actually checkable (team size bounds *are* a
structured, sourced fact this time — `event.team.min`/`max` — unlike
Events' eligibility prose, so Details' validation can reasonably be
stricter), and a `NEXT_DISABLED_BY_STEP` or `FORM_ID_BY_STEP` entry
depending on which shape fits. Package (Step 04), Review (Step 05), and
Confirm (Step 06) remain after that, plus Theme and the landing page's
Events teaser.
