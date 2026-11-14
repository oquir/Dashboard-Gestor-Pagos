import { useLayoutEffect } from 'react'
import { getCanvasScrollPort } from '../../lib'
import type { CanvasViewMode } from '../../types'

// Las vistas JSON y Payload comparten el <main> con el lienzo libre, y el lienzo deja el scroll en
// su "inicio": medio puerto de margen de paneo mas abajo (homeTop en lib/canvasViewport). Sin esto,
// entrar a JSON o a Payload arrancaba con ese scroll heredado, un poco por debajo del principio.
// La vuelta al lienzo no pasa por aca: useCanvasViewport ya la lleva a su inicio al montarlo.
//
// En un efecto de layout para que el primer pintado ya este arriba. Corre despues de los efectos
// de la lista virtual (los hijos van primero), pero no deja huecos: el margen de filas de mas de
// useJsonViewport ya cubre el principio desde el scroll heredado, y el evento de scroll que dispara
// este salto vuelve a calcular las filas.
export function useViewModeScroll(viewMode: CanvasViewMode): void {
  useLayoutEffect(() => {
    if (viewMode === 'canvas') return

    getCanvasScrollPort()?.scrollTo({ top: 0, left: 0 })
  }, [viewMode])
}
