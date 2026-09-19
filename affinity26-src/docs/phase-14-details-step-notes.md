# Phase 14 — Assemble Your Company (Step 03): notes for future sessions

Persisted for continuity. See also `README.md` (project status) and
`docs/phase-13-events-step-notes.md`.

## What this phase delivered

- `components/registration/DetailsStep.tsx` (rewritten) — real, validated
  UI: a plain confirmation line per selected individual event, and a full
  roster editor (Team Name, Captain, Team Members with add/remove) per
  selected team/duo/squad event.
- `types/registration.ts` (edited) — `EventSelection` gained `teamName?:
  string` and `captainId?: string | null`.
- `lib/registration/state.ts` (edited) — two new actions, `SET_TEAM_NAME`
  and `SET_CAPTAIN`; `SELECT_EVENT` now initializes both new fields;
  `SET_TEAM_MEMBERS` now clears `captainId` if the captain's own row was
  the one just removed, rather than leaving it pointing at a member that
  no longer exists.
- `lib/registration/validation.ts` (edited) — `validateTeamSelection()`,
  `isTeamSelectionValid()`, `isDetailsStepValid()`.
- `components/registration/RegistrationNavigation.tsx` (edited) — added
  `details: "details-form"` to `FORM_ID_BY_STEP` (the Phase 12 pattern:
  "Next" submits the step's own form, which validates and either advances
  or reveals errors + moves focus to the first invalid field).

## Truth-mode audit

- **Team-size bounds come from exactly one place: `event.team.min`/`.max`
  in `data/events/*`**, unchanged this phase. `validateTeamSelection`
  never falls back to a guessed number when one side is missing — and
  several real events genuinely have no bound at all: **Short Film**
  (`type: "team"`, no `team` field whatsoever — "multiple entries per
  college allowed" but no stated crew-size cap) and **Carrom**
  (`team: { notes: "Any number of teams per college may participate." }`
  — a note about how many *teams* a college may field, not how many
  *people* are on one). Several others state only a `max` with no `min`
  (Volleyball, Basketball, Kabaddi, Football, Throwball, Futsal —
  `team.min` is simply absent, not zero). The phase brief's own "If the
  source does not specify a team size: do not invent it" is implemented
  literally: a missing `min` never produces a lower-bound error, a
  missing `max` never produces an upper-bound error, and when *both* are
  missing, the UI says so outright — "Team size not specified by the
  organizer" — rather than picking a plausible-looking default.
- **The one numeric floor this phase does enforce unconditionally — "add
  at least one team member" — is not a sourced fact and isn't presented
  as one.** It's a basic UX necessity (a team of zero people isn't a
  team, independent of what the brochure states about the upper bound),
  documented as such directly in `validateTeamSelection`'s comment.
- **"Team Name" and "Captain" are this wizard's own fields, not brochure
  facts, and are documented that way** (see the doc comment on
  `EventSelection` in `types/registration.ts`). The closest sourced
  concept is `culturalsGeneralRules`' "Participant name(s) and event
  coordinator name/contact must be provided at registration" — related in
  spirit, but not the same thing, and not stated for sports at all. This
  phase's brief asked explicitly for a "Captain" field for *every* team
  event (sports included), so it's built as a general wizard convention,
  never described in the UI as an official brochure requirement.
- **Duplicate detection is scoped to "within one team's own roster,"
  deliberately not across different teams/events.** Matching is by
  trimmed, lowercased name only — there's no participant ID to match on
  — so cross-event matching would risk false positives for two different
  people who happen to share a common name. Within one roster, a
  duplicate name is unambiguous and worth flagging (almost certainly a
  double-entry mistake); across rosters it would be a guess. This is the
  "where appropriate" the phase brief's "duplicate detection where
  appropriate" bullet leaves room for.

## Decisions worth knowing about

