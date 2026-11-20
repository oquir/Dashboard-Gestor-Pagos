import { PDF_CANVAS_CLASS as C } from '../../../../constants'

// La hoja de estilos del shadow root del lienzo. Los tokens de la app (--color-brand…) si cruzan al
// shadow root, porque las variables CSS se heredan; las clases de Tailwind no. Cada var() trae su
// color de respaldo por si el token cambia de nombre. Lo que dibuja la edicion (seleccion, hover,
// guias) usa sombras y outlines, que no ocupan espacio: el contenido mide lo mismo que en el PDF.
// El padding de abajo (96px) deja la leyenda de la ultima hoja por encima de la barra flotante.
//
// Modo de bajo rendimiento: la regla global .low-performance de index.css no cruza el shadow root,
// y :host-context no existe en Firefox ni Safari. Por eso PdfCanvas pone data-low-performance en
// el .doc y la ultima regla de abajo apaga las animaciones y transiciones de las hojas.
export const CANVAS_CSS: string = `
@keyframes pdf-sheet-in { from { opacity: 0; translate: 0 12px; } }
@keyframes pdf-select-in { from { box-shadow: inset 0 0 0 4px var(--color-brand, #f97316); } }
:host { display: block; min-width: max-content; }
.${C.doc} { display: flex; flex-direction: column; align-items: center; gap: 28px; padding: 32px 32px 96px; min-width: max-content; box-sizing: border-box; }
.${C.sheet} { display: flex; flex-direction: column; align-items: center; gap: 8px; animation: pdf-sheet-in 260ms cubic-bezier(.32,.72,0,1); }
.${C.paper} { position: relative; flex-shrink: 0; background: #fff; color: #000; box-shadow: 0 1px 3px rgba(0,0,0,.2), 0 4px 12px rgba(0,0,0,.08); }
.${C.paper}.${C.active} { box-shadow: 0 0 0 2px var(--color-brand, #f97316), 0 4px 12px rgba(0,0,0,.08); }
.${C.back} { position: absolute; outline: 1px dashed #cbd5e1; }
.${C.content} { position: absolute; overflow: hidden; }
.${C.content}.${C.extra} { outline: 1px dashed rgba(249,115,22,.6); }
.${C.content}.${C.overflow} { outline: 2px solid var(--color-danger, #dc2626); }
.${C.empty} { position: absolute; inset: 0; margin: 0; display: flex; align-items: center; justify-content: center; font: 13px system-ui, sans-serif; color: #94a3b8; pointer-events: none; }
.${C.caption} { margin: 0; font: 11px/1.4 system-ui, sans-serif; color: var(--color-fg-muted, #64748b); font-variant-numeric: tabular-nums; }
.${C.warning} { color: var(--color-danger, #dc2626); font-weight: 600; }
.${C.cell} { cursor: pointer; }
.${C.cell}:hover { box-shadow: inset 0 0 0 1px rgba(249,115,22,.45); }
.${C.cell}.${C.selected} { box-shadow: inset 0 0 0 2px var(--color-brand, #f97316); background-image: linear-gradient(rgba(249,115,22,.08), rgba(249,115,22,.08)); animation: pdf-select-in 200ms ease-out; }
.${C.html} { cursor: pointer; min-height: 14px; }
.${C.html}:empty::before { content: 'Bloque HTML vacío'; color: #94a3b8; font: italic 12px system-ui, sans-serif; }
.${C.html}.${C.selected} { outline: 2px solid var(--color-brand, #f97316); outline-offset: 1px; transition: outline-color 120ms ease-out; }
.${C.variable} { background: rgba(59,130,246,.16); border-radius: 2px; }
.${C.doc}[data-tool="hand"] { pointer-events: none; }
.${C.doc}[data-tool="select"] { user-select: none; -webkit-user-select: none; }
.${C.doc}[data-tool="select"] .${C.cell}, .${C.doc}[data-tool="select"] .${C.html} { cursor: cell; }
.${C.doc}[data-low-performance], .${C.doc}[data-low-performance] *, .${C.doc}[data-low-performance] *::before, .${C.doc}[data-low-performance] *::after { animation-duration: 0s !important; animation-delay: 0s !important; transition-duration: 0s !important; transition-delay: 0s !important; }
`
