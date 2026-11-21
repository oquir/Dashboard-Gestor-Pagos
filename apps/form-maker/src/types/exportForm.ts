import type {
  ApiBinding,
  ConditionOperator,
  CssStyleMap,
  FieldCondition,
  FieldDataSource,
  FieldFileConfig,
  FieldOption,
  TooltipPosition,
} from './field'
import type { DateFormatId } from './fieldDate'
import type { ConceptValueKind } from './fieldConcept'
import type { DraftPayload } from './persistenceTypes'
import type { RichTextContent } from './richText'
import type { FormType } from './setup'

// El concepto sale con su tipo resuelto: el consumidor sabe que valor* llenar sin la tabla de tipos.
export type ExportedApiBinding =
  | Exclude<ApiBinding, { kind: 'concept' }>
  | { kind: 'concept'; idConcepto?: number; tipo: ConceptValueKind }

export interface ExportedCondition {
  field: string
  operator: ConditionOperator
  value?: FieldCondition['value'] | string[]
}

// Misma forma que el script del campo: el consumidor los ejecuta por el mismo camino.
export type ExportedRuleEffect =
  | { id: string; kind: 'script'; script: ExportedScript }
  | { id: string; kind: 'constant'; value: string | number | boolean }

export interface ExportedRule {
  id: string
  label?: string
  matchAll: boolean
  when: ExportedCondition[]
  effects: ExportedRuleEffect[]
}

export interface ExportedValidationVariant {
  when: ExportedCondition
  zodSchema: string
}

// Gana la primera variante que se cumpla; si ninguna, zodSchema. Sin zodSchema el campo no valida
// (presentacional).
export interface ExportedValidations {
  zodSchema?: string
  zodSchemaWhen?: ExportedValidationVariant[]
}

// compiled: cuerpo para new Function sin el preludio (viaja una vez en formSchema.prelude). source
// solo para reeditar: {{campo}} no es JS. reads: para ordenar el calculo sin reparsear.
export interface ExportedScript {
  source: string
  compiled: string
  reads: string[]
}

export interface ExportedLogic {
  script?: ExportedScript
  rules?: ExportedRule[]
}

// content ya sanitizado; styles resuelto a CSS plano como el del campo.
export interface ExportedTooltip {
  content: RichTextContent
  position: TooltipPosition
  styles: CssStyleMap
}

export interface ExportedField {
  fieldId: string
  name: string
  type: string
  label: string
  colStart: number
  colSpan: number
  // Siempre presente, aunque sea {} (ExportedRow.styles es opcional).
  styles: CssStyleMap
  validations: ExportedValidations
  logic: ExportedLogic
  title?: string
  options?: FieldOption[]
  fileConfig?: FieldFileConfig
  alwaysDisabled?: boolean
  enableWhen?: ExportedCondition
  visibleWhen?: ExportedCondition
  apiBinding?: ExportedApiBinding
  dataSource?: FieldDataSource
  labelFor?: string
  content?: RichTextContent
  tooltip?: ExportedTooltip
  rounding?: boolean
  formatted?: boolean
  // Solo aparece en false; ausente admite negativos.
  allowsNegative?: boolean
  decimals?: number
  // Solo en numericos, recortados; nunca entran en el valor.
  prefix?: string
  suffix?: string
  // Recortado; nunca es valor (en un select va como primera opcion).
  placeholder?: string
  // Solo datalist, recortadas y sin repetidas: sugieren, no restringen.
  suggestions?: string[]
  inlineOptions?: boolean
  // Solo en true: el valor es { desde, hasta }.
  dateRange?: boolean
  // Solo en true: el valor es AAAA-MM-DDTHH:mm, sin huso.
  includesTime?: boolean
  // Solo para mostrar y armar el payload: valida y compara sobre AAAA-MM-DD. Ver lib/dateFormat.
  dateFormat?: DateFormatId
  // Frena el tecleo (texto: caracteres; numero: digitos enteros); el schema sigue validando. Ver
  // lib/fieldLength.
  maxLength?: number
}

// Se evalua en el ambito raiz, donde la columna del grupo es el array. Verdadero pasa. Las apagadas
// no se exportan.
export interface ExportedGroupCheck {
  id: string
  label: string
  script: ExportedScript
  message: string
}

export interface ExportedRepeatableGroup {
  groupId: string
  name: string
  title: string
  min: number
  max: number
  arrayPath?: string
  zodSchema: string
  checks?: ExportedGroupCheck[]
}

export interface ExportedRow {
  rowId: string
  columns: number
  groupId?: string
  // Ausente sin estilos.
  styles?: CssStyleMap
  fields: ExportedField[]
}

export interface ExportedStep {
  stepId: string
  title: string
  subtitle?: string
  // Solo en true. No se muestra ni se navega, pero calcula y viaja en el payload.
  hidden?: boolean
  rows: ExportedRow[]
  groups?: ExportedRepeatableGroup[]
}

export interface ProjectMeta {
  formId: string
  formType: FormType | null
  // Fija en "1.0.0", sin significado: sigue porque el consumidor la tipa.
  version: string
  createdAt: string
  // Lo que el consumidor tiene que saber hacer; si no reconoce una palabra, no carga el formulario.
  // Ver lib/formRequires.
  requires: string[]
}

export interface ExportedIntroModal {
  steps: ExportedStep[]
}

export interface ExportedSetupConfig {
  hasIntroModal: boolean
  introModal?: ExportedIntroModal
}

export interface ExportedFormSchema {
  gridBaseColumns: number
  // Compartido por todos los scripts; quien ejecuta lo antepone a cada compiled.
  prelude?: string
  steps: ExportedStep[]
}

export interface FormExport {
  projectMeta: ProjectMeta
  setupConfig: ExportedSetupConfig
  formSchema: ExportedFormSchema
}

// builderDraft: la copia para reabrir en el builder; el consumidor la ignora.
export type FormExportFile = FormExport & { builderDraft: DraftPayload }
