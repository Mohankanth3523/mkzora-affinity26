# Phase 15 — Choose Your Experience (Step 04): notes for future sessions

Persisted for continuity. See also `README.md` (project status) and
`docs/phase-14-details-step-notes.md`.

## What this phase delivered

- `components/registration/PackageStep.tsx` (rewritten) — a real,
  styled radio choice between the three official packages
  (`data/pricing.ts`, §5 of the content-truth doc), each shown as a card
  with its price and a Food/Accommodation checklist so all three are
  directly comparable, plus a live "Price Breakdown" panel reading
  straight from `state.pricing` — Base Registration, Food, Accommodation,
  each event's own fee, and a Total, with any estimate caveats listed
  underneath.
- `lib/registration/pricing.ts` (edited) — the calculator's single
  "package" line is now three lines (Base Registration / Food /
  Accommodation) and it now honors Chess's own "replaces the general
  package" fee note instead of silently double-charging a Chess-only
  registrant. See the truth-mode audit below for both.
- `lib/registration/validation.ts` (edited) — `isPackageStepValid()`, the
  same simple boolean gate `isEventsStepValid()` established in Phase 13.
- `components/registration/RegistrationNavigation.tsx` (edited) — added
  `package` to `NEXT_DISABLED_BY_STEP`/`NEXT_DISABLED_REASON`.

## Truth-mode audit

- **The three package prices (₹480 / ₹1,100 / ₹1,500) are unchanged from
  Phase 02** — `data/pricing.ts` already had them transcribed from the
  brochure's pricing page, verified again this phase against
  `docs/affinity-content-truth.md` §5. Nothing about the *prices* changed
  this phase, only how they're displayed and combined with event fees.
- **"Base Registration" / "Food" / "Accommodation" are an exact
  arithmetic decomposition of those three stated numbers, not a separate
  sourced fact.** The brochure never itemizes what portion of ₹1,100 is
  "food" versus "registration" — but the package *names themselves* say
  each tier is the previous one plus exactly one more thing
  ("Registration Only" → "Registration + Food" → "Registration + Food +
  Accommodation"), so Food = ₹1,100 − ₹480 = ₹620 and Accommodation =
  ₹1,500 − ₹1,100 = ₹400 are direct, unambiguous arithmetic on the
  brochure's own numbers, computed from `PACKAGES` in code (never
  hardcoded as literals) so they can never drift out of sync with
  `data/pricing.ts`. This is documented at length in `pricing.ts`'s own
  comments, since it's the one place this phase does more than "display
  a stated number."
- **Chess-only registration now costs ₹250, not ₹730.** `data/events/
  sports.ts`'s Chess record already carried `fee.notes: "...replaces the
  general package"` since an earlier phase, sourced from
  docs/affinity-content-truth.md §5 — but the pricing calculator was
  ignoring it and would have added the ₹250 Chess fee on top of whichever
  base package the participant picked. This phase fixes that: when the
  participant's *only* selected event is Chess, `calculatePricing` skips
  the Base Registration line entirely (the ₹250 event fee, already added
  by the existing per-event loop, stands in for it). This is scoped as
  tightly as possible — one `eventId === "chess"` check, applied only
  when Chess is the sole selection — so it can never accidentally apply
  to any other event. Food/Accommodation, if the participant still picks
  one of the three package cards, are added on top of ₹250 rather than
  ₹480, using the same officially-stated deltas — the brochure doesn't
  explicitly price *that* combination, so an `[VERIFY WITH ORGANIZER]`
  assumption is surfaced whenever it applies, both in the Package step's
  own callout and in the pricing summary's "Notes on this estimate" list.
