import type { Columna } from '../../../../lib/reportes'

/** Columnas del Excel de omisos, con su ancho en caracteres. */
export const COLUMNAS_EXCEL: Columna[] = [
  { titulo: 'Municipio', ancho: 16 },
  { titulo: 'N.º de RIT', ancho: 12 },
  { titulo: 'Contribuyente', ancho: 36 },
  { titulo: 'Documento', ancho: 18 },
  { titulo: 'Estado del RIT', ancho: 14 },
  { titulo: 'Impuesto', ancho: 13 },
  { titulo: 'Periodo', ancho: 28 },
  { titulo: 'Vencimiento', ancho: 13 },
  { titulo: 'Días de vencido', ancho: 10 },
  { titulo: 'Teléfono', ancho: 14 },
  { titulo: 'Correo', ancho: 30 },
  { titulo: 'Dirección', ancho: 30 },
]
