import { etiquetaEstadoNovedad, etiquetaTipoNovedad, formatoFecha } from '../../../lib/formato'
import { tonoNovedad } from '../../../lib/tonos'
import type { Novedad } from '../../../types'
import { Badge, Boton } from '../../atoms'

/** Franja sobre el formulario de una solicitud: cuál se está viendo y cómo volver a los datos actuales. */
export default function EncabezadoSolicitud({ solicitud, comparada, verActuales }: {
  solicitud: Novedad
  /** Se compara con la solicitud aprobada anterior. */
  comparada: boolean
  verActuales: () => void
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-200 bg-brand-50 px-5 py-4">
      <div>
        <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-900">
          Formulario de {etiquetaTipoNovedad[solicitud.tipo].toLowerCase()} radicado el {formatoFecha(solicitud.fecha)}
          <Badge tono={tonoNovedad[solicitud.estado]}>{etiquetaEstadoNovedad[solicitud.estado]}</Badge>
        </p>
        <p className="mt-0.5 text-sm text-slate-600">
          Lo que diligenció el contribuyente{comparada ? '. Se marca lo que cambió frente a la solicitud aprobada anterior.' : '.'}
        </p>
      </div>
      <Boton variante="secundario" onClick={verActuales}>
        Ver datos actuales
      </Boton>
    </div>
  )
}
