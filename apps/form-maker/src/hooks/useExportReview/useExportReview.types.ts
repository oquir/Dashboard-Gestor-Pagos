import type { FormProblem } from '../../types'

export interface UseExportReviewResult {
  problems: FormProblem[] | null
  hasErrors: boolean
  request: () => void
  proceedAnyway: () => void
  goTo: (problem: FormProblem) => void
  close: () => void
}

export interface PendingReveal {
  kind: 'field' | 'row' | 'band'
  id: string
}
