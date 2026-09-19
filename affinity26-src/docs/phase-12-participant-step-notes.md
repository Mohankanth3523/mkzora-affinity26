# Phase 12 — Participant Information (Step 01): notes for future sessions

Persisted for continuity. See also `README.md` (project status) and
`docs/phase-11-registration-architecture-notes.md`.

## What this phase delivered

- `components/registration/ParticipantStep.tsx` (rewritten) — real,
  styled, validated fields inside a `<form id="participant-form">`, under
  the heading "The Traveller".
- `lib/registration/validation.ts` (new) — `validateParticipant()` /
  `isParticipantValid()`, pure functions, no React/DOM.
- `data/registrationVerification.ts` (new) — `pgEligibilityConflict`, a
  wizard-level verification flag (same shape as an event's
  `verificationStatus`/`verificationNotes`, one level up).
- `components/registration/RegistrationNavigation.tsx` (edited) — "Next"
  is now associated with `participant-form` via the native HTML `form`
  attribute when on the Participant step, so a failed validation blocks
  advancing; every other step is unchanged from Phase 11 (immediate
  advance on click, no gating).
- `components/design-system/GoldButton.tsx` (edited) — added an optional
  `form?: string` prop, passed straight through to the underlying
  `<button>`. The only change to this file; `SecondaryButton` was left
  alone since "Back" never needs form association.
- `styles/tokens.ts` / `tailwind.config.ts` / `docs/design-system-accessibility.md`
  (edited) — added `errorRose` (`#E8735A`), the palette's first semantic
  error color (see "Decisions" below for why one was needed).

## Truth-mode audit

- **The five fields themselves** (Full Name, College Name, Year of Study,
  Phone, Email) are unchanged from Phase 02/11 — they already matched
  `docs/affinity-content-truth.md` §4's registration form exactly, and
  this phase didn't add, remove, or rename any of them.
- **Year-of-study options** are the same six values as before
  (1st/2nd/3rd/4th Year, Intern, PG) — still sourced from the same
  original registration-form document, still including "PG" because it
  genuinely is a selectable option there, per the brief's "Year options
  must follow the official materials."
- **The PG eligibility conflict is not resolved by this phase, on
  purpose.** `docs/affinity-content-truth.md` §9/§14(b): the registration
  form lists "PG" as selectable, but culturals allow no PG at all and
  most sports don't either (only Football/Futsal name a limited
  allowance) — and nothing in the source material says whether the
  form's "PG" option is meant only for the sports that allow it, or is a
  stale/generic field. This phase's brief said explicitly: "do not
  silently resolve it… mark it for organizer verification in the data
  model." That's `data/registrationVerification.ts`'s
  `pgEligibilityConflict` — previously this was only a code comment in
  `ParticipantStep.tsx`; now it's a typed, structured flag (same
  `VerificationStatus` union events already use) that the UI actually
  renders: selecting "PG" reveals a callout using the **existing**
  `EventBadge variant="verification"` component (unchanged, just reused)
  plus the flag's `summary` text, styled identically to
  `EventDetailsModal`'s own verification-note block
  (`border border-warm-gold/50 px-4 py-3`) for visual consistency. Not a
  blocking error — a participant selecting "PG" isn't necessarily doing
  anything wrong, since some sports do allow it — just a visible flag
  that this reading hasn't been organizer-confirmed, exactly per the
  brief.
- **Everything else new this phase is deliberately *not* a sourced
  fact.** The validation rules (required-ness, length limits, the Indian-
  mobile-number and email shapes) are ordinary frontend UX judgment
  calls — nowhere does the brochure specify "names must be 2–80
  characters" or "phone numbers must match `[6-9]\d{9}`". These are
  documented as such directly in `lib/registration/validation.ts`'s file
  comment, so a future session doesn't mistake them for something that
  needs a brochure citation.

## Decisions worth knowing about

- **"Next" gating is now real, but scoped to exactly one step.** Phase 11
  explicitly left step-gating as "a future phase to decide" — this is
  that future phase, but only for Participant, because that's the one
  step this phase's brief actually specified validation for. The
  mechanism (`FORM_ID_BY_STEP` in `RegistrationNavigation.tsx`) is
  additive and opt-in per step: a step with no entry in that map still
  behaves exactly as Phase 11 left it (immediate advance, no gating).
  Extending validation to Events/Details/Package/Review in a future phase
  means adding their own `<form id="...">` + `onSubmit` and one more map
  entry — not touching this step's code.
