import { number, taxLabel } from '../../../../lib'
import type { MunicipalityConfig } from '../../../../types'
import { Input, Select } from '../../../atoms'
import { Field, Section } from '../../../molecules'
import { PRIOR_APPROVAL_INFO } from './PriorApprovalSection.constants'
import type { PriorApprovalSectionProps } from './PriorApprovalSection.types'

/** Plazos de la aprobación previa en los formularios donde 1cero1 la activó. */
export default function PriorApprovalSection({
  b,
  change,
  editable,
  errors,
  taxes,
}: PriorApprovalSectionProps) {
  const approval = b.priorApproval

  return (
    <Section
      title="Aprobación previa"
      description={`Activa en ${taxes.map((i) => taxLabel[i]).join(', ')} (la activa 1cero1). El contribuyente paga cuando el municipio aprueba; descuento, sanciones e intereses se liquidan con la fecha de radicación.`}
    >
      <Field
        label="Plazo para aprobar (días hábiles)"
        help="Cuenta desde la radicación. Si se radicó a tiempo, no pasa del vencimiento."
        error={errors.plazoAprobacion}
      >
        <Input
          type="number"
          min={1}
          disabled={!editable}
          value={approval.termBusinessDays}
          onChange={(e) =>
            change({
              priorApproval: { ...approval, termBusinessDays: number(e.target.value) },
            })
          }
        />
      </Field>
      <Field label="Si se vence el plazo sin revisión" info={PRIOR_APPROVAL_INFO.onDue}>
        <Select
          disabled={!editable}
          value={approval.onDue}
          onChange={(e) =>
            change({
              priorApproval: {
                ...approval,
                onDue: e.target.value as MunicipalityConfig['priorApproval']['onDue'],
              },
            })
          }
        >
          <option value="approve">Se aprueba automáticamente y se envía el correo</option>
          <option value="warn">Sigue por aprobar y se alerta como vencida</option>
        </Select>
      </Field>
      <Field
        label="Vigencia del recibo (días hábiles)"
        help="Desde la aprobación. Si paga dentro de este plazo, conserva las condiciones de la radicación, como el descuento por pronto pago."
        error={errors.vigenciaRecibo}
      >
        <Input
          type="number"
          min={1}
          disabled={!editable}
          value={approval.receiptValidityBusinessDays}
          onChange={(e) =>
            change({
              priorApproval: {
                ...approval,
                receiptValidityBusinessDays: number(e.target.value),
              },
            })
          }
        />
      </Field>
    </Section>
  )
}
