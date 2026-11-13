import type { ReactNode } from 'react'
import type { CollectionRow, Tax } from '../../../types'

export interface Series {
  tax: Tax
  classes: string
}

/** El tramo de una columna que se está señalando. */
export interface ActiveSegment {
  row: number
  tax: Tax
}

export interface CollectionChartProps {
  title: string
  description: string
  rows: CollectionRow[]
  /** Impuestos que se muestran como series; por defecto, los tres. */
  taxes?: Tax[]
  /** Controles extra del encabezado, como la periodicidad. */
  controls?: ReactNode
  /** Controles debajo de la gráfica, como el selector de año. */
  footer?: ReactNode
}
