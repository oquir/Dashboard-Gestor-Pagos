import { number, formatPesos, UVT } from '../../../../lib'
import type { MunicipalityConfig } from '../../../../types'
import { Input, Select } from '../../../atoms'
import { Field, Toggle, Section } from '../../../molecules'
import { WITHHOLDING_INFO } from './WithholdingSection.constants'
import type { WithholdingSectionProps } from './WithholdingSection.types'

/** ReteICA y AutoReteICA: tarifas y bases mínimas. La periodicidad va en la página Calendario. Muestra solo lo que el municipio tiene activo. */
export default function WithholdingSection({
  b,
  change,
  editable,
  taxes,
}: WithholdingSectionProps) {
  const title =
    taxes.reteica && taxes.selfWithholding
      ? 'ReteICA y AutoReteICA'
      : taxes.reteica
        ? 'Retención (ReteICA)'
        : 'Autorretención (AutoReteICA)'

  return (
    <Section
      title={title}
      description="No hay formulario nacional: cada municipio define el suyo. La periodicidad y los vencimientos se ponen en Calendario."
    >
      {taxes.reteica && (
        <>
          <Field label="Tarifa de ReteICA" info={WITHHOLDING_INFO.reteicaModality}>
            <Select
              disabled={!editable}
              value={b.reteica.modality}
              onChange={(e) =>
                change({
                  reteica: {
                    ...b.reteica,
                    modality: e.target.value as MunicipalityConfig['reteica']['modality'],
                  },
                })
              }
            >
              <option value="flat">Tarifa única</option>
              <option value="activity">Por actividad del proveedor</option>
              <option value="concept">Por concepto (compras / servicios)</option>
            </Select>
          </Field>
          {b.reteica.modality === 'flat' && (
            <Field label="Tarifa única (por mil)">
              <Input
                type="number"
                step="0.1"
                min={0}
                disabled={!editable}
                value={b.reteica.flatRatePerThousand}
                onChange={(e) =>
                  change({ reteica: { ...b.reteica, flatRatePerThousand: number(e.target.value) } })
                }
              />
            </Field>
          )}
          <Field
            label="Base mínima de servicios (UVT)"
            help={formatPesos(b.reteica.minServiceBaseUvt * UVT)}
            info={WITHHOLDING_INFO.minBase}
          >
            <Input
              type="number"
              min={0}
              disabled={!editable}
              value={b.reteica.minServiceBaseUvt}
              onChange={(e) =>
                change({
                  reteica: { ...b.reteica, minServiceBaseUvt: number(e.target.value) },
                })
              }
            />
          </Field>
          <Field
            label="Base mínima de compras (UVT)"
            help={formatPesos(b.reteica.minPurchaseBaseUvt * UVT)}
            info={WITHHOLDING_INFO.minBase}
          >
            <Input
              type="number"
              min={0}
              disabled={!editable}
              value={b.reteica.minPurchaseBaseUvt}
              onChange={(e) =>
                change({ reteica: { ...b.reteica, minPurchaseBaseUvt: number(e.target.value) } })
              }
            />
          </Field>
        </>
      )}
      {taxes.selfWithholding && (
        <>
          <Field label="Tarifa de AutoReteICA" info={WITHHOLDING_INFO.selfWithholdingModality}>
            <Select
              disabled={!editable}
              value={b.selfWithholding.modality}
              onChange={(e) =>
                change({
                  selfWithholding: {
                    ...b.selfWithholding,
                    modality: e.target.value as MunicipalityConfig['selfWithholding']['modality'],
                  },
                })
              }
            >
              <option value="full">Tarifa plena del ICA</option>
              <option value="percentage">Porcentaje de la tarifa</option>
            </Select>
          </Field>
          {b.selfWithholding.modality === 'percentage' && (
            <Field label="Porcentaje de la tarifa (%)">
              <Input
                type="number"
                min={0}
                max={100}
                disabled={!editable}
                value={b.selfWithholding.percentage}
                onChange={(e) =>
                  change({
                    selfWithholding: { ...b.selfWithholding, percentage: number(e.target.value) },
                  })
                }
              />
            </Field>
          )}
        </>
      )}
      <Toggle
        label="Exige declaración en ceros"
        help="Si no, un agente sin retenciones en el periodo no declara y no se marca como omiso."
        info={WITHHOLDING_INFO.zeroDeclaration}
        value={b.zeroDeclaration}
        isDisabled={!editable}
        onChange={(v) => change({ zeroDeclaration: v })}
      />
      <Toggle
        label="Plazo de 2 meses para pagar"
        help="La declaración presentada a tiempo no queda ineficaz si se paga completa dentro de los 2 meses siguientes al vencimiento."
        info={WITHHOLDING_INFO.paymentInTwoMonths}
        value={b.withholdingPaymentInTwoMonths}
        isDisabled={!editable}
        onChange={(v) => change({ withholdingPaymentInTwoMonths: v })}
      />
    </Section>
  )
}
