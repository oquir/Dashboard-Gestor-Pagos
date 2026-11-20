import type { CanvasTarget, FormStep, IntroModalStep } from '../../../types'
import type { ActiveStepDescription } from './ActiveStepLabel.types'

// El numero es la posicion dentro de su grupo, igual que el chip y "Paso activo".
export function describeActiveStep(
  formSteps: FormStep[],
  introSteps: IntroModalStep[],
  activeCanvas: CanvasTarget,
): ActiveStepDescription | null {
  const isIntro: boolean = activeCanvas.type === 'introStep'
  const steps: (FormStep | IntroModalStep)[] = isIntro ? introSteps : formSteps
  const index: number = steps.findIndex((step) => step.stepId === activeCanvas.stepId)
  if (index < 0) return null

  const step: FormStep | IntroModalStep = steps[index]
  return {
    isIntro,
    number: index + 1,
    total: steps.length,
    title: step.title.trim(),
    hidden: !isIntro && Boolean((step as FormStep).hidden),
  }
}
