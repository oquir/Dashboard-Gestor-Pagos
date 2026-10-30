import type { EdicionConfiguracion } from '../../../../types'

export interface SeccionCalendarioProps extends EdicionConfiguracion {
  periodicidad?: 'bimestral' | 'mensual'
}
