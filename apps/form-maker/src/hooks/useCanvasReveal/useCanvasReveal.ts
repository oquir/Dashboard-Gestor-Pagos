// Trae a la vista lo recien agregado al final del paso (barra flotante y paleta). El scroll va en
// un efecto, cuando el nodo ya existe.
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
