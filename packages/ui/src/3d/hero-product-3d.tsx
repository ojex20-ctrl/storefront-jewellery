"use client"
import { Canvas, useFrame } from "@react-three/fiber"
import { Environment, Float, useGLTF, ContactShadows } from "@react-three/drei"
import { Suspense } from "react"
import type { ComponentType } from "react"
import * as THREE from "three"
import { assetUrl } from "../lib/asset"

type HeroProduct3DProps = {
  modelPath: string
  className?: string
}

const Primitive = "primitive" as unknown as ComponentType<{ object: THREE.Object3D }>
const SceneColor = "color" as unknown as ComponentType<{ attach: string; args: [number, number, number] }>
const AmbientLight = "ambientLight" as unknown as ComponentType<{ intensity: number }>
const DirectionalLight = "directionalLight" as unknown as ComponentType<{
  position: [number, number, number]
  intensity: number
}>

function HeroModel({ modelPath }: { modelPath: string }) {
  const { scene } = useGLTF(assetUrl(modelPath))
  useFrame((_state, delta) => {
    scene.rotation.y += delta * 0.25
  })
  return (
    <Float speed={1.4} rotationIntensity={0.3} floatIntensity={0.7}>
      <Primitive object={scene} />
    </Float>
  )
}

/**
 * Hero variant: tighter framing, slow self-rotation, subtle float, no controls.
 * For interactive viewing use ProductViewer3D instead.
 */
export function HeroProduct3D({ modelPath, className }: HeroProduct3DProps) {
  return (
    <div className={className}>
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0.4, 3.5], fov: 35 }} gl={{ antialias: true }}>
        <SceneColor attach="background" args={[0, 0, 0]} />
        <AmbientLight intensity={0.4} />
        <DirectionalLight position={[5, 5, 5]} intensity={1.2} />
        <Suspense fallback={null}>
          <HeroModel modelPath={modelPath} />
          <ContactShadows position={[0, -1.2, 0]} opacity={0.45} scale={6} blur={2.2} far={3} />
          <Environment preset="studio" />
        </Suspense>
      </Canvas>
    </div>
  )
}
