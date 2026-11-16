import type { SelectOption } from '../../../../types'
import type { Method } from './TellerPayment.types'

export const METHODS: SelectOption<Method>[] = [
  { value: 'cash', text: 'Efectivo' },
  { value: 'check', text: 'Cheque de gerencia' },
]

export const BANKS = [
  'Bancolombia',
  'Banco de Bogotá',
  'Davivienda',
  'BBVA Colombia',
  'Banco de Occidente',
  'Banco Popular',
  'Banco AV Villas',
  'Banco Caja Social',
  'Scotiabank Colpatria',
  'Banco Agrario',
]
