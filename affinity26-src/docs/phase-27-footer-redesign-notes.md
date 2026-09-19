# Phase 27 — Footer visual redesign: notes for future sessions

Persisted for continuity. See also `docs/phase-20-contact-footer-notes.md`
(the footer's original Phase 20 build, whose content/scope this phase
keeps unchanged) and `docs/phase-03-design-system-notes.md`/`docs/phase-
04-atmosphere-notes.md` (the `StarField`/`PalaceSilhouette` motifs reused
here).

## What prompted this phase

The user reported the footer "looks not attractive" and asked for it to
be made attractive — a visual-only request, not a content or structure
complaint (unlike Phase 21/23/24/25's "not responsive/not in proper
structure" reports). No new links, sections, or facts were requested or
added; every existing link, contact channel, and piece of copy is exactly
what Phase 20 shipped.

## Root cause

The footer was the one remaining part of the site with no atmosphere at
all — a `bg-royal-navy/40` translucent strip that mostly just let the
page's own dark background show through, no texture, a plain hairline
divider, and link styling that only changed text color on hover (no
underline, no icon color response). Every other section on the site
(Hero, Story, Theme, Cause, the Events teaser) already carries some
version of the night-sky/palace-silhouette atmosphere and richer
typography; the footer was the one exception, which is very likely what
read as "not attractive" next to everything above it.

## What changed

`components/layout/Footer.tsx`:

1. **A solid, textured band instead of a translucent strip.** The
   `<footer>` is now `bg-royal-navy` (opaque, not `/40`), giving it a
   real visual anchor as the page's closing element rather than bleeding
   into whatever's above it. It carries a static `StarField
   animated={false}` (motion would compete with someone reading fine
   print, unlike the Hero's own animated field) at low opacity, plus a
   `PalaceSilhouette` skyline along its *top* edge — the same reusable
   design-system components `Hero`/`Theme`/`Cause` already use, not a
   new asset, positioned to read as the horizon the page "descends"
   into rather than a second hero moment.
2. **A richer brand column.** The wordmark grew one step (`text-lg` →
   `text-xl`) and gained a hover color response (matching the header's
   own wordmark link); the institution line gained `leading-relaxed` for
   a less cramped read; and one of the two verified
   `festivalIdentity.taglines` ("Beyond the Sands, A Kingdom Awaits.")
   now appears as a small attributed quote with a left gold border,
   echoing the pull-quote treatment `Story`/`Theme` already use.
   Already-sourced copy (`data/content.ts`), not new marketing text.
3. **Column headers gained a small accent.** A `ColumnAccent` — a plain
   8px gold hairline under "Quick Links"/"Social" — so the two nav
   columns read as deliberately designed sections rather than a bold
   label sitting directly on top of a link list.
4. **Links gained real interactive feedback.** `FOOTER_LINK_CLASS` now
   fades in an underline on hover (`decoration-transparent` →
   `hover:decoration-warm-gold/60`, animatable via `transition-colors`
   since `text-decoration-color` is one of the properties it covers —
   unlike toggling `underline`/`no-underline` outright, which can't
   transition) instead of only swapping text color. Each Quick Link
   gained the same small gold-dot bullet (`LinkDot`) already used for
   list items elsewhere in the app (`EventDetailsModal`'s rules list,
   `RulesContent`), and both Social icons now shift from a muted gold to
   warm gold on hover/focus via `group-hover`, so the whole row responds
   together rather than just the text.
5. **A small closing colophon.** The final line (unchanged text:
   `{festivalIdentity.name} — {festivalIdentity.institution}`) now sits
   under a small centered `Crescent` mark instead of standing alone,
   echoing the wordmark's own crescent and giving the page a deliberate
   "close" rather than just trailing off after the divider.

Nothing about the footer's *content* changed: the same four Quick Links,
the same two Social channels (with their Phase 26 "(opens in a new tab)"
accessibility annotations untouched), the same institution/edition/
presented-by facts, and the same scoping decision (Phase 20) to leave the
full Organising Secretaries/Registration Desk phone lists to `/contact`
alone.

## Truth-mode audit

The only new copy on the page is `festivalIdentity.taglines[0]`, which
already existed in `data/content.ts` (`docs/affinity-content-truth.md`'s
two verified taglines) and was already used as design copy elsewhere in
the app — this phase just gives it a second, small appearance in the
footer's brand column. No fee, date, contact, or institutional fact was
added, reworded, or removed.

## Accessibility

- `StarField`/`PalaceSilhouette` are both already `aria-hidden="true"`
  internally and sit inside a `pointer-events-none` wrapper — pure
  texture, same as every other use of these components.
- The new underline-on-hover for footer links is a `hover`/
  `focus-visible` state change only; the existing `focus-visible:outline`
  ring (untouched) still governs keyboard-visible focus.
- Text contrast: the brand column's body text stayed at or above its
  previous opacity levels against `royal-navy` (now a fully opaque
  background rather than a translucent one over `midnight` — if
  anything a more consistent, slightly higher-contrast surface than
  before) — `text-ivory/90` and `text-desert-sand`/`/70`/`/90` all clear
  AA comfortably per the existing ratios in `docs/design-system-
  accessibility.md` (ivory ≥15:1, desertSand ≥10:1 against royalNavy at
  full opacity; reducing opacity by 10-30% here still leaves each well
  clear of the 4.5:1 floor). The one already-low-contrast line (the
  closing colophon, `text-desert-sand/60`) is unchanged from before this
  phase, not a new pairing introduced here.
- `min-h-11` touch targets on every link/icon-link are unchanged.

## Responsive behavior

- The three-column grid is still `grid-cols-1 sm:grid-cols-3` (unchanged
  breakpoint) — stacks below 640px, three columns from `sm` up. Gaps
  widened slightly (`gap-10` stacked, `sm:gap-8` in the row) to give the
  now-taller brand column (it gained a fourth line, the tagline quote)
  breathing room against its siblings on mobile.
- The atmosphere layer (`StarField`+`PalaceSilhouette`) is `absolute
  inset-0` inside an `overflow-hidden` parent exactly like every other
  use of this pattern (`Hero`, `Theme`, `AtmosphereBackground`) —
  already-audited-safe containment, no new overflow risk.
- `PalaceSilhouette`'s own `preserveAspectRatio="xMidYMax meet"` means it
  scales down as a whole rather than cropping at narrow widths, same as
  its other uses.

## Verification

- Strict `tsc --noEmit` over the pure-logic file list — still 24 files
  (`Footer.tsx` isn't on that list, same as every other layout/section
  component) — zero errors.
- `esbuild` syntax-check over every `.ts`/`.tsx` file — **77 files,
  unchanged** (an edit to an existing file, no new file) — zero
  failures.
- A script confirming all `@/...` imports resolve — **167, unchanged**
  (the footer's barrel import gained two more named imports —
  `PalaceSilhouette`, `StarField` — but that's still one `@/...` import
  statement, so the count of import *statements* doesn't change) — all
  resolve.

## Still-open limitation (unchanged since Phase 02)

Reasoned from source and Tailwind's documented behavior (e.g.
`transition-colors` covering `text-decoration-color`), not watched in a
real browser, since this sandbox still has no `node_modules`/`next dev`.
If the hover/underline treatment or the atmosphere layer's opacity still
doesn't look right once viewed live, the next useful detail to report is
exactly what looks off (too dark, too busy, a specific breakpoint) rather
than "not attractive" alone.
