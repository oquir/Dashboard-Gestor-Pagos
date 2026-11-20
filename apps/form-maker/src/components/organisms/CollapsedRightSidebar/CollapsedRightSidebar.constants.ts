// TRAMPA: ni transform, filter, backdrop-filter, will-change ni container-type aca: ModalShell
// (fixed inset-0) se dibuja desde adentro y se mediria contra el chip. Tampoco overflow-hidden:
// recortaria el menu del zoom.
export const CHIP_CLASSES: string =
  'animate-collapsed-panel-in absolute right-4 top-4 z-30 flex items-center gap-1 rounded-xl border border-border bg-surface p-1 shadow-lg dark:bg-surface-raised'

export const NOTICE_CLASSES: string = 'absolute right-4 top-16 z-30 w-80 shadow-lg'
