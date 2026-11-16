import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { ALERT_DURATION, ALERT_TOAST_ID } from './UnremittedAlert.constants'
import type { UnremittedAlertProps } from './UnremittedAlert.types'
import { unremittedMessage } from './UnremittedAlert.utils'

// Usuarios a los que ya se les mostró el aviso. Vive en el módulo para que volver a Inicio no lo
// repita; recargar la página, o entrar con otro usuario, lo vuelve a mostrar.
const shownTo = new Set<string>()

/** Al entrar a Inicio, un toast con las ReteICA y AutoReteICA sin consignar y el enlace a Pagos. No pinta nada. */
export default function UnremittedAlert({ withholdings, userId }: UnremittedAlertProps) {
  const navigate = useNavigate()
  const message = unremittedMessage(withholdings)

  useEffect(() => {
    if (!message || shownTo.has(userId)) return
    shownTo.add(userId)
    toast[message.tone](message.title, {
      id: ALERT_TOAST_ID,
      description: message.description,
      duration: ALERT_DURATION,
      action: { label: 'Ver en Pagos', onClick: () => navigate('/pagos') },
    })
  }, [message, userId, navigate])

  return null
}
