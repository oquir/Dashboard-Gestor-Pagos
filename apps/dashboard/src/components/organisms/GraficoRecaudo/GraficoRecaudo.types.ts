import type { ReactNode } from 'react'
import type { FilaRecaudo, Impuesto } from '../../../types'

export interface Serie {
  impuesto: Impuesto
  clase: string
}

/** El tramo de una columna que se está señalando. */
export interface SegmentoActivo {
  fila: number
  impuesto: Impuesto
}

export interface GraficoRecaudoProps {
  titulo: string
  descripcion: string
  filas: FilaRecaudo[]
  /** Impuestos que se muestran como series; por defecto, los tres. */
  impuestos?: Impuesto[]
  /** Controles extra del encabezado, como el selector de año. */
  controles?: ReactNode
}
