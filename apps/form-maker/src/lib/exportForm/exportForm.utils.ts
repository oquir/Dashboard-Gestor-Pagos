import type {
  ExportedApiBinding,
  ExportedCondition,
  ExportedGroupCheck,
  ExportedRepeatableGroup,
  ExportedRow,
  ExportedRule,
  ExportedScript,
  ExportedStep,
  ExportedValidations,
  ExportedValidationVariant,
} from '../../types/exportForm'
import type {
  ApiBinding,
  CanvasField,
  CatalogFill,
  FieldCondition,
  FieldDataSource,
} from '../../types/field'
import type { ConceptValueKind } from '../../types/fieldConcept'
import type { CanvasRow, FormStep, RepeatableGroup } from '../../types/formStructure'
import { resolveFieldStyles, resolveRowStyles } from '../cssStyles/cssStyles'
import { affixOf } from '../fieldAffix/fieldAffix'
import { conceptKindOf } from '../fieldConcept/fieldConcept'
import { operatorTakesList, parseConditionList } from '../fieldCondition/fieldCondition'
import {
  exportableDateFormat,
  exportableDateRange,
  exportableIncludesTime,
} from '../fieldDate/fieldDate'
import { isPresentationalField } from '../fieldKind/fieldKind'
import { exportableMaxLength } from '../fieldLength/fieldLength'
import { exportableInlineOptions, exportableOptions } from '../fieldOptions/fieldOptions'
import { placeholderOf } from '../fieldPlaceholder/fieldPlaceholder'
import { exportableDecimals, exportableRounding } from '../fieldRounding/fieldRounding'
import { compileScript } from '../fieldScript/fieldScript'
import { exportableAllowsNegative } from '../fieldSign/fieldSign'
import { suggestionsOf } from '../fieldSuggestions/fieldSuggestions'
import { exportableTooltip } from '../fieldTooltip/fieldTooltip'
import { enabledChecks } from '../groupCheck/groupCheck'
import { exportableFormatting } from '../numberFormat/numberFormat'
import { groupFields } from '../repeatableGroup/repeatableGroup'
import { buildGroupZodSchema, buildOverrideZodSchema, buildZodSchema } from '../zodSchema/zodSchema'

// Del modelo interno al contrato de salida: hacia afuera no viaja ningun uuid, cada referencia es
// un nombre.

export function buildNameIndex(rows: CanvasRow[]): Map<string, string> {
  const index: Map<string, string> = new Map()

  for (const row of rows) {
    for (const field of row.fields) {
      index.set(field.id, field.name)
    }
  }

  return index
}

export function resolveCondition(
  condition: FieldCondition | undefined,
  names: Map<string, string>,
): ExportedCondition | undefined {
  if (!condition) return undefined

  // Los operadores de lista salen ya partidos en array.
  return {
    field: names.get(condition.fieldId) ?? condition.fieldId,
    operator: condition.operator,
    value: operatorTakesList(condition.operator)
      ? parseConditionList(condition.value)
      : condition.value,
  }
}

// Un override que apunta a un campo borrado se descarta, como visibleWhen.
export function resolveValidations(
  field: CanvasField,
  names: Map<string, string>,
): ExportedValidations {
  if (isPresentationalField(field.type)) return {}

  const variants: ExportedValidationVariant[] = (field.validations.overrides ?? []).flatMap(
    (override) => {
      const when: ExportedCondition | undefined = resolveCondition(override.when, names)
      if (!when || !names.has(override.when.fieldId)) return []

      return [{ when, zodSchema: buildOverrideZodSchema(field, override) }]
    },
  )

  return {
    zodSchema: buildZodSchema(field),
    ...(variants.length > 0 ? { zodSchemaWhen: variants } : {}),
  }
}

// Se compila aca y no en el consumidor: {{campo}} no es JS, y repartir el recorrido seria repartir
// lo delicado.
function compileSource(source: string, knownNames: Set<string>): ExportedScript {
  const { code, reads } = compileScript(source, knownNames)

  return { source, compiled: code, reads }
}

export function resolveScript(
  field: CanvasField,
  knownNames: Set<string>,
): ExportedScript | undefined {
  // Un campo presentacional no tiene valor que calcular, igual que no tiene validaciones.
  if (isPresentationalField(field.type)) return undefined

  const source: string = field.logic.script ?? ''
  if (source.trim().length === 0) return undefined

  return compileSource(source, knownNames)
}

export function resolveRules(
  field: CanvasField,
  names: Map<string, string>,
  knownNames: Set<string>,
): ExportedRule[] | undefined {
  if (!field.logic.rules || field.logic.rules.length === 0) return undefined

  return field.logic.rules.map((rule) => ({
    id: rule.id,
    label: rule.label,
    matchAll: rule.matchAll,
    when: rule.when.map((condition) => ({
      field: names.get(condition.fieldId) ?? condition.fieldId,
      operator: condition.operator,
      value: operatorTakesList(condition.operator)
        ? parseConditionList(condition.value)
        : condition.value,
    })),
    effects: rule.effects.map((effect) =>
      effect.kind === 'constant'
        ? effect
        : {
            id: effect.id,
            kind: 'script' as const,
            script: compileSource(effect.source, knownNames),
          },
    ),
  }))
}

