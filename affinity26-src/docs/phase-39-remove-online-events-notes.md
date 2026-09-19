# Phase 39 — Remove Online Events completely: notes for future sessions

Persisted for continuity. This phase removed the "Online Events" category
(9 events: Photography, Reels, and 7 other `online-cultural` records — see
`data/events/online.ts`) from every participant-facing surface of the
site, while explicitly preserving the confirmed direct-contact events that
happen to share the word "online" (the 4 `online-esports` titles:
E-Football, FIFA, PUBG, Free Fire).

## The request

A long, detailed specification titled "PHASE — REMOVE ONLINE EVENTS
COMPLETELY," reproduced in full in this session's own working notes. The
operative distinctions the brief itself drew, load-bearing for everything
below:

- Remove the **Online Events category** — not "every event with an online
  component." The brief gave an explicit, confirmed direct-contact list
  (Chess, Badminton, the Track & Field group, Shot Put, Discus Throw,
  Javelin, Free Fire, PUBG, PES/E-Football, FIFA, Short Film, Sollal Vel)
  and warned directly against sweeping those up by accident.
- TRUTH MODE, repeated: never invent a replacement, never rename an online
  event into an offline one, never reclassify an online event into
  Sports/Culturals unless the source explicitly calls it offline/on-campus,
  report — don't guess — any genuine ambiguity.
- Don't blindly strip the word "online" from unrelated legitimate text —
  only touch wording that belongs to the removed category.
- A stale online event id in old persisted `localStorage` state must be
  "removed safely from the active registration selection," not merely
  hidden from view.
- "Do not make unrelated changes."

## The two "online" concepts this phase had to keep apart

The codebase already had two independent things that both happen to
involve the word "online," and conflating them would have violated the
brief's own explicit warning:

1. **The `online-cultural` category** (`registrationMode: "standard"`) —
   9 events (Photography, Reels, Painting, and others — see
   `data/events/online.ts`). This is the actual "Online Events" bundle the
   brief asked to remove.
2. **The `online-esports` category** (`registrationMode: "direct-contact"`,
   `mode: "online"`) — 4 events (E-Football, FIFA, PUBG, Free Fire). These
   share the `mode: "online"` field and the word "online" in their
   category name, but they're on the brief's own confirmed
   must-stay-visible list, and `registrationMode` — not `mode` or
   `category` — is what actually governs whether an event can enter the
   registration/package flow. Filtering by the literal string "online"
   anywhere in this codebase would have incorrectly swept these up too.

The guiding principle applied everywhere below: **`registrationMode`
(standard vs. direct-contact) is orthogonal to `mode`/`category`
(online vs. offline) — removing "the Online Events category" means
excluding the online-*cultural* category specifically, never filtering by
the literal `mode === "online"` field.**

## What changed

### 1. `data/events/index.ts` — `allEvents` no longer includes `onlineCulturalEvents`

