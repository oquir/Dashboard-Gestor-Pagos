import { etiquetaFormulario, textoDesactivado } from '../../../../lib/formato'
import { IMPUESTOS } from '../../../../lib/sesion'
import { useDatos } from '../../../../store'
import { Input } from '../../../atoms'
import { Campo, Interruptor, Seccion } from '../../../molecules'
import type { Formulario } from '../../../../types'
import type { ModulosMunicipioProps } from './types'

const AYUDA: Record<Formulario, string> = {
  rit: 'Una inscripción se juzga tardía solo si su plazo vencía desde esta fecha; antes, al negocio le tocaba inscribirse en otro sistema.',
  ica: 'Los omisos del ICA se revisan desde esta fecha; lo anterior está en otro sistema.',
  reteica: 'Los omisos de la ReteICA se revisan desde esta fecha; lo anterior está en otro sistema.',
  autorretencion: 'Los omisos de la AutoReteICA se revisan desde esta fecha; lo anterior está en otro sistema.',
}

/** Lo que el municipio tiene en el aplicativo además de sus formularios de impuestos. */
export default function ModulosMunicipio({ municipio: m, pausas }: ModulosMunicipioProps) {
  const alternarRit = useDatos((s) => s.alternarRit)
  const alternarCargaAsobancaria = useDatos((s) => s.alternarCargaAsobancaria)
  const cambiarEnProduccionDesde = useDatos((s) => s.cambiarEnProduccionDesde)
  const formularios: Formulario[] = [...(m.rit ? ['rit' as const] : []), ...IMPUESTOS.filter((i) => m.impuestos[i])]

  return (
    <Seccion titulo="Módulos" descripcion="Lo que el municipio tiene en el aplicativo además de sus formularios.">
      <div>
        <Interruptor etiqueta="RIT en el aplicativo" ayuda="Inscripciones, actualizaciones y cancelaciones." valor={m.rit} onChange={() => alternarRit(m.id)} />
        {m.rit && pausas.rit && <p className="mt-2 ml-12 text-xs text-amber-800">{textoDesactivado(pausas.rit)}</p>}
      </div>
      <Interruptor
        etiqueta="Carga de Asobancaria 2001"
        ayuda="El municipio carga el recaudo de los pagos con código de barras, que el banco no notifica."
        valor={m.cargaAsobancaria}
        onChange={() => alternarCargaAsobancaria(m.id)}
      />
      <div>
        <p className="text-sm font-medium text-slate-900">Salida a producción</p>
        <p className="text-xs text-slate-500">Desde cuándo recibe el aplicativo cada formulario. Se tiene en cuenta en los omisos y en las inscripciones tardías.</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {formularios.map((f) => (
            <Campo key={f} etiqueta={etiquetaFormulario[f]} ayuda={AYUDA[f]}>
              <Input type="date" value={m.enProduccionDesde[f]} onChange={(e) => e.target.value && cambiarEnProduccionDesde(m.id, f, e.target.value)} />
            </Campo>
          ))}
        </div>
      </div>
    </Seccion>
  )
}
