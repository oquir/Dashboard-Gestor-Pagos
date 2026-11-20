import { CANVAS_TOOLBAR_BOX_CLASSES } from '../../../constants/uiClasses'

// Lo comun de la barra vive en uiClasses (tambien la usa PdfToolbar). Capa propia de la barra:
// container-type vuelve al elemento bloque contenedor de los fixed, y en el envoltorio de AppLayout
// vive el chip que abre ModalShell. Sin pointer-events la capa no roba clics.
export const TOOLBAR_LAYER_CLASSES: string =
  '@container/toolbar pointer-events-none absolute inset-x-0 bottom-4 z-30 flex justify-center'

export const TOOLBAR_CLASSES: string = `pointer-events-auto ${CANVAS_TOOLBAR_BOX_CLASSES}`

// Con seleccion la barra mide 726px y a 1280 el lienzo deja 640: bajo 46rem, Fila y Grupo repetible
// quedan con icono.
export const TOOLBAR_COMPACT_LABEL_CLASSES: string = '@max-[46rem]/toolbar:hidden'

export const TOOLBAR_DANGER_CLASSES: string =
  'flex h-8 w-8 items-center justify-center rounded-lg text-fg-muted transition-colors hover:cursor-pointer hover:bg-danger-surface hover:text-danger'
