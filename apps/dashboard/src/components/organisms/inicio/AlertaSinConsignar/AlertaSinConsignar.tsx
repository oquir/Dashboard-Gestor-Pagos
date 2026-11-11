import { Danger } from 'reicon-react'
import { Link } from 'react-router'
import { formatoCompacto, formatoFecha, plazoConsignacion } from '../../../../lib/formato'
import { Aviso } from '../../../molecules'
import type { AlertaSinConsignarProps } from './types'
import { saldoDe } from './utils'

/**
 * Alerta de Inicio cuando hay ReteICA o AutoReteICA sin consignar: en rojo si alguna ya pasó los 2 meses del art. 402
 * del Código Penal; en amarillo si todas siguen en plazo. Sin retenciones pendientes no se muestra.
 */
export default function AlertaSinConsignar({
  retenciones,
  className = '',
}: AlertaSinConsignarProps) {
  if (retenciones.length === 0) return null
  const vencidas = retenciones.filter((r) => r.dias < 0)
  const enPlazo = retenciones.filter((r) => r.dias >= 0)
  const enlace = (
    <Link to="/pagos" className="font-medium underline">
      Ver en Pagos
    </Link>
  )

  if (vencidas.length > 0) {
    return (
      <div className={className}>
        <Aviso tono="peligro" icono={Danger} rol="alert">
          <p className="font-medium">
            {vencidas.length === 1 ? '1 retención pasó' : `${vencidas.length} retenciones pasaron`}{' '}
            los 2 meses sin consignarse (${formatoCompacto(saldoDe(vencidas))}).
          </p>
          <p className="mt-0.5">
            No consignar lo retenido puede ser delito (art. 402 del Código Penal).
            {enPlazo.length > 0 &&
              ` ${enPlazo.length === 1 ? 'Otra sigue' : `Otras ${enPlazo.length} siguen`} en plazo.`}{' '}
            {enlace}
          </p>
        </Aviso>
      </div>
    )
  }

  const proxima = enPlazo[0]
  return (
    <div className={className}>
      <Aviso tono="alerta" icono={Danger}>
        <p className="font-medium">
          {enPlazo.length === 1 ? '1 retención' : `${enPlazo.length} retenciones`} sin consignar ($
          {formatoCompacto(saldoDe(enPlazo))}).
        </p>
        <p className="mt-0.5">
          {enPlazo.length === 1 ? 'Su plazo vence' : 'El primer plazo vence'} el{' '}
          {formatoFecha(proxima.limite)} ({plazoConsignacion(proxima.dias).toLowerCase()}). {enlace}
        </p>
      </Aviso>
    </div>
  )
}
