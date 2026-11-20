import type {
  ExportedField,
  ExportedRepeatableGroup,
  ExportedStep,
  FormExport,
} from '../../types/exportForm'
import type {
  PreviewState,
  RuntimeContext,
  RuntimeIssue,
  RuntimeModel,
  RuntimeScope,
  RuntimeSnapshot,
  RuntimeValues,
} from '../../types/formRuntime'
import type { DeclaracionKind } from '../../types/maxDates'
import type { FormType } from '../../types/setup'
import { computeDerivedValues, type DerivedResult } from '../runtimeDerived/runtimeDerived'
import { buildScope, dedupeIssues, emptyItem, groupColumns } from './formRuntime.utils'

// Corazon del simulador: solo consume el JSON exportado, nunca el store. Todo indexado por nombre.

// Aplana el export en indices; el modal de intro cuenta como un paso mas.
export function buildRuntimeModel(exported: FormExport): RuntimeModel {
  const steps: ExportedStep[] = exported.formSchema.steps
  const introSteps: ExportedStep[] = exported.setupConfig.introModal?.steps ?? []
  const fieldsByName: Map<string, ExportedField> = new Map()
  const groupsById: Map<string, ExportedRepeatableGroup> = new Map()
  const groupFields: Map<string, ExportedField[]> = new Map()
  const externalLabels: Map<string, string> = new Map()
  const rootFields: ExportedField[] = []

  for (const step of [...introSteps, ...steps]) {
    for (const group of step.groups ?? []) {
      groupsById.set(group.groupId, group)
      if (!groupFields.has(group.groupId)) groupFields.set(group.groupId, [])
    }

    for (const row of step.rows) {
      for (const field of row.fields) {
        fieldsByName.set(field.name, field)
        if (field.labelFor) externalLabels.set(field.labelFor, field.label)

        if (row.groupId) {
          groupFields.set(row.groupId, [...(groupFields.get(row.groupId) ?? []), field])
          continue
        }

        rootFields.push(field)
      }
    }
  }

  return {
    steps,
    introSteps,
    hasIntroModal: exported.setupConfig.hasIntroModal && introSteps.length > 0,
    prelude: exported.formSchema.prelude ?? '',
    declaracion: declaracionDe(exported.projectMeta.formType),
    fieldsByName,
    groupsById,
    rootFields,
    groupFields,
    externalLabels,
  }
}

// Que lista de vencimientos aplica, desde el export (el consumidor no tiene otra cosa). Sin tipo,
// ICA.
function declaracionDe(formType: FormType | null): DeclaracionKind {
  if (formType === 'retencion_industria_comercio') return 'reteica'
  if (formType === 'autorretencion') return 'autoretencionIca'

  return 'ica'
}

export function createInitialState(model: RuntimeModel): PreviewState {
  const groups: Record<string, RuntimeValues[]> = {}

  for (const [groupId, fields] of model.groupFields) {
    const min: number = model.groupsById.get(groupId)?.min ?? 1
    const count: number = Math.max(1, min)
    groups[groupId] = Array.from({ length: count }, () => emptyItem(fields))
  }

  return { values: {}, groups }
}

// Tres pasadas y en este orden: dentro de un grupo {{campo}} es el escalar de la fila, y desde el
// root el array de la columna. En una sola pasada los totales dan 0 sin aviso.
export function resolveRuntime(
  model: RuntimeModel,
  state: PreviewState,
  context?: RuntimeContext,
): RuntimeSnapshot {
  // Pasada 1: los grupos con los valores crudos del root, para poder alimentar los agregados.
  const firstPass: Record<string, RuntimeValues[]> = resolveGroupValues(
    model,
    state,
    state.values,
    context,
  )

  // Pasada 2: el root ya ve las columnas del grupo como arrays (sumOf/countOf).
  const rootBase: RuntimeValues = { ...state.values, ...groupColumns(model, firstPass) }
  const rootDerived: DerivedResult = computeDerivedValues(
    model.rootFields,
    rootBase,
    model,
    0,
    context,
  )

  // Pasada 3: los grupos se recalculan con el root ya resuelto.
  const finalGroups: Record<string, RuntimeValues[]> = resolveGroupValues(
    model,
    state,
    rootDerived.values,
    context,
  )

  const groups: Record<string, RuntimeScope[]> = {}
  const cycles: string[] = [...(rootDerived.cycle ?? [])]
  const issues: RuntimeIssue[] = [...rootDerived.issues]

  for (const [groupId, fields] of model.groupFields) {
    groups[groupId] = (state.groups[groupId] ?? []).map((_, index) => {
      const base: RuntimeValues = {
        ...rootDerived.values,
        ...(finalGroups[groupId]?.[index] ?? {}),
      }
      const derived: DerivedResult = computeDerivedValues(fields, base, model, index, context)
      if (derived.cycle) cycles.push(...derived.cycle)
      issues.push(...derived.issues)

      return buildScope(fields, derived.values, derived.computed, derived.clamped)
    })
  }

  return {
    root: buildScope(
      model.rootFields,
      rootDerived.values,
      rootDerived.computed,
      rootDerived.clamped,
    ),
    groups,
    cycle: cycles.length > 0 ? [...new Set(cycles)] : null,
    issues: dedupeIssues(issues),
  }
}

// Un ambito por repeticion: con uno comun, cada actividad se calcularia con los ingresos de la
// ultima.
function resolveGroupValues(
  model: RuntimeModel,
  state: PreviewState,
  rootValues: RuntimeValues,
  context?: RuntimeContext,
): Record<string, RuntimeValues[]> {
  const resolved: Record<string, RuntimeValues[]> = {}

  for (const [groupId, fields] of model.groupFields) {
    resolved[groupId] = (state.groups[groupId] ?? []).map((item, index) => {
      // La fila pisa al root: un campo del grupo gana al campo suelto que se llame igual.
      const derived: DerivedResult = computeDerivedValues(
        fields,
        { ...rootValues, ...item },
        model,
        index,
        context,
      )
      const scoped: RuntimeValues = {}

      // Solo se devuelven las columnas del grupo; los valores del root vuelven por su lado.
      for (const field of fields) scoped[field.name] = derived.values[field.name]

      return scoped
    })
  }

  return resolved
}
