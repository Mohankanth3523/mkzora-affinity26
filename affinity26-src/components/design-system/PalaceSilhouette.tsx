interface Building {
  x: number;
  width: number;
  height: number;
  domeRadius: number;
  hasSpire?: boolean;
  archCount?: number;
}

/**
 * Seven structures forming a palace skyline: a tall central dome flanked
 * by symmetric minarets and lower domed wings, each tapering outward.
 * Hand-composed (not randomly generated, unlike StarField) since a
 * skyline needs deliberate symmetry rather than scatter.
 */
const BUILDINGS: Building[] = [
  { x: 0, width: 60, height: 70, domeRadius: 20, archCount: 1 },
  { x: 70, width: 44, height: 110, domeRadius: 14, hasSpire: true, archCount: 1 },
  { x: 130, width: 90, height: 95, domeRadius: 32, archCount: 2 },
  { x: 235, width: 110, height: 160, domeRadius: 46, hasSpire: true, archCount: 3 },
  { x: 360, width: 90, height: 95, domeRadius: 32, archCount: 2 },
  { x: 465, width: 44, height: 110, domeRadius: 14, hasSpire: true, archCount: 1 },
  { x: 525, width: 60, height: 70, domeRadius: 20, archCount: 1 },
];

const SKYLINE_WIDTH = 585;
const SKYLINE_HEIGHT = 170;
const BASELINE = 170;

function BuildingShape({ building }: { building: Building }) {
  const { x, width, height, domeRadius, hasSpire, archCount = 1 } = building;
  const centerX = x + width / 2;
  const bodyTop = BASELINE - height;
  const domeTop = bodyTop - domeRadius;

  const arches = Array.from({ length: archCount }, (_, i) => {
    const archWidth = width / (archCount * 2);
    const archX = x + width * ((i + 0.5) / archCount) - archWidth / 2;
    const archHeight = Math.min(18, height * 0.22);
    return (
      <path
        key={i}
        d={`M ${archX} ${BASELINE} V ${bodyTop + archHeight + 10} a ${archWidth / 2} ${archWidth / 2} 0 0 1 ${archWidth} 0 V ${BASELINE} Z`}
        style={{ fill: "var(--palace-gap-color, #070A18)" }}
      />
    );
  });

  return (
    <g>
      {/* Tower body */}
      <rect x={x} y={bodyTop} width={width} height={height} />
      {/* Dome — a half-ellipse sitting flush on top of the tower body. Sweep-flag 0 bulges the arc toward smaller y (up), since SVG's y-axis points down. */}
      <path d={`M ${x} ${bodyTop} A ${width / 2} ${domeRadius} 0 0 0 ${x + width} ${bodyTop} Z`} />
      {hasSpire ? (
        <>
          <line
            x1={centerX}
            y1={domeTop - domeRadius * 0.7}
            x2={centerX}
            y2={domeTop - domeRadius * 1.6}
            stroke="currentColor"
            strokeWidth={2}
          />
          <circle cx={centerX} cy={domeTop - domeRadius * 1.7} r={2.5} />
        </>
      ) : null}
      {/* Arched window cut-outs — rendered in the surface color, not a mask, so this stays a plain flat SVG usable anywhere. */}
      {arches}
    </g>
  );
}

export interface PalaceSilhouetteProps {
  className?: string;
  /**
   * Pass the page/section background color here so arched-window
   * cut-outs read as "punched through" rather than as gold rectangles.
   * @default "#070A18" (midnight)
   */
  gapColor?: string;
}

/**
 * Wide palace/mosque skyline silhouette — domes, a tall central minaret,
 * and arched window cut-outs — for hero backdrops and the footer. Flat
 * single-tone fill via `currentColor` (typically a low-opacity gold or
 * navy), no gradients.
 *
 * `preserveAspectRatio="xMidYMax meet"` (contain, not cover): a caller
 * that constrains both width and height gets the *whole* skyline —
 * domes and spires included, centered, scaled down as needed — rather
 * than an edge-to-edge strip with the tops cropped off, which is what a
 * "cover" fit produces whenever the container is much wider (relative to
 * its height) than this graphic's own ~3.4:1 aspect ratio, as a full-
 * viewport-width atmosphere strip always is.
 */
export function PalaceSilhouette({ className = "", gapColor = "#070A18" }: PalaceSilhouetteProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${SKYLINE_WIDTH} ${SKYLINE_HEIGHT}`}
      preserveAspectRatio="xMidYMax meet"
      className={className}
      style={{ ["--palace-gap-color" as string]: gapColor }}
    >
      <g fill="currentColor">
        {BUILDINGS.map((building, index) => (
          <BuildingShape key={index} building={building} />
        ))}
      </g>
    </svg>
  );
}
