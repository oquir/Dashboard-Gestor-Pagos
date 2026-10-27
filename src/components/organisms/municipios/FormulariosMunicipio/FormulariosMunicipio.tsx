import { etiquetaImpuesto, textoDesactivado } from '../../../../lib/formato'
import { IMPUESTOS } from '../../../../lib/sesion'
import { useDatos } from '../../../../store'
import type { Impuesto } from '../../../../types'
import { Badge, Card, Conmutador } from '../../../atoms'
import { CardHeader } from '../../../molecules'
import { GRUPOS, LEYENDA } from './constants'
import type { FormulariosMunicipioProps, OpcionFormulario } from './types'

/** Matriz de los formularios del municipio: cuáles gestiona y, para cada uno, su revisión y lo que recibe en la ventanilla. */
export default function FormulariosMunicipio({ municipio: m, pausas }: FormulariosMunicipioProps) {
  const alternarImpuesto = useDatos((s) => s.alternarImpuesto)
  const alternar: Record<OpcionFormulario, (municipioId: string, impuesto: Impuesto) => void> = {
    validarContraRit: useDatos((s) => s.alternarValidacionRit),
    aprobacionPrevia: useDatos((s) => s.alternarAprobacionPrevia),
    pagoEfectivo: useDatos((s) => s.alternarPagoEfectivo),
    pagoCheque: useDatos((s) => s.alternarPagoCheque),
  }
  const activos = IMPUESTOS.filter((i) => m.impuestos[i]).length
  // Sin el RIT en el aplicativo no hay contra qué validar.
  const marcada = (clave: OpcionFormulario, i: Impuesto) => (clave === 'validarContraRit' ? m.rit && m.validarContraRit[i] : m[clave][i])

  return (
    <Card>
      <CardHeader titulo="Formularios" descripcion="Qué formularios gestiona el municipio y, para cada uno, cómo se revisa y qué recibe en la ventanilla." />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[36rem] text-sm">
          <thead className="text-xs text-slate-500">
            <tr className="uppercase tracking-wide">
              <th rowSpan={2} scope="col" className="px-5 py-2 text-left align-bottom font-medium">Formulario</th>
              <th rowSpan={2} scope="col" className="px-3 py-2 text-center align-bottom font-medium">Gestiona</th>
              {GRUPOS.map((g) => (
                <th key={g.titulo} colSpan={g.opciones.length} scope="colgroup" className="border-l border-slate-200 px-3 pt-2 text-center font-medium">
                  {g.titulo}
                </th>
              ))}
            </tr>
            <tr className="border-b border-slate-200">
              {GRUPOS.map((g) =>
                g.opciones.map((o, j) => (
                  <th key={o.clave} scope="col" className={`px-3 pt-1 pb-2 text-center font-normal ${j === 0 ? 'border-l border-slate-200' : ''}`}>
                    {o.texto}
                  </th>
                )),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {IMPUESTOS.map((i) => {
              const gestiona = m.impuestos[i]
              const unico = gestiona && activos === 1
              const pausa = gestiona ? pausas[i] : undefined
              return (
                <tr key={i} className={gestiona ? '' : 'bg-slate-50/70'}>
                  <th scope="row" className="px-5 py-3 text-left align-top font-medium">
                    <span className={gestiona ? 'text-slate-900' : 'text-slate-500'}>{etiquetaImpuesto[i]}</span>
                    {pausa && (
                      <span className="mt-1 block max-w-xs text-xs font-normal">
                        <Badge tono="alerta">Desactivado por el municipio</Badge>
                        <span className="mt-1 block text-amber-800">{textoDesactivado(pausa)}</span>
                      </span>
                    )}
                  </th>
                  <td className="px-3 py-3 text-center align-top">
                    <Conmutador
                      checked={gestiona}
                      disabled={unico}
                      title={unico ? 'Debe quedar al menos un formulario activo' : undefined}
                      aria-label={`Gestiona ${etiquetaImpuesto[i]}`}
                      onChange={() => alternarImpuesto(m.id, i)}
                    />
                  </td>
                  {GRUPOS.map((g) =>
                    g.opciones.map((o, j) => (
                      <td key={o.clave} className={`px-3 py-3 text-center align-top ${j === 0 ? 'border-l border-slate-100' : ''}`}>
                        {gestiona ? (
                          <Conmutador
                            checked={marcada(o.clave, i)}
                            disabled={o.clave === 'validarContraRit' && !m.rit}
                            title={o.clave === 'validarContraRit' && !m.rit ? 'Requiere el RIT en el aplicativo' : undefined}
                            aria-label={`${o.texto} en ${etiquetaImpuesto[i]}`}
                            onChange={() => alternar[o.clave](m.id, i)}
                          />
                        ) : (
                          <span className="text-slate-300">
                            <span aria-hidden>—</span>
                            <span className="sr-only">No aplica: el municipio no gestiona este formulario</span>
                          </span>
                        )}
                      </td>
                    )),
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <dl className="grid gap-x-6 gap-y-3 border-t border-slate-100 p-5 text-xs sm:grid-cols-2">
        {LEYENDA.map((l) => (
          <div key={l.termino}>
            <dt className="font-medium text-slate-700">{l.termino}</dt>
            <dd className="text-slate-500">{l.definicion}</dd>
          </div>
        ))}
      </dl>
    </Card>
  )
}
