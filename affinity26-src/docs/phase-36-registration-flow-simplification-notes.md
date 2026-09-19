# Phase 36 — Registration flow simplification: notes for future sessions

Persisted for continuity. This phase removed the wizard's team-roster
step and replaced fantasy/travel wording throughout the registration UX
with plain college-event language, per a detailed user specification. No
unrelated section was touched.

## The core rule

AFFINITY '26 is a COLLEGE MEDICAL FEST registration website. Every
participant registers **individually** — ONE STUDENT = ONE REGISTRATION.
Each submits their own name, college, year of study, phone, email,
selected events, and package. The wizard never collects a full team
roster, even for team/duo/squad events: a participant can still select
one of those events exactly like an individual one, but this frontend
does not ask who else is on the team, does not collect a team name, and
does not ask for a captain. The organizer manages actual team composition
separately, outside this frontend.

Old data model (removed entirely):

```
Registration → Team → Team Members
```

New data model:

```
Registration → Participant → Selected Events → Package
```

## What was removed

- **The "Details" step** (`components/registration/DetailsStep.tsx`,
  Phase 14) — deleted outright. It used to sit between Events and
  Package and collect, per selected team/duo/squad event: a team name,
  a captain (chosen from the roster), and an add/remove list of named
  members with min/max validation sourced from the event's own
  `team.min`/`team.max`.
- **The backing data model**, from `types/registration.ts`:
  - `TeamMember` interface — gone.
  - `EventSelection.teamMembers` / `.teamName` / `.captainId` — gone.
    `EventSelection` is now just `{ eventId: string }`.
  - `RegistrationState.teamDetails` (the `Record<string, TeamMember[]>`
    convenience lookup) — gone.
  - `"details"` — removed from `REGISTRATION_STEPS` and `STEP_META`.
- **The reducer actions** `SET_TEAM_MEMBERS`, `SET_TEAM_NAME`,
  `SET_CAPTAIN` — removed from `RegistrationAction` and
  `registrationReducer` (`lib/registration/state.ts`). `SELECT_EVENT`
  now creates a plain `{ eventId }` selection instead of one carrying an
  empty roster/team-name/captain triple.
- **The validation functions** `validateTeamSelection`,
  `isTeamSelectionValid`, `isDetailsStepValid`, and the
  `TeamSelectionErrors` interface — removed from
  `lib/registration/validation.ts`. `isEventsStepValid` is unchanged (and
  was already type-agnostic — "at least one event selected," full stop).
- **The Review step's "Team" section** (`ReviewStep.tsx`) — removed along
  with the `teamEntries` filter that fed it. Review now has four
  sections: Participant, Events, Package, Total (previously five:
  Traveller, Events, Team, Package, Fees).

### What was *not* touched

`AffinityEvent.team` (`TeamComposition` — `min`/`max`/`perCollegeLimit`/
`notes`, sourced from the official brochure) is still on the event data
model and still displayed informationally in `EventDetailsModal` (e.g.
"Team size: 7–12"). That field describes the *official* team-composition
rule for an event; it was never the thing being removed. What was
removed is this wizard's own invented mechanism for *collecting* a named
roster against that rule — a mechanism that was never itself a sourced
requirement (see `docs/affinity-content-truth.md`: no section states a
"team name" or "captain" must be submitted at registration).

`lib/registration/pricing.ts` needed no change at all. Phase 31 already
made `calculatePricing` return exactly the selected package's own price,
independent of which or how many events (individual or team-type) are
selected — confirmed unchanged by re-reading the file and by a runtime
`tsx` trace (see Verification below), not just assumed.

## The new step flow

`REGISTRATION_STEPS` (`types/registration.ts`) is now five entries,
renumbered 01–05:

| # | id | Label | Description shown under the step heading |
|---|---|---|---|
| 01 | `participant` | Participant | "Enter your details to begin your AFFINITY '26 registration." |
| 02 | `events` | Events | "Choose the events you wish to participate in." |
| 03 | `package` | Package | "Select your AFFINITY '26 registration package." |
| 04 | `review` | Review | "Check every detail before proceeding to payment." |
| 05 | `confirm` | **Payment** | "Frontend demo — payment integration pending." |

