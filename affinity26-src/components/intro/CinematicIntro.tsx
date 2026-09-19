"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { INTRO_SEEN_KEY, hasSeenIntro, markIntroSeen } from "@/lib/intro/introStorage";
import { assetPath } from "@/lib/basePath";

/**
 * How long the video may sit un-playing before it's treated as stuck —
 * covers a slow connection, an unsupported codec, or a mobile browser that
 * silently refuses autoplay without ever firing `error` (all real
 * "slow connection" / "video failure" cases the brief calls out, beyond
 * the plain `onError` case `handleUnavailable` also handles).
 */
const STUCK_TIMEOUT_MS = 8000;

/** How long the static lamp fallback holds before continuing to the
 * homepage, once the video's been given up on — a deliberate beat rather
 * than an instant jump, so a failure doesn't read as the page glitching. */
const FALLBACK_HOLD_MS = 1400;

/** The outro fade's duration — matches the project's `duration-ornamental`
 * Tailwind token (700ms; see tailwind.config.ts), used site-wide for its
 * few other deliberately cinematic moments (Hero's own reveal). Kept as a
 * literal here (not read from the token file) only because this is a
 * plain-number `setTimeout` pairing for a CSS class, not a Tailwind
 * utility itself. */
const EXIT_DURATION_MS = 700;

type Phase = "active" | "exiting" | "hidden";

/**
 * The pre-hydration, no-flash guard. A plain parser-blocking `<script>`,
 * not a module — it runs as the browser parses this component's own
 * server-rendered HTML, before React's JS bundle has even finished
 * loading, let alone hydrated. It re-checks the exact conditions
 * `CinematicIntro`'s own `useLayoutEffect` (below) checks — the same
 * `INTRO_SEEN_KEY` flag, the same `prefers-reduced-motion` query — and, if
 * either says "don't play the intro," hides the server-rendered overlay
 * immediately via a direct `style.display` write.
 *
 * Without this, a repeat visit within the same session (or a
 * reduced-motion user) would still see the full-viewport overlay for the
 * one frame between the server-rendered paint and React's own effect
 * catching up — small, but it's exactly the kind of thing the brief's
 * "must not become annoying" / "do not force users to watch a long intro
 * every time" warns against. `try/catch` because `sessionStorage` and
 * `matchMedia` can both throw in locked-down embedded browsers — failing
 * silently here just means the React effect below is the real fallback,
 * not a broken page.
 */
const NO_FLASH_SCRIPT = `(function(){try{var seen=sessionStorage.getItem(${JSON.stringify(
  INTRO_SEEN_KEY,
)})==="true";var reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;if(seen||reduce){var el=document.getElementById("affinity-intro-root");if(el){el.style.display="none";}}}catch(e){}})();`;

/**
 * Phase 28 — the cinematic opening. Full-viewport, session-gated, built
 * entirely around the three supplied assets in `public/intro/` — no
 * CSS-recreated lamp/smoke/genie animation, per the brief's explicit
 * instruction to use the provided video as the primary asset.
 *
 * Lives on the homepage only (mounted once, first, in `app/page.tsx`):
 * every other route never renders this component at all, which is what
 * makes "skip intro on subsequent navigation" true for free — there's
 * nothing to skip on `/events` or `/register`, because this was never
 * part of those pages to begin with. Returning to `/` again in the same
 * tab is what `sessionStorage` (via `lib/intro/introStorage.ts`) guards
 * against instead.
 *
 * Default render state is `"active"` (intro visible) — not `"hidden"` —
 * on both the server and React's first client pass, deliberately: this
 * component can only know whether to skip (via `sessionStorage`/
 * `matchMedia`) once it's running in a real browser, so *some* mismatch
 * between "what a first-time visitor should see" and "what a repeat
 * visitor should see" is unavoidable during the instant before that check
 * runs. Defaulting to *visible* means a first-time visitor never sees a
 * flash of the raw homepage before the intro cuts in (the more jarring of
 * the two possible flashes, and the one the brief's "appears BEFORE the
 * main website" framing cares about most) — the cost lands on repeat
 * visitors instead, and `NO_FLASH_SCRIPT` above exists specifically to
 * make that cost as close to zero as a browser allows.
 */
