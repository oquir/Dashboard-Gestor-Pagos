import type { EdicionConfiguracion, Impuesto } from '../../../../types'

export interface SeccionRetencionProps extends EdicionConfiguracion {
  impuestos: Record<Impuesto, boolean>
}
