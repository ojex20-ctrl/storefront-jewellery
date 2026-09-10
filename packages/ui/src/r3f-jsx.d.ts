type ThreeFiberElementProps = Record<string, unknown>

declare global {
  namespace JSX {
    interface IntrinsicElements {
      primitive: ThreeFiberElementProps
      color: ThreeFiberElementProps
      ambientLight: ThreeFiberElementProps
      directionalLight: ThreeFiberElementProps
    }
  }
}

export {}
