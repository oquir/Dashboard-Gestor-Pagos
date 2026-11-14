import type { ReglaAnio } from '../../../types'

export interface MaxDatesAnioRowProps {
  regla: ReglaAnio
  onEditFecha: (fecha: string) => void
}
