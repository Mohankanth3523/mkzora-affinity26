# Phase 26 — Accessibility audit: notes for future sessions

Persisted for continuity. Requested as "PHASE 23 — ACCESSIBILITY AUDIT" in
the project's own original numbering, but three ad-hoc, user-reported
fixes (Theme, Cause, Events teaser) had already claimed 23–25 in this
project's running phase count since then — see `docs/phase-23-theme-
section-notes.md` through `docs/phase-25-events-teaser-notes.md`. Numbered
26 here to keep the sequence unambiguous; nothing about the brief's own
scope changed.

## Method

No real browser or screen reader is available in this sandbox (still no
`node_modules`/`next dev`, same standing constraint every phase's notes
have flagged), so this was a manual, file-by-file static read of every
`.tsx` component against the audit's own checklist — semantic HTML,
heading hierarchy, labels, keyboard navigation, focus-visible, modal
focus trapping, ESC handling, ARIA, contrast, reduced motion, touch
targets, form errors, screen readers, button semantics, link semantics,
image alt text — cross-checked against `docs/design-system-
accessibility.md` (the existing, already-verified contrast matrix) and
every prior phase's own accessibility notes (Phase 05's Navbar focus
trap, Phase 10's modal focus trap, Phase 12/14's form-error patterns,
Phase 19's Accordion, Phase 21's responsive/touch-target pass, Phase
22's `prefers-reduced-motion` audit).

## What was already solid (reviewed, not changed)

The overwhelming majority of the app was already built correctly the
first time, across nineteen prior content phases that each treated
accessibility as part of "done," not an afterthought:

- **Modals/overlays** (`EventDetailsModal`, `Navbar`'s mobile overlay):
  real `role="dialog"`/`aria-modal`, a working Tab focus trap, Escape-to-
  close, body-scroll-lock, and focus returned to the trigger on close —
  all already correct, matching the WAI-ARIA dialog pattern.
- **Every form field** (`ParticipantStep`, `DetailsStep`'s team rosters):
  a real `<label htmlFor>` for every input (visually hidden via
  `sr-only` where the field's purpose is already obvious from context,
  e.g. the category-filter search boxes), `aria-required`,
  `aria-invalid`, `aria-describedby` pointing at a `role="alert"` error
  message, errors that reveal only after blur/a failed submit attempt
  (never on first render), and focus moved to the first invalid field on
  a failed attempt.
- **The Accordion** (Rules page): a plain `<button aria-expanded>` per
  heading (native keyboard support), `role="region"` + `aria-hidden`
  panels, `motion-reduce:` guarded transitions.
- **Contrast**: a full, programmatically-computed WCAG matrix already
  exists (`docs/design-system-accessibility.md`) — re-checked here for
  anything added since, nothing new found.
- **Reduced motion**: one project-wide `@media (prefers-reduced-motion:
  reduce)` gate in `app/globals.css` already collapses every animation/
  transition duration — confirmed still the only such rule, no
  component works around it with its own duration.
- **Touch targets**: `min-h-11` (44px) is already the project-wide
  convention on every button/link/input; the one exception
  (`RegistrationProgress`'s 36px mobile step circles) was already
  reviewed and deliberately left in Phase 21 — it clears the 24px AA
  minimum (WCAG 2.5.8) comfortably, just not the 44px AAA target, and
  wasn't re-litigated here.
- **Images**: there are no `<img>` tags anywhere in the app — every
  visual is an inline SVG, each already either `aria-hidden="true"`
  (decorative) or `role="img"` + a real `aria-label` (the QR placeholder,
  Lantern/Crescent when given a `title`).

## What was fixed

1. **Heading hierarchy skip on `/events`** — `EventsExplorer` renders the
   page's one `<h1>` ("The Royal Courts") with nothing at `h2` before the
   card grid, but every `EventCard` inside it used a hard-coded `<h3>` for
   the event name — an `h1`→`h3` skip (fails axe-core's `heading-order`
   rule; WCAG 2.4.6/technique G141). `EventCard` gained a `headingLevel?:
   "h2" | "h3"` prop (`@default "h3"`, so nothing else changes), and
   `EventsExplorer`'s one call site now passes `headingLevel="h2"`. The
   registration wizard's `EventsStep` (the component's other caller)
   still gets the default `h3` — there, cards sit under `RegistrationStep`'s
   own `<h2>` ("Events") and `EventsStep`'s own `<h3>` ("Choose Your
   Tales"), so repeating `h3` for each card is a same-level sibling list,
   not a skip.
2. **Registration wizard step changes were invisible to keyboard/screen-
   reader users** — clicking Back/Next/a step-indicator circle changes
   `state.step` and re-renders `RegistrationStep`'s content in place (no
   route change), but focus stayed on whatever button was just clicked,
   and nothing else signaled that anything happened. `RegistrationStep`
   now moves focus to its own step heading on every step change (a
   `useEffect` keyed on `step`, guarded to skip the very first render so
   landing on `/register` doesn't yank focus on load) — the same
   `tabIndex={-1}`-programmatic-focus-target pattern `DetailsStep`
   already uses for its own error-scroll target. The heading's
   `aria-label` folds in the "Step N of 06" context that's otherwise only
   in a sibling `<span>` (mirroring `RegistrationProgress`'s own
   `aria-label` pattern for the same information), so a screen reader
   announces the full context — not just the step's short name — in one
   utterance.
3. **`dt`/`dd` outside any `<dl>`** — `PricingBreakdown`'s "Total" row was
   a `dt`/`dd` pair sitting in a sibling `<div>` after the `<dl>` closed,
   not inside one — a real HTML content-model violation (a `dt`/`dd` pair
   must live inside a `<dl>`, optionally wrapped in a `<div>`; sitting
   entirely outside one is invalid, and assistive tech that relies on the
   `<dl>` ancestor for the term/definition relationship has none to find).
   The Total row now lives inside the same `<dl>` as the line items
   (still its own wrapping `<div>`, which the `<dl>` content model
   permits); spacing was adjusted (`mt-4`→`mt-2` on that row) to land at
   the same visual gap now that the row also picks up the `<dl>`'s own
   `gap-2` flex spacing.
4. **External links didn't warn they open a new tab** — the four
   `target="_blank"` links (Instagram/WhatsApp, each appearing once in
   `Footer` and once in `ContactContent`) already had `rel="noopener
   noreferrer"` but gave no signal to screen-reader users that activating
   them leaves the page in a new tab. Each gained a trailing
   `<span className="sr-only"> (opens in a new tab)</span>` — the visible
   label and icon are unchanged, only the accessible name gained the
   context, per WCAG technique G201.

