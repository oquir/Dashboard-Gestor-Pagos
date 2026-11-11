import type { DeclaracionKind, ReglaAnio } from '../../../types'

export interface MaxDatesDeclaracionSectionProps {
  kind: DeclaracionKind
  label: string
  reglas: ReglaAnio[]
  onEditFecha: (kind: DeclaracionKind, anio: number, fecha: string) => void
}
