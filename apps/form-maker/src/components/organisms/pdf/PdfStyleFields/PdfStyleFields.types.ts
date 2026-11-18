import type { PdfStyleProps } from '../../../../types'

export interface PdfStyleFieldsProps {
  idPrefix: string
  // Lo propio: de la celda, o de la clase que se edita.
  value: PdfStyleProps
  // Lo que ya viene de las clases de la celda ({} al editar una clase). Se muestra como puesto, y
  // volver a eso borra lo propio en vez de repetirlo.
  inherited: PdfStyleProps
  // La letra del documento, para el placeholder del tamaño.
  defaultFontSize: number
  onChange: (patch: Partial<PdfStyleProps>) => void
}
