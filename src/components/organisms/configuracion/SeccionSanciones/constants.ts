import type { ClaveSancion } from './types'

export const ETIQUETAS_SANCION: Record<ClaveSancion, string> = {
  extemporaneidad: 'Extemporaneidad (% por mes)',
  extemporaneidadEmplazamiento: 'Extemporaneidad tras emplazamiento (% por mes)',
  correccion: 'Corrección (% del mayor valor)',
  correccionEmplazamiento: 'Corrección tras emplazamiento (%)',
  minimaUvt: 'Sanción mínima (UVT)',
}

/** Las sanciones en el orden de las etiquetas. */
export const CLAVES_SANCION = Object.keys(ETIQUETAS_SANCION) as ClaveSancion[]
