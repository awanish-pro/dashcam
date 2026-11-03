import React from "react"

interface MotifProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string
  color?: string
}

/**
 * Vastu Motif: 9 x 9 pada grid with central Brahma pada.
 * Used for empty states, onboarding, contents.
 */
export const VastuMotif: React.FC<MotifProps> = ({
  size = 72,
  color = "currentColor",
  className = "",
  ...props
}) => {
  const step = 8
  const total = 72
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${total} ${total}`}
      fill="none"
      stroke={color}
      strokeWidth="0.75"
      className={`shrink-0 opacity-40 ${className}`}
      aria-hidden="true"
      {...props}
    >
      {/* Outer border */}
      <rect x="0.5" y="0.5" width={total - 1} height={total - 1} />
      {/* Grid lines */}
      {Array.from({ length: 8 }, (_, i) => {
        const p = (i + 1) * step
        return (
          <React.Fragment key={i}>
            <line x1={p} y1={0} x2={p} y2={total} />
            <line x1={0} y1={p} x2={total} y2={p} />
          </React.Fragment>
        )
      })}
      {/* Central Brahma Pada (3x3 grid centered) */}
      <rect x={step * 3} y={step * 3} width={step * 3} height={step * 3} strokeWidth="1.25" />
      <line x1={step * 3} y1={step * 3} x2={step * 6} y2={step * 6} strokeWidth="0.5" />
      <line x1={step * 6} y1={step * 3} x2={step * 3} y2={step * 6} strokeWidth="0.5" />
    </svg>
  )
}

/**
 * Kolam Motif: Continuous line looping around dot matrix.
 * Used for network, connections, offline states.
 */
export const KolamMotif: React.FC<MotifProps> = ({
  size = 72,
  color = "currentColor",
  className = "",
  ...props
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 72 72"
      fill="none"
      stroke={color}
      strokeWidth="0.75"
      className={`shrink-0 opacity-40 ${className}`}
      aria-hidden="true"
      {...props}
    >
      {/* Dots */}
      {[18, 36, 54].map((x) =>
        [18, 36, 54].map((y) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="1.5" fill={color} stroke="none" />
        ))
      )}
      {/* Loops */}
      <path
        d="M36 6 C18 6 6 18 6 36 C6 54 18 66 36 66 C54 66 66 54 66 36 C66 18 54 6 36 6 Z"
        strokeDasharray="4 2"
      />
      <path d="M36 12 C24 12 12 24 12 36 C12 48 24 60 36 60 C48 60 60 48 60 36 C60 24 48 12 36 12 Z" />
      <path d="M18 36 Q36 18 54 36 Q36 54 18 36 Z" />
    </svg>
  )
}

/**
 * Jaali Motif: Pierced stone screen lattice.
 * Used for ways of seeing, VMS surfaces.
 */
export const JaaliMotif: React.FC<MotifProps> = ({
  size = 72,
  color = "currentColor",
  className = "",
  ...props
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 72 72"
      fill="none"
      stroke={color}
      strokeWidth="0.75"
      className={`shrink-0 opacity-35 ${className}`}
      aria-hidden="true"
      {...props}
    >
      <rect x="0.5" y="0.5" width="71" height="71" />
      {/* Repeating 45deg lattice */}
      <line x1="0" y1="18" x2="18" y2="0" />
      <line x1="0" y1="36" x2="36" y2="0" />
      <line x1="0" y1="54" x2="54" y2="0" />
      <line x1="0" y1="72" x2="72" y2="0" />
      <line x1="18" y1="72" x2="72" y2="18" />
      <line x1="36" y1="72" x2="72" y2="36" />
      <line x1="54" y1="72" x2="72" y2="54" />

      <line x1="0" y1="54" x2="18" y2="72" />
      <line x1="0" y1="36" x2="36" y2="72" />
      <line x1="0" y1="18" x2="54" y2="72" />
      <line x1="0" y1="0" x2="72" y2="72" />
      <line x1="18" y1="0" x2="72" y2="54" />
      <line x1="36" y1="0" x2="72" y2="36" />
      <line x1="54" y1="0" x2="72" y2="18" />
    </svg>
  )
}

/**
 * Baoli Motif: Stepwell in section.
 * Used for layered reading, drill-down, errors.
 */
export const BaoliMotif: React.FC<MotifProps & { coloured?: boolean }> = ({
  size = 72,
  color = "currentColor",
  coloured = false,
  className = "",
  ...props
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 72 72"
      fill="none"
      stroke={color}
      strokeWidth="0.75"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
      {...props}
    >
      {/* Symmetrical descending step profiles */}
      <path
        d="M4 14 H14 V24 H24 V34 H34 V48 H38 V34 H48 V24 H58 V14 H68"
        stroke={coloured ? "#7E4554" : color}
        strokeWidth="1.25"
      />
      <path
        d="M8 20 H18 V30 H28 V40 H44 V30 H54 V20 H64"
        stroke={coloured ? "#52769A" : color}
        opacity={coloured ? 1 : 0.6}
      />
      <path
        d="M12 26 H22 V36 H32 V46 H40 V36 H50 V26 H60"
        stroke={coloured ? "#96A394" : color}
        opacity={coloured ? 1 : 0.4}
      />
      <line x1="4" y1="58" x2="68" y2="58" stroke={color} strokeWidth="1" />
      <line x1="36" y1="48" x2="36" y2="58" stroke={color} strokeDasharray="2 2" />
    </svg>
  )
}

/**
 * Stambha Motif: Temple pillar / column silhouette.
 * Used for platform, roadmap, team.
 */
export const StambhaMotif: React.FC<MotifProps> = ({
  size = 72,
  color = "currentColor",
  className = "",
  ...props
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 72 72"
      fill="none"
      stroke={color}
      strokeWidth="0.75"
      className={`shrink-0 opacity-40 ${className}`}
      aria-hidden="true"
      {...props}
    >
      {/* Capital */}
      <rect x="18" y="8" width="36" height="4" strokeWidth="1" />
      <path d="M22 12 L26 20 H46 L50 12 Z" />
      {/* Shaft with vertical fluting */}
      <line x1="27" y1="20" x2="27" y2="56" />
      <line x1="31" y1="20" x2="31" y2="56" />
      <line x1="36" y1="20" x2="36" y2="56" />
      <line x1="41" y1="20" x2="41" y2="56" />
      <line x1="45" y1="20" x2="45" y2="56" />
      {/* Base */}
      <path d="M25 56 L22 62 H50 L47 56 Z" />
      <rect x="18" y="62" width="36" height="4" strokeWidth="1" />
    </svg>
  )
}
