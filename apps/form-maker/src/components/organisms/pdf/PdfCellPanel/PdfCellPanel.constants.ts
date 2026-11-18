import type { PdfCellContentKind } from '../../../../types'

export const CONTENT_KINDS: { kind: PdfCellContentKind; label: string }[] = [
  { kind: 'text', label: 'Texto' },
  { kind: 'html', label: 'HTML' },
  { kind: 'table', label: 'Tabla' },
  { kind: 'component', label: 'Componente' },
]
