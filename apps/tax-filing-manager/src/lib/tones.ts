// Color de cada estado. Siempre va con su texto: el color nunca informa solo.
import type {
  ApprovalStatus,
  CheckStatus,
  CorrectionStatus,
  SummonsStatus,
  RegistrationStatus,
  RitChangeStatus,
  PaymentStatus,
} from '../types'

export type Tone = 'neutral' | 'info' | 'success' | 'alert' | 'danger'

export const registrationTone: Record<RegistrationStatus, Tone> = {
  under_review: 'alert',
  active: 'success',
  rejected: 'danger',
  cancelled: 'neutral',
}

export const ritChangeTone: Record<RitChangeStatus, Tone> = {
  pending: 'alert',
  approved: 'success',
  rejected: 'danger',
}

export const approvalTone: Record<ApprovalStatus, Tone> = {
  pending_approval: 'alert',
  overdue: 'danger',
  approved: 'success',
  auto_approved: 'success',
  rejected: 'danger',
}

export const correctionTone: Record<CorrectionStatus, Tone> = {
  to_resolve: 'alert',
  accepted: 'success',
  accepted_by_silence: 'success',
  rejected: 'danger',
}

/** El de declarar vencido es grave: siguen la sanción por no declarar y el aforo. El de corregir sin respuesta, no: no genera sanción. */
export const summonsTone: Record<SummonsStatus, Tone> = {
  on_time: 'alert',
  overdue: 'danger',
  declared: 'success',
  no_reply: 'neutral',
  corrected: 'success',
}

export const paymentTone: Record<PaymentStatus, Tone> = {
  paid: 'success',
  partial: 'alert',
  no_payment: 'danger',
  credit_balance: 'info',
  ineffective: 'danger',
}

/** Retención sin consignar: en alerta mientras corre el plazo de 2 meses; en peligro cuando ya pasó. */
export const remittanceTone = (days: number): Tone => (days < 0 ? 'danger' : 'alert')

export const checkTone: Record<CheckStatus, Tone> = {
  in_clearing: 'alert',
  paid: 'success',
  returned: 'danger',
}
