import { formatoFecha, formatoPesos } from '../../../../lib/formato'
import { totalPagado } from '../../../../lib/reglas'
import { Card } from '../../../atoms'
import { CardHeader, Dato, Vacio } from '../../../molecules'
import type { PagosDeclaracionProps } from './types'

/** Pagos recibidos para la declaración, el total pagado y el saldo. */
export default function PagosDeclaracion({ d, pagos }: PagosDeclaracionProps) {
  const deEsta = pagos.filter((p) => p.declaracionId === d.id)
  const pagado = totalPagado(d.id, pagos)

  return (
    <Card>
      <CardHeader
        titulo="Pagos"
        descripcion={d.impuesto === 'ica' ? 'El ICA anual admite pago parcial.' : 'Sin pago total, esta declaración no produce efecto (es ineficaz).'}
      />
      {deEsta.length === 0 ? (
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
        </ul>
      )}
      <dl className="grid grid-cols-2 gap-4 border-t border-slate-100 p-5">
        <Dato etiqueta="Total pagado">{formatoPesos(pagado)}</Dato>
        <Dato etiqueta="Saldo pendiente">{formatoPesos(Math.max(d.totalAPagar - pagado, 0))}</Dato>
      </dl>
    </Card>
  )
}
