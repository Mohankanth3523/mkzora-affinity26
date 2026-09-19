# Phase 19 — Rules & Regulations (/rules, "Laws of the Realm"): notes for future sessions

Persisted for continuity. See also `README.md` (project status) and
`docs/phase-18-success-page-notes.md`.

## What this phase delivered

- `data/rulesCategories.ts` (new) — regroups `data/rules.ts`'s six source
  `RuleSection`s into the eleven display categories the brief names
  (Registration, Eligibility, Identification, Sports, Culturals,
  Accommodation, Food, Discipline, Safety, Payment, General Conduct).
  Every string is referenced **by array index** from the original
  section arrays (via small `reg()`/`tnc()`/`sports()`/`cult()`/`acc()`/
  `restr()` lookup helpers — see "Decisions worth knowing about" for why
  helpers exist at all), never retyped, so wording can't drift between
  this file and `data/rules.ts`. Sports, Culturals, and Accommodation
  reuse their existing section wholesale; the other eight are curated
  subsets of the three cross-cutting sections (Registration, Terms &
  Conditions, Important Restrictions) — which is also why a handful of
  items appear under more than one heading (the source itself restates
  several Terms & Conditions clauses inside "Important Restrictions").
- `data/rulesVerification.ts` (new) — the refund-policy conflict from
  `docs/affinity-content-truth.md` §14(a) (three documents, three
  different refund statements), structured the same way
  `data/registrationVerification.ts`'s `pgEligibilityConflict` already
  is, so the Rules page can flag it with the same `EventBadge
  variant="verification"` pattern instead of inventing a new one.
- `components/design-system/Accordion.tsx` (new) — a generic,
  presentational accordion: native `<button aria-expanded>` headings (no
  custom keyboard handling needed — Tab/Enter/Space work for free),
  `role="region"` panels, a `grid-template-rows` 0fr/1fr open/close
  transition that respects `prefers-reduced-motion` via
  `motion-reduce:transition-none`, and a `twoColumn` prop for the
  brief's "desktop: two-column, mobile: accordion" ask (see below).
  Exported from the design-system barrel alongside everything else.
- `components/rules/RulesContent.tsx` (new) — builds the Accordion's
  eleven items from `ruleCategories`, rendering each as a gold-dot bullet
  list (the same visual treatment `EventDetailsModal` uses for event
  rules), with a `ConflictNotice` callout appended under Eligibility (the
  PG conflict) and Payment (the refund conflict).
- `app/rules/page.tsx` (rewritten) — the Phase 02 placeholder now renders
  the real "Laws of the Realm" heading and `RulesContent`.

## Truth-mode audit

- **Nothing is invented, reworded, or resolved.** Every bullet the page
  shows is the identical string already verified in `data/rules.ts` —
  `data/rulesCategories.ts` only decides which heading(s) a given string
  appears under, never what it says. The `req()` helper functions exist
  specifically so a typo'd index throws at build/typecheck time instead
  of silently reading a *different*, wrong rule.
- **Two conflicts, two flags, both already-established.** Neither the
  refund-policy conflict nor the PG-eligibility conflict is new to this
  phase — both were already documented in
  `docs/affinity-content-truth.md` and (for PG) already surfaced
  elsewhere in the wizard. This phase's only new judgment call was
  *where* on the Rules page each belongs (Payment and Eligibility,
  respectively) and building `data/rulesVerification.ts` so the refund
  one has the same reusable, typed home the PG one already had.
- **No category was invented content to fill it out.** Food, in
  particular, only has two source bullets (food/accommodation payment
  channel; accommodation-requires-food) — that's genuinely how little
  the source material says about food specifically, and the page doesn't
  pad it with anything not traceable to `data/rules.ts`.

## Decisions worth knowing about

