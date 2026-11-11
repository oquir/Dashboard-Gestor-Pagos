import type { MunicipalityConfig } from './domain'

/** Lo que recibe cada sección de los formularios de Configuración y de Calendario. */
export interface SettingsEdit {
  /** Borrador con los cambios aún sin guardar. */
  b: MunicipalityConfig
  change: (partial: Partial<MunicipalityConfig>) => void
  editable: boolean
  /** Por campo; las claves de los tramos son `pronto-<año>-<tramo>`. */
  errors: Record<string, string>
}
