import type { EdicionConfiguracion, Impuesto } from '../../../../types'

export interface SeccionCalendarioProps extends EdicionConfiguracion {
  /** Formularios que el municipio tiene activos: solo de esos se ponen vencimientos. */
  impuestos: Record<Impuesto, boolean>
}
