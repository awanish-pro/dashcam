import React, { createContext, useContext, useState, useCallback } from "react"
import { createPortal } from "react-dom"
import { Square, Glyph } from "./Glyph"
import { StatusTone } from "./Badge"

export interface ToastItem {
  id: string
  title: string
  body?: string
  tone?: StatusTone
  module?: string
}

interface ToastContextValue {
  push: (item: Omit<ToastItem, "id">) => void
  remove: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within ToastProvider")
  return ctx
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const push = useCallback(
    ({ title, body, tone = "info", module = "PGR" }: Omit<ToastItem, "id">) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
      setToasts((prev) => [...prev.slice(-3), { id, title, body, tone, module }])
      setTimeout(() => {
        remove(id)
      }, 5000)
    },
    [remove]
  )

  const toneDotColors: Record<StatusTone, string> = {
    neutral: "#C9D6E3",
    info: "#9BB3CC",
    success: "#B8C3B9",
    caution: "#C99AA2",
    critical: "#C48A96",
  }

  return (
    <ToastContext.Provider value={{ push, remove }}>
      {children}
      {typeof document !== "undefined" &&
        createPortal(
          <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none select-none">
            {toasts.map((t) => (
              <div
                key={t.id}
                className="theme-ink bg-grad-ink border border-rule text-paper p-3 shadow-none rounded-none pointer-events-auto flex items-start justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-150"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="mt-1">
                    <Square color={toneDotColors[t.tone || "info"]} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] text-text-muted uppercase">
                        [{t.module}]
                      </span>
                      <span className="text-xs font-medium text-paper leading-tight">
                        {t.title}
                      </span>
                    </div>
                    {t.body && (
                      <p className="mt-1 text-[11px] text-text-muted leading-relaxed">
                        {t.body}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => remove(t.id)}
                  className="text-text-muted hover:text-paper p-1 cursor-pointer shrink-0"
                  title="Dismiss toast"
                >
                  <Glyph name="close" size={12} />
                </button>
              </div>
            ))}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  )
}
