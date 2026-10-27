import type { ActividadesVigencia, VistaPrevia } from '../../../../types'

export interface CargaActividadesProps {
  municipioId: string
  vigencia: number
  /** Las actividades con que viene la plantilla. */
  base?: ActividadesVigencia
  /** Las ya cargadas para el año, que la carga reemplaza. */
  actual?: ActividadesVigencia
  vista: VistaPrevia | null
  cambiarVista: (vista: VistaPrevia | null) => void
}
