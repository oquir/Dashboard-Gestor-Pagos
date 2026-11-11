import type { Opcion } from '../../../../types'
import type { Medio } from './types'

export const MEDIOS: Opcion<Medio>[] = [
  { valor: 'efectivo', texto: 'Efectivo' },
  { valor: 'cheque', texto: 'Cheque de gerencia' },
]

export const BANCOS = [
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
