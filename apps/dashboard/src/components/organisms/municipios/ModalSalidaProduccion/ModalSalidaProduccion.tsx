import { useState } from 'react'
import { etiquetaFormulario } from '../../../../lib/formato'
import { hoy } from '../../../../utils'
import { Boton, Input } from '../../../atoms'
import { Campo, Modal } from '../../../molecules'
import type { ModalSalidaProduccionProps } from './types'

/**
 * Ventana que sale al activar un formulario por primera vez: pide su fecha de salida a producción, que después no se
 * puede cambiar. No deja confirmar sin la fecha.
 */
export default function ModalSalidaProduccion({
  formulario,
  alConfirmar,
  cerrar,
}: ModalSalidaProduccionProps) {
  const [fecha, setFecha] = useState(hoy())
  const [intentado, setIntentado] = useState(false)
  const usos =
    formulario === 'rit'
      ? 'Desde esta fecha se juzgan las inscripciones tardías.'
      : 'Desde esta fecha se revisan los omisos.'

  const enviar = () => {
    setIntentado(true)
    if (fecha) alConfirmar(fecha)
  }

  return (
    <Modal
      titulo={`Activar ${etiquetaFormulario[formulario]}`}
      descripcion={`Es la primera vez que el municipio lo tiene en el aplicativo. ${usos} No se podrá cambiar después.`}
      cerrar={cerrar}
      pie={
        <>
          <Boton variante="secundario" onClick={cerrar}>
            Cancelar
          </Boton>
          <Boton variante="primario" onClick={enviar}>
            Activar
          </Boton>
        </>
      }
    >
      <Campo
        etiqueta="Salida a producción"
        error={intentado && !fecha ? 'Elige la fecha para continuar.' : undefined}
      >
        <Input
          type="date"
          data-autofocus
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
        />
      </Campo>
    </Modal>
  )
}
