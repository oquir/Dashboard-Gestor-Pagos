import type { Tax } from '../types'

/** Estilo común de los controles de formulario: Input, Select y Textarea. */
export const FIELD_CLASS =
  'block w-full rounded-lg border-0 bg-surface px-3 py-2 text-sm text-fg-strong ring-1 ring-inset ring-border-strong placeholder:text-fg-subtle focus:ring-2 focus:ring-brand-border disabled:bg-surface-sunken disabled:text-fg-muted'

/** Botón de una fila de tabla que abre su detalle con el código del registro: el N.º de la bitácora o el RIT. */
export const ROW_BUTTON_CLASS =
  'inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-lg bg-surface px-2.5 text-sm font-medium tabular-nums text-fg-strong shadow-sm ring-1 ring-inset ring-border-strong transition-colors hover:bg-brand-surface hover:text-brand-fg hover:ring-brand-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-border'

/** Color de cada impuesto en las gráficas: las series del recaudo y las barras de los reportes. */
export const SERIES_CLASS: Record<Tax, string> = {
  ica: 'bg-serie-ica',
  reteica: 'bg-serie-reteica',
  selfWithholding: 'bg-serie-autorretencion',
}

/** Colores del Reporte general: uno por municipio, el mismo en las barras y en las líneas. */
export const MUNICIPALITY_COLORS = [
  'var(--ui-serie-ica)',
  'var(--ui-serie-reteica)',
  'var(--ui-serie-autorretencion)',
  '#8b5cf6',
  '#f59e0b',
  '#ec4899',
  '#14b8a6',
  '#ef4444',
] as const

/** Color del municipio i-ésimo; el módulo evita repetir tono si algún día hay más municipios. */
export const municipalityColor = (index: number) =>
  MUNICIPALITY_COLORS[index % MUNICIPALITY_COLORS.length]
