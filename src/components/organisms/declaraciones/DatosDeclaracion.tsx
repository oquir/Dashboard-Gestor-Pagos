import { Link } from 'react-router'
import { formatoFecha } from '../../../lib/formato'
import type { Declaracion, Inscripcion } from '../../../types'
import { Card } from '../../atoms'
import { CardHeader, Dato } from '../../molecules'

/** Ficha de la declaración: declarante, factura, fechas y la declaración que corrige. */
export default function DatosDeclaracion({ d, ins, corregida, enlazarRit }: {
  d: Declaracion
  ins?: Inscripcion
  corregida?: Declaracion
  /** El declarante lleva a su ficha del RIT, si el municipio lo tiene en el aplicativo. */
  enlazarRit: boolean
}) {
  const diasMora = Math.round((Date.parse(d.fechaPresentacion) - Date.parse(d.fechaVencimiento)) / 86400000)

  return (
    <Card>
      <CardHeader titulo="Datos" />
      <dl className="space-y-4 p-5">
        <Dato etiqueta="Declarante">
          {!ins ? '—' : enlazarRit ? <Link className="font-medium text-brand-700 hover:underline" to={`/rit/${ins.id}`}>{ins.nombre}</Link> : ins.nombre}
        </Dato>
        <Dato etiqueta="Número de factura">
          <span className="tabular-nums">{d.numeroFactura}</span>
        </Dato>
        <Dato etiqueta="Vencimiento">{formatoFecha(d.fechaVencimiento)}</Dato>
        <Dato etiqueta="Presentación">
          {formatoFecha(d.fechaPresentacion)}
          {d.tipo !== 'clausura' && diasMora > 0 && <span className="text-amber-700"> · {diasMora} días tarde</span>}
        </Dato>
        {d.fechaCierre && <Dato etiqueta="Fecha de cierre">{formatoFecha(d.fechaCierre)}</Dato>}
        {corregida && (
          <Dato etiqueta="Corrige a">
            <Link className="font-medium text-brand-700 hover:underline" to={`/declaraciones/${corregida.id}`}>{corregida.numero}</Link>
          </Dato>
        )}
      </dl>
    </Card>
  )
}
