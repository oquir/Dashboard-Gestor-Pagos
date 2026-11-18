// Lo comun de la barra (la caja, los grupos, las herramientas) vive en constants/uiClasses.ts porque
// tambien la usa PdfToolbar. Aca queda lo que es solo del lienzo del formulario.
export const TOOLBAR_DANGER_CLASSES: string =
  'flex h-8 w-8 items-center justify-center rounded-lg text-fg-muted transition-colors hover:cursor-pointer hover:bg-danger-surface hover:text-danger'