// El tipo de dato del concepto se calcula al salir; un presentacional no sale como concepto.
function resolveApiBinding(field: CanvasField): ExportedApiBinding | undefined {
  const binding: ApiBinding | undefined = field.apiBinding
  if (binding?.kind !== 'concept') return binding

  const tipo: ConceptValueKind | null = conceptKindOf(field.type)
  return tipo === null ? undefined : { ...binding, tipo }
}

export function resolveDataSource(
  field: CanvasField,
  names: Map<string, string>,
): FieldDataSource | undefined {
  const source: FieldDataSource | undefined = field.dataSource
  if (!source) return undefined

  // Un relleno a un destino borrado se descarta.
  const fills: CatalogFill[] | undefined = source.fills?.flatMap((fill) => {
    const name: string | undefined = names.get(fill.field)

    return name ? [{ column: fill.column, field: name }] : []
  })

  return {
    catalog: source.catalog,
    dependsOn: source.dependsOn ? (names.get(source.dependsOn) ?? source.dependsOn) : undefined,
    fills: fills && fills.length > 0 ? fills : undefined,
  }
}

export function mapRows(
  rows: CanvasRow[],
  names: Map<string, string>,
  knownNames: Set<string>,
): ExportedRow[] {
  return rows.map((row) => ({
    rowId: row.id,
    columns: row.columns,
    groupId: row.groupId,
    styles: resolveRowStyles(row.styles),
    fields: row.fields.map((field) => ({
      fieldId: field.id,
      name: field.name,
      type: field.type,
      label: field.label,
      colStart: field.colStart,
      colSpan: field.colSpan,
      styles: resolveFieldStyles(field.styles),
      // Solo el schema como texto: que no haya schema es como el consumidor sabe que un
      // presentacional no valida.
      validations: resolveValidations(field, names),
      logic: {
        script: resolveScript(field, knownNames),
        rules: resolveRules(field, names, knownNames),
      },
      title: field.title,
      options: exportableOptions(field),
      fileConfig: field.fileConfig,
      alwaysDisabled: field.alwaysDisabled,
      enableWhen: resolveCondition(field.enableWhen, names),
      visibleWhen: resolveCondition(field.visibleWhen, names),
      apiBinding: resolveApiBinding(field),
      dataSource: resolveDataSource(field, names),
      labelFor: field.labelFor ? (names.get(field.labelFor) ?? field.labelFor) : undefined,
      content: field.content,
      tooltip: exportableTooltip(field),
      rounding: exportableRounding(field),
      formatted: exportableFormatting(field),
      allowsNegative: exportableAllowsNegative(field),
      decimals: exportableDecimals(field),
      prefix: affixOf(field, 'prefix'),
      suffix: affixOf(field, 'suffix'),
      placeholder: placeholderOf(field),
      suggestions: suggestionsOf(field),
      inlineOptions: exportableInlineOptions(field),
      dateRange: exportableDateRange(field),
      includesTime: exportableIncludesTime(field),
      dateFormat: exportableDateFormat(field),
      maxLength: exportableMaxLength(field),
    })),
  }))
}

// Solo las encendidas y sin bandera: apagar una comprobacion la borra del contrato.
function resolveChecks(
  group: RepeatableGroup,
  knownNames: Set<string>,
): ExportedGroupCheck[] | undefined {
  const checks: ExportedGroupCheck[] = enabledChecks(group.checks).map((check) => ({
    id: check.id,
    label: check.label,
    script: compileSource(check.script, knownNames),
    message: check.message,
  }))

  return checks.length > 0 ? checks : undefined
}

export function mapGroups(
  step: FormStep,
  knownNames: Set<string>,
): ExportedRepeatableGroup[] | undefined {
  if (!step.groups || step.groups.length === 0) return undefined

  return step.groups.map((group) => ({
    groupId: group.id,
    name: group.name,
    title: group.title,
    min: group.min,
    max: group.max,
    arrayPath: group.arrayPath,
    zodSchema: buildGroupZodSchema(group, groupFields(step.rows, group.id)),
    checks: resolveChecks(group, knownNames),
  }))
}

export function mapFormStep(
  step: FormStep,
  names: Map<string, string>,
  knownNames: Set<string>,
): ExportedStep {
  return {
    stepId: step.stepId,
    title: step.title,
    subtitle: step.subtitle || undefined,
    hidden: step.hidden ? true : undefined,
    rows: mapRows(step.rows, names, knownNames),
    groups: mapGroups(step, knownNames),
  }
}
