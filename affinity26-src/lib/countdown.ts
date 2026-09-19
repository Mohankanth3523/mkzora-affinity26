/**
 * AFFINITY '26 event clock — pure functions, no React, no `Date` reads of their own (the caller passes `nowMs`), so every
 * state is unit-testable by passing a fixed timestamp.
 *
 * TIMEZONE: the festival runs on Indian Standard Time. Both boundaries are written with an explicit "+05:30" offset
 * (IST is a fixed UTC+05:30 all year — India has no daylight saving), so `Date.parse` yields the same instant on every
 * visitor's device, whatever their own timezone. Nothing here ever reads the visitor's local timezone.
 *
 *   start  : 1 October 2026, 00:00:00 IST   (= 2026-09-30T18:30:00Z)
 *   end    : 3 October 2026, 23:59:59 IST   — the event is LIVE through the whole of that last second, so the switch to
 *            the "thank you" state happens at 4 October 2026, 00:00:00 IST (EVENT_END_EXCLUSIVE_MS).
 */
export const EVENT_TIME_ZONE = "Asia/Kolkata";
export const EVENT_START_ISO = "2026-10-01T00:00:00+05:30";
export const EVENT_END_ISO = "2026-10-03T23:59:59+05:30";

export const EVENT_START_MS = Date.parse(EVENT_START_ISO);
export const EVENT_END_MS = Date.parse(EVENT_END_ISO);
/** First instant AFTER the event (23:59:59.999 IST is still live). */
export const EVENT_END_EXCLUSIVE_MS = EVENT_END_MS + 1000;

export const EVENT_DAY_COUNT = 3;
const DAY_MS = 86_400_000;

export type EventPhase = "before" | "live" | "after";

export function getEventPhase(nowMs: number): EventPhase {
  if (nowMs < EVENT_START_MS) return "before";
  if (nowMs < EVENT_END_EXCLUSIVE_MS) return "live";
  return "after";
}

export interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

/** Whole days/hours/minutes/seconds until the event starts. Never negative: at or after the start it is all zeros. */
export function getCountdownParts(nowMs: number): CountdownParts {
  const totalSeconds = Math.max(0, Math.floor((EVENT_START_MS - nowMs) / 1000));
  return {
    days: Math.floor(totalSeconds / 86_400),
    hours: Math.floor((totalSeconds % 86_400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

/** 1, 2 or 3 while the event is live (IST calendar day of the festival); null otherwise. */
export function getLiveDay(nowMs: number): number | null {
  if (getEventPhase(nowMs) !== "live") return null;
  return Math.min(EVENT_DAY_COUNT, Math.floor((nowMs - EVENT_START_MS) / DAY_MS) + 1);
}

export const padTwo = (n: number): string => String(n).padStart(2, "0");
