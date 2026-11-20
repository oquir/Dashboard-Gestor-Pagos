import type { ExportedStep } from '../../types'

export interface UsePreviewNavigationResult {
  step: ExportedStep | undefined
  stepNumber: number
  stepCount: number
  isFirstStep: boolean
  isLastStep: boolean
  submitted: boolean
  // Hacia donde fue el ultimo cambio de paso: decide de que lado entra el paso nuevo.
  direction: 'forward' | 'back'
  showIntro: boolean
  introStep: ExportedStep | undefined
  introNumber: number
  introCount: number
  isLastIntroStep: boolean
  advance: () => void
  goBack: () => void
  advanceIntro: () => void
  restart: () => void
}
