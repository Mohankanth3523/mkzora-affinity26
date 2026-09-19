/**
 * Local persistence for the cinematic intro's "seen this session" flag —
 * frontend-only, mirrors `lib/registration/storage.ts`'s defensive
 * try/catch pattern (storage access can throw in private browsing, or when
 * a browser policy disables it entirely).
 *
 * `sessionStorage`, not `localStorage`, is deliberate: the brief asks for
 * "already viewed during the current browsing session" to skip the intro,
 * but a new session (new tab, browser restart) should see it again —
 * `sessionStorage`'s own per-tab lifetime already matches that contract
 * exactly, with no extra expiry bookkeeping needed.
 *
 * `INTRO_SEEN_KEY` is exported (not just used internally) because
 * `CinematicIntro`'s pre-hydration `<script>` — a plain string of inline
 * JS, not a module that can import this file — needs the exact same key
 * name to check the exact same flag before React ever loads. See that
 * component's doc comment for why.
 */
export const INTRO_SEEN_KEY = "affinity26.intro.v1";

export function hasSeenIntro(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(INTRO_SEEN_KEY) === "true";
  } catch {
    return false;
  }
}

export function markIntroSeen(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(INTRO_SEEN_KEY, "true");
  } catch {
    // sessionStorage can throw (private browsing, storage disabled) —
    // persistence here is a convenience only; worst case the intro simply
    // plays again on the next load, which is safe, not broken.
  }
}
