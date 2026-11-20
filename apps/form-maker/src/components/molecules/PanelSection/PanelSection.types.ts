import type { ReactNode } from 'react'

export interface PanelSectionProps {
  title: string
  // Para que sirve la seccion, detras de un (i); la ayuda de cada control va adentro.
  description?: string
  // A la derecha del titulo: insignia, contador o el interruptor de toda la seccion, nunca un
  // control de adentro.
  aside?: ReactNode
  children?: ReactNode
}
