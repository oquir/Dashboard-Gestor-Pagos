// Trae a la vista lo que se acaba de agregar al final del paso: la fila o la banda nueva puede caer
// lejos de lo que se esta mirando. Lo usan la barra flotante (+ Fila, + Grupo repetible) y la paleta
// (clic en un tipo de campo). El scroll va en un efecto despues del commit, cuando el nodo ya existe.
import { useEffect, useState } from 'react'
import { revealScrollBehavior } from '../../lib/performanceMode/performanceMode'
import { getBandElement, getRowElement } from '../../lib/canvasDom/canvasDom'
import { useFormStore } from '../../store/formStore'
import type { CanvasReveal } from '../../types'

export function useCanvasReveal(): (target: CanvasReveal) => void {
  const [pendingReveal, setPendingReveal] = useState<CanvasReveal | null>(null)

  useEffect(() => {
    if (!pendingReveal) return

    const element: HTMLElement | null =
      pendingReveal.kind === 'row'
        ? getRowElement(pendingReveal.id)
        : getBandElement(pendingReveal.id)

    element?.scrollIntoView({
      block: 'nearest',
      inline: 'nearest',
      behavior: revealScrollBehavior(useFormStore.getState().isLowPerformance),
    })
    // eslint-disable-next-line react-hooks/set-state-in-effect -- consume el reveal pendiente despues del commit
    setPendingReveal(null)
  }, [pendingReveal])

  return setPendingReveal
}