- **Why the native `form` attribute, not lifted state.** `RegistrationNavigation`
  and `ParticipantStep` are siblings rendered from `app/register/page.tsx` —
  neither is the other's parent, and Phase 11 deliberately kept
  `RegistrationLayout` free of any `useRegistration()` call so it could
  stay a dumb slot-based shell. Rather than threading a "can this step
  advance" callback up through `page.tsx` and back down (which would
  couple the generic layout to step-specific validation logic), the
  standard HTML mechanism for "a submit button outside its form" —
  `<button type="submit" form="participant-form">` — does the job
  natively, keeping `RegistrationLayout`/`RegistrationStep` completely
  unaware that Participant has validation at all.
- **Errors are shown once a field is touched (blur) or once a submit was
  attempted and failed** — never on first render. `attempted` and
  `touched` are local `useState` in `ParticipantStep`, not part of
  `RegistrationState` — they're ephemeral UI-only concerns (whether an
  error message is currently visible), not data that needs to survive a
  refresh or a step round-trip the way the field *values* do. The field
  values themselves were never at risk — they've lived in
  `RegistrationState.participant` since Phase 02 and are already
  localStorage-persisted; nothing about this phase touches that.
- **Focus handling only fires on a failed submit attempt**, moving focus
  to the first invalid field in form order (Name → College → Year →
  Phone → Email), not on every keystroke or blur — repeatedly stealing
  focus while someone is still typing would be actively hostile to
  screen-reader and keyboard users, not helpful.
- **A new palette color (`errorRose`) was necessary, not a styling
  preference.** The brief's eight-color palette has no red/error color at
  all, and the one red-family color it does have — `burgundy` — already
  fails AA badly as *text* on the dark backgrounds this form sits on
  (1.20:1 against midnight; `burgundy` is fill-only per
  `docs/design-system-accessibility.md`). Introducing a plain saturated
  red would also have clashed with the Arabian Nights warm palette, so a
  warm terracotta/rose was chosen and its contrast was computed (not
  eyeballed) before use — 6.60:1 on midnight, 6.02:1 on royalNavy, both
  comfortably AA — following the same verify-before-shipping discipline
  every prior color decision in this project used.
- **The PG conflict callout reuses `EventBadge` rather than inventing a
  new "flag" component.** `EventBadge`'s `variant="verification"` was
  already built (Phase 03) exactly for "a fact's uncertainty is meant to
  be visible to a site visitor, not just left in code comments" (its own
  doc comment) — extending that to a wizard-level flag instead of only
  an event-level one is exactly the kind of reuse the brief's "reuse
  existing architecture" principle asks for, not a new pattern.
- **`SecondaryButton` was not given a `form` prop.** Only `GoldButton`
  needed it (Next is the button being form-associated); adding an unused
  prop to `SecondaryButton` "for symmetry" would be speculative surface
  area with no current caller — left out until an actual need appears.

## Still-open limitation (unchanged since Phase 02)

Same npm-registry-unreachable constraint as every prior phase. Verified
this phase with the same method as always: strict `tsc --noEmit` over the
pure-logic file set (zero errors — `lib/registration/validation.ts` and
`data/registrationVerification.ts` both join this pass), esbuild syntax-
check (zero errors, all 63 `.ts`/`.tsx` files, up from 61 in Phase 11),
and a script confirming all 115 `@/...` imports resolve (up from 109).
**The form has not been seen in a real browser.** This phase is
validation- and focus-management-heavy — whether `aria-invalid`/
`aria-describedby` are actually announced correctly by a real screen
reader, whether the native `form`-attribute association across the
`RegistrationStep`/`RegistrationNavigation` boundary actually submits on
every browser this project needs to support, and whether the focus jump
on a failed attempt feels right rather than jarring, are all things
static analysis can confirm are *wired correctly* but not that they
*feel right* — that needs `npm run dev` and an actual attempt: submit
empty, see all five errors and focus land on Name; fix fields one at a
time and watch each error clear as its field becomes valid; select "PG"
and confirm the conflict callout appears/disappears correctly; submit
valid data and confirm it lands on the Events step with participant data
intact.

## Suggested next phase

The next wizard step (Events — Step 02) is the natural continuation,
following the same pattern this phase established: a step calls
`validateParticipant`-style rules for its own data (event selection has
no "required" concept the way text fields do, so its validation shape
will look different — maybe just "at least one event selected"), and
`FORM_ID_BY_STEP` gets one more entry when it does. Styling the remaining
four step components (Details/Package/Review/Confirm) and Theme (the
last Phase 02 landing-page placeholder) remain open too.
