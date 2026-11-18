import type { MunicipalitySwitches, PausasMunicipio } from '../../../../types'

export interface MunicipalityModulesProps {
  switches: MunicipalitySwitches
  pausas: PausasMunicipio
  change: (partial: Partial<MunicipalitySwitches>) => void
}

/** Lo que se activa por formulario, además de gestionarlo. */
export type FormOption = 'validateAgainstRit' | 'priorApproval' | 'cashPayment' | 'checkPayment'

/** Las columnas de la matriz que llevan un globo: "Gestiona" y cada opción. */
export type ColumnKey = 'manages' | FormOption

export interface OptionGroup {
  title: string
  options: { key: FormOption; text: string }[]
}
