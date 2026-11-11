import type { SelectOption } from '../../../../types'
import type { View } from './AnnualCollection.types'

export const BIMONTHS = ['Ene–Feb', 'Mar–Abr', 'May–Jun', 'Jul–Ago', 'Sep–Oct', 'Nov–Dic']

export const VIEWS: SelectOption<View>[] = [
  { value: 'bimonthly', text: 'Bimestral' },
  { value: 'monthly', text: 'Mensual' },
]
