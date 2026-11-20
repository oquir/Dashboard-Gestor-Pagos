import { useMemo } from 'react'
import { getAllFields, useFormStore } from '../../store/formStore'
import type { CanvasRow } from '../../types/formStructure'

// Los nombres de los dos lienzos, igual que buildFormExport: si no, periodo_anio (del modal)
// saldria en rojo en los renglones 31 y 37.
export function useKnownFieldNames(): Set<string> {
  const formSteps = useFormStore((state) => state.formSteps)
  const introSteps = useFormStore((state) => state.introModal.steps)

  return useMemo(() => {
    const rows: CanvasRow[] = [
      ...formSteps.flatMap((step) => step.rows),
      ...introSteps.flatMap((step) => step.rows),
    ]

    return new Set(getAllFields(rows).map((field) => field.name))
  }, [formSteps, introSteps])
}
