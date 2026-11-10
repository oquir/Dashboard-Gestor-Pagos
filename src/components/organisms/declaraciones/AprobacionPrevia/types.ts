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

/** Una causal del art. 580 del Estatuto Tributario. */
export interface Causal {
  /** Su literal en el artículo. */
  literal: string
  etiqueta: string
  /** Lo que le falta a la declaración, como se le explica al contribuyente. */
  descripcion: string
  /** Si se corrige con la sanción reducida del art. 588, parágrafo 2; si no, se presenta de nuevo. */
  seCorrige: boolean
}