`onlineCulturalEvents` is still imported and re-exported (its own source
file, `data/events/online.ts`, is untouched — official source content
isn't deleted), but it's no longer spread into `allEvents`, the single
array every participant-facing surface reads from. This is the one change
that does almost all of the removal work: every downstream consumer
(Events Explorer, registration wizard, search, counts, `getEventById`)
automatically stops seeing those 9 events without needing its own
separate "is this an online-cultural event" check.

`onlineEsportsEvents` stays in the `allEvents` spread, unchanged.

Also removed: `eventsByCategory`/`getEventsByCategory` — confirmed unused
anywhere else in the repo (grepped before deleting), dead code the brief's
own "remove obsolete... logic where no longer required" asked for.

`eventCounts` dropped `onlineCultural` (nothing left to count) and renamed
`onlineEsports` → `esports`, since the "Online" landing-page stat tile it
fed is gone (see EventsTeaser below) and this is now its own honest count
rather than half of a combined online bucket.

### 2. `lib/events/eventGroups.ts` — the category filter drops "Online"

`EventGroup` shrank from `"all" | "sports" | "culturals" | "online"` to
`"all" | "sports" | "culturals"`; `EVENT_GROUPS`/`EVENT_GROUP_LABEL`/
`EVENT_GROUP_CATEGORIES` all updated to match. This is the public
`/events` page's filter bar (`EventsExplorer.tsx` reads these directly) —
`[ALL EVENTS][SPORTS][CULTURALS]` is now the complete, final set, exactly
as the brief specified.

**Deliberately not done:** reclassifying the 4 `online-esports` events
into `sports` or `culturals` so they'd have a matching tab. The brief's
own TRUTH MODE instruction is explicit that an online event should only
move into Sports/Culturals "if the existing official source explicitly
identifies it as an offline/on-campus event" — nothing in the source
material does that for E-Football/FIFA/PUBG/Free Fire. They remain fully
visible under "ALL EVENTS" (satisfying "direct-contact events remain
available") without inventing a classification the source doesn't
support. `EventsExplorer.tsx` itself needed no logic changes — it already
read `EVENT_GROUPS`/`EVENT_GROUP_CATEGORIES` rather than hard-coding the
old four-way split; only its own doc comment was updated for accuracy.

### 3. `components/registration/EventsStep.tsx` — the mode-tab bar removed entirely

This was the more significant architectural call. Before this phase, the
Events step (registration wizard Step 02) had its own separate mode filter
— "All Events / Offline / Online" — layered inside the "Standard AFFINITY
Events" section, independent of the public page's category filter. Once
`online-cultural` events are excluded from `allEvents`, every remaining
`registrationMode === "standard"` event is `mode === "offline"` — the
"Online" tab would permanently show zero results, and "All Events" and
"Offline" would always render identically. Keeping either as a live
control would have been dead UI, not a removal "that feels intentional and
clean" (the brief's own phrase). So the entire tab bar — state, type,
label maps, the two-groups-when-"all" branching — was deleted; standard
events now render as one plain grid, the same way direct-contact events
already did. Search (by name/description, across `allEvents`) is
unchanged and still narrows both the standard and direct-contact
sections. Reasoned as a narrowly-scoped, necessary consequence of the
removal rather than an out-of-scope redesign — nothing about the section
headings, the Standard/Direct-Contact split, or the selected-events
summary above it changed.

### 4. `components/sections/EventsTeaser.tsx` — homepage "Online" stat → "Esports"

The landing page's three-tile stat row (Sports / Culturals / Online) had
its third tile computed as `onlineCultural + onlineEsports`. With the
online-cultural half of that gone, the tile was replaced with an
"Esports" tile counting only the 4 `online-esports` events (not folded
into the Sports tile, which is `sportsEvents.length` by category and would
double-count nothing that isn't already there — esports events are their
own category, never `"sports"`). A new hand-drawn `EsportsGlyph`
(controller icon) replaces the old `OnlineGlyph` (monitor icon); the
supporting paragraph now reads "...across sports, culturals, and esports
categories." instead of "...online categories." Same 3-column grid, same
layout — no redesign, per the brief's own "do not redesign the homepage
unnecessarily."

### 5. `components/sections/Cause.tsx` — the "online Pencil Painting" blockquote removed

The blindness-awareness Cause section had one blockquote tying the year's
theme to "the online Pencil Painting event." Pencil Painting is one of the
9 removed `online-cultural` events — a participant can no longer find or
select it anywhere on the site, so a promotional aside pointing at it
would have been actively misleading. The blockquote's JSX was removed;
`data/content.ts`'s underlying `aboutCause.connectedEvent` field (the
sourced fact itself) was **not** deleted — only annotated with a comment
explaining it's no longer rendered — per "do not delete official source
documents."

### 6. `data/rules.ts` — three bullets specifically about the removed category

- `culturalsGeneralRules`: removed "Online-event participants receive an
  e-certificate." — unambiguous, names the category directly.
- `culturalsGeneralRules`: removed "Last date for online-entry submission:
  26 September 2026." — see **Judgment call** below.
- `restrictions`: removed "Bot likes / artificial engagement are banned
  across every Instagram-likes-judged online event." — unambiguous, names
  "online event" directly.

**Deliberately left unchanged:** `culturalsGeneralRules`'s "Bot likes are
not encouraged and lead to disqualification." (general, doesn't name
"online," still applies to other events' likes-judged categories);
`restrictions`'s "AI-generated content is banned in Short Film, Movie
Scene Recreation, English Poetry, and Tamil Poetry..." (two of those four
named events are now-removed online-cultural events, but the bullet itself
contains no "online" wording and is sourced content about a different
subject — content-authenticity rules — not part of the Online Events
category description; trimming named events out of an official rule
felt like editing sourced content beyond this phase's stated scope, so it
was left exactly as transcribed); `accommodationRules`'s "...not at online
registration" (about registering via the site's general online link,
confirmed unrelated by a full-repo runtime scan — see Verification).
`sports.ts`'s Carrom rule "Online registration mandatory." — confirmed by
reading its surrounding rules array: this is Carrom's own (`standard`,
offline sports) requirement that participants register via the official
online registration link, the same meaning as `registrationRules`'s
existing "Must be completed only through the official registration link"
bullet — completely unrelated to the Online Events category, left
untouched.

