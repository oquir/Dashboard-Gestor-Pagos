import type { SummonsDestination, Summons } from '../../../../types'

/** Un contribuyente al que va el emplazamiento: un omiso, para declarar, o una declaración, para corregir. */
export interface Recipient {
  /** Clave única en la lista. */
  key: string
  title: string
  description: string
  /** La notificación no puede ser anterior: el vencimiento del periodo omiso o la presentación de la declaración. */
  from: string
  destination: SummonsDestination
}

export interface SummonsModalProps {
  kind: Summons['kind']
  recipients: Recipient[]
  /** Se llama al cancelar, al cerrar la ventana o después de registrar. */
  close: () => void
}
