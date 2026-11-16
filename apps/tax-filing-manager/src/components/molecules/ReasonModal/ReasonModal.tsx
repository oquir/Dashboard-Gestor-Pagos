import { useState } from 'react'
import { Button, Textarea } from '../../atoms'
import Field from '../Field'
import Modal from '../Modal'
import type { ReasonModalProps } from './ReasonModal.types'

/** Ventana que pide el motivo antes de hacer algo, como desactivar un formulario. No deja confirmar sin escribirlo. */
export default function ReasonModal({
  title,
  description,
  label = 'Motivo',
  placeholder,
  confirm,
  danger = false,
  initial = '',
  onConfirm,
  close,
}: ReasonModalProps) {
  const [reason, setReason] = useState(initial)
  const [attempted, setAttempted] = useState(false)
  const empty = !reason.trim()

  const send = () => {
    setAttempted(true)
    if (!empty) onConfirm(reason.trim())
  }

  return (
    <Modal
      title={title}
      description={description}
      close={close}
      footer={
        <>
          <Button variant="secondary" onClick={close}>
            Cancelar
          </Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={send}>
            {confirm}
          </Button>
        </>
      }
    >
      <Field
        label={label}
        error={attempted && empty ? 'Escribe el motivo para continuar.' : undefined}
      >
        <Textarea
          rows={3}
          data-autofocus
          placeholder={placeholder}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </Field>
    </Modal>
  )
}
