import { useState } from 'react'
import { etiquetaEstadoAprobacion, etiquetaImpuesto, etiquetaPeriodo, formatoFecha } from '../../../lib/formato'
import { esperaAprobacion } from '../../../lib/reglas'
import type { SituacionAprobacion } from '../../../lib/reglas'
import { tonoAprobacion } from '../../../lib/tonos'
import type { Declaracion, EstadoAprobacion } from '../../../types'
import { Badge, Card } from '../../atoms'
import { CardHeader, Filtro, ItemEnlace, Vacio } from '../../molecules'

/** Declaraciones con aprobación previa, filtradas por estado; por defecto, las que esperan aprobación. */
export default function AprobacionesPendientes({ aprobaciones, nombres, className = '' }: {
  /** Lo pendiente primero, por plazo; lo resuelto, de lo más reciente a lo más antiguo. */
  aprobaciones: { d: Declaracion; a: SituacionAprobacion }[]
  /** Nombre del declarante por id de inscripción. */
  nombres: Map<string, string>
  className?: string
}) {
  const [filtro, setFiltro] = useState<EstadoAprobacion | 'pendientes' | ''>('pendientes')
  const lista = aprobaciones.filter((x) => (filtro === 'pendientes' ? esperaAprobacion(x.a) : !filtro || x.a.estado === filtro))

  return (
    <Card className={className}>
      <CardHeader
        titulo="Aprobación previa"
        descripcion="El contribuyente paga cuando se aprueban. Lo pendiente va primero, por plazo."
        acciones={
          <Filtro
            etiqueta="Aprobación"
            opciones={{ pendientes: 'Pendientes', ...etiquetaEstadoAprobacion, '': 'Toda aprobación' }}
            valor={filtro}
            cambiar={setFiltro}
          />
        }
      />
      {lista.length === 0 ? (
        <Vacio titulo={filtro === 'pendientes' ? 'No hay declaraciones por aprobar' : 'No hay declaraciones con esa aprobación'} />
      ) : (
        <ul className="divide-y divide-slate-100">
          {lista.slice(0, 6).map(({ d, a }) => (
            <ItemEnlace
              key={d.id}
              a={`/declaraciones/${d.id}`}
              titulo={nombres.get(d.inscripcionId)}
              detalle={`${d.numero} · ${etiquetaImpuesto[d.impuesto]} · ${etiquetaPeriodo(d.impuesto, d.vigencia, d.periodo)}`}
              derecha={
                <>
                  <Badge tono={tonoAprobacion[a.estado]}>{etiquetaEstadoAprobacion[a.estado]}</Badge>
                  <p className="mt-1 text-xs text-slate-500">{esperaAprobacion(a) ? `Plazo: ${formatoFecha(a.limite)}` : formatoFecha(a.fecha ?? a.limite)}</p>
                </>
              }
            />
          ))}
        </ul>
      )}
    </Card>
  )
}
