import type { Emplazamiento } from '../../../../types'

export interface EmplazamientoResumenProps {
  e: Emplazamiento
  /** Con la explicación de lo que sigue, en lugar de solo el plazo. */
  detalle?: boolean
  className?: string
}
