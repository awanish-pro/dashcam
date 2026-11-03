import React from "react"

export interface DisplayProps extends React.HTMLAttributes<HTMLHeadingElement> {
  size?: "xl" | "l" | "m" | "heading" | "lg"
  accent?: string
  as?: "h1" | "h2" | "h3" | "h4" | "div"
}

export const Display: React.FC<DisplayProps> = ({
  size = "l",
  accent,
  as: Component = "h2",
  children,
  className = "",
  ...props
}) => {
  const sizeClasses = {
    xl: "type-display-xl",
    l: "type-display-l",
    lg: "type-display-l",
    m: "type-display-m",
    heading: "type-heading",
  }[size]

  return (
    <Component
      className={`text-text font-display font-medium ${sizeClasses} ${className}`}
      {...props}
    >
      {children}
      {accent && (
        <>
          {" "}
          <span className="text-text-accent font-medium">{accent}</span>
        </>
      )}
    </Component>
  )
}

export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  size?: "lead" | "body" | "body-s"
  muted?: boolean
  as?: "p" | "span" | "div"
}

export const Text: React.FC<TextProps> = ({
  size = "body",
  muted = false,
  as: Component = "p",
  children,
  className = "",
  ...props
}) => {
  const sizeClasses = {
    lead: "type-lead",
    body: "type-body",
    "body-s": "type-body-s",
  }[size]

  return (
    <Component
      className={`font-body ${muted ? "text-text-muted" : "text-text"} ${sizeClasses} ${className}`}
      {...props}
    >
      {children}
    </Component>
  )
}

export const Label: React.FC<React.HTMLAttributes<HTMLSpanElement>> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <span
      className={`type-label text-text-label font-mono font-medium tracking-[0.08em] uppercase ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}

export const Caption: React.FC<React.HTMLAttributes<HTMLSpanElement>> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <span
      className={`type-caption text-text-muted font-mono tracking-[0.04em] uppercase ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}

export interface FigureProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: "xl" | "m"
  outline?: boolean
}

export const Figure: React.FC<FigureProps> = ({
  size = "xl",
  outline = false,
  children,
  className = "",
  ...props
}) => {
  const sizeClass = size === "xl" ? "type-figure-xl" : "type-figure-m"
  return (
    <span
      className={`font-display font-semibold ${sizeClass} ${
        outline ? "figure-outline" : "text-text"
      } ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}

export const RunningHead: React.FC<{
  left?: string
  right?: string
  code?: string
  label?: string
  className?: string
}> = ({ left, right = "Airawat OS", code, label, className = "" }) => {
  const leftText = left || (code ? `${code} · ${label}` : label || "")
  return (
    <div
      className={`flex items-center justify-between border-b border-rule pb-2 mb-4 select-none ${className}`}
    >
      <Label>{leftText}</Label>
      {right && <Caption>{right}</Caption>}
    </div>
  )
}
