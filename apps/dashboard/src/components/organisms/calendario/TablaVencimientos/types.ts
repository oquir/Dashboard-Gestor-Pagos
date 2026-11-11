import type { VencimientosFormulario } from '../../../../types'

export interface TablaVencimientosProps {
  titulo: string
  descripcion: string
  valor: VencimientosFormulario
  onChange: (valor: VencimientosFormulario) => void
  editable: boolean
  /** Error de cada periodo, por número de periodo. */
  errores: Record<number, string>
  /** Si ya hay declaraciones del año presentadas con otra periodicidad, el aviso que lo dice. */
  avisoPeriodicidad?: string
}
