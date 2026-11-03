import React, { useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { Glyph } from "./Glyph"
import { Label, Display } from "./Typography"

export interface ModalProps {
  open: boolean
  onClose: () => void
  label?: string
  code?: string
  title: string
  accent?: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: "sm" | "md" | "lg"
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  label = "Inspection Record",
  code,
  title,
  accent,
  children,
  footer,
  size = "md",
}) => {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (open) {
      document.addEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = ""
    }
  }, [open, onClose])

  if (!open || typeof document === "undefined") return null

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
  }[size]

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      {/* Scrim backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-ink/75 transition-opacity"
      />

      {/* Modal Dialog (Level 3 Overlay) */}
      <div
        ref={modalRef}
        className={`relative z-10 w-full ${sizeClasses} border border-rule bg-surface rounded-none shadow-none text-text`}
      >
        {/* Header Strip with Label and Record Code */}
        <div className="flex items-center justify-between border-b border-border bg-surface-raised px-4 py-2.5 select-none">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-slate inline-block" />
            <Label>{label}</Label>
            {code && (
              <span className="font-mono text-xs text-text-muted">
                [{code}]
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-text-muted hover:text-text cursor-pointer transition-colors"
            title="Close dialog"
            aria-label="Close dialog"
          >
            <Glyph name="close" size={14} />
          </button>
        </div>

        {/* Modal Title */}
        <div className="px-5 pt-4 pb-2">
          <Display size="m" accent={accent}>
            {title}
          </Display>
        </div>

        {/* Modal Body */}
        <div className="px-5 py-3 text-xs font-body text-text max-h-[70vh] overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="border-t border-border bg-surface-raised px-5 py-3 flex items-center justify-end gap-2.5">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
