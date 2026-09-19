# Phase 30 — College searchable dropdown: notes for future sessions

Persisted for continuity. Replaces the free-text "College Name" field on
`/register`'s Participant step with a searchable, keyboard-accessible
combobox constrained to the 86 officially supplied colleges.

## Source document — and a false start worth recording

This phase's own request initially claimed a college list was already
attached to the conversation. It genuinely was not — every file this
session could reach (chat uploads, the project's saved docs and files,
and every file staged from the user's `S:\KIMS` folder in earlier phases,
including both brochure PDFs and all three content docx files) was
checked and none contained a college directory. Rather than fabricate 86
plausible-sounding Tamil Nadu medical college names — exactly the kind of
invented institutional information this project's TRUTH MODE rule exists
to prevent — the session held the line and asked again. The actual
document (`COLLEGE1.docx`) arrived on the next turn: 86 non-empty
paragraphs, no numbering, no duplicates, one trailing blank paragraph at
the end (entirely normal for a docx). Recorded here mainly so a future
session facing the same "you already have this" claim knows to verify
independently rather than either fabricating data or simply repeating a
request the human believes they've already satisfied.

## Transcription method

The 86 names were extracted with `python-docx`, one paragraph per entry,
and written into `data/colleges.ts` programmatically (a small script
generated the array literal from the extracted strings) rather than
retyped by hand — the same reasoning the source-of-truth rule already
applies elsewhere in this project: a manual retype is exactly where a
silent spelling "correction" or dropped word tends to happen. Every name
was diffed back against the source paragraphs after the fact to confirm
an exact match.

## `data/colleges.ts`

```ts
export interface College {
  id: string;
  name: string;
  sourceOrder: number; // 1-based position in the source document
}
```

