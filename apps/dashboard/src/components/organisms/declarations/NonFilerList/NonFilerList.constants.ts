import type { TableColumn } from '../../../../lib'
import type { SummonsFilter } from './NonFilerList.types'

/** Opciones del filtro por emplazamiento: un omiso emplazado sigue en plazo o ya lo venció. */
export const SUMMONS_OPTIONS: Record<SummonsFilter, string> = {
  '': 'Todo emplazamiento',
  no_summons: 'Sin emplazamiento',
  on_time: 'Emplazados en plazo',
  overdue: 'Emplazados con el plazo vencido',
}

/** Columnas del Excel de omisos, con su ancho en caracteres. */
export const EXCEL_COLUMNS: TableColumn[] = [
  { title: 'Municipio', width: 16 },
  { title: 'N.º de RIT', width: 12 },
  { title: 'Contribuyente', width: 36 },
  { title: 'Documento', width: 18 },
  { title: 'Estado del RIT', width: 14 },
  { title: 'Impuesto', width: 13 },
  { title: 'Periodo', width: 28 },
  { title: 'Vencimiento', width: 13 },
  { title: 'Días de vencido', width: 10 },
  { title: 'Emplazamiento', width: 16 },
  { title: 'Notificado', width: 13 },
  { title: 'Estado del emplazamiento', width: 16 },
  { title: 'Teléfono', width: 14 },
  { title: 'Correo', width: 30 },
  { title: 'Dirección', width: 30 },
]
