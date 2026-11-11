import type { UnremittedWithholding } from '../../../../types'

export interface UnremittedAlertProps {
  /** Ordenadas por límite, del más antiguo al más próximo. */
  withholdings: UnremittedWithholding[]
  className?: string
}
