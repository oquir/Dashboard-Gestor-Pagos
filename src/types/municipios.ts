import type { ConfigMunicipio } from './dominio'

/** Cifras de un municipio en la página Municipios. */
export interface CifrasMunicipio {
  activas: number
  declaraciones: number
  recaudo: number
  usuarios: number
}

/** Formularios que el propio municipio desactivó, con su motivo. */
export type PausasMunicipio = ConfigMunicipio['formulariosDesactivados']
