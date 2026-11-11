import { paymentStatusLabel, declarationTypeLabel } from '../../lib'
import type {
  PaymentStatus,
  Tax,
  SelectOption,
  DeclarationKind,
  FilterValue,
  DeclarationsView,
} from '../../types'

/** Lo presentado o lo que debía presentarse y no se presentó; los omisos solo existen donde está el RIT. */
export const VIEWS: SelectOption<DeclarationsView>[] = [
  { value: 'filed', text: 'Presentadas' },
  { value: 'nonFilers', text: 'Omisos' },
]

export const TABS: SelectOption<FilterValue<Tax>>[] = [
  { value: '', text: 'Todas' },
  { value: 'ica', text: 'ICA anual' },
  { value: 'reteica', text: 'ReteICA' },
  { value: 'selfWithholding', text: 'AutoReteICA' },
]

export const TYPE_OPTIONS: Record<FilterValue<DeclarationKind>, string> = {
  '': 'Todo tipo',
  ...declarationTypeLabel,
}
export const PAYMENT_OPTIONS: Record<FilterValue<PaymentStatus>, string> = {
  '': 'Todo estado de pago',
  ...paymentStatusLabel,
}
