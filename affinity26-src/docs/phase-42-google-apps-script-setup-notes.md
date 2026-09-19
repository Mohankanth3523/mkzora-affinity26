# Phase 42 — Google Apps Script Setup, concretized for the real
AFFINITY '26 Sheet: notes for future sessions

Persisted for continuity. See also `README.md` (project status),
`docs/phase-41-confirm-registration-google-sheets-notes.md` (the phase
that built the Google Sheets + Apps Script backend this phase documents
more concretely), and `docs/google-sheets-setup.md` itself (the document
this phase edited).

## What this phase delivered

This was a **documentation-only phase** — the request supplied real,
concrete facts (the organizer had actually created the Google Sheet
using their own account) and asked for the existing Phase 41 setup guide
to be filled in with those facts, plus two entirely new sections the
original guide didn't cover. No frontend or Apps Script code changed.

- `docs/google-sheets-setup.md` (edited):
  - **Section 1** ("Create the Google Sheet") gained a paragraph stating
    this step is already done for AFFINITY '26 — the spreadsheet is
    `Registration_students`, owned by `iammohankanth@gmail.com` — and
    pointing straight to section 2, instead of leaving the reader to
    create a redundant second Sheet.
  - **Section 7** ("Execute as the spreadsheet owner") now names the
    concrete account (`Me (iammohankanth@gmail.com)`) instead of the
    generic "Me (your account)," and explains *why* that resolves
    correctly: Apps Script fills "Me" in with whichever Google account is
    currently signed in and editing the script, so deploying from the
    same account that owns `Registration_students` is what makes it work.
  - **Section 8** ("Set access") copy was tightened to explicitly connect
    "Anyone" to the phase's own stated intent — "anyone who needs to
    submit a registration from the public AFFINITY '26 website."
  - **"Manual testing"** (one worked example) became a full **"Testing"**
    section with eight itemized cases — see "Testing section" below.
  - Two brand-new sections: **"Cloudflare Pages environment variable
    configuration"** and **"Troubleshooting"** — neither existed before
    this phase; both were explicitly requested and neither had anywhere
    else in the docs tree to live.

## Truth-mode / instruction-compliance audit

