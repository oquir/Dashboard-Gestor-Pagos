import type { Frequency } from '../../../../types'

export const PERIOD_GRID: Record<Frequency, string> = {
  annual: 'grid grid-cols-[minmax(0,16rem)] gap-3',
  monthly: 'grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4',
  bimonthly: 'grid grid-cols-2 gap-3 md:grid-cols-3',
  quarterly: 'grid grid-cols-2 gap-3 md:grid-cols-4',
}