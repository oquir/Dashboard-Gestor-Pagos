import type { Tono } from '../../../lib/tonos'

export const CLASES_TONO: Record<Tono, string> = {
  neutral: 'bg-slate-100 text-slate-700 ring-slate-200',
  info: 'bg-brand-50 text-brand-700 ring-brand-200',
  exito: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  alerta: 'bg-amber-50 text-amber-800 ring-amber-200',
  peligro: 'bg-red-50 text-red-700 ring-red-200',
}
