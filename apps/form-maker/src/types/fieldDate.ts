// Claves en espanol: el objeto viaja tal cual en el payload.
export interface DateRangeValue {
  desde: string
  hasta: string
}

// Tokens YYYY, MM, DD; lo demas es separador literal.
export type DateFormatId =
  | 'DD/MM/YYYY'
  | 'MM/DD/YYYY'
  | 'YYYY-MM-DD'
  | 'DD-MM-YYYY'
  | 'YYYY/MM/DD'
  | 'DD.MM.YYYY'
  | 'YYYYMMDD'

export interface DateFormatOption {
  id: DateFormatId
  // Con tokens en espanol (AAAA).
  label: string
  example: string
}

// Estructural para servir al campo del lienzo y al exportado.
export interface DateCapableField {
  type: string
  dateRange?: boolean
  includesTime?: boolean
  dateFormat?: DateFormatId
}

export type DateBoundUnit = 'days' | 'months' | 'years'

export type DateBoundDirection = 'past' | 'future'

// today y relative se cuentan desde el dia en que se valida, no desde el que se armo el formulario.
export type DateBound =
  | { kind: 'today' }
  | { kind: 'fixed'; date: string }
  | { kind: 'relative'; amount: number; unit: DateBoundUnit; direction: DateBoundDirection }

// min: No antes de; max: No despues de.
export type DateBoundSide = 'min' | 'max'
