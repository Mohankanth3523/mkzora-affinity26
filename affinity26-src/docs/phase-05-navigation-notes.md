# Phase 05 — Global Navigation: notes for future sessions

Persisted for continuity. See also `README.md` (project status) and
`docs/phase-04-atmosphere-notes.md`.

## What this phase delivered

`components/layout/Navbar.tsx` was rewritten from Phase 02's plain
placeholder into a real client component (`"use client"` — it needs
scroll position, open/close state, and keyboard handling, none of which
work in a Server Component). Three other files got small, necessary
supporting edits:

- `app/layout.tsx`: `<main>` now has `pt-16 sm:pt-20` — a fixed-position
  header takes no space in normal flow, so without this every page's
  content would sit *underneath* the header once it goes solid on
  scroll. Matches Navbar's own `h-16`/`h-20`.
- `app/globals.css`: added `:where([id]) { scroll-margin-top: 6rem; }` so
  an in-page anchor jump (Story/Cause today; anything else later) lands
  below the fixed header instead of having its target heading hidden
  underneath it.
- `components/design-system/GoldButton.tsx` and `SecondaryButton.tsx`:
  their `href` branch now forwards `onClick` to the rendered `Link`
  (it was silently dropped before). Needed so the mobile overlay's
  Register button can close the overlay on click; harmless, additive
  change for every other existing use.

## Behavior implemented, mapped to the request

- **Desktop**: wordmark + Story/Cause/Events/Rules/Contact + a Register
  `GoldButton`, all in a `hidden lg:block` row (below `lg` /1024px it's
  replaced by the hamburger).
- **Scroll behavior**: `bg-transparent`/`border-transparent` below 24px
  of scroll, `bg-midnight/95` + `border-antique-gold/25` above it, cross-
  faded with `transition-colors duration-base`.
- **Mobile**: a single hamburger button (icon morphs to `×` via CSS
  transforms, no icon-library dependency) opens a full-screen
  `role="dialog" aria-modal="true"` overlay with its own visible close
  button, centered nav links, and the Register CTA.
- **Accessibility**: real focus trap (Tab/Shift+Tab cycle within the
  overlay's own focusable elements, computed live via `querySelectorAll`
  rather than a hardcoded list), Escape closes and returns focus to the
  trigger button, `document.documentElement.style.overflow = "hidden"`
  locks background scroll while open, `aria-expanded`/`aria-controls` on
  the trigger, `aria-current="page"` on the active route link, and
  everything already gets a visible focus ring for free from Phase 03's
  global `:focus-visible` rule.
- **Active state**: implemented for the four route-based links
  (`pathname === href`) via `usePathname`. Story/Cause are hash links
  into `/`, not routes of their own — highlighting whichever section is
  currently scrolled into view would need scroll-spying, which is a
  meaningfully bigger feature than "navigation," so they never show
  active state. This matches the brief's "active state *where useful*"
  wording rather than stretching to cover a case that needs its own
  design decision.

## A real layout bug caught and fixed while building this

First draft had the mobile overlay at `z-50` (correctly above the header's
`z-40`, so it fully covers the page) but reused the *same* header trigger
button, now showing an `×`, as the only way to close it — except that
button is bencath the opaque overlay once it's open, so it would have
been **invisible**, leaving only Escape or tapping a nav link as ways
out. Caught this by re-reading the z-index/paint-order reasoning rather
than assuming "the icon toggles, so closing works" — fixed by giving the
overlay its own visible close button (which is also now where initial
focus lands, and the first stop in the focus trap). The original trigger
button stays in the DOM in the old (now-hidden) position — kept there
rather than removed so it doesn't shift layout — but is `tabIndex={-1}`'d
while the overlay is open, on top of the trap already making it
unreachable in practice.

## Decisions worth knowing about

- **Links only point at what exists today.** The project brief lists
  Story/Cause as required nav items, but the landing page's real
  hero/story/cause *sections* don't exist yet (still Phase 02
  placeholder markup) — except the placeholder already happens to have
  `id="story-heading"` and `id="cause-heading"` on its `<h2>`s, so
  linking there is a real, working anchor today, not a promise. No route
  or anchor was invented to satisfy the nav's label list.
- **`lg` (1024px) is the desktop/mobile nav breakpoint** — five labels +
  a wordmark + a CTA button doesn't comfortably fit narrower than that
  without wrapping or shrinking type past what "premium and minimal"
  should allow.
- **No new animation, no new dependency.** The hamburger↔× morph is three
  `<span>`s with CSS `transform`/`opacity` transitions (already covered
  by the Phase 03 global reduced-motion rule); no icon library was added.

## Still-open limitation (unchanged since Phase 02)

Same npm-registry-unreachable constraint as every prior phase. Verified
this phase with the same method as always: strict `tsc --noEmit` (zero
errors on all pure-logic/token files), esbuild syntax-check (zero errors,
46 `.ts`/`.tsx` files in the checked directories), and a script
confirming all 63 `@/...` imports resolve. The focus-trap and scroll-lock
logic is standard, hand-verified-by-reading DOM/React semantics, but
**has not been exercised in a real browser with a keyboard** — that,
plus confirming the header's scroll-triggered color change actually
looks right, needs `npm run dev` on a machine with real internet access.

## Suggested next phase

Same as after Phase 04: the design system, atmosphere, and now the
navigation are all built and verified but still sitting unused behind
Phase 02's placeholder page markup. Building the real landing page (Hero
→ Story → Cause → Events teaser) would finally use `SectionHeading`,
`GoldButton`, `OrnamentalFrame`, etc., and would be the first page where
Navbar's scroll-based transparency actually has a full-bleed hero to be
transparent *over*.
