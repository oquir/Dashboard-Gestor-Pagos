import type { FormStep, IntroModalStep } from '../../types/formStructure'
import type { CanvasTarget } from '../../types/placement'

// Ctrl + flechas, de a un paso y sin dar la vuelta: a proposito no hay salto directo.

// En el orden del contribuyente: primero el modal y despues el formulario (el panel los muestra al
// reves).
export function orderedSteps(formSteps: FormStep[], introSteps: IntroModalStep[]): CanvasTarget[] {
  return [
    ...introSteps.map((step): CanvasTarget => ({ type: 'introStep', stepId: step.stepId })),
    ...formSteps.map((step): CanvasTarget => ({ type: 'formStep', stepId: step.stepId })),
  ]
}

// null en los extremos o si el activo ya no esta.
export function adjacentStep(
  steps: CanvasTarget[],
  current: CanvasTarget,
  offset: 1 | -1,
): CanvasTarget | null {
  const index: number = steps.findIndex(
    (step) => step.type === current.type && step.stepId === current.stepId,
  )

  if (index === -1) return null

  return steps[index + offset] ?? null
}
