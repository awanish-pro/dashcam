import React from "react"
import { Glyph } from "./Glyph"

export interface ToggleProps {
  label?: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  showState?: boolean
  className?: string
}

/**
 * Toggle: Square switch adhering to "square by default".
 * Shows visible state word ("On" / "Off") beside the track.
 */
export const Toggle: React.FC<ToggleProps> = ({
  label,
  description,
  checked,
  onChange,
  disabled = false,
  showState = true,
  className = "",
}) => {
  return (
    <label
      className={`inline-flex items-center gap-3 cursor-pointer select-none ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 items-center border transition-colors duration-150 rounded-none focus-ring ${
          checked
            ? "bg-brand border-slate-deep"
            : "bg-surface-sunken border-border-strong"
        }`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 bg-paper transition-transform duration-150 rounded-none ${
            checked ? "translate-x-4.5 bg-on-brand" : "translate-x-0.5 bg-text-muted"
          }`}
        />
      </button>

      {(label || showState) && (
        <div className="text-xs font-body">
          {label && <div className="font-medium text-text">{label}</div>}
          {showState && (
            <span className="font-mono text-[11px] text-text-muted">
              {checked ? "On" : "Off"}
            </span>
          )}
          {description && (
            <div className="text-[11px] text-text-muted">{description}</div>
          )}
        </div>
      )}
    </label>
  )
}

export interface CheckboxProps {
  label?: React.ReactNode
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
  indeterminate?: boolean
  disabled?: boolean
  className?: string
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  description,
  checked,
  onChange,
  indeterminate = false,
  disabled = false,
  className = "",
}) => {
  return (
    <label
      className={`inline-flex items-start gap-2.5 cursor-pointer select-none ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={indeterminate ? "mixed" : checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`flex h-4 w-4 shrink-0 items-center justify-center border transition-colors rounded-none focus-ring mt-0.5 ${
          checked || indeterminate
            ? "bg-brand border-slate-deep text-paper"
            : "bg-surface border-border-strong hover:border-text"
        }`}
      >
        {indeterminate ? (
          <Glyph name="minus" size={10} />
        ) : checked ? (
          <Glyph name="check" size={11} />
        ) : null}
      </button>

      {label && (
        <div className="text-xs font-body">
          <div className="text-text font-medium">{label}</div>
          {description && (
            <div className="text-[11px] text-text-muted">{description}</div>
          )}
        </div>
      )}
    </label>
  )
}
