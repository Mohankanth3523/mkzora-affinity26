# Phase 16 — Review Your Tale (Step 05): notes for future sessions

Persisted for continuity. See also `README.md` (project status) and
`docs/phase-15-package-step-notes.md`.

## What this phase delivered

- `components/registration/ReviewStep.tsx` (rewritten) — a real,
  read-only recap of the whole registration so far, in exactly the five
  sections the phase brief names: **Traveller** (Step 01), **Events**
  (Step 02), **Team** (Step 03), **Package** (Step 04), **Fees**
  (the pricing calculator). Every section has its own "Edit" button that
  dispatches `SET_STEP` straight back to the step that owns that data —
  the same action `RegistrationNavigation`'s own Back button already
  uses, so jumping back from Review behaves exactly like every other
  wizard navigation, not a special case.
- `components/registration/PricingBreakdown.tsx` (new) — the "Base
  Registration / Food / Accommodation / event fees / Total" panel,
  extracted out of `PackageStep` (its Phase 15 home) so the Review
  step's Fees section shows the *exact same* computation, never a second
  hand-written copy that could drift from it. Gained a `bare` prop this
  phase so Review's `ReviewSection` wrapper can supply the single
  ornamental frame around the whole Fees section, instead of nesting two
  bordered panels inside each other.
- `lib/registration/participantLabels.ts` (new) — `YEAR_OF_STUDY_OPTIONS`/
  `YEAR_OF_STUDY_LABEL`, extracted out of `ParticipantStep` (which now
  imports it) so Review's read-only "Year of Study" line uses the exact
  same six labels the Step 01 `<select>` shows, rather than a second copy
  that could quietly say something different.
- `lib/registration/validation.ts` (edited) — `isReviewStepValid()`, the
  same simple boolean pattern as `isEventsStepValid`/`isPackageStepValid`
  — it checks only the acknowledgement checkbox, since every other field
  was already validated on its own step (see the doc comment on the
  function for why re-validating Participant/Details/Events/Package here
  would be redundant, not extra safety).
- `components/registration/RegistrationNavigation.tsx` (edited) — added
  `review` to `NEXT_DISABLED_BY_STEP`/`NEXT_DISABLED_REASON`, and a new
  `NEXT_LABEL_BY_STEP` map (`review: "Proceed"`) so this one step's
  advance button reads "Proceed" instead of "Next", per the phase brief's
  own named CTA — the button's `aria-label` when disabled was also
  parametrized off the same label instead of hardcoding "Next".

## Truth-mode audit

- **The acknowledgement checkbox's text is verbatim, unedited, from the
  phase brief**: *"I confirm that the information provided is correct
  and that I have read and agree to the AFFINITY '26 terms and
  conditions."* Nothing was added to it and nothing was paraphrased.
- **"Use the official terms where applicable. Do not create additional
  legal claims."** is implemented by reusing `data/rules.ts`'s
  `termsAndConditions` — the same centralized, sourced 17-clause list
  the (still Phase-02-placeholder) Rules page reads — inside a
  `<details>` disclosure right above the checkbox, rather than writing
  any new legal copy for this screen. That array already carries its own
  inline note on item 1 flagging the three-way refund-policy conflict
  (docs/affinity-content-truth.md §14(a)) — reusing the array means that
  caveat travels with it here too, unedited.
- **The Fees section's total is not computed independently.** It's the
  exact same `state.pricing` object every other part of the app reads
  (the sidebar, `PackageStep`) — Review adds no new arithmetic, so there
  is no way for this screen to show a different number than what the
  participant already saw on Step 04, including the Phase 15 Chess-only
  fix and the `[VERIFY WITH ORGANIZER]`-tagged assumptions.
- **The Team section states "Captain: —" rather than inventing a
  placeholder name** when `captainId` doesn't resolve to a real member
  (shouldn't happen given Phase 14's reducer-level cleanup, but the UI
  doesn't assume it can't) — same honesty rule the rest of the project
  applies to any missing fact.

## Decisions worth knowing about

- **"Team" (not "Details") is the section name**, matching the phase
  brief's own naming exactly, even though it edits back to the
  `"details"` step and reuses none of `DetailsStep`'s own component code
  — Review only reads the already-stored `teamName`/`captainId`/
  `teamMembers` off each selection, it doesn't re-render the roster
  editor.
- **Every one of the five sections shares one `ReviewSection` wrapper**
  (title + Edit button + one `OrnamentalFrame`), including Fees — which
  is why `PricingBreakdown` needed its new `bare` prop this phase.
  Keeping all five visually identical (one frame, one header row) was
  judged more important than preserving `PricingBreakdown`'s own
  self-contained "Price Breakdown" heading inside a doubly-nested frame.
- **The terms disclosure is a native `<details>`/`<summary>`, not a
  custom accordion.** Keyboard/screen-reader behavior comes for free,
  and it stays closed by default so Review's own five sections are what
  a returning participant sees first — the full 17-clause list is one
  click away, not competing for the same screen space.
- **"Edit" buttons dispatch `SET_STEP` directly, not `router.push`.**
  The wizard's step is already client-side state (`RegistrationLayout`
  never changes route for any of the six steps), so this matches how
  `RegistrationProgress`'s own step circles and `RegistrationNavigation`'s
  Back button already navigate — one consistent mechanism, not a second
  one introduced just for this screen.
- **`isReviewStepValid` deliberately does *not* re-check Participant/
  Details/Events/Package.** A participant can only reach Review through
  the wizard's own "Next" flow after already passing each of those
  step's own gates — or by jumping directly via the freely-clickable
  `RegistrationProgress` step indicator (a Phase 11 decision, unchanged),
  in which case each of those steps' own "Next" gate still enforces
  itself independently the moment they try to leave it. `ConfirmStep`
  (Phase 02, still a placeholder) already has its own defensive
  `!state.review.acceptedTerms` check for exactly this
  jump-via-the-indicator case — left untouched this phase, since Step 06
  itself is out of scope.

## Still-open limitation (unchanged since Phase 02)

Same npm-registry-unreachable constraint as every prior phase. Verified
this phase with the same method as always: strict `tsc --noEmit` over the
pure-logic file set (zero errors — the new `participantLabels.ts` and
`validation.ts`'s `isReviewStepValid` both join this pass; `data/rules.ts`
was also added to the explicitly-checked file list, since `ReviewStep.tsx`
now imports it), esbuild syntax-check (zero errors, 66 `.ts`/`.tsx` files,
up from 64 — the two new files, `participantLabels.ts` and
`PricingBreakdown.tsx`), and a script confirming all 144 `@/...` imports
resolve (up from 130 — `ReviewStep.tsx`'s full rewrite and the two new
files account for the jump). **Not yet seen in a real browser.** This
phase's highest-risk surface: whether the five sections' "Edit" buttons
actually land on the right step and restore expected focus, whether the
terms `<details>` disclosure renders and toggles correctly, and whether
the Fees section's numbers visually match Step 04's exactly (they read
the same `state.pricing` object, so this should be a rendering check, not
a math one) — plus a full click-through of "fill every step, jump back
via an Edit button, change something, return to Review, confirm the
recap updated."

## Suggested next phase

Step 06 — Confirm is the natural next step: currently a Phase 02
placeholder that already gates on `state.review.acceptedTerms` and
already produces a mock registration record via `CONFIRM_REGISTRATION`
— it needs its own real visual treatment (the "Frontend Demo / Payment
Integration Pending" framing) and to route into the success/pass screen
concept the project brief describes. Rules, Success/pass, and Contact
pages remain their own future phases, plus Theme and the landing page's
Events teaser.
