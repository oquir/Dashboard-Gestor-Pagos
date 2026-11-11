// ReteICA y AutoReteICA sin consignar: lo retenido que no ha llegado al municipio (docs/Pendientes-y-decisiones.md, §3.15).
import type { Check, Declaration, Payment, UnremittedWithholding } from '../types'
import { dayDifference } from '../utils'
import type { ApprovalSituation, CorrectionSituation } from './rules'
import {
  currentCorrection,
  remittanceLimit,
  replaced as calcularReemplazadas,
  canBePaid,
  totalInClearing,
  totalPaid,
} from './rules'

interface Source {
  declarations: Declaration[]
  payments: Payment[]
  checks: Check[]
  approval: (d: Declaration) => ApprovalSituation | undefined
  correction: (d: Declaration) => CorrectionSituation | undefined
}

/**
 * ReteICA y AutoReteICA vigentes que tienen saldo, del límite más antiguo al más próximo. No cuentan las reemplazadas
 * por una corrección, las solicitudes de corrección que no se han aceptado, las que esperan la aprobación previa (el
 * agente aún no puede pagar) ni lo que está en cheques en canje. El plazo de 2 meses del art. 402 del Código Penal corre
 * desde el vencimiento, aunque se haya presentado tarde.
 */
export function computeUnremitted(
  { declarations, payments, checks, approval, correction }: Source,
  today: string,
): UnremittedWithholding[] {
  const replaced = calcularReemplazadas(declarations, correction)
  return declarations
    .flatMap((d) => {
      if (
        d.tax === 'ica' ||
        replaced.has(d.id) ||
        !currentCorrection(correction(d)) ||
        !canBePaid(approval(d))
      )
        return []
      const balance = d.totalToPay - totalPaid(d.id, payments) - totalInClearing(d.id, checks)
      if (balance <= 0) return []
      const limit = remittanceLimit(d.dueDate)
      return [{ d, balance, limit, days: dayDifference(today, limit) }]
    })
    .sort((a, b) => a.limit.localeCompare(b.limit))
}
