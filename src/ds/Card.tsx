import React from "react"
import { Figure, Label, Caption } from "./Typography"
import { Square } from "./Glyph"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  level?: 0 | 1 | 2
  headerStrip?: React.ReactNode
}

export const Card: React.FC<CardProps> = ({
  level = 0,
  headerStrip,
  children,
  className = "",
  ...props
}) => {
  const levelStyles = {
    0: "bg-surface border-border",
    1: "bg-surface-raised border-border",
    2: "bg-surface border-rule",
  }[level]

  return (
    <div
      className={`border rounded-none ${levelStyles} ${className}`}
      {...props}
    >
      {headerStrip && (
        <div className="border-b border-border bg-surface-raised px-4 py-2 flex items-center justify-between text-xs">
          {headerStrip}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  )
}

export interface MetricCardProps {
  label: string
  code?: string
  figure: string | number
  unit?: string
  delta?: {
    value: string
    isPositive?: boolean
    goodWhen?: "up" | "down"
  }
  progress?: number // 0 to 100 flat bar
  source: string // REQUIRED source line
  accentColor?: string
  className?: string
}

/**
 * MetricCard: Airawat Dashboard tile
 * Includes header strip with label & module code, Space Grotesk figure,
 * mono delta, flat trend bar, and mandatory source line.
 */
export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  code = "PGR",
  figure,
  unit,
  delta,
  progress,
  source,
  accentColor = "#52769A",
  className = "",
}) => {
  const isGood =
    delta && delta.goodWhen
      ? delta.goodWhen === "up"
        ? delta.isPositive
        : !delta.isPositive
      : true

  return (
    <div
      className={`border border-border bg-surface rounded-none flex flex-col justify-between ${className}`}
    >
      {/* Header Strip */}
      <div className="flex items-center justify-between border-b border-border bg-surface-raised px-3.5 py-1.5 text-xs select-none">
        <div className="flex items-center gap-1.5">
          <Square color={accentColor} />
          <Label className="text-text-label">{label}</Label>
        </div>
        {code && <span className="font-mono text-[10.5px] text-text-muted">{code}</span>}
      </div>

      {/* Metric Content */}
      <div className="p-3.5 space-y-2">
        <div className="flex items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-1.5">
            <Figure size="xl" className="text-text">
              {figure}
            </Figure>
            {unit && (
              <span className="font-body text-xs text-text-muted uppercase font-medium">
                {unit}
              </span>
            )}
          </div>

          {delta && (
            <span
              className={`font-mono text-xs font-medium ${
                isGood ? "text-sage-dark" : "text-rose-deep"
              }`}
            >
              {delta.isPositive ? "▲" : "▼"} {delta.value}
            </span>
          )}
        </div>

        {/* Flat Trend Bar */}
        {progress !== undefined && (
          <div className="w-full bg-surface-sunken h-1.5 rounded-none overflow-hidden">
            <div
              className="h-full rounded-none"
              style={{
                width: `${Math.min(100, Math.max(0, progress))}%`,
                backgroundColor: accentColor,
              }}
            />
          </div>
        )}
      </div>

      {/* Mandatory Source Line */}
      <div className="border-t border-border/60 px-3.5 py-1.5 bg-surface-raised/40">
        <Caption className="text-[10px] lowercase text-text-muted">
          {source}
        </Caption>
      </div>
    </div>
  )
}

export interface StatFigureProps {
  figure: string | number
  label: string
  size?: "xl" | "m"
  outline?: boolean
  className?: string
}

export const StatFigure: React.FC<StatFigureProps> = ({
  figure,
  label,
  size = "xl",
  outline = false,
  className = "",
}) => {
  return (
    <div className={`border-t border-rule pt-2 space-y-1 ${className}`}>
      <Figure size={size} outline={outline} className="block leading-none">
        {figure}
      </Figure>
      <div className="type-body-s text-text-muted">{label}</div>
    </div>
  )
}
