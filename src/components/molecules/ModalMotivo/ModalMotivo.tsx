import { useState } from 'react'
import { Boton, Textarea } from '../../atoms'
import Campo from '../Campo'
import Modal from '../Modal'
import type { ModalMotivoProps } from './types'

/** Ventana que pide el motivo antes de hacer algo, como desactivar un formulario. No deja confirmar sin escribirlo. */
export default function ModalMotivo({
  titulo,
  descripcion,
  etiqueta = 'Motivo',
  placeholder,
  confirmar,
  peligro = false,
  inicial = '',
  alConfirmar,
  cerrar,
}: ModalMotivoProps) {
  const [motivo, setMotivo] = useState(inicial)
  const [intentado, setIntentado] = useState(false)
  const vacio = !motivo.trim()

  const enviar = () => {
    setIntentado(true)
    if (!vacio) alConfirmar(motivo.trim())
  }

  return (
    <Modal
      titulo={titulo}
      descripcion={descripcion}
      cerrar={cerrar}
      pie={
        <>
          <Boton variante="secundario" onClick={cerrar}>
            Cancelar
          </Boton>
          <Boton variante={peligro ? 'peligro' : 'primario'} onClick={enviar}>
            {confirmar}
          </Boton>
        </>
      }
    >
      <Campo etiqueta={etiqueta} error={intentado && vacio ? 'Escribe el motivo para continuar.' : undefined}>
        <Textarea rows={3} data-autofocus placeholder={placeholder} value={motivo} onChange={(e) => setMotivo(e.target.value)} />
      </Campo>
    </Modal>
  )
}