## What was reviewed and deliberately left unchanged

- **`DetailsStep`'s error-scroll container** (`tabIndex={-1}` +
  `focus:outline-none`) — considered removing the outline suppression so
  the container shows a visible focus ring when jumped to after a failed
  submit, but its sibling `role="alert"` error box already gives a strong
  visual/AT signal at the same spot, and the container itself was never
  meant to look like an interactive element — left as-is, unlike
  `RegistrationStep`'s new heading target (point 2 above), which is a
  genuine heading a user might reasonably expect a focus ring on.
- **`Accordion`'s `aria-hidden` collapsed panels** — verified their only
  current usage (`RulesContent`) contains no focusable elements (no
  links, no inputs) inside any panel, so `aria-hidden` on a collapsed
  panel can't strand a focusable element in a keyboard-inaccessible,
  screen-reader-hidden limbo. True today; would need re-checking if a
  future panel ever adds an interactive element.
- **`GoldButton`/`SecondaryButton`'s `href` variant silently ignoring a
  `disabled` prop** — the TypeScript prop union technically allows
  passing `disabled` alongside `href` (which would render a fully
  clickable `<Link>` with no visual or functional disabled state), but no
  caller anywhere in the app does this today (confirmed by reading every
  call site) — a real gap in the type's strictness, not a live bug, so
  left alone rather than reworking the shared button API mid-audit.
- **Checkboxes/radios styled at 16px** (`h-4 w-4`) — every one is wrapped
  in a `<label>` that also contains the visible text, so the actual
  click/tap target is the whole row, not the 16px box — already a
  Phase-12/14/15 pattern, not a new finding.

## Verification

- Strict `tsc --noEmit` over the pure-logic file list — still 24 files
  (every edit this phase touched a `.tsx` component, none of them on that
  list) — zero errors.
- `esbuild` syntax-check over every `.ts`/`.tsx` file — **77 files,
  unchanged from Phase 25** (every change was an edit to an existing
  file; no new files) — zero failures.
- A script confirming all `@/...` imports resolve — **167, unchanged
  from Phase 25** (no new imports added or removed at the module level)
  — all resolve.

## Still-open limitation (unchanged since Phase 02)

Every finding above was reasoned from the actual DOM structure and ARIA
semantics in source, not exercised with a real screen reader (VoiceOver/
NVDA/JAWS) or an automated tool (axe, Lighthouse) in a live browser,
since this sandbox still has neither. The heading-hierarchy and `dl`
findings in particular are exactly the kind of thing axe-core's automated
rules (`heading-order`, `dlitem`/`definition-list`) would have caught
instantly with a real DOM to scan — worth an actual axe/Lighthouse pass
once this runs somewhere with `next dev` and a browser.
