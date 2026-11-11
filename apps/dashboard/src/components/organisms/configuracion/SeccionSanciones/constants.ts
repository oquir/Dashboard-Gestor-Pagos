import type { ClaveSancion } from './types'

export const ETIQUETAS_SANCION: Record<ClaveSancion, string> = {
  extemporaneidad: 'Extemporaneidad (% por mes)',
  extemporaneidadEmplazamiento: 'Extemporaneidad tras emplazamiento (% por mes)',
  correccion: 'Corrección (% del mayor valor)',
  correccionEmplazamiento: 'Corrección tras emplazamiento (%)',
  minimaUvt: 'Sanción mínima (UVT)',
}

/** Cuándo se usan las tasas con emplazamiento: el municipio registra los emplazamientos en Omisos y en cada declaración. */
export const USO_SANCION: Partial<Record<ClaveSancion, string>> = {
  extemporaneidadEmplazamiento:
    'Se usa si declara después de notificado el emplazamiento para declarar, hasta el 200 % del impuesto (art. 642)',
  correccionEmplazamiento:
    'Se usa si corrige después de notificado el emplazamiento para corregir (art. 644, numeral 2)',
}

/** Las sanciones en el orden de las etiquetas. */
export const CLAVES_SANCION = Object.keys(ETIQUETAS_SANCION) as ClaveSancion[]
