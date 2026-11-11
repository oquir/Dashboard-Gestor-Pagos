import { Link } from 'react-router'
import { DocumentText } from 'reicon-react'
import { CLASE_BOTON_FILA } from '../../../../constants'
import { fueraDeHorario } from '../../../../lib/bitacora'
import { etiquetaRol, formatoFecha, formatoHora } from '../../../../lib/formato'
import { ayudanteColumnas } from '../../../../lib/tabla'
import type { Municipio, RegistroBitacora } from '../../../../types'
import { Badge } from '../../../atoms'

const col = ayudanteColumnas<RegistroBitacora>()

/** Lo que no es de un municipio, como el inicio de sesión de 1cero1. */
export const SIN_MUNICIPIO = 'Todo el aplicativo'

export const nombreMunicipio = (r: RegistroBitacora, municipios: Municipio[]) =>
  municipios.find((m) => m.id === r.municipioId)?.nombre ?? SIN_MUNICIPIO

export const textoResultado = (r: RegistroBitacora) => (r.exito ? 'Salió bien' : 'Falló')

/** Lo más reciente primero: el número más alto. */
export const ORDEN_INICIAL = [{ id: 'id', desc: true }]

export function columnasBitacora(municipios: Municipio[]) {
  return col.columns([
    col.accessor('id', {
      header: 'N.º',
      meta: { clase: 'whitespace-nowrap' },
      cell: ({ row: { original: r } }) => (
        <Link
          to={`/bitacora/${r.id}`}
          aria-label={`Ver el registro ${r.id}`}
          className={CLASE_BOTON_FILA}
        >
          <DocumentText className="size-4 text-brand-600" aria-hidden />
          {r.id}
        </Link>
      ),
    }),
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
          {r.usuario.rol === '1cero1' ? (
            <Badge tono="info">1cero1</Badge>
          ) : (
            <p className="text-xs text-slate-500">{etiquetaRol[r.usuario.rol]}</p>
          )}
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
          <p className="font-mono text-sm text-slate-900">{r.accion}</p>
          <p className="text-xs text-slate-500">
            {r.controlador} · <span className="break-all font-mono">{r.endpoint}</span>
          </p>
        </>
      ),
    }),
    col.accessor('exito', {
      header: 'Resultado',
      meta: { clase: 'whitespace-nowrap' },
      cell: ({ row: { original: r } }) => (
        <Badge tono={r.exito ? 'exito' : 'peligro'}>{textoResultado(r)}</Badge>
      ),
    }),
  ])
}
