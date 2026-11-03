import React from "react"
import { Label, Caption } from "./Typography"

export const LogoSlot: React.FC<{ size?: number; className?: string }> = ({
  size = 28,
  className = "",
}) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative shrink-0 flex items-center justify-center bg-ink text-paper rounded-none select-none ${className}`}
    >
      {/* Airawat elephant symbol abstraction */}
      <svg
        width={size * 0.75}
        height={size * 0.75}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="square"
        strokeLinejoin="miter"
      >
        <path d="M4 18V8C4 5.79 5.79 4 8 4H16C18.21 4 20 5.79 20 8V18" />
        <path d="M8 18V12" />
        <path d="M16 18V12" />
        <path d="M12 4V10" />
        <path d="M20 12C21.1 12 22 12.9 22 14V17C22 17.55 21.55 18 21 18H20" />
      </svg>
    </div>
  )
}

export interface ProductLockupProps {
  product?: string
  subtext?: string
  className?: string
}

export const ProductLockup: React.FC<ProductLockupProps> = ({
  product = "AIRAWAT OS",
  subtext = "Nagar Dristi · Kanpur Nagar Nigam",
  className = "",
}) => {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <LogoSlot size={30} />
      <div className="h-6 w-px bg-rule" />
      <div className="min-w-0">
        <div className="font-logo font-bold text-sm tracking-wider text-text uppercase leading-none">
          {product}
        </div>
        {subtext && (
          <div className="font-mono text-[10.5px] text-text-muted uppercase tracking-tight truncate mt-0.5">
            {subtext}
          </div>
        )}
      </div>
    </div>
  )
}

export interface BreadcrumbItem {
  label: string
  onClick?: () => void
}

export const Breadcrumbs: React.FC<{
  items: BreadcrumbItem[]
  className?: string
}> = ({ items, className = "" }) => {
  return (
    <nav
      aria-label="Breadcrumbs"
      className={`flex items-center gap-1.5 font-mono text-xs text-text-muted select-none ${className}`}
    >
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1
        return (
          <React.Fragment key={idx}>
            {item.onClick && !isLast ? (
              <button
                type="button"
                onClick={item.onClick}
                className="hover:text-text cursor-pointer underline-offset-2 hover:underline"
              >
                {item.label}
              </button>
            ) : (
              <span
                className={isLast ? "text-text font-medium" : "text-text-muted"}
                aria-current={isLast ? "page" : undefined}
              >
                {item.label}
              </span>
            )}
            {!isLast && <span className="text-text-muted/60">/</span>}
          </React.Fragment>
        )
      })}
    </nav>
  )
}

export interface TabItem<T extends string = string> {
  key?: T
  value?: T
  label: string
  count?: number | string
  disabled?: boolean
}

export interface TabsProps<T extends string = string> {
  items?: TabItem<T>[]
  tabs?: TabItem<T>[]
  value: T
  onChange: (val: T) => void
  variant?: "line" | "boxed"
  className?: string
}

export function Tabs<T extends string = string>({
  items,
  tabs,
  value,
  onChange,
  variant = "line",
  className = "",
}: TabsProps<T>) {
  const list = tabs || items || []

  if (variant === "boxed") {
    return (
      <div className={`inline-flex border border-rule bg-surface p-0.5 rounded-none ${className}`}>
        {list.map((item) => {
          const itemVal = (item.value ?? item.key) as T
          const isSelected = itemVal === value
          return (
            <button
              key={itemVal}
              type="button"
              disabled={item.disabled}
              onClick={() => onChange(itemVal)}
              className={`px-3 py-1.5 text-xs font-body font-medium transition-colors cursor-pointer rounded-none ${
                isSelected
                  ? "bg-action text-on-action"
                  : "text-text hover:bg-hover"
              } ${item.disabled ? "opacity-30 cursor-not-allowed" : ""}`}
            >
              <span>{item.label}</span>
              {item.count !== undefined && (
                <span className="ml-1.5 font-mono text-[10.5px]">
                  ({item.count})
                </span>
              )}
            </button>
          )
        })}
      </div>
    )
  }

  // Line variant: 1px rule with 2px ink active indicator
  return (
    <div
      role="tablist"
      className={`flex items-center gap-6 border-b border-rule select-none ${className}`}
    >
      {list.map((item) => {
        const itemVal = (item.value ?? item.key) as T
        const isSelected = itemVal === value
        return (
          <button
            key={itemVal}
            role="tab"
            aria-selected={isSelected}
            disabled={item.disabled}
            onClick={() => onChange(itemVal)}
            className={`relative pb-2.5 text-xs font-body font-medium transition-colors cursor-pointer ${
              isSelected ? "text-text" : "text-text-muted hover:text-text"
            } ${item.disabled ? "opacity-30 cursor-not-allowed" : ""}`}
          >
            <span>{item.label}</span>
            {item.count !== undefined && (
              <span className="ml-1.5 font-mono text-[10px] text-text-muted">
                [{item.count}]
              </span>
            )}
            {isSelected && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-action" />
            )}
          </button>
        )
      })}
    </div>
  )
}

export interface AvatarProps {
  name: string
  src?: string
  size?: "xs" | "sm" | "md" | "lg"
  presence?: "online" | "away" | "offline"
  className?: string
}

/**
 * Avatar: Circle reserved only for people.
 * Photos are greyscale with 2px paper ring.
 * Initials in slate-deep on paper.
 */
export const Avatar: React.FC<AvatarProps> = ({
  name,
  src,
  size = "md",
  presence,
  className = "",
}) => {
  const sizeMap = {
    xs: "w-6 h-6 text-[10px]",
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-xs",
    lg: "w-14 h-14 text-sm",
  }

  // Get initials ignoring titles
  const cleanName = name.replace(/^(Dr\.|Prof\.|Shri|Smt\.|Mr\.|Mrs\.)\s+/i, "")
  const parts = cleanName.trim().split(/\s+/)
  const initials =
    parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : cleanName.slice(0, 2).toUpperCase()

  const presenceColors = {
    online: "bg-sage-dark",
    away: "bg-rose",
    offline: "bg-text-muted",
  }

  return (
    <div
      className={`relative inline-block shrink-0 rounded-round select-none ${className}`}
      title={name}
    >
      <div
        className={`flex items-center justify-center rounded-round overflow-hidden border-2 border-paper font-mono font-medium ${sizeMap[size]} ${
          src ? "bg-surface-sunken" : "bg-slate-wash text-slate-deep"
        }`}
      >
        {src ? (
          <img
            src={src}
            alt={name}
            className="w-full h-full object-cover grayscale"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {presence && (
        <span
          className={`absolute bottom-0 right-0 w-2 h-2 ${presenceColors[presence]} border border-paper`}
          title={`Status: ${presence}`}
        />
      )}
    </div>
  )
}
