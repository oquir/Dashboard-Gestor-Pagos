import type { Registration, RitChange } from '../../../../types'

/** Una solicitud del RIT con el inscrito que la radicó. */
export interface PendingApplication {
  reg: Registration
  ritChange: RitChange
}

export interface PendingApplicationsProps {
  /** De la más reciente a la más antigua. */
  pendingOnes: PendingApplication[]
  className?: string
}
