import { useState } from 'react'
import { formLabel } from '../../../../lib'
import { today } from '../../../../utils'
import { Button, Input } from '../../../atoms'
import { Field, Modal } from '../../../molecules'
import type { GoLiveModalProps } from './GoLiveModal.types'

/**
 * Ventana que sale al activar un formulario por primera vez: pide su fecha de salida a producción, que después no se
 * puede cambiar. No deja confirmar sin la fecha.
 */
export default function GoLiveModal({ form, onConfirm, close }: GoLiveModalProps) {
  const [date, setDate] = useState(today())
  const [attempted, setAttempted] = useState(false)
  const uses =
    form === 'rit'
      ? 'Desde esta fecha se juzgan las inscripciones tardías.'
      : 'Desde esta fecha se revisan los omisos.'

  const send = () => {
    setAttempted(true)
    if (date) onConfirm(date)
  }

  return (
    <Modal
      title={`Activar ${formLabel[form]}`}
      description={`Es la primera vez que el municipio lo tiene en el aplicativo. ${uses} No se podrá cambiar después.`}
      close={close}
      footer={
        <>
          <Button variant="secondary" onClick={close}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={send}>
            Activar
          </Button>
        </>
      }
    >
      <Field
        label="Salida a producción"
        error={attempted && !date ? 'Elige la fecha para continuar.' : undefined}
      >
        <Input type="date" data-autofocus value={date} onChange={(e) => setDate(e.target.value)} />
      </Field>
    </Modal>
  )
}
