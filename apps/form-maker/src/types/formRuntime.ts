import type { ExportedField, ExportedRepeatableGroup, ExportedStep } from './exportForm'
import type { DeclaracionKind, ReglaAnio } from './maxDates'
import type { ValorAnual } from './valores'

// Lo que el runtime necesita ademas del export, como segundo argumento: el consumidor lo recibe de
// su propio endpoint.
export interface RuntimeContext {
  // Ya resueltas al tipo de declaracion del formulario.
  reglas: ReglaAnio[]
  // "YYYY/MM/DD", por parametro para probar la mora sin tocar el reloj.
  hoy: string
  valores: ValorAnual[]
}

export type RuntimeValues = Record<string, unknown>

export interface RuntimeScope {
  values: RuntimeValues
  visible: Record<string, boolean>
  disabled: Record<string, boolean>
  computed: Record<string, boolean>
  // Negativos llevados a 0. Solo del simulador, para explicar ese 0.
  clamped: Record<string, boolean>
}

export interface RuntimeSnapshot {
  root: RuntimeScope
  groups: Record<string, RuntimeScope[]>
  cycle: string[] | null
  // Se descubren ejecutando; validateRuntime los junta con el resto.
  issues: RuntimeIssue[]
}

export interface PreviewState {
  values: RuntimeValues
  groups: Record<string, RuntimeValues[]>
}

export interface RuntimeModel {
  steps: ExportedStep[]
  introSteps: ExportedStep[]
  hasIntroModal: boolean
  prelude: string
  // De projectMeta.formType: elige la lista de vencimientos.
  declaracion: DeclaracionKind
  fieldsByName: Map<string, ExportedField>
  groupsById: Map<string, ExportedRepeatableGroup>
  rootFields: ExportedField[]
  groupFields: Map<string, ExportedField[]>
  externalLabels: Map<string, string>
}

export interface RuntimeIssue {
  kind: 'cycle' | 'schema' | 'regex' | 'script'
  field?: string
  message: string
}

export interface ValidationResult {
  errors: Record<string, string>
  issues: RuntimeIssue[]
}
