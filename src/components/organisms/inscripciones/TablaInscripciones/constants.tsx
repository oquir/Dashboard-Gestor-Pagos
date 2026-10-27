import { Link } from 'react-router'
import { etiquetaCalidad, etiquetaEstadoInscripcion, etiquetaEstadoNovedad, etiquetaTipoNovedad, etiquetaTipoPersona, formatoDocumento, formatoFecha } from '../../../../lib/formato'
import { ultimoTramite } from '../../../../lib/reglas'
import { tonoInscripcion } from '../../../../lib/tonos'
import { Badge } from '../../../atoms'
import { col } from './utils'

export const COLUMNAS = col.columns([
  col.accessor('numeroRit', { header: 'RIT', meta: { clase: 'whitespace-nowrap tabular-nums text-slate-600' } }),
  col.accessor('nombre', {
    header: 'Nombre o razón social',
    cell: ({ row: { original: i } }) => (
      <>
        <Link to={`/rit/${i.id}`} className="font-medium text-slate-900 hover:text-brand-700">{i.nombre}</Link>
        <p className="text-xs text-slate-500">{formatoDocumento(i)}</p>
      </>
    ),
  }),
  col.accessor((i) => etiquetaTipoPersona[i.tipoPersona], { id: 'tipoPersona', header: 'Tipo de persona', meta: { clase: 'whitespace-nowrap text-slate-700' } }),
  col.display({
    id: 'calidades',
    header: 'Calidades',
    cell: ({ row: { original: i } }) => (
      <div className="flex flex-wrap gap-1">
        {i.calidades.map((c) => (
          <Badge key={c.calidad} tono={c.calidad === 'contribuyente' ? 'neutral' : 'info'}>{etiquetaCalidad[c.calidad]}</Badge>
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
          <p className={`text-xs ${t.estado === 'pendiente' ? 'font-medium text-amber-700' : 'text-slate-500'}`}>
            {etiquetaEstadoNovedad[t.estado]} · {formatoFecha(t.fecha)}
          </p>
        </>
      )
    },
  }),
  col.accessor((i) => etiquetaEstadoInscripcion[i.estado], {
    id: 'estado',
    header: 'Estado',
    cell: ({ row: { original: i } }) => <Badge tono={tonoInscripcion[i.estado]}>{etiquetaEstadoInscripcion[i.estado]}</Badge>,
  }),
])
