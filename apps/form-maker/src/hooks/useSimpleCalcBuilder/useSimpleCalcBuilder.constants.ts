// Coma o punto decimal (0,15 o 0.15); sin miles ni notacion cientifica.
export const MULTIPLIER_PATTERN: RegExp = /^-?\d+(?:[.,]\d+)?$/

export const INVALID_MULTIPLIER_MESSAGE: string =
  'El multiplicador tiene que ser un número, por ejemplo 0.15.'
