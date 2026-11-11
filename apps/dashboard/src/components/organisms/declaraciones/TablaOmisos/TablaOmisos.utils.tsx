import { emplazamientoDelOmiso } from '../../../../lib/emplazamientos'
import { etiquetaPeriodo } from '../../../../lib/formato'
import { idOmiso } from '../../../../lib/omisos'
import { ayudanteColumnas } from '../../../../lib/tabla'
import type { Emplazamiento, Municipio, Omiso } from '../../../../types'
import { Casilla } from '../../../atoms'
import EmplazamientoResumen from '../EmplazamientoResumen'
import type { SeleccionOmisos } from './TablaOmisos.types'

export const col = ayudanteColumnas<Omiso>()

export const columnaMunicipio = (municipios: Municipio[]) =>
  col.accessor((o) => municipios.find((m) => m.id === o.inscripcion.municipioId)?.nombre ?? '', {
    id: 'municipio',
    header: 'Municipio',
    meta: { clase: 'whitespace-nowrap text-slate-700' },
  })

/** Casillas para elegir los omisos que se emplazan; la del encabezado marca todos los filtrados que aún no tienen emplazamiento. */
export function columnaSeleccion(
  omisos: Omiso[],
  emplazamientos: Emplazamiento[],
  { seleccion, marcar }: SeleccionOmisos,
) {
  const disponibles = omisos.filter((o) => !emplazamientoDelOmiso(o, emplazamientos)).map(idOmiso)
  const marcadas = disponibles.filter((id) => seleccion.has(id)).length
  return col.display({
    id: 'seleccion',
    header: () => (
      <Casilla
        aria-label="Seleccionar los omisos filtrados sin emplazamiento"
        title={`Seleccionar los ${disponibles.length} omisos filtrados sin emplazamiento`}
        disabled={disponibles.length === 0}
        checked={disponibles.length > 0 && marcadas === disponibles.length}
        ref={(el) => {
          if (el) el.indeterminate = marcadas > 0 && marcadas < disponibles.length
        }}
        onChange={(e) => marcar(disponibles, e.target.checked)}
      />
    ),
    meta: { clase: 'w-10' },
    cell: ({ row: { original: o } }) => {
      const emplazado = Boolean(emplazamientoDelOmiso(o, emplazamientos))
      return (
        <Casilla
          aria-label={`Seleccionar a ${o.inscripcion.nombre}, ${etiquetaPeriodo(o)}`}
          title={emplazado ? 'Ya tiene emplazamiento' : undefined}
          disabled={emplazado}
          checked={seleccion.has(idOmiso(o))}
          onChange={(e) => marcar([idOmiso(o)], e.target.checked)}
        />
      )
    },
  })
}

/** El emplazamiento para declarar del omiso, si se registró. Ordena por la fecha de notificación. */
export const columnaEmplazamiento = (emplazamientos: Emplazamiento[]) =>
  col.accessor((o) => emplazamientoDelOmiso(o, emplazamientos)?.fechaNotificacion ?? '', {
    id: 'emplazamiento',
    header: 'Emplazamiento',
    meta: { clase: 'min-w-52' },
    cell: ({ row: { original: o } }) => {
      const e = emplazamientoDelOmiso(o, emplazamientos)
      return e ? (
        <EmplazamientoResumen e={e} />
      ) : (
        <span className="text-xs text-slate-400">Sin emplazamiento</span>
      )
    },
  })
