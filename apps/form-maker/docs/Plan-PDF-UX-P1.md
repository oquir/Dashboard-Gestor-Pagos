# Plan P1 — UX del diseñador de PDF (crítico)

> **Alcance: SOLO la sección PDF de FormMaker** (`apps/form-maker`): la pantalla "Diseñar PDF",
> `src/components/organisms/PdfDesigner/` y `src/components/organisms/pdf/*`. **No** es el lienzo del
> formulario, ni el simulador, ni `tax-filing-manager`. Lo compartido con el formulario
> (`molecules/PanelSection`, `constants/uiClasses.ts`, los tokens que ya existen en `src/index.css`)
> **no cambia de comportamiento**: el PDF usa una prop opcional, constantes propias o tokens nuevos.
> Decisión del usuario, 2026-11-19.

Origen: crítica visual del 2026-11-19, hecha en Edge headless a 1600×1000 y 1366×768, en claro y oscuro.
Los contrastes se midieron con los colores computados, componiendo los fondos translúcidos. Marca cada
punto como `[x]`, con fecha y commit, cuando quede hecho.

## [x] ~~P1.1 Shift+clic pinta la selección de texto del navegador sobre las celdas~~ (2026-11-20, 68545566)

- **Qué pasa:** con Mover (V), que es la herramienta por defecto, Shift+clic en otra celda extiende la
  selección de texto nativa (azul) por encima de la selección naranja. Medido: `getSelection()` devolvió
  `"DEPARTAMENTO:\t{DepDir}"`.
- **Por qué:** `CANVAS_CSS` (`organisms/pdf/PdfCanvas/PdfCanvas.constants.ts`) solo pone
  `user-select: none` con `data-tool="select"`. Además, `handleDocPointerDown` (`PdfCanvas.tsx`) hace
  `return` antes de llegar a ese caso con las otras herramientas.
- **Arreglo:** en el `.fm-doc` de `PdfCanvas.tsx`, agregar `onMouseDown` que haga
  `if (event.shiftKey) event.preventDefault()`. El que extiende la selección es el `mousedown`; el
  `click` sigue llegando, así que `selectCell(…, extend)` funciona igual. Si al verificar todavía queda
  texto seleccionado, la alternativa es `user-select: none` en `.fm-doc` para todas las herramientas:
  ninguna celda se edita en el lienzo.
- **Verificar:** clic en una celda y Shift+clic en otra; `getSelection().toString()` tiene que dar `''`
  y el rectángulo se tiene que armar igual.

## [x] ~~P1.2 Texto informativo por debajo de 4,5:1~~ (2026-11-20, 32003043)

- **Medido:** en claro, `text-fg-subtle` (slate-400) sobre blanco da **2,63:1**. En oscuro, sobre el
  velo de las tarjetas, da **3,8–4,0:1**. Afecta los rótulos de sección (10 px, mayúsculas), las ayudas,
  las unidades (px/mm), los "Total: N mm", los conteos de clases, el estado del guardado en el
  encabezado, el aviso "Haz clic en una celda…", y la columna de atajos y la pista del menú de zoom.
- **Arreglo, solo PDF:**
  - `PanelSection`: agregar una prop opcional (por ejemplo `legibleTitle?: boolean`, en
    `false` por defecto) que cambie el rótulo a `text-fg-muted`. El formulario no la pasa y queda igual.
    Todos los `PanelSection` de `organisms/pdf/*` la pasan.
  - En los archivos del PDF que usan `text-fg-subtle` para **informar**, pasar a `text-fg-muted`.
    `fg-subtle` queda solo para placeholders, deshabilitados y adornos. Los archivos son:
    `PdfDesigner.tsx`, `PdfSidebar`, `PdfSheetsPanel`, `PdfTablePanel`, `PdfCellPanel`,
    `PdfClassesPanel`, `PdfDocumentPanel`, `PdfStyleFields`, `PdfComponentPanel`, `PdfImageSourceField`,
    `PdfSignaturesFields`, `PdfTextField`, `PdfNumberField`, `PdfZoomControl` (+ `.constants.ts`).
    Revisar uso por uso, no reemplazar a ciegas.
- **Meta:** ningún texto informativo del encabezado, la barra lateral o la barra flotante del PDF por
  debajo de 4,5:1, ni en claro ni en oscuro. `fg-muted` mide 4,76:1 en claro.

## [x] ~~P1.3 El naranja de "Publicar" y de los enlaces "+"~~ (2026-11-20, 32003043)

- **Medido:**
  - "Publicar v1" es blanco sobre naranja: **3,58:1** en claro (orange-600) y **2,89:1** en oscuro
    (orange-500).
  - "+ Clase" y "+ Nueva clase con este estilo" usan `text-brand-fg`: **3,58:1** en claro. En oscuro dan
    7,9:1, que está bien.
- **Arreglo, solo PDF.** Se agregan tokens nuevos sin tocar los que ya existen:
  - `src/index.css`: `--ui-brand-strong` (claro: orange-700; oscuro: orange-500) y
    `--ui-on-brand-strong` (claro: blanco; oscuro: neutral-950). Se registran en `@theme` como
    `--color-brand-strong` y `--color-on-brand-strong`. Son nuevos, así que nada del formulario cambia.
    Cifras esperadas: blanco sobre orange-700 ≈ 5,2:1; neutral-950 sobre orange-500 ≈ 6,9:1;
    orange-500 sobre neutral-900 ≈ 6,2:1.
  - `PUBLISH_BUTTON_CLASSES` (`PdfDesigner.constants.ts`): `bg-brand-strong text-on-brand-strong`.
  - Los enlaces "+" del PDF (`PdfCellPanel`, `PdfClassesPanel`) usan hoy `ADD_LINK_CLASSES`, que es
    compartida. Hay que crear una variante del PDF con `text-brand-strong` y no cambiar la compartida.
- **Fuera de alcance, anotado:** el formulario tiene los mismos contrastes ("Exportar" y los rótulos de
  `PanelSection`). Si se quiere arreglar allá, hay que decidirlo aparte.

## Cómo verificar P1

- `pnpm build` (typecheck + build) y `pnpm lint`.
- Límite perezoso: grep en `dist/`; lo del PDF sigue solo en `PdfDesigner-*.js`.
- Edge headless por CDP: `--headless=new --remote-debugging-port`, `--user-data-dir` en el scratchpad,
  sin dependencias (Node 24 trae `WebSocket`). Abrir `http://localhost:5174/?impuesto=industria_comercio`,
  elegir Industria y Comercio → Siguiente → botón "Diseñar el PDF…". Repetir la medición de contraste de
  cada texto del encabezado, el `aside` y la barra (color computado sobre el fondo compuesto), en claro y
  en oscuro. Probar Shift+clic.
- El formulario no tiene que cambiar: capturarlo antes y después; los rótulos de sus paneles quedan
  iguales.
- Commits, uno por punto: "Evita la selección de texto con Shift+clic en el PDF", "Sube el contraste de
  los textos del diseñador de PDF", "Sube el contraste del naranja en el diseñador de PDF".
