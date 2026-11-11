import { DIGITS, PERIOD_NAMES } from '../../../../constants'
import { withDate, withFrequency, withByDigit, frequencyLabel } from '../../../../lib'
import type { Frequency } from '../../../../types'
import { Input, Select } from '../../../atoms'
import { Notice, Field, Toggle } from '../../../molecules'
import { WITHHOLDING_FREQUENCIES } from './DueDatesTable.constants'
import type { DueDatesTableProps } from './DueDatesTable.types'

/**
 * Vencimientos de un formulario en un año gravable: una fecha por periodo o, si el municipio las separa por el
 * último dígito del NIT o la cédula, una tabla con un renglón por dígito y una columna por periodo. El dígito
 * siempre es sin el de verificación (DV), y la pantalla lo dice: los municipios se confunden con eso.
 */
export default function DueDatesTable({
  title,
  description,
  value,
  onChange,
  editable,
  errors,
  frequencyNotice,
}: DueDatesTableProps) {
  const firstNames = PERIOD_NAMES[value.frequency]

  return (
    <div className="space-y-4 rounded-lg border border-slate-200 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
        {value.frequency !== 'annual' && (
          <Field label="Periodicidad" help="Al cambiarla, las fechas quedan vacías.">
            <Select
              disabled={!editable}
              value={value.frequency}
              onChange={(e) => onChange(withFrequency(value, e.target.value as Frequency))}
            >
              {WITHHOLDING_FREQUENCIES.map((p) => (
                <option key={p} value={p}>
                  {frequencyLabel[p]}
                </option>
              ))}
            </Select>
          </Field>
        )}
      </div>

      {frequencyNotice && (
        <Notice tone="alert" role="alert">
          {frequencyNotice}
        </Notice>
      )}

      <Toggle
        label="La fecha cambia según el último dígito del NIT o la cédula"
        help="Sin el dígito de verificación (DV). Encendido, se pone una fecha para cada dígito, del 1 al 0."
        value={value.byDigit}
        isDisabled={!editable}
        onChange={(v) => onChange(withByDigit(value, v))}
      />

      {value.byDigit ? (
        <div className="space-y-3">
          <Notice tone="info">
            El dígito es el último del NIT o de la cédula{' '}
            <strong>sin el dígito de verificación (DV)</strong>. Por ejemplo, en el NIT
            900.123.456-7 cuenta el 6, no el 7; en la cédula 43.567.891, el 1.
          </Notice>
          <div className="overflow-x-auto">
            <table className="text-sm">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="px-2 pb-1 text-left text-xs font-medium text-slate-500"
                  >
                    Último dígito (sin DV)
                  </th>
                  {value.periods.map((p) => (
                    <th
                      key={p.period}
                      scope="col"
                      className="min-w-40 px-1 pb-1 text-left text-xs font-medium text-slate-700"
                    >
                      {firstNames[p.period - 1]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DIGITS.map((d) => (
                  <tr key={d}>
                    <th
                      scope="row"
                      className="px-2 py-1 text-left font-medium tabular-nums text-slate-700"
                    >
                      {d}
                    </th>
                    {value.periods.map((p) => (
                      <td key={p.period} className="px-1 py-1">
                        <Input
                          type="date"
                          aria-label={`${firstNames[p.period - 1]}, último dígito ${d}`}
                          disabled={!editable}
                          value={p.dates[d] ?? ''}
                          onChange={(e) => onChange(withDate(value, p.period, d, e.target.value))}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              {value.periods.some((p) => errors[p.period]) && (
                <tfoot>
                  <tr>
                    <td />
                    {value.periods.map((p) => (
                      <td key={p.period} className="px-1 pt-1 align-top text-xs text-red-600">
                        {errors[p.period]}
                      </td>
                    ))}
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {value.periods.map((p) => (
            <Field key={p.period} label={firstNames[p.period - 1]} error={errors[p.period]}>
              <Input
                type="date"
                disabled={!editable}
                value={p.dates[0] ?? ''}
                onChange={(e) => onChange(withDate(value, p.period, 0, e.target.value))}
              />
            </Field>
          ))}
        </div>
      )}
    </div>
  )
}
