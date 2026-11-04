import { fueraDeHorario } from '../../../../lib/bitacora'
import { etiquetaCategoriaBitacora, etiquetaRol, formatoFecha, formatoHora } from '../../../../lib/formato'
import { ayudanteColumnas } from '../../../../lib/tabla'
import type { Municipio, RegistroBitacora } from '../../../../types'
import { Badge } from '../../../atoms'

const col = ayudanteColumnas<RegistroBitacora>()

/** Lo que no es de un municipio, como el inicio de sesión de 1cero1. */
export const SIN_MUNICIPIO = 'Todo el aplicativo'

export const nombreMunicipio = (r: RegistroBitacora, municipios: Municipio[]) =>
  municipios.find((m) => m.id === r.municipioId)?.nombre ?? SIN_MUNICIPIO

/** Lo más reciente primero. */
export const ORDEN_INICIAL = [{ id: 'fecha', desc: true }]

export function columnasBitacora(municipios: Municipio[]) {
  return col.columns([
    col.accessor('fechaHora', {
      id: 'fecha',
      header: 'Fecha y hora',
      meta: { clase: 'whitespace-nowrap' },
      cell: ({ row: { original: r } }) => (
        <>
          <p className="text-slate-900">{formatoFecha(r.fechaHora.slice(0, 10))}</p>
          <p className="flex items-center gap-1.5 text-xs tabular-nums text-slate-500">
            {formatoHora(r.fechaHora)}
            {fueraDeHorario(r) && <Badge tono="alerta">Fuera de horario</Badge>}
          </p>
        </>
      ),
    }),
    col.accessor((r) => r.usuario.nombre, {
      id: 'usuario',
      header: 'Usuario',
      meta: { clase: 'whitespace-nowrap' },
      cell: ({ row: { original: r } }) => (
        <>
          <p className="font-medium text-slate-900">{r.usuario.nombre}</p>
          {r.usuario.rol === '1cero1' ? <Badge tono="info">1cero1</Badge> : <p className="text-xs text-slate-500">{etiquetaRol[r.usuario.rol]}</p>}
        </>
      ),
    }),
    col.accessor((r) => nombreMunicipio(r, municipios), {
      id: 'municipio',
      header: 'Municipio',
      meta: { clase: 'whitespace-nowrap text-slate-700' },
    }),
    col.accessor('accion', {
      header: 'Acción',
      meta: { clase: 'min-w-64' },
      cell: ({ row: { original: r } }) => (
        <>
          <p className="text-slate-900">{r.accion}</p>
          <p className="text-xs text-slate-500">{etiquetaCategoriaBitacora[r.categoria]}</p>
        </>
      ),
    }),
    col.display({
      id: 'cambio',
      header: 'Antes → después',
      meta: { clase: 'min-w-56 max-w-sm' },
      cell: ({ row: { original: r } }) =>
        r.antes ? (
          <p className="text-slate-700">
            <span className="text-slate-400 line-through">{r.antes}</span> <span aria-hidden>→</span>
            <span className="sr-only">cambió a</span> {r.despues}
          </p>
        ) : r.despues ? (
          <p className="text-slate-700">{r.despues}</p>
        ) : (
          <span className="text-slate-400">—</span>
        ),
    }),
  ])
}
