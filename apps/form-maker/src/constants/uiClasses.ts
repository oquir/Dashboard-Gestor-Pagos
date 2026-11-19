// Clases de Tailwind que se repetian igual, letra por letra, en varios paneles y tarjetas del
// sidebar. Viven aca para que cambiar un token de diseno (index.css) no dependa de encontrar cada
// copia; donde el texto crudo no coincidia con el token (colores de dark mode escritos a mano) se
// tomo el token como version correcta y se ajusto el archivo que se desviaba.

export const HINT_CLASSES: string = 'text-[11px] text-fg-subtle'

export const ERROR_CLASSES: string = 'text-[11px] text-danger'

export const WARNING_CLASSES: string = 'text-[11px] text-warning'

// El aviso en caja, con borde y fondo, a diferencia de WARNING_CLASSES que es solo texto.
export const WARNING_BANNER_CLASSES: string =
  'rounded border border-warning-border bg-warning-surface px-2 py-1 text-[11px] text-warning'

// La insignia dice de un vistazo cuales estan cargados, que es lo que uno viene a mirar a estas
// pestanas. Cargado en verde y vacio en gris: el color hace el barrido, no el texto.
export const BADGE_LOADED_CLASSES: string =
  'rounded-md border border-emerald-300 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300'

export const BADGE_EMPTY_CLASSES: string =
  'rounded-md border border-border bg-surface px-1.5 py-0.5 text-[10px] font-semibold text-fg-subtle'

export const INPUT_CLASSES: string =
  'w-full rounded-md border border-border bg-field px-2 py-1 text-xs text-fg outline-none focus:border-brand-border'

export const TEXTAREA_CLASSES: string = `${INPUT_CLASSES} h-24 resize-y font-mono`

export const SELECT_CLASSES: string =
  'min-w-0 flex-1 rounded-md border border-border bg-field px-2 py-1 text-xs text-fg outline-none focus:border-brand-border'

export const ACTION_CLASSES: string =
  'shrink-0 text-xs font-medium text-brand-fg hover:cursor-pointer hover:text-brand-hover'

export const COUNT_CLASSES: string =
  'rounded-md border border-border bg-surface px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-fg-muted'

export const ADD_LINK_CLASSES: string =
  'text-xs font-medium text-brand-fg hover:cursor-pointer hover:text-brand-hover disabled:cursor-not-allowed disabled:opacity-40'

// El cromo del lienzo (tiradores, barra de fila, botones de borrar) aparece al pasar por encima y
// se queda fijo en lo que esta seleccionado o enfocado: el hover solo no existe ni para el teclado
// ni para una pantalla tactil. Son dos cadenas literales y no una funcion con el nombre del grupo
// como argumento porque Tailwind v4 lee el codigo fuente: una clase armada en tiempo de ejecucion
// no llega nunca al CSS. Cada elemento pone su propia transicion, asi que aca no va ninguna.
export const CHROME_ON_FIELD_CLASSES: string =
  'opacity-0 group-hover/field:opacity-100 group-focus-within/field:opacity-100'

export const CHROME_ON_ROW_CLASSES: string =
  'opacity-0 group-hover/row:opacity-100 group-focus-within/row:opacity-100'

export const CHROME_PINNED_CLASSES: string = 'opacity-100'

// El icono de adentro del control de muestra (la calculadora, el calendario, la lupa) se esconde
// cuando el campo es tan angosto que no deja ver ni el texto, como el DV con los dos paneles
// abiertos. Es una container query sobre el ancho real del contenido del chip, que depende de la
// fila, de los paneles y de la pantalla. Los iconos de la cabecera no usan esto: deciden con el
// largo de su propio nombre (ver CanvasFieldChip).
export const NARROW_FIELD_HIDDEN_CLASSES: string = '@max-[5rem]:hidden'

// La barra de herramientas de una fila del lienzo. El disparador y el desplegable los dibujan
// RowColumnsMenu y RowStylesMenu, que viven en otra carpeta, asi que las clases no pueden quedarse
// privadas dentro de RowToolbar.
export const ROW_TOOLBAR_ITEM_CLASSES: string =
  'flex h-5 items-center justify-center rounded-md px-1.5 text-[10px] font-medium text-fg-muted transition-colors hover:bg-surface-raised hover:text-fg-strong hover:cursor-pointer dark:hover:bg-surface-inset'

export const ROW_TOOLBAR_ICON_ITEM_CLASSES: string =
  'flex h-5 w-5 items-center justify-center rounded-md text-fg-muted transition-colors hover:bg-surface-raised hover:text-fg-strong hover:cursor-pointer dark:hover:bg-surface-inset'

// El desplegable cuelga de la barra, que esta pegada al borde derecho de la fila: abriendose hacia
// la derecha se saldria del lienzo.
export const ROW_TOOLBAR_POPOVER_CLASSES: string =
  'absolute right-0 top-6 z-20 flex w-72 origin-top-right animate-pop-in flex-col gap-2 rounded-md border border-border bg-surface p-3 shadow-lg dark:bg-surface-raised'

