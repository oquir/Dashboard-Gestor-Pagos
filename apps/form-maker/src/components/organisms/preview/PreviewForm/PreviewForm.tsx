import { usePreviewNavigation } from '../../../../hooks/usePreviewNavigation'
import { PreviewStep } from '../PreviewStep'
import { NAV_BUTTON_CLASSES, PRIMARY_BUTTON_CLASSES } from './PreviewForm.constants'
import type { PreviewFormProps } from './PreviewForm.types'
import {
  ENTER_FADE_CLASSES,
  ENTER_MODAL_CLASSES,
  ENTER_POP_CLASSES,
  ENTER_RISE_CLASSES,
  ENTER_STEP_BACK_CLASSES,
  ENTER_STEP_FORWARD_CLASSES,
} from '../../../../constants'

export function PreviewForm({ preview }: PreviewFormProps) {
  const navigation = usePreviewNavigation(preview)

  return (
    <div className="relative min-w-0 rounded-lg border border-border bg-surface p-6">
      {navigation.step ? (
        <div
          key={navigation.step.stepId}
          className={
            navigation.direction === 'back' ? ENTER_STEP_BACK_CLASSES : ENTER_STEP_FORWARD_CLASSES
          }
        >
          <PreviewStep step={navigation.step} preview={preview} />
        </div>
      ) : (
        <p>Sin pasos.</p>
      )}

      <footer className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={navigation.isFirstStep}
            onClick={navigation.goBack}
            className={NAV_BUTTON_CLASSES}
          >
            Anterior
          </button>
          <span className="text-[11px] text-fg-subtle">
            Paso {navigation.stepNumber} de {navigation.stepCount}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {navigation.submitted && (
            <span className={`text-[11px] font-medium text-success ${ENTER_POP_CLASSES}`}>
              Formulario válido · el payload está listo
            </span>
          )}
          <button type="button" onClick={navigation.restart} className={NAV_BUTTON_CLASSES}>
            Reiniciar
          </button>
          <button type="button" onClick={navigation.advance} className={PRIMARY_BUTTON_CLASSES}>
            {navigation.isLastStep ? 'Enviar' : 'Siguiente'}
          </button>
        </div>
      </footer>

      {navigation.showIntro && (
        <div
          className={`absolute inset-0 z-20 flex items-center justify-center rounded-lg bg-slate-900/30 p-4 dark:bg-black/50 ${ENTER_FADE_CLASSES}`}
        >
          <div
            className={`flex max-h-full w-full max-w-2xl flex-col overflow-auto rounded-xl border border-border bg-surface p-5 shadow-2xl ${ENTER_MODAL_CLASSES}`}
          >
            {navigation.introStep && (
              <div key={navigation.introStep.stepId} className={ENTER_RISE_CLASSES}>
                <PreviewStep step={navigation.introStep} preview={preview} />
              </div>
            )}
            <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-3">
              <span className="text-[11px] text-fg-subtle">
                Modal de entrada · {navigation.introNumber} de {navigation.introCount}
              </span>
              <button
                type="button"
                onClick={navigation.advanceIntro}
                className={PRIMARY_BUTTON_CLASSES}
              >
                {navigation.isLastIntroStep ? 'Ir al formulario' : 'Continuar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
