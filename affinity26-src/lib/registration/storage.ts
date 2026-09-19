/**
 * Local persistence for the registration wizard — frontend-only, per the
 * project brief ("Use frontend state/local persistence where appropriate").
 * No backend/session storage exists; this is purely a convenience so a
 * page refresh mid-wizard doesn't lose progress.
 */
import type { RegistrationState } from "@/types/registration";

const STORAGE_KEY = "affinity26.registration.v1";

export function loadRegistrationState(): RegistrationState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as RegistrationState;
  } catch {
    return null;
  }
}

export function saveRegistrationState(state: RegistrationState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage can throw (quota exceeded, private browsing) — persistence
    // is a convenience, never load-bearing, so failures are swallowed.
  }
}

export function clearRegistrationState(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
