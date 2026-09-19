"use client";

import { useEffect, useState } from "react";
import {
  EVENT_DAY_COUNT,
  EVENT_END_EXCLUSIVE_MS,
  EVENT_START_ISO,
  getCountdownParts,
  getEventPhase,
  getLiveDay,
  padTwo,
} from "@/lib/countdown";

const DATES_LABEL = "October 1–3, 2026";

const EYEBROW_CLASS =
  "flex items-center justify-center gap-3 font-display text-xs font-semibold uppercase tracking-[0.28em] text-warm-gold sm:text-sm";

function Rule() {
  return <span aria-hidden="true" className="h-px w-8 bg-antique-gold/50 sm:w-12" />;
}

/** One glass-style card: gold numerals over an uppercase label. `tick` re-triggers a soft entrance on the seconds card each second. */
function Unit({ value, label, tick = false }: { value: string; label: string; tick?: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-sm border border-antique-gold/40 bg-royal-navy/60 px-2 py-4 text-center shadow-card backdrop-blur-md sm:py-5">
      {/* glass highlight */}
      <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-warm-gold/[0.08] to-transparent" />
      <span aria-hidden="true" className="pointer-events-none absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-warm-gold/60 to-transparent" />
      <span
        key={tick ? value : undefined}
        className={[
          "relative block font-display text-4xl font-semibold leading-none tabular-nums text-warm-gold [text-shadow:0_0_18px_rgba(232,199,106,0.35)] sm:text-5xl lg:text-6xl",
          tick ? "animate-count-tick" : "",
        ].join(" ")}
      >
        {value}
      </span>
      <span className="relative mt-2 block font-body text-[10px] font-semibold uppercase tracking-[0.22em] text-desert-sand sm:mt-3 sm:text-xs">
        {label}
      </span>
    </div>
  );
}

export interface EventCountdownProps {
  className?: string;
}

/**
 * Live countdown to the START of AFFINITY '26 (1 October 2026, 00:00:00 IST — see lib/countdown.ts), with three
 * automatic states: before ("The countdown begins"), live (1–3 October) and after ("Thank you…"). It never shows a
 * negative countdown.
 *
 * Lightweight: one `setInterval` (1 s) that only stores `Date.now()`; everything else is derived by the pure functions
 * in lib/countdown.ts, which use a fixed +05:30 offset, never the visitor's timezone. The interval and the
 * visibility listener are removed on unmount, and the interval stops itself once the event has ended.
 *
 * Hydration: the server renders no time at all (state starts `null`), so the static HTML can never show a stale value
 * or mismatch; the block keeps its height and fades in on the first client tick.
 */
export function EventCountdown({ className = "" }: EventCountdownProps) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    let id: number | undefined;

    const stop = () => {
      if (id !== undefined) {
        window.clearInterval(id);
        id = undefined;
      }
    };
    const tick = () => {
      const t = Date.now();
      setNow(t);
      if (t >= EVENT_END_EXCLUSIVE_MS) stop();
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") tick(); // timers are throttled in background tabs; re-sync on return
    };

    tick();
    if (Date.now() < EVENT_END_EXCLUSIVE_MS) id = window.setInterval(tick, 1000);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const ready = now !== null;
  const phase = ready ? getEventPhase(now) : "before";
  const wrapper = `mx-auto w-full max-w-xl transition-opacity duration-slow ${ready ? "opacity-100" : "opacity-0"} ${className}`;

  if (phase === "live") {
    const day = getLiveDay(now as number);
    return (
      <section aria-label="AFFINITY '26 is live" className={wrapper}>
        <div className="relative overflow-hidden rounded-sm border border-antique-gold/50 bg-royal-navy/60 px-5 py-6 text-center shadow-card backdrop-blur-md sm:py-8">
          <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-warm-gold/[0.10] to-transparent" />
          <p className={EYEBROW_CLASS}>
            <span aria-hidden="true" className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-warm-gold/60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-warm-gold" />
            </span>
            Live now
          </p>
          <p className="relative mt-3 font-display text-2xl font-semibold uppercase leading-tight tracking-wide text-warm-gold [text-shadow:0_0_18px_rgba(232,199,106,0.35)] sm:text-4xl">
            AFFINITY &rsquo;26 is live
          </p>
          <p className="relative mt-3 font-body text-xs font-semibold uppercase tracking-[0.22em] text-desert-sand sm:text-sm">
            {DATES_LABEL}
            {day ? (
              <>
                <span aria-hidden="true" className="mx-2 text-antique-gold/60">
                  &#10022;
                </span>
                Day {day} of {EVENT_DAY_COUNT}
              </>
            ) : null}
          </p>
        </div>
      </section>
    );
  }

  if (phase === "after") {
    return (
      <section aria-label="Thank you for being part of AFFINITY '26" className={wrapper}>
        <div className="relative overflow-hidden rounded-sm border border-antique-gold/40 bg-royal-navy/60 px-5 py-6 text-center shadow-card backdrop-blur-md sm:py-8">
          <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-warm-gold/[0.08] to-transparent" />
          <p className="relative font-display text-xl font-semibold uppercase leading-snug tracking-wide text-warm-gold [text-shadow:0_0_18px_rgba(232,199,106,0.35)] sm:text-3xl">
            Thank you for being part of AFFINITY &rsquo;26
          </p>
          <p className="relative mt-3 font-body text-xs font-semibold uppercase tracking-[0.22em] text-desert-sand sm:text-sm">
            {DATES_LABEL}
          </p>
        </div>
      </section>
    );
  }

  const p = ready ? getCountdownParts(now as number) : null;
  const v = (n: number | undefined) => (p && n !== undefined ? padTwo(n) : "--");

  return (
    <section aria-label="Countdown to AFFINITY '26" className={wrapper}>
      <p className={EYEBROW_CLASS}>
        <Rule />
        The countdown begins
        <Rule />
      </p>
      <div
        role="timer"
        aria-label="Countdown to AFFINITY '26"
        className="mt-4 grid grid-cols-2 gap-3 sm:mt-5 sm:grid-cols-4 sm:gap-4"
      >
        <Unit value={v(p?.days)} label="Days" />
        <Unit value={v(p?.hours)} label="Hours" />
        <Unit value={v(p?.minutes)} label="Minutes" />
        <Unit value={v(p?.seconds)} label="Seconds" tick />
      </div>
      <p className="mt-3 text-center font-body text-[11px] uppercase tracking-[0.2em] text-ivory/60 sm:text-xs">
        <time dateTime={EVENT_START_ISO}>{DATES_LABEL}</time>
        <span aria-hidden="true" className="mx-2 text-antique-gold/50">
          &#10022;
        </span>
        Indian Standard Time
      </p>
    </section>
  );
}
