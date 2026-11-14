import { Plus, Xmark } from 'reicon-react'
import { useState } from 'react'
import { FISCAL_YEAR_INFO, ONGOING_YEAR } from '../../../../constants'
import { number, newTier } from '../../../../lib'
import type { SettingsEdit, EarlyPaymentTier } from '../../../../types'
import { shiftYears } from '../../../../utils'
import { Button, Input, Select } from '../../../atoms'
import { Field, Toggle, Section } from '../../../molecules'
import { TIER_COLUMNS } from './EarlyPaymentSection.constants'

/** Si el municipio da descuento por pronto pago en el ICA anual y, si lo da, sus tramos en cada año gravable. */
export default function EarlyPaymentSection({ b, change, editable, errors }: SettingsEdit) {
  const value = b.earlyPayment
  const fiscalYears = value.byFiscalYear.map((v) => v.fiscalYear).sort((x, y) => y - x)
  const [picked, setPicked] = useState<number>()
  // Por defecto, el año gravable que se está declarando.
  const fiscalYear =
    picked !== undefined && fiscalYears.includes(picked)
      ? picked
      : fiscalYears.includes(ONGOING_YEAR - 1)
        ? ONGOING_YEAR - 1
        : fiscalYears[0]
  const tiers = value.byFiscalYear.find((v) => v.fiscalYear === fiscalYear)?.tiers ?? []
  const withErrors = (v: number) =>
    Object.keys(errors).some((key) => key.startsWith(`pronto-${v}-`))

  const changeTiers = (newOnes: EarlyPaymentTier[]) =>
    change({
      earlyPayment: {
        ...value,
        byFiscalYear: value.byFiscalYear.map((v) =>
          v.fiscalYear === fiscalYear ? { ...v, tiers: newOnes } : v,
        ),
      },
    })
  const changeTier = (i: number, partial: Partial<EarlyPaymentTier>) =>
    changeTiers(tiers.map((t, j) => (j === i ? { ...t, ...partial } : t)))

  // El año nuevo copia los tramos del último, corridos un año: los concejos suelen repetir el esquema.
  const addFiscalYear = () => {
    const lastOne = fiscalYears[0]
    const newItem = lastOne === undefined ? ONGOING_YEAR - 1 : lastOne + 1
    const copy = (value.byFiscalYear.find((v) => v.fiscalYear === lastOne)?.tiers ?? []).map(
      (t) => ({
        ...t,
        from: shiftYears(t.from, 1),
        to: shiftYears(t.to, 1),
      }),
    )
    change({
      earlyPayment: {
        ...value,
        byFiscalYear: [
          ...value.byFiscalYear,
          { fiscalYear: newItem, tiers: copy.length > 0 ? copy : [newTier(newItem, [])] },
        ],
      },
    })
    setPicked(newItem)
  }
  const removeFiscalYear = () => {
    change({
      earlyPayment: {
        ...value,
        byFiscalYear: value.byFiscalYear.filter((v) => v.fiscalYear !== fiscalYear),
      },
    })
    setPicked(undefined)
  }

  return (
    <Section
      title="Descuento por pronto pago"
      description="Fechas de pago y porcentaje de descuento del ICA anual en cada año gravable. Solo sobre el impuesto neto; se pierde con pago parcial o extemporáneo."
    >
      <div className="sm:col-span-2">
        <Toggle
          label="El municipio da descuento por pronto pago"
          help="Lo fija el concejo para cada año gravable; por fuera de los tramos no hay descuento."
          value={value.isActive}
          isDisabled={!editable}
          onChange={(isActive) => change({ earlyPayment: { ...value, isActive } })}
        />
      </div>
      {value.isActive && (
        <div className="space-y-4 sm:col-span-2">
          <div className="flex flex-wrap items-end gap-3">
            {fiscalYear !== undefined && (
              <Field label="Año gravable" info={FISCAL_YEAR_INFO}>
                <Select value={fiscalYear} onChange={(e) => setPicked(Number(e.target.value))}>
                  {fiscalYears.map((v) => (
                    <option key={v} value={v}>
                      Año gravable {v}
                      {withErrors(v) ? ' (revisar)' : ''}
                    </option>
                  ))}
                </Select>
              </Field>
            )}
            {editable && (
              <Button onClick={addFiscalYear}>
                <Plus className="size-4" aria-hidden /> Agregar año gravable
              </Button>
            )}
            {editable && fiscalYear !== undefined && (
              <Button variant="ghost" onClick={removeFiscalYear}>
                <Xmark className="size-4" aria-hidden /> Quitar {fiscalYear}
              </Button>
            )}
          </div>

          {fiscalYear === undefined ? (
            <p className="text-sm text-fg-muted">Aún no hay años gravables con descuento.</p>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-fg-muted">
                El año gravable {fiscalYear} se declara en {fiscalYear + 1}. El descuento depende de
                la fecha de pago; por fuera de estos tramos no hay descuento.
              </p>
              {tiers.length === 0 ? (
                <p className="text-sm text-fg-muted">
                  Sin tramos: este año gravable no tiene descuento.
                </p>
              ) : (
                <div className={`${TIER_COLUMNS} text-xs font-medium text-fg-muted`}>
                  <span>Pago desde</span>
                  <span>Pago hasta</span>
                  <span>Descuento (%)</span>
                </div>
              )}
              {tiers.map((t, i) => {
                const error = errors[`pronto-${fiscalYear}-${i}`]
                return (
                  <div key={i}>
                    <div className={`${TIER_COLUMNS} items-center`}>
                      <Input
                        type="date"
                        aria-label={`Inicio del tramo ${i + 1}`}
                        disabled={!editable}
                        value={t.from}
                        onChange={(e) => changeTier(i, { from: e.target.value })}
                      />
                      <Input
                        type="date"
                        aria-label={`Fin del tramo ${i + 1}`}
                        disabled={!editable}
                        value={t.to}
                        onChange={(e) => changeTier(i, { to: e.target.value })}
                      />
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        aria-label={`Descuento del tramo ${i + 1}`}
                        disabled={!editable}
                        value={t.percentage}
                        onChange={(e) => changeTier(i, { percentage: number(e.target.value) })}
                      />
                      {editable && (
                        <Button
                          variant="ghost"
                          className="px-2"
                          aria-label={`Quitar el tramo ${i + 1}`}
                          onClick={() => changeTiers(tiers.filter((_, j) => j !== i))}
                        >
                          <Xmark className="size-4" aria-hidden />
                        </Button>
                      )}
                    </div>
                    {error && <p className="mt-1 text-xs text-danger">{error}</p>}
                  </div>
                )
              })}
              {editable && (
                <Button onClick={() => changeTiers([...tiers, newTier(fiscalYear, tiers)])}>
                  <Plus className="size-4" aria-hidden /> Agregar tramo
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </Section>
  )
}