- **"Do not claim the Web App is deployed until I actually deploy it"**
  — the organizer's own explicit, standalone instruction. Checked every
  sentence added or edited this phase for tense and phrasing: deployment
  instructions are consistently phrased as future/conditional ("After
  deploying...", "Once deployed...", "Set it as..."), never as "the Web
  App is live" or similar. The new Cloudflare section's own verification
  step ("open the live site... confirm the button is enabled") is itself
  phrased as something to do *after* deployment, not a claim that it's
  already true. This document, this phase's `README.md` entry, and this
  notes file all avoid asserting deployment happened.
- **"Do NOT invent the actual URL"** — no Web App URL appears anywhere in
  this phase's edits. Every example still uses the placeholder
  `<your Web App URL>` (unchanged from Phase 41's own placeholder
  convention), including in all eight new Testing-section `curl`
  examples.
- **No Google credentials of any kind were added.** The only concrete
  fact introduced this phase is the account email
  `iammohankanth@gmail.com` itself — which the organizer stated directly
  in their own request as the account they used, not a secret being
  disclosed. No password, API key, OAuth token, or service-account
  credential appears anywhere in the diff.
- **"Do not create or modify the Google Sheet structure unnecessarily...
  always append new registrations"** — this phase didn't touch the Sheet
  at all (it's a documentation edit), and the Apps Script's own
  `appendRow`-only design (no code changed) already satisfies this.
- **Frontend code was reviewed, not changed.** The phase brief's
  "Frontend Integration" section describes exactly what
  `lib/registration/submitRegistration.ts` and `components/registration/
  ConfirmStep.tsx` already do (both built in Phase 41): POST to
  `NEXT_PUBLIC_REGISTRATION_ENDPOINT` (never hardcoded — read via
  `lib/registration/submissionConfig.ts`), show a success state with the
  server-issued registration ID, show a "could not be submitted" error
  state with a retry action on failure, and never show success unless
  the Apps Script's own JSON response says `success: true`. Re-reading
  both files in full this phase confirmed this line-by-line — no gap was
  found, so no code edit was made. Making a change that wasn't needed,
  just to have "done something" to the frontend, would have been exactly
  the kind of unnecessary modification the standing operating rules
  (`docs/phase-00-operating-rules.md`) warn against.
- **Apps Script logic was reviewed, not changed.** Every functional
  requirement in the new, more detailed spec — sequential ID generation
  under a lock, server-side amount recomputation from the package label,
  the seven required fields, "at least one event," duplicate protection
  via `LockService` without being aggressive about shared names/colleges,
  the exact success/failure JSON shapes, and no internal-error leakage —
  was checked against the actual `Code.gs` source already documented in
  section 5, and each one maps to a real, already-existing code path (see
  `validatePayload`, `PACKAGE_AMOUNTS`, `nextRegistrationId`,
  `findRecentDuplicate`, and the `lock`/`try`/`finally` structure in
  `doPost`). Nothing needed to change.

## Testing section — what changed and why

The original "Manual testing" section had one worked example (a valid
registration) and four sentences of prose describing four more things to
check informally. The phase brief asked for explicit test cases: valid
registration, missing name, missing college, missing email, invalid
package, incorrect frontend amount, and multiple simultaneous
submissions — seven named cases. The rewrite:

- Gives **each** of the seven a runnable `curl` example (not prose
  describing what to try) and a precise expected response/expected sheet
  state, in numbered order.
- Adds a **bonus eighth case** — re-sending the same valid payload to
  exercise the duplicate-check path — since Phase 41's own design
  decision (treat a same-email+phone+package+eventCount resubmission
  within two minutes as "already recorded," not a new row) is a real
  behavior worth verifying even though the phase brief's own list didn't
  name it explicitly. Labelled clearly as a bonus, not one of the seven
  requested cases, so nothing reads as if the brief asked for it.
- Case 6 ("incorrect frontend amount") is written to explicitly call out
  the point of the test — the response should still be a *success*, and
  the number that matters is what column K actually shows (1100), not
  the wrong `50` the request body sent — since this is the single most
  important thing the whole backend exists to guarantee, and a reader
  skimming past it could otherwise miss why this case matters.
- Case 7 ("multiple simultaneous submissions") uses a five-request
  backgrounded shell loop with distinct email/phone per request (so the
  duplicate check can't interfere) and states plainly what "the lock
  worked" looks like: five distinct responses, no repeated ID, five new
  rows with consecutive IDs.
- A short **"Cleanup"** note was added at the end, since these are real
  rows in the real `Registration_students` sheet (not a scratch/test
  sheet) — something the original one-example section didn't need to
  mention, since it only ever described one throwaway row.
- The "not live-verified" caveat from the old section was kept and
  reworded to cover all eight cases, not just the original one — still
  true, since this sandbox has no outbound network access to Google's
  APIs (unchanged constraint since Phase 41).

## Decisions worth knowing about

- **Section numbering (1–10) was left untouched.** The phase brief asked
  for documentation covering nine numbered topics ("1. Google Sheet
  setup" through "9. Troubleshooting"), but the existing document's own
  section numbers (1–10, ending at "Security") don't map one-to-one onto
  that list — e.g. the brief's "3. Apps Script code" and "2. Apps Script
  creation" are two separate existing sections (4 and 5), and "6. Local
  testing" is what's now the "Testing" section, placed after "Security"
  for narrative flow reasons that predate this phase. Renumbering the
  whole document's headers to match the brief's own list order would have
  been a much larger, purely cosmetic restructuring not asked for
  explicitly — every one of the nine requested topics is present and
  easy to find by heading text, so the existing header structure (with
  the two new sections appended after "Testing," before "Security") was
  kept rather than reordered.
- **The Cloudflare section's own verification step doubles as a
  reminder, not a status claim.** It tells the reader to check the live
  site in a private window after deploying — phrased entirely as
  something *they* will do once they've actually redeployed, not
  something this document asserts has happened.
- **Troubleshooting entries were written from the Apps Script's actual
  code paths, not generic Apps Script advice.** Each bullet ties a
  symptom to the specific line of logic in the section-5 script that
  would produce it (e.g. "Sheet not found" ties to `doPost`'s own
  `if (!sheet)` check and its exact message), so a reader debugging a
  real deployment can go from a symptom straight to the relevant code
  rather than getting generic "check your permissions" advice.

## Still-open limitation (unchanged since Phase 41)

Same npm-registry/Google-API-unreachable constraint as every prior
phase. This phase touched no `.ts`/`.tsx` file, so the verification trio
was re-run purely to confirm this doc-only phase introduced no
regression, not because any code changed: strict `tsc --noEmit` over the
pure-logic file set (zero errors, same file list as Phase 41 — no
pure-logic files were added or removed), a full esbuild syntax pass over
every `.ts`/`.tsx` file under `app/`, `components/`, `data/`, `lib/`,
`types/` (88 files, zero errors), and a script confirming all 184
`@/...` imports still resolve (unchanged count from Phase 41). **None of
the eight Testing-section cases have actually been run against a live
deployment** — that remains the single most valuable next verification
step once the organizer deploys the Web App, exactly as this document's
own "Testing" section says.

## Suggested next phase

Once the organizer deploys the Apps Script Web App (Deploy → New
deployment → Web app → Execute as Me → Access: Anyone) and adds the real
URL to Cloudflare Pages' `NEXT_PUBLIC_REGISTRATION_ENDPOINT` environment
variable, the natural next phase is running through this document's own
eight-case Testing section against the live deployment and reporting the
results — the first genuinely live-verified surface this backend
integration will have had since Phase 41 first built it.
