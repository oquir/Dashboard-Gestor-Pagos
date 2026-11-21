import type { CSSProperties, RefCallback } from 'react'

export interface CanvasViewportReturn {
  // Callback: el documento se desmonta en JSON/Payload y los observadores se reenganchan al volver.
  contentRef: RefCallback<HTMLDivElement>
  rootStyle: CSSProperties | undefined
  contentStyle: CSSProperties
}
