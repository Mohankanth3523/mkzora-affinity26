# AFFINITY '26 — Backend Integration Map

**Scope:** documentation only, no code. This is one of the four docs the
project brief's DOCUMENTATION section asks every phase to maintain
(`frontend-audit.md`, `affinity-content-truth.md`,
`frontend-content-audit.md`, `backend-integration-map.md`). Written
alongside Phase 11 (Registration System UI) because that phase's brief
explicitly asked for the wizard to be "easy to connect to a future API" —
this document is how that requirement is satisfied, rather than adding a
speculative API-client abstraction into the reducer itself (see
`docs/phase-11-registration-architecture-notes.md` for why that would have
been scope creep this phase).

**Phase 41 update:** this frontend is no longer *entirely* backend-free.
Registration submission (the row below) now makes one real network call —
to a Google Apps Script Web App, documented in full in
`docs/google-sheets-setup.md` — which is a real, already-implemented
integration, not a future one. Everything else in this document is
unchanged: still no API routes in this repo, no database, no auth
backend, and — Phase 41 confirms this rather than changes it — still no
payment gateway of any kind. AFFINITY '26 does not collect payment
online; "Payment" is no longer a row in this table at all, because it is
no longer a concept this codebase has, not because it moved somewhere
else. See `docs/frontend-audit.md` §9 and
`docs/affinity-content-truth.md` for what's still genuinely mocked, and
`docs/phase-41-confirm-registration-google-sheets-notes.md` for the full
phase writeup.

## How to read this table

Each row is one point where frontend-only mock behaviour would, in a real
system, cross a network boundary — or, for "Registration submission"
below, already does. "Current" describes what exists today; "Future
integration point" describes the shape of a change that has *not* been
built, for rows where one is still needed.

