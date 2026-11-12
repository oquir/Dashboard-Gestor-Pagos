import type { Tone } from '../../../lib'

export const TONE_CLASSES: Record<Tone, string> = {
  neutral: 'bg-surface-sunken text-fg',
  info: 'bg-brand-surface text-brand-fg-strong',
  success: 'bg-secondary-surface text-secondary-fg',
  alert: 'bg-warning-surface text-warning-fg',
  danger: 'bg-danger-surface text-danger-fg',
}
