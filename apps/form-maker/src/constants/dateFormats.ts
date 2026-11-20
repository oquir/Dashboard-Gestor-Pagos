import type { DateFormatId, DateFormatOption } from '../types/fieldDate'

// Lista cerrada: un patron mal tecleado no falla, solo manda una fecha que nadie entiende.
export const DATE_FORMATS: DateFormatOption[] = [
  { id: 'DD/MM/YYYY', label: 'DD/MM/AAAA', example: '31/03/2025' },
  { id: 'MM/DD/YYYY', label: 'MM/DD/AAAA', example: '03/31/2025' },
  { id: 'YYYY-MM-DD', label: 'AAAA-MM-DD', example: '2025-03-31' },
  { id: 'DD-MM-YYYY', label: 'DD-MM-AAAA', example: '31-03-2025' },
  { id: 'YYYY/MM/DD', label: 'AAAA/MM/DD', example: '2025/03/31' },
  { id: 'DD.MM.YYYY', label: 'DD.MM.AAAA', example: '31.03.2025' },
  { id: 'YYYYMMDD', label: 'AAAAMMDD', example: '20250331' },
]

// Para z.enum (tupla no vacia), derivada de la lista: un id olvidado haria que el borrador lo
// descarte.
export const DATE_FORMAT_IDS = DATE_FORMATS.map((format) => format.id) as [
  DateFormatId,
  ...DateFormatId[],
]
