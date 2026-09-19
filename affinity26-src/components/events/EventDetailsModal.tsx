"use client";

import { useEffect, useId, useRef, type ReactNode, type RefObject } from "react";
import Link from "next/link";
import type { AffinityEvent } from "@/types/event";
import { EventBadge, GoldButton } from "@/components/design-system";
import { MODE_LABEL, TYPE_LABEL, formatDay } from "@/lib/events/eventLabels";

export interface EventDetailsModalProps {
  event: AffinityEvent;
  onClose: () => void;
  /** The card's "View Details" button, so focus returns there on close — mirrors Navbar's mobile-overlay trigger/close pattern (Phase 05). */
  triggerRef: RefObject<HTMLButtonElement | null>;
}

const PLACEHOLDER = "Details to be announced.";

/**
 * Phase 10 — the event details modal ("premium modal/drawer"). A
 * centered dialog on tablet/desktop, a bottom sheet on mobile (pure
 * Tailwind responsive classes — `items-end` + full width below `sm`,
 * `sm:items-center` + a capped width above it — no JS breakpoint
 * branching needed).
 *
 * Focus trap, Escape-to-close, and body-scroll-lock reuse the exact
 * pattern already proven in `Navbar`'s mobile overlay (Phase 05):
 * `querySelectorAll('a[href], button:not([disabled])')` inside the
 * panel on every Tab press, rather than a new mechanism. "Outside
 * click" is a separate backdrop element with its own `onClick`, not an
 * event-target check on the panel — clicking anywhere inside the panel
 * simply never reaches the backdrop's own click handler, which is
 * harder to get wrong than bubbling logic.
 *
 * Sections map straight onto `AffinityEvent` fields — nothing here
 * computes a new fact, only formats existing ones. Any field the
 * source data leaves unstated renders literally "Details to be
 * announced." rather than being silently skipped, per the phase's own
 * instruction (the one exception is Format's optional Day line, which
 * is *omitted* rather than placeholder'd — see `formatDay`'s own doc
 * comment for why that field specifically has a real "not applicable"
 * case, not just an unstated one).
 *
 * Phase 31: the fee line that used to sit above the "Register" button is
 * gone — pricing is a package-level concept now (`data/pricing.ts`), and
 * the phase brief is explicit that individual event pricing must not
 * appear anywhere in this modal. The event's own `fee` field is untouched
 * in `data/events/*` (still there for a future backend), this view just
 * no longer reads it.
 *
 * The event/registration pricing restructuring phase: for a
 * `registrationMode: "direct-contact"` event, the footer's "Register for
 * This Event" button — which links into the package registration flow —
 * is replaced entirely by a plain, static notice: "Separate entry
 * event." followed by an instruction to contact the in-charge listed in
 * the Contact section above, plus "Please contact the event in-charge
 * for participation and payment details." There is no payment button, no
 * checkout affordance, and no link into `/register` here — this is the
 * one place in the app besides the card itself that a direct-contact
 * event surfaces, and it must never imply an online-payment workflow
 * this frontend doesn't have. A `registration-mode` chip joins the
 * existing category/mode badges in the header for the same reason
 * `EventCard` shows one — so the distinction is visible before a reader
 * gets anywhere near the Contact section.
 */
