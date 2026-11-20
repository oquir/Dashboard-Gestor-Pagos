import { useState } from 'react'
import { INDUSTRIA_COMERCIO_INTRO_STEPS } from '../../constants'
import { useFormStore } from '../../store'
import type { UseSetupWizardResult, WizardSelection, WizardStep } from './useSetupWizard.types'

// Asistente de dos pasos mientras setupConfig.isComplete es falso. Industria y Comercio salta la
// segunda pregunta (su plantilla trae el modal). Abrir un exportado va por useProjectImport.
export function useSetupWizard(): UseSetupWizardResult {
  const completeSetup = useFormStore((state) => state.completeSetup)
  const [step, setStep] = useState<WizardStep>(1)
  const [selection, setSelection] = useState<WizardSelection | null>(null)
  const [hasIntroModal, setHasIntroModal] = useState<boolean | null>(null)
  const [introModalSteps, setIntroModalSteps] = useState<number>(1)

  const canProceed = selection !== null
  const canFinish = hasIntroModal !== null

  function goNext(): void {
    if (selection === 'import') {
      setStep('import')
      return
    }

    if (selection === 'industria_comercio') {
      completeSetup({
        formType: selection,
        hasIntroModal: true,
        introModalSteps: INDUSTRIA_COMERCIO_INTRO_STEPS,
      })
      return
    }
    setStep(2)
  }

  function goBack(): void {
    setStep(1)
  }

  function handleFinish(): void {
    if (selection === null || selection === 'import' || hasIntroModal === null) return
    completeSetup({
      formType: selection,
      hasIntroModal,
      introModalSteps: hasIntroModal ? introModalSteps : 0,
    })
  }

  return {
    step,
    selection,
    hasIntroModal,
    introModalSteps,
    canProceed,
    canFinish,
    setSelection,
    setHasIntroModal,
    setIntroModalSteps,
    goNext,
    goBack,
    handleFinish,
  }
}
