import { Danger } from 'reicon-react'
import { Link } from 'react-router'
import { compactFormat, formatDate, remittanceTerm } from '../../../../lib'
import { Notice } from '../../../molecules'
import type { UnremittedAlertProps } from './UnremittedAlert.types'
import { balanceOf } from './UnremittedAlert.utils'

/**
 * Alerta de Inicio cuando hay ReteICA o AutoReteICA sin consignar: en rojo si alguna ya pasó los 2 meses del art. 402
 * del Código Penal; en amarillo si todas siguen en plazo. Sin retenciones pendientes no se muestra.
 */
export default function UnremittedAlert({ withholdings, className = '' }: UnremittedAlertProps) {
  if (withholdings.length === 0) return null
  const overdueOnes = withholdings.filter((r) => r.days < 0)
  const onTime = withholdings.filter((r) => r.days >= 0)
  const link = (
    <Link to="/pagos" className="font-medium underline">
      Ver en Pagos
    </Link>
  )

  if (overdueOnes.length > 0) {
    return (
      <div className={className}>
        <Notice tone="danger" icon={Danger} role="alert">
          <p className="font-medium">
            {overdueOnes.length === 1
              ? '1 retención pasó'
              : `${overdueOnes.length} retenciones pasaron`}{' '}
            los 2 meses sin consignarse (${compactFormat(balanceOf(overdueOnes))}).
          </p>
          <p className="mt-0.5">
            No consignar lo retenido puede ser delito (art. 402 del Código Penal).
            {onTime.length > 0 &&
              ` ${onTime.length === 1 ? 'Otra sigue' : `Otras ${onTime.length} siguen`} en plazo.`}{' '}
            {link}
          </p>
        </Notice>
      </div>
    )
  }

  const next = onTime[0]
  return (
    <div className={className}>
      <Notice tone="alert" icon={Danger}>
        <p className="font-medium">
          {onTime.length === 1 ? '1 retención' : `${onTime.length} retenciones`} sin consignar ($
          {compactFormat(balanceOf(onTime))}).
        </p>
        <p className="mt-0.5">
          {onTime.length === 1 ? 'Su plazo vence' : 'El primer plazo vence'} el{' '}
          {formatDate(next.limit)} ({remittanceTerm(next.days).toLowerCase()}). {link}
        </p>
      </Notice>
    </div>
  )
}
