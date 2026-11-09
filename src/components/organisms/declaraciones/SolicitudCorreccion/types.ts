import type { SituacionCorreccion } from '../../../../lib/reglas'
import type { Declaracion } from '../../../../types'

export interface SolicitudCorreccionProps {
  /** La corrección a la baja que pide el contribuyente. */
  d: Declaracion
  /** La declaración que corrige. */
  corregida: Declaracion | undefined
  situacion: SituacionCorreccion
  correo: string
  puedeResolver: boolean
}
