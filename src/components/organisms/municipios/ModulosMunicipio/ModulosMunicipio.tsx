import { textoDesactivado } from '../../../../lib/formato'
import { useDatos } from '../../../../store'
import { Input } from '../../../atoms'
import { Campo, Interruptor, Seccion } from '../../../molecules'
import type { ModulosMunicipioProps } from './types'

/** Lo que el municipio tiene en el aplicativo además de sus formularios de impuestos. */
export default function ModulosMunicipio({ municipio: m, pausas }: ModulosMunicipioProps) {
  const alternarRit = useDatos((s) => s.alternarRit)
  const alternarCargaAsobancaria = useDatos((s) => s.alternarCargaAsobancaria)
  const cambiarDeclaracionesDesde = useDatos((s) => s.cambiarDeclaracionesDesde)

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
      <Campo etiqueta="Declaraciones en el aplicativo desde" ayuda="Los omisos se revisan desde esta fecha; lo anterior está en otro sistema.">
        <Input type="date" value={m.declaracionesDesde} onChange={(e) => e.target.value && cambiarDeclaracionesDesde(m.id, e.target.value)} />
      </Campo>
    </Seccion>
  )
}
