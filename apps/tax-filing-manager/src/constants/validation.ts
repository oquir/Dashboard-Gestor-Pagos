// Patrones de validación de los formularios.
export const EMAIL_PATTERN = /^\S+@\S+\.\S+$/
/** NIT sin puntos */
export const NIT_PATTERN = /^\d{1,10}$/
/** Solo un digito de DV */
export const DV_PATTERN = /^\d$/
/** Código DANE del municipio: 5 dígitos. */
export const DANE_PATTERN = /^\d{5}$/
/** Color en hexadecimal #rrggbb. */
export const HEX_COLOR_PATTERN = /^#?[0-9a-fA-F]{6}$/
