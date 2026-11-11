import { useState } from 'react'
import { compactFormat, formatPesos } from '../../../lib'
import { Card } from '../../atoms'
import { CardHeader, EmptyState } from '../../molecules'
import { percentage } from './BarChart.constants'
import type { BarChartProps } from './BarChart.types'

/** Barras horizontales: cuánto aporta cada categoría al total. */
export default function BarChart({ title, description, bars, format }: BarChartProps) {
  const [active, setActive] = useState<number | null>(null)
  const total = bars.reduce((s, b) => s + b.value, 0)
  const maximum = Math.max(...bars.map((b) => b.value), 0)
  const text = (value: number) => (format === 'pesos' ? `$${compactFormat(value)}` : String(value))

  return (
    <Card>
      <CardHeader title={title} description={description} />
      {total === 0 ? (
        <EmptyState title="Sin datos para graficar" />
      ) : (
        <ul className="space-y-3 px-5 py-4">
          {bars.map((b, i) => (
            <li
              key={b.label}
              tabIndex={0}
              aria-label={`${b.label}: ${format === 'pesos' ? formatPesos(b.value) : b.value}, ${percentage.format(b.value / total)} del total`}
              onPointerEnter={() => setActive(i)}
              onPointerLeave={() => setActive(null)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              className={`rounded outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-brand-600 ${active !== null && active !== i ? 'opacity-50' : ''}`}
            >
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate text-slate-700">{b.label}</span>
                <span
                  className="shrink-0 tabular-nums text-slate-900"
                  title={format === 'pesos' ? formatPesos(b.value) : undefined}
                >
                  {text(b.value)}
                  <span className="ml-1.5 text-xs text-slate-500">
                    {percentage.format(b.value / total)}
                  </span>
                </span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-slate-100">
                {b.value > 0 && (
                  <div
                    className={`h-2 min-w-1 rounded-full ${b.classes ?? 'bg-brand-500'}`}
                    style={{ width: `${(b.value / maximum) * 100}%` }}
                  />
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
