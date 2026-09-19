# Phase 10 — Event Details Modal: notes for future sessions

Persisted for continuity. See also `README.md` (project status) and
`docs/phase-09-events-explorer-notes.md`.

## What this phase delivered

Five files, three new:

- `components/events/EventDetailsModal.tsx` (new) — the modal itself.
- `lib/events/eventLabels.ts` (new) — `TYPE_LABEL`/`MODE_LABEL`/
  `formatDay`, shared between `EventCard` and the modal (previously
  `TYPE_LABEL` was a private duplicate inside `EventCard.tsx` alone).
- `components/registration/EventPreselect.tsx` (new) — reads
  `?event=<id>` on `/register` and dispatches the wizard's existing
  `SELECT_EVENT` action once.
- `components/events/EventCard.tsx` (edited) — gained an optional
  `onViewDetails` callback prop and a "View Details" trigger button;
  now imports `TYPE_LABEL` from `lib/events/eventLabels.ts` instead of
  its own local copy.
- `components/events/EventsExplorer.tsx` (edited) — added
  `openEventId` state, a `modalTriggerRef`, and renders
  `EventDetailsModal` when an event is open.
- `app/register/page.tsx` (edited) — mounts `<EventPreselect />` inside
  a `<Suspense>` boundary (required by `useSearchParams()`).
- `tailwind.config.ts` (edited) — two new keyframes/animations,
  `modal-backdrop` (fade) and `modal-panel` (fade + rise), for the
  modal's entrance.

## Truth-mode audit

Every modal section reads straight off the `AffinityEvent` object
already sitting in `data/events/*` — nothing new was written to the
data layer this phase. Section-by-section:

- **About** → `event.description`, or the literal placeholder.
- **Eligibility** → `event.eligibility`, or the placeholder, plus a
  static link to `/rules` for the category-wide general eligibility
  that lives in `data/rules.ts`. Deliberately *not* auto-merged into
  this section — see "Decisions" below for why.
- **Format** → `event.mode` and `event.type` (both fully-typed,
  already-sourced fields) plus `event.day` when present. Nothing here
  is free text pulled from anywhere else.
- **Team Size** → `event.team` (min/max/perCollegeLimit/notes) when
  present; `"Individual entry — no team required."` when the event's
  `type` is `"individual"` and there's no `team` object (true for every
  individual event checked); the placeholder otherwise.
- **Rules** → `event.rules` bullets, or the placeholder.
- **Prizes** → `event.prize` tiers, each rendered as `label (group):
  ₹amount` or `"Amount not stated"` when a tier's `amount` is `null`
  (the type technically allows this even though no current record uses
  it — handled rather than assumed away).
- **Contact** → `event.contact`, phone numbers rendered as `tel:`
  links (a genuine usefulness add, not a new fact — the number itself
  is unchanged, just made tappable).
- **Verification note**: for any event whose `verificationStatus` isn't
  `"confirmed"`, the modal shows the `EventBadge` (as cards already do)
  *and*, new this phase, the full `verificationNotes` string — the
  card's badge alone doesn't have room for the explanation; the modal
  does.

"Unknown information should show 'Details to be announced' or be
omitted" (the phase's own instruction) was applied per-field rather
than per-section: a genuinely absent fact ("Details to be announced.")
and a genuinely *inapplicable* one (Format's Day line when an event
simply has no day — most events) are different things, so only the
latter is omitted outright; everything else that's merely unstated gets
the placeholder text, never silence.

## Decisions worth knowing about

- **Eligibility isn't auto-merged with the category-wide general
  rules.** `data/rules.ts` has `sportsGeneralRules`/
  `culturalsGeneralRules` — full lists of ~10-17 bullets each covering
  far more than eligibility (referee-decision-final, smoking policy,
  disqualification, etc.). Auto-classifying which of those lines are
  "eligibility" versus "general conduct rules" would be an error-prone
  text-classification task, not a straightforward field display — and
  online-cultural/online-esports events aren't clearly covered by
  either general-rules section in the source material at all, so
  guessing which one (if any) applies to them risked misattributing a
  rule to a category it was never verified against. A plain link to
  `/rules` sidesteps all of that without inventing or mis-merging
  anything.
