/**
 * Deterministic star positions for the StarField decoration.
 *
 * Generated once with a seeded PRNG (Python's random.seed(2026)) rather
 * than Math.random() at render time, so server and client render the
 * exact same markup and React never hits a hydration mismatch over
 * decorative positioning. Do not regenerate this on every render.
 */
export interface StarPosition {
  /** Left offset, percent of container width. */
  x: number;
  /** Top offset, percent of container height. */
  y: number;
  /** Diameter in px. */
  size: number;
  /** Twinkle animation-delay in seconds. */
  delay: number;
  /** Twinkle animation-duration in seconds. */
  duration: number;
  /** Peak opacity (0-1) this star twinkles up to. */
  opacity: number;
}

export const STAR_POSITIONS: StarPosition[] = [
  { x: 11.91, y: 50.25, size: 1.82, delay: 5.16, duration: 3.91, opacity: 0.48 },
  { x: 60.1, y: 55.66, size: 2.25, delay: 3.29, duration: 6.42, opacity: 0.81 },
  { x: 75.1, y: 58.65, size: 1.38, delay: 3.69, duration: 3.94, opacity: 0.84 },
  { x: 44.97, y: 81.48, size: 2.1, delay: 4.08, duration: 4.34, opacity: 0.5 },
  { x: 97.99, y: 92.93, size: 2.29, delay: 6.0, duration: 5.55, opacity: 0.4 },
  { x: 34.04, y: 55.75, size: 1.47, delay: 2.74, duration: 7.01, opacity: 0.77 },
  { x: 57.74, y: 2.47, size: 2.14, delay: 2.18, duration: 5.19, opacity: 0.59 },
  { x: 58.57, y: 49.85, size: 1.19, delay: 3.04, duration: 6.5, opacity: 0.71 },
  { x: 49.1, y: 91.68, size: 1.41, delay: 2.52, duration: 7.2, opacity: 0.64 },
  { x: 51.8, y: 2.54, size: 1.36, delay: 0.77, duration: 3.7, opacity: 0.77 },
  { x: 88.68, y: 10.26, size: 2.0, delay: 2.82, duration: 5.43, opacity: 0.49 },
  { x: 88.59, y: 62.67, size: 1.73, delay: 2.82, duration: 7.22, opacity: 0.94 },
  { x: 54.56, y: 55.98, size: 2.07, delay: 1.85, duration: 6.7, opacity: 0.65 },
  { x: 47.89, y: 88.45, size: 1.69, delay: 1.77, duration: 4.58, opacity: 0.37 },
  { x: 65.56, y: 59.73, size: 1.73, delay: 3.14, duration: 5.46, opacity: 0.9 },
  { x: 26.01, y: 48.56, size: 1.82, delay: 4.96, duration: 6.73, opacity: 0.68 },
  { x: 90.73, y: 83.14, size: 1.51, delay: 5.5, duration: 3.89, opacity: 0.76 },
  { x: 78.51, y: 51.52, size: 1.72, delay: 5.79, duration: 7.37, opacity: 0.86 },
  { x: 47.91, y: 6.43, size: 1.43, delay: 2.99, duration: 3.89, opacity: 0.8 },
  { x: 41.13, y: 44.94, size: 1.02, delay: 0.0, duration: 5.82, opacity: 0.91 },
  { x: 8.31, y: 79.38, size: 1.4, delay: 3.73, duration: 6.51, opacity: 0.92 },
  { x: 66.85, y: 63.54, size: 1.25, delay: 1.88, duration: 5.83, opacity: 0.81 },
  { x: 94.99, y: 49.2, size: 2.15, delay: 0.81, duration: 4.39, opacity: 0.7 },
  { x: 95.83, y: 87.6, size: 1.81, delay: 0.51, duration: 6.17, opacity: 0.91 },
  { x: 78.34, y: 91.5, size: 1.49, delay: 2.47, duration: 6.73, opacity: 0.66 },
  { x: 19.67, y: 1.41, size: 1.17, delay: 5.33, duration: 3.71, opacity: 0.56 },
  { x: 35.34, y: 76.95, size: 1.04, delay: 3.06, duration: 4.81, opacity: 0.53 },
  { x: 32.6, y: 12.14, size: 2.52, delay: 3.43, duration: 6.72, opacity: 0.44 },
  { x: 51.96, y: 43.36, size: 1.54, delay: 3.59, duration: 6.21, opacity: 0.39 },
  { x: 39.92, y: 19.55, size: 2.47, delay: 0.27, duration: 5.68, opacity: 0.85 },
  { x: 45.18, y: 75.47, size: 1.3, delay: 4.27, duration: 7.01, opacity: 0.43 },
  { x: 52.99, y: 78.54, size: 1.83, delay: 5.74, duration: 4.14, opacity: 0.86 },
  { x: 39.0, y: 42.54, size: 1.66, delay: 0.47, duration: 4.72, opacity: 0.56 },
  { x: 26.34, y: 49.76, size: 2.25, delay: 2.49, duration: 5.37, opacity: 0.55 },
  { x: 48.21, y: 12.01, size: 2.27, delay: 4.78, duration: 6.76, opacity: 0.86 },
  { x: 23.13, y: 95.37, size: 2.41, delay: 3.87, duration: 5.13, opacity: 0.82 },
  { x: 84.95, y: 67.04, size: 2.54, delay: 2.11, duration: 4.13, opacity: 0.69 },
  { x: 57.23, y: 53.84, size: 1.18, delay: 4.3, duration: 5.72, opacity: 0.69 },
  { x: 21.44, y: 29.47, size: 1.43, delay: 3.33, duration: 3.91, opacity: 0.51 },
  { x: 95.49, y: 17.13, size: 2.1, delay: 4.55, duration: 6.39, opacity: 0.46 },
  { x: 63.01, y: 50.66, size: 1.44, delay: 5.02, duration: 4.66, opacity: 0.54 },
  { x: 26.09, y: 6.29, size: 1.66, delay: 5.39, duration: 6.61, opacity: 0.6 },
  { x: 1.54, y: 9.64, size: 1.04, delay: 0.74, duration: 6.24, opacity: 0.7 },
  { x: 93.61, y: 35.03, size: 2.25, delay: 3.64, duration: 6.12, opacity: 0.72 },
  { x: 92.47, y: 31.61, size: 1.35, delay: 2.78, duration: 7.42, opacity: 0.88 },
  { x: 68.65, y: 86.13, size: 2.09, delay: 5.54, duration: 5.06, opacity: 0.92 },
  { x: 35.63, y: 73.54, size: 1.7, delay: 0.14, duration: 6.28, opacity: 0.52 },
  { x: 95.83, y: 79.98, size: 1.2, delay: 4.61, duration: 4.78, opacity: 0.89 },
];