export function CinematicIntro() {
  const [phase, setPhase] = useState<Phase>("active");
  const [videoUnavailable, setVideoUnavailable] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const stuckTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finishedRef = useRef(false);

  const clearStuckTimer = useCallback(() => {
    if (stuckTimerRef.current) {
      clearTimeout(stuckTimerRef.current);
      stuckTimerRef.current = null;
    }
  }, []);

  /**
   * The one path out of the intro, whatever triggered it (video ended
   * naturally, Skip was clicked, or the video was given up on). Guarded by
   * `finishedRef` because two of those triggers can race — e.g. a user
   * clicking Skip in the same instant the video's `ended` event fires —
   * and this must only ever run its exit sequence once.
   */
  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    markIntroSeen();
    clearStuckTimer();
    setPhase("exiting");
    setTimeout(() => setPhase("hidden"), EXIT_DURATION_MS);
  }, [clearStuckTimer]);

  /** Shared by `onError` and the stuck-timeout: hold the static lamp
   * fallback (the base `<img>`, already always rendered) for a brief,
   * deliberate beat, then continue exactly as if the video had played —
   * "do not leave the user stuck on the intro," whatever the reason it
   * couldn't play. */
  const handleUnavailable = useCallback(() => {
    if (finishedRef.current) return;
    setVideoUnavailable(true);
    clearStuckTimer();
    setTimeout(finish, FALLBACK_HOLD_MS);
  }, [clearStuckTimer, finish]);

  const handleSkip = useCallback(() => {
    videoRef.current?.pause();
    finish();
  }, [finish]);

  // Decide, once, whether this load should skip straight past the intro.
  // `useLayoutEffect` (not `useEffect`) specifically to close the gap
  // `NO_FLASH_SCRIPT` can't: that inline script only covers the moment
  // before React hydrates, and can't reach into this component's own
  // React state — once hydration starts, this is the mechanism that keeps
  // the two in agreement.
  useLayoutEffect(() => {
    if (hasSeenIntro()) {
      setPhase("hidden");
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // "Skip the cinematic animation and show the main website
      // immediately" — literally true here (no video is ever mounted for
      // this path). "...with a short elegant fade": the project's global
      // reduced-motion gate (app/globals.css) already collapses every
      // transition-duration site-wide to ~0.01ms, so reusing the exact
      // same exiting/opacity mechanism the full intro uses — rather than
      // a bespoke reduced-motion-only transition — satisfies "fade" and
      // "immediately" at once, for free, the same way Hero's own entrance
      // already relies on that one global rule instead of a special case.
      // (`finish` itself calls `markIntroSeen` — no need to duplicate it.)
      finish();
      return;
    }

    // First real playback: covers slow connections, unsupported codecs,
    // and mobile browsers that silently refuse autoplay without ever
    // firing `error` — see STUCK_TIMEOUT_MS.
    stuckTimerRef.current = setTimeout(handleUnavailable, STUCK_TIMEOUT_MS);
    return () => clearStuckTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount by design
  }, []);

  // While the intro is up (active or mid-exit): stop the real nav/footer
  // underneath from being keyboard/screen-reader reachable — they're
  // visually covered by this overlay's z-index, but without this, Tab
  // would still walk a keyboard user straight into the live header before
  // the intro finishes, since DOM/tab order doesn't know about z-index.
  // `inert` is the modern, single-attribute way to pull a subtree out of
  // both the tab order and the accessibility tree at once. Also locks
  // `documentElement` scroll the same way Navbar's own mobile-menu overlay
  // already does (see Navbar.tsx), for the same reason.
  useEffect(() => {
    if (phase === "hidden") return;

    const nav = document.getElementById("site-navbar");
    const footer = document.getElementById("site-footer");
    nav?.setAttribute("inert", "");
    footer?.setAttribute("inert", "");

    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    // Land focus on the one control that matters while the intro is up,
    // rather than leaving it wherever the browser put it on load.
    skipRef.current?.focus();

    return () => {
      nav?.removeAttribute("inert");
      footer?.removeAttribute("inert");
      document.documentElement.style.overflow = previousOverflow;
    };
  }, [phase]);

  if (phase === "hidden") {
    return null;
  }

  const exiting = phase === "exiting";

  return (
    <div
      id="affinity-intro-root"
      role="region"
      aria-label="AFFINITY '26 cinematic introduction"
      className={[
        "fixed inset-0 z-[100] overflow-hidden bg-midnight transition-opacity duration-ornamental ease-ornamental",
        // `pointer-events-none` while exiting matters beyond just "don't
        // block clicks during a 700ms fade": the global reduced-motion
        // gate (app/globals.css) collapses that 700ms to ~0.01ms visually,
        // but this element is still mounted at full size for the real
        // 700ms until the `setTimeout` in `finish` unmounts it — without
        // this, a reduced-motion user would see the homepage instantly
        // yet have their first clicks silently swallowed by an invisible
        // overlay for most of a second.
        exiting ? "pointer-events-none opacity-0" : "opacity-100",
      ].join(" ")}
    >
      {/* See NO_FLASH_SCRIPT's own doc comment. suppressHydrationWarning
          because this script tag's presence (server-rendered, then never
          touched again by React) is expected to look identical on every
          render — nothing about it is meant to vary. */}
      <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: NO_FLASH_SCRIPT }} />

      {/* Perceivable equivalent for anyone who can't see the video — the
          overlay itself has no other text content while active. */}
      <p className="sr-only">
        An animated Arabian Nights sequence: an ornate lamp is tapped three
        times, releasing enchanted smoke as a genie emerges — opening the
        story of AFFINITY &rsquo;26. Select &ldquo;Skip Intro&rdquo; at any
        time to go straight to the website.
      </p>

      {/* Base layer: the static lamp scene. Always present — doubles as
          the <video>'s own `poster` (shown while it loads) and, if
          `videoUnavailable`, the entire fallback the brief asks for
          ("gracefully show a static Arabian Nights lamp background and
          continue"). Plain <img>, not next/image: this project has never
          used Next's image-optimization pipeline before (every visual to
          date is inline SVG), and its compatibility with this project's
          Cloudflare Pages deployment isn't yet verified — not worth
          risking on the same day that deployment was first gotten
          working, for one poster image loaded once per session. */}
      <img
        src={assetPath("/intro/affinity-lamp.png")}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />

      {!videoUnavailable && (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          src={assetPath("/intro/affinity-intro.mp4")}
          poster={assetPath("/intro/affinity-lamp.png")}
          autoPlay
          muted
          playsInline
          preload="auto"
          onPlaying={clearStuckTimer}
          onCanPlay={clearStuckTimer}
          onEnded={finish}
          onError={handleUnavailable}
        />
      )}

      {/* The exit beat: the genie still + a soft gold/blue flare, mounted
          only once actually exiting (never before) — "do not load
          unnecessary assets before the intro" applies to this image too,
          so it has no reason to exist in the DOM, let alone the network,
          until this moment. Dissolves out together with everything else
          via the root's own opacity transition above; "the genie has
          opened the magical world of AFFINITY '26," using the supplied
          still rather than re-animating anything. */}
      {exiting && (
        <div aria-hidden="true" className="absolute inset-0">
          <img
            src={assetPath("/intro/affinity-genie.png")}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[radial-gradient(120%_100%_at_50%_40%,rgba(232,199,106,0.35)_0%,rgba(15,102,88,0.22)_45%,transparent_75%)]" />
        </div>
      )}

      <button
        ref={skipRef}
        type="button"
        onClick={handleSkip}
        className="absolute bottom-6 right-4 z-10 inline-flex min-h-11 items-center gap-2 rounded-sm border border-ivory/40 bg-midnight/70 px-5 py-2.5 font-body text-xs font-semibold uppercase tracking-[0.14em] text-ivory transition-colors duration-fast hover:border-warm-gold hover:bg-midnight/85 hover:text-warm-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-warm-gold sm:bottom-8 sm:right-8"
      >
        Skip Intro
      </button>
    </div>
  );
}
