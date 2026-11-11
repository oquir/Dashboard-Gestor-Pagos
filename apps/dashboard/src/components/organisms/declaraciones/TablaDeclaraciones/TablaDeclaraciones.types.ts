import type { FilaDeclaracion } from '../../../../types'

/** Marca o desmarca las declaraciones con esos ids. */
export type Marcar = (ids: string[], marcado: boolean) => void

export interface TablaDeclaracionesProps {
  filas: FilaDeclaracion[]
  seleccion: ReadonlySet<string>
  marcar: Marcar
  conAprobacion: boolean
}
