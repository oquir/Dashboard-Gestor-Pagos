import { useMemo } from 'react'
import { Notice, PageHeader, StatTile } from '../components/molecules'
import {
  MunicipalitySearch,
  AsobancariaUpload,
  ChecksInClearing,
  AsobancariaDownload,
  BarChart,
  UnremittedWithholdings,
  ReceivablesTable,
  ReceivedPaymentsTable,
} from '../components/organisms'
import {
  compactFormat,
  can,
  currentCorrection,
  replaced,
  totalPaid,
  asobancariaUploadVisible,
  visibleChecks,
  TAXES,
  visibleTaxes,
  acceptsChecks,
  useDeclarations,
  usePaymentStatus,
  useSession,
  useUnremitted,
  useCorrectionApplication,
  useCanSeeCollection,
} from '../lib'
import { useData } from '../store'
import type {
  Bar,
  Declaration,
  ReceivablesRow,
  CheckRow,
  PaymentRow,
  UnremittedRow,
  Municipality,
} from '../types'

export default function Payments() {
  const declarations = useDeclarations()
  const payments = useData((s) => s.payments)
  const checks = useData((s) => s.checks)
  const statusOf = usePaymentStatus()
  const correction = useCorrectionApplication()
  const withholdings = useUnremitted()
  const canSeeCollection = useCanSeeCollection()
  const { user, municipalityId } = useSession()
  const municipalities = useData((s) => s.municipalities)
  const canSeeUpload = asobancariaUploadVisible(municipalities, municipalityId)
  const withWithholding = visibleTaxes(municipalities, municipalityId).some((i) => i !== 'ica')
  // Si 1cero1 no eligió un municipio, las tablas no dicen de cuál es cada fila: en su lugar van gráficas por municipio.
  const all = municipalityId === null

  const data = useMemo(() => {
    const byId = new Map(declarations.map((d) => [d.id, d]))
    // Ni lo reemplazado por una corrección ni las solicitudes de corrección que no se han aceptado son cartera.
    const outside = replaced(declarations, correction)

    const receivables: ReceivablesRow[] = declarations
      .filter((d) => !outside.has(d.id) && currentCorrection(correction(d)))
      .map((d) => ({
        d,
        status: statusOf(d),
        paidAmount: totalPaid(d.id, payments),
        name: d.taxpayer.name,
      }))
      .filter(
        (f) => f.status === 'partial' || f.status === 'no_payment' || f.status === 'ineffective',
      )

    const received: PaymentRow[] = payments.flatMap((p) => {
      const d = byId.get(p.declarationId)
      return d ? [{ p, d, name: d.taxpayer.name }] : []
    })

    const inClearing: CheckRow[] = checks.flatMap((c) => {
      const d = byId.get(c.declarationId)
      return d && c.status === 'in_clearing' ? [{ c, d, name: d.taxpayer.name }] : []
    })

    const unremitted: UnremittedRow[] = withholdings.map((r) => ({
      ...r,
      name: r.d.taxpayer.name,
    }))
    return {
      receivables,
      received,
      inClearing,
      unremitted,
      overdueOnes: withholdings.filter((r) => r.days < 0).length,
      collection2026: received
        .filter((r) => r.p.date.startsWith('2026'))
        .reduce((s, r) => s + r.p.value, 0),
      icaBalance: receivables
        .filter((f) => f.d.tax === 'ica')
        .reduce((s, f) => s + f.d.totalToPay - f.paidAmount, 0),
      unremittedBalance: withholdings.reduce((s, r) => s + r.balance, 0),
    }
  }, [declarations, payments, checks, statusOf, correction, withholdings])

  return (
    <>
      <PageHeader
        title="Pagos"
        description="Recaudo y cartera. En el ICA anual el pago puede ser parcial; en ReteICA y AutoReteICA solo el pago total le da efecto a la declaración."
      />
      <MunicipalitySearch />

      <div className={`grid gap-4 ${canSeeCollection ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
        {canSeeCollection && (
          <StatTile
            label="Recaudado en 2026"
            isPositive
            value={`$${compactFormat(data.collection2026)}`}
            detail={`${data.received.length} pagos registrados`}
          />
        )}
        <StatTile
          label="Saldo pendiente de ICA anual"
          value={`$${compactFormat(data.icaBalance)}`}
          detail="Pagos parciales y declaraciones sin pago"
        />
        <StatTile
          label="Retenciones sin consignar"
          value={String(data.unremitted.length)}
          detail={
            data.unremitted.length === 0 ? (
              'Todo lo retenido está consignado'
            ) : (
              <>
                ${compactFormat(data.unremittedBalance)} ·{' '}
                {data.overdueOnes > 0 ? (
                  <span className="text-danger-fg">
                    {data.overdueOnes === 1 ? '1 pasó' : `${data.overdueOnes} pasaron`} los 2 meses
                  </span>
                ) : (
                  'dentro del plazo'
                )}
              </>
            )
          }
        />
      </div>

      {all ? (
        <>
          <div className="mt-6">
            <Notice tone="info">
              Elige un municipio arriba para ver el detalle de sus pagos, su cartera, sus
              retenciones y sus cheques, y para cargar o descargar el Asobancaria.
            </Notice>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <BarChart
              title="Pagos recibidos por municipio"
              description="Suma de los pagos registrados."
              format="pesos"
              bars={barsByMunicipality(
                municipalities.filter((m) => TAXES.some((i) => m.taxes[i])),
                data.received,
                (f) => f.p.value,
              )}
            />
            <BarChart
              title="Cartera pendiente por municipio"
              description="Saldo de las declaraciones sin pago, con pago parcial o ineficaces."
              format="pesos"
              bars={barsByMunicipality(
                municipalities.filter((m) => TAXES.some((i) => m.taxes[i])),
                data.receivables,
                (f) => f.d.totalToPay - f.paidAmount,
              )}
            />
            {withWithholding && (
              <BarChart
                title="Retenciones sin consignar por municipio"
                description="Saldo de ReteICA y AutoReteICA que falta consignar."
                format="pesos"
                bars={barsByMunicipality(
                  municipalities.filter((m) => m.taxes.reteica || m.taxes.selfWithholding),
                  data.unremitted,
                  (f) => f.balance,
                )}
              />
            )}
            {(visibleChecks(municipalities, municipalityId) || data.inClearing.length > 0) && (
              <BarChart
                title="Cheques en canje por municipio"
                description="Valor de los cheques de gerencia que esperan la respuesta del banco."
                format="pesos"
                bars={barsByMunicipality(
                  municipalities.filter(
                    (m) =>
                      acceptsChecks(m) || data.inClearing.some((f) => f.d.municipalityId === m.id),
                  ),
                  data.inClearing,
                  (f) => f.c.value,
                )}
              />
            )}
          </div>
        </>
      ) : (
        <>
          {withWithholding && (
            <div className="mt-6">
              <UnremittedWithholdings rows={data.unremitted} />
            </div>
          )}

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {canSeeUpload && <AsobancariaUpload />}
            <AsobancariaDownload declarations={declarations} />
          </div>

          <div className="mt-6 space-y-6">
            {/* Si 1cero1 quita los cheques, los que quedaron en canje se siguen resolviendo. */}
            {(visibleChecks(municipalities, municipalityId) || data.inClearing.length > 0) && (
              <ChecksInClearing
                checks={data.inClearing}
                canResolve={can(user?.role, 'recordTellerPayment')}
              />
            )}
            <ReceivablesTable receivables={data.receivables} />
            <ReceivedPaymentsTable payments={data.received} />
          </div>
        </>
      )}
    </>
  )
}

/** Una barra por municipio con la suma de sus filas, de mayor a menor. */
function barsByMunicipality<T extends { d: Declaration }>(
  municipalities: Municipality[],
  rows: T[],
  value: (f: T) => number,
): Bar[] {
  return municipalities
    .map((m) => ({
      label: m.name,
      value: rows.filter((f) => f.d.municipalityId === m.id).reduce((s, f) => s + value(f), 0),
    }))
    .sort((a, b) => b.value - a.value)
}
