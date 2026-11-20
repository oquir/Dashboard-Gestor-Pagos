import type { ReactNode } from 'react'

export interface PanelSectionProps {
  title: string
  // Para que sirve la seccion, detras de un icono (i) en la esquina. Va aca lo que se lee una vez
  // para entenderla; los avisos que dependen del estado y la ayuda de cada control quedan adentro.
  description?: string
  // Va a la derecha del titulo. Una insignia, un contador, o el control que enciende y apaga toda
  // la seccion: nunca uno de los que hay dentro, o se leeria como si valiera solo para el primero.
  aside?: ReactNode
  // Rotulo con contraste AA (fg-muted). Lo pide el diseñador de PDF (docs/Plan-PDF-UX-P1.md); el
  // formulario no lo pasa y sigue con fg-subtle hasta que se decida aparte.
  legibleTitle?: boolean
  children?: ReactNode
}
