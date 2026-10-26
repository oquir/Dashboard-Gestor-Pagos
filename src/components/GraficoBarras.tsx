import { useState } from 'react'
import { formatoCompacto, formatoPesos } from '../lib/formato'
import { Card, CardHeader, Vacio } from './ui'

export interface Barra {
  etiqueta: string
  valor: number
  /** Color de la barra; por defecto, el de la marca. */
  clase?: string
}

const porcentaje = new Intl.NumberFormat('es-CO', { style: 'percent', maximumFractionDigits: 0 })

/** Barras horizontales: cuánto aporta cada categoría al total. */
export default function GraficoBarras({ titulo, descripcion, barras, formato }: {
  titulo: string
  descripcion?: string
  barras: Barra[]
  /** Cantidad de registros o suma en pesos. */
  formato: 'cantidad' | 'pesos'
}) {
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
