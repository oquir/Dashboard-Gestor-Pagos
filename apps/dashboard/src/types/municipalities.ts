import type { MunicipalityConfig } from './domain'

/** Cifras de un municipio en la página Municipios. */
export interface MunicipalityFigures {
  activeItems: number
  declarations: number
  collection: number
  users: number
}

/** Formularios que el propio municipio desactivó, con su motivo. */
export type PausasMunicipio = MunicipalityConfig['disabledForms']
