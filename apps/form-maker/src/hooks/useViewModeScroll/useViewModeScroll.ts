import { useLayoutEffect } from 'react'
import { getCanvasScrollPort } from '../../lib'
import type { CanvasViewMode } from '../../types'

// JSON y Payload comparten <main> con el lienzo, que deja el scroll medio puerto abajo: al entrar
// se vuelve arriba. Layout effect para que el primer pintado ya este arriba; el margen de filas
// cubre el salto.
export function useViewModeScroll(viewMode: CanvasViewMode): void {
  useLayoutEffect(() => {
    if (viewMode === 'canvas') return

    getCanvasScrollPort()?.scrollTo({ top: 0, left: 0 })
  }, [viewMode])
}
