//import { PERIOD_NAMES } from '../../../../constants'
import {  withFrequency, withByDigit, frequencyLabel } from '../../../../lib'
import type { Frequency } from '../../../../types'
import {  Select } from '../../../atoms'
import { Notice, Field, Toggle } from '../../../molecules'
import ByDigitDates from '../ByDigitDates'
import SingleDates from '../SingleDates'
import { FREQUENCY_INFO, WITHHOLDING_FREQUENCIES } from './DueDatesTable.constants'
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


  return (
    <div className="space-y-4 rounded-lg border border-border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-fg-strong">{title}</h3>
          <p className="text-xs text-fg-muted">{description}</p>
        </div>
        {value.frequency !== 'annual' && (
          <Field
            label="Periodicidad"
            help="Al cambiarla, las fechas quedan vacías."
            info={FREQUENCY_INFO}
          >
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
          <ByDigitDates
            key={value.frequency}
            value={value}
            onChange={onChange}
            editable={editable}
            errors={errors}
          />
        </div>
      ) : (
         <SingleDates value={value} onChange={onChange} editable={editable} errors={errors} />
      )}
    </div>
  )
}
