import type { SituacionAprobacion } from '../../../../lib/reglas'
import type { Declaracion, MediosVentanilla } from '../../../../types'

export interface AprobacionPreviaProps {
  d: Declaracion
  situacion: SituacionAprobacion
  correo: string
  puedeResolver: boolean
  /** Lo que el municipio recibe en su ventanilla para este formulario. */
  ventanilla: MediosVentanilla
}
