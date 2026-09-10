"use client"
import { Canvas, useFrame } from "@react-three/fiber"
import {
  OrbitControls,
  Stage,
  Environment,
  useGLTF,
  Html,
  useProgress,
} from "@react-three/drei"
import { Suspense } from "react"
import type { ComponentType } from "react"
import * as THREE from "three"
import { LoaderBar } from "../motion/loader-bar"
import { cn } from "../lib/cn"
import { assetUrl } from "../lib/asset"

const Primitive = "primitive" as unknown as ComponentType<{ object: THREE.Object3D }>
const SceneColor = "color" as unknown as ComponentType<{ attach: string; args: [string] }>

export type ProductViewer3DProps = {
  /** Path to a GLB/GLTF file (served from /public). */
  modelPath: string
  /** Tint applied to all meshes; updates without re-downloading the model. */
  colorHex?: string
  /** Auto-rotate when the user is not interacting. */
  autoRotate?: boolean
  /** Studio HDR environment preset. */
  environmentPreset?:
    | "studio"
    | "warehouse"
    | "city"
    | "sunset"
    | "dawn"
    | "night"
    | "forest"
    | "apartment"
    | "park"
    | "lobby"
  /** Lock the model on its Y axis so users only orbit horizontally. */
  lockVertical?: boolean
  className?: string
  height?: string | number
}

function ColoredModel({ modelPath, colorHex }: { modelPath: string; colorHex?: string }) {
  // useGLTF caches by path — useGLTF.preload() lets us warm this on hover.
  // Resolve through the asset CDN so prod loads from the bucket, dev from public/.
  const { scene } = useGLTF(assetUrl(modelPath))
  // Apply tint to all mesh materials. We clone the material so the cached
  // GLB scene isn't mutated for other consumers using the same model path.
  if (colorHex) {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const mat = child.material as THREE.MeshStandardMaterial
        if (mat && "color" in mat) {
          if (!child.userData.originalMaterial) {
            child.userData.originalMaterial = mat.clone()
          }
          const cloned = (child.userData.originalMaterial as THREE.MeshStandardMaterial).clone()
          cloned.color = new THREE.Color(colorHex)
          child.material = cloned
        }
      }
    })
  }

  useFrame((_state, delta) => {
    scene.rotation.y += delta * 0.05
  })

  return <Primitive object={scene} />
}

function Loader() {
  const { progress } = useProgress()
  return (
    <Html center>
      <div className="flex w-48 flex-col items-center gap-3">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
          Loading model {Math.floor(progress)}%
        </span>
        <LoaderBar className="w-full" />
      </div>
    </Html>
  )
}

/**
 * 360° product viewer.
 *
 * - Drag to orbit · pinch / wheel to zoom · auto-rotates when idle.
 * - Polar angle is constrained so the model never flips upside down.
 * - Materials are tinted in-place via `colorHex` so swapping product colour
 *   doesn't re-download the GLB.
 *
 * IMPORTANT: this file imports three / drei and must only be loaded on the
 * client. Wrap it in `next/dynamic` with `ssr: false` (see /public/3d/Viewer.tsx).
 */
export function ProductViewer3D({
  modelPath,
  colorHex,
  autoRotate = true,
  environmentPreset = "studio",
  lockVertical = false,
  className,
  height = "100%",
}: ProductViewer3DProps) {
  return (
    <div className={cn("relative h-full w-full", className)} style={{ height }}>
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 0, 4], fov: 35 }}
        gl={{ antialias: true, preserveDrawingBuffer: false }}
      >
        <SceneColor attach="background" args={["#f5f3ee"]} />
        <Suspense fallback={<Loader />}>
          <Stage adjustCamera={1.1} intensity={0.7} environment={environmentPreset} shadows="contact">
            <ColoredModel modelPath={modelPath} colorHex={colorHex} />
          </Stage>
          <Environment preset={environmentPreset} />
        </Suspense>
        <OrbitControls
          enableZoom
          enablePan={false}
          autoRotate={autoRotate}
          autoRotateSpeed={1.2}
          minPolarAngle={lockVertical ? Math.PI / 2 : Math.PI / 4}
          maxPolarAngle={lockVertical ? Math.PI / 2 : (3 * Math.PI) / 4}
          minDistance={2}
          maxDistance={8}
        />
      </Canvas>
    </div>
  )
}

/**
 * Warm the GLB cache on listing hover so the product page opens to an
 * already-loaded model. Call from `onPointerEnter` on product cards.
 *
 * HEAD-checks the URL first so a missing GLB doesn't pollute three-fiber's
 * global event bus with an unhandled rejection (it logs as an Unhandled
 * Runtime Error in Next dev). The check is fire-and-forget so hover stays
 * snappy — if the file exists, preload races the user's click; if it
 * 404s, we skip and the detail page silently falls back to the still photo.
 */
export function preloadModel(modelPath: string | undefined | null) {
  if (!modelPath || typeof window === "undefined") return
  const resolved = assetUrl(modelPath)
  void fetch(resolved, { method: "HEAD" })
    .then((r) => {
      if (r.ok) useGLTF.preload(resolved)
    })
    .catch(() => {
      /* silent */
    })
}
