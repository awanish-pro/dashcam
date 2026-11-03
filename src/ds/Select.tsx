import React, { useState, useRef, useEffect } from "react"
import { Glyph } from "./Glyph"
import { Field } from "./Input"

export interface SelectOption {
  value: string
  label: string
  meta?: string
  disabled?: boolean
}

export interface SelectProps {
  label?: string
  options: SelectOption[]
  value: string
  onChange: (val: string) => void
  placeholder?: string
  hint?: string
  error?: string
  disabled?: boolean
  required?: boolean
  className?: string
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = "Select...",
  hint,
  error,
  disabled = false,
  required = false,
  className = "",
}) => {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selectedOpt = options.find((o) => o.value === value)

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener("mousedown", handleOutside)
    return () => document.removeEventListener("mousedown", handleOutside)
  }, [open])

  const selectControl = (
    <div ref={ref} className={`relative select-none ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className={`flex w-full items-center justify-between border bg-surface px-3 py-2 text-xs font-body text-text transition-colors rounded-none cursor-pointer focus-ring ${
          error
            ? "border-rose-deep"
            : open
              ? "border-focus"
              : "border-border-strong hover:border-text"
        } ${disabled ? "bg-surface-sunken opacity-60 cursor-not-allowed" : ""}`}
      >
        <span className={selectedOpt ? "text-text" : "text-text-muted/60"}>
          {selectedOpt ? selectedOpt.label : placeholder}
        </span>
        <Glyph
          name={open ? "chevron-up" : "chevron-down"}
          size={14}
          className="text-text-muted"
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 w-full border border-rule bg-surface p-1 shadow-none rounded-none max-h-60 overflow-y-auto">
          {options.map((opt) => {
            const isSelected = opt.value === value
            return (
              <button
                key={opt.value}
                type="button"
                disabled={opt.disabled}
                onClick={() => {
                  onChange(opt.value)
                  setOpen(false)
                }}
                className={`flex w-full items-center justify-between px-2.5 py-1.5 text-xs text-left transition-colors rounded-none cursor-pointer ${
                  isSelected
                    ? "bg-action text-on-action font-medium"
                    : "text-text hover:bg-hover"
                } ${opt.disabled ? "opacity-30 cursor-not-allowed" : ""}`}
              >
                <span>{opt.label}</span>
                {opt.meta && (
                  <span
                    className={`font-mono text-[10px] ${
                      isSelected ? "text-on-action/80" : "text-text-muted"
                    }`}
                  >
                    {opt.meta}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )

  if (label || hint || error) {
    return (
      <Field
        label={label}
        hint={hint}
        error={error}
        required={required}
      >
        {selectControl}
      </Field>
    )
  }

  return selectControl
}
