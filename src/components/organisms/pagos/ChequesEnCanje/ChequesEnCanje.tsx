import { Danger, TickCircle } from 'reicon-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { formatoFecha, formatoPesos } from '../../../../lib/formato'
import { SANCION_CHEQUE_DEVUELTO } from '../../../../lib/reglas'
import { useDatos } from '../../../../store'
import { Boton, Card, Textarea } from '../../../atoms'
import { Aviso, Campo, CardHeader, Vacio } from '../../../molecules'
import type { ChequesEnCanjeProps, Resuelto } from './types'

/**
 * Cheques de gerencia recibidos en la ventanilla que el banco aún no ha pagado. Si los paga, cuentan
 * como pago con la fecha en que se recibieron; si los devuelve, la declaración vuelve a tener saldo.
 */
export default function ChequesEnCanje({ cheques, puedeResolver }: ChequesEnCanjeProps) {
  const confirmarCheque = useDatos((s) => s.confirmarCheque)
  const devolverCheque = useDatos((s) => s.devolverCheque)
  const [devolviendo, setDevolviendo] = useState<string | null>(null)
  const [motivo, setMotivo] = useState('')
  const [resuelto, setResuelto] = useState<Resuelto | null>(null)

  const resolver = (fila: Resuelto['fila'], estado: Resuelto['estado']) => {
    if (estado === 'pagado') confirmarCheque(fila.c.id)
    else devolverCheque(fila.c.id, motivo.trim())
    setResuelto({ fila, estado })
    setDevolviendo(null)
    setMotivo('')
  }

  return (
    <Card>
      <CardHeader
        titulo="Cheques en canje"
        descripcion="Cheques de gerencia recibidos en la ventanilla. Cuentan como pago, con la fecha en que se recibieron, cuando se confirma que el banco los pagó."
      />
      {resuelto && (
        <div className="px-5 pt-4">
          {resuelto.estado === 'pagado' ? (
            <Aviso tono="exito" icono={TickCircle} rol="status">
              Se confirmó el cheque {resuelto.fila.c.numero}: {formatoPesos(resuelto.fila.c.valor)} quedan como pago de la declaración{' '}
              {resuelto.fila.d.numero} con fecha del {formatoFecha(resuelto.fila.c.fechaRecibo)}.
            </Aviso>
          ) : (
            <Aviso tono="alerta" icono={Danger} rol="status">
              <p className="font-medium">
                Se marcó como devuelto el cheque {resuelto.fila.c.numero}. La declaración {resuelto.fila.d.numero} vuelve a quedar con saldo
                {resuelto.fila.d.impuesto === 'ica' ? '.' : ' y es ineficaz mientras no se pague completa.'}
              </p>
              <p className="mt-0.5">
                El art. 731 del Código de Comercio fija una sanción del {SANCION_CHEQUE_DEVUELTO * 100} % del valor del cheque devuelto sin causa
                justificada: {formatoPesos(resuelto.fila.c.valor * SANCION_CHEQUE_DEVUELTO)}. Revisa cómo la aplica el estatuto del municipio; el
                aplicativo no la liquida.
              </p>
            </Aviso>
          )}
        </div>
      )}
      {cheques.length === 0 ? (
        <Vacio titulo="No hay cheques en canje" />
      ) : (
        <ul className="divide-y divide-slate-100">
          {cheques.map((fila) => {
            const { c, d, nombre } = fila
            return (
              <li key={c.id} className="space-y-3 px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">{nombre}</p>
                    <p className="text-slate-600">
                      Cheque {c.numero}, {c.banco} · declaración{' '}
                      <Link to={`/declaraciones/${d.id}`} className="font-medium text-slate-900 hover:text-brand-700">{d.numero}</Link>
                    </p>
                    <p className="text-xs text-slate-500">
                      Recibido el {formatoFecha(c.fechaRecibo)} por {c.recibidoPor} · recibo de caja {c.recibo}
                    </p>
                  </div>
                  <p className="tabular-nums font-medium text-slate-900">{formatoPesos(c.valor)}</p>
                </div>
                {puedeResolver && devolviendo !== c.id && (
                  <div className="flex flex-wrap gap-2">
                    <Boton variante="secundario" onClick={() => resolver(fila, 'pagado')}>
                      Confirmar pago
                    </Boton>
                    <Boton variante="fantasma" onClick={() => { setDevolviendo(c.id); setMotivo('') }}>
                      Marcar devuelto
                    </Boton>
                  </div>
                )}
                {devolviendo === c.id && (
                  <div className="space-y-3">
                    <Campo etiqueta="Motivo de la devolución">
                      <Textarea rows={2} value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ej.: el banco informa que el cheque presenta enmendaduras." />
                    </Campo>
                    <div className="flex flex-wrap gap-2">
                      <Boton variante="primario" disabled={!motivo.trim()} onClick={() => resolver(fila, 'devuelto')}>
                        Confirmar devolución
                      </Boton>
                      <Boton variante="fantasma" onClick={() => setDevolviendo(null)}>
                        Cancelar
                      </Boton>
                    </div>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
