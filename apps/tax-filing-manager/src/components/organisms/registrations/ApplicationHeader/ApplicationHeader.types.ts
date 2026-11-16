import type { RitChange } from '../../../../types'

export interface ApplicationHeaderProps {
  application: RitChange
  /** Se compara con la solicitud aprobada anterior. */
  compared: boolean
  showCurrent: () => void
  /** En una inscripción radicada después del plazo: cuándo vencía y cuántos días tarde llegó. */
  lateItem?: { limit: string; days: number } | null
}
