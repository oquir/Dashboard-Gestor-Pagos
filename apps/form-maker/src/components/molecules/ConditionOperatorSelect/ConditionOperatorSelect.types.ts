import type { ConditionOperator } from '../../../types'

export interface ConditionOperatorSelectProps {
  // Sin label continua la frase del editor de condiciones; ponlo cuando va en columna propia.
  label?: string
  operator: ConditionOperator
  availableOperators: ConditionOperator[]
  operatorLabels: Record<ConditionOperator, string>
  onChange: (operator: ConditionOperator) => void
}
