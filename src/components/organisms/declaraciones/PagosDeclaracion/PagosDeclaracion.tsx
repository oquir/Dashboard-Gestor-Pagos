import { etiquetaEstadoCheque, formatoFecha, formatoPesos } from '../../../../lib/formato'
import { totalEnCanje, totalPagado } from '../../../../lib/reglas'
import { tonoCheque } from '../../../../lib/tonos'
import { Badge, Card } from '../../../atoms'
import { CardHeader, Dato, Vacio } from '../../../molecules'
import type { PagosDeclaracionProps } from './types'

/** Pagos recibidos para la declaración, los cheques sin pagar, el total pagado y el saldo. */
export default function PagosDeclaracion({ d, pagos, cheques }: PagosDeclaracionProps) {
  const deEsta = pagos.filter((p) => p.declaracionId === d.id)
  // Los cheques pagados ya están entre los pagos.
  const chequesSinPago = cheques.filter((c) => c.declaracionId === d.id && c.estado !== 'pagado')
  const pagado = totalPagado(d.id, pagos)
  const enCanje = totalEnCanje(d.id, cheques)

  return (
    <Card>
      <CardHeader
        titulo="Pagos"
        descripcion={d.impuesto === 'ica' ? 'El ICA anual admite pago parcial.' : 'Sin pago total, esta declaración no produce efecto (es ineficaz).'}
      />
      {deEsta.length === 0 && chequesSinPago.length === 0 ? (
        <Vacio titulo="No hay pagos registrados" />
      ) : (
        <ul className="divide-y divide-slate-100">
          {deEsta.map((p) => (
            <li key={p.id} className="flex items-center justify-between px-5 py-3 text-sm">
              <span className="text-slate-700">
                {formatoFecha(p.fecha)} · {p.medio}
                {p.recibo && <span className="block text-xs text-slate-500">Recibo de caja {p.recibo}{p.registradoPor && ` · registró ${p.registradoPor}`}</span>}
              </span>
              <span className="tabular-nums text-slate-900">{formatoPesos(p.valor)}</span>
            </li>
          ))}
          {chequesSinPago.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
              <span className="text-slate-700">
                {formatoFecha(c.fechaRecibo)} · Cheque de gerencia {c.numero}, {c.banco}
                <span className="block text-xs text-slate-500">
                  Recibo de caja {c.recibo} · recibió {c.recibidoPor}
                  {c.motivoDevolucion && ` · devuelto: ${c.motivoDevolucion}`}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <Badge tono={tonoCheque[c.estado]}>{etiquetaEstadoCheque[c.estado]}</Badge>
                <span className={`tabular-nums ${c.estado === 'devuelto' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{formatoPesos(c.valor)}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
      <dl className={`grid gap-4 border-t border-slate-100 p-5 ${enCanje > 0 ? 'grid-cols-3' : 'grid-cols-2'}`}>
        <Dato etiqueta="Total pagado">{formatoPesos(pagado)}</Dato>
        {enCanje > 0 && <Dato etiqueta="En canje">{formatoPesos(enCanje)}</Dato>}
        <Dato etiqueta="Saldo pendiente">{formatoPesos(Math.max(d.totalAPagar - pagado, 0))}</Dato>
      </dl>
    </Card>
  )
}
