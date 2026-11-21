import type { FormProblem } from '../../../types'

export type ReviewAction = 'export' | 'upload'

export interface ReviewCopy {
  title: string
  actionLabel: string
  blockedHint: string
}

export interface ExportReviewModalProps {
  // Lo que se hara al pasar la revision; cambia el titulo y el boton.
  action: ReviewAction
  problems: FormProblem[]
  hasErrors: boolean
  onGoTo: (problem: FormProblem) => void
  onProceed: () => void
  onClose: () => void
}
