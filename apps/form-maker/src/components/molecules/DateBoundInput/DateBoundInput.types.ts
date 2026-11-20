import type { DateBound, DateBoundUnit } from '../../../types/fieldDate'

export interface DateBoundInputProps {
  id: string
  label: string
  bound: DateBound | undefined
  onChange: (bound: DateBound | undefined) => void
}

// past y future son el mismo limite relativo; se separan porque "Hace…" y "Dentro de…" se leen
// distinto.
export type DateBoundMode = 'none' | 'today' | 'past' | 'future' | 'fixed'

export interface DateBoundModeOption {
  mode: DateBoundMode
  label: string
}

export interface DateBoundUnitOption {
  unit: DateBoundUnit
  label: string
}
