import { Link } from 'react-router'
import { formatoFecha, formatoPesos } from '../../../../lib/formato'
import { menorValor } from '../../../../lib/reglas'
import { Card } from '../../../atoms'
import { CardHeader, Dato } from '../../../molecules'
import type { DatosDeclaracionProps } from './types'

/** Ficha de la declaración: factura, fechas y la declaración que corrige. */
export default function DatosDeclaracion({ d, corregida, aLaBaja = false }: DatosDeclaracionProps) {
  const diasMora = Math.round(
    (Date.parse(d.fechaPresentacion) - Date.parse(d.fechaVencimiento)) / 86400000,
  )

  return (
    <Card>
      <CardHeader titulo="Datos" />
      <dl className="space-y-4 p-5">
        <Dato etiqueta="Número de factura">
          <span className="tabular-nums">{d.numeroFactura}</span>
        </Dato>
        <Dato etiqueta="Vencimiento">{formatoFecha(d.fechaVencimiento)}</Dato>
        <Dato etiqueta="Presentación">
          {formatoFecha(d.fechaPresentacion)}
          {/* Solo la inicial llega tarde: la corrección se presenta después del vencimiento sin ser extemporánea. */}
          {d.tipo === 'inicial' && diasMora > 0 && (
            <span className="text-amber-700"> · {diasMora} días tarde</span>
          )}
        </Dato>
        {d.fechaCierre && <Dato etiqueta="Fecha de cierre">{formatoFecha(d.fechaCierre)}</Dato>}
        {corregida && (
          <Dato etiqueta="Corrige a">
            <Link
              className="font-medium text-brand-700 hover:underline"
              to={`/declaraciones/${corregida.id}`}
            >
              {corregida.numero}
            </Link>
            {aLaBaja && (
              <span className="block text-xs text-slate-500">
                A la baja: {formatoPesos(menorValor(d, corregida))} menos. No lleva sanción por
                corrección.
              </span>
            )}
          </Dato>
        )}
      </dl>
    </Card>
  )
}
