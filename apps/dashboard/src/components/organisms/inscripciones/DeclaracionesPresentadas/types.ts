import type { Declaracion } from '../../../../types'

export interface DeclaracionesPresentadasProps {
  /** De la más reciente a la más antigua. */
  declaraciones: Declaracion[]
  regimenSimple: boolean
}
