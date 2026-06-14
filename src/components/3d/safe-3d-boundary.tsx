"use client"
import { Component, type ReactNode } from "react"

/**
 * Catches runtime errors thrown by the 3D scene — typically a 404 on the
 * GLB file or a malformed model. Falling back to `null` lets the parent
 * Placeholder fill the space instead of breaking the whole page.
 *
 * Three Fiber throws *during render* when a model fails to load (the
 * GLTFLoader's onError surfaces synchronously through Suspense), so a
 * normal try/catch around dynamic import isn't enough — we need a real
 * React Error Boundary.
 */
type Props = { children: ReactNode; fallback?: ReactNode; onError?: (e: Error) => void }
type State = { error: Error | null }

export class Safe3DBoundary extends Component<Props, State> {
  override state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  override componentDidCatch(error: Error) {
    this.props.onError?.(error)
    if (process.env.NODE_ENV !== "production") {
      console.warn("[Safe3DBoundary] 3D scene failed, falling back:", error.message)
    }
  }

  override render() {
    if (this.state.error) return this.props.fallback ?? null
    return this.props.children
  }
}
