# Phase 43 — Connect AFFINITY '26 to the deployed Google Sheets endpoint:
notes for future sessions

Persisted for continuity. See also `README.md` (project status),
`docs/phase-41-confirm-registration-google-sheets-notes.md` (built the
Google Sheets + Apps Script backend), and
`docs/phase-42-google-apps-script-setup-notes.md` (concretized the setup
docs for the real Sheet/account).

## What this phase delivered

The organizer deployed the Apps Script Web App (Phase 42's documented
steps) and supplied the real, live Web App URL. This phase connects the
already-built frontend to it.

- `.env.local` (new, gitignored — `.gitignore`'s `.env*.local` rule
  already covered it, no change needed there) — sets
  `NEXT_PUBLIC_REGISTRATION_ENDPOINT` to the real deployed Web App URL.
  This is the **only file this phase created**.

**No frontend `.ts`/`.tsx` file was changed.** `lib/registration/
submitRegistration.ts`, `lib/registration/submissionConfig.ts`, and
`components/registration/ConfirmStep.tsx` were all built in Phase 41
already reading the endpoint from `NEXT_PUBLIC_REGISTRATION_ENDPOINT`
(never hardcoded), already sending the correct payload shape, already
using the `text/plain` CORS workaround, and already gating success
strictly on a parsed `{success: true, registrationId: "..."}` response —
re-reading both files in full against this phase's detailed spec found
no gap, so nothing needed to change. Making an unnecessary edit here
would have gone directly against this phase's own "do not change the
existing UI design unnecessarily" instruction.

## Truth-mode / instruction-compliance audit

- **"Do not claim Google Sheets submission works until it has actually
  been tested."** This sandbox has no outbound network access to
  Google's servers (confirmed again this phase — a direct `curl` to the
  deployed Web App URL was rejected by the sandbox's egress proxy with
  `connect_rejected (organization policy)`, the same restriction
  documented since Phase 41). **This phase did not, and could not,
  perform a real end-to-end submission against the live endpoint.** What
  *was* verified: (1) the pure-logic payload-building and
  response-handling code in `submitRegistration.ts`, executed at actual
  JS runtime (not just type-checked) with a mocked `fetch`, confirmed it
  POSTs to exactly the real deployed URL — read live from
  `NEXT_PUBLIC_REGISTRATION_ENDPOINT`, not a hardcoded string — with the
  correct `Content-Type: text/plain;charset=utf-8` header and a JSON
  body containing every field the Apps Script's own `validatePayload`
  requires (`fullName`, `collegeName`, `yearOfStudy`, `phone`, `email`,
  `selectedEvents`, `eventCount`, `package`); and (2) all three response
  branches (success, server-reported failure, network failure) were
  exercised against mocked responses and produced exactly the
  `SubmissionResult` shape `ConfirmStep.tsx` expects. Neither of these is
  the same claim as "a real submission reached the real Sheet and a row
  appeared" — that step is explicitly left for the organizer to run,
  per their own instruction, using `docs/google-sheets-setup.md`'s
  Testing section or a real local `npm run dev` click-through.
