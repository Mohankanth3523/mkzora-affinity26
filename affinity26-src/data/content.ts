/**
 * "About" / narrative copy — source: docs/affinity-content-truth.md §1–3.
 * This is verbatim organizer copy, kept separate from invented design/
 * marketing language (which belongs in component-level copy written
 * during Phase 03+, clearly distinguishable from these factual strings).
 */

export const festivalIdentity = {
  name: "AFFINITY '26",
  edition: "11th Edition",
  presentedBy: "Dhruvaas batch",
  /** Official festival dates — taken from the official AFFINITY '26 poster supplied for this project (October 01, 02, 03, 2026). No venue/time beyond the institution name is stated on it, so none is shown. */
  dates: {
    /** Short, single-line display form. */
    display: "1, 2 & 3 October 2026",
    /** Poster wording, for large "date badge" style displays. */
    month: "October",
    days: ["01", "02", "03"],
    year: "2026",
    startISO: "2026-10-01",
    endISO: "2026-10-03",
  },
  institution: "Karpaga Vinayaga Institute of Medical Sciences and Research Centre",
  taglines: ["Beyond the Sands, A Kingdom Awaits.", "A Legacy Forged in Struggle"],
  organisingSecretaries: [
    { name: "Murugarassan", phone: "9942904259" },
    { name: "Pooja", phone: "7695813823" },
  ],
} as const;

export const aboutCollege = `Karpaga Vinayaga Institute of Medical Sciences and Research Centre stands as a vibrant institution where academic excellence meets creativity, teamwork, and student spirit. With a strong emphasis on holistic development, the institution provides students with opportunities to discover their talents beyond the classroom. Affinity brings together the diverse talents, energy, and enthusiasm of our students, transforming the campus into a celebration of unity, creativity, and collective achievement.`;

export const aboutAffinity = `Affinity is the inter-medical collegiate fest of our college, Karpaga Vinayaga Institute of medical sciences and research centre. It has been a tradition to follow and is our pride in hosting medical colleges each year, all over the state for three days of fun-filled sports and cultural events that medical students enthusiastically participate in with competitive spirit and good will.`;

export const aboutAffinityBrochureVariant = `Affinity is the flagship inter-college cultural and sports extravaganza hosted annually by Karpaga Vinayaga Institute of Medical Sciences and Research Centre. Affinity has been a vibrant platform where thousands of medical students from across India come together to showcase their talents, creativity, and sportsmanship. Now, celebrating a decade of brilliance, Affinity 2026 – 11th Edition promises to be bigger, bolder, and more magical than ever before!`;

export const aboutTheme = `Arabian Nights transports us into a world of timeless tales, enchanting landscapes, royal splendour, mystery, and imagination. Inspired by the magic and grandeur of the legendary Arabian nights, this year's Affinity promises an extraordinary experience where tradition meets creativity. From captivating aesthetics to spectacular performances and unforgettable moments, the theme invites everyone to step beyond the ordinary and enter a world where every corner holds a story waiting to unfold.`;

/**
 * Source: docs/affinity-content-truth.md §2 — "Two verbatim descriptions
 * exist across the source docs (both consistent, no conflict — the
 * brochure's is the newer/longer version)." `aboutTheme` above is the
 * wordings-document version; this is the brochure's own theme copy,
 * added so both verbatim descriptions can be shown (the same "quote the
 * source exactly rather than picking one" approach already used for
 * `aboutAffinity`/`aboutAffinityBrochureVariant`).
 */
export const aboutThemeBrochureVariant = `This year, step into a world of timeless tales, vibrant colours, and the grandeur of Arabian culture. With Arabian Nights as our theme, Affinity 2026 brings together music, artistry, talent, and celebration. As the campus transforms into a realm of elegance and wonder, every moment becomes a tale waiting to be told.`;

export const aboutCause = {
  cause: "Blindness",
  description: `Beyond celebration and togetherness, Affinity carries a deeper purpose — giving back to the community. Every year, a portion of the funds raised through the event is dedicated to supporting a meaningful social cause. This year, we turn our focus towards blindness, with the aim of contributing towards creating greater awareness, supporting eye-care initiatives, and helping bring the gift of vision within reach of those in need. Through Affinity, we hope to transform the spirit of celebration into an opportunity to make a lasting difference — because every contribution can help brighten someone's world.`,
  /**
   * Source: docs/affinity-content-truth.md §3. The brochure explicitly
   * ties this year's cause into one event's own stated theme — the only
   * place in the source documents where the cause is connected to a
   * specific, named piece of programming, so it's kept here as its own
   * field rather than folded into `description` above.
   *
   * Phase 39 (remove Online Events completely): Pencil Painting is one of
   * `onlineCulturalEvents` (data/events/online.ts), removed from every
   * participant-facing surface that phase. This field itself is left
   * untouched — it's sourced content, not deleted, per that phase's own
   * "do not delete official source documents" — but `components/sections/
   * Cause.tsx` no longer renders it, since a promotional aside pointing a
   * participant at an event they can no longer find or select would be
   * misleading. See docs/phase-39-remove-online-events-notes.md.
   */
  connectedEvent: {
    name: "Pencil Painting",
    theme: "A whole new world beyond sight",
  },
} as const;
