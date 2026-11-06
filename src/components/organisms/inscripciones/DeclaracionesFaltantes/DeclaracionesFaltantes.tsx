import { etiquetaImpuesto, etiquetaPeriodo, formatoFecha, formatoHaceDias, textoEnProduccion } from '../../../../lib/formato'
import { idOmiso } from '../../../../lib/omisos'
import { useOmisos } from '../../../../lib/sesion'
import { useDatos } from '../../../../store'
import { diferenciaDias, hoy } from '../../../../utils'
import { Badge, Card } from '../../../atoms'
import { CardHeader, Vacio } from '../../../molecules'
import type { DeclaracionesFaltantesProps } from './types'

/** Periodos vencidos que el inscrito debía declarar y no ha declarado, desde que cada formulario salió a producción en el aplicativo. */
export default function DeclaracionesFaltantes({ inscripcion }: DeclaracionesFaltantesProps) {
  const { omisos } = useOmisos(inscripcion.municipioId)
  const municipio = useDatos((s) => s.municipios.find((m) => m.id === inscripcion.municipioId))
  const suyos = omisos.filter((o) => o.inscripcion.id === inscripcion.id)
  const desde = municipio && textoEnProduccion(municipio)

  return (
    <Card>
      <CardHeader
        titulo="Declaraciones que faltan"
        descripcion={
          desde
            ? `Periodos vencidos sin declarar desde ${desde}, cuando los formularios salieron a producción en el aplicativo.`
            : 'El municipio no tiene formularios activos en el aplicativo.'
        }
      />
      {suyos.length === 0 ? (
        <Vacio titulo="Está al día" descripcion="No le falta ninguna declaración vencida." />
      ) : (
        <ul className="divide-y divide-slate-100">
          {suyos.map((o) => (
            <li key={idOmiso(o)} className="flex items-center justify-between gap-3 px-5 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">
                  {etiquetaImpuesto[o.impuesto]} · {etiquetaPeriodo(o)}
                </p>
                <p className="truncate text-xs text-slate-500">Venció el {formatoFecha(o.vencimiento)}</p>
              </div>
              <Badge tono="peligro">Omiso {formatoHaceDias(diferenciaDias(o.vencimiento, hoy()))}</Badge>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
