import React from "react"
import { Glyph, GlyphName, Square } from "./Glyph"
import { Label } from "./Typography"

export interface FieldProps {
  label?: string
  required?: boolean
  optional?: boolean
  hint?: string
  error?: string
  children: React.ReactNode
  className?: string
  id?: string
}

export const Field: React.FC<FieldProps> = ({
  label,
  required,
  optional,
  hint,
  error,
  children,
  className = "",
  id,
}) => {
  return (
    <div className={`space-y-1.5 font-body ${className}`}>
      {label && (
        <div className="flex items-center justify-between text-xs">
          <label htmlFor={id} className="flex items-center gap-1 cursor-pointer">
            <Label className="text-text-label">{label}</Label>
            {required && <span className="text-text-accent font-mono">*</span>}
          </label>
          {optional && (
            <span className="font-mono text-[10.5px] text-text-muted">
              (optional)
            </span>
          )}
        </div>
      )}

      {children}

      {error ? (
        <div className="flex items-center gap-1.5 text-xs text-rose-deep font-body">
          <Square color="#7E4554" />
          <span>{error}</span>
        </div>
      ) : hint ? (
        <p className="text-[11px] text-text-muted font-body leading-tight">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  label?: string
  hint?: string
  error?: string
  leading?: GlyphName
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  optional?: boolean
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      hint,
      error,
      leading,
      prefix,
      suffix,
      optional,
      required,
      id,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined)

    const content = (
      <div
        className={`flex items-center border bg-surface transition-colors rounded-none ${
          error
            ? "border-rose-deep focus-within:border-rose-deep"
            : "border-border-strong focus-within:border-focus"
        } ${disabled ? "bg-surface-sunken opacity-60 cursor-not-allowed" : ""}`}
      >
        {leading && (
          <span className="pl-3 text-text-muted">
            <Glyph name={leading} size={15} />
          </span>
        )}
        {prefix && (
          <span className="pl-3 pr-1 text-xs text-text-muted font-mono select-none">
            {prefix}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          required={required}
          className={`w-full bg-transparent px-3 py-2 text-xs font-body text-text placeholder:text-text-muted/60 focus:outline-none rounded-none ${className}`}
          {...props}
        />
        {suffix && (
          <span className="pr-3 pl-1 text-xs text-text-muted font-mono select-none">
            {suffix}
          </span>
        )}
      </div>
    )

    if (label || hint || error || optional) {
      return (
        <Field
          label={label}
          hint={hint}
          error={error}
          required={required}
          optional={optional}
          id={inputId}
        >
          {content}
        </Field>
      )
    }

    return content
  }
)
Input.displayName = "Input"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  hint?: string
  error?: string
  optional?: boolean
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, hint, error, optional, required, id, className = "", ...props }, ref) => {
    const inputId = id || (label ? `ta-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined)

    const content = (
      <textarea
        ref={ref}
        id={inputId}
        required={required}
        className={`w-full border bg-surface p-3 text-xs font-body text-text placeholder:text-text-muted/60 focus:outline-none rounded-none transition-colors ${
          error
            ? "border-rose-deep focus:border-rose-deep"
            : "border-border-strong focus:border-focus"
        } ${className}`}
        {...props}
      />
    )

    if (label || hint || error || optional) {
      return (
        <Field
          label={label}
          hint={hint}
          error={error}
          required={required}
          optional={optional}
          id={inputId}
        >
          {content}
        </Field>
      )
    }

    return content
  }
)
Textarea.displayName = "Textarea"
