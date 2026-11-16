import type { MunicipalityConfig, Registration, RitChange } from '../../../../types'

export interface ApplicationsTimelineProps {
  registration: Registration
  /** La que se está viendo; sin ella, los datos actuales. */
  application?: RitChange
  pick: (ritChangeId: string | null) => void
  config?: MunicipalityConfig
  canReview: boolean
}
