import { useFormStore } from '../../../store'
import {
  FORM_BADGE_CLASSES,
  HIDDEN_CLASSES,
  INTRO_BADGE_CLASSES,
  LABEL_CLASSES,
  NUMBER_CLASSES,
  TITLE_CLASSES,
} from './ActiveStepLabel.constants'
import type { ActiveStepDescription } from './ActiveStepLabel.types'
import { describeActiveStep } from './ActiveStepLabel.utils'

export function ActiveStepLabel() {
  const formSteps = useFormStore((state) => state.formSteps)
  const introSteps = useFormStore((state) => state.introModal.steps)
  const activeCanvas = useFormStore((state) => state.activeCanvas)
  const viewMode = useFormStore((state) => state.canvasViewMode)

  if (viewMode !== 'canvas') return null

  const step: ActiveStepDescription | null = describeActiveStep(formSteps, introSteps, activeCanvas)
  if (!step) return null

  return (
    <div role="status" aria-label="Paso activo" className={LABEL_CLASSES}>
      <span className={step.isIntro ? INTRO_BADGE_CLASSES : FORM_BADGE_CLASSES}>
        {step.isIntro ? 'Modal de entrada' : 'Formulario'}
      </span>
      <span className={NUMBER_CLASSES}>
        Paso {step.number} de {step.total}
      </span>
      <span className={TITLE_CLASSES}>{step.title || 'Sin título'}</span>
      {step.hidden && <span className={HIDDEN_CLASSES}>· Oculto</span>}
    </div>
  )
}
