# Phase 11 — Registration System UI: notes for future sessions

Persisted for continuity. See also `README.md` (project status) and
`docs/phase-10-event-details-modal-notes.md`.

## What this phase delivered

Five new reusable components plus the wiring to use them, one deleted
file, one docs deliverable:

- `components/registration/RegistrationLayout.tsx` (new) — the outer
  shell for `/register`: heading, a `progress` slot, then a responsive
  two-column body (`children` + `summary`) that stacks on mobile.
- `components/registration/RegistrationProgress.tsx` (new) — the
  six-step numbered-circle indicator, self-contained via
  `useRegistration()`.
- `components/registration/RegistrationStep.tsx` (new) — wraps whichever
  step is active in an `OrnamentalFrame` with a header (step number,
  label, description) driven by a new `STEP_META` record.
- `components/registration/RegistrationSummary.tsx` (new) — the sidebar
  running-snapshot (participant name, selected events, package, estimated
  total).
- `components/registration/RegistrationNavigation.tsx` (new) — Back/Next,
  built from `SecondaryButton`/`GoldButton`.
- `types/registration.ts` (edited) — added `StepMeta` and the
  `STEP_META: Record<RegistrationStep, StepMeta>` record the above
  components read from.
- `app/register/page.tsx` (rewritten) — composes the five new components
  around the six existing step components, which are **unchanged**.
- `components/registration/WizardNav.tsx` (deleted) — its two
  responsibilities (step indicator, Back/Next) are now
  `RegistrationProgress` and `RegistrationNavigation`; confirmed no other
  file imported it before deleting.
- `docs/backend-integration-map.md` (new) — the phase brief's "make the
  system easy to connect to a future API" requirement, satisfied as a
  documentation deliverable rather than new code (see "Decisions" below).

## Truth-mode audit

Nothing in this phase touches sourced fact at all — it's pure UI
architecture around state that Phase 02 already computes correctly
(participant data, event selections, pricing, confirmation). The only
copy this phase introduces is generic wizard chrome ("Step 01 of 06",
step labels/descriptions, "Your Registry", "Estimate — subject to
organizer confirmation") — none of it states an event name, fee, prize,
deadline, or contact. `RegistrationSummary`'s pricing total reads
straight from `state.pricing.total`/`state.pricing.isEstimate`, which
`lib/registration/pricing.ts` already computes with the correct
truth-mode caveats; this phase doesn't recompute or override any of that,
it only displays it.

## Decisions worth knowing about

- **Step *content* is completely untouched.** `ParticipantStep`,
  `EventsStep`, `DetailsStep`, `PackageStep`, `ReviewStep`, `ConfirmStep`
  are byte-for-byte the same plain Phase 02 forms they were before this
  phase — per the phase brief's explicit "Do not build all step content
  yet." They're rendered inside `RegistrationStep`'s new frame, but
  nothing inside them changed.
- **No step-gating/validation was added.** `RegistrationProgress` keeps
  WizardNav's original behaviour: every step is clickable at any time,
  including ones ahead of the current position, and
  `RegistrationNavigation`'s "Next" is never disabled. The phase brief
  asked for the wizard's *architecture*; adding "you can't advance until
  required fields are filled" rules is a real product decision (what
  counts as required? per-step or only at Review?) that belongs in its
  own deliberate phase, not folded in as a side effect of a layout
  refactor.
- **"Make the system easy to connect to a future API" was answered with
  a doc, not new code** (`docs/backend-integration-map.md`). The
  alternative considered was adding an async `submitRegistration()`
  service function to replace `CONFIRM_REGISTRATION`'s synchronous mock-ID
  generation in `lib/registration/state.ts`. Rejected because there is no
  real endpoint to shape that function's error/retry/loading behaviour
  against yet — a guessed-at async wrapper around a mock would be
  speculative code with nothing to validate it, and risks encoding wrong
  assumptions (timeout length, retry policy) that would need undoing
  later. `lib/registration/state.ts`, `context.tsx`, `storage.ts`, and
  `pricing.ts` are all byte-for-byte unchanged this phase.
- **`RegistrationStep` uses a plain `<h2>` for accessible structure, not
  `aria-labelledby` on `OrnamentalFrame`.** `OrnamentalFrame`
  (`components/design-system/OrnamentalFrame.tsx`) doesn't accept an
  `aria-labelledby` prop — it's a purely visual wrapper (border + corner
  brackets), not a landmark component. Rather than extending it just for
  this one caller, `RegistrationStep` relies on normal document-order
  heading hierarchy: an `<h2>` inside the frame, following the page's
  `<h1>` ("The Royal Registry") in `RegistrationLayout`. A `<section>`
  with no accessible name simply isn't exposed as an ARIA landmark — not
  a regression, just the unadorned default, and screen-reader users still
  get the heading for navigation.
- **`RegistrationSummary` is a client component that duplicates none of
  `RegistrationStep`'s or `RegistrationProgress`'s state reads** — each
  of the three calls its own `useRegistration()`. They could in principle
  share one read via prop drilling from `app/register/page.tsx`, but
  since `useRegistration()` is already a plain context read (no data
  fetching, no cost to calling it more than once) keeping each component
  self-contained was judged more valuable: any of the five new components
  can be reused or reordered independently without `page.tsx` having to
  route state through props it doesn't otherwise need.
- **`RegistrationLayout` itself has no `useRegistration()` call and isn't
  a client component.** It only arranges `progress`/`summary`/`children`
  — all three already-built `ReactNode`s passed in from `page.tsx`. This
  keeps it reusable even for a hypothetical second entry point into the
  same visual shell.
- **Package label lookup duplicates a small `PACKAGES.find(...)` in
  `RegistrationSummary`** rather than adding a `getPackageById` helper to
  `data/pricing.ts`. `PACKAGES` only has three entries and this is the
  only place doing the lookup; a whole new exported helper for a
  three-item array felt like more surface area than the one call site
  justified. Worth revisiting if a second call site appears.
- **Mobile stacking needs no reordering classes.** `RegistrationLayout`
  puts `children` (step content + nav) before `summary` in plain DOM
  order, and only adds `lg:grid-cols-[1fr_320px]` at the `lg` breakpoint
  — below that it's already a single stacked column with the summary
  naturally after the step content, which is the order a mobile user
  would want (fill in the step, then see the running total change) more
  than the reverse.

## Still-open limitation (unchanged since Phase 02)

Same npm-registry-unreachable constraint as every prior phase. Verified
this phase with the same method as always: strict `tsc --noEmit` over the
pure-logic file set (zero errors — `types/registration.ts`'s new
`STEP_META` record type-checks cleanly against `RegistrationStep`),
esbuild syntax-check (zero errors, all 61 `.ts`/`.tsx` files in the
project, up from 56 in Phase 10), and a script confirming all 109 `@/...`
imports resolve (up from 94). **None of the five new components have been
seen in a real browser.** The step-indicator's responsive label
truncation (`hidden ... sm:block` on the step name below each circle),
the sidebar's `lg:sticky` behaviour, and the mobile single-column stack
are all things static analysis can confirm are *wired correctly* but
can't confirm *feel right* — that needs `npm run dev` and a real
click-through across at least one narrow (375px) and one wide (1280px+)
viewport.

## Suggested next phase

Two natural candidates: styling the six step components themselves (they
are still Phase 02's plain unstyled `<fieldset>`/`<input>` markup, now
sitting inside a premium frame that makes the contrast more obvious), and
Theme — the one remaining Phase 02 placeholder section on the landing
page, between Story and Cause. Step-gating/validation (see "Decisions"
above) is a third candidate once the product question of what should
block advancing is actually decided.
