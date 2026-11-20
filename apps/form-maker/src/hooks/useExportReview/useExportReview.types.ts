import type { FormProblem } from '../../types'

export interface UseExportReviewResult {
  problems: FormProblem[] | null
  hasErrors: boolean
  requestExport: () => void
  exportAnyway: () => void
  goTo: (problem: FormProblem) => void
  close: () => void
}

export interface PendingReveal {
  kind: 'field' | 'row' | 'band'
  id: string
}
