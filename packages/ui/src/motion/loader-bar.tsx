import { cn } from "../lib/cn"

/**
 * Indeterminate 2px loader bar. The accent block sweeps left→right on a 1.4s
 * loop. Used for checkout / 3D model load.
 */
export function LoaderBar({ className }: { className?: string }) {
  return (
    <div className={cn("relative h-[2px] overflow-hidden bg-bg-2", className)} aria-hidden="true">
      <span className="absolute inset-0 animate-loader-bar bg-accent" />
    </div>
  )
}
