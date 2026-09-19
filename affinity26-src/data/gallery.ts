/**
 * Gallery data — photographs supplied directly by the organizing team,
 * not transcribed from any of the official brochure/document sources
 * `docs/affinity-content-truth.md` governs. Media assets like these
 * aren't "official facts" in the TRUTH MODE sense (there's no fee, name,
 * or rule to get wrong) — this file exists purely so no image path or
 * alt text is hard-coded inside a component, the same reasoning
 * `data/branding.ts` (Phase 29) already established for logo assets.
 *
 * `alt` text is deliberately plain and descriptive of what the
 * photograph literally shows — never a specific claim about *which*
 * AFFINITY edition, date, or event a photo is from, since nothing in
 * these images' filenames or metadata states that, and inventing one
 * would be exactly the kind of unsupported factual claim this project's
 * source-of-truth rule exists to prevent. Where a photo's own backdrop
 * visibly reads "AFFINITY 25," that's a detail visible in the photo
 * itself, not an assertion this file is making on the site's behalf.
 */

export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  /**
   * A plain fact about the source photo's own dimensions, not a design
   * choice baked into the data. Not currently read by `Gallery.tsx`'s
   * masonry layout (each thumbnail sizes itself from the image's real
   * aspect ratio instead — see that component's doc comment for why an
   * earlier fixed-aspect-ratio version of this layout was replaced),
   * kept here as descriptive metadata in case a future layout wants it.
   */
  orientation: "landscape" | "portrait";
}

export const galleryImages: GalleryImage[] = [
  {
    id: "college-gathering",
    src: "/assets/gallery/affinity-college-gathering.jpg",
    alt: "A large group of students in white coats and maroon scrubs gathered across a multi-level staircase and balcony for a group photograph.",
    orientation: "landscape",
  },
  {
    id: "stage-performance",
    src: "/assets/gallery/affinity-stage-performance.jpg",
    alt: "A performer sings into a handheld microphone under stage lighting.",
    orientation: "portrait",
  },
  {
    id: "honour-moment",
    src: "/assets/gallery/affinity-honour-moment.jpg",
    alt: "Two performers embrace on stage as one is presented with a silk shawl, in front of an illuminated AFFINITY backdrop.",
    orientation: "portrait",
  },
  {
    id: "dance-performance",
    src: "/assets/gallery/affinity-dance-performance.jpg",
    alt: "A dancer in a saree performs mid-movement on stage in front of an illuminated AFFINITY backdrop and sponsor boards.",
    orientation: "landscape",
  },
];