// Las acciones con texto de la barra flotante del lienzo. Las comparten CanvasToolbar,
// MoveToStepMenu y CollapsedRightSidebar, que viven en carpetas distintas.
export const CANVAS_TOOLBAR_ACTION_CLASSES: string =
  'flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-fg-soft transition-colors hover:cursor-pointer hover:bg-surface-raised hover:text-fg-strong disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-fg-soft dark:hover:bg-surface-inset'

// La accion de solo icono y el separador de esa misma barra. Bajaron aca cuando el chip del panel
// derecho plegado, que es su hermano visual, empezo a necesitarlos desde otra carpeta.
export const CANVAS_TOOLBAR_ICON_ACTION_CLASSES: string =
  'flex h-8 w-8 items-center justify-center rounded-lg text-fg-muted transition-colors hover:cursor-pointer hover:bg-surface-raised hover:text-fg-strong dark:hover:bg-surface-inset disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-fg-muted dark:disabled:hover:bg-transparent'

export const CANVAS_TOOLBAR_DIVIDER_CLASSES: string = 'mx-0.5 h-5 w-px bg-border'

// La barra flotante del lienzo del formulario (CanvasToolbar) y la del diseñador de PDF (PdfToolbar):
// misma caja, mismos grupos, mismas herramientas. Flota sobre el lienzo sin desplazarse ni escalarse,
// centrada abajo como la barra de Figma.
export const CANVAS_TOOLBAR_CLASSES: string =
  'absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1 rounded-xl border border-border bg-surface p-1 shadow-lg dark:bg-surface-raised'

export const CANVAS_TOOLBAR_GROUP_CLASSES: string = 'flex items-center gap-0.5'

export const CANVAS_TOOL_BUTTON_BASE_CLASSES: string =
  'flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:cursor-pointer'

// La herramienta activa si va en naranja, a diferencia de la vista del panel derecho: la herramienta
// cambia lo que hace un clic sobre el lienzo, y seguir en el modo equivocado sin notarlo es
// seleccionar o desplazar cuando se queria mover. Tiene que verse de reojo.
export const CANVAS_TOOL_BUTTON_ACTIVE_CLASSES: string = 'bg-brand text-on-brand'

export const CANVAS_TOOL_BUTTON_INACTIVE_CLASSES: string =
  'text-fg-muted hover:bg-surface-raised hover:text-fg-strong dark:hover:bg-surface-inset'

// Bajo rendimiento prendido: tinte de marca y no el naranja lleno de la herramienta activa. No es
// una herramienta (no cambia lo que hace un clic) y no debe leerse como una cuarta.
export const CANVAS_PERFORMANCE_ON_CLASSES: string =
  'bg-brand-surface text-brand-fg hover:bg-brand-surface'

export const CANVAS_SELECTION_COUNT_CLASSES: string =
  'px-2 text-xs font-semibold tabular-nums text-fg-strong'

// El control segmentado: riel hundido con la opcion activa en pastilla elevada. Lo comparten
// ViewModeSwitch y PayloadDestinationSwitch. El activo no va en naranja aunque sea la eleccion
// vigente: el naranja del panel esta reservado para Exportar, que es la unica accion primaria, y
// dos naranjas a un centimetro de distancia se disputan la mirada.
export const SWITCH_TRACK_CLASSES: string =
  'flex gap-0.5 rounded-lg border border-border bg-surface-sunken p-[3px]'

export const SWITCH_ITEM_BASE_CLASSES: string =
  'flex h-7 flex-1 items-center justify-center gap-1.5 rounded-md text-[11px] transition-colors hover:cursor-pointer'

export const SWITCH_ITEM_ACTIVE_CLASSES: string =
  'bg-surface font-semibold text-fg-strong shadow-sm dark:bg-surface-inset'

export const SWITCH_ITEM_INACTIVE_CLASSES: string = 'font-medium text-fg-muted hover:text-fg-strong'

// Los botones chicos de los paneles del diseñador de PDF (agregar fila, combinar, negrilla…).
// Contorno y no relleno: son muchos juntos, y con fondo la barra se volveria una pared de botones.
export const PANEL_BUTTON_CLASSES: string =
  'flex h-7 items-center justify-center gap-1 rounded-md border border-border px-2 text-[11px] font-medium text-fg-soft transition-colors hover:cursor-pointer hover:border-border-strong hover:text-fg-strong disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:text-fg-soft'

// Un boton de alternar (negrilla, alineacion) cuando esta puesto.
export const PANEL_BUTTON_ON_CLASSES: string = 'border-brand-border bg-brand-surface text-brand-fg'

export const PANEL_DANGER_LINK_CLASSES: string =
  'text-[11px] font-medium text-danger hover:cursor-pointer hover:underline disabled:cursor-not-allowed disabled:opacity-40 disabled:no-underline'