export function EventDetailsModal({ event, onClose, triggerRef }: EventDetailsModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function onKeyDown(keyEvent: KeyboardEvent) {
      if (keyEvent.key === "Escape") {
        keyEvent.preventDefault();
        onClose();
        return;
      }
      if (keyEvent.key !== "Tab" || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;

      if (keyEvent.shiftKey && document.activeElement === first) {
        keyEvent.preventDefault();
        last.focus();
      } else if (!keyEvent.shiftKey && document.activeElement === last) {
        keyEvent.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.documentElement.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      triggerRef.current?.focus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event.id]);

  const showVerificationNote = event.verificationStatus !== "confirmed";
  const dayLabel = formatDay(event.day);
  const isDirectContact = event.registrationMode === "direct-contact";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 animate-modal-backdrop bg-midnight/80"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[85vh] w-full animate-modal-panel flex-col overflow-hidden rounded-t-lg border border-antique-gold/40 bg-royal-navy sm:max-h-[80vh] sm:max-w-xl sm:rounded-none"
      >
        <div className="flex items-start justify-between gap-4 border-b border-antique-gold/20 px-6 py-5">
          <div className="flex min-w-0 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <EventBadge variant="category" value={event.category} />
              <EventBadge variant="mode" value={event.mode} />
              {isDirectContact ? <EventBadge variant="registration-mode" value={event.registrationMode} /> : null}
            </div>
            <h2 id={titleId} className="font-display text-2xl font-semibold text-ivory sm:text-3xl">
              {event.name}
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close event details"
            className="mt-1 inline-flex h-11 w-11 shrink-0 items-center justify-center text-ivory"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {showVerificationNote ? (
            <div className="mb-5 flex flex-col items-start gap-2 border border-warm-gold/50 px-4 py-3">
              <EventBadge variant="verification" value={event.verificationStatus} />
              {event.verificationNotes ? (
                <p className="font-body text-sm text-desert-sand">{event.verificationNotes}</p>
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-col gap-5">
            <Section title="About">
              <p>{event.description ?? PLACEHOLDER}</p>
            </Section>

            <Section title="Eligibility">
              <p>{event.eligibility ?? PLACEHOLDER}</p>
              <p className="mt-2 font-body text-xs text-desert-sand">
                General category eligibility is listed on the{" "}
                <Link
                  href="/rules"
                  className="text-antique-gold underline underline-offset-2 hover:text-warm-gold"
                >
                  Rules page
                </Link>
                .
              </p>
            </Section>

            <Section title="Format">
              <ul className="flex flex-col gap-1">
                <li>Mode: {MODE_LABEL[event.mode]}</li>
                <li>Type: {TYPE_LABEL[event.type]}</li>
                {dayLabel ? <li>Day: {dayLabel}</li> : null}
              </ul>
            </Section>

            <Section title="Team Size">
              {event.team ? (
                <ul className="flex flex-col gap-1">
                  <li>{formatTeamSize(event.team)}</li>
                  {event.team.perCollegeLimit ? (
                    <li>
                      Max {event.team.perCollegeLimit}{" "}
                      {event.team.perCollegeLimit === 1 ? "team" : "teams"} per college.
                    </li>
                  ) : null}
                  {event.team.notes ? <li>{event.team.notes}</li> : null}
                </ul>
              ) : event.type === "individual" ? (
                <p>Individual entry — no team required.</p>
              ) : (
                <p>{PLACEHOLDER}</p>
              )}
            </Section>

            <Section title="Rules">
              {event.rules && event.rules.length > 0 ? (
                <ul className="flex flex-col gap-1.5">
                  {event.rules.map((rule, index) => (
                    <li key={index} className="relative pl-4">
                      <span
                        aria-hidden="true"
                        className="absolute left-0 top-[0.6em] h-1 w-1 rounded-full bg-antique-gold"
                      />
                      {rule}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>{PLACEHOLDER}</p>
              )}
            </Section>

            <Section title="Prizes">
              {event.prize && event.prize.length > 0 ? (
                <ul className="flex flex-col gap-1">
                  {event.prize.map((tier, index) => (
                    <li key={index}>
                      {tier.label}
                      {tier.group ? ` (${tier.group})` : ""}
                      {": "}
                      {tier.amount != null ? `₹${tier.amount.toLocaleString("en-IN")}` : "Amount not stated"}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>{PLACEHOLDER}</p>
              )}
            </Section>

            <Section title="Contact">
              {isDirectContact ? (
                <p className="mb-2 font-body text-sm italic text-warm-gold">Separate entry event.</p>
              ) : null}
              {event.contact && event.contact.length > 0 ? (
                <ul className="flex flex-col gap-1">
                  {event.contact.map((person, index) => (
                    <li key={index}>
                      {person.name}
                      {person.role ? `, ${person.role}` : ""}
                      {person.phone ? (
                        <>
                          {" — "}
                          <a
                            href={`tel:${person.phone.replace(/\s+/g, "")}`}
                            className="text-antique-gold underline underline-offset-2 hover:text-warm-gold"
                          >
                            {person.phone}
                          </a>
                        </>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>{PLACEHOLDER}</p>
              )}
              {isDirectContact ? (
                <p className="mt-3 font-body text-sm text-desert-sand">
                  Please contact the event in-charge for participation and payment details.
                </p>
              ) : null}
            </Section>
          </div>
        </div>

        <div className="border-t border-antique-gold/20 px-6 py-5">
          {isDirectContact ? (
            <p className="text-center font-body text-xs uppercase tracking-[0.15em] text-desert-sand">
              Direct-contact registration — no online payment for this event.
            </p>
          ) : (
            <GoldButton href={`/register?event=${event.id}`} fullWidth onClick={onClose}>
              Register for This Event
            </GoldButton>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border-t border-antique-gold/20 pt-4 first:border-t-0 first:pt-0">
      <h3 className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-warm-gold">
        {title}
      </h3>
      <div className="mt-2 font-body text-sm leading-relaxed text-desert-sand sm:text-base">
        {children}
      </div>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4">
      <path
        d="M4 4 L16 16 M16 4 L4 16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function formatTeamSize(team: NonNullable<AffinityEvent["team"]>): string {
  if (team.min != null && team.max != null) {
    return team.min === team.max ? `${team.min} members` : `${team.min}–${team.max} members`;
  }
  if (team.max != null) return `Up to ${team.max} members`;
  if (team.min != null) return `At least ${team.min} members`;
  return "Team size not stated.";
}
