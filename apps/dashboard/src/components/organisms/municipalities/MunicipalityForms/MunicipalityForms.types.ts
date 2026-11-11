import type { Municipality, PausasMunicipio } from '../../../../types'

export interface MunicipalityFormsProps {
  municipality: Municipality
  pausas: PausasMunicipio
}

/** Lo que se activa por formulario, además de gestionarlo. */
export type FormOption = 'validateAgainstRit' | 'priorApproval' | 'cashPayment' | 'checkPayment'

export interface OptionGroup {
  title: string
  options: { key: FormOption; text: string }[]
}
