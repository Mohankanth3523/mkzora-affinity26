# Phase 28 — Cinematic intro: notes for future sessions

Persisted for continuity. Built around three assets the user added directly
to `public/intro/` on their own machine before this phase started:
`affinity-lamp.png`, `affinity-genie.png`, `affinity-intro.mp4` (confirmed
present, via the device bridge, before writing any code — see "Asset
naming" below for one correction to the phase brief's own wording).

## What was asked for

A full-viewport cinematic opening that plays once per browsing session,
before the homepage: the lamp scene, then the supplied video (three taps →
lamp activation → smoke → genie emerges → full reveal), then a smooth
transition into the real `Hero`. Explicitly **not** a CSS recreation of the
animation — the video is the primary asset. Session-gated (first visit
plays it, later navigation within the same tab skips it), a always-visible
"Skip Intro" button, `prefers-reduced-motion` support, and a graceful
static-image fallback if the video can't play at all.

## Where it lives

`components/intro/CinematicIntro.tsx`, mounted once, first, in
`app/page.tsx` — and nowhere else. That placement alone (not any
route-checking logic) is what makes "never plays again on `/events`,
`/register`, etc." true: those pages simply never render this component.
Returning to `/` again in the same tab is what `sessionStorage` (via the
new `lib/intro/introStorage.ts`, mirroring `lib/registration/storage.ts`'s
try/catch-safe pattern) guards against instead.

## Asset naming — one correction from the phase brief

The brief's own text named the second image `affinity-geniwithlamp.png`;
the file actually present in `public/intro/` (confirmed via the device
bridge before writing any code) is `affinity-genie.png`. The component
references the real filename. Flagging this explicitly because a silent
"close enough" substitution is exactly the kind of drift the project's
truth-mode discipline exists to catch, even though this is an asset
filename rather than an official fact.

## The three-phase state machine

`"active"` (video/poster playing, Skip visible) → `"exiting"` (700ms
opacity fade, matching the project's existing `duration-ornamental` token)
→ `"hidden"` (component returns `null`). One `finish()` function drives the
transition from `"active"`/`"exiting"` regardless of *why* — the video's
own `onEnded`, a Skip click, or the video being given up on — guarded by a
ref so the three triggers can never double-fire it (e.g. Skip clicked in
the same instant `onEnded` fires).

## Failure handling — "do not leave the user stuck"

Two independent paths both lead to the same graceful fallback
(`handleUnavailable`): the video's own `onError`, and an 8-second
stuck-timer started on mount and cleared by `onPlaying`/`onCanPlay`. The
timer exists because `onError` alone doesn't cover every real "can't play"
case the brief calls out — a slow connection that never finishes buffering,
an unsupported codec that stalls rather than errors, or a mobile browser
that silently declines autoplay without ever firing `error`. Either path
holds the static lamp image (already always rendered, doubling as the
`<video>` element's own `poster`) for 1.4s — a deliberate beat, not an
abrupt cut — then continues exactly as if the video had played normally.

## The no-flash problem, and why there are two separate checks

A session-gated, client-only overlay in a server-rendered Next.js app has
an unavoidable tension: the server doesn't know whether this is a repeat
visit, so *something* about the very first paint won't match what the user
should ultimately see. This project resolves it in the direction that
matters most for the brief's "appears BEFORE the main website" framing:
the component's default render state (both server-rendered HTML and
React's first client pass) is `"active"` — visible — so a genuine
first-time visitor never sees a flash of the raw homepage peeking out
before the intro cuts in.

That default costs repeat visitors a symmetric flash in the other
direction — one frame of the full overlay before it's dismissed — so two
separate mechanisms close that gap from both sides:

1. `NO_FLASH_SCRIPT` — a plain inline `<script>`, not a React effect. It
   runs as the browser parses the server-rendered HTML, before React's own
   JS bundle has even finished loading, and directly sets
   `#affinity-intro-root`'s `style.display = "none"` if the same
   `sessionStorage` flag or `prefers-reduced-motion` query says to skip.
   This is the same technique dark-mode toggles use to avoid a flash of
   the wrong theme (e.g. `next-themes`) — a parser-blocking script reading
   a synchronous browser API, ahead of any framework.
2. `useLayoutEffect` (not `useEffect`) in the component itself — the
   mechanism for everything the inline script can't do (it can't touch
   React state, so React doesn't actually know to render `null` on
   subsequent re-renders without this). `useLayoutEffect` specifically
   because it runs before the browser paints the *next* frame, closing the
   gap as tightly as a React effect can.

Both check the exact same two conditions independently, deliberately —
not one computing a value the other trusts, since the inline script can't
share React state and the effect can't reach a global outside module
scope cleanly across the server/client boundary in this project's
existing conventions.

## Keeping the real nav out of the tab order while the intro is up

A `position: fixed` overlay with a high `z-index` visually covers the page
underneath, but it does *nothing* to the DOM's own tab order — a keyboard
user could `Tab` straight into the live `Navbar` (and reach `Footer` by
`Shift+Tab` from the top) while the video is still playing, even though
neither is visible. `Navbar`'s `<header>` and `Footer`'s `<footer>` each
gained a stable `id` (`site-navbar` / `site-footer`) for exactly this:
while `CinematicIntro`'s phase isn't `"hidden"`, an effect sets the
`inert` attribute on both by id — the modern, single-attribute way to pull
a subtree out of both the tab order and the accessibility tree at once,
restored on cleanup. The same effect also locks `documentElement`
scrolling (matching the exact mechanism `Navbar`'s own mobile-menu overlay
already uses — see `Navbar.tsx`) and moves focus to the Skip button on
mount, so a keyboard/screen-reader user lands on the one control that
matters immediately rather than wherever the browser put focus by
default.

## `prefers-reduced-motion`

Checked once, in the same `useLayoutEffect` that checks `sessionStorage` —
if true, the video is never mounted at all (no autoplay attempt, nothing
to skip), and `finish()` runs immediately. "Show the main website
immediately with a short elegant fade" is satisfied without any bespoke
reduced-motion-only transition: the project's existing global reduced-
motion gate (`app/globals.css`) already collapses every `transition-
duration` site-wide to ~0.01ms, so reusing the intro's own normal
`"exiting"` opacity-fade mechanism for this path gets both "immediately"
and "fade" for free — the same reasoning `Hero`'s own six-stage entrance
already relies on for reduced-motion users, not a new pattern.

One related fix this surfaced: the reduced-motion gate makes the 700ms
CSS fade *look* instant, but the component was still mounted at full
viewport size for the real 700ms (the `setTimeout` inside `finish` that
actually unmounts it doesn't get shortened by CSS) — meaning a reduced-
motion user would see the homepage instantly yet have their first clicks
silently swallowed by an invisible-but-present overlay for most of a
second. Fixed by adding `pointer-events-none` to the overlay root the
moment `phase === "exiting"`, for all users, not just reduced-motion ones
(harmless either way, correct for both).

## Images: plain `<img>`, not `next/image`

Every visual in this project until now has been inline SVG (confirmed in
Phase 26's accessibility audit — "there are no `<img>` tags anywhere in
the app"), so this is the project's first use of a raster image. Given
this phase landed on the same day the project's Cloudflare Pages
deployment was first gotten working (see the top-level chat history / git
log around this phase), and Next's built-in image-optimization pipeline
(`next/image`) has known extra configuration requirements on some
non-Vercel hosts, this phase deliberately uses plain `<img>` tags instead
of introducing an unverified dependency into a deployment pipeline that
had just been stabilized. Both images are marked `alt=""` (decorative,
matching Phase 26's established pattern for the project's other purely
visual elements) and there's a separate `sr-only` paragraph describing the
sequence in words for anyone who can't see the video.

The genie image specifically is only rendered once `phase === "exiting"`
— never before — both because "do not load unnecessary assets before the
intro" applies to it as much as to anything else, and because there is
nothing for it to do until that moment: it's the exit beat (a soft
gold/blue radial flare crossfading with the still, "the genie has opened
the magical world of AFFINITY '26," per the brief), not part of the
initial lamp-scene/video presentation.

## Truth-mode audit

No official fact is involved anywhere in this phase — no fee, date,
eligibility, or contact information appears in the intro. The sr-only
description text ("An animated Arabian Nights sequence...") is plain
design/marketing description of what's on screen, in the same spirit as
the brief's own listed examples ("Enter the Story," "A Story Worth
Seeing").

## Accessibility

- `role="region"` + `aria-label` on the overlay; a `sr-only` text
  description of the video's content for anyone who can't perceive it.
- `Navbar`/`Footer` marked `inert` while the intro is active or exiting —
  see above.
- Focus moves to the Skip button on mount; it's a real `<button>`
  (native keyboard activation, no custom key handling needed) and works
  immediately — no delay, no disabled state, from the very first render.
- `prefers-reduced-motion` fully respected — see above.
- The global `:focus-visible` rule (`app/globals.css`) applies to the Skip
  button automatically, same as every other interactive element site-wide;
  its class list also repeats the explicit `focus-visible:` utilities as
  belt-and-suspenders, matching `GoldButton`/`SecondaryButton`'s own
  established convention of doing both.
- `min-h-11` (44px) touch target on the Skip button, matching the
  project-wide convention.

## Responsive behavior

The overlay is `fixed inset-0` with both the poster image and video set to
`object-cover` — fills the viewport at any size (320px through 1920px+)
without letterboxing, cropping symmetrically from the center. The brief's
"maintain the important lamp/genie composition" on mobile is only as good
as the source video/images' own framing — `object-cover`'s default center
crop was used rather than a custom `object-position`, since neither image
was inspected closely enough during this phase to justify overriding the
center-crop default; if the lamp/genie turns out to sit noticeably
off-center once viewed live on a narrow viewport, adjusting
`object-position` on the `<img>`/`<video>` elements is a one-line follow-up
fix, not a restructure.

## Verification

- Strict `tsc --noEmit` over the pure-logic file list — **25 files** (one
  new: `lib/intro/introStorage.ts`, added this phase) — zero errors.
- `esbuild` syntax-check over every `.ts`/`.tsx` file — **79 files** (two
  new: `CinematicIntro.tsx`, `introStorage.ts`) — zero failures.
- A script confirming all `@/...` imports resolve — **169** (two new
  import statements: `app/page.tsx` → `CinematicIntro`, `CinematicIntro`
  → `introStorage`) — all resolve.
- `Navbar.tsx`/`Footer.tsx` re-checked after their small `id` additions —
  still parse cleanly, still resolve.

## Still-open limitations (unchanged category since Phase 02, specific to this phase)

Reasoned from source and the DOM/CSS/media APIs' documented behavior, not
exercised with a real browser, since this sandbox still has no
`node_modules`/`next dev`. Specifically unverified live: actual autoplay
behavior across real mobile browsers (iOS Safari in particular has its own
autoplay quirks beyond what `muted`/`playsInline` guarantee), the video's
actual duration and whether 8 seconds is a sensible stuck-timeout for its
real file size on a realistic connection, whether the lamp/genie
composition holds up at 320–430px without an `object-position` override
(see "Responsive behavior" above), and whether `useLayoutEffect` in a
Next.js App Router client component produces any console warning in this
project's actual build (a known point of nuance across Next.js/React
versions) — cosmetic if so, not functional, but worth a live check.
