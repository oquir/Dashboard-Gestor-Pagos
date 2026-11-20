import type { CanvasField } from '../../types/field'
import type { FormStep, IntroModalStep } from '../../types/formStructure'
import { isPresentationalField } from '../fieldKind/fieldKind'

// Que campos puede observar otro (condicion, regla, validacion condicional o padre de catalogo); lo
// comparten todos los paneles. Sigue el orden de llenado: el formulario ve los dos lienzos, el
// modal solo el modal.

export function dependencyCandidates(
  fieldId: string,
  formSteps: FormStep[],
  introSteps: IntroModalStep[],
): CanvasField[] {
  const introFields: CanvasField[] = introSteps.flatMap((step) =>
    step.rows.flatMap((row) => row.fields),
  )
  const livesInIntro: boolean = introFields.some((field) => field.id === fieldId)
  // Primero el modal: es el orden en que los responde el contribuyente.
  const reachable: CanvasField[] = livesInIntro
    ? introFields
    : [...introFields, ...formSteps.flatMap((step) => step.rows.flatMap((row) => row.fields))]

  // Un campo presentacional no tiene valor que observar, y ninguno se observa a si mismo.
  return reachable.filter(
    (candidate) => candidate.id !== fieldId && !isPresentationalField(candidate.type),
  )
}
