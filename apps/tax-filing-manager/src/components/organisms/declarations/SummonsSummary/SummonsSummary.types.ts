import type { Summons } from '../../../../types'

export interface SummonsSummaryProps {
  e: Summons
  /** Con la explicación de lo que sigue, en lugar de solo el plazo. */
  detail?: boolean
  className?: string
}
