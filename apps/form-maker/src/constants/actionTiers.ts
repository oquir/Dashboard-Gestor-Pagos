// La jerarquia de los botones de accion (docs/Decisiones.md, "Button hierarchy"). Solo el peso visual
// cambia entre niveles y el unico naranja es el primario: la importancia se lee en el relleno, el
// borde y el color del texto, no en mas color.
//   primary    lo principal de la pantalla: Subir.
//   secondary  lo que se usa a menudo: Simulador, Diseñar PDF, Descargar HTML.
//   tertiary   lo ocasional: Guardar, Abrir, Exportar, Volver.
//   quiet      solo icono y sin borde: el modo oscuro.
// El texto informativo va en fg-muted como minimo (>= 4.5:1), nunca fg-subtle.

export type ActionTier = 'primary' | 'secondary' | 'tertiary' | 'quiet'

// compact: filas apretadas (panel y chip). regular: cabeceras. icon: solo icono.
export type ActionSize = 'compact' | 'regular' | 'icon'

// Sin cursor aqui: cada nivel pone el suyo (el estado "Guardado" pide not-allowed).
export const ACTION_BASE_CLASSES: string =
  'flex items-center justify-center rounded-md font-medium press'

export const ACTION_SIZE_CLASSES: Record<ActionSize, string> = {
  compact: 'gap-1.5 px-2.5 py-1 text-xs',
  regular: 'gap-1.5 px-3 py-1.5 text-xs',
  icon: 'p-1.5',
}

const TIER_CLASSES: Record<ActionTier, string> = {
  primary:
    'bg-brand-strong text-on-brand-strong hover:bg-brand-strong/90 hover:cursor-pointer disabled:cursor-wait disabled:opacity-80 disabled:hover:bg-brand-strong',
  secondary:
    'border border-border-strong text-fg-strong hover:bg-surface-raised hover:cursor-pointer',
  tertiary:
    'text-fg-muted hover:bg-surface-raised hover:text-fg-strong hover:cursor-pointer dark:hover:bg-surface-inset',
  quiet:
    'text-fg-muted hover:bg-surface-raised hover:text-fg-strong hover:cursor-pointer dark:hover:bg-surface-inset',
}

function compose(tier: ActionTier, size: ActionSize): string {
  return `${ACTION_BASE_CLASSES} ${ACTION_SIZE_CLASSES[size]} ${TIER_CLASSES[tier]}`
}

export const ACTION_TIER_CLASSES: Record<ActionTier, Record<ActionSize, string>> = {
  primary: {
    compact: compose('primary', 'compact'),
    regular: compose('primary', 'regular'),
    icon: compose('primary', 'icon'),
  },
  secondary: {
    compact: compose('secondary', 'compact'),
    regular: compose('secondary', 'regular'),
    icon: compose('secondary', 'icon'),
  },
  tertiary: {
    compact: compose('tertiary', 'compact'),
    regular: compose('tertiary', 'regular'),
    icon: compose('tertiary', 'icon'),
  },
  quiet: {
    compact: compose('quiet', 'compact'),
    regular: compose('quiet', 'regular'),
    icon: compose('quiet', 'icon'),
  },
}
