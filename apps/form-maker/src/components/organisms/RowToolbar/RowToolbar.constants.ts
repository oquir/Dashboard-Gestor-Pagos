// Mide 24px y va en -top-5: entra en el hueco entre filas sin tapar la X del ultimo campo. z-20
// porque la barra es su propio contexto de apilamiento.
export const ROW_TOOLBAR_CLASSES: string =
  'absolute -top-5 right-2 z-20 flex items-center gap-0.5 rounded-lg border border-border bg-surface p-0.5 shadow-sm dark:bg-surface-raised'

export const ROW_TOOLBAR_DANGER_ITEM_CLASSES: string =
  'flex h-5 w-5 items-center justify-center rounded-md text-fg-muted transition-colors hover:bg-danger-surface hover:text-danger hover:cursor-pointer'
