import type { Opcion } from '../../../types'

export interface SegmentadoProps<T extends string | number> {
  etiqueta: string
  opciones: Opcion<T>[]
  valor: T
  cambiar: (valor: T) => void
  /** Botones más pequeños, para el encabezado de una tarjeta. */
  compacto?: boolean
  className?: string
}
