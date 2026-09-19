"use client";

import { useRegistration } from "@/lib/registration/context";
import { getEventById } from "@/data/events";
import { PACKAGES } from "@/data/pricing";
import { OrnamentalFrame } from "@/components/design-system";

const MAX_LISTED_EVENTS = 4;

/**
 * Phase 11: the wizard's sidebar — a running snapshot of the in-progress
 * registration, read straight from `useRegistration()` so it updates as
 * soon as any step's dispatch fires (no prop drilling, no step needs to
 * know this exists). Deliberately more than a bare item count — a name,
 * an event list, a package label, and a running total are what makes this
 * worth being its own named component rather than a line inside
 * `RegistrationNavigation`.
 *
 * Every figure here already carries its own truth-mode guarding upstream
 * (`lib/registration/pricing.ts` always sets `isEstimate: true` with
 * `assumptions[]`) — this component just surfaces that, it doesn't add or
 * relax any of it.
 *
 * Phase 29: added a College line — `state.participant.collegeName`, the
 * complete official name `CollegeCombobox` stored, never a shortened
 * display form.
 */
export function RegistrationSummary() {
  const { state } = useRegistration();

  const events = state.selectedEvents
    .map((selection) => getEventById(selection.eventId))
    .filter((event): event is NonNullable<typeof event> => Boolean(event));

  const visibleEvents = events.slice(0, MAX_LISTED_EVENTS);
  const hiddenCount = events.length - visibleEvents.length;

  const selectedPackage = state.package.packageId
    ? PACKAGES.find((option) => option.id === state.package.packageId)
    : null;

  return (
    <OrnamentalFrame padding="md" as="aside" className="lg:sticky lg:top-8">
      <h2 className="font-display text-lg font-semibold tracking-wide text-ivory">Registration Summary</h2>

      <dl className="mt-6 flex flex-col gap-5">
        <div>
          <dt className="font-body text-xs uppercase tracking-wide text-desert-sand">Participant</dt>
          <dd className="mt-1 font-body text-sm text-ivory">
            {state.participant.name.trim() || (
              <span className="text-desert-sand/70">Not entered yet</span>
            )}
          </dd>
        </div>

        <div>
          <dt className="font-body text-xs uppercase tracking-wide text-desert-sand">College</dt>
          <dd className="mt-1 font-body text-sm text-ivory">
            {state.participant.collegeName.trim() || (
              <span className="text-desert-sand/70">Not selected yet</span>
            )}
          </dd>
        </div>

        <div>
          <dt className="font-body text-xs uppercase tracking-wide text-desert-sand">
            Events ({events.length})
          </dt>
          <dd className="mt-1 font-body text-sm text-ivory">
            {events.length === 0 ? (
              <span className="text-desert-sand/70">No events selected yet</span>
            ) : (
              <ul className="flex flex-col gap-1">
                {visibleEvents.map((event) => (
                  <li key={event.id} className="truncate">
                    {event.name}
                  </li>
                ))}
                {hiddenCount > 0 && (
                  <li className="text-desert-sand">+{hiddenCount} more</li>
                )}
              </ul>
            )}
          </dd>
        </div>

        <div>
          <dt className="font-body text-xs uppercase tracking-wide text-desert-sand">Package</dt>
          <dd className="mt-1 font-body text-sm text-ivory">
            {selectedPackage ? selectedPackage.label : <span className="text-desert-sand/70">Not selected yet</span>}
          </dd>
        </div>

        <div className="border-t border-antique-gold/20 pt-4">
          <dt className="font-body text-xs uppercase tracking-wide text-desert-sand">Registration Amount</dt>
          <dd className="mt-1 font-display text-2xl font-semibold text-antique-gold">
            {state.pricing ? `₹${state.pricing.total.toLocaleString("en-IN")}` : "₹0"}
          </dd>
          {state.pricing?.isEstimate && (
            <p className="mt-1 font-body text-xs text-desert-sand">
              Estimate — subject to organizer confirmation.
            </p>
          )}
        </div>
      </dl>
    </OrnamentalFrame>
  );
}