- **The focus-trap/Escape/scroll-lock implementation is a direct reuse
  of `Navbar`'s mobile-overlay pattern** (Phase 05), not a new
  mechanism — same `querySelectorAll('a[href], button:not([disabled])')`
  Tab-cycling approach, same "focus the close button on open, return
  focus to the trigger on close" shape. Phase 05's own notes describe a
  real bug that pattern caught and fixed (an overlay with no *visible*
  close control); reusing the proven shape here rather than
  reinventing it avoids re-introducing that class of bug.
- **"Outside click" uses a separate backdrop element**, not an
  `event.target === event.currentTarget` check on a single wrapping
  div. The backdrop (`absolute inset-0`) and the panel (`relative z-10`)
  are siblings; a click on the panel simply never reaches the
  backdrop's own `onClick`. This is harder to get wrong than bubbling
  logic, especially once the panel's own content has nested clickable
  elements (links, the close button, the Register CTA).
- **Mobile bottom-sheet vs. desktop centered dialog is pure responsive
  CSS**, not a JS media-query branch: `items-end` (pinned to the
  bottom, full width) below `sm`, `sm:items-center sm:max-w-xl` above
  it. One set of markup, two presentations.
- **The entrance animation is new, not reused Hero-reveal.** Hero's
  `hero-reveal` keyframe is one shared animation at different delays;
  the modal needs the backdrop to only fade while the panel also
  rises, which is different enough motion that forcing them to share
  one keyframe would mean either the backdrop rising too (wrong) or
  the panel not rising (loses the "sheet" feel on mobile) — so two
  small new keyframes (`modal-backdrop`, `modal-panel`) were added
  instead. Both are ordinary Tailwind `animation-*` declarations, so
  they're automatically covered by the existing global
  `prefers-reduced-motion` rule (`app/globals.css`) with no new
  reduced-motion logic needed.
- **The query-param handoff (`/register?event=<id>`) is the only
  connection between the Events Explorer and the registration
  wizard.** They're genuinely separate React trees — `RegistrationProvider`
  only wraps `/register` (see `app/register/layout.tsx`) — so there's
  no shared context to dispatch `SELECT_EVENT` into from `/events`
  directly. `EventPreselect` reads the param once (guarded by a
  `useRef`, not just checked-and-skipped, so it can't re-fire and
  re-add the event if the param is still in the URL on a later
  re-render), validates the id against `getEventById` before
  dispatching (an unknown/malformed id is silently ignored rather than
  creating a phantom selection the pricing calculator has no real data
  for), and never overwrites or resets anything else already in the
  wizard's state — an in-progress registration with other events
  already selected, or participant details already filled in, is left
  exactly as it was.
- **No forced step-jump.** Clicking "Register for This Event" lands on
  `/register` at its normal first step (Participant), not directly on
  the Events step, even though the event is already pre-selected by
  the time the user gets there. The six-step order (Participant →
  Events → ...) is the project brief's own fixed sequence; skipping
  ahead to Events would mean collecting event selection before
  participant identity, which the brief's step order doesn't support.
- **`EventCard` still isn't a client component.** `onViewDetails` is a
  plain callback prop; the button's own `onClick` handler lives inside
  `EventCard` and simply calls it. No hook was added to the file, so
  the "reusable in a future Server Component context" property from
  Phase 09's notes still holds.

## Still-open limitation (unchanged since Phase 02)

Same npm-registry-unreachable constraint as every prior phase. Verified
this phase with the same method as always: strict `tsc --noEmit` (zero
errors — `lib/events/eventLabels.ts` joins the pure-logic pass this
phase), esbuild syntax-check (zero errors, all 56 `.ts`/`.tsx` files in
the project, up from 53 in Phase 09), and a script confirming all 94
`@/...` imports resolve (up from 85). **The modal has not been seen in
a real browser.** This is the phase where that matters most so far:
the focus trap, the backdrop click, Escape, the mobile bottom-sheet
transform, and the query-param handoff to `/register` are all
interaction-heavy behavior that static analysis can confirm is
*wired correctly* but can't confirm *feels right* — that needs
`npm run dev` and an actual click-through (open a card → close via ×,
Escape, and backdrop click, each restoring focus to the same "View
Details" button → open a card → click Register → land on `/register`
with that event pre-checked on the Events step).

## Suggested next phase

Two natural candidates remain, both explicit primary-goal items not
yet started: the registration wizard's own visual treatment (it's
still Phase 02's plain unstyled form fields end-to-end, despite already
being functionally wired to a real reducer/pricing calculator), and
Theme — the one remaining Phase 02 placeholder section on the landing
page itself, between Story and Cause.
