import {
  ClipboardList,
  Document,
  AlertTriangle,
  ReceiptMinus,
  UserSearch,
  Wallet,
} from 'reicon-react'
import { useMemo } from 'react'
import { Link } from 'react-router'
import { StatTile } from '../../components/molecules'
import {
  CalendarAlert,
  UnremittedAlert,
  PendingApprovals,
  MunicipalitySearch,
  DebtList,
  UpcomingDueDates,
  AnnualCollection,
  PendingApplications,
} from '../../components/organisms'
import {
  compactFormat,
  formatDate,
  can,
  correctionToResolve,
  currentCorrection,
  awaitsApproval,
  replaced,
  canBePaid,
  totalPaid,
  approvalVisible,
  withRit,
  ofMunicipality,
  ritVisible,
  correctionApplicationVisible,
  useApproval,
  useDeclarations,
  usePaymentStatus,
  useNonFilers,
  useSession,
  useWithoutCalendar,
  useUnremitted,
  useCorrectionApplication,
  useCanSeeCollection,
} from '../../lib'
import { useData } from '../../store'
import type { Debt } from '../../types'
import { dayDifference, today } from '../../utils'
import { CURRENT_YEAR, CARD_COLUMNS } from './Home.constants'

export default function Home() {
  const { user, municipalityId } = useSession()
  const allRegistrations = useData((s) => s.registrations)
  const declarations = useDeclarations()
  const municipalities = useData((s) => s.municipalities)
  const settingsList = useData((s) => s.settingsList)
  const payments = useData((s) => s.payments)
  const approval = useApproval()
  const correction = useCorrectionApplication()
  const statusOf = usePaymentStatus()
  const unremitted = useUnremitted()
  const withoutCalendar = useWithoutCalendar()
  const withRitVisible = ritVisible(municipalities, municipalityId)
  const canSeeCollection = useCanSeeCollection()
  const { nonFilers } = useNonFilers()
  const nonFilingTaxpayers = new Set(nonFilers.map((o) => o.registration.id)).size

  const data = useMemo(() => {
    const registrations = ofMunicipality(allRegistrations, municipalityId)
    // Las solicitudes solo existen donde el RIT está en el aplicativo.
    const inRit = registrations.filter(withRit(municipalities))
    const byId = new Map(declarations.map((d) => [d.id, d]))

    const pendingOnes = inRit
      .flatMap((reg) =>
        reg.ritChanges.filter((n) => n.status === 'pending').map((n) => ({ reg, ritChange: n })),
      )
      .sort((a, b) => b.ritChange.date.localeCompare(a.ritChange.date))

    const collection = payments
      .filter((p) => byId.has(p.declarationId) && p.date.startsWith(String(CURRENT_YEAR)))
      .reduce((s, p) => s + p.value, 0)
    // Una declaración corregida se reemplaza por su corrección: se cuenta solo la vigente. La solicitud de corrección que
    // no se ha aceptado no cuenta: sigue vigente la que corrige.
    const outside = replaced(declarations, correction)
    const inForceOnes = declarations.filter(
      (d) => !outside.has(d.id) && currentCorrection(correction(d)),
    )
    const paidOnes = inForceOnes.filter((d) => statusOf(d) === 'paid').length

    const debts: Debt[] = inForceOnes
      .filter((d) => d.totalToPay > 0 && canBePaid(approval(d)))
      .map((d) => ({ d, status: statusOf(d), paidAmount: totalPaid(d.id, payments) }))
      .filter((f) => f.paidAmount < f.d.totalToPay)
      .sort((a, b) => b.d.filingDate.localeCompare(a.d.filingDate))
    const unpaid = debts.filter((f) => f.paidAmount === 0)
    const incompletePayment = debts.filter((f) => f.paidAmount > 0)
    const balance = (list: Debt[]) => list.reduce((s, f) => s + f.d.totalToPay - f.paidAmount, 0)

    // Lo pendiente va primero, por plazo; lo resuelto, de lo más reciente a lo más antiguo.
    const approvals = declarations
      .flatMap((d) => {
        const a = approval(d)
        return a ? [{ d, a }] : []
      })
      .sort((x, y) => {
        const [ex, ey] = [awaitsApproval(x.a), awaitsApproval(y.a)]
        if (ex !== ey) return ex ? -1 : 1
        return ex
          ? x.a.limit.localeCompare(y.a.limit)
          : (y.a.date ?? '').localeCompare(x.a.date ?? '')
      })
    const toApprove = approvals.filter((x) => awaitsApproval(x.a))

    // Las solicitudes de corrección a la baja por resolver, de la que vence primero a la última.
    const correctionsToResolve = declarations
      .flatMap((d) => {
        const c = correction(d)
        return c && correctionToResolve(c) ? [{ d, c }] : []
      })
      .sort((x, y) => x.c.limit.localeCompare(y.c.limit))

    return {
      pendingOnes,
      correctionsToResolve,
      unpaid,
      incompletePayment,
      unpaidBalance: balance(unpaid),
      incompletePaymentBalance: balance(incompletePayment),
      collection,
      paidOnes,
      approvals,
      toApprove,
      activeItems: inRit.filter((i) => i.status === 'active').length,
    }
  }, [
    allRegistrations,
    declarations,
    payments,
    municipalities,
    municipalityId,
    approval,
    correction,
    statusOf,
  ])

  // Si 1cero1 apaga la aprobación previa, lo que quedó pendiente se sigue mostrando hasta resolverlo.
  const withApproval = approvalVisible(municipalities, municipalityId) || data.toApprove.length > 0
  const overdueOnes = data.toApprove.filter((x) => x.a.status === 'overdue').length
  // Igual con las solicitudes de corrección a la baja: si el municipio cambia de trámite, las que quedaron se siguen mostrando.
  const withCorrections =
    correctionApplicationVisible(settingsList, municipalityId) ||
    data.correctionsToResolve.length > 0
  const firstCorrection = data.correctionsToResolve[0]
  // Si al municipio se le acaba el plazo, se acepta sola: se avisa en ámbar desde 15 días antes.
  const correctionSoon = firstCorrection && dayDifference(today(), firstCorrection.c.limit) <= 15
  // Con el RIT van dos tarjetas: las solicitudes por revisar y los omisos.
  const cards =
    2 +
    2 * Number(withRitVisible) +
    Number(withApproval) +
    Number(withCorrections) +
    Number(canSeeCollection)
  // Con un número impar de listas, la primera ocupa toda la fila para que las de deuda vayan juntas.
  const firstWide =
    (1 + Number(withRitVisible) + Number(withApproval)) % 2 === 1 ? 'lg:col-span-2' : ''

  return (
    <>
      <MunicipalitySearch />
      <CalendarAlert
        year={withoutCalendar.year}
        municipalities={withoutCalendar.municipalities}
        className="mb-6"
      />
      {can(user?.role, 'canSeeUnremittedAlert') && (
        <UnremittedAlert withholdings={unremitted} className="mb-6" />
      )}
      <div className={`grid gap-4 sm:grid-cols-2 ${CARD_COLUMNS[cards]}`}>
        {withRitVisible && (
          <StatTile
            label="Solicitudes del RIT por revisar"
            value={String(data.pendingOnes.length)}
            icon={<ClipboardList className="size-5" />}
            detail={`${data.activeItems} inscripciones activas`}
          />
        )}
        {withRitVisible && (
          <StatTile
            label="Contribuyentes omisos"
            value={String(nonFilingTaxpayers)}
            icon={<UserSearch className="size-5" />}
            detail={
              nonFilers.length > 0 ? (
                <>
                  {nonFilers.length}{' '}
                  {nonFilers.length === 1 ? 'periodo vencido' : 'periodos vencidos'} sin declarar ·{' '}
                  <Link
                    to="/declaraciones?vista=omisos"
                    className="font-medium text-brand-fg hover:underline"
                  >
                    Ver la lista
                  </Link>
                </>
              ) : (
                'Todos al día'
              )
            }
          />
        )}
        {withApproval && (
          <StatTile
            label="Declaraciones por aprobar"
            value={String(data.toApprove.length)}
            icon={<Document className="size-5" />}
            detail={
              overdueOnes > 0 ? (
                <span className="text-danger-fg">{overdueOnes} con el plazo vencido</span>
              ) : (
                'Dentro del plazo'
              )
            }
          />
        )}
        {withCorrections && (
          <StatTile
            label="Correcciones a la baja por resolver"
            value={String(data.correctionsToResolve.length)}
            icon={<ReceiptMinus className="size-5" />}
            detail={
              firstCorrection ? (
                <>
                  <span className={correctionSoon ? 'font-medium text-warning-fg' : undefined}>
                    La primera vence el {formatDate(firstCorrection.c.limit)}
                  </span>{' '}
                  ·{' '}
                  <Link
                    to="/declaraciones?correccion=por_resolver"
                    className="font-medium text-brand-fg hover:underline"
                  >
                    Ver
                  </Link>
                </>
              ) : (
                'Ninguna por resolver'
              )
            }
          />
        )}
        {canSeeCollection && (
          <StatTile
            label={`Recaudo ${CURRENT_YEAR}`}
            value={`$${compactFormat(data.collection)}`}
            icon={<Wallet className="size-5" />}
            isPositive
            detail={`${data.paidOnes} ${data.paidOnes === 1 ? 'declaración pagada' : 'declaraciones pagadas'}`}
          />
        )}
        <StatTile
          label="Declaraciones no pagadas"
          value={String(data.unpaid.length)}
          icon={<AlertTriangle className="size-5 text-danger" />}
          detail={
            data.unpaid.length > 0 ? (
              <span className="text-danger-fg">${compactFormat(data.unpaidBalance)} por pagar</span>
            ) : (
              'Sin alertas'
            )
          }
        />
        <StatTile
          label="Declaraciones sin pagar el total de la deuda"
          value={String(data.incompletePayment.length)}
          icon={<AlertTriangle className="size-5 text-warning" />}
          detail={
            data.incompletePayment.length > 0
              ? `$${compactFormat(data.incompletePaymentBalance)} de saldo pendiente`
              : 'Sin alertas'
          }
        />
      </div>

      {canSeeCollection && (
        <div className="mt-6">
          <AnnualCollection currentYear={CURRENT_YEAR} />
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <UpcomingDueDates municipalityId={municipalityId} className={firstWide} />

        {withRitVisible && <PendingApplications pendingOnes={data.pendingOnes} />}

        {withApproval && <PendingApprovals approvals={data.approvals} />}

        <DebtList
          title="Declaraciones no pagadas"
          description="Tienen valor a pagar y no registran ningún pago. En ReteICA y AutoReteICA, solo el pago total le da efecto a la declaración."
          empty="No hay declaraciones sin pagar"
          debts={data.unpaid}
        />

        <DebtList
          title="Declaraciones sin pagar el total de la deuda"
          description="Registran pagos, pero no cubren el total a pagar."
          empty="No hay declaraciones con pago incompleto"
          debts={data.incompletePayment}
        />
      </div>
    </>
  )
}
