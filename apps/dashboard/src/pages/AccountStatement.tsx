import { useMemo } from 'react'
import { useParams } from 'react-router'
import { EmptyState, StatTile } from '../components/molecules'
import {
  DeclarationTaxpayer,
  IcaStatementTable,
  PaymentHistory,
  WithholdingStatementTable,
} from '../components/organisms'
import { TemplateDetail } from '../components/templates'
import {
  activeTax,
  buildStatement,
  documentFormat,
  formatPesos,
  sameTaxpayer,
  useApproval,
  useCorrectionApplication,
  usePaymentStatus,
  useSession,
  withRit,
} from '../lib'
import { useData } from '../store'

/**
 * Lo que debe un contribuyente: el ICA por vigencia, sus retenciones aparte y todos sus pagos. Se le reconoce por su
 * documento, porque donde no hay RIT, o no está inscrito, no hay inscripción (docs/Pendientes-y-decisiones.md §3.16).
 */
export default function AccountStatement() {
  const { municipalityId, documentType, document: documentNumber } = useParams()
  const { user } = useSession()
  const declarations = useData((s) => s.declarations)
  const payments = useData((s) => s.payments)
  const checks = useData((s) => s.checks)
  const registrations = useData((s) => s.registrations)
  const municipalities = useData((s) => s.municipalities)
  const statusOf = usePaymentStatus()
  const approval = useApproval()
  const correction = useCorrectionApplication()

  const statement = useMemo(() => {
    if (!municipalityId || !documentType || !documentNumber) return null
    const ofTaxpayer = sameTaxpayer({ documentType, document: documentNumber })
    return buildStatement({
      declarations: declarations
        .filter((d) => d.municipalityId === municipalityId && ofTaxpayer(d))
        .filter(activeTax(municipalities)),
      payments,
      checks,
      statusOf,
      approval,
      correction,
    })
  }, [
    municipalityId,
    documentType,
    documentNumber,
    declarations,
    payments,
    checks,
    municipalities,
    statusOf,
    approval,
    correction,
  ])

  if (!statement || (user?.municipalityId && municipalityId !== user.municipalityId)) {
    return (
      <EmptyState
        title="No se encontró el contribuyente"
        description="Puede que no tenga declaraciones o que sea de otro municipio."
      />
    )
  }

  const { latest, ica, withholdings, movements, totals } = statement
  const municipality = municipalities.find((m) => m.id === municipalityId)
  const withRitCard = withRit(municipalities)(latest)
  // Su ficha del RIT, si el municipio lo tiene en el aplicativo y el contribuyente está inscrito.
  const registration = withRitCard
    ? registrations.find(
        (i) =>
          i.municipalityId === municipalityId &&
          i.documentType === latest.taxpayer.documentType &&
          i.document === latest.taxpayer.document,
      )
    : undefined
  const withBalance = ica.filter((r) => r.payable && r.balance > 0).length

  return (
    <TemplateDetail
      goBack={{ a: '/declaraciones', text: 'Declaraciones' }}
      title={latest.taxpayer.name}
      description={`Estado de cuenta · ${documentFormat(latest.taxpayer)} · ${municipality?.name}`}
      main={
        <>
          {municipality?.taxes.ica && (
            <>
              <div className="grid gap-4 sm:grid-cols-3">
                <StatTile
                  label="Total a pagar del ICA"
                  value={formatPesos(totals.toPay)}
                  detail="De la declaración vigente de cada año"
                />
                <StatTile label="Pagado" value={formatPesos(totals.paid)} />
                <StatTile
                  label="Saldo pendiente"
                  value={formatPesos(totals.balance)}
                  detail={
                    withBalance > 0
                      ? `En ${withBalance} ${withBalance === 1 ? 'vigencia' : 'vigencias'}`
                      : 'Sin saldo pendiente'
                  }
                />
              </div>
              <IcaStatementTable rows={ica} />
            </>
          )}
          {withholdings.length > 0 && <WithholdingStatementTable rows={withholdings} />}
          <PaymentHistory movements={movements} />
        </>
      }
      side={
        <DeclarationTaxpayer
          d={latest}
          reg={registration}
          unregistered={withRitCard && !registration}
          description="Los datos de la declaración más reciente."
          statementLink={false}
        />
      }
    />
  )
}
