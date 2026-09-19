import Link from "next/link";
import { contactGroups, generalWhatsApp, instagramHandle } from "@/data/contacts";
import { toTelHref, toWhatsAppHref, toInstagramHref } from "@/lib/contact/contactLinks";
import { OrnamentalFrame } from "@/components/design-system";
import { festivalIdentity } from "@/data/content";
import { LocationButton } from "@/components/location/LocationButton";
import { PhoneGlyph, ChatGlyph, CameraGlyph } from "./ContactIcons";

const LINK_CLASS =
  "inline-flex min-h-11 items-center gap-2 font-body text-sm text-antique-gold underline decoration-antique-gold/50 underline-offset-4 transition-colors duration-fast hover:text-warm-gold hover:decoration-warm-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-warm-gold";

/** Same visual treatment as `LINK_CLASS`, without `min-h-11` — for a link sitting inline inside a sentence rather than standing alone as a tap target. */
const INLINE_LINK_CLASS =
  "text-antique-gold underline decoration-antique-gold/50 underline-offset-4 transition-colors duration-fast hover:text-warm-gold hover:decoration-warm-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-warm-gold";

/**
 * A person row inside the Organising Secretaries / Registration Desk
 * cards: name, plus a clickable `tel:` link when a phone number exists.
 * Every event-details `tel:` link in `EventDetailsModal` uses the same
 * whitespace-stripped-digits convention (`lib/contact/contactLinks.ts`'s
 * `toTelHref`), so a phone number looks and behaves identically wherever
 * it appears in the app.
 */
function ContactRow({ name, phone }: { name: string; phone?: string }) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2">
      <span className="font-body text-sm text-ivory">{name}</span>
      {phone ? (
        <a href={toTelHref(phone)} className={LINK_CLASS}>
          <PhoneGlyph />
          {phone}
        </a>
      ) : (
        <span className="font-body text-xs text-desert-sand/70">Number unavailable</span>
      )}
    </li>
  );
}

/**
 * Phase 20 — the four contact categories the brief names: Organising
 * Secretaries, Registration Desk, Registration WhatsApp, Instagram.
 * `data/contacts.ts` has four more verified groups (Treasuries,
 * Accommodation, Sports Secretaries, Cultural Secretaries) that this page
 * deliberately doesn't render — see `docs/phase-20-contact-footer-notes.md`
 * for why that's a scoping choice, not a truth-mode omission: the data
 * stays intact and available for a future phase to surface, nothing about
 * it was altered or hidden as false.
 */
export function ContactContent() {
  const organisingSecretaries = contactGroups.find((group) => group.id === "organising-secretaries");
  const registrationDesk = contactGroups.find((group) => group.id === "registration-desk");

  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <section aria-labelledby="organising-secretaries-heading">
          <h2
            id="organising-secretaries-heading"
            className="mb-4 font-display text-xl font-semibold tracking-wide text-ivory"
          >
            Organising Secretaries
          </h2>
          <OrnamentalFrame padding="sm">
            <ul className="flex flex-col divide-y divide-antique-gold/10">
              {organisingSecretaries?.people.map((person) => (
                <ContactRow key={person.name} name={person.name} phone={person.phone} />
              ))}
            </ul>
          </OrnamentalFrame>
        </section>

        <section aria-labelledby="registration-desk-heading">
          <h2
            id="registration-desk-heading"
            className="mb-4 font-display text-xl font-semibold tracking-wide text-ivory"
          >
            Registration Desk
          </h2>
          <OrnamentalFrame padding="sm">
            <ul className="flex flex-col divide-y divide-antique-gold/10">
              {registrationDesk?.people.map((person) => (
                <ContactRow key={person.name} name={person.name} phone={person.phone} />
              ))}
            </ul>
          </OrnamentalFrame>
        </section>

        <section aria-labelledby="registration-whatsapp-heading">
          <h2
            id="registration-whatsapp-heading"
            className="mb-4 font-display text-xl font-semibold tracking-wide text-ivory"
          >
            Registration WhatsApp
          </h2>
          <OrnamentalFrame padding="sm" className="flex flex-wrap items-center justify-between gap-4">
            <span className="font-body text-sm text-ivory">{generalWhatsApp}</span>
            <a
              href={toWhatsAppHref(generalWhatsApp)}
              target="_blank"
              rel="noopener noreferrer"
              className={LINK_CLASS}
            >
              <ChatGlyph />
              Message on WhatsApp
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </OrnamentalFrame>
        </section>

        <section aria-labelledby="instagram-heading">
          <h2
            id="instagram-heading"
            className="mb-4 font-display text-xl font-semibold tracking-wide text-ivory"
          >
            Instagram
          </h2>
          <OrnamentalFrame padding="sm" className="flex flex-wrap items-center justify-between gap-4">
            <span className="font-body text-sm text-ivory">{instagramHandle}</span>
            <a
              href={toInstagramHref(instagramHandle)}
              target="_blank"
              rel="noopener noreferrer"
              className={LINK_CLASS}
            >
              <CameraGlyph />
              Open Instagram
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </OrnamentalFrame>
        </section>
      </div>

      <section aria-labelledby="event-location-heading">
        <h2 id="event-location-heading" className="mb-4 font-display text-xl font-semibold tracking-wide text-ivory">
          Event Location
        </h2>
        <OrnamentalFrame padding="sm" className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="font-body text-sm text-ivory">{festivalIdentity.institution}</span>
            <span className="font-body text-xs uppercase tracking-[0.14em] text-warm-gold">{festivalIdentity.dates.display}</span>
          </div>
          <LocationButton label="Get Directions" />
        </OrnamentalFrame>
      </section>

      <p className="font-body text-sm text-desert-sand">
        Every event listed on the{" "}
        <Link href="/events" className={INLINE_LINK_CLASS}>
          Events
        </Link>{" "}
        page also has its own dedicated contact(s).
      </p>
    </div>
  );
}
