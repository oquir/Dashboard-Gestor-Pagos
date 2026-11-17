import type { GeneralCollectionRow } from '../../../lib'

export type HoveredMonth = number | null

export interface MonthlyCollectionLineChartProps {
  /** Un municipio por línea, ya con su color, igual que las barras. */
  series: GeneralCollectionRow[]
  title: string
  description?: string
}
