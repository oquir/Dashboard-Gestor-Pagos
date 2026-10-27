import type { Deuda } from '../../../../types'

export interface ListaDeudasProps {
  titulo: string
  descripcion: string
  vacio: string
  deudas: Deuda[]
  /** Nombre del declarante por id de inscripción. */
  nombres: Map<string, string>
}