- **Captain is a role within the roster, not a seventh field typed in
  separately.** The brief's "show: Team Name, Captain, Team Members"
  could read either way; a separate captain-name text field would let it
  drift out of sync with the roster (typo the captain's name differently
  in two places, or name someone who isn't actually a listed member).
  Instead, `captainId` points at one `TeamMember.id`, chosen via a native
  `role="radiogroup"` of real `<input type="radio">` controls — one radio
  per member, so "exactly one captain" is enforced by native HTML
  semantics, not custom JS bookkeeping — and a captain is always,
  definitionally, a real member of the team.
- **"Make captain visually distinct" is three redundant signals, not
  one:** the selected row gets a solid gold border + a faint gold tint
  background (not just a text-color change, which would be easy to miss
  at a glance), plus an explicit "Captain" badge with a small hand-drawn
  crown glyph next to their name — so the captain reads clearly whether
  or not someone notices the radio button's own state.
- **A missing captain is a *step-level* error (shown in the section's
  error summary), not attached to any one member's input** — there's no
  single field "the captain error belongs to" the way a member's own name
  error does. Same reasoning applies to the team-size error: `count < min`
  isn't a property of any specific member row, so both live in a
  section-level `role="alert"` box near the top of that event's card,
  while per-member errors (blank name, duplicate name) stay inline under
  the specific input they describe.
- **No per-field blur-triggered error reveal, unlike `ParticipantStep`.**
  Participant has five static fields, so tracking which ones have been
  "touched" is simple and worth the UX payoff of showing an error the
  moment someone tabs away from a bad field. Details has a dynamic number
  of team sections, each with a dynamic number of members that can be
  added and removed at any time — tracking "touched" per dynamically
  created/destroyed member id would need its own cleanup logic for a
  fairly marginal benefit, so this step uses the same simpler pattern
  `EventsStep` already established: nothing shows until a failed "Next"
  attempt, then everything live-updates as it's corrected.
- **Focus-on-failure targets the first meaningfully-focusable thing, not
  always a text input.** Priority order per invalid event: the Team Name
  field if that's what's wrong; otherwise the first member row with an
  error; otherwise (a captain-only or size-only error, neither tied to
  one input) the event's own section container, made programmatically
  focusable via `tabIndex={-1}` specifically so focus has *somewhere*
  sensible to land next to the visible error summary, rather than not
  moving at all.
- **`SET_TEAM_MEMBERS`'s captain-cleanup lives in the reducer, not in
  `DetailsStep`'s `removeMember` handler.** Putting it in the reducer
  means *any* future caller that shrinks a roster (not just this step's
  own remove button) automatically can't leave a dangling `captainId` —
  a correctness guarantee that belongs with the state transition itself,
  not with one particular UI's call site.
- **`RegistrationSummary` (the sidebar) was not updated to show team
  names or captains.** Out of scope for "build STEP 03" — the sidebar
  already shows selected event names and the running price total, which
  remains accurate; enriching it with roster detail can be a small
  follow-up once there's a reason to (e.g. the Review step, Phase 05,
  wanting to display the same information).

## Still-open limitation (unchanged since Phase 02)

Same npm-registry-unreachable constraint as every prior phase. Verified
this phase with the same method as always: strict `tsc --noEmit` over the
pure-logic file set (zero errors — the `EventSelection` type change,
`state.ts`'s two new actions, and `validation.ts`'s three new functions
all join this pass), esbuild syntax-check (zero errors, all 64
`.ts`/`.tsx` files — unchanged from Phase 13's count, since this phase
edited existing files rather than adding new ones), and a script
confirming all 129 `@/...` imports resolve (up from 122). **Not yet seen
in a real browser.** This phase is the most interaction-dense yet —
add/remove member, the captain radio group, size-bound errors recomputing
live as members are added/removed, the section-focus fallback for
captain/size-only errors, and duplicate-name detection all need a real
click-through: pick a fixed-size team event (e.g. Cricket, 15/15) and
confirm the exact "must be exactly 15" wording; pick a no-bound event
(Short Film) and confirm no size error ever appears; try adding two
members with the same name and confirm only the second is flagged;
remove a captain's row and confirm the "Captain" badge disappears and the
section re-flags "Select a team captain" on the next failed attempt.

## Suggested next phase

Step 04 — Package (package selection + the frontend pricing summary) is
the natural next step. Review (Step 05) and Confirm (Step 06) remain
after that, plus Theme and the landing page's Events teaser.