### 7. `lib/registration/state.ts` — `HYDRATE` now drops stale event ids

The brief's own requirement: a registration started before this phase
could have a removed `online-cultural` event id sitting in a participant's
persisted `localStorage` state. Every component that renders
`selectedEvents` (`EventsStep`, `ReviewStep`, `RegistrationSummary`,
`RegistrationPass`) already maps through `getEventById` and drops
unresolvable ids before rendering, so nothing was ever going to crash —
but the invalid id would otherwise sit in `state.selectedEvents` forever,
silently re-persisted on every save. The `HYDRATE` action (fired once on
mount from `RegistrationProvider`, `lib/registration/context.tsx`) now
filters `selectedEvents` down to ids that still resolve via
`getEventById`, before the hydrated state is ever used — one place, not
duplicated per consumer. `withRecalculatedPricing` is a no-op either way,
since `calculatePricing` only ever depends on the selected package, never
on which events are selected (unchanged since Phase 31).

## What was *not* touched

- `data/events/online.ts` — both `onlineCulturalEvents` and
  `onlineEsportsEvents` are still there, complete, unmodified. Official
  source data was excluded from one downstream array, never deleted.
- `types/event.ts` — `EventCategory` still includes `"online-cultural"`,
  `EventMode` still includes `"online"`. These are data-model types, not
  UI groupings; narrowing them would have meant either deleting the
  now-archived `onlineCulturalEvents` records' own type or reclassifying
  them into a category the source doesn't support — both out of scope.
- `components/design-system/EventBadge.tsx` — `CATEGORY_LABEL["online-
  cultural"]`/`CATEGORY_LABEL["online-esports"]`/`MODE_LABEL.online` all
  kept. These are factual per-event labels (an esports card's own mode
  badge still legitimately reads "Online"), not "Online Events" category
  promotional UI — removing them would have broken the retained esports
  cards' own accurate badges.
- `lib/events/eventLabels.ts`'s `MODE_LABEL.online = "Online"` — same
  reasoning, still used by the retained esports events' own mode badges.
- `lib/registration/pricing.ts` / `data/pricing.ts` — already fully
  package-only since Phase 31; no online-event fee existed to remove.
- `data/contacts.ts` — no dedicated "Online Events" contact group exists;
  per-event contacts for removed events simply stop being reachable
  (their events are gone), with no special-casing needed since contacts
  are stored per-event, not deduplicated across events that happen to
  share a person.
- `EventCard.tsx` / `EventDetailsModal.tsx` — already registrationMode-
  aware and read events strictly through `getEventById`/props; needed no
  changes to correctly stop showing removed events.
- Navigation (`Navbar.tsx`) — grepped, no "Online Events" nav item ever
  existed to remove.
- `app/` route files — grepped, no "online" text found anywhere.

## Judgment call — flagged, not silently resolved

