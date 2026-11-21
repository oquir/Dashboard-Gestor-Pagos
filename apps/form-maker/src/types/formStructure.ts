import type { CanvasField } from './field'
import type { GroupCheck } from './groupCheck'

// Sin backgroundColor ni textColor a proposito: una fila es layout, no algo que se lee.
export interface RowStyles {
  customCss?: string
  marginTop?: string
  marginBottom?: string
}

export interface CanvasRow {
  id: string
  columns: number
  fields: CanvasField[]
  groupId?: string
  styles?: RowStyles
}

export interface RepeatableGroup {
  id: string
  name: string
  title: string
  min: number
  max: number
  arrayPath?: string
  checks?: GroupCheck[]
}

export interface FormStep {
  stepId: string
  title: string
  subtitle?: string
  // No se muestra ni se navega, pero calcula y viaja en el payload: quita un paso sin dejar en cero
  // los totales que dependen de el.
  hidden?: boolean
  rows: CanvasRow[]
  groups?: RepeatableGroup[]
}

export interface IntroModalStep {
  stepId: string
  title: string
  subtitle?: string
  rows: CanvasRow[]
}

export interface IntroModalState {
  steps: IntroModalStep[]
}

export type IntroStepTemplate = Omit<IntroModalStep, 'stepId'>
export type FormStepTemplate = Omit<FormStep, 'stepId'>
