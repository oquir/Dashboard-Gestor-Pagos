import type { Municipality, MunicipalityConfig } from './domain'

/** Cifras de un municipio en la página Municipios. */
export interface MunicipalityFigures {
  activeItems: number
  declarations: number
  collection: number
  users: number
}

/**
 * Los interruptores de un municipio (módulos y formularios), separados de sus datos básicos
 * para poder editarlos en borrador antes de guardarlos juntos.
 */
export type MunicipalitySwitches = Pick<
  Municipality,
  | 'rit'
  | 'asobancariaUpload'
  | 'taxes'
  | 'validateAgainstRit'
  | 'priorApproval'
  | 'cashPayment'
  | 'checkPayment'
  | 'inProductionSince'
>

/** Formularios que el propio municipio desactivó, con su motivo. */
export type PausasMunicipio = MunicipalityConfig['disabledForms']
