import type { FilaCheque } from '../../../../types'

export interface ChequesEnCanjeProps {
  cheques: FilaCheque[]
  /** Confirmar o devolver lo hace el municipio; 1cero1 solo consulta. */
  puedeResolver: boolean
}

/** El último cheque resuelto, para confirmarlo. */
export interface Resuelto {
  fila: FilaCheque
  estado: 'pagado' | 'devuelto'
}
