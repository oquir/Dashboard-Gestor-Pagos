import {
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { compactFormat, formatPesos } from '../../../lib'
import { Card } from '../../atoms'
import { CardHeader, EmptyState } from '../../molecules'
import {
  ACTIVE_DOT_RADIUS,
  DOT_RADIUS,
  FULL_MONTHS,
  HEIGHT,
  PADDING,
  PLOT_HEIGHT,
  PLOT_WIDTH,
  TICKS,
  WIDTH,
} from './MonthlyCollectionLineChart.constants'
import type {
  HoveredMonth,
  MonthlyCollectionLineChartProps,
} from './MonthlyCollectionLineChart.types'
import {
  monthIndexAt,
  monthPillWidth,
  niceMaximum,
  svgXFromClientX,
  tooltipFlipsToLeft,
} from './MonthlyCollectionLineChart.utils'

export default function MonthlyCollectionLineChart({
  series,
  title,
  description,
}: MonthlyCollectionLineChartProps) {
  const [hoveredMonth, setHoveredMonth] = useState<HoveredMonth>(null)
  const total = series.reduce((s, r) => s + r.total, 0)
  const months = FULL_MONTHS.length
  const maximum = niceMaximum(Math.max(...series.flatMap((r) => r.months), 0))
  const x = (i: number) => PADDING.left + (i * PLOT_WIDTH) / (months - 1)
  const y = (value: number) => PADDING.top + PLOT_HEIGHT - (value / maximum) * PLOT_HEIGHT

  /** Mes más cercano al puntero, en coordenadas del lienzo. */
  const handleMove = (e: ReactPointerEvent<SVGSVGElement>) =>
    setHoveredMonth(monthIndexAt(svgXFromClientX(e.clientX, e.currentTarget)))

  /** Flechas para recorrer los meses con el teclado; Escape limpia. */
  const handleKey = (e: ReactKeyboardEvent<SVGSVGElement>) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault()
      const step = e.key === 'ArrowRight' ? 1 : -1
      setHoveredMonth((current) =>
        Math.min(FULL_MONTHS.length - 1, Math.max(0, (current ?? 0) + step)),
      )
    } else if (e.key === 'Escape') {
      setHoveredMonth(null)
    }
  }

  return (
    <Card>
      <CardHeader title={title} description={description} />
      {total === 0 ? (
        <EmptyState title="Sin datos para graficar" />
      ) : (
        <div className="px-5 pb-5 pt-4">
          <ul className="mb-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-fg-soft">
            {series.map((r) => (
              <li key={r.municipalityId} className="flex items-center gap-2">
                <span
                  className="h-0.5 w-4 rounded-full"
                  style={{ background: r.color }}
                  aria-hidden
                />
                {r.name}
              </li>
            ))}
          </ul>
          <div className="overflow-x-auto">
            <div className="relative" style={{ minWidth: months * 64 }}>
              <svg
                viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                className="h-auto w-full cursor-crosshair focus-visible:outline-2 focus-visible:outline-brand-border"
                tabIndex={0}
                aria-label={`Recaudo mensual por municipio: ${series.map((r) => r.name).join(', ')}`}
                onPointerMove={handleMove}
                onPointerLeave={() => setHoveredMonth(null)}
                onFocus={() => setHoveredMonth((current) => current ?? 0)}
                onBlur={() => setHoveredMonth(null)}
                onKeyDown={handleKey}
              >
                {/* Rejilla y eje Y, en millones. */}
                {Array.from({ length: TICKS + 1 }, (_, i) => {
                  const top = PADDING.top + (i * PLOT_HEIGHT) / TICKS
                  const value = maximum - (i * maximum) / TICKS
                  return (
                    <g key={i}>
                      <line
                        x1={PADDING.left}
                        x2={WIDTH - PADDING.right}
                        y1={top}
                        y2={top}
                        stroke={
                          i === TICKS ? 'var(--ui-border-strong)' : 'var(--ui-surface-raised)'
                        }
                      />
                      <text
                        x={PADDING.left - 8}
                        y={top}
                        textAnchor="end"
                        dominantBaseline="middle"
                        fontSize={11}
                        fill="var(--ui-fg-subtle)"
                        style={{ fontVariantNumeric: 'tabular-nums' }}
                      >
                        {compactFormat(value)}
                      </text>
                    </g>
                  )
                })}

                {/* Solo el trazo de cada municipio, con los 12 meses: sin área ni relleno. */}
                {series.map((r) => (
                  <polyline
                    key={r.municipalityId}
                    points={r.months.map((value, i) => `${x(i)},${y(value)}`).join(' ')}
                    fill="none"
                    stroke={r.color}
                    strokeWidth={2}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                ))}

                {/* Un punto por mes con su valor exacto al pasar el cursor. */}
                {series.map((r) =>
                  r.months.map((value, i) =>
                    value > 0 ? (
                      <circle
                        key={`${r.municipalityId}-${i}`}
                        cx={x(i)}
                        cy={y(value)}
                        r={DOT_RADIUS}
                        fill={r.color}
                      >
                        <title>{`${r.name}, ${FULL_MONTHS[i]}: ${formatPesos(value)}`}</title>
                      </circle>
                    ) : null,
                  ),
                )}

                {/* Columna activa: crosshair punteado de la rejilla a la línea base. */}
                {hoveredMonth !== null && (
                  <line
                    x1={x(hoveredMonth)}
                    x2={x(hoveredMonth)}
                    y1={PADDING.top}
                    y2={HEIGHT - PADDING.bottom}
                    stroke="var(--ui-fg-subtle)"
                    strokeDasharray="4 4"
                  />
                )}

                {/* Punto grande de cada municipio en el mes activo, aunque su valor sea $ 0. */}
                {hoveredMonth !== null &&
                  series.map((r) => (
                    <circle
                      key={`active-${r.municipalityId}`}
                      cx={x(hoveredMonth)}
                      cy={y(r.months[hoveredMonth] ?? 0)}
                      r={ACTIVE_DOT_RADIUS}
                      fill={r.color}
                      stroke="var(--ui-surface)"
                      strokeWidth={2}
                    />
                  ))}

                {/* Meses, eje X; el activo se resalta con una píldora oscura. */}
                {FULL_MONTHS.map((month, i) =>
                  i === hoveredMonth ? (
                    <g key={month}>
                      <rect
                        x={x(i) - monthPillWidth(month) / 2}
                        y={HEIGHT - PADDING.bottom + 4}
                        width={monthPillWidth(month)}
                        height={20}
                        rx={10}
                        fill="var(--ui-inverse)"
                      />
                      <text
                        x={x(i)}
                        y={HEIGHT - PADDING.bottom + 18}
                        textAnchor="middle"
                        fontSize={11}
                        fill="var(--ui-on-inverse)"
                      >
                        {month}
                      </text>
                    </g>
                  ) : (
                    <text
                      key={month}
                      x={x(i)}
                      y={HEIGHT - PADDING.bottom + 18}
                      textAnchor="middle"
                      fontSize={11}
                      fill="var(--ui-fg-muted)"
                    >
                      {month}
                    </text>
                  ),
                )}
              </svg>

              {/* Tarjeta flotante con los valores exactos del mes activo. */}
              {hoveredMonth !== null && (
                <div
                  className="pointer-events-none absolute z-10 w-56 rounded-lg border border-on-inverse/10 bg-inverse px-3 py-2 text-on-inverse shadow-lg"
                  style={{
                    top: PADDING.top,
                    left: `${(x(hoveredMonth) / WIDTH) * 100}%`,
                    transform: tooltipFlipsToLeft(x(hoveredMonth))
                      ? 'translateX(calc(-100% - 12px))'
                      : 'translateX(12px)',
                  }}
                >
                  <p className="text-xs font-semibold">{FULL_MONTHS[hoveredMonth]}</p>
                  <ul className="mt-1.5 space-y-1">
                    {series.map((r) => (
                      <li key={r.municipalityId} className="flex items-center gap-2 text-xs">
                        <span
                          className="size-2 shrink-0 rounded-full"
                          style={{ background: r.color }}
                          aria-hidden
                        />
                        <span className="truncate text-on-inverse-muted">{r.name}</span>
                        <span className="ml-auto shrink-0 tabular-nums">
                          {formatPesos(r.months[hoveredMonth] ?? 0)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