- **The base-package/unlisted-events gap (§5/§15's own
  `[VERIFY WITH ORGANIZER]`) is unchanged and still surfaced.** 13 sports
  events have `fee.unit === "included_in_package"` (no brochure page ever
  confirms whether they're covered by the base fee) — `pricing.ts`
  already flagged this per-event and via `baseIncludesUnlistedEvents`;
  this phase only added the literal `[VERIFY WITH ORGANIZER]` tag text to
  both messages (the phase brief's own instruction: "If source conflicts
  exist: mark [VERIFY WITH ORGANIZER]") and put them somewhere visible —
  the Package step's own breakdown panel, not just the code comments and
  the sidebar total they already reached.
- **No client-side arbitrary pricing exists anywhere in this step.**
  Every number on the page comes from `state.pricing`, itself computed
  only from `PACKAGES` and `data/events/*` — there is no free-text amount
  field, no manual total override, nothing a participant (or a bug) could
  use to set their own price.

## Decisions worth knowing about

- **Package selection stays a plain 3-way radio choice, not an
  "à la carte" builder.** The brochure offers exactly three fixed tiers,
  never "registration + accommodation without food" or any other
  combination — so the UI doesn't expose `SET_ACCOMMODATION_REQUESTED`
  (the reducer action from Phase 02) as an independent toggle. It's left
  wired in the reducer (mirrored automatically by `SET_PACKAGE`) for a
  future phase to use only if the organizer ever confirms an à la carte
  option; inventing one now would be exactly the kind of restriction/
  option the brief says not to invent.
- **The Chess-only fix lives in the pricing calculator, not the UI.**
  Putting the ₹250-replaces-₹480 logic in `calculatePricing` (rather than,
  say, hiding the package cards when Chess-only) means the same correct
  total appears everywhere that reads `state.pricing` — the Package
  step's own breakdown, the `RegistrationSummary` sidebar, and eventually
  Review/Confirm — from one place, and the participant can still see and
  choose a package (for Food/Accommodation) rather than the UI making
  that choice for them.
- **"Price Breakdown" and "Notes on this estimate" are separate blocks in
  the same panel**, not interleaved — the numbers a participant is there
  to check are never mixed with the caveats about them, but the caveats
  are still on the same screen, not tucked away behind the sidebar only.
- **Package cards show Food/Accommodation as check-or-dash for all three
  tiers**, not just the included ones, so the three cards read as a
  direct side-by-side comparison rather than requiring the participant to
  infer what's missing from what's absent.

## Still-open limitation (unchanged since Phase 02)

Same npm-registry-unreachable constraint as every prior phase. Verified
this phase with the same method as always: strict `tsc --noEmit` over the
pure-logic file set (zero errors — `pricing.ts`'s rewrite and
`validation.ts`'s new `isPackageStepValid` both join this pass; also
added `data/pricing.ts` itself to the checked file list explicitly, since
it was previously only checked transitively), esbuild syntax-check (zero
errors, all 64 `.ts`/`.tsx` files — unchanged from Phase 14, since this
phase edited existing files rather than adding new ones), and a script
confirming all 130 `@/...` imports resolve (up from 129 — `PackageStep.tsx`
gained one new import, `OrnamentalFrame`). **Not yet seen in a real
browser.** This phase's highest-risk visual/interaction surface: the
three package cards' `ring-1 ring-antique-gold` selected state, whether
the Chess-only callout appears/disappears correctly as events are added
or removed on Step 02 and the participant returns to Step 04, and whether
the pricing breakdown's numbers actually match hand-calculation for a few
manual scenarios (Registration Only + no events: ₹480 total; Registration
+ Food + Cricket: ₹480 + ₹620 + Cricket's own fee; Chess only + no
package selected: ₹250 only; Chess only + Registration + Food: ₹250 +
₹620 = ₹870).

## Suggested next phase

Step 05 — Review is the natural next step (currently plain Phase 02
form markup) — it already reads `state.pricing.lines`/`assumptions` in
the same generic way this phase's data shape supports, so no breaking
change was needed there. Confirm (Step 06) remains after that, plus
Theme and the landing page's Events teaser.
