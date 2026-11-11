import { SERIES_CLASS } from '../../../constants'
import { TAXES } from '../../../lib'
import type { Series } from './CollectionChart.types'

export const SERIES: Series[] = TAXES.map((tax) => ({
  tax,
  classes: SERIES_CLASS[tax],
}))
export const ALL = SERIES.map((s) => s.tax)

export const VALUE = {
  align: 'right',
  classes: 'whitespace-nowrap tabular-nums text-slate-900',
} as const

export const HEIGHT = 220
