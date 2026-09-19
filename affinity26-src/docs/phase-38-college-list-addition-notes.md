# Phase 38 — SRM Medical College, Chennai + an "Others" escape hatch: notes for future sessions

Persisted for continuity. Two related changes to the Participant step's
College Name field, from one request: add a specific named college the
Phase 30 source document didn't include, and give every participant whose
college isn't in the list a way to register anyway.

## The request

Two screenshots of the existing `CollegeCombobox` dropdown (search box,
list of colleges) plus: "add to college name in registration — Others —
SRM MEDICAL COLLEGE, CHENNAI."

Read as two asks: (1) add "SRM Medical College, Chennai" as a selectable
entry, and (2) add an "Others" option to the same dropdown.

## Provenance — why this isn't a TRUTH MODE violation

`data/colleges.ts`'s 86 entries are a verbatim transcription of a supplied
source document (Phase 30), and its own doc comment calls that array "the
ONLY source" for this field — worth being explicit about here, since
adding a name to it is exactly the kind of "institutional information"
TRUTH MODE says never to invent.

This isn't inventing one, though: "SRM Medical College, Chennai" is a
real, named institution the project's own operator explicitly asked to be
added, in this session, in plain language — not a document this session
independently interpreted or a name it inferred was probably missing. The
same standard this project already applies to direct operator requests
for other non-brochure assets (e.g. the MKZORA/Garudan Nexus digital
partner marks — see `docs/phase-29-brand-logo-integration-notes.md`, "the
project's own instruction from its acting developer relationship")
applies here. What TRUTH MODE actually rules out is presenting an
un-sourced claim *as if* it came from the official brochure — so rather
than silently folding this into "the 86 official colleges" description,
`data/colleges.ts`'s own comments now say plainly that `college-087` is a
Phase 38 addition, arrived by direct instruction, not part of the 86-entry
source docx. Nothing else about the source document's own 86 entries was
touched, corrected, or reordered.

No AFFINITY '26 event fact (name, fee, prize, eligibility, deadline,
contact) was touched — like Phase 33/37, this is entirely a data-layer
change to one supporting reference list, not an event fact.

## What changed

### 1. `data/colleges.ts` — `college-087`

Added `{ id: "college-087", name: "SRM Medical College, Chennai",
sourceOrder: 87 }`, continuing the sequence after the sourced 1–86 rather
than being spliced into the middle of it. The integrity check (throws if
the array's length or `sourceOrder` sequence doesn't match) was updated
from expecting exactly 86 to expecting exactly 87 — still a real,
executable guard, not just a comment, per the same "build should fail on
a duplicate ID or incorrect count" requirement Phase 30 implemented.

This is a **distinct institution** from `college-086` ("Trichy SRM
Medical College Hospital & Research Centre, Trichy") — different campus,
different city. Confirmed by name, not merged or treated as a correction
of that entry. A runtime `tsx` search for both `"srm"` and `"chennai"`
returns both institutions correctly, with no unintended overlap (see
Verification below).

### 2. A trailing "Others" option in `CollegeCombobox`

For a participant whose college genuinely isn't one of the 87 entries.
Rendered as the list's last row, always present (even when a search
matches 0 colleges), reachable by the same Arrow-key/Enter/click model as
a real option, but wired through a new, separate `onSelectOther` callback
rather than `onSelect` — it was deliberately kept out of `data/
colleges.ts` itself (see that file's own new doc comment on
`OTHER_COLLEGE_ID`), since it's a UI affordance, not an 88th verified
institution, and folding it into `colleges` would have made that array's
own "real entry count" integrity check meaningless.

### 3. `ParticipantStep` swaps to a plain text field when "Others" is picked

Selecting "Others" dispatches `collegeId: OTHER_COLLEGE_ID, collegeName:
""` and the step swaps `CollegeCombobox` out for an ordinary `<input>` at
the same `id="participant-college"` (so the field's `<label>`/error
association, and the existing submit-time focus logic, both keep working
unchanged) where the participant types their own college name. A small
"Choose from the list instead" link resets `collegeId`/`collegeName` back
to `null`/`""` and swaps back to the searchable combobox.

