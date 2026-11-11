import type { Opcion } from '../../../../types'
import type { Vista } from './types'

export const BIMESTRES = ['Ene–Feb', 'Mar–Abr', 'May–Jun', 'Jul–Ago', 'Sep–Oct', 'Nov–Dic']

export const VISTAS: Opcion<Vista>[] = [
  { valor: 'bimestral', texto: 'Bimestral' },
  { valor: 'mensual', texto: 'Mensual' },
]
