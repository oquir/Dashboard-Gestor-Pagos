import type { CheckRow } from '../../../../types'

export interface ChecksInClearingProps {
  checks: CheckRow[]
  /** Confirmar o devolver lo hace el municipio; 1cero1 solo consulta. */
  canResolve: boolean
}

/** El último cheque resuelto, para confirmarlo. */
export interface Resolved {
  row: CheckRow
  status: 'paid' | 'returned'
}
