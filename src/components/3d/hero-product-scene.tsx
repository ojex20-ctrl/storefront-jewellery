"use client"
import dynamic from "next/dynamic"
import { LoaderBar } from "@podium/ui/motion"
import { Safe3DBoundary } from "./safe-3d-boundary"

/**
 * Hero 3D scene shell. The actual HeroProduct3D is `next/dynamic`-loaded with
 * `ssr: false` so three / drei never run on the server. While the model
 * downloads we show a thin loader bar (matches the editorial mood — no spinner).
 *
 * If the product doesn't have a GLB model yet — or the file 404s — we render
 * a quiet fallback so the layout doesn't shift and the page doesn't crash.
 */
const HeroProduct3D = dynamic(
  () => import("@podium/ui/3d").then((m) => m.HeroProduct3D),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center">
        <div className="w-40">
          <LoaderBar />
        </div>
      </div>
    ),
  },
)

export function HeroProductScene({ modelPath }: { modelPath?: string }) {
  if (!modelPath) {
    return null
  }
  return (
    <Safe3DBoundary fallback={null}>
      <HeroProduct3D modelPath={modelPath} className="h-full w-full" />
    </Safe3DBoundary>
  )
}
