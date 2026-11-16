import type { RitChangeStatus, RitChange } from '../../../../types'

/** Cómo se resuelve la solicitud. */
export type Reply = Exclude<RitChangeStatus, 'pending'>

export interface ApplicationReplyProps {
  registrationId: string
  ritChange: RitChange
  email: string
}
