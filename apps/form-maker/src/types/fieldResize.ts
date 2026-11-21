import type { PointerEvent as ReactPointerEvent } from 'react'

// FieldResizeHandle ya resolvio arrastre y texto; las variantes solo se dibujan.
export interface FieldResizeHandleVariantProps {
  isResizing: boolean
  title: string
  // Visible sin hover con el campo seleccionado.
  pinned: boolean
  onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void
}
