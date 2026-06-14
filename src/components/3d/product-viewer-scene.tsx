"use client"
import dynamic from "next/dynamic"
import { LoaderBar } from "@podium/ui/motion"
import { Eyebrow } from "@podium/ui/primitives"
import { Safe3DBoundary } from "./safe-3d-boundary"

const ProductViewer3D = dynamic(
  () => import("@podium/ui/3d").then((m) => m.ProductViewer3D),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-bg">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
          Loading 360° viewer
        </span>
        <div className="w-48">
          <LoaderBar />
        </div>
      </div>
    ),
  },
)

type Props = {
  modelPath?: string
  colorHex?: string
  className?: string
}

/**
 * Detail-page 360° viewer wrapper. When a product has no GLB model yet,
 * silently renders nothing so the gallery layout fills the space. When a
 * model is referenced but the file 404s, the Safe3DBoundary falls back
 * to a small "model unavailable" caption instead of crashing the page.
 */
export function ProductViewerScene({ modelPath, colorHex, className }: Props) {
  if (!modelPath) return null
  return (
    <Safe3DBoundary
      fallback={
        <div className={`flex h-full w-full items-center justify-center bg-bg-2 ${className ?? ""}`}>
          <Eyebrow className="text-muted">3D model unavailable</Eyebrow>
        </div>
      }
    >
      <ProductViewer3D
        modelPath={modelPath}
        colorHex={colorHex}
        autoRotate
        environmentPreset="studio"
        className={className}
      />
    </Safe3DBoundary>
  )
}
