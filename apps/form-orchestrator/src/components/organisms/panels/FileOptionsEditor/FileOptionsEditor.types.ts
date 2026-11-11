import type { CanvasField } from '../../../../types'

export interface FileOptionsEditorProps {
  field: CanvasField
}

export interface FileFormatPreset {
  id: string
  label: string
  tokens: string[]
}
