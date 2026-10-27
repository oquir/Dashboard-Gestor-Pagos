import { useState } from 'react'
import { formatoCompacto, formatoPesos } from '../../../lib/formato'
import { Card } from '../../atoms'
import { CardHeader, Vacio } from '../../molecules'
import { porcentaje } from './constants'
import type { GraficoBarrasProps } from './types'

/** Barras horizontales: cuánto aporta cada categoría al total. */
export default function GraficoBarras({ titulo, descripcion, barras, formato }: GraficoBarrasProps) {
  const [activa, setActiva] = useState<number | null>(null)
  const total = barras.reduce((s, b) => s + b.valor, 0)
  const maximo = Math.max(...barras.map((b) => b.valor), 0)
  const texto = (valor: number) => (formato === 'pesos' ? `$${formatoCompacto(valor)}` : String(valor))

  return (
    <Card>
      <CardHeader titulo={titulo} descripcion={descripcion} />
      {total === 0 ? (
        <Vacio titulo="Sin datos para graficar" />
      ) : (
        <ul className="space-y-3 px-5 py-4">
          {barras.map((b, i) => (
            <li
              key={b.etiqueta}
              tabIndex={0}
              aria-label={`${b.etiqueta}: ${formato === 'pesos' ? formatoPesos(b.valor) : b.valor}, ${porcentaje.format(b.valor / total)} del total`}
              onPointerEnter={() => setActiva(i)}
              onPointerLeave={() => setActiva(null)}
              onFocus={() => setActiva(i)}
              onBlur={() => setActiva(null)}
              className={`rounded outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-brand-600 ${activa !== null && activa !== i ? 'opacity-50' : ''}`}
            >
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate text-slate-700">{b.etiqueta}</span>
                <span className="shrink-0 tabular-nums text-slate-900" title={formato === 'pesos' ? formatoPesos(b.valor) : undefined}>
                  {texto(b.valor)}
                  <span className="ml-1.5 text-xs text-slate-500">{porcentaje.format(b.valor / total)}</span>
                </span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-slate-100">
                {b.valor > 0 && (
                  <div className={`h-2 min-w-1 rounded-full ${b.clase ?? 'bg-brand-500'}`} style={{ width: `${(b.valor / maximo) * 100}%` }} />
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
