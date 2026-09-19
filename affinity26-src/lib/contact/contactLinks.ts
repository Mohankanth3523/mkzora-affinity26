/**
 * Link-building helpers for `data/contacts.ts` — pure display/formatting,
 * never a source of new facts. Every function here only reformats a
 * phone number or handle that's already verified in `data/contacts.ts`
 * into a clickable URL; none of them invent a channel (email, website,
 * a social account) that isn't already in that file.
 *
 * `toTelHref` mirrors the exact convention `EventDetailsModal` already
 * uses for `event.contact` phone numbers (`tel:` + whitespace-stripped
 * digits, no invented "+91" country-code prefix) — kept identical here
 * so a phone number formats the same way everywhere in the app.
 */

/** `"7806802451"` / `"+91 94892 37220"` → a `tel:` href with whitespace stripped, nothing else changed. */
export function toTelHref(phone: string): string {
  return `tel:${phone.replace(/\s+/g, "")}`;
}

/** `"+91 95660 36104"` → `https://wa.me/919566036104` (wa.me requires digits only, no `+`/spaces). */
export function toWhatsAppHref(whatsapp: string): string {
  return `https://wa.me/${whatsapp.replace(/\D/g, "")}`;
}

/** `"@affinity.kims"` → `https://instagram.com/affinity.kims`. */
export function toInstagramHref(handle: string): string {
  return `https://instagram.com/${handle.replace(/^@/, "")}`;
}
