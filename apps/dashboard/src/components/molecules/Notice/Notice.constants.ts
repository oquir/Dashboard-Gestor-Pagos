import type { Tone } from '../../../lib'

export const TONE_CLASSES: Record<Tone, string> = {
  neutral: 'bg-slate-50 text-slate-700',
  info: 'bg-brand-50 text-brand-800',
  success: 'bg-emerald-50 text-emerald-800',
  alert: 'bg-amber-50 text-amber-800',
  danger: 'bg-red-50 text-red-800',
}
