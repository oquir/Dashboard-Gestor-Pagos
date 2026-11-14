import type { RichTextContent } from '../../../types'

export interface RichTextEditorProps {
  value: RichTextContent | undefined
  onChange: (content: RichTextContent) => void
}