| Concern | Current | Future integration point |
|---|---|---|
| Registration draft persistence | `lib/registration/storage.ts` — `localStorage`, key `affinity26.registration.v1`, read/written by `RegistrationProvider` (`lib/registration/context.tsx`) on every state change | A `PATCH /api/registrations/:draftId` (or similar) called from the same `useEffect` that currently calls `saveRegistrationState`, with `localStorage` kept as an offline-first cache/fallback rather than removed outright |
| **Registration submission (Phase 41 — real, implemented)** | `ConfirmStep.tsx` calls `submitRegistration()` (`lib/registration/submitRegistration.ts`), which `POST`s the completed registration to a Google Apps Script Web App at `NEXT_PUBLIC_REGISTRATION_ENDPOINT`. The Apps Script validates the payload, **recomputes the registration amount itself from the submitted package name** (never trusts a client-sent amount), generates a sequential registration ID under a script lock, appends one row to the "Registrations" Google Sheet, and returns `{success, registrationId, message}`. `CONFIRM_REGISTRATION` (`lib/registration/state.ts`) only ever dispatches with that server-returned ID, after `result.ok === true` — never before, never with a client-generated ID. Full setup and the Apps Script source: `docs/google-sheets-setup.md`. | Could later move to a real database + API route if the project ever needs more than a spreadsheet (e.g. an admin dashboard, deduping across a larger dataset, a real check-in system) — the Sheet is deliberately a *lightweight* backend, not a permanent architectural ceiling |
| Registration ID | Server-issued by the Apps Script — format `AF26-00001`, sequential, generated under `LockService.getScriptLock()` so concurrent submissions can't collide (see `docs/google-sheets-setup.md` §5, `nextRegistrationId`). `ConfirmationDetails.registrationId` (`types/registration.ts`) is only ever set from this server response — there is no client-side ID generator anywhere in this codebase anymore (Phase 41 removed the old `generateMockRegistrationId()`) | Already real — no further integration needed unless the ID scheme itself changes |
| Pricing calculation | `lib/registration/pricing.ts` — pure client-side function over `data/pricing.ts`; `PricingSummary.isEstimate` is always `true`, with `assumptions[]` explaining exactly which brochure ambiguities (see `docs/affinity-content-truth.md` §5/§15) make it an estimate rather than a final figure. The three package prices themselves (₹480/₹1,100/₹1,500) are fixed and not in question — the "estimate" framing is about per-event-fee ambiguities the frontend deliberately no longer folds into the total (see `docs/phase-31-event-pricing-cleanup-notes.md`), not about the package price being uncertain. Phase 41's Apps Script independently recomputes this exact same amount server-side from the package name before it's ever written to the Sheet, so the two are guaranteed to agree | Unchanged — still a future call, if one is ever wanted, once the organizer resolves the remaining brochure ambiguities |
| Event catalogue | `data/events/{sports,cultural,online}.ts` — static, hand-transcribed from the official brochure, imported directly by `app/events/page.tsx` and the registration wizard | A `GET /api/events` (or a CMS) if the organizer ever wants to update fees/deadlines/slot counts without a code deploy; the `AffinityEvent` type (`types/event.ts`) is already the shape such an endpoint would return, so the migration is "swap the import for a fetch," not a data-model rewrite |
| Slot availability | `EventFee`/`limitedSlots` fields are static flags from the brochure (e.g. "limited slots" badge) — **never** a live remaining-count, because no source document gives one (see `docs/phase-09-events-explorer-notes.md`) | A live `GET /api/events/:id/availability` once real registrations exist server-side (they now do, in the Sheet — this could plausibly read from it); only then would a "N spots left" figure be truthful rather than fabricated |
| Contact / rules content | `data/contacts.ts`, `data/rules.ts` — static, transcribed from source documents | Could move to a CMS if these need to change post-launch without a redeploy; low priority, since this content is the least likely to change once the brochure is final |
| Confirmation email / WhatsApp | None — explicitly out of scope per the project brief | Could be added as an Apps Script trigger on the Sheet (e.g. `onFormSubmit`/`onEdit`, or directly inside `doPost` after a successful `appendRow`) rather than a separate backend job, given the Sheet now exists — entirely outside this frontend's concern beyond maybe showing a "confirmation sent to X" note |
| QR code on the pass screen | A placeholder graphic only — encodes nothing, verifies nothing (unchanged by Phase 41; see `components/success/RegistrationPass.tsx`'s own doc comment for why this stays a deliberate, precise "the registration is real, the QR isn't" distinction) | Now that a real registration ID exists server-side (Phase 41), the QR could encode a verification URL/token a check-in desk could scan against the Sheet (e.g. via a small Apps Script `doGet` lookup by ID) |
| Auth | None — the wizard has no login; "participant" is just a name typed into a form field | If check-in or "resume my registration on another device" is ever wanted, this would need real auth (email/OTP most likely, given the phone/email fields already collected) — currently out of scope |

## What is deliberately *not* prepared for a backend yet

- **No API client abstraction beyond `submitRegistration.ts` exists in
  `lib/registration/`.** The reducer (`state.ts`) stays a pure,
  synchronous function; `context.tsx` stays a thin `useReducer` + two
  `useEffect`s. `submitRegistration.ts` is the one deliberate exception —
  a real async service function — because Phase 41 gave it a real
  endpoint to call; nothing else in this table has one yet, so nothing
  else has spawned a matching service layer.
- **No environment-variable/config scaffolding beyond
  `NEXT_PUBLIC_REGISTRATION_ENDPOINT`** (`lib/registration/
  submissionConfig.ts`) exists. There is nothing else to point at yet.
- **No optimistic-UI exists for the submission call** — `ConfirmStep`
  shows a straightforward idle/submitting/success/error state machine,
  not an optimistic "assume success, roll back on failure" pattern; the
  phase brief is explicit that success must never show before the Sheet
  actually confirms the write.

## Why this is safe to build on later

Every mock value remaining in the registration flow already carries a
type that would survive a swap to a fuller backend without a reshape:

- `RegistrationState` (`types/registration.ts`) is already the shape a
  server-persisted draft would round-trip through `HYDRATE`.
- `PricingSummary` already separates `lines`/`total` (what a server would
  also compute — and, since Phase 41, actually does independently
  recompute) from `isEstimate`/`assumptions` (frontend-only caveats).
- `ConfirmationDetails` (`types/registration.ts`) is, as of Phase 41,
  already real rather than mock: `registrationId` is server-issued and
  `confirmedAt` is a local display timestamp only, never treated as an
  authoritative record (the Sheet's own Timestamp column is that). There
  is no `paymentStatus`/`PaymentStatus` anymore — that concept was
  removed entirely, not widened, because it never described anything
  this project actually does.

In short: the data model was written to already look like it talks to a
backend, and as of Phase 41, the registration-submission half of it
genuinely does — a real Google Sheet, not a mock. What's left in this
table (pricing-as-a-service, event catalogue via API, slot availability,
auth, confirmation email) is still exactly what it was before: future
work, clearly seamed, not yet built.
