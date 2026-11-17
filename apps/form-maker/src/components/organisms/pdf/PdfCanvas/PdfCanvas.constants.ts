import { PDF_CANVAS_CLASS as C } from '../../../../constants'

// La hoja de estilos del shadow root del lienzo. Los tokens de la app (--color-brand…) si cruzan al
// shadow root, porque las variables CSS se heredan; las clases de Tailwind no. Cada var() trae su
// color de respaldo por si el token cambia de nombre. Lo que dibuja la edicion (seleccion, hover,
// guias) usa sombras y outlines, que no ocupan espacio: el contenido mide lo mismo que en el PDF.
export const CANVAS_CSS: string = `
:host { display: block; }
.${C.doc} { display: flex; flex-direction: column; align-items: center; gap: 28px; padding: 32px; min-width: max-content; box-sizing: border-box; }
.${C.sheet} { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.${C.paper} { position: relative; flex-shrink: 0; background: #fff; color: #000; box-shadow: 0 1px 3px rgba(0,0,0,.2), 0 4px 12px rgba(0,0,0,.08); }
.${C.paper}.${C.active} { box-shadow: 0 0 0 2px var(--color-brand, #f97316), 0 4px 12px rgba(0,0,0,.08); }
.${C.back} { position: absolute; outline: 1px dashed #cbd5e1; }
.${C.content} { position: absolute; overflow: hidden; }
.${C.content}.${C.extra} { outline: 1px dashed rgba(249,115,22,.6); }
.${C.content}.${C.overflow} { outline: 2px solid var(--color-danger, #dc2626); }
.${C.empty} { position: absolute; inset: 0; margin: 0; display: flex; align-items: center; justify-content: center; font: 13px system-ui, sans-serif; color: #94a3b8; pointer-events: none; }
.${C.caption} { margin: 0; font: 11px/1.4 system-ui, sans-serif; color: var(--color-fg-subtle, #64748b); font-variant-numeric: tabular-nums; }
.${C.warning} { color: var(--color-danger, #dc2626); font-weight: 600; }
.${C.cell} { cursor: pointer; }
.${C.cell}:hover { box-shadow: inset 0 0 0 1px rgba(249,115,22,.45); }
.${C.cell}.${C.selected} { box-shadow: inset 0 0 0 2px var(--color-brand, #f97316); background-image: linear-gradient(rgba(249,115,22,.08), rgba(249,115,22,.08)); }
.${C.html} { cursor: pointer; min-height: 14px; }
.${C.html}:empty::before { content: 'Bloque HTML vacío'; color: #94a3b8; font: italic 12px system-ui, sans-serif; }
.${C.html}.${C.selected} { outline: 2px solid var(--color-brand, #f97316); outline-offset: 1px; }
.${C.variable} { background: rgba(249,115,22,.14); border-radius: 2px; }
`
