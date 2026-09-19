"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { GalleryImage } from "@/data/gallery";
import { assetPath } from "@/lib/basePath";

export interface GalleryProps {
  images: GalleryImage[];
}

/**
 * Phase 32 — the mosaic grid + lightbox that makes up the Gallery
 * section's actual content. Split from `GallerySection` (the Server
 * Component that owns the heading/`SectionContainer`) because opening a
 * lightbox needs client state — the same Server/Client split
 * `EventsExplorer`'s own doc comment describes for the public Events
 * page, applied here for the same reason.
 *
 * Layout: a CSS multi-column masonry (`columns-1 sm:columns-2
 * lg:columns-4`) rather than a fixed-aspect-ratio grid. An earlier
 * version of this component forced every tile into a `4:3`/`3:4` box
 * with `object-cover`, which cropped whoever was standing near the top
 * or edge of a photo out of frame — exactly the "not fully viewable"
 * problem this rewrite fixes. Each thumbnail now renders at `w-full
 * h-auto`, so it keeps its own true aspect ratio and nothing is ever
 * cropped out of a resting thumbnail; a taller portrait photo simply
 * takes a taller cell in its column, which is what makes this a masonry
 * layout rather than a uniform grid of same-size boxes (the
 * repetitive-rounded-card look the project brief explicitly asks to
 * avoid) without needing any cropping to get there. `orientation` on
 * `GalleryImage` is no longer read by this layout — it's kept as
 * descriptive metadata about each source photo's own dimensions, not a
 * layout input.
 *
 * The lightbox reuses this project's existing modal idiom
 * (`EventDetailsModal`, Phase 10): Escape closes, a focus trap keeps Tab
 * inside the panel, background scroll is locked while it's open, and
 * focus returns to the thumbnail that opened it on close. Added on top
 * for a gallery specifically: `ArrowLeft`/`ArrowRight` step to the
 * previous/next photo (wrapping at the ends) — there's no obvious
 * external destination a "View details" style link could point to for a
 * bare photograph the way there is for an event, and browsing images one
 * at a time is the norm this component's own use case (a small photo
 * set) actually calls for.
 *
 * The enlarged photo sizes itself from the panel's own available space,
 * not a raw viewport-height fraction — an earlier version capped the
 * `<img>` at `max-h-[70vh]` regardless of how much room the header and
 * caption actually left it, which could push the panel taller than the
 * screen on short viewports (and the fixed, non-scrolling overlay had no
 * way to reveal what that pushed off-screen). The panel now caps itself
 * at the true available viewport height (`max-h-[calc(100vh-2rem)]`,
 * matching its own outer padding), the header and caption are pinned to
 * their natural size (`shrink-0`), and the image area is the one flex
 * child allowed to give way (`flex-1 min-h-0`) with the `<img>` filling
 * it at `h-full w-full object-contain` — so every photo, landscape or
 * portrait, always renders fully inside the panel on every screen size,
 * instead of occasionally being too tall to fit.
 */
export function Gallery({ images }: GalleryProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const triggerRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function openAt(index: number) {
    setOpenIndex(index);
  }

  function close() {
    setOpenIndex(null);
  }

  return (
    <>
      <div className="columns-1 gap-4 sm:columns-2 sm:gap-5 lg:columns-4 lg:gap-6">
        {images.map((image, index) => (
          <button
            key={image.id}
            type="button"
            ref={(node) => {
              triggerRefs.current[index] = node;
            }}
            onClick={() => openAt(index)}
            aria-label={`View larger photo: ${image.alt}`}
            className="group relative mb-4 block w-full break-inside-avoid overflow-hidden border border-antique-gold/25 text-left transition-[border-color,box-shadow] duration-base ease-ornamental hover:border-antique-gold/60 hover:shadow-gold-glow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-antique-gold sm:mb-5 lg:mb-6"
          >
            <img
              src={assetPath(image.src)}
              alt={image.alt}
              loading="lazy"
              className="block h-auto w-full transition-transform duration-slow ease-ornamental group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-midnight/70 via-transparent to-transparent opacity-0 transition-opacity duration-base group-hover:opacity-100"
            />
          </button>
        ))}
      </div>

      {openIndex !== null ? (
        <Lightbox
          images={images}
          index={openIndex}
          onClose={close}
          onNavigate={setOpenIndex}
          returnFocusTo={triggerRefs.current[openIndex] ?? null}
        />
      ) : null}
    </>
  );
}

interface LightboxProps {
  images: GalleryImage[];
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
  returnFocusTo: HTMLButtonElement | null;
}

function Lightbox({ images, index, onClose, onNavigate, returnFocusTo }: LightboxProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const image = images[index];

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
      if (keyEvent.key === "ArrowRight") {
        keyEvent.preventDefault();
        onNavigate((index + 1) % images.length);
        return;
      }
      if (keyEvent.key === "ArrowLeft") {
        keyEvent.preventDefault();
        onNavigate((index - 1 + images.length) % images.length);
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
      returnFocusTo?.focus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images.length]);

  if (!image) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
    >
      <div aria-hidden="true" onClick={onClose} className="absolute inset-0 animate-modal-backdrop bg-midnight/90" />

      <div
        ref={panelRef}
        className="relative z-10 flex max-h-[calc(100vh-2rem)] w-full max-w-3xl animate-modal-panel flex-col border border-antique-gold/40 bg-royal-navy sm:max-h-[calc(100vh-4rem)]"
      >
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-antique-gold/20 px-4 py-3 sm:px-5">
          <p id={titleId} className="font-body text-xs uppercase tracking-[0.2em] text-desert-sand">
            Photo {index + 1} of {images.length}
          </p>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close photo"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center text-ivory"
          >
            <CloseGlyph />
          </button>
        </div>

        <div className="relative min-h-0 flex-1 overflow-hidden bg-midnight">
          <img src={assetPath(image.src)} alt={image.alt} className="h-full w-full object-contain" />

          {images.length > 1 ? (
            <>
              <button
                type="button"
                onClick={() => onNavigate((index - 1 + images.length) % images.length)}
                aria-label="Previous photo"
                className="absolute left-2 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-antique-gold/40 bg-midnight/70 text-ivory transition-colors duration-fast hover:border-antique-gold/80"
              >
                <ArrowGlyph direction="left" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate((index + 1) % images.length)}
                aria-label="Next photo"
                className="absolute right-2 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-antique-gold/40 bg-midnight/70 text-ivory transition-colors duration-fast hover:border-antique-gold/80"
              >
                <ArrowGlyph direction="right" />
              </button>
            </>
          ) : null}
        </div>

        <p className="shrink-0 border-t border-antique-gold/20 px-4 py-3 font-body text-sm text-desert-sand sm:px-5">
          {image.alt}
        </p>
      </div>
    </div>
  );
}

function CloseGlyph() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4">
      <path d="M4 4 L16 16 M16 4 L4 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ArrowGlyph({ direction }: { direction: "left" | "right" }) {
  const d = direction === "left" ? "M12.5 4 L6 10 L12.5 16" : "M7.5 4 L14 10 L7.5 16";
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
