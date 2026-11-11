import type { FiscalYearActivities, Preview } from '../../../../types'

export interface ActivityUploadProps {
  municipalityId: string
  fiscalYear: number
  /** Las actividades con que viene la plantilla. */
  base?: FiscalYearActivities
  /** Las ya cargadas para el año, que la carga reemplaza. */
  current?: FiscalYearActivities
  view: Preview | null
  changeView: (view: Preview | null) => void
}
