import type { PdfStyleProps } from '../../../../types'

export interface PdfStyleFieldsProps {
  idPrefix: string
  // Lo propio: de la celda o de la clase que se edita.
  value: PdfStyleProps
  // Lo que dan las clases de la celda ({} al editar una clase). Volver a eso borra lo propio.
  inherited: PdfStyleProps
  // Para el placeholder del tamano.
  defaultFontSize: number
  onChange: (patch: Partial<PdfStyleProps>) => void
}
