# Phase 25 — Events teaser section: notes for future sessions

Persisted for continuity. See also `docs/phase-23-theme-section-notes.md`
(the previous fix, for the sibling Theme section — this phase follows
the identical pattern) and `docs/phase-09-events-explorer-notes.md` (the
full `/events` page this teaser previews).

## What prompted this phase

The user reported that the landing page's Events section was also "not
responsive and not in proper structure" — the third such report in a
row, and pasted the section's exact visible text: "Events / 56 events
across sports, culturals, and online categories. / [Explore all
events](http://localhost:3000/events)". Like Theme before its Phase 23
fix, this was a literal leftover Phase 02 placeholder: a bare
`<section>`/`<h2>`/`<p>`/plain-text `<Link>` with no container, no
responsive classes, and none of the design-system components every
other landing-page section now uses. `README.md`'s own status list had
this flagged as the one remaining "❌ Not built yet" item since Phase 23.

## What this phase delivered

- **`components/sections/EventsTeaser.tsx`** (new): a centered heading
  ("Events" eyebrow, "The Royal Courts Await" as the `<h2
  id="events-teaser-heading">`, matching Theme's/Cause's heading
  treatment exactly), a `GoldDivider`, the same total-count sentence the
  placeholder used, a `grid-cols-1 sm:grid-cols-3` row of three
  `OrnamentalFrame` stat tiles (Sports / Culturals / Online, each a big
  gold number over a small uppercase label), and a `GoldButton
  href="/events"` reading "Explore All Events" in place of the old
  plain-text link.
- **`app/page.tsx`** now renders `<EventsTeaser />` in place of the
  inline placeholder markup; the unused `Link` and `eventCounts` imports
  were removed (that data now lives inside `EventsTeaser.tsx`, matching
  how `Story`/`Theme`/`Cause` each own their own data imports rather
  than the page importing on their behalf), and the file's top doc
  comment was updated to say every landing-page section is now a real,
  built component.
- No new data fields were needed — every number this section shows
  already existed in `data/events/index.ts`'s `eventCounts`.

## Truth-mode audit

- **Every number is a real `.length` count**, not a fabricated or
  rounded figure. `eventCounts.total` is the same figure the placeholder
  already showed (unchanged). The three stat tiles sum `eventCounts`'
  existing category fields:
  `sports`; `culturalOnstage + culturalOffstage` for Culturals;
  `onlineCultural + onlineEsports` for Online. No new category, no new
  arithmetic beyond addition of existing counts.
- **The three-way Sports/Culturals/Online split is not this component's
  own invention** — it mirrors the exact grouping
  `lib/events/eventGroups.ts`'s `EVENT_GROUP_CATEGORIES` already defines
  and that both the public Events Explorer and the registration wizard's
  Events step already use as their UI taxonomy. This phase only sums
  that same grouping into counts instead of using it to filter a list,
  so the three tiles' totals are guaranteed to always add up to
  `eventCounts.total` — they can never silently drift out of sync with
  each other or with the explorer page, since both read from the same
  `eventCounts` source.
- **"The Royal Courts Await" is not a new invented name** — "The Royal
  Courts" is the literal heading the real `/events` page already uses
  (`EventsExplorer.tsx`). Since this section exists purely as a preview
  of that page, it reuses that page's own name rather than coining a
  second name for the same destination — consistent with the project's
  design-copy guidance (tasteful marketing language is fine; inventing
  competing "official-sounding" names for the same thing is not).
- No fee, prize, eligibility, deadline, or any other event-specific fact
  appears in this section at all — it is purely a count/navigation
  teaser, same as the placeholder it replaces.

## Responsive behavior (the specific complaint this phase addresses)

- The stat-tile row is `grid-cols-1 sm:grid-cols-3` — a single stacked
  column below 640px, three columns from `sm` up. This is deliberately
  looser than Theme's two-quote grid (which waits until `lg`), because
  each tile here is short (one number, one label) rather than a full
  paragraph — three short tiles fit comfortably side by side well before
  desktop widths, and stacking them at 375px/390px/430px (where three
  columns would cramp) avoids squeezed text.
- `OrnamentalFrame`'s own padding (`p-6 sm:p-8` at `padding="md"`) stacks
  with `SectionContainer`'s `px-4 sm:px-6 lg:px-8` gutters exactly as
  audited for every other frame in Phase 21/23/24 — no non-wrapping flex
  row is used anywhere in this component (each tile is a plain
  `flex-col` stack of two `<span>`s), so there is no flexbox min-width
  overflow risk at any width.
- `SectionContainer width="content"` caps the whole section at 75rem, so
  the three tiles never stretch into oversized cards at 1440/1920px —
  the same containment already relied on for Theme's two-panel grid.
- The heading (`text-4xl sm:text-5xl lg:text-6xl`) and stat numbers
  (`text-4xl sm:text-5xl`) reuse the exact scale already audited safe
  for Cause's and Theme's headings in Phase 21/23.
- `GoldButton` already has its own `min-h-11` touch-target sizing
  (Phase 21-audited), so no new accessibility check was needed for the
  CTA itself — only the old bare-text `<Link>` it replaces lacked that.

## Verification

- Strict `tsc --noEmit` over the pure-logic file list — still 24 files
  (`EventsTeaser.tsx` isn't a pure-logic file on that list, same as every
  other landing section) — zero errors.
- `esbuild` syntax-check over every `.ts`/`.tsx` file — **77 files, up
  from 76** (one new file: `components/sections/EventsTeaser.tsx`) —
  zero failures.
- A script confirming all `@/...` imports resolve — **167, up from
  165** (`EventsTeaser.tsx` adds 2 new `@/...` imports; `app/page.tsx`
  drops one `@/...` import for `eventCounts` and gains one for
  `EventsTeaser`, a net wash on the page file itself) — all resolve.

## Still-open limitation (unchanged since Phase 02)

Reasoned from source, not watched in a real browser — same standing gap
every phase's notes have flagged, since this sandbox still has no
`node_modules`/`next dev`. With this phase, every section on the landing
page is now a real, built component — if anything still looks off once
viewed live, the next useful detail to report is exactly *what* looks
wrong (a specific viewport, an overlap, a gap) rather than "not
responsive" alone.
