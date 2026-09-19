/**
 * Small hand-drawn glyphs for the Contact page and Footer — generic
 * shapes (a handset, a speech bubble, a camera aperture), not a redrawn
 * brand logo. Matches the design system's existing icon convention
 * (`EventBadge`'s `AlertGlyph`, `ReviewStep`'s check glyph): plain
 * single-color line art, no icon-library dependency, and never a literal
 * WhatsApp/Instagram brand mark — the surrounding text names the
 * channel, the glyph is just a visual anchor.
 */

export function PhoneGlyph({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className={className}>
      <path
        d="M4.5 2.2 6.1 5 4.6 6.6c.6 1.5 1.9 2.8 3.4 3.4l1.6-1.5 2.8 1.6-.4 2.1c-.1.6-.7 1-1.3.9-4.3-.8-7.6-4.1-8.4-8.4-.1-.6.3-1.2.9-1.3z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChatGlyph({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className={className}>
      <path
        d="M2 3.5h12v6.5H6.5L3.5 12.5V10H2z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CameraGlyph({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className={className}>
      <rect
        x="1.5"
        y="4"
        width="13"
        height="9.5"
        rx="1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path d="M5.5 4 6.7 2.3h2.6L10.5 4" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <circle cx="8" cy="8.7" r="2.4" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}
