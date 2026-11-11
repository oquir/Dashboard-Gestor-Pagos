import { AlertTriangle } from 'reicon-react'
import {
  etiquetaEstadoPago,
  etiquetaImpuesto,
  etiquetaPeriodo,
  formatoPesos,
} from '../../../../lib/formato'
import { tonoPago } from '../../../../lib/tonos'
import { Badge, Card } from '../../../atoms'
import { CardHeader, ItemEnlace, Vacio } from '../../../molecules'
import type { ListaDeudasProps } from './ListaDeudas.types'

/** Declaraciones con deuda: las seis más recientes, con lo que falta por pagar. */
export default function ListaDeudas({ titulo, descripcion, vacio, deudas }: ListaDeudasProps) {
  return (
    <Card>
      <CardHeader
        titulo={titulo}
        descripcion={descripcion}
        acciones={<Badge tono={deudas.length > 0 ? 'peligro' : 'neutral'}>{deudas.length}</Badge>}
      />
      {deudas.length === 0 ? (
        <Vacio titulo={vacio} />
      ) : (
        <ul className="divide-y divide-slate-100">
          {deudas.slice(0, 6).map(({ d, estado, pagado }) => (
            <ItemEnlace
              key={d.id}
              a={`/declaraciones/${d.id}`}
              titulo={d.contribuyente.nombre}
              detalle={`${d.numero} · ${etiquetaImpuesto[d.impuesto]} · ${etiquetaPeriodo(d)}`}
              derecha={
                <>
                  <Badge tono={tonoPago[estado]}>
                    {estado === 'ineficaz' && <AlertTriangle className="size-3" aria-hidden />}
                    {estado === 'ineficaz' ? 'Ineficaz' : etiquetaEstadoPago[estado]}
                  </Badge>
                  <p className="mt-1 text-xs tabular-nums text-slate-700">
                    {pagado > 0
                      ? `Debe ${formatoPesos(d.totalAPagar - pagado)} de ${formatoPesos(d.totalAPagar)}`
                      : formatoPesos(d.totalAPagar)}
                  </p>
                </>
              }
            />
          ))}
        </ul>
      )}
    </Card>
  )
}