The internal step id for the last step stays `"confirm"` (renaming it
would have touched the reducer's `CONFIRM_REGISTRATION` action,
`ConfirmationDetails`, `PaymentStatus`, and every dispatch site for no
user-visible benefit — the id is never shown, only `STEP_META.label` is,
and that's now "Payment") — but its `STEP_META.label` changed from
"Confirm" to "Payment," matching what that step's component
(`ConfirmStep.tsx`) already does: show the amount, then a "Demo Payment —
Frontend Only" screen with a simulated-success button. "Registration
Complete" — the sixth step in the user's own numbering — is the separate
`/success` route (`RegistrationPass.tsx`), exactly as it was before this
phase; it was never one of `REGISTRATION_STEPS` either, so nothing
changed about how it's reached.

`RegistrationStep.tsx`'s "Step N of 06" caption was hardcoded to the old
six-step count; it now reads `REGISTRATION_STEPS.length` and zero-pads it
(`STEP_COUNT_LABEL`), so it can never drift out of sync with the actual
step count again.

## Wording replaced

Every fantasy/travel term the phase brief named was searched for
project-wide and replaced in the registration wizard and the Rules page
title (the one non-wizard page the brief explicitly named with an exact
old→new mapping). Marketing copy on the public homepage/events pages
(Hero's tagline, the Gallery section's heading, the public Events
Explorer's teaser line) was deliberately left as-is — that's sanctioned
"design copy" under the project's own top-level brief, and this phase's
brief scoped the wording change to "participant-facing registration UI
copy," which those pages aren't part of.

| File | Old | New |
|---|---|---|
| `ParticipantStep.tsx` | "The Traveller" / "Every tale begins with a name." | "Participant Details" / "Enter your details to begin your AFFINITY '26 registration." |
| `EventsStep.tsx` | "Choose Your Tales" / "Sports, culturals, and courts beyond — enter as many as your story allows." | "Select Events" / "Choose the events you wish to participate in." |
| `EventsStep.tsx` | "Your Chosen Tales (N)" | "Selected Events (N)" |
| `EventsStep.tsx` | "No tales chosen yet — select from the courts below." | "No events selected yet — choose from the events below." |
| `EventsStep.tsx` | "No arenas match your search." | "No events match your search." |
| `PackageStep.tsx` | "Choose Your Experience" / "Three paths through the palace — registration, and how far its hospitality extends." | "Select Registration Package" / "Choose the package that best fits your AFFINITY '26 registration." |
| `ReviewStep.tsx` | "Review Your Tale" / "Every page of the registry, laid open before the final seal." | "Review Registration" / "Check every detail before proceeding to payment." |
| `ReviewStep.tsx` | Section titled "Traveller" | Section titled "Participant" |
| `ReviewStep.tsx` | Section titled "Fees" | Section titled "Total" |
| `ConfirmStep.tsx` | "The Final Seal" / "One gesture stands between you and the gates of AFFINITY '26." | "Payment" / "Complete your AFFINITY '26 registration payment." |
| `RegistrationLayout.tsx` | "The Royal Registry" / "Your tale has begun. Complete it below." | "AFFINITY '26 Registration" / "Complete your registration below." |
| `RegistrationSummary.tsx` | "Your Registry" | "Registration Summary" |
| `RegistrationPass.tsx` (success page) | "Your Tale Has Begun" / "A demo copy of your registration pass — carry it, print it, or save it below." | "Registration Successful" / "Your AFFINITY '26 registration has been recorded. This is a demo pass — carry it, print it, or save it below." |
| `RegistrationPass.tsx` | "Loading your registry…" | "Loading your registration…" |
| `app/rules/page.tsx` (title + heading) | "Laws of the Realm" | "Event Rules & Guidelines" |

The Arabian Nights *visual* system — palette, ornamental borders,
typography, lanterns/crescents/geometric motifs, `OrnamentalFrame`'s own
"royal registry" *aesthetic* (a design-system doc comment describing a
visual feel, not participant-facing copy) — was left untouched, per the
brief's own explicit instruction to keep the theme and change only the
words.

## Sidebar / review summary

`RegistrationSummary.tsx`'s fields were already exactly what the brief
asked for — Participant, College, Events (N), Package, Estimated Total —
so only its heading changed. No team/company/companion fields existed
there to remove.

## Testing

Ran the full 24-step flow described in the brief as a code trace plus a
`tsx`-executed runtime simulation (not a real browser — this sandbox has
no `next dev`):

- Selected a real team-type `"standard"` event (Cricket, `type: "team"`)
  the same way `EventsStep`'s `onToggleSelect` does — confirmed the
  resulting `selectedEvents` entry is exactly `{ eventId: "cricket" }`,
  with no team-member prompt anywhere in the reducer or validation path.
- Confirmed `RegistrationState` has no `teamDetails` key at all
  (`Object.prototype.hasOwnProperty` check).
- Walked Participant → Events → Package → Review through the reducer and
  the `is*StepValid` functions in sequence, confirming each gate passes
  once its own step's minimum condition is met, exactly as before.
- Confirmed the three package totals (₹480 / ₹1,100 / ₹1,500) are
  unaffected by which event type is selected — `SET_PACKAGE` with
  `"registration-food"` produced `total: 1100` regardless of the
  team-type event selected in the prior step.
- Confirmed `REGISTRATION_STEPS` and `STEP_META` match the brief's
  numbering and labels exactly (table above).

Not verified: this sandbox cannot run `next dev`, so real-browser
behavior (focus movement between steps, responsive layout at the
`/register` page's breakpoints, the actual rendered "Step N of 05"
caption) is unverified beyond the code trace and the `esbuild`/`tsc`
passes below. `npm run lint` / `npm run build` still cannot run here —
same limitation as every previous phase (no `node_modules`, no npm
registry access).

## Verification

- Strict `tsc --noEmit` over the pure-logic file list — **29 files**
  (unchanged from Phase 32/35 — `DetailsStep.tsx`, the one file this
  phase deleted, was a `.tsx` component and was never on this list) —
  zero errors.
- `esbuild` syntax-check over every `.ts`/`.tsx` file in the repo —
  **89 files** (down from 90 — this phase deleted exactly one file and
  added none) — zero failures.
- A script confirming every `@/...` import resolves — **174** (down from
  184 — `DetailsStep.tsx` alone carried nine `@/...` imports, and
  `app/register/page.tsx` lost its tenth, the now-removed
  `import { DetailsStep } from "@/components/registration/DetailsStep"`
  line; no new `@/...` import was added) — all resolve.
- Ran the simplified wizard flow through `tsx` directly (not just
  type-checked) — see Testing above.
- Read every edited file in full after editing to confirm JSX tag
  balance and prop correctness by eye, on top of `esbuild`'s own
  (authoritative) JSX parse.
- `npm run lint` / `npm run build` still cannot run in this sandbox — no
  `node_modules`, no npm registry access. Unchanged limitation from every
  previous phase.

## Still-open limitations

- Not verified in a real browser — this sandbox still has no `next dev`/
  `next build`. The renumbered step indicator, the shortened Review
  step's spacing now that the Team section is gone, and focus movement
  between the five steps are unverified against an actual rendered page.
- A participant's browser `localStorage` from before this phase (key
  `affinity26.registration.v1`) may still contain the old five-field
  `EventSelection` shape (`teamMembers`/`teamName`/`captainId`) or a
  `teamDetails` map. `HYDRATE` assigns whatever was stored straight onto
  `RegistrationState` with no runtime shape validation, so an old record
  would carry these extra, now-unused properties forward silently rather
  than erroring — harmless (nothing in the app reads them anymore, and
  `eventId` is still present on every entry), but worth knowing the
  storage key wasn't versioned/migrated as part of this phase.
