"use client"
import { Shield, Droplets, Heart, Clock } from "lucide-react"

const BADGES = [
  { icon: Shield, label: "Anti-Tarnish", desc: "2-Year Guarantee" },
  { icon: Droplets, label: "Waterproof", desc: "Shower & Swim Safe" },
  { icon: Heart, label: "Hypoallergenic", desc: "Surgical Steel Base" },
  { icon: Clock, label: "Free Returns", desc: "14-Day Policy" },
]

export function TrustBadges({ compact }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex flex-wrap gap-3">
        {BADGES.map((b) => (
          <span key={b.label} className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-muted">
            <b.icon size={12} className="text-accent" strokeWidth={1.5} />
            {b.label}
          </span>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {BADGES.map((b) => (
        <div key={b.label} className="flex items-center gap-3 border border-line p-4">
          <b.icon size={20} className="text-accent shrink-0" strokeWidth={1.5} />
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest">{b.label}</p>
            <p className="text-[10px] text-muted">{b.desc}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
