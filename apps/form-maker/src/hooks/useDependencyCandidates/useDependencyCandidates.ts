import { useMemo } from 'react'
import { dependencyCandidates } from '../../lib/fieldCandidates/fieldCandidates'
import { useFormStore } from '../../store/formStore'
import type { CanvasField } from '../../types/field'

// Los campos de los que fieldId puede depender. Logica, Validaciones y Mapeo API la leen de aca,
// para que la regla de que el modal no mira al formulario sea la misma en todos.
export function useDependencyCandidates(fieldId: string): CanvasField[] {
  const formSteps = useFormStore((state) => state.formSteps)
  const introSteps = useFormStore((state) => state.introModal.steps)

  return useMemo(
    () => dependencyCandidates(fieldId, formSteps, introSteps),
    [fieldId, formSteps, introSteps],
  )
}
