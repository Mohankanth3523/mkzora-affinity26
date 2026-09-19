# Phase 41 — Replace Payment with Confirm Registration + Google Sheets: notes for future sessions

Persisted for continuity. See also `README.md` (project status),
`docs/phase-17-confirm-step-notes.md` and `docs/phase-18-success-page-notes.md`
(both now carry a "Superseded by Phase 41" addendum rather than being
rewritten), `docs/backend-integration-map.md`, and
`docs/google-sheets-setup.md` (the companion setup guide and Apps Script
source this phase's whole design depends on).

## What this phase delivered

AFFINITY '26 does not collect payment online. The wizard's old Step 05
("Payment," a two-local-phase "Demo Payment" simulation, see
`docs/phase-17-confirm-step-notes.md`) is now "Confirm Registration,"
which submits the completed registration to a real, lightweight backend —
a Google Sheet plus a Google Apps Script Web App — instead of simulating
anything.

- **`next.config.mjs`** — added `output: "export"`. The project's real
  deployment target is Cloudflare Pages as a static export (confirmed by
  `docs/phase-28-cinematic-intro-notes.md`), and this was a real gap
  against this phase's own explicit requirement, not an unrelated change —
  the new submission flow had to be verified compatible with a client-only
  static export, and there was no `output` setting at all to verify
  against before this.
- **`lib/registration/submissionConfig.ts`** (new) — the one place
  `NEXT_PUBLIC_REGISTRATION_ENDPOINT` is read from `process.env`, trimmed,
  exported as `string | null`.
- **`lib/registration/submitRegistration.ts`** (new) — builds the exact
  payload shape the Sheet's 13 columns expect and POSTs it with
  `Content-Type: "text/plain;charset=utf-8"` (see "CORS," below), then
  validates the parsed JSON response with runtime type guards before ever
  treating it as a real registration ID. Returns a discriminated
  `SubmissionResult`: `{ok:true, registrationId, message?}` or
  `{ok:false, reason, message}` with `reason` one of `"not-configured"` /
  `"network"` / `"invalid-response"` / `"server-error"`.
- **`types/registration.ts`** — `PaymentStatus` removed entirely (not
  widened — AFFINITY '26 never had payment to have a status for).
  `ConfirmationDetails` is now `{ registrationId: string; confirmedAt:
  string }` — `registrationId` is only ever set from the Apps Script's own
  response, never generated client-side; `confirmedAt` is a local display
  timestamp for the pass/download only, never treated as the authoritative
  record (the Sheet's own Timestamp column, generated server-side, is
  that). `STEP_META.confirm` relabeled "Payment" → "Confirm," its
  description now "Submit your completed AFFINITY '26 registration."
- **`lib/registration/state.ts`** — `CONFIRM_REGISTRATION` now takes a
  `registrationId: string` payload instead of generating one; the old
  `generateMockRegistrationId()` function is gone. `HYDRATE` gained a
  second sanitization rule (alongside Phase 39's stale-event-id filter):
  a persisted `confirmation` object without a real, non-empty
  `registrationId` string (i.e. the OLD pre-Phase-41 shape,
  `mockRegistrationId`/`generatedAt`/`paymentStatus`) is dropped to `null`
  on hydration, so a leftover pre-Phase-41 `localStorage` record can never
  render a broken-looking pass with an `undefined` ID. Verified at runtime
  with `tsx` — see "Verification" below.
- **`components/registration/ConfirmStep.tsx`** (full rewrite) — "Confirm
  Your Registration" heading; a read-only Registration Summary panel
  (Full Name / College / Year of Study / Phone / Email / Events / Package
  / Registration Amount — reusing `state.pricing.total`, the exact same
  number Review and the sidebar already show); a single "Confirm
  Registration" action with four button-label states (idle → "Confirm
  Registration," submitting → "Submitting Registration…," success →
  "Registration Confirmed," error → "Try Again"); disabled while
  submitting or after success, so a double-click (or a slow network plus
  an impatient second click) can never fire two submissions; on genuine
  failure, an error banner (distinct wording for the "endpoint not
  configured" developer case vs. a real network/server failure) with the
  same button re-attempting the exact same submission, no wizard data
  ever cleared. Defensive re-validation
  (`isParticipantValid`/`isEventsStepValid`/`isPackageStepValid`) runs
  before every submit attempt, for a participant who jumped straight to
  Confirm via the step indicator.
- **`components/registration/RegistrationSummary.tsx`** (sidebar) —
  "Estimated Total" → "Registration Amount" (one label, no logic change).
- **`components/registration/ReviewStep.tsx`** — subtitle "Check every
  detail before proceeding to payment." → "Check every detail before
  confirming your registration."
- **`components/success/RegistrationPass.tsx`** — `PaymentStatus`/
  `PAYMENT_STATUS_LABEL`/the "Payment Status" row removed; a new "Package"
  row added in its place (the brief's own success-screen field list is
  Registration ID / Participant / College / Events / Package / Amount —
  "Package" had never actually been on this screen before). The
  page-level "this is a frontend demo, not a real confirmation" banner and
  the on-card "Demo — Not a Real Pass" badge are both gone — `state.
  confirmation` is now only ever set after a genuinely confirmed Sheets
  submission, so both would have been actively false as of this phase.
  Replaced with one honest sentence: no payment was processed, because
  AFFINITY '26 doesn't collect payment online. **The QR placeholder was
  deliberately left completely untouched** — "Demo QR — verification will
  be connected later" is still accurate, since the QR genuinely still
  encodes and verifies nothing; only the *registration* became real this
  phase, not the check-in/verification system. The downloadable `.html`
  pass (`buildPassHtml`) had the same treatment applied to it — its own
  demo banner/tag removed, a Package row added, filename changed from
  `AFFINITY26-Registration-Pass-DEMO-<id>.html` to
  `AFFINITY26-Registration-Pass-<id>.html`.
- **`app/success/page.tsx`** — `metadata.title` "Registration Pass (Demo)
  — AFFINITY '26" → "Registration Pass — AFFINITY '26".
- **`docs/google-sheets-setup.md`** (new) — the full setup guide (create
  Sheet → "Registrations" worksheet → 13-column header row → Apps Script →
  deploy as Web App → execute as owner → access "Anyone" → copy URL → set
  `NEXT_PUBLIC_REGISTRATION_ENDPOINT`), the complete Apps Script source
  (`doPost`/`doGet`, payload validation, server-side amount
  recomputation, `LockService`-guarded sequential ID generation, the
  duplicate-submission heuristic), the CORS `text/plain` explanation, a
  manual `curl`-based testing walkthrough, and a Security section.
- **`.env.example`** (new) — documents
  `NEXT_PUBLIC_REGISTRATION_ENDPOINT` with an explanation of why it's
  public, not a secret.
- **`docs/backend-integration-map.md`** (updated, both the local file and
  its mirrored copy in the attached claude.ai Project) — "Registration
  submission" is now marked as a real, implemented integration rather
  than a future one; the "Payment" row was removed entirely (not widened)
  since the concept no longer exists in this codebase.
- **`docs/phase-17-confirm-step-notes.md`** and
  **`docs/phase-18-success-page-notes.md`** — each gained a short
  "Superseded by Phase 41" section at the end, per the Phase 33/37
  precedent of annotating rather than rewriting earlier phases' notes.

## Truth-mode audit

- **No invented participant information, college names, event names,
  event contacts, package prices, or registration rules.** Every field in
  the submission payload is read straight from existing, already-sourced
  wizard state (`state.participant`, `getEventById`-resolved event names,
  `state.package.packageId`) — nothing new is collected, and nothing
  collected is embellished.
- **Package prices are unchanged and untouched**: `data/pricing.ts` was
  not edited at all this phase. ₹480/₹1,100/₹1,500 remain exactly what
  they were. The only new thing is `SHEET_PACKAGE_LABEL`
  (`submitRegistration.ts`) — a presentation-layer mapping from
  `PackageId` to the Sheet column's exact expected string ("Registration"
  / "Registration + Food" / "Registration + Food + Accommodation"),
  because the brief's own Sheet-column spec uses slightly different
  wording than the UI's existing "Registration Only" label. The UI label
  itself was not touched anywhere it's displayed.
- **The registration amount sent to the Sheet is never a stale or
  client-trusted number.** `buildPayload()` (`submitRegistration.ts`)
  looks up the amount fresh from `data/pricing.ts` by `packageId` at
  submission time — not from a caller-supplied total — and the Apps
  Script independently recomputes the exact same figure server-side from
  the submitted package name before it's ever written to the Sheet (see
  `docs/google-sheets-setup.md` §5). Two independent, agreeing sources of
  truth for the same three fixed prices.
- **No fake registration ID, ever.** `CONFIRM_REGISTRATION` only
  dispatches with `result.registrationId` after `submitRegistration()`
  returns `ok: true` — there is no client-side ID generator left anywhere
  in this codebase (the old `generateMockRegistrationId()` was deleted,
  not just unused).
- **"Registration Successful" never shows before the Sheet confirms.**
  `ConfirmStep.handleConfirm` only calls `dispatch({type:
  "CONFIRM_REGISTRATION", ...})` and `router.push("/success")` inside the
  `result.ok` branch — a network failure, a server-reported validation
  error, or an unparseable response all fall through to the `error`
  branch instead, leaving `state.confirmation` untouched (still `null`,
  or whatever it was before this attempt).
- **No payment language anywhere in the participant-facing registration
  UI.** Grepped the whole flow (`ConfirmStep.tsx`,
  `RegistrationSummary.tsx`, `ReviewStep.tsx`, `RegistrationPass.tsx`,
  `RegistrationNavigation.tsx`, `RegistrationProgress.tsx`,
  `types/registration.ts`, `lib/registration/state.ts`) for
  `Payment|PAYMENT|Razorpay|Transaction|TRANSACTION` after every edit —
  every remaining match is inside a code comment explaining what was
  *removed* (e.g. "Phase 41 replaced the earlier... 'Payment'... step"),
  never in rendered, participant-facing text. The one legitimate
  exception, confirmed and left untouched: `data/rulesCategories.ts` /
  `app/rules/page.tsx` / `components/rules/RulesContent.tsx`'s "Payment"
  is the official Rules & Regulations page's own category name (refund
  policy, registration-desk payment logistics — sourced content, part of
  the brief's own eleven named rule categories), an entirely different,
  unrelated "Payment" than the registration-flow step this phase
  replaced — not touched, per TRUTH MODE (it's sourced official content,
  not UI copy this phase has any reason to reword) and per "do not make
  unrelated changes."
- **Data privacy** — the submission payload sends exactly what the brief
  lists and nothing more: full name, college name, year of study, phone,
  email, selected event names, event count, package, computed amount,
  and the fixed source string. No password, Aadhaar, PAN, bank, card, or
  UPI field exists anywhere in this wizard to accidentally include.

## Decisions worth knowing about (mine, not the brief's literal spec)

- **Duplicate-submission handling on the Apps Script side returns the
  EXISTING registration's ID as a success response**, rather than
  erroring, for a same-email+phone+package+eventCount submission within a
  2-minute window. This is my own design choice — the brief only asks for
  "a reasonable duplicate check," explicitly warning against assuming two
  same-name/same-college students are duplicates. Reasoning: a
  participant whose connection drops AFTER the Sheet row was actually
  appended but BEFORE the response reached them should, on retry, see
  their own real registration confirmed — not a second row, and not a
  confusing error despite having actually succeeded. Documented as a
  deliberate design choice, not a literal brief requirement, in
  `docs/google-sheets-setup.md`.
- **`ConfirmationDetails.confirmedAt` is a local, client-side display
  timestamp**, not sent anywhere and never treated as authoritative — the
  Sheet's own Timestamp column (Apps Script's `new Date()`, generated
  server-side, per the brief's explicit "never trust a browser-supplied
  timestamp") is the real record. `confirmedAt` exists only so the
  downloaded `.html` pass can show a "Generated <date>" line without a
  network round-trip.
- **The five-step `REGISTRATION_STEPS` structure was kept as-is** (the
  brief explicitly sanctions this: "If the current implementation uses 5
  steps rather than 6... you may use... 05 CONFIRM REGISTRATION and
  transition to a success state after confirmation") — only `STEP_META.
  confirm`'s label/description text changed, no restructuring of the step
  array, `RegistrationProgress`, or `RegistrationNavigation`.
- **The submission's Content-Type is `text/plain`, not `application/
  json`**, deliberately, to avoid a CORS preflight Apps Script can't
  answer — see `submitRegistration.ts`'s own doc comment and
  `docs/google-sheets-setup.md`'s "Why `Content-Type: text/plain`"
  section for the full reasoning. This is the single highest-risk,
  least-verifiable piece of this phase's work (see "Still-open
  limitations" below).
- **A HYDRATE-time sanitization rule was added for stale `confirmation`
  objects** (`lib/registration/state.ts`) — not explicitly asked for by
  the brief, but a direct, small consequence of changing
  `ConfirmationDetails`'s shape: without it, a participant who confirmed
  a registration before this phase shipped would see a broken-looking
  `/success` pass (an `undefined` registration ID, a download filename
  containing the literal word "undefined") rather than the honest "No
  Registration Found" empty state. Same "sanitize a stale persisted shape
  at the one place hydration happens" pattern Phase 39 already
  established for `selectedEvents`.

## Verification

- Strict `tsc --noEmit` over the pure-logic file list — **31 files as of
  Phase 41** (up from 29 — two new files,
  `lib/registration/submissionConfig.ts` and `lib/registration/
  submitRegistration.ts`; `types/registration.ts` and `lib/registration/
  state.ts` were edited in place, both already on the list) — zero
  errors. This sandbox has no `@types/node` (no `node_modules` at all
  exists here), so `submissionConfig.ts`'s `process.env` read needed a
  small ambient `declare const process` shim added only to this
  sandbox's own ad hoc verification tsconfig (`/tmp/tsconfig.verify.json`
  plus a `/tmp/process-env-shim.d.ts` this phase added) — never added to
  the real repo. A real `npm install` provides this for free, the same
  way every Next.js project gets it, transitively through `next` itself.
- `esbuild` syntax-check over every `.ts`/`.tsx` file in the repo — **91
  files** (up from 89 — the same two new files) — zero failures.
- A script confirming every `@/...` import resolves — **184** (up from
  179 — `ConfirmStep.tsx`'s rewrite changed its import set;
  `submitRegistration.ts` imports `PACKAGES` and `submissionConfig.ts`'s
  export; `RegistrationPass.tsx` gained a `PACKAGES` import) — all
  resolve.
- Ran `lib/registration/state.ts`'s `registrationReducer` through `tsx`
  directly (not just type-checked): confirmed `CONFIRM_REGISTRATION` with
  a real `registrationId` payload produces the exact `{registrationId,
  confirmedAt}` shape expected, and that `HYDRATE` both (a) drops a
  simulated OLD-shape `confirmation` object (`mockRegistrationId`/
  `generatedAt`/`paymentStatus`) to `null`, and (b) leaves a genuinely
  valid NEW-shape `confirmation` object untouched.
- Ran `submitRegistration()` through `tsx` with a mocked `globalThis.
  fetch`, covering all five code paths: (1) endpoint unset →
  `not-configured`, correct developer-facing message, no network call
  attempted; (2) a successful `{success:true, registrationId, message}`
  response → `ok:true` with the exact registration ID, and inspected the
  actual `fetch` call made — confirmed `Content-Type:
  "text/plain;charset=utf-8"` and a `body` that JSON-parses to exactly
  the 10-field payload the Sheet's columns expect, with `amount` computed
  correctly from `packageId` (e.g. `"registration-food"` → `1100`,
  independent of what was or wasn't passed in); (3) `fetch` throwing →
  `network` reason, generic retry-safe message; (4) a `{success:false,
  message}` response → `server-error` reason, the server's own message
  surfaced verbatim; (5) a malformed/unexpected JSON shape →
  `invalid-response` reason, generic message, nothing crashes.
- Grepped the full participant-facing registration flow for payment
  language after every edit (see "Truth-mode audit" above) — clean.
- `npm run lint` / `npm run build` still cannot run in this sandbox — no
  `node_modules`, no npm registry access. Unchanged limitation from every
  previous phase.

## Still-open limitations

- **The actual browser ↔ Apps Script round-trip has not been live-tested
  against a real deployed endpoint.** This sandbox has no outbound
  network access to Google's APIs at all — everything in "Verification"
  above tests `submitRegistration.ts`'s own logic against a mocked
  `fetch`, which proves the payload shape, the header, the response
  parsing, and the state transitions are all correct in isolation, but
  cannot prove the `text/plain` CORS workaround actually avoids a
  preflight against a real Google-hosted Apps Script deployment, or that
  `e.postData.contents` + `JSON.parse()` on the Apps Script side actually
  receives what the browser sends. The pattern is standard and
  widely documented, not invented for this phase — but "documented
  elsewhere" and "verified in this deployment" are different claims.
  Whoever deploys this should run `docs/google-sheets-setup.md`'s manual
  `curl` test first, then a real browser test against the actual
  Cloudflare Pages build, before trusting it in production.
- **Not verified in a real browser at all** — same standing sandbox
  limitation as every previous phase (no `next dev`/`next build`). The
  Confirm step's button-state transitions, the error banner's visual
  presentation, and the success → `/success` navigation timing are all
  reasoned through and unit-tested at the logic level, not seen rendered.
- **The Apps Script's duplicate-detection heuristic is untested against
  concurrent real traffic** — `LockService.getScriptLock()` and the
  50-row recent-submissions scan are standard Apps Script patterns, but
  neither has been exercised against genuinely concurrent submissions
  (impossible to simulate meaningfully without a real deployment).
- **`output: "export"` itself is unverified against a real `next build`**
  — this sandbox cannot run one. The config change is small and standard,
  but a real build (per the commands `README.md` already lists under
  "Verification could not be fully automated") is the only way to
  confirm the whole app still produces a valid static `out/` directory
  with this setting on, given how many phases have accumulated since the
  project's last real build.
