// AAAA-MM-DD (o con THH:mm) sin huso. Regex y no z.iso.date(): z.iso no existe antes de Zod 4 en el
// consumidor.
export const DATE_VALUE_PATTERN: string = '^\\d{4}-\\d{2}-\\d{2}$'

export const DATETIME_VALUE_PATTERN: string = '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}(:\\d{2})?$'

export const DATE_VALUE_MESSAGE: string = 'Fecha inválida'

export const DATETIME_VALUE_MESSAGE: string = 'Fecha y hora inválidas'

export const RANGE_START_MISSING: string = 'Falta la fecha inicial'

export const RANGE_START_INVALID: string = 'Fecha inicial inválida'

export const RANGE_END_MISSING: string = 'Falta la fecha final'

export const RANGE_END_INVALID: string = 'Fecha final inválida'

export const RANGE_ORDER_MESSAGE: string = 'La fecha final no puede ser anterior a la inicial'
