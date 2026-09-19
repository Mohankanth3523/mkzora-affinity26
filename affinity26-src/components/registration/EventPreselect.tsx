"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useRegistration } from "@/lib/registration/context";
import { getEventById } from "@/data/events";

/**
 * Phase 10: the whole mechanism connecting the event details modal (on
 * `/events`, outside `RegistrationProvider`) to the registration wizard
 * (`/register`, inside it). "REGISTER FOR THIS EVENT" links to
 * `/register?event=<id>` — a plain URL query param, since the two route
 * subtrees don't share any React context to pass state through
 * directly, and this frontend has no backend session to stash it in
 * either. This component reads that one param, once, and dispatches the
 * same `SELECT_EVENT` action the wizard's own Events step already uses.
 *
 * Renders nothing (`null`) — it's pure side-effect wiring, mounted once
 * in `app/register/page.tsx` inside a `<Suspense>` boundary (required by
 * Next.js for any component calling `useSearchParams`).
 */
export function EventPreselect() {
  const searchParams = useSearchParams();
  const { state, dispatch } = useRegistration();
  const appliedRef = useRef(false);

  useEffect(() => {
    if (appliedRef.current) return;
    const eventId = searchParams.get("event");
    if (!eventId) return;
    appliedRef.current = true;

    // Ignore an unknown/malformed id rather than adding a phantom
    // selection the reducer/pricing calculator has no real data for.
    const event = getEventById(eventId);
    if (!event) return;
    if (state.selectedEvents.some((selection) => selection.eventId === eventId)) return;

    // The event/registration pricing restructuring phase: a
    // direct-contact event can never enter the package flow as a
    // selection — `EventDetailsModal` no longer links here for one
    // (its footer button is replaced entirely, see that component's own
    // doc comment), but this guard is defense-in-depth against a stale
    // bookmark or hand-typed `?event=` link for one of those 12 ids.
    if (event.registrationMode === "direct-contact") return;

    dispatch({ type: "SELECT_EVENT", eventId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return null;
}
