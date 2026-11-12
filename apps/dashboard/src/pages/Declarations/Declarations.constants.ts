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

/** Con qué fecha se filtra la consulta en cada vista. */
export const CRITERION = {
  filed: 'Por la fecha en que se presentó la declaración.',
  nonFilers: 'Por la fecha de vencimiento del periodo que no se declaró.',
}

/** Lo que se muestra mientras no se ha consultado un rango de fechas. */
export const NO_QUERY = {
  title: 'Elige el rango de fechas',
  filed: 'Escoge desde y hasta y presiona Consultar para ver las declaraciones.',
  nonFilers: 'Escoge desde y hasta y presiona Consultar para ver los omisos.',
}
