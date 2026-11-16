import type { UnremittedWithholding } from '../../../../types'

export interface UnremittedAlertProps {
  /** Ordenadas por límite, del más antiguo al más próximo. */
  withholdings: UnremittedWithholding[]
  /** Quien entró: el aviso sale una vez por usuario hasta que se recarga la página. */
  userId: string
}

export interface UnremittedMessage {
  tone: 'error' | 'warning'
  title: string
  description: string
}
