import React from "react"
import { VastuMotif, BaoliMotif } from "./Motifs"
import { Display, Text, Label } from "./Typography"

export interface EmptyStateProps {
  label?: string
  title: string
  accent?: string
  body?: string
  actions?: React.ReactNode
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  label = "Empty State",
  title,
  accent,
  body,
  actions,
  actionLabel,
  onAction,
  className = "",
}) => {
  return (
    <div
      className={`border border-border bg-surface p-8 text-center flex flex-col items-center justify-center space-y-4 rounded-none ${className}`}
    >
      <VastuMotif size={64} className="text-slate opacity-40 mb-2" />
      {label && <Label>{label}</Label>}
      <Display size="m" accent={accent} className="max-w-md">
        {title}
      </Display>
      {body && (
        <Text size="body-s" muted className="max-w-sm">
          {body}
        </Text>
      )}
      {(actions || (actionLabel && onAction)) && (
        <div className="pt-2 flex items-center gap-2">
          {actions}
          {actionLabel && onAction && (
            <button
              type="button"
              onClick={onAction}
              className="px-4 py-2 border border-rule bg-surface hover:bg-hover text-xs font-mono font-medium text-text transition-colors cursor-pointer"
            >
              {actionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export interface ErrorStateProps {
  code?: string
  title: string
  accent?: string
  body: string
  onRetry?: () => void
  className?: string
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  code = "ERR-SYS-500",
  title,
  accent,
  body,
  onRetry,
  className = "",
}) => {
  return (
    <div
      className={`border border-rose-deep bg-rose-wash/30 p-8 text-center flex flex-col items-center justify-center space-y-3 rounded-none ${className}`}
    >
      <BaoliMotif size={64} coloured className="mb-2" />
      <span className="font-mono text-xs text-rose-deep font-medium">
        [{code}]
      </span>
      <Display size="m" accent={accent} className="text-text max-w-md">
        {title}
      </Display>
      <Text size="body-s" muted className="max-w-sm">
        {body}
      </Text>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 h-8 px-4 bg-action text-on-action text-xs font-medium font-body border border-rule hover:opacity-90 cursor-pointer"
        >
          Retry request
        </button>
      )}
    </div>
  )
}

export const Loading: React.FC<{ label?: string; className?: string }> = ({
  label = "Loading telemetry data...",
  className = "",
}) => {
  return (
    <div
      className={`flex items-center justify-center gap-2.5 p-6 text-xs text-text-muted font-body select-none ${className}`}
    >
      <span className="flex items-center gap-1">
        <span className="w-1.5 h-1.5 bg-slate animate-pulse" />
        <span className="w-1.5 h-1.5 bg-slate animate-pulse [animation-delay:150ms]" />
        <span className="w-1.5 h-1.5 bg-slate animate-pulse [animation-delay:300ms]" />
      </span>
      <span className="font-mono text-[11px] uppercase tracking-wider">{label}</span>
    </div>
  )
}
