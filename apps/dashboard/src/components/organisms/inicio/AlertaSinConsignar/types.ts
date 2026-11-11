import type { RetencionSinConsignar } from '../../../../types'

export interface AlertaSinConsignarProps {
  /** Ordenadas por límite, del más antiguo al más próximo. */
  retenciones: RetencionSinConsignar[]
  className?: string
}
