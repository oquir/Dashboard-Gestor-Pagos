import { collectFieldNames } from '../../../lib'
import type { FormStep, IntroModalStep } from '../../../types'

// Contra los dos lienzos: el export mezcla modal y formulario en un solo espacio de nombres.
export function takenFieldNames(
  formSteps: FormStep[],
  introSteps: IntroModalStep[],
  exceptFieldId: string,
): Set<string> {
  return collectFieldNames(
    [...formSteps.flatMap((step) => step.rows), ...introSteps.flatMap((step) => step.rows)],
    exceptFieldId,
  )
}
