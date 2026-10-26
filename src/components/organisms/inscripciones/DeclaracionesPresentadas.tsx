import { etiquetaImpuesto, etiquetaPeriodo, etiquetaTipoDeclaracion, formatoFecha, formatoPesos } from '../../../lib/formato'
import type { Declaracion } from '../../../types'
import { Card } from '../../atoms'
import { CardHeader, ItemEnlace, Vacio } from '../../molecules'

/** Declaraciones del inscrito; cada una lleva a su detalle. */
export default function DeclaracionesPresentadas({ declaraciones, regimenSimple }: {
  /** De la más reciente a la más antigua. */
  declaraciones: Declaracion[]
  regimenSimple: boolean
}) {
  return (
    <Card>
      <CardHeader titulo="Declaraciones presentadas" />
      {declaraciones.length === 0 ? (
        <Vacio titulo="Sin declaraciones" descripcion={regimenSimple ? 'Está en el SIMPLE: su ICA se declara ante la DIAN.' : undefined} />
      ) : (
        <ul className="divide-y divide-slate-100">
          {declaraciones.map((d) => (
            <ItemEnlace
              key={d.id}
              a={`/declaraciones/${d.id}`}
              titulo={`${etiquetaImpuesto[d.impuesto]} · ${etiquetaPeriodo(d.impuesto, d.vigencia, d.periodo)}`}
              detalle={`${d.numero} · ${etiquetaTipoDeclaracion[d.tipo]} · presentada el ${formatoFecha(d.fechaPresentacion)}`}
              derecha={<span className="whitespace-nowrap text-sm tabular-nums text-slate-700">{formatoPesos(d.totalAPagar)}</span>}
            />
          ))}
        </ul>
      )}
    </Card>
  )
}
