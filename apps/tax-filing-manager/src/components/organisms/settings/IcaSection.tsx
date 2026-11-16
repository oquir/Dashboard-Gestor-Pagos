import { number, MAX_ADVANCE } from '../../../lib'
import type { SettingsEdit } from '../../../types'
import { Input } from '../../atoms'
import { Field, Toggle, Section } from '../../molecules'

/** ICA anual: anticipo y sobretasa bomberil. El descuento por pronto pago está en la página Calendario. */
export default function IcaSection({ b, change, editable, errors }: SettingsEdit) {
  return (
    <Section
      title="ICA anual"
      description="Cobros que fija el concejo municipal. El descuento por pronto pago se pone en Calendario."
    >
      <Field
        label="Anticipo del año siguiente (%)"
        help="0 si el municipio no lo exige."
        error={errors.anticipo}
      >
        <Input
          type="number"
          min={0}
          max={MAX_ADVANCE}
          disabled={!editable}
          value={b.advancePercentage}
          onChange={(e) => change({ advancePercentage: number(e.target.value) })}
        />
      </Field>
      <div className="space-y-3">
        <Toggle
          label="Sobretasa bomberil"
          help="Se cobra en el renglón 23 como porcentaje del impuesto de industria y comercio."
          value={b.fireSurcharge.active}
          isDisabled={!editable}
          onChange={(v) => change({ fireSurcharge: { ...b.fireSurcharge, active: v } })}
        />
        {b.fireSurcharge.active && (
          <div className="ml-12">
            <Field label="Porcentaje de la sobretasa (% del ICA)" error={errors.sobretasa}>
              <Input
                type="number"
                min={0}
                step="0.1"
                disabled={!editable}
                value={b.fireSurcharge.percentage}
                onChange={(e) =>
                  change({
                    fireSurcharge: {
                      ...b.fireSurcharge,
                      percentage: number(e.target.value),
                    },
                  })
                }
              />
            </Field>
          </div>
        )}
      </div>
    </Section>
  )
}
