import { useState } from 'react'
import { DIGITS, PERIOD_NAMES } from '../../../../constants'
import { formatList, withDate } from '../../../../lib'
import { Input } from '../../../atoms'
import { COLUMNS, HEADER_COLUMNS, PERIOD_GROUPS } from './ByDigitDates.constants'
import type { ByDigitDatesProps } from './ByDigitDates.types'

export default function ByDigitDates({ value, onChange, editable, errors }: ByDigitDatesProps) {
  const names = PERIOD_NAMES[value.frequency]
  const [picked, setPicked] = useState(1)
  const groups = PERIOD_GROUPS[value.frequency]
  // Si el periodo elegido ya no existe (se cambió la periodicidad), se cae al primer grupo.
  const group = groups.find((g) => g.includes(picked)) ?? groups[0]
  const periods = value.periods.filter((p) => group.includes(p.period))
  const incomplete = periods.filter((p) => errors[p.period])

  return (
    <div className="space-y-3">
      {value.periods.length > 1 && (
        <div role="group" aria-label="Periodos del año" className="flex flex-wrap gap-2">
          {groups.map((g) => {
            const isActive = g === group
            const missing = g.some((n) => errors[n])
            return (
              <button
                key={g[0]}
                type="button"
                aria-pressed={isActive}
                onClick={() => setPicked(g[0])}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-border ${
                  isActive
                    ? 'bg-brand text-on-brand shadow-sm'
                    : missing
                      ? 'border border-danger bg-surface text-danger hover:bg-danger-surface'
                      : 'border border-border bg-surface text-fg hover:bg-surface-raised'
                }`}
              >
                {formatList(g.map((n) => names[n - 1]))}
              </button>
            )
          })}
        </div>
      )}

      <div className="space-y-2">
        <div className={HEADER_COLUMNS[periods.length]}>
          <span className="justify-self-center whitespace-nowrap text-center text-[13px] font-medium text-fg">Último dígito (sin DV)</span>
          {periods.map((p) => (
            <span key={p.period} className="text-center text-[13px] font-medium text-fg">
              {names[p.period - 1]}
            </span>
          ))}
        </div>

        <div className="space-y-1">
          {DIGITS.map((d, i) => (
            <div
              key={d}
              className={`${COLUMNS[periods.length]} rounded-lg px-2 py-1.5 ${i % 2 === 0 ? 'bg-brand-surface' : 'bg-surface'}`}
            >
              <span className="mx-auto flex size-7 items-center justify-center rounded-md border border-border bg-surface text-sm font-medium tabular-nums text-fg">
                {d}
              </span>
              {periods.map((p) => (
                <Input
                  key={p.period}
                  type="date"
                  aria-label={`${names[p.period - 1]}, último dígito ${d}`}
                  disabled={!editable}
                  value={p.dates[d] ?? ''}
                  className= 'mx-auto max-w-60'
                  onChange={(e) => onChange(withDate(value, p.period, d, e.target.value))}
                />
              ))}
            </div>
          ))}
        </div>

        {incomplete.length > 0 && (
          <p role="alert" className="text-xs text-danger">
            {errors[incomplete[0].period]}
          </p>
        )}
      </div>
    </div>
  )
}
