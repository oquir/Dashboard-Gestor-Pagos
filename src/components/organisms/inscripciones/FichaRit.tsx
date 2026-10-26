import { etiquetaCalidad, etiquetaTipoPersona, formatoDocumento, formatoFecha } from '../../../lib/formato'
import type { Calidad, DatosRit, Tarifa } from '../../../types'
import { Badge, Card } from '../../atoms'
import { CardHeader, Dato } from '../../molecules'

const HABILITA: Record<Calidad, string> = {
  contribuyente: 'Declara ICA anual.',
  agente_retenedor: 'Declara ReteICA: el portal solo la habilita con esta responsabilidad en el RIT.',
  autorretenedor: 'Declara AutoReteICA; a este sujeto no se le practica ReteICA.',
}

const campos = (d: DatosRit): [string, string | undefined][] => [
  ['Nombre o razón social', d.nombre],
  ['Tipo de persona', etiquetaTipoPersona[d.tipoPersona]],
  ['Documento', formatoDocumento(d)],
  ['Representante legal', d.representanteLegal],
  ['Inicio de actividades', formatoFecha(d.fechaInicioActividades)],
  ['Dirección', d.direccion],
  ['Teléfono', d.telefono],
  ['Correo', d.correo],
  ['Régimen SIMPLE', d.regimenSimple ? 'Sí: declara su ICA consolidado ante la DIAN y no se le practica ReteICA' : 'No'],
]

/** Datos, calidades y actividades del inscrito. Con `anterior`, marca lo que cambió frente a ese formulario. */
export default function FichaRit({ datos, anterior, tarifas }: { datos: DatosRit; anterior?: DatosRit; tarifas?: Tarifa[] }) {
  const antes = anterior && new Map(campos(anterior))
  const agregada = (nueva: boolean) => anterior && nueva && <Badge tono="alerta">Agregada</Badge>

  return (
    <>
      <Card>
        <CardHeader titulo="Datos del inscrito" />
        <dl className="grid gap-5 p-5 sm:grid-cols-2">
          {campos(datos).map(([etiqueta, valor]) => {
            const previo = antes?.get(etiqueta)
            if (!valor && !previo) return null
            return (
              <Dato key={etiqueta} etiqueta={etiqueta}>
                {valor ?? '—'}
                {antes && previo !== valor && (
                  <>
                    {' '}
                    <Badge tono="alerta">Modificado</Badge>
                    <span className="mt-0.5 block text-xs text-slate-500">Antes: {previo ?? '—'}</span>
                  </>
                )}
              </Dato>
            )
          })}
        </dl>
      </Card>

      <Card>
        <CardHeader titulo="Calidades" descripcion="Nacen de la norma o del acto de designación, no de la inscripción." />
        <ul className="divide-y divide-slate-100">
          {datos.calidades.map((c) => (
            <li key={c.calidad} className="flex flex-wrap items-start justify-between gap-3 px-5 py-3">
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {etiquetaCalidad[c.calidad]} {agregada(!anterior?.calidades.some((a) => a.calidad === c.calidad))}
                </p>
                <p className="text-xs text-slate-500">{HABILITA[c.calidad]}</p>
              </div>
              <div className="text-right text-xs text-slate-500">
                <p>Desde {formatoFecha(c.desde)}</p>
                {c.acto && <p>{c.acto}</p>}
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <CardHeader titulo="Actividades económicas" />
        <ul className="divide-y divide-slate-100">
          {datos.actividades.map((a) => (
            <li key={a.ciiu} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
              <div>
                <span className="tabular-nums text-slate-500">CIIU {a.ciiu}</span> · <span className="text-slate-900">{a.descripcion}</span>
                {a.principal && <Badge tono="info">Principal</Badge>} {agregada(!anterior?.actividades.some((x) => x.ciiu === a.ciiu))}
              </div>
              {tarifas && <span className="whitespace-nowrap text-slate-600">{tarifas.find((t) => t.ciiu === a.ciiu)?.porMil ?? '—'} por mil</span>}
            </li>
          ))}
        </ul>
      </Card>
    </>
  )
}
