import { slugifyFieldName } from '../fieldName/fieldName'
import { formulaToScript, upgradeFieldRefs } from '../scriptMigration/scriptMigration'
import { DRAFT_SCHEMA_VERSION } from './persistence.constants'
import type { DraftMigration, FieldMigration, LooseDraft } from './persistence.types'

// Migraciones del borrador, indexadas por version de origen (MIGRATIONS[1] lleva de 1 a 2).
// Trabajan sobre el objeto crudo antes de validar: agregan o transforman claves y Zod juzga.

function isRecord(value: unknown): value is LooseDraft {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function mapStepFields(step: unknown, migrate: FieldMigration): unknown {
  if (!isRecord(step) || !Array.isArray(step.rows)) return step

  return {
    ...step,
    rows: step.rows.map((row) => {
      if (!isRecord(row) || !Array.isArray(row.fields)) return row

      return {
        ...row,
        fields: row.fields.map((field) => (isRecord(field) ? migrate(field) : field)),
      }
    }),
  }
}

// Tambien savedComponents (el almacen, hasta la v5): las migraciones viejas corren antes de la 4 ->
// 5 que lo borra.
function mapDraftFields(draft: LooseDraft, migrate: FieldMigration): LooseDraft {
  const introModal: unknown = draft.introModal

  return {
    ...draft,
    formSteps: Array.isArray(draft.formSteps)
      ? draft.formSteps.map((step) => mapStepFields(step, migrate))
      : draft.formSteps,
    introModal:
      isRecord(introModal) && Array.isArray(introModal.steps)
        ? { ...introModal, steps: introModal.steps.map((step) => mapStepFields(step, migrate)) }
        : introModal,
    savedComponents: Array.isArray(draft.savedComponents)
      ? draft.savedComponents.map((component) =>
          isRecord(component) ? migrate(component) : component,
        )
      : draft.savedComponents,
  }
}

// Una formula que no parsea se conserva como comentario en el script (el editor guardaba lo
// tecleado a medias). El campo deja de calcular en vez de inventar.
function preservedFormula(formula: string): string {
  const quoted: string = formula
    .split('\n')
    .map((line) => `// ${line}`)
    .join('\n')

  return `// Esta formula no se pudo traducir al migrar. Reescribila como script:\n${quoted}\nreturn undefined;`
}

function formulaToScriptField(field: LooseDraft): LooseDraft {
  const logic: unknown = field.logic
  if (!isRecord(logic) || typeof logic.formula !== 'string') return field

  const { formula, ...rest } = logic

  return {
    ...field,
    logic: { ...rest, script: formulaToScript(formula) ?? preservedFormula(formula) },
  }
}

function formulaToScriptEffect(effect: unknown): unknown {
  if (!isRecord(effect) || effect.kind !== 'formula' || typeof effect.expression !== 'string') {
    return effect
  }

  return {
    id: effect.id,
    kind: 'script',
    source: formulaToScript(effect.expression) ?? preservedFormula(effect.expression),
  }
}

// Lo que no esta en la tabla se conserva como comentario CSS.
const TAILWIND_TO_CSS: Record<string, string> = {
  'font-bold': 'font-weight: 700',
  'font-semibold': 'font-weight: 600',
  'font-medium': 'font-weight: 500',
  'font-normal': 'font-weight: 400',
  italic: 'font-style: italic',
  'not-italic': 'font-style: normal',
  underline: 'text-decoration: underline',
  uppercase: 'text-transform: uppercase',
  lowercase: 'text-transform: lowercase',
  capitalize: 'text-transform: capitalize',
  'text-left': 'text-align: left',
  'text-center': 'text-align: center',
  'text-right': 'text-align: right',
  'text-justify': 'text-align: justify',
  hidden: 'display: none',
  block: 'display: block',
  'inline-block': 'display: inline-block',
  flex: 'display: flex',
}

function classesToCss(classes: string): string {
  const tokens: string[] = classes.split(/\s+/).filter((token) => token.length > 0)
  const mapped: string[] = []
  const unmapped: string[] = []

  for (const token of tokens) {
    const css: string | undefined = TAILWIND_TO_CSS[token]
    if (css) mapped.push(`${css};`)
    else unmapped.push(token)
  }

  if (unmapped.length > 0) {
    mapped.push(
      `/* Estas clases de Tailwind no se pudieron traducir al migrar, reescribilas como CSS: ${unmapped.join(' ')} */`,
    )
  }

  return mapped.join('\n')
}

// Campo, fila y tooltip comparten la misma forma de migracion.
function migrateStyleHolder(holder: unknown): unknown {
  if (!isRecord(holder) || typeof holder.customClasses !== 'string') return holder

  const { customClasses, ...rest } = holder

  return { ...rest, customCss: classesToCss(customClasses) }
}

function fieldClassesToCss(field: LooseDraft): LooseDraft {
  return {
    ...field,
    styles: migrateStyleHolder(field.styles),
    tooltip: migrateStyleHolder(field.tooltip),
  }
}

function rowClassesToCss(row: LooseDraft): LooseDraft {
  return { ...row, styles: migrateStyleHolder(row.styles) }
}

type RowMigration = (row: LooseDraft) => LooseDraft

function mapStepRows(step: unknown, migrate: RowMigration): unknown {
  if (!isRecord(step) || !Array.isArray(step.rows)) return step

  return {
    ...step,
    rows: step.rows.map((row) => (isRecord(row) ? migrate(row) : row)),
  }
}

// mapDraftFields no llega a row.styles: hace falta este recorrido.
function mapDraftRows(draft: LooseDraft, migrate: RowMigration): LooseDraft {
  const introModal: unknown = draft.introModal

  return {
    ...draft,
    formSteps: Array.isArray(draft.formSteps)
      ? draft.formSteps.map((step) => mapStepRows(step, migrate))
      : draft.formSteps,
    introModal:
      isRecord(introModal) && Array.isArray(introModal.steps)
        ? { ...introModal, steps: introModal.steps.map((step) => mapStepRows(step, migrate)) }
        : introModal,
  }
}

function ruleFormulasToScripts(field: LooseDraft): LooseDraft {
  const logic: unknown = field.logic
  if (!isRecord(logic) || !Array.isArray(logic.rules)) return field

  return {
    ...field,
    logic: {
      ...logic,
      rules: logic.rules.map((rule) => {
        if (!isRecord(rule) || !Array.isArray(rule.effects)) return rule

        return { ...rule, effects: rule.effects.map(formulaToScriptEffect) }
      }),
    },
  }
}

// Los nombres contra los que el compilador viejo decidia que {x} era campo (los dos lienzos; un
// campo sin nombre toma el slug de su rotulo).
function collectDraftNames(draft: LooseDraft): Set<string> {
  const names = new Set<string>()
  const introModal: unknown = draft.introModal
  const steps: unknown[] = [
    ...(Array.isArray(draft.formSteps) ? draft.formSteps : []),
    ...(isRecord(introModal) && Array.isArray(introModal.steps) ? introModal.steps : []),
  ]

  for (const step of steps) {
    if (!isRecord(step) || !Array.isArray(step.rows)) continue

    for (const row of step.rows) {
      if (!isRecord(row) || !Array.isArray(row.fields)) continue

      for (const field of row.fields) {
        if (!isRecord(field)) continue

        if (typeof field.name === 'string' && field.name.length > 0) names.add(field.name)
        else if (typeof field.label === 'string') names.add(slugifyFieldName(field.label))
      }
    }
  }

  return names
}

function upgradeRuleRefs(rule: unknown, names: Set<string>): unknown {
  if (!isRecord(rule) || !Array.isArray(rule.effects)) return rule

  return {
    ...rule,
    effects: rule.effects.map((effect) =>
      isRecord(effect) && effect.kind === 'script' && typeof effect.source === 'string'
        ? { ...effect, source: upgradeFieldRefs(effect.source, names) }
        : effect,
    ),
  }
}

function upgradeFieldLogicRefs(field: LooseDraft, names: Set<string>): LooseDraft {
  const logic: unknown = field.logic
  if (!isRecord(logic)) return field

  const next: LooseDraft = { ...logic }
  if (typeof logic.script === 'string') next.script = upgradeFieldRefs(logic.script, names)
  if (Array.isArray(logic.rules)) {
    next.rules = logic.rules.map((rule) => upgradeRuleRefs(rule, names))
  }

  return { ...field, logic: next }
}

type GroupMigration = (group: LooseDraft) => LooseDraft

// Los grupos repetibles solo existen en los pasos del formulario: el modal de entrada no tiene.
function mapDraftGroups(draft: LooseDraft, migrate: GroupMigration): LooseDraft {
  if (!Array.isArray(draft.formSteps)) return draft

  return {
    ...draft,
    formSteps: draft.formSteps.map((step) => {
      if (!isRecord(step) || !Array.isArray(step.groups)) return step

      return {
        ...step,
        groups: step.groups.map((group) => (isRecord(group) ? migrate(group) : group)),
      }
    }),
  }
}

function upgradeGroupCheckRefs(group: LooseDraft, names: Set<string>): LooseDraft {
  if (!Array.isArray(group.checks)) return group

  return {
    ...group,
    checks: group.checks.map((check) =>
      isRecord(check) && typeof check.script === 'string'
        ? { ...check, script: upgradeFieldRefs(check.script, names) }
        : check,
    ),
  }
}

// Todos los sitios con script, el preludio tambien: un {campo} ahi pasaria a ser un objeto literal
// sin aviso.
function upgradeDraftRefs(draft: LooseDraft): LooseDraft {
  const names: Set<string> = collectDraftNames(draft)
  const withFields: LooseDraft = mapDraftFields(draft, (field) =>
    upgradeFieldLogicRefs(field, names),
  )
  const withGroups: LooseDraft = mapDraftGroups(withFields, (group) =>
    upgradeGroupCheckRefs(group, names),
  )

  return {
    ...withGroups,
    formScript:
      typeof draft.formScript === 'string'
        ? upgradeFieldRefs(draft.formScript, names)
        : draft.formScript,
  }
}

const MIGRATIONS: Record<number, DraftMigration> = {
  // 1 -> 2: aparece el preludio del formulario.
  1: (draft) => ({ ...draft, formScript: '' }),
  // 2 -> 3: la formula pasa a ser un script.
  2: (draft) => mapDraftFields(draft, formulaToScriptField),
  // 3 -> 4: los efectos de regla dejan la formula y hablan el mismo lenguaje que el campo.
  3: (draft) => mapDraftFields(draft, ruleFormulasToScripts),
  // 4 -> 5: se borra el almacen de partes. La clave se borra a proposito: z.object la ignoraria y
  // quedaria en localStorage para siempre.
  4: (draft) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- se saca de la copia a proposito
    const { savedComponents, ...resto } = draft

    return resto
  },
  // 5 -> 6: Tailwind del campo, la fila y el tooltip a CSS plano (en el consumidor solo funcionaba
  // por casualidad).
  5: (draft) => mapDraftRows(mapDraftFields(draft, fieldClassesToCss), rowClassesToCss),
  // 6 -> 7: {campo} a {{campo}}, solo lo que el compilador de entonces sustituia: compila al mismo
  // cuerpo.
  6: upgradeDraftRefs,
}

// Un hueco en la cadena devuelve la version vieja, que el esquema rechaza: mejor que estampar una
// version falsa.
export function migrateDraft(draft: LooseDraft): LooseDraft {
  let current: LooseDraft = draft
  let version: number = typeof draft.schemaVersion === 'number' ? draft.schemaVersion : 1

  while (version < DRAFT_SCHEMA_VERSION) {
    const step: DraftMigration | undefined = MIGRATIONS[version]
    if (!step) return current

    version += 1
    current = { ...step(current), schemaVersion: version }
  }

  return current
}
