import type { Tone } from '../../../lib'

export const TONE_CLASSES: Record<Tone, string> = {
  neutral: 'bg-surface-raised text-fg ring-border',
  info: 'bg-brand-surface text-brand-fg ring-brand-border-soft',
  success: 'bg-secondary-surface text-secondary-fg ring-secondary-border',
  alert: 'bg-warning-surface text-warning-fg ring-warning-border',
  danger: 'bg-danger-surface text-danger-fg ring-danger-border',
}
