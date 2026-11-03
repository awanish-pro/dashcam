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
  | "x"
  | "arrow-left"
  | "arrow-right"
  | "search"
  | "more"
  | "calendar"
  | "download"
  | "menu"
  | "map"
  | "list"
  | "users"
  | "sun"
  | "moon"
  | "crosshair"
  | "external"
  | "edit"
  | "map-pin"

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
      {(name === "close" || name === "x") && (
        <path d="M3.5 3.5L12.5 12.5M12.5 3.5L3.5 12.5" />
      )}
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
      {name === "menu" && (
        <path d="M2.5 4H13.5M2.5 8H13.5M2.5 12H13.5" />
      )}
      {name === "map" && (
        <path d="M6 3L2 5V13L6 11L10 13L14 11V3L10 5L6 3ZM6 3V11M10 5V13" />
      )}
      {name === "list" && (
        <path d="M5.5 4H13.5M5.5 8H13.5M5.5 12H13.5M2.5 4H2.51M2.5 8H2.51M2.5 12H2.51" />
      )}
      {name === "users" && (
        <>
          <path d="M11 13V12C11 10.3 9.7 9 8 9H4C2.3 9 1 10.3 1 12V13" />
          <circle cx="6" cy="5" r="2.5" />
          <path d="M15 13V12C15 10.7 14.1 9.6 12.8 9.2M10.5 2.7C11.7 3.1 12.5 4.2 12.5 5.5C12.5 6.3 12.1 7.1 11.5 7.6" />
        </>
      )}
      {name === "sun" && (
        <>
          <circle cx="8" cy="8" r="3" />
          <path d="M8 1.5V3M8 13V14.5M1.5 8H3M13 8H14.5M3.4 3.4L4.5 4.5M11.5 11.5L12.6 12.6M3.4 12.6L4.5 11.5M11.5 4.5L12.6 3.4" />
        </>
      )}
      {name === "moon" && (
        <path d="M13.5 9.5C13 12.5 10.5 14.5 7.5 14.5C4.2 14.5 1.5 11.8 1.5 8.5C1.5 5.5 3.5 3 6.5 2.5C5.8 4 6 5.8 7 7C8.2 8 10 8.2 11.5 7.5C12.5 8 13.2 8.7 13.5 9.5Z" />
      )}
      {name === "crosshair" && (
        <>
          <circle cx="8" cy="8" r="4.5" />
          <path d="M8 1.5V4M8 12V14.5M1.5 8H4M12 8H14.5" />
        </>
      )}
      {name === "external" && (
        <>
          <path d="M12 8.5V13.5H2.5V4H7.5" />
          <path d="M10 2.5H13.5V6M7 9L13.5 2.5" />
        </>
      )}
      {name === "edit" && (
        <path d="M8 13.5H13.5M10.5 2.5L13.5 5.5L5 14L2 14.5L2.5 11.5L10.5 2.5Z" />
      )}
      {name === "map-pin" && (
        <>
          <path d="M8 14.5S3 10.5 3 6.5A5 5 0 0 1 13 6.5C13 10.5 8 14.5 8 14.5Z" />
          <circle cx="8" cy="6.5" r="1.5" />
        </>
      )}
    </svg>
  )
}

/**
 * Filled square for status, stage, or module identification
 */
export const Square: React.FC<{
  className?: string
  color?: string
  title?: string
  size?: number
}> = ({ className = "bg-slate", color, title, size = 6 }) => {
  return (
    <span
      className={`inline-block shrink-0 ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        ...(color ? { backgroundColor: color } : {}),
      }}
      title={title}
      aria-hidden="true"
    />
  )
}
