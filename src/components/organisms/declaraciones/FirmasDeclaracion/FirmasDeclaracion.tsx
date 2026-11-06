import { etiquetaCargoContable, formatoDocumento } from '../../../../lib/formato'
import { Card } from '../../../atoms'
import { CardHeader, Dato } from '../../../molecules'
import type { FirmasDeclaracionProps } from './types'

/** Quien diligenció la declaración y el contador o revisor fiscal; no lo tiene quien no está obligado a llevar contabilidad. */
export default function FirmasDeclaracion({ d }: FirmasDeclaracionProps) {
  const { declarante: dec, contador: c } = d

  return (
    <Card>
      <CardHeader titulo="Firmas" descripcion="Quien diligenció la declaración y el contador o revisor fiscal." />
      <dl className="space-y-4 p-5">
        <Dato etiqueta="Declarante">
          {dec.nombre}
          <span className="block text-xs tabular-nums text-slate-500">{formatoDocumento(dec)}</span>
        </Dato>
        <Dato etiqueta={c ? etiquetaCargoContable[c.cargo] : 'Contador o revisor fiscal'}>
          {c ? (
            <>
              {c.nombre}
              <span className="block text-xs tabular-nums text-slate-500">
                {formatoDocumento(c)} · Tarjeta profesional {c.tarjetaProfesional}
              </span>
            </>
          ) : (
            <span className="text-slate-500">No firma</span>
          )}
        </Dato>
      </dl>
    </Card>
  )
}
