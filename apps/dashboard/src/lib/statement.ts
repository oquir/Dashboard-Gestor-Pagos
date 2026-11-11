// Estado de cuenta del contribuyente (docs/Pendientes-y-decisiones.md §2.2 y §3.16). Al contribuyente se le reconoce por
// su documento, no por su inscripción: donde no hay RIT, o no está inscrito, la declaración es todo lo que se sabe de él.
import type {
  AccountStatement,
  Check,
  Declaration,
  Payment,
  PaymentStatus,
  StatementMovement,
  StatementRow,
} from '../types'
import type { ApprovalSituation, CorrectionSituation } from './rules'
import {
  canBePaid,
  correctionToResolve,
  currentCorrection,
  overpayment,
  replaced,
  totalInClearing,
  totalPaid,
} from './rules'

/** Tipo y número de documento; en la dirección de la página llegan como texto. */
interface TaxpayerId {
  documentType: string
  document: string
}

/** Filtro: la declaración es de ese contribuyente, por tipo y número de documento (sin el dígito de verificación). */
export const sameTaxpayer = (t: TaxpayerId) => (d: Declaration) =>
  d.taxpayer.documentType === t.documentType && d.taxpayer.document === t.document

/** Dirección de la página del estado de cuenta de un contribuyente en un municipio. */
export const statementPath = (municipalityId: string, t: TaxpayerId) =>
  `/estado-de-cuenta/${municipalityId}/${t.documentType}/${t.document}`

export interface StatementInput {
  /** Las del contribuyente, de un solo municipio y de los impuestos que tiene activos. */
  declarations: Declaration[]
  payments: Payment[]
  checks: Check[]
  statusOf: (d: Declaration) => PaymentStatus
  approval: (d: Declaration) => ApprovalSituation | undefined
  correction: (d: Declaration) => CorrectionSituation | undefined
}

/**
 * Lo que debe un contribuyente: la declaración vigente de cada vigencia con su saldo, y todos sus pagos. Cuenta lo mismo
 * que la cartera de Pagos: ni lo reemplazado por una corrección, ni lo que espera la aprobación previa, ni la solicitud de
 * corrección que no se ha aceptado es deuda. Las correcciones ya traen descontado lo pagado con la que corrigen, así que
 * lo pagado en una declaración reemplazada solo va al historial.
 */
export function buildStatement({
  declarations,
  payments,
  checks,
  statusOf,
  approval,
  correction,
}: StatementInput): AccountStatement | null {
  if (declarations.length === 0) return null

  const outside = replaced(declarations, correction)
  const rows: StatementRow[] = declarations
    .filter((d) => !outside.has(d.id) && currentCorrection(correction(d)))
    .map((d) => {
      const situation = approval(d)
      const paidAmount = totalPaid(d.id, payments)
      const payable = canBePaid(situation) && d.totalToPay > 0
      return {
        d,
        status: statusOf(d),
        paidAmount,
        inClearing: totalInClearing(d.id, checks),
        payable,
        balance: payable ? Math.max(d.totalToPay - paidAmount, 0) : 0,
        approval: situation,
        pendingCorrection: declarations.find(
          (x) => x.correctsId === d.id && correctionToResolve(correction(x)),
        ),
        excess: overpayment(d),
      }
    })

  const ica = rows
    .filter((r) => r.d.tax === 'ica')
    .sort((a, b) => b.d.fiscalYear - a.d.fiscalYear || b.d.filingDate.localeCompare(a.d.filingDate))
  const withholdings = rows
    .filter((r) => r.d.tax !== 'ica')
    .sort(
      (a, b) =>
        b.d.fiscalYear - a.d.fiscalYear ||
        b.d.period - a.d.period ||
        b.d.filingDate.localeCompare(a.d.filingDate),
    )

  // También lo pagado en las declaraciones que luego se corrigieron. Los cheques pagados ya están entre los pagos.
  const byId = new Map(declarations.map((d) => [d.id, d]))
  const movements: (StatementMovement & { date: string })[] = [
    ...payments.flatMap((p) => {
      const d = byId.get(p.declarationId)
      return d ? [{ kind: 'payment' as const, p, d, date: p.date }] : []
    }),
    ...checks.flatMap((c) => {
      const d = byId.get(c.declarationId)
      return d && c.status !== 'paid' ? [{ kind: 'check' as const, c, d, date: c.receiptDate }] : []
    }),
  ].sort((a, b) => b.date.localeCompare(a.date))

  const debts = ica.filter((r) => r.payable)
  return {
    latest: declarations.reduce((last, d) => (d.filingDate > last.filingDate ? d : last)),
    ica,
    withholdings,
    movements,
    totals: {
      toPay: debts.reduce((sum, r) => sum + r.d.totalToPay, 0),
      paid: debts.reduce((sum, r) => sum + Math.min(r.paidAmount, r.d.totalToPay), 0),
      balance: debts.reduce((sum, r) => sum + r.balance, 0),
    },
  }
}
