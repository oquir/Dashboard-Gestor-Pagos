import { Link } from 'react-router'
import { AddressCard } from 'reicon-react'
import { CLASE_BOTON_FILA } from '../../../../constants'
import {
  etiquetaCalidad,
  etiquetaEstadoInscripcion,
  etiquetaEstadoNovedad,
  etiquetaTipoNovedad,
  etiquetaTipoPersona,
  formatoDocumento,
  formatoFecha,
} from '../../../../lib/formato'
import { ultimoTramite } from '../../../../lib/reglas'
import { tonoInscripcion } from '../../../../lib/tonos'
import { Badge } from '../../../atoms'
import { col } from './utils'

export const COLUMNAS = col.columns([
  col.accessor('numeroRit', {
    header: 'RIT',
    meta: { clase: 'whitespace-nowrap' },
    cell: ({ row: { original: i } }) => (
      <Link
        to={`/rit/${i.id}`}
        aria-label={`Ver la inscripción ${i.numeroRit} de ${i.nombre}`}
        className={CLASE_BOTON_FILA}
      >
        <AddressCard className="size-4 text-brand-600" aria-hidden />
        {i.numeroRit}
      </Link>
    ),
  }),
  col.accessor('nombre', {
    header: 'Nombre o razón social',
    // Sin ancho mínimo, las razones sociales largas se partían en tres o cuatro líneas.
    meta: { clase: 'min-w-72' },
    cell: ({ row: { original: i } }) => (
      <>
        <p className="font-medium text-slate-900">{i.nombre}</p>
        <p className="text-xs text-slate-500">{formatoDocumento(i)}</p>
      </>
    ),
  }),
  col.accessor((i) => etiquetaTipoPersona[i.tipoPersona], {
    id: 'tipoPersona',
    header: 'Tipo de persona',
    meta: { clase: 'whitespace-nowrap text-slate-700' },
  }),
  col.display({
    id: 'calidades',
    header: 'Calidades',
    cell: ({ row: { original: i } }) => (
      <div className="flex flex-wrap gap-1">
        {i.calidades.map((c) => (
          <Badge key={c.calidad} tono={c.calidad === 'contribuyente' ? 'neutral' : 'info'}>
            {etiquetaCalidad[c.calidad]}
          </Badge>
        ))}
        {i.regimenSimple && <Badge>SIMPLE</Badge>}
      </div>
    ),
  }),
  col.accessor((i) => etiquetaTipoNovedad[ultimoTramite(i).tipo], {
    id: 'tramite',
    header: 'Tipo de trámite',
    meta: { clase: 'whitespace-nowrap' },
    cell: ({ row: { original: i } }) => {
      const t = ultimoTramite(i)
      return (
        <>
          <p className="text-slate-900">{etiquetaTipoNovedad[t.tipo]}</p>
          <p
            className={`text-xs ${t.estado === 'pendiente' ? 'font-medium text-amber-700' : 'text-slate-500'}`}
          >
            {etiquetaEstadoNovedad[t.estado]} · {formatoFecha(t.fecha)}
          </p>
        </>
      )
    },
  }),
  col.accessor((i) => etiquetaEstadoInscripcion[i.estado], {
    id: 'estado',
    header: 'Estado',
    cell: ({ row: { original: i } }) => (
      <Badge tono={tonoInscripcion[i.estado]}>{etiquetaEstadoInscripcion[i.estado]}</Badge>
    ),
  }),
])
