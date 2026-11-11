import type { Bar, ChartFormat } from '../../../types'

export interface BarChartProps {
  title: string
  description?: string
  bars: Bar[]
  /** Cantidad de registros o suma en pesos. */
  format: ChartFormat
}