- **Why `reg()`/`tnc()`/etc. helper functions instead of plain `REG[0]`
  indexing.** This project's `tsconfig` runs with
  `noUncheckedIndexedAccess: true`, so a raw array index has type
  `string | undefined`, not `string` — `tsc --noEmit` rejected the first
  draft of this file with ~30 errors. Rather than a non-null assertion
  (`REG[0]!`) at every one of the ~70 call sites, `req(source, index)`
  throws a descriptive error if an index is ever out of range, which
  keeps the file's own safety net doing something useful (catching a
  future index that outlives an edit to `data/rules.ts`) instead of just
  suppressing the type checker.
- **The eleven categories are a presentation regrouping, not a rewrite of
  `data/rules.ts`.** The six existing `RuleSection`s stay exactly as they
  were (still used verbatim elsewhere, e.g. any future per-category
  "general rules" panel the brief mentions for the Events Explorer) —
  `data/rulesCategories.ts` sits alongside them as an additional, purely
  additive view, so nothing that already depended on `allRuleSections`
  needed to change.
- **"Desktop: editorial two-column layout where useful. Mobile:
  accordion"** is implemented as one `Accordion` whose panels lay out in
  a `lg:grid-cols-2` CSS grid (one column below `lg`) — every panel is
  still a real, independently collapsible accordion item at *every*
  breakpoint. The alternative reading — desktop shows plain, always-open
  prose instead of collapsible panels — was rejected because eleven
  categories of prose stacked in two columns would be a wall of text
  with no scannable structure, and because keeping one accordion
  component behaving identically at every breakpoint is far less risk
  than maintaining two different rendering paths for the same content.
- **`headingLevel` was added to `Accordion` as a prop, not hardcoded.**
  The Rules page has only one heading above its accordion (`<h1>` — no
  intermediate `<h2>` section heading), so each category needs to be an
  `<h2>` to keep document heading order correct; a hardcoded `<h3>`
  would have skipped a level. Made it a prop (default `"h3"`) rather
  than special-casing Rules, since the next place this component gets
  reused (the brief's own suggestion: Contact FAQs) may sit under a
  normal `<h2>` section heading and need `<h3>` instead.
- **Collapsed panel content stays in the DOM** (not `hidden`/`display:
  none`) so the open/close transition can animate — `display: none`
  can't transition. It's marked `aria-hidden="true"` while collapsed so
  screen readers skip it. This is safe specifically because nothing
  inside a Rules panel is focusable (plain text bullets, no links or
  buttons) — a future reuse of `Accordion` for content *with* interactive
  elements inside a panel would need to also disable focus on collapsed
  content (e.g. `inert`), which this component does not yet do.

## Still-open limitation (unchanged since Phase 02)

Same npm-registry-unreachable constraint as every prior phase. Verified
this phase with the same method as always: strict `tsc --noEmit` over
the pure-logic file set — now 22 files (up from 20; `data/rulesCategories.ts`
and `data/rulesVerification.ts` added) — zero errors; esbuild
syntax-check over every `.ts`/`.tsx` file in the project — 72 files (up
from 68: `Accordion.tsx`, `RulesContent.tsx`, and the two new `data/`
files), zero failures; a script confirming all 156 `@/...` imports
resolve (up from 150). **Not yet seen in a real browser** — this phase's
biggest unverified surface is the accordion's actual keyboard/AT
behavior and the `grid-template-rows` open/close animation, neither of
which a syntax/type check can confirm. A manual pass should check: every
panel opens/closes on both click and keyboard (Tab to the heading
button, Enter/Space to toggle); the two-column layout reads sensibly at
1024px+ and collapses cleanly to one column below that; a screen reader
announces each panel's expanded/collapsed state correctly; and the two
conflict notices (Eligibility, Payment) are visually distinct from the
plain rule bullets around them.

## Suggested next phase

Contact (`app/contact/page.tsx`) is now the last brief-listed page still
on Phase 02 placeholder markup. Theme and the landing page's Events
teaser remain outstanding since Phase 02 as well.
