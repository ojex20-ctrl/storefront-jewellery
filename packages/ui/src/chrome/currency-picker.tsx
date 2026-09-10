"use client"
import * as React from "react"
import { ChevronDown, Check } from "lucide-react"
import {
  CURRENCY_COOKIE,
  SUPPORTED_CURRENCIES,
  getCurrency,
  type Currency,
} from "../lib/currency"

type IconProps = { className?: string; strokeWidth?: number }
const ChevronDownIcon = ChevronDown as React.ElementType<IconProps>
const CheckIcon = Check as React.ElementType<IconProps>

/**
 * Compact currency dropdown for the header chrome.
 *
 * Sits next to the search trigger; on select it writes the
 * `currency` cookie and reloads so server-rendered prices come back in
 * the new currency. Pure CSS dropdown — no portal, no backdrop, just
 * a small popover anchored to the trigger.
 *
 * Brand-themed via tokens (`bg`, `accent`, `line`, `ink`, `muted`).
 *
 * `current` is the currently-active currency code (server-resolved so
 * the trigger label is always correct on first paint, even before
 * hydration).
 */

export type CurrencyPickerProps = {
  current: string
  className?: string
  /** Optional override for the supported currencies (defaults to all six). */
  options?: Currency[]
  /** Render as a chip (rounded full + bg) — used by SYRA's chip nav. */
  variant?: "inline" | "chip"
}

function setCookie(name: string, value: string) {
  if (typeof document === "undefined") return
  const oneYear = 60 * 60 * 24 * 365
  document.cookie = `${name}=${value};path=/;max-age=${oneYear};samesite=lax`
}

export function CurrencyPicker({
  current,
  className,
  options,
  variant = "inline",
}: CurrencyPickerProps) {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)
  const list = options ?? SUPPORTED_CURRENCIES
  const active = getCurrency(current)

  // Close on outside click + Esc
  React.useEffect(() => {
    if (!open) return
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onDocClick)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDocClick)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  const select = (code: string) => {
    setCookie(CURRENCY_COOKIE, code)
    setOpen(false)
    // Full reload so server-rendered prices re-fetch in the new currency.
    if (typeof window !== "undefined") window.location.reload()
  }

  const triggerClass =
    variant === "chip"
      ? `chip ${open ? "is-active" : ""}`
      : "inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-ink hover:text-accent"

  return (
    <div ref={ref} className={`relative ${className ?? ""}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Change currency"
        aria-expanded={open}
        className={triggerClass}
      >
        <span className="text-base leading-none">{active.flag}</span>
        <span>{active.label}</span>
        <ChevronDownIcon
          className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
          strokeWidth={2}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-[120] mt-2 w-44 overflow-hidden rounded-md border border-line bg-bg shadow-2xl"
        >
          <ul>
            {list.map((c) => {
              const isActive = c.code === active.code
              return (
                <li key={c.code}>
                  <button
                    type="button"
                    onClick={() => select(c.code)}
                    className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-[12px] transition-colors ${
                      isActive
                        ? "bg-bg-2 text-accent"
                        : "text-ink hover:bg-bg-2 hover:text-accent"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-base leading-none">{c.flag}</span>
                      <span className="font-mono uppercase tracking-widest">
                        {c.label}
                      </span>
                      <span className="text-muted">{c.symbol.trim()}</span>
                    </span>
                    {isActive && <CheckIcon className="h-3.5 w-3.5" strokeWidth={2.2} />}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
