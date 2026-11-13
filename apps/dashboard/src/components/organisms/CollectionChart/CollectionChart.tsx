import { useMemo, useState } from 'react'
import { taxLabel, compactFormat, formatPesos } from '../../../lib'
import { totalCollection } from '../../../utils'
import { Button, Card } from '../../atoms'
import { CardHeader } from '../../molecules'
import Table from '../Table'
import { HEIGHT, SERIES, ALL } from './CollectionChart.constants'
import type { CollectionChartProps, ActiveSegment } from './CollectionChart.types'
import { tableColumns, roundMaximum } from './CollectionChart.utils'

/** Columnas apiladas: recaudo por periodo, una serie por impuesto. */
export default function CollectionChart({
  title,
  description,
  rows,
  taxes = ALL,
  controls,
  footer,
}: CollectionChartProps) {
  const series = useMemo(() => SERIES.filter((s) => taxes.includes(s.tax)), [taxes])
  const columns = useMemo(() => tableColumns(series), [series])
  const [showTable, setShowTable] = useState(false)
  const [isActive, setIsActive] = useState<ActiveSegment | null>(null)
  const maximum = roundMaximum(Math.max(...rows.map(totalCollection), 0))
  const marks = [maximum, maximum / 2, 0]

  return (
    <Card>
      <CardHeader
        title={title}
        description={description}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {controls}
            <Button variant="secondary" onClick={() => setShowTable((v) => !v)}>
              {showTable ? 'Ver gráfica' : 'Ver como tabla'}
            </Button>
          </div>
        }
      />
      <div className="px-5 pb-5 pt-4">
        <ul className="mb-4 flex flex-wrap gap-4 text-sm text-fg-soft">
          {series.map(({ tax, classes }) => (
            <li key={tax} className="flex items-center gap-2">
              <span className={`size-3 rounded-sm ${classes}`} aria-hidden />
              {taxLabel[tax]}
            </li>
          ))}
        </ul>

        {showTable ? (
          <div className="-mx-5">
            <Table data={rows} columns={columns} dense rowId={(f) => f.label} />
          </div>
        ) : (
          <div className="flex gap-3">
            <div
              className="relative w-14 shrink-0 text-right text-xs tabular-nums text-fg-subtle"
              style={{ height: HEIGHT }}
            >
              {marks.map((m, i) => (
                <span
                  key={m}
                  className="absolute right-0 -translate-y-1/2"
                  style={{ top: (i * HEIGHT) / 2 }}
                >
                  {compactFormat(m)}
                </span>
              ))}
            </div>
            <div className="min-w-0 flex-1">
              <div className="relative" style={{ height: HEIGHT }}>
                {marks.map((m, i) => (
                  <div
                    key={m}
                    className={`absolute inset-x-0 h-px ${i === 2 ? 'bg-border-strong' : 'bg-surface-raised'}`}
                    style={{ top: (i * HEIGHT) / 2 }}
                  />
                ))}
                <div className="absolute inset-0 flex items-end justify-around">
                  {rows.map((f, i) => (
                    <div
                      key={f.label}
                      className="relative flex h-full min-w-0 max-w-14 flex-1 flex-col-reverse items-center gap-[2px] px-0.5"
                    >
                      {series.map(({ tax, classes }, s) => {
                        const value = f.values[tax]
                        if (value <= 0) return null
                        const isLast = series.slice(s + 1).every((o) => f.values[o.tax] <= 0)
                        const isActiveItem = isActive?.row === i && isActive.tax === tax
                        return (
                          <div
                            key={tax}
                            tabIndex={0}
                            aria-label={`${f.label}, ${taxLabel[tax]}: ${formatPesos(value)}`}
                            onPointerEnter={() => setIsActive({ row: i, tax })}
                            onPointerLeave={() => setIsActive(null)}
                            onFocus={() => setIsActive({ row: i, tax })}
                            onBlur={() => setIsActive(null)}
                            className={`w-full max-w-6 shrink-0 cursor-pointer outline-none transition-opacity ${classes} ${isLast ? 'rounded-t' : ''} ${
                              isActive && !isActiveItem ? 'opacity-60' : ''
                            }`}
                            style={{ height: Math.max((value / maximum) * HEIGHT - 2, 2) }}
                          />
                        )
                      })}
                      {isActive?.row === i && (
                        <div
                          className={`pointer-events-none absolute bottom-full z-10 mb-2 w-48 ${i < rows.length / 2 ? 'left-0' : 'right-0'} rounded-lg border border-border bg-surface p-3 text-left shadow-lg`}
                        >
                          <p className="text-xs text-fg-muted">{f.label}</p>
                          {series.map(({ tax, classes }) => (
                            <div key={tax} className="mt-1 flex items-center gap-2">
                              <span className={`h-0.5 w-3 ${classes}`} aria-hidden />
                              <span
                                className={`text-sm ${isActive.tax === tax ? 'font-semibold text-fg-strong' : 'text-fg'}`}
                              >
                                {formatPesos(f.values[tax])}
                              </span>
                              <span className="ml-auto text-xs text-fg-muted">{taxLabel[tax]}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-2 flex justify-around text-xs text-fg-muted">
                {rows.map((f) => (
                  <span key={f.label} className="min-w-0 max-w-14 flex-1 text-center">
                    {f.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
        {footer && <div className="mt-4 flex justify-center">{footer}</div>}
      </div>
    </Card>
  )
}