`sourceOrder` runs 1–86 in the same order as the source (array order and
`sourceOrder` currently agree — no reordering was applied, so there was
no need to exercise the "preserve sourceOrder separately from array
order" allowance the brief mentions).

Three names are intentionally near-duplicates, kept as separate entries
because the source lists them separately:
- `college-058` "Karpaga Vinayaga Institute of Medical Sciences" (this
  project's own host institution — note the **Vinayaga** spelling),
  `college-070` "Vinayaka Missions Kirupananda Variyar Medical College &
  Hospitals", and `college-079` "Vinayaka Missions Medical College,
  Karaikal" (both **Vinayaka**, unrelated to the first).
- `college-082` "Dhanalakshmi Srinivasan Institute of Medical Sciences
  and Hospital, Perambalur" and `college-083` "Dhanalakshmi Srinivasan
  Medical College & Hospital, Perambalur" — two separate Perambalur
  institutions.

A dev/build-time integrity block runs the moment anything imports this
module (Next.js executes module top-level code at build/prerender time,
not only at runtime): throws if `colleges.length !== 86`, if any `id` or
`sourceOrder` repeats, or if the 1–86 sequence has a gap — exactly the
"build should fail... if the list accidentally contains a duplicate ID or
incorrect count" requirement, implemented literally rather than as a
comment. Verified by actually *running* the file with `tsx` (strict `tsc`
only type-checks — it never executes a module's top-level code, so it
could not have caught a real duplicate or miscount on its own): count is
86, `sourceOrder` is exactly `1..86` in array order, and a spot-check
lookup (`college-038` → "PSG Institute of Medical Sciences & Research")
resolves correctly.

## Search — `lib/registration/collegeSearch.ts`

Pure, local, no dependency beyond the array itself — no external search
API, nothing fetched, per the brief's explicit instruction. Case-
insensitive and whitespace-tolerant via one `normalize()` (lowercase +
collapse internal whitespace + trim). A query is split on whitespace into
terms, and a college matches when **every** term is a substring of the
name — this is what "search both full college name and meaningful words"
means here: a single-word query is a plain substring match (covers every
example the brief gives literally), and a multi-word query becomes an
AND of substrings so word order in the query doesn't have to match word
order in the name.

Actually executed (not just type-checked) against the real 86-entry
list, confirming every example the brief names by hand:

| Query | Result |
|---|---|
| `madras` | 1 match: Madras Medical College |
| `coimbatore` | 3 matches: Coimbatore Medical College; Government Medical College & ESIC Hospital, Coimbatore; Karpagam Faculty of Medical Sciences & Research, Coimbatore |
| `psg` | 1 match: PSG Institute of Medical Sciences & Research |
| `vinayaka` | 2 matches: both "Vinayaka Missions" colleges — correctly excludes "Karpaga **Vinayaga** Institute" (different spelling in the source, not a bug) |
| `  MADRAS  ` (padded, mixed case) | same 1 match as `madras` |
| `` (empty) | all 86, in source order |

## `CollegeCombobox` — `components/registration/CollegeCombobox.tsx`

A WAI-ARIA 1.2 "combobox with listbox popup" pattern: `role="combobox"`
on the visible `<input>`, `role="listbox"` on the popup `<ul>`,
`role="option"` per college, `aria-activedescendant` tracking the
keyboard-highlighted option, `aria-expanded`/`aria-controls`/
`aria-autocomplete="list"`. A visually-hidden `role="status" aria-live`
paragraph announces the live result count as the query changes, matching
this project's existing pattern of pairing a visible state with an
explicit accessible announcement (e.g. `RegistrationStep`'s focus
management, `ParticipantStep`'s `role="alert"` errors).

Deliberately not a full-screen modal like `EventDetailsModal` — this is
one inline field, so its popup is a plain `absolute`-positioned panel
anchored to the input (`top-full`, full width of the field) rather than a
fixed-viewport overlay with a backdrop/focus-trap. `max-h-72
overflow-y-auto` is what satisfies "the dropdown should not extend beyond
the viewport" on mobile — capping height and scrolling internally avoids
needing any viewport-flipping (open-upward-if-near-bottom) logic, which
this project has no existing precedent for and which the brief doesn't
actually require.

**Selection is the only path to a committed value.** Typing filters the
list and can move the keyboard-highlighted option, but nothing commits
until an option is actually chosen — by click (an option's `onMouseDown`,
which calls `preventDefault()` so the input's own blur-driven revert,
below, never gets a chance to fire first) or by `Enter` while an option is
highlighted. Blurring the field, pressing `Escape`, or clicking outside
all call the same `reconcileDisplayValue()`, which snaps the visible text
back to the last real selection (or blank, if there never was one) —
so a participant who types "St George's" and then clicks away sees the
field revert to empty (or whatever it held before), never a stray typed
string masquerading as a selection. This is what makes "do not accept
manually typed arbitrary values" actually true, rather than just
validated-on-submit.

Keyboard: `ArrowDown`/`ArrowUp` move the highlighted option (opening the
popup first if it was closed), clamped at the list's ends (no wraparound
— simpler to reason about, and not something the brief asked for);
`Enter` commits the highlighted option and is the one case that calls
`preventDefault()` on a plain text input in this form, specifically so it
doesn't also trigger the wizard's implicit form-submit-via-Enter the way
every other field in `ParticipantStep` already does; `Escape` closes the
popup and reverts, without moving focus out of the field; `Tab` is left
to its native behavior (move focus, closing the popup as a side effect)
since trapping Tab inside an inline field (as opposed to a modal) would
break the page's normal tab order for no benefit.

## Wiring into the existing registration state — no second state system

`types/registration.ts`'s `Participant` gained one field, `collegeId:
string | null`, sitting alongside the existing `collegeName: string`
rather than replacing it — every existing reader of `collegeName`
(`ReviewStep`, `RegistrationPass`, the new `RegistrationSummary` line
below) keeps working completely unchanged, because `CollegeCombobox`'s
`onSelect` always dispatches both fields together
(`UPDATE_PARTICIPANT` with `{ collegeId, collegeName }`) — the existing
reducer action needed no changes at all.

`lib/registration/validation.ts`'s old length-based `collegeName` check
(`COLLEGE_MIN`/`COLLEGE_MAX`) is gone, replaced by a single check:
`!participant.collegeId || !participant.collegeName.trim()` →
`"Please select your college."` (the brief's own exact wording). Checking
`collegeId` — proof a real list entry was chosen — rather than
re-validating the string is what actually enforces "must select, not
type"; the `collegeName.trim()` half is a belt-and-suspenders guard
against a hand-edited/corrupted `localStorage` record that somehow has an
id but an empty name.

**A pre-existing in-progress registration in `localStorage`** (from
before this phase) will have `collegeName` set but no `collegeId` at all
— `HYDRATE` loads it as-is, `CollegeCombobox` resolves `value=null` (no
matching id) and shows the field blank rather than the old typed text,
and validation correctly refuses to advance until the participant
actually picks a real college. This is the right behavior, not a bug to
migrate around: a free-typed string from before this phase was never a
verified official college name, so it shouldn't survive as one now.

## Where the selected college shows up

`ReviewStep.tsx` and `components/success/RegistrationPass.tsx` needed
**no changes** — both already read `participant.collegeName` directly,
so they display the complete official name automatically now that that's
what the field actually stores. `RegistrationSummary.tsx` (the wizard's
running sidebar) previously showed no college at all; a "College" line
was added there specifically because the brief lists "registration
summary" as one of the three places the selection must appear.

## No duplication

The only file with any college name in it is `data/colleges.ts`. The
combobox, the step, the summary, the review step, and the pass all read
through `data/colleges.ts` (directly, or via the `collegeName` string
that was set from it) — none hard-codes a name.

## Verification

- Strict `tsc --noEmit` over the pure-logic file list — **28 files** (two
  new: `data/colleges.ts`, `lib/registration/collegeSearch.ts`) — zero
  errors.
- `esbuild` syntax-check over every `.ts`/`.tsx` file — **86 files**
  (three new, the two above plus `CollegeCombobox.tsx`) — zero failures.
- A script confirming all `@/...` imports resolve — **184** (four new) —
  all resolve.
- `data/colleges.ts` and `lib/registration/collegeSearch.ts` were also
  actually **executed** with `tsx` (not just type-checked) — see the
  tables above — since the integrity `throw`s and the search examples
  are runtime behavior a type-checker alone can't confirm.

## Still-open limitations (unchanged category since Phase 02, specific to this phase)

Reasoned from source and the DOM/ARIA specs' documented behavior, not
exercised in a real browser, since this sandbox still has no
`node_modules`/`next dev`/`next build`. Specifically unverified live: the
`ref`/`RefObject` typing between `ParticipantStep`'s `collegeRef` and
`CollegeCombobox`'s `inputRef` prop (reasoned through by hand to be
structurally identical types, but not confirmed by a real `tsc` run with
`@types/react` installed, which this sandbox doesn't have); real mobile
touch/on-screen-keyboard behavior when the popup opens near the bottom of
a short viewport; and whether 86 real DOM `<li>` nodes filtering on every
keystroke feels instant on a low-end Android phone (no virtualization was
added — 86 rows is small enough that this is expected to be fine, but
it's not something this sandbox can actually time).
