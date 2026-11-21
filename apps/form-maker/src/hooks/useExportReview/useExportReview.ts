import { useEffect, useState } from 'react'
import { getBandElement, getFieldElement, getRowElement } from '../../lib'
import { diagnoseForm } from '../../lib'
import { revealScrollBehavior } from '../../lib'
import { useFormStore } from '../../store'
import type { FormProblem } from '../../types'
import type { PendingReveal, UseExportReviewResult } from './useExportReview.types'

// Revision antes de exportar o subir: corre al dar el boton, no mientras se edita. Sin problemas
// llama a onPass directo; los errores bloquean y los avisos no. La deteccion vive en
// lib/formDiagnostics.
export function useExportReview(onPass: () => void): UseExportReviewResult {
  const setCanvasViewMode = useFormStore((state) => state.setCanvasViewMode)
  const setActiveCanvas = useFormStore((state) => state.setActiveCanvas)
  const selectFieldAndEdit = useFormStore((state) => state.selectFieldAndEdit)
  const selectField = useFormStore((state) => state.selectField)
  const setSidebarTab = useFormStore((state) => state.setSidebarTab)
  const setSidebarOpen = useFormStore((state) => state.setSidebarOpen)
  const [problems, setProblems] = useState<FormProblem[] | null>(null)
  // El nodo del campo existe recien despues del commit que cambia de paso: se revela en un efecto.
  const [pendingReveal, setPendingReveal] = useState<PendingReveal | null>(null)

  useEffect(() => {
    if (!pendingReveal) return

    let element: HTMLElement | null = getBandElement(pendingReveal.id)
    if (pendingReveal.kind === 'field') element = getFieldElement(pendingReveal.id)
    if (pendingReveal.kind === 'row') element = getRowElement(pendingReveal.id)

    element?.scrollIntoView({
      block: 'center',
      inline: 'nearest',
      behavior: revealScrollBehavior(useFormStore.getState().isLowPerformance),
    })
    // eslint-disable-next-line react-hooks/set-state-in-effect -- consume el reveal pendiente despues del commit
    setPendingReveal(null)
  }, [pendingReveal])

  const hasErrors: boolean = problems?.some((problem) => problem.severity === 'error') ?? false

  function request(): void {
    // getState: corre una vez por clic, y suscribirse redibujaria el panel con cada cambio.
    const { formSteps, introModal, formScript } = useFormStore.getState()
    const found: FormProblem[] = diagnoseForm({
      formSteps,
      introSteps: introModal.steps,
      formScript,
    })

    if (found.length === 0) {
      onPass()
      return
    }

    setProblems(found)
  }

  function proceedAnyway(): void {
    if (hasErrors) return

    onPass()
    setProblems(null)
  }

  function goTo(problem: FormProblem): void {
    setProblems(null)
    const { target } = problem

    if (target.kind === 'prelude') {
      selectField(null)
      setSidebarTab('logic')
      setSidebarOpen(true)
      return
    }

    setCanvasViewMode('canvas')
    // setActiveCanvas vacia la seleccion, asi que va antes de seleccionar el campo.
    setActiveCanvas(target.canvas)

    if (target.kind === 'field') {
      selectFieldAndEdit(target.fieldId, target.tab)
      setPendingReveal({ kind: 'field', id: target.fieldId })
      return
    }

    setPendingReveal(
      target.kind === 'row'
        ? { kind: 'row', id: target.rowId }
        : { kind: 'band', id: target.groupId },
    )
  }

  return {
    problems,
    hasErrors,
    request,
    proceedAnyway,
    goTo,
    close: () => setProblems(null),
  }
}