- **"Run npm run lint / npm run build / typecheck if available."** This
  sandbox has no npm registry access (`registry.npmjs.org` returns `403
  host_not_allowed`, unchanged since every earlier phase), so real
  `next lint`/`next build`/a full project `tsc --noEmit` against the
  actual `next`/`react` packages could not be run here — this is the
  same, already-documented sandbox constraint every phase since Phase 02
  has flagged (see `README.md`'s "⚠️ Verification could not be fully
  automated in this session" section). What ran instead, as in every
  prior phase: strict `tsc --noEmit` over the pure-logic file set (zero
  errors), an esbuild syntax pass over all 88 `.ts`/`.tsx` files under
  `app/`/`components/`/`data/`/`lib/`/`types/` (zero errors), and a
  script confirming all 184 `@/...` imports resolve. These confirm the
  code is syntactically and type-sound; they are not a substitute for a
  real `next build`, and this document does not claim they are.
- **"Do NOT hard-code the URL inside React/Next.js components."**
  Verified true, not just asserted: grepped every `.ts`/`.tsx` file
  under `app/`, `components/`, `data/`, `lib/`, `types/` for the literal
  string `script.google.com` — **zero matches anywhere in source.** The
  real URL exists in exactly one place in the whole repository:
  `.env.local` (gitignored, this phase's own new file) — plus the docs,
  which describe it rather than execute it.
- **Payload contents.** The seven fields the phase brief names
  (`fullName`, `collegeName`, `yearOfStudy`, `phone`, `email`,
  `selectedEvents`, `package`) are all present. Two additional fields
  the brief doesn't list, `eventCount` and `source`, are also sent —
  neither is new this phase (both existed since Phase 41) and neither
  is a truth-mode or security problem: `eventCount` is *required* by
  the Apps Script's own `validatePayload` (it checks
  `body.eventCount < 1` to enforce "at least one event"), so omitting it
  would break the "at least one event selected" validation the phase
  brief itself asks for; `source` is sent but the Apps Script's
  `appendRow` call **ignores it entirely** and hardcodes the literal
  `"AFFINITY '26 Website"` string instead (see `docs/google-sheets-
  setup.md` §5) — so a client-sent `source` value can never actually
  reach the Sheet's Source column, matching "never trust a
  browser-supplied value where it matters."
- **`amount` is sent but never trusted** — this was true since Phase 41
  and remains true: `submitRegistration.ts` computes `amount` fresh from
  `data/pricing.ts` (never from a caller's possibly-stale
  `state.pricing.total`) purely so the payload is self-describing; the
  Apps Script independently recomputes it from `PACKAGE_AMOUNTS[body.
  package]` and never reads `body.amount` at all — two independent
  layers arriving at the same "never trust a client amount" guarantee.

## Decisions worth knowing about

- **`.env.local` was written directly with the real URL, not left as a
  placeholder.** The phase brief supplied the actual deployed URL
  directly in its own request text, so there was nothing to placeholder
  — the organizer explicitly asked for this exact value to be written.
  `.env.example` (Phase 41) already documents why this value is safe to
  keep in a local, gitignored file despite not being a secret (it's a
  `NEXT_PUBLIC_` variable, inlined into the client bundle at build time
  regardless of how it's stored server-side).
- **No change to `next.config.mjs`, `.gitignore`, or any data/type file.**
  `output: "export"` (Phase 41) and the `.env*.local` gitignore rule
  (present since Phase 41's `.env.example`) already satisfied this
  phase's static-export and no-committed-secrets requirements — nothing
  needed touching.
- **The registration wizard's step order in this phase's own request
  (`01 PARTICIPANT / 02 EVENTS / 03 PACKAGE / 04 REVIEW / 05 CONFIRM
  REGISTRATION`) matches the current five-step wizard exactly** — this
  is the Phase 36 step order (Details/team-roster step removed), still
  current. No wizard restructuring was needed or attempted.
- **Success/failure copy was reviewed against the brief's literal
  strings ("REGISTRATION SUCCESSFUL", "REGISTRATION COULD NOT BE
  SUBMITTED", "TRY AGAIN") and found already semantically equivalent,
  not touched.** `RegistrationPass.tsx`'s heading already reads
  "Registration Successful" (title case, matching the project's existing
  typographic convention rather than shouting caps — the same
  editorial-typography choice every other page heading in this project
  already makes); `ConfirmStep.tsx`'s failure banner already shows the
  server's own message with no generic "could not be submitted" text
  swallowed silently, and its button already reads "Try Again" on a
  failed attempt. Changing these to literal all-caps strings would be
  exactly the kind of unnecessary UI change this phase's own brief warns
  against, for no functional difference — so left as-is.

## Still-open limitation (unchanged in kind since Phase 41, now more
specific)

Same npm-registry/Google-API-unreachable sandbox constraint as every
prior phase — this phase re-confirmed the Google API restriction
directly (a `curl` to the real deployed URL was rejected by the egress
proxy). **The single most valuable next step is for the organizer to
run `npm run dev` locally** (now that `.env.local` has the real
endpoint) and walk through one complete registration by hand — the
15-point checklist in this phase's own request (participant form,
college dropdown, events, package, review, confirm submits, Apps Script
receives it, exactly one new Sheet row appears, a real
`AF26-00001`-style ID comes back, the success page shows it, a page
refresh doesn't resubmit, a double-click doesn't duplicate, error
handling on a deliberately-broken endpoint, mobile, desktop) is exactly
the test plan to follow, and nothing in this session can substitute for
it.

## Suggested next phase

Once the organizer completes that local click-through and confirms a
real row appears in `Registration_students`, the natural next step is
running `npm run build` locally (or via the Cloudflare Pages CI build)
to confirm the static export itself succeeds with the real endpoint
baked in, then deploying to Cloudflare Pages with
`NEXT_PUBLIC_REGISTRATION_ENDPOINT` set in its own environment-variable
settings (see `docs/google-sheets-setup.md`'s "Cloudflare Pages
environment variable configuration" section, Phase 42) — the first time
this project's registration flow would be live and reachable by real
participants.
