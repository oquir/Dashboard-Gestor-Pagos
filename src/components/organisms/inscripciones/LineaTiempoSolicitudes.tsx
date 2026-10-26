import { etiquetaEstadoNovedad, etiquetaTipoNovedad, formatoFecha } from '../../../lib/formato'
import { tonoNovedad } from '../../../lib/tonos'
import type { ConfigMunicipio, Inscripcion, Novedad } from '../../../types'
import { Badge, Card } from '../../atoms'
import { CardHeader, ItemSeleccionable } from '../../molecules'
import RespuestaEnviada from './RespuestaEnviada'

/** Solicitudes del inscrito, de la más reciente a la más antigua. Al elegir una, su formulario se ve en la ficha. */
export default function LineaTiempoSolicitudes({ inscripcion, solicitud, elegir, config, puedeRevisar }: {
  inscripcion: Inscripcion
  /** La que se está viendo; sin ella, los datos actuales. */
  solicitud?: Novedad
  elegir: (novedadId: string | null) => void
  config?: ConfigMunicipio
  puedeRevisar: boolean
}) {
  const novedades = [...inscripcion.novedades].reverse()

  return (
    <Card>
      <CardHeader titulo="Solicitudes y novedades" descripcion="Elige una para ver el formulario que diligenció el contribuyente." />
      <ol className="space-y-4 p-5">
        <li className={`border-l-2 pl-2 ${solicitud ? 'border-slate-200' : 'border-brand-600'}`}>
          <ItemSeleccionable activo={!solicitud} onClick={() => elegir(null)}>
            <span className="block text-sm font-medium text-slate-900">Datos actuales</span>
            <span className="mt-1 block text-xs text-slate-500">Cómo está hoy la ficha del inscrito.</span>
          </ItemSeleccionable>
        </li>
        {novedades.map((n) => (
          <li key={n.id} className={`border-l-2 pl-2 ${solicitud === n ? 'border-brand-600' : 'border-slate-200'}`}>
            <ItemSeleccionable activo={solicitud === n} onClick={() => elegir(n.id)}>
              <span className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-slate-900">{etiquetaTipoNovedad[n.tipo]}</span>
                <Badge tono={tonoNovedad[n.estado]}>{etiquetaEstadoNovedad[n.estado]}</Badge>
              </span>
              <span className="mt-1 block text-sm text-slate-600">{n.descripcion}</span>
              <span className="mt-1 block text-xs text-slate-500">
                Radicada el {formatoFecha(n.fecha)}
                {n.revisadaPor && n.fechaRevision && ` · revisó ${n.revisadaPor} el ${formatoFecha(n.fechaRevision)}`}
              </span>
            </ItemSeleccionable>
            <div className="px-2">
              <RespuestaEnviada novedad={n} inscripcion={inscripcion} />
              {n.tipo === 'cancelacion' && n.estado === 'pendiente' && config && (
                <p className="mt-1 text-xs text-amber-800">
                  {config.cancelacionRitAutomatica
                    ? 'En este municipio la cancelación es automática al aprobar.'
                    : 'La administración debe verificar el cese antes de aprobar la cancelación.'}
                </p>
              )}
              {n.estado === 'pendiente' && puedeRevisar && (
                <a href={`#respuesta-${n.id}`} className="mt-2 inline-block text-xs font-medium text-brand-700 hover:underline">
                  Responder solicitud
                </a>
              )}
            </div>
          </li>
        ))}
      </ol>
    </Card>
  )
}
