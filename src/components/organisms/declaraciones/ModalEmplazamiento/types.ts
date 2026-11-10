import type { DestinoEmplazamiento, Emplazamiento } from '../../../../types'

/** Un contribuyente al que va el emplazamiento: un omiso, para declarar, o una declaración, para corregir. */
export interface Destinatario {
  /** Clave única en la lista. */
  clave: string
  titulo: string
  descripcion: string
  /** La notificación no puede ser anterior: el vencimiento del periodo omiso o la presentación de la declaración. */
  desde: string
  destino: DestinoEmplazamiento
}

export interface ModalEmplazamientoProps {
  tipo: Emplazamiento['tipo']
  destinatarios: Destinatario[]
  /** Se llama al cancelar, al cerrar la ventana o después de registrar. */
  cerrar: () => void
}
