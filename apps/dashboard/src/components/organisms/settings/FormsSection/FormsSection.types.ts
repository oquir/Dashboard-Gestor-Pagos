import type { MunicipalityConfig, SettingsEdit, Form } from '../../../../types'

export interface FormsSectionProps extends SettingsEdit {
  /** Los que 1cero1 tiene activos en el municipio. */
  forms: Form[]
  /** Desactivaciones ya guardadas, para distinguirlas de las del borrador. */
  savedOnes: MunicipalityConfig['disabledForms']
}
