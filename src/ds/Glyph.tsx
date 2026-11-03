import React from "react"

export type GlyphName =
  | "chevron-down"
  | "chevron-up"
  | "chevron-left"
  | "chevron-right"
  | "check"
  | "minus"
  | "plus"
  | "close"
  | "arrow-left"
  | "arrow-right"
  | "search"
  | "more"
  | "calendar"
  | "download"

interface GlyphProps extends React.SVGProps<SVGSVGElement> {
  name: GlyphName
  size?: number | string
}

export const Glyph: React.FC<GlyphProps> = ({
  name,
  size = 16,
  className = "",
  ...props
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
      {...props}
    >
      {name === "chevron-down" && <path d="M3 6L8 11L13 6" />}
      {name === "chevron-up" && <path d="M3 10L8 5L13 10" />}
      {name === "chevron-left" && <path d="M10 3L5 8L10 13" />}
      {name === "chevron-right" && <path d="M6 3L11 8L6 13" />}
      {name === "check" && <path d="M2.5 8.5L6 12L13.5 4.5" />}
      {name === "minus" && <path d="M3 8H13" />}
      {name === "plus" && <path d="M8 3V13M3 8H13" />}
      {name === "close" && <path d="M3.5 3.5L12.5 12.5M12.5 3.5L3.5 12.5" />}
      {name === "arrow-left" && <path d="M13 8H3M7 4L3 8L7 12" />}
      {name === "arrow-right" && <path d="M3 8H13M9 4L13 8L9 12" />}
      {name === "search" && (
        <>
          <circle cx="7" cy="7" r="4.25" />
          <path d="M10.2 10.2L13.5 13.5" />
        </>
      )}
      {name === "more" && (
        <>
          <rect x="2.5" y="7.25" width="1.5" height="1.5" fill="currentColor" stroke="none" />
          <rect x="7.25" y="7.25" width="1.5" height="1.5" fill="currentColor" stroke="none" />
          <rect x="12" y="7.25" width="1.5" height="1.5" fill="currentColor" stroke="none" />
        </>
      )}
      {name === "calendar" && (
        <>
          <rect x="2.5" y="3.5" width="11" height="10" />
          <path d="M5 2V4M11 2V4M2.5 6.5H13.5" />
        </>
      )}
      {name === "download" && (
        <>
          <path d="M8 2.5V10.5M5 7.5L8 10.5L11 7.5" />
          <path d="M2.5 13.5H13.5" />
        </>
      )}
    </svg>
  )
}

/**
 * 6px filled square for status, stage, or module identification
 */
export const Square: React.FC<{
  className?: string
  color?: string
  title?: string
}> = ({ className = "bg-slate", color, title }) => {
  return (
    <span
      className={`inline-block w-1.5 h-1.5 shrink-0 ${className}`}
      style={color ? { backgroundColor: color } : undefined}
      title={title}
      aria-hidden="true"
    />
  )
}
