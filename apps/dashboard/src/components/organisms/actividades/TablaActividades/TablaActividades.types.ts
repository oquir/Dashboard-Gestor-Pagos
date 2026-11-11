import type { ActividadesVigencia, VistaPrevia } from '../../../../types'

export interface TablaActividadesProps {
  vigencia: number
  actual?: ActividadesVigencia
  vista: VistaPrevia | null
  puedeCargar: boolean
}
