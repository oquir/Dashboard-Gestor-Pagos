// Estructural, para que entren CanvasField y ExportedField.
export interface FormattableField {
  type: string
  formatted?: boolean
  // Cuantos decimales se muestran y se dejan teclear. Ausente = los que tenga, hasta el tope.
  decimals?: number
}
