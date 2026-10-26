import { numero } from '../../../lib/configuracion'
import type { EdicionConfiguracion } from '../../../lib/configuracion'
import { SANCIONES_LEY } from '../../../lib/reglas'
import type { ConfigMunicipio } from '../../../types'
import { Input } from '../../atoms'
import { Campo, Seccion } from '../../molecules'

const ETIQUETAS_SANCION: Record<keyof ConfigMunicipio['sanciones'], string> = {
  extemporaneidad: 'Extemporaneidad (% por mes)',
  extemporaneidadEmplazamiento: 'Extemporaneidad tras emplazamiento (% por mes)',
  correccion: 'Corrección (% del mayor valor)',
  correccionEmplazamiento: 'Corrección tras emplazamiento (%)',
  minimaUvt: 'Sanción mínima (UVT)',
}

/** Sanciones del municipio, con el máximo de ley de cada una. */
export default function SeccionSanciones({ b, cambiar, editable, errores }: EdicionConfiguracion) {
  return (
    <Seccion titulo="Sanciones" descripcion="La ley es el tope: el municipio solo puede bajarlas (art. 59 de la Ley 788 de 2002).">
      {(Object.keys(ETIQUETAS_SANCION) as (keyof ConfigMunicipio['sanciones'])[]).map((clave) => (
        <Campo key={clave} etiqueta={ETIQUETAS_SANCION[clave]} ayuda={`Máximo de ley: ${SANCIONES_LEY[clave]}`} error={errores[clave]}>
          <Input type="number" min={0} step="0.5" disabled={!editable} value={b.sanciones[clave]} onChange={(e) => cambiar({ sanciones: { ...b.sanciones, [clave]: numero(e.target.value) } })} />
        </Campo>
      ))}
    </Seccion>
  )
}
