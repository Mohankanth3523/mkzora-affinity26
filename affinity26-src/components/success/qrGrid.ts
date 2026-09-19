/**
 * Deterministic "QR-shaped" decoration shared by the on-screen pass (RegistrationPass.tsx) and the A4 print/PDF
 * pass (passDocument.ts). Never real QR data: this pass encodes nothing and verifies nothing (the caption on the
 * pass says so). A fixed boolean grid, not `Math.random()`, so server and client always render identically.
 * Moved here unchanged from RegistrationPass.tsx so both renderings draw exactly the same code.
 */
export const QR_GRID: boolean[][] = [
  [1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
  [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0],
  [1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1],
  [1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1],
  [1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 1, 0],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1],
  [1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0, 1],
].map((row) => row.map(Boolean));