`culturalsGeneralRules`'s "Last date for online-entry submission: 26
September 2026." was removed as specifically about the removed category's
submission mechanism (a generic "online entry" portal), rather than kept
as a still-relevant deadline. This is a judgment call, not a certainty:
several *retained* cultural events happen to share the same calendar date
(2026-09-26) as their own individually-named deadline field (email/
WhatsApp/Google Drive/pen-drive submission, not a generic online portal).
The date itself isn't being removed from any event's own `deadline`
field — only this one general-rules bullet, whose wording ("online-entry
submission") describes a submission *mechanism* that no longer has any
remaining event using it. **[VERIFY WITH ORGANIZER]** if this general
bullet was meant to also apply more broadly than the removed online
bundle.

## Testing

Ran the data layer, filters, search, and the new hydration sanitizer
through `tsx` at runtime, not just type-checked:

- `allEvents.length` is 47 (18 sports + 16 cultural-onstage + 9
  cultural-offstage + 4 online-esports); `onlineCulturalEvents.length` is
  still 9 (archived, confirmed absent from `allEvents`).
- `eventCounts` = `{ total: 47, sports: 18, culturalOnstage: 16,
  culturalOffstage: 9, esports: 4 }`.
- `getEventById()` on a removed online-cultural id (`pencil-painting`)
  returns `undefined`; on a retained esports id (`pubg`) resolves
  correctly with `registrationMode: "direct-contact"`, `mode: "online"`.
- The confirmed direct-contact list resolves to exactly 12 records
  (the brief's 15 named items collapse to 12 because "Track — 100m/200m/
  400m/Relay" is one combined `sports.ts` record, not four separate ones)
  — Chess, Athletics — Track (combined), Javelin Throw, Discus Throw, Shot
  Put, Badminton, Sollal Vel, Short Film, E-Football, FIFA, PUBG, Free
  Fire — matching the brief's confirmed list exactly.
- `EVENT_GROUPS`/`EVENT_GROUP_CATEGORIES` resolve to exactly
  `["all","sports","culturals"]` with no "online" key anywhere.
- A search simulation of the Events step/Explorer's own filter logic:
  searching "pencil painting" or "photography" (removed online-cultural
  event names) returns zero results; searching "chess" or "pubg"
  (retained direct-contact events) still resolves correctly.
- `HYDRATE` sanitization: a simulated pre-Phase-39 persisted state with
  `selectedEvents` containing one stale online-cultural id, one valid
  retained sports id, and one valid esports id — after `HYDRATE`, the
  stale id is gone, both valid ids remain, and pricing recalculates
  correctly (package-only total, unaffected either way). A second case
  with *only* stale ids hydrates to an empty `selectedEvents` array
  (not an error). Confirmed `SELECT_EVENT`/`DESELECT_EVENT` still work
  normally on the sanitized state afterward.
- A full-repo runtime scan of every `data/rules.ts` bullet across all 6
  `RuleSection`s for the word "online" (case-insensitive): after the three
  removals, exactly one hit remains —
  `accommodationRules`'s "...not at online registration" — confirmed
  legitimate/unrelated (registering via the general online link, not the
  removed category) and left untouched, exactly as planned.

Not verified: this sandbox still has no `next dev`/`next build`, so the
actual rendered pages (the Events Explorer's filter buttons, the
registration wizard's simplified Events step grid, the homepage's new
Esports tile, the Cause section without its blockquote) are unverified
against a real rendered page — reasoned through by hand and confirmed at
the logic/data level via `tsx`, not screenshotted.

## Verification

- Strict `tsc --noEmit` over the pure-logic file list — **29 files**
  (unchanged — every edited file in this phase, including the newly
  event-data-dependent `lib/registration/state.ts`, was already on this
  list from earlier phases) — zero errors.
- `esbuild` syntax-check over every `.ts`/`.tsx` file in the repo —
  **89 files** (unchanged — no files added or removed, eight edited in
  place) — zero failures.
- A script confirming every `@/...` import resolves — **179** (up from
  178 — `lib/registration/state.ts` gained one new `@/data/events`
  import; nothing was removed) — all resolve.
- Ran `data/events/index.ts`, `lib/events/eventGroups.ts`,
  `lib/registration/state.ts`'s `HYDRATE` case, and a search simulation
  through `tsx` at runtime — see Testing above.
- `npm run lint` / `npm run build` still cannot run in this sandbox — no
  `node_modules`, no npm registry access. Unchanged limitation from every
  previous phase.

## Still-open limitations

- Not verified in a real browser — see "Not verified" under Testing
  above, including mobile layout (no horizontal overflow with the shorter
  filter bar / no mode-tab bar) and keyboard/focus behavior of the
  simplified Events step.
- The "Last date for online-entry submission" removal is a judgment call,
  not a certainty — see **Judgment call** above, flagged
  `[VERIFY WITH ORGANIZER]`.
- A pre-Phase-39 in-progress registration in `localStorage` with a stale
  online-cultural event id is now handled (see `HYDRATE` sanitization
  above) — this phase closes the one specific gap the brief called out.
