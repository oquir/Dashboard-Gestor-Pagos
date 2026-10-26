import type { ReactNode } from 'react'
import type { Tono } from '../../lib/tonos'

const CLASES_TONO: Record<Tono, string> = {
  neutral: 'bg-slate-100 text-slate-700 ring-slate-200',
  info: 'bg-brand-50 text-brand-700 ring-brand-200',
  exito: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  alerta: 'bg-amber-50 text-amber-800 ring-amber-200',
  peligro: 'bg-red-50 text-red-700 ring-red-200',
}

export default function Badge({ tono = 'neutral', children }: { tono?: Tono; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${CLASES_TONO[tono]}`}>
      {children}
    </span>
  )
}
