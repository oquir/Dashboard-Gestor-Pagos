import type { FiscalYearActivities, Preview } from '../../../../types'

export interface ActivitiesTableProps {
  fiscalYear: number
  current?: FiscalYearActivities
  view: Preview | null
  canUpload: boolean
}
