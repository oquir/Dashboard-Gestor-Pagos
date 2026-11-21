// Comprobacion del grupo repetible entero: compara su columna con campos de afuera, que ni una
// validacion de campo ni Zod alcanzan. El dueno es el grupo y no el campo raiz: colgarla del renglon
// 16 bloquearia un paso antes de que exista una actividad que corregir.
export interface GroupCheck {
  id: string
  // Nombre en el panel y en la lista de errores, no el mensaje.
  label: string
  // Apagada no se exporta: hay municipios que dejan pasar el error y multan despues.
  enabled: boolean
  // {{campo}} en el ambito raiz: la columna del grupo es el array y `sum` lo aplana. Verdadero pasa.
  script: string
  message: string
}

// failed: error del contribuyente; error: la comprobacion esta rota. Nunca los dos.
export interface GroupCheckResult {
  failed: boolean
  error: string | null
}
