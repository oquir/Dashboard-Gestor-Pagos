import type { Frequency } from '../../../../types'

/** Periodicidades que se ven en ReteICA y AutoReteICA; el ICA es siempre anual. */
export const WITHHOLDING_FREQUENCIES: Frequency[] = ['monthly', 'bimonthly', 'quarterly']

/** Globo de "Periodicidad". */
export const FREQUENCY_INFO =
  'Cada cuánto se declara: mensual, bimestral o trimestral, según lo fije el municipio para ese año gravable. ReteICA y AutoReteICA pueden tener periodicidades distintas.'
