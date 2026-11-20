import { CANVAS_TOOLBAR_BOX_CLASSES } from '../../../constants/uiClasses'

// Lo comun de la barra (la caja, los grupos, las herramientas) vive en constants/uiClasses.ts porque
// tambien la usa PdfToolbar. Aca queda lo que es solo del lienzo del formulario.
// La capa que centra la barra abajo, de borde a borde del lienzo: centrar con flex y no con
// left-1/2 + translate, y el @container para que la barra sepa cuanto lienzo tiene. Es una capa solo
// de la barra a proposito: container-type aplica contencion de layout, que vuelve al elemento el
// bloque contenedor de los fixed, y en el envoltorio de AppLayout tambien vive el chip plegado, desde
// donde ModalShell abre la revision de Exportar a pantalla completa. Sin pointer-events la capa no le
// roba clics al lienzo; la barra los recupera.
export const TOOLBAR_LAYER_CLASSES: string =
  '@container/toolbar pointer-events-none absolute inset-x-0 bottom-4 z-30 flex justify-center'

export const TOOLBAR_CLASSES: string = `pointer-events-auto ${CANVAS_TOOLBAR_BOX_CLASSES}`

// Con seleccion la barra mide 726 px y a 1280 el lienzo deja 640 (1366 deja justo 726, sin aire):
// por debajo de 46rem "Fila" y "Grupo repetible" se quedan con el icono y su Tooltip. Sin seleccion
// la barra mide 430 px y entra siempre, asi que solo se compacta con seleccion.
export const TOOLBAR_COMPACT_LABEL_CLASSES: string = '@max-[46rem]/toolbar:hidden'

export const TOOLBAR_DANGER_CLASSES: string =
  'flex h-8 w-8 items-center justify-center rounded-lg text-fg-muted transition-colors hover:cursor-pointer hover:bg-danger-surface hover:text-danger'
