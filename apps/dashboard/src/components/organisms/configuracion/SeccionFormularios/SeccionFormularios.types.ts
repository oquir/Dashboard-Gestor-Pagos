import type { ConfigMunicipio, EdicionConfiguracion, Formulario } from '../../../../types'

export interface SeccionFormulariosProps extends EdicionConfiguracion {
  /** Los que 1cero1 tiene activos en el municipio. */
  formularios: Formulario[]
  /** Desactivaciones ya guardadas, para distinguirlas de las del borrador. */
  guardados: ConfigMunicipio['formulariosDesactivados']
}
