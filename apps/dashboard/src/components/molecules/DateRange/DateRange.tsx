import { today } from '../../../utils'
import { Input } from '../../atoms'
import Field from '../Field'
import type { DateRangeProps } from './DateRange.types'

/** Fechas desde y hasta, sin pasar de hoy. */
export default function DateRange({ from, to, changeFrom, changeTo }: DateRangeProps) {
  return (
    <>
      <Field label="Desde" error={from > to ? 'Debe ser anterior a la fecha final.' : undefined}>
        <Input
          type="date"
          max={to || today()}
          value={from}
          onChange={(e) => changeFrom(e.target.value)}
        />
      </Field>
      <Field label="Hasta">
        <Input
          type="date"
          min={from}
          max={today()}
          value={to}
          onChange={(e) => changeTo(e.target.value)}
        />
      </Field>
    </>
  )
}
