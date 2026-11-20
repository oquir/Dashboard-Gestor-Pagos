// Estructural, para que entren CanvasField y ExportedField.
export interface SignedField {
  type: string
  allowsNegative?: boolean
}

// Informa si recorto: el simulador lo avisa bajo el campo.
export interface ClampResult {
  value: unknown
  clamped: boolean
}
