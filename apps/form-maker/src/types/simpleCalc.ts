// Calculo sin codigo. No se guarda: vive con el modal abierto y al aplicar se traduce a logic.script.

export type CalcSign = '+' | '-'

export interface SimpleCalcTerm {
  sign: CalcSign
  fieldId: string
}

export interface SimpleCalc {
  terms: SimpleCalcTerm[]
  floorAtZero: boolean
  multiplier: number | null
}

// aggregated: visto desde el campo editado es la columna de un grupo y entra envuelto en sum().
export interface CalcTermOption {
  fieldId: string
  name: string
  label: string
  aggregated: boolean
  createsCycle: boolean
}

export interface CalcTermOptionGroup {
  id: string
  label: string
  options: CalcTermOption[]
}

export interface CalcTermIndex {
  byId: Map<string, CalcTermOption>
  byName: Map<string, CalcTermOption>
}

// id: solo la key de React; fieldId null mientras no se elige.
export interface CalcTermDraft {
  id: string
  sign: CalcSign
  fieldId: string | null
}
