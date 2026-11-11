import type { Tax, NonFilersResult, FilterValue } from '../../../../types'

export interface NonFilerListProps {
  result: NonFilersResult
  /** El de la pestaña de la página; vacío, todos. */
  tax: FilterValue<Tax>
}

/** Un omiso no tiene emplazamiento, o lo tiene en plazo o vencido: si ya declaró, deja de ser omiso. */
export type SummonsFilter = FilterValue<'no_summons' | 'on_time' | 'overdue'>
