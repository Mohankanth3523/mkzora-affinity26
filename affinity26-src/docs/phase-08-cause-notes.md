# Phase 08 — A Story Worth Seeing: notes for future sessions

Persisted for continuity. See also `README.md` (project status) and
`docs/phase-07-story-notes.md`.

## What this phase delivered

`components/sections/Cause.tsx` — a new Server Component, used by
`app/page.tsx` in place of the old Phase 02 placeholder `<section
aria-labelledby="cause-heading">`. Nothing else on the landing page
changed: Theme and the Events teaser are still Phase 02 plain markup.
One data addition: `data/content.ts`'s `aboutCause` gained a
`connectedEvent` field (`{ name: "Pencil Painting", theme: "A whole new
world beyond sight" }`) — see "Truth-mode audit" below for why.

## Truth-mode audit of every string in this section

- `aboutCause.description` — the organizer's own paragraph, rendered
  verbatim, unchanged from Phase 02. Checked line by line against the
  phase's own "do not invent" list: no charity name, no donation amount
  or percentage, no medical statistic, no beneficiary count appears in
  it — because none appears in `docs/affinity-content-truth.md` §3
  either. There was nothing to strip; the source material simply never
  states those things (§3 explicitly notes "no percentage or
  beneficiary named anywhere").
- `aboutCause.connectedEvent` — new field, sourced from
  `docs/affinity-content-truth.md` §3: *"the online **Pencil Painting**
  event's stated theme is 'A whole new world beyond sight' — art
  inspired by Aladdin/Arabian Nights that also 'conveys a message about
  blindness awareness and the value of vision.'"* This is the one place
  in the source documents where the cause is tied to a specific,
  named piece of programming, so it earns its own data field rather
  than being paraphrased into `description`. The component quotes only
  the event's name and its exact theme string — both directly from
  data — and wraps them in plain connective sentence structure ("this
  year's theme carries into the events too...") that asserts nothing
  beyond what source data already states.
- **"A Story Worth Seeing"** (the heading) is explicitly one of the
  project brief's own listed examples of acceptable design language —
  used and commented as design copy, not presented as an official fact,
  and kept structurally apart from the section's actual factual label
  ("The Cause · Blindness," a plain small-caps line, not part of the
  emotional headline).
- Nothing else needed inventing or omitting: no charity, no
  organization, no donation figure, no statistic, no beneficiary count
  was ever going to appear, because none exists in the source
  documents — this phase's "do not invent" list maps exactly onto §3's
  "information requiring organizer verification" gap (no percentage or
  beneficiary named).

## Decisions worth knowing about

- **Deliberately not Story's layout.** Story (Phase 07) is a two-column
  editorial grid; Cause is a single centered column. The brief describes
  Cause's tone as "respectful, emotional... hopeful," which reads better
  as one contemplative block than as another two-column "document"
  layout — and visually distinguishing consecutive sections was already
  a stated concern in Phase 07's own notes (SectionHeading was skipped
  there specifically so Story wouldn't look like every other section;
  the same reasoning applies here in reverse — Cause shouldn't look like
  Story either).
- **The "aperture of light" motif is deliberately abstract, not an eye
  illustration.** The phase brief asks for "subtle eye/light symbolism"
  — a literal eye (iris, pupil, eyelashes) risks reading as clinical or
  uncanny sitting next to a paragraph about vision loss, which cuts
  against "respectful... not exploitative or overly dramatic." Concentric
  rings plus a falling gradient beam read as light opening/arriving
  (hope, restored vision) without depicting an anatomical eye — the
  same "evoke, don't illustrate" approach `ParchmentTexture` took in
  Phase 07 for "parchment" (texture/mood, not a literal scan).
- **The motif is entirely static — no animation at all**, not even the
  `hero-reveal`-style fade Hero and Story use. Nothing in the phase
  brief asks for motion here, and `GoldDivider`'s own precedent (Phase
  03) already established that a decorative element shouldn't visibly
  move if that motion isn't earning its place — doubly true for a
  section this emotionally weighted, where any flourish risks reading
  as showy rather than solemn. `ScrollReveal` is still used, but only
  once, wrapping the whole centered block as a single fade-up rather
  than Story's per-column stagger — one quiet entrance, not a sequence.
- **Explicit z-index around the light motif**, same reasoning as
  `ParchmentTexture` in Phase 07: the beam/rings layer is `absolute`
  with no z-index of its own risk relative to plain in-flow text, so the
  decorative wrapper gets `z-0` and the content column gets `z-10`
  explicitly — text-above-decoration is guaranteed by the numbers, not
  incidental to DOM order.
- **No new color-opacity pairings.** Every text color in this section
  (`text-warm-gold`, `text-ivory`, `text-desert-sand`, `text-antique-gold`,
  all full-opacity) was already verified in
  `docs/design-system-accessibility.md` from earlier phases — no new
  table entry was needed this time.
- **`id="cause-heading"` was preserved** on the `<h2>` itself — `Navbar`'s
  existing `Cause` link points at `/#cause-heading`, and nothing about
  that anchor changed.

## Still-open limitation (unchanged since Phase 02)

Same npm-registry-unreachable constraint as every prior phase. Verified
this phase with the same method as always: strict `tsc --noEmit` (zero
errors on all pure-logic/token files — `data/content.ts`'s new field is
a plain object literal, so it's covered by this pass and typechecks
clean), esbuild syntax-check (zero errors, all 50 `.ts`/`.tsx` files in
the project, up from 49 in Phase 07), and a script confirming all 79
`@/...` imports resolve (up from 76). **The light motif and the overall
emotional pacing have not been seen in a real browser** — whether the
beam/aperture actually reads as intended (rather than, say, too faint to
notice, or too bright to be "restrained") is a judgment call that needs
`npm run dev` on a machine with real internet access to make.

## Suggested next phase

Theme (`aboutTheme`, already verified content in `data/content.ts`) is
the one remaining Phase 02 placeholder directly on the landing page
between Story and Cause — giving it the same treatment would finish the
landing page's narrative flow (Hero → Story → Theme → Cause) before
moving on to the Events teaser or the Events explorer itself.
