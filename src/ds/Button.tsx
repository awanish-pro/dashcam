import React from "react"
import { Glyph, GlyphName } from "./Glyph"

export type ButtonVariant =
  | "primary"
  | "brand"
  | "secondary"
  | "ghost"
  | "critical"
  | "link"

export type ButtonSize = "sm" | "md" | "lg"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  leading?: GlyphName
  trailing?: GlyphName
  loading?: boolean
  block?: boolean
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  leading,
  trailing,
  loading = false,
  block = false,
  disabled,
  children,
  className = "",
  ...props
}) => {
  const variantStyles: Record<ButtonVariant, string> = {
    primary:
      "bg-action text-on-action hover:opacity-90 active:opacity-95 border border-rule",
    brand:
      "bg-brand text-on-brand hover:opacity-90 active:opacity-95 border border-slate-deep",
    secondary:
      "bg-surface text-text border border-rule hover:bg-hover active:bg-surface-sunken",
    ghost:
      "bg-transparent text-text border border-transparent hover:bg-hover active:bg-surface-sunken",
    critical:
      "bg-rose-deep text-paper hover:opacity-90 active:opacity-95 border border-rose-deep",
    link: "bg-transparent text-text-label underline hover:text-text border-0 p-0 h-auto",
  }

  const sizeStyles: Record<ButtonSize, string> = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 text-xs",
    lg: "h-12 px-5 text-sm",
  }

  const isLink = variant === "link"

  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 font-medium font-body rounded-none transition-colors duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none focus-ring ${
        isLink ? "" : sizeStyles[size]
      } ${variantStyles[variant]} ${block ? "w-full" : ""} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-current animate-pulse" />
          <span className="w-1.5 h-1.5 bg-current animate-pulse delay-75" />
          <span className="w-1.5 h-1.5 bg-current animate-pulse delay-150" />
        </span>
      ) : (
        <>
          {leading && <Glyph name={leading} size={size === "sm" ? 14 : 16} />}
          <span>{children}</span>
          {trailing && <Glyph name={trailing} size={size === "sm" ? 14 : 16} />}
        </>
      )}
    </button>
  )
}

export interface IconButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  glyph: GlyphName
  label: string
  size?: "sm" | "md" | "lg"
  variant?: "ghost" | "secondary"
}

export const IconButton: React.FC<IconButtonProps> = ({
  glyph,
  label,
  size = "sm",
  variant = "ghost",
  className = "",
  ...props
}) => {
  const sizeMap = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  }
  const glyphSize = size === "sm" ? 14 : 16

  const variantStyles = {
    ghost: "bg-transparent text-text hover:bg-hover border border-transparent",
    secondary: "bg-surface text-text border border-rule hover:bg-hover",
  }

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className={`inline-flex items-center justify-center rounded-none transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed focus-ring ${sizeMap[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      <Glyph name={glyph} size={glyphSize} />
    </button>
  )
}

export interface ButtonGroupOption<T extends string = string> {
  value: T
  label: string
  count?: number | string
}

export interface ButtonGroupProps<T extends string = string> {
  options: ButtonGroupOption<T>[]
  value: T
  onChange: (val: T) => void
  label?: string
  size?: "sm" | "md"
  className?: string
}

export function ButtonGroup<T extends string = string>({
  options,
  value,
  onChange,
  label,
  size = "sm",
  className = "",
}: ButtonGroupProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={`inline-flex items-center border border-rule bg-surface p-0.5 rounded-none ${className}`}
    >
      {options.map((opt) => {
        const isSelected = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(opt.value)}
            className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium font-body transition-colors cursor-pointer rounded-none select-none ${
              size === "sm" ? "h-7" : "h-9 px-4"
            } ${
              isSelected
                ? "bg-action text-on-action"
                : "text-text hover:bg-hover"
            }`}
          >
            <span>{opt.label}</span>
            {opt.count !== undefined && (
              <span
                className={`text-[10px] font-mono px-1 ${
                  isSelected ? "bg-surface text-text" : "text-text-muted"
                }`}
              >
                {opt.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
