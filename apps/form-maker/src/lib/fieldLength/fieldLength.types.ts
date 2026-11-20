// La forma del builder: el tope vive adentro de validations, junto al resto de las reglas.
export interface AuthoredLengthField {
  type: string
  validations: { maxLength?: number }
}

// En el export el tope sale tambien como clave propia: dentro del texto del schema no se puede
// leer.
export interface LengthLimitedField {
  type: string
  maxLength?: number
}
