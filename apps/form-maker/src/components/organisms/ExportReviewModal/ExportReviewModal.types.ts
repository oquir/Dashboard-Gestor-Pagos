import type { FormProblem } from '../../../types'

export interface ExportReviewModalProps {
  problems: FormProblem[]
  hasErrors: boolean
  onGoTo: (problem: FormProblem) => void
  onExport: () => void
  onClose: () => void
}
