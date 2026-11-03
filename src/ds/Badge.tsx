import React from "react"
import { Square } from "./Glyph"

export type StatusTone = "neutral" | "info" | "success" | "caution" | "critical"

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: StatusTone
  variant?: "outline" | "soft"
  dot?: boolean
  word?: string
}

export const Badge: React.FC<BadgeProps> = ({
  tone = "neutral",
  variant = "soft",
  dot = true,
  word,
  children,
  className = "",
  ...props
}) => {
  const toneStyles: Record<StatusTone, { bg: string; text: string; border: string; dotColor: string; defaultWord: string }> = {
    neutral: {
      bg: "bg-surface-raised",
      text: "text-text",
      border: "border-border",
      dotColor: "#615A52",
      defaultWord: "General",
    },
    info: {
      bg: "bg-slate-tint",
      text: "text-slate-deep",
      border: "border-slate-wash",
      dotColor: "#2F4E6D",
      defaultWord: "Notice",
    },
    success: {
      bg: "bg-sage-tint",
      text: "text-sage-dark",
      border: "border-sage-wash",
      dotColor: "#4F5D50",
      defaultWord: "Resolved",
    },
    caution: {
      bg: "bg-rose-tint",
      text: "text-rose-deep",
      border: "border-rose-wash",
      dotColor: "#9A5B6A",
      defaultWord: "Caution",
    },
    critical: {
      bg: variant === "outline" ? "bg-rose-wash" : "bg-rose-deep",
      text: variant === "outline" ? "text-rose-deep" : "text-paper",
      border: "border-rose-deep",
      dotColor: variant === "outline" ? "#7E4554" : "#F5F3EC",
      defaultWord: "Critical",
    },
  }

  const current = toneStyles[tone]
  const displayWord = word || children || current.defaultWord

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 border text-xs font-medium font-body rounded-none ${current.bg} ${current.text} ${current.border} ${className}`}
      {...props}
    >
      {dot && <Square color={current.dotColor} />}
      <span className="leading-none">{displayWord}</span>
    </span>
  )
}

export interface CountBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  value?: number | string
  count?: number | string
  tone?: "neutral" | "critical"
  urgent?: boolean
}

export const CountBadge: React.FC<CountBadgeProps> = ({
  value,
  count,
  tone = "neutral",
  urgent = false,
  className = "",
  ...props
}) => {
  const isCritical = urgent || tone === "critical"
  const rawValue = count !== undefined ? count : value ?? 0
  const displayValue = typeof rawValue === "number" && rawValue > 99 ? "99+" : rawValue

  return (
    <span
      className={`inline-flex items-center justify-center min-w-5 h-4.5 px-1 font-mono text-[11px] font-medium rounded-none ${
        isCritical
          ? "bg-rose-deep text-paper"
          : "bg-surface-raised text-text-muted border border-border"
      } ${className}`}
      {...props}
    >
      {displayValue}
    </span>
  )
}

export type StageType = "live" | "pilot" | "prototype" | "Live" | "Pilot" | "Prototype"

export interface StageTagProps extends React.HTMLAttributes<HTMLSpanElement> {
  stage: StageType
}

/**
 * StageTag is the only pill in the design system.
 * Used for Live, Pilot, and Prototype system indicators.
 */
export const StageTag: React.FC<StageTagProps> = ({
  stage = "live",
  className = "",
  ...props
}) => {
  const stageStyles: Record<"live" | "pilot" | "prototype", { bg: string; text: string; label: string }> = {
    live: {
      bg: "bg-slate-deep",
      text: "text-paper",
      label: "Live",
    },
    pilot: {
      bg: "bg-rose-deep",
      text: "text-paper",
      label: "Pilot",
    },
    prototype: {
      bg: "bg-sage-dark",
      text: "text-paper",
      label: "Prototype",
    },
  }

  const normalized = (String(stage || "live").toLowerCase()) as "live" | "pilot" | "prototype"
  const s = stageStyles[normalized] || stageStyles.live

  return (
    <span
      className={`inline-flex items-center rounded-pill px-2.5 py-0.5 text-[10.5px] font-mono font-medium uppercase tracking-[0.06em] ${s.bg} ${s.text} ${className}`}
      {...props}
    >
      {s.label}
    </span>
  )
}
