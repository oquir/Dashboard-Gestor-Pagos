import { useState } from 'react'
import { textoDesactivado, textoSalidaProduccion } from '../../../../lib/formato'
import { useDatos } from '../../../../store'
import { Interruptor, Seccion } from '../../../molecules'
import ModalSalidaProduccion from '../ModalSalidaProduccion'
import type { ModulosMunicipioProps } from './ModulosMunicipio.types'

/**
 * Lo que el municipio tiene en el aplicativo además de sus formularios de impuestos. La primera vez que se activa el
 * RIT se pide su fecha de salida a producción.
 */
export default function ModulosMunicipio({ municipio: m, pausas }: ModulosMunicipioProps) {
  const alternarRit = useDatos((s) => s.alternarRit)
  const activarFormulario = useDatos((s) => s.activarFormulario)
  const alternarCargaAsobancaria = useDatos((s) => s.alternarCargaAsobancaria)
  const [pidiendo, setPidiendo] = useState(false)

  return (
    <Seccion
      titulo="Módulos"
      descripcion="Lo que el municipio tiene en el aplicativo además de sus formularios."
    >
      <div>
        <Interruptor
          etiqueta="RIT en el aplicativo"
          ayuda={`Inscripciones, actualizaciones y cancelaciones. ${textoSalidaProduccion(m.enProduccionDesde.rit)}.`}
          valor={m.rit}
          onChange={() =>
            !m.rit && !m.enProduccionDesde.rit ? setPidiendo(true) : alternarRit(m.id)
          }
        />
        {m.rit && pausas.rit && (
          <p className="mt-2 ml-12 text-xs text-amber-800">{textoDesactivado(pausas.rit)}</p>
        )}
      </div>
      <Interruptor
        etiqueta="Carga de Asobancaria 2001"
        ayuda="El municipio carga el recaudo de los pagos con código de barras, que el banco no notifica."
        valor={m.cargaAsobancaria}
        onChange={() => alternarCargaAsobancaria(m.id)}
      />

      {pidiendo && (
        <ModalSalidaProduccion
          formulario="rit"
          alConfirmar={(fecha) => {
            activarFormulario(m.id, 'rit', fecha)
            setPidiendo(false)
          }}
          cerrar={() => setPidiendo(false)}
        />
      )}
    </Seccion>
  )
}
