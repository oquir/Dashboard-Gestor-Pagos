import type { PenaltyKey } from './PenaltiesSection.types'

export const PENALTY_LABELS: Record<PenaltyKey, string> = {
  lateFiling: 'Extemporaneidad (% por mes)',
  summonsLateFiling: 'Extemporaneidad tras emplazamiento (% por mes)',
  correction: 'Corrección (% del mayor valor)',
  summonsCorrection: 'Corrección tras emplazamiento (%)',
  minimumUvt: 'Sanción mínima (UVT)',
}

/** Cuándo se usan las tasas con emplazamiento: el municipio registra los emplazamientos en Omisos y en cada declaración. */
export const PENALTY_USE: Partial<Record<PenaltyKey, string>> = {
  summonsLateFiling:
    'Se usa si declara después de notificado el emplazamiento para declarar, hasta el 200 % del impuesto (art. 642)',
  summonsCorrection:
    'Se usa si corrige después de notificado el emplazamiento para corregir (art. 644, numeral 2)',
}

/** Las sanciones en el orden de las etiquetas. */
export const PENALTY_KEYS = Object.keys(PENALTY_LABELS) as PenaltyKey[]
