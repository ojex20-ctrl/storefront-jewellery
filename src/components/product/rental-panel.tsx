"use client"
import { useEffect, useMemo, useState } from "react"
import { CalendarDays, Info } from "lucide-react"
import { Eyebrow } from "@podium/ui/primitives"
import { priceFmt } from "@podium/ui/lib"
import type { RentalConfig, RentalSelection } from "@/lib/products"

type Props = {
  config: RentalConfig
  onChange: (sel: RentalSelection | null) => void
}

/**
 * Duration tabs (3/7/14/30) + start-date picker + live total.
 *
 * Calls onChange with a fully-built RentalSelection (start_date, end_date,
 * days) every time the user touches a control, or `null` when the
 * selection is incomplete. The parent uses it to enable the "Reserve
 * rental" CTA.
 *
 * Defaults: shortest available duration; start = next Friday (ZIORA's
 * peak rental day), to make the picker feel pre-filled but not pushy.
 */
export function RentalPanel({ config, onChange }: Props) {
  const [days, setDays] = useState<number>(config.durations[0] ?? 3)
  const [startDate, setStartDate] = useState<string>(() => {
    const d = nextFriday()
    return iso(d)
  })

  const endDate = useMemo(() => {
    const start = new Date(startDate)
    const end = new Date(start)
    end.setDate(start.getDate() + days)
    return iso(end)
  }, [startDate, days])

  useEffect(() => {
    onChange({ start_date: startDate, end_date: endDate, days })
  }, [startDate, endDate, days, onChange])

  const subtotal = config.daily_rate * days
  const total = subtotal + config.security_deposit
  const today = iso(new Date())

  return (
    <div className="border border-line bg-paper p-5 md:p-6">
      <div className="mb-4 flex items-center gap-2">
        <CalendarDays className="h-4 w-4 text-accent" strokeWidth={1.6} />
        <Eyebrow className="text-accent">Rental</Eyebrow>
      </div>

      {/* Duration tabs */}
      <div>
        <Eyebrow className="mb-2 block text-muted">Duration</Eyebrow>
        <div className="flex flex-wrap gap-2">
          {config.durations.map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`flex h-12 items-center gap-2 border px-4 font-mono text-[11px] uppercase tracking-widest transition-colors ${
                days === d
                  ? "border-accent bg-accent text-paper"
                  : "border-line hover:border-accent hover:text-accent"
              }`}
            >
              <span className="font-display text-base">{d}</span>
              <span>day{d === 1 ? "" : "s"}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Start date */}
      <div className="mt-5">
        <Eyebrow className="mb-2 block text-muted">Pickup date</Eyebrow>
        <input
          type="date"
          min={today}
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full border border-line bg-bg px-3 py-2.5 font-mono text-sm uppercase tracking-widest text-ink outline-none focus:border-accent"
        />
        <p className="mt-2 font-mono text-[11px] uppercase tracking-widest text-muted">
          Return by · {prettyDate(endDate)}
        </p>
      </div>

      {/* Cost summary */}
      <div className="mt-6 border-t border-line pt-4 font-mono text-sm">
        <Row k={`${priceFmt(config.daily_rate)} × ${days} day${days === 1 ? "" : "s"}`} v={priceFmt(subtotal)} />
        <Row k="Refundable deposit" v={priceFmt(config.security_deposit)} muted />
        <div className="mt-2 border-t border-line pt-2">
          <Row k="Charged at checkout" v={priceFmt(total)} bold />
        </div>
      </div>

      {/* Notes */}
      <p className="mt-4 flex gap-2 text-xs leading-relaxed text-muted">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.6} />
        <span>{config.notes ?? "Deposit refunded within 5 working days of return inspection."}</span>
      </p>
    </div>
  )
}

function Row({
  k,
  v,
  bold,
  muted,
}: {
  k: string
  v: string
  bold?: boolean
  muted?: boolean
}) {
  return (
    <div
      className={`flex items-center justify-between py-1 ${
        bold ? "font-semibold text-ink" : muted ? "text-muted" : "text-ink-2"
      }`}
    >
      <span className={muted ? "" : "text-muted"}>{k}</span>
      <span>{v}</span>
    </div>
  )
}

function nextFriday(): Date {
  const d = new Date()
  const delta = (5 - d.getDay() + 7) % 7 || 7
  d.setDate(d.getDate() + delta)
  d.setHours(0, 0, 0, 0)
  return d
}
function iso(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}
function prettyDate(s: string): string {
  return new Date(s).toLocaleDateString(undefined, { weekday: "short", day: "2-digit", month: "short" })
}
