import type { ConfigMunicipio } from './dominio'

/** Lo que recibe cada sección del formulario de configuración. */
export interface EdicionConfiguracion {
  /** Borrador con los cambios aún sin guardar. */
  b: ConfigMunicipio
  cambiar: (parcial: Partial<ConfigMunicipio>) => void
  editable: boolean
  /** Por campo; las claves de los tramos son `pronto-<año>-<tramo>`. */
  errores: Record<string, string>
}
