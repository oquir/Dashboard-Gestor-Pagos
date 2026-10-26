import { etiquetaTipoNovedad, formatoFecha } from '../../../lib/formato'
import type { Inscripcion, Novedad } from '../../../types'
import { Badge, Card } from '../../atoms'
import { CardHeader, ItemEnlace, Vacio } from '../../molecules'

/** Las seis solicitudes del RIT por revisar más recientes; cada una lleva a la ficha del inscrito. */
export default function SolicitudesPendientes({ pendientes, className = '' }: {
  /** De la más reciente a la más antigua. */
  pendientes: { ins: Inscripcion; novedad: Novedad }[]
  className?: string
}) {
  return (
    <Card className={className}>
      <CardHeader titulo="Solicitudes pendientes del RIT" descripcion="Inscripciones, actualizaciones y cancelaciones por revisar." />
      {pendientes.length === 0 ? (
        <Vacio titulo="No hay solicitudes pendientes" />
      ) : (
        <ul className="divide-y divide-slate-100">
          {pendientes.slice(0, 6).map(({ ins, novedad }) => (
            <ItemEnlace
              key={novedad.id}
              a={`/rit/${ins.id}`}
              titulo={ins.nombre}
              detalle={novedad.descripcion}
              derecha={
                <>
                  <Badge tono="alerta">{etiquetaTipoNovedad[novedad.tipo]}</Badge>
                  <p className="mt-1 text-xs text-slate-500">{formatoFecha(novedad.fecha)}</p>
                </>
              }
            />
          ))}
        </ul>
      )}
    </Card>
  )
}
