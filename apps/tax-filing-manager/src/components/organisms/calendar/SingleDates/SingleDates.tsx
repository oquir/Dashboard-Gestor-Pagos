import { PERIOD_NAMES } from '../../../../constants'
import { withDate } from '../../../../lib'
import { Input } from '../../../atoms'
import { Field } from '../../../molecules'
import { PERIOD_GRID } from './SingleDates.constants'
import type { SingleDatesProps } from './SingleDates.types'

export default function SingleDates({ value, onChange, editable, errors }: SingleDatesProps) {
  const names = PERIOD_NAMES[value.frequency]

  return (
    <div className={PERIOD_GRID[value.frequency]}>
      {value.periods.map((p) => (
        <div key={p.period} className="rounded-lg border border-border bg-brand-surface p-3">
          <Field label={names[p.period - 1]} error={errors[p.period]}>
            <Input
              type="date"
              disabled={!editable}
              value={p.dates[0] ?? ''}
              onChange={(e) => onChange(withDate(value, p.period, 0, e.target.value))}
            />
          </Field>
        </div>
      ))}
    </div>
  )
}