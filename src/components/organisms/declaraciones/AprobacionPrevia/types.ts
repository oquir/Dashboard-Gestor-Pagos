import type { SituacionAprobacion } from '../../../../lib/reglas'
import type { Declaracion } from '../../../../types'

export interface AprobacionPreviaProps {
  d: Declaracion
  situacion: SituacionAprobacion
  correo: string
  puedeResolver: boolean
  /** El municipio recibe pagos en efectivo en su ventanilla. */
  pagoVentanilla: boolean
}
