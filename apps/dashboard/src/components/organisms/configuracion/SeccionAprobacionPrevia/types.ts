import type { EdicionConfiguracion, Impuesto } from '../../../../types'

export interface SeccionAprobacionPreviaProps extends EdicionConfiguracion {
  impuestos: Impuesto[]
}
