import type { SettingsEdit, Tax } from '../../../../types'

export interface CalendarSectionProps extends SettingsEdit {
  /** Formularios que el municipio tiene activos: solo de esos se ponen vencimientos. */
  taxes: Record<Tax, boolean>
}
