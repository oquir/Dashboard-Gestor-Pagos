import type { PenaltyKey } from './PenaltiesSection.types'

export const PENALTY_LABELS: Record<PenaltyKey, string> = {
  lateFiling: 'Extemporaneidad (% por mes)',
  summonsLateFiling: 'Extemporaneidad tras emplazamiento (% por mes)',
  correction: 'Corrección (% del mayor valor)',
  summonsCorrection: 'Corrección tras emplazamiento (%)',
  minimumUvt: 'Sanción mínima (UVT)',
}

/**
 * Qué es cada sanción y cuándo se usa, para el globo. Las tasas con emplazamiento se aplican cuando el municipio
 * registra los emplazamientos en Omisos y en cada declaración.
 */
export const PENALTY_INFO: Record<PenaltyKey, string> = {
  lateFiling:
    'Se cobra por cada mes o fracción de retraso desde el vencimiento, con tope del 100 % (art. 641). Aplica si declara antes de que le notifiquen un emplazamiento.',
  summonsLateFiling:
    'Se usa si declara después de notificado el emplazamiento para declarar, hasta el 200 % del impuesto (art. 642).',
  correction:
    'Se cobra sobre el mayor valor a pagar cuando el contribuyente corrige por su cuenta después del vencimiento (art. 644). Corregir a la baja no la causa.',
  summonsCorrection:
    'Se usa si corrige después de notificado el emplazamiento para corregir y antes del requerimiento especial (art. 644, numeral 2).',
  minimumUvt:
    'Ninguna sanción puede quedar por debajo de este valor (art. 639): se cobra la mayor entre la calculada y el mínimo.',
}

/** Las sanciones en el orden de las etiquetas. */
export const PENALTY_KEYS = Object.keys(PENALTY_LABELS) as PenaltyKey[]
