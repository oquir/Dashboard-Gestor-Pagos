// Trae a la vista lo recien agregado al final del paso (barra flotante y paleta).
// El scroll va un cuadro despues del commit: si el clic venia de JSON o Payload, el lienzo recien
// montado mide el puerto y vuelve al inicio en commits sincronos posteriores, y un scroll en el
// efecto quedaria pisado por esa vuelta al inicio.
import { useEffect, useState } from 'react'
import { revealScrollBehavior } from '../../lib/performanceMode/performanceMode'
import { getBandElement, getRowElement } from '../../lib/canvasDom/canvasDom'
import { useFormStore } from '../../store/formStore'
import type { CanvasReveal } from '../../types'

export function useCanvasReveal(): (target: CanvasReveal) => void {
  const [pendingReveal, setPendingReveal] = useState<CanvasReveal | null>(null)

  useEffect(() => {
    if (!pendingReveal) return

    const frame: number = requestAnimationFrame(() => {
      const element: HTMLElement | null =
        pendingReveal.kind === 'row'
          ? getRowElement(pendingReveal.id)
          : getBandElement(pendingReveal.id)

      element?.scrollIntoView({
        block: 'nearest',
        inline: 'nearest',
        behavior: revealScrollBehavior(useFormStore.getState().isLowPerformance),
      })
      setPendingReveal(null)
    })

    return () => cancelAnimationFrame(frame)
  }, [pendingReveal])

  return setPendingReveal
}
