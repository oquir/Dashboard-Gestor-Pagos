import type { Declaracion } from '../../../../types'

export interface SeleccionDeclaracionesProps {
  declaraciones: Declaracion[]
  quitar: () => void
}
