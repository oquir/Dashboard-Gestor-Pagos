import type { ExportedField, ExportedStep } from '../../types/exportForm'
import type {
  RuntimeIssue,
  RuntimeModel,
  RuntimeScope,
  RuntimeSnapshot,
  RuntimeValues,
} from '../../types/formRuntime'
import { evaluateCondition } from '../runtimeCondition/runtimeCondition'
import { checkKey, fieldKey } from '../runtimeValidation/runtimeValidation.utils'

// Piezas de apoyo del runtime: recorridos del export y armado de los ambitos.

// stepFields y allSteps los usa FrontAutoliquidable en su copia del runtime: no borrarlas.
export function stepFields(step: ExportedStep): ExportedField[] {
  return step.rows.flatMap((row) => row.fields)
}

// Sueltos por nombre y los de un grupo una vez por repeticion, como validateRuntime.
export function stepErrorKeys(step: ExportedStep, snapshot: RuntimeSnapshot): string[] {
  const keys: string[] = []

  for (const row of step.rows) {
    for (const field of row.fields) {
      if (!row.groupId) {
        keys.push(field.name)
        continue
      }

      const repetitions: number = (snapshot.groups[row.groupId] ?? []).length
      for (let index = 0; index < repetitions; index += 1) {
        keys.push(fieldKey(field.name, row.groupId, index))
      }
    }
  }

  // Las comprobaciones del grupo son del paso: sin esta vuelta, Siguiente avanzaria con el error.
  for (const group of step.groups ?? []) {
    for (const check of group.checks ?? []) keys.push(checkKey(group.groupId, check.id))
  }

  return keys
}

export function allSteps(model: RuntimeModel): ExportedStep[] {
  return [...model.introSteps, ...model.steps]
}

// Cada columna de un grupo como array: asi sumOf la encuentra desde el root.
export function groupColumns(
  model: RuntimeModel,
  groups: Record<string, RuntimeValues[]>,
): RuntimeValues {
  const columns: RuntimeValues = {}

  for (const [groupId, fields] of model.groupFields) {
    const items: RuntimeValues[] = groups[groupId] ?? []

    for (const field of fields) {
      columns[field.name] = items.map((item) => item[field.name])
    }
  }

  return columns
}

export function buildScope(
  fields: ExportedField[],
  values: RuntimeValues,
  computed: Record<string, boolean>,
  clamped: Record<string, boolean>,
): RuntimeScope {
  const visible: Record<string, boolean> = {}
  const disabled: Record<string, boolean> = {}

  // alwaysDisabled gana sobre enableWhen; la visibilidad manda sobre las dos.
  for (const field of fields) {
    visible[field.name] = evaluateCondition(field.visibleWhen, values)
    disabled[field.name] =
      Boolean(field.alwaysDisabled) || !evaluateCondition(field.enableWhen, values)
  }

  // Segunda pasada: el destino puede venir despues que su etiqueta. La etiqueta se esconde con su
  // campo (derivado, no copiado). === false: si el destino no esta en este ambito no hay que
  // heredar.
  for (const field of fields) {
    if (field.labelFor && visible[field.labelFor] === false) visible[field.name] = false
  }

  return { values, visible, disabled, computed, clamped }
}

export function emptyItem(fields: ExportedField[]): RuntimeValues {
  const item: RuntimeValues = {}

  for (const field of fields) item[field.name] = undefined

  return item
}

// Sin esto un script roto en un grupo se listaria 45 veces (15 filas x 3 pasadas). Corre tambien
// sobre la lista final: PreviewResults usa la clave como key.
export function dedupeIssues(issues: RuntimeIssue[]): RuntimeIssue[] {
  const seen = new Set<string>()
  const unique: RuntimeIssue[] = []

  for (const issue of issues) {
    const key: string = `${issue.kind}|${issue.field ?? ''}|${issue.message}`
    if (seen.has(key)) continue

    seen.add(key)
    unique.push(issue)
  }

  return unique
}
