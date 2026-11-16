import { compactFormat, formatDate, remittanceTerm } from '../../../../lib'
import type { UnremittedWithholding } from '../../../../types'
import type { UnremittedMessage } from './UnremittedAlert.types'

/** Lo que falta consignar entre todas. */
export const balanceOf = (withholdings: UnremittedWithholding[]) =>
  withholdings.reduce((sum, r) => sum + r.balance, 0)

/**
 * El aviso de las retenciones sin consignar: en rojo si alguna ya pasó los 2 meses del art. 402 del
 * Código Penal; en ámbar si todas siguen en plazo. Sin retenciones pendientes no hay aviso.
 */
export function unremittedMessage(withholdings: UnremittedWithholding[]): UnremittedMessage | null {
  if (withholdings.length === 0) return null
  const overdueOnes = withholdings.filter((r) => r.days < 0)
  const onTime = withholdings.filter((r) => r.days >= 0)

  if (overdueOnes.length > 0) {
    const others =
      onTime.length === 0
        ? ''
        : ` ${onTime.length === 1 ? 'Otra sigue' : `Otras ${onTime.length} siguen`} en plazo.`
    return {
      tone: 'error',
      title: `${overdueOnes.length === 1 ? '1 retención pasó' : `${overdueOnes.length} retenciones pasaron`} los 2 meses sin consignarse ($${compactFormat(balanceOf(overdueOnes))}).`,
      description: `No consignar lo retenido puede ser delito (art. 402 del Código Penal).${others}`,
    }
  }

  const next = onTime[0]
  return {
    tone: 'warning',
    title: `${onTime.length === 1 ? '1 retención' : `${onTime.length} retenciones`} sin consignar ($${compactFormat(balanceOf(onTime))}).`,
    description: `${onTime.length === 1 ? 'Su plazo vence' : 'El primer plazo vence'} el ${formatDate(next.limit)} (${remittanceTerm(next.days).toLowerCase()}).`,
  }
}