This is a deliberate, narrow exception to Phase 30's "must select, not
type" rule — the participant is still required to make an explicit choice
first (either a real college from the list, or the "Others" row); nothing
about the default combobox behavior changed, and typing into the field
without first picking "Others" still does not commit a value (Phase 30's
`reconcileDisplayValue` behavior is completely untouched).

### 4. `lib/registration/validation.ts`

`collegeName` validation now branches three ways: no `collegeId` at all →
"Please select your college." (unchanged); `collegeId === OTHER_COLLEGE_ID`
→ the typed name is checked against new `COLLEGE_MIN`/`COLLEGE_MAX`
constants (3/120 characters — ordinary frontend UX judgment calls, the
same category the file's own header comment already carves out for
`NAME_MIN`/`NAME_MAX`, not a sourced fact); any other non-null `collegeId`
→ the original Phase 30 belt-and-suspenders `collegeName.trim()` guard,
unchanged.

## What was *not* touched

- The 86 entries transcribed in Phase 30 — untouched, same spelling,
  same order, same ids.
- `ReviewStep`, `RegistrationSummary`, `RegistrationPass` — all three
  already read `participant.collegeName` as plain text and needed no
  changes; a manually-typed "Others" name displays through them exactly
  like any other college name already did.
- `lib/registration/collegeSearch.ts` — no changes; it only ever searches
  the real `colleges` array, which now happens to have 87 rows instead of
  86.
- Every other registration step, `data/pricing.ts`, `data/events/*` —
  unrelated to this change.

## Testing

Ran the full college-search and validation logic through `tsx` at
runtime, not just type-checked:

- `colleges.length` is 87, no integrity throw.
- `getCollegeById("college-087")` resolves to "SRM Medical College,
  Chennai"; `getCollegeById("college-086")` still resolves to the
  distinct Trichy institution.
- `searchColleges("srm", colleges)` returns both SRM-named institutions;
  `searchColleges("chennai", colleges)` returns both Chennai-named
  institutions (ESIC Medical College & PGIMSR, Chennai; SRM Medical
  College, Chennai) — confirming the new entry participates correctly in
  the existing multi-word/substring search logic with no special-casing
  needed.
- `validateParticipant` exercised against five cases: no college chosen;
  a real college selected normally (Phase 29 path — confirmed still
  error-free, i.e. unaffected by this phase); "Others" chosen with an
  empty typed name; "Others" chosen with a too-short typed name; "Others"
  chosen with a valid typed name — each produced exactly the expected
  error (or no error).

Not verified: this sandbox still has no `next dev`/`next build`, so the
actual rendered "Others" row (its keyboard reachability via real Tab/
Arrow-key presses, the swap between combobox and plain `<input>`, and the
86→87-row scroll behavior in `max-h-72 overflow-y-auto`) is unverified
against a real rendered page — reasoned through by hand and confirmed via
`tsx` at the logic level, not screenshotted.

## Verification

- Strict `tsc --noEmit` over the pure-logic file list — **29 files**
  (unchanged — `data/colleges.ts`, `lib/registration/validation.ts`,
  `types/registration.ts`, `lib/registration/collegeSearch.ts` were all
  already on this list from earlier phases) — zero errors.
- `esbuild` syntax-check over every `.ts`/`.tsx` file in the repo —
  **89 files** (unchanged — no files added or removed, four edited in
  place) — zero failures.
- A script confirming every `@/...` import resolves — **178** (up from
  176 — `ParticipantStep.tsx` and `lib/registration/validation.ts` each
  gained one new `@/data/colleges` import; nothing was removed) — all
  resolve.
- Ran `data/colleges.ts`'s own integrity check, `collegeSearch.ts`, and
  `validateParticipant` through `tsx` at runtime — see Testing above.
- `npm run lint` / `npm run build` still cannot run in this sandbox — no
  `node_modules`, no npm registry access. Unchanged limitation from every
  previous phase.

## Still-open limitations

- Not verified in a real browser — see "Not verified" under Testing
  above.
- A pre-Phase-38 in-progress registration in `localStorage` with a real
  `collegeId` is completely unaffected (that id still resolves the same
  way it always did). One with no `collegeId` at all (pre-Phase-30
  records, per that phase's own still-open note) still correctly shows a
  blank field and fails validation until a real selection or "Others" is
  made — this phase didn't change that behavior.
