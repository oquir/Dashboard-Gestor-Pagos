# Plan P2 — UX del diseñador de PDF (importante)

> **Alcance: SOLO la sección PDF de FormMaker** (`apps/form-maker`): la pantalla "Diseñar PDF",
> `src/components/organisms/PdfDesigner/`, `src/components/organisms/pdf/*` y
> `src/store/pdfDesignStore.ts`. **No** es el lienzo del formulario, ni su panel derecho, ni el
> simulador, ni `tax-filing-manager`. Las piezas compartidas (`PanelSection`, `TabButtonGroup`,
> `constants/uiClasses.ts`, la barra flotante compartida) se **usan**; no se cambian para el formulario.

Origen: crítica visual del 2026-11-19. Va después de P1 (`docs/Plan-PDF-UX-P1.md`). Marca cada punto
como `[x]`, con fecha y commit.

Decisiones del usuario (2026-11-19):

- **La barra lateral del PDF se queda a la izquierda**, aunque en el formulario las propiedades estén a
  la derecha. No moverla. Anotarlo en `docs/Decisiones.md` → `PDF designer (PdfDesigner)`.
- **La barra lateral se parte en pestañas "Selección | Documento"**, en vez de secciones plegables.

## [x] ~~P2.1 Barra lateral en pestañas, sin títulos repetidos~~ (2026-11-20, sin commit)

- **Hoy:** con una celda seleccionada, el `aside` mide 2.272 px para 851 visibles (≈2,7 pantallas a
  1600×1000). Son 13 tarjetas con el mismo peso. Hay dos "LETRA" (la de la celda y la del documento) y las
  clases aparecen en tres sitios ("Clases", "Avanzado › Clases" y "Clases del diseño"). Esto choca con la
  decisión "Barra lateral amena" (`Pendientes-PDF.md` §2.1).
- **Estado:** agregar `sidebarTab: 'selection' | 'document'` en `usePdfDesignStore` como estado de vista,
  igual que `zoom`, `tool` y `editingClass`. Va **fuera del historial** (`partialize` sigue guardando solo
  `design` y `selection`) y no se guarda. `setSidebarTab` no hace nada si el valor no cambia.
- **Reglas de cambio:**
  - `selectCell` y `selectBlock` pasan a `'selection'`.
  - Poner un `editingClass` (editar una clase, "+ Clase" o "+ Nueva clase con este estilo") pasa a
    `'document'`, porque el editor de clases vive ahí.
  - `clearSelection` no cambia la pestaña.
  - El usuario puede cambiarla a mano en cualquier momento.
- **Forma (`PdfSidebar`):**
  - Arriba queda fijo `PdfSheetsPanel` (+ Hoja / Tabla / Bloque HTML). Es corto y es lo que más se usa
    para armar.
  - Debajo van las pestañas con el molecule `TabButtonGroup`.
  - **Selección:** sin selección, el aviso "Haz clic en una celda…". Con celdas, `PdfTablePanel` +
    `PdfCellPanel`. Con un bloque, `PdfHtmlBlockPanel`.
  - **Documento:** `PdfClassesPanel` + `PdfDocumentPanel`.
- **Panel de la celda:**
  - `PdfStyleFields` deja de pintar cuatro tarjetas y pasa a pintar cuatro grupos con subtítulo chico
    (Letra / Alineación / Bordes / Fondo). `PdfCellPanel` lo envuelve en **una** tarjeta, "Estilo de la
    celda". El editor de clases (`PdfClassesPanel`) lo envuelve en su propio contenedor.
  - "Avanzado" queda plegado por defecto, con `<details>` como "Clases y estilos de la tabla" en
    `PdfTablePanel`.
  - Renombrar: "Clases" → "Clases de la celda"; el input de Avanzado → "Clases (escritas a mano)";
    "Letra" del documento → "Letra del documento".
- **Meta:** con una celda seleccionada, la pestaña Selección mide ≤ ~1,3 pantallas a 1600×1000. Se mide
  con `aside.scrollHeight`; hoy son 2.272 px.

## [x] ~~P2.2 Variables en otro tono que la selección~~ (2026-11-20, sin commit)

- **Hoy:** el naranja se usa para muchas cosas: Publicar, la herramienta activa, la hoja activa, la
  celda seleccionada, el hover, las variables, el margen extra, los botones activos y los enlaces "+". El
  fondo de las variables (`.fm-var`, naranja al 14 %) casi no se distingue del de la selección (8 % más
  el borde).
- **Arreglo:** en `CANVAS_CSS`, cambiar `.fm-var` a un tinte azul (por ejemplo `rgba(59,130,246,.16)`).
  La clase es la misma para el lienzo (`PdfTableView`) y para los componentes
  (`lib/pdfComponents/pdfComponents.utils.ts`), así que basta con cambiar el CSS. El naranja queda para
  la selección, el hover y la hoja activa. **No** cambia el `.html` publicado: `.fm-var` solo existe en el
  lienzo.

## [x] ~~P2.3 Marco de hoja activa solo con dos hojas o más~~ (2026-11-20, sin commit)

- **Hoy:** con una sola hoja, el anillo naranja de 2 px (`.fm-paper.fm-active`) es lo que más destaca en
  la pantalla y no informa nada.
- **Arreglo:** en `PdfSheetView.tsx`, poner `PDF_CANVAS_CLASS.active` solo si `isActive && total > 1`.
  El componente ya recibe `total`.

## [x] ~~P2.4 "Combinar" con forma de botón~~ (2026-11-20, sin commit)

- **Hoy:** en la barra flotante, "6 celdas · Combinar · ×" se lee como una frase. "Combinar" usa
  `CANVAS_TOOLBAR_ACTION_CLASSES`, que es texto plano y está compartida con el formulario.
- **Arreglo, solo PDF:**
  - Una constante propia en `PdfToolbar.constants.ts` con fondo `bg-brand-surface`, texto
    `text-brand-strong` (el token de P1.3), borde `border-brand-border` y `h-8 rounded-lg px-2.5`.
  - El conteo con una clase propia en `text-fg-muted`.
  - No tocar las constantes compartidas.

## [x] ~~P2.5 Zoom "Ajustar al ancho", usado al abrir~~ (2026-11-20, sin commit)

- **Hoy:** a 100 % el texto del PDF mide 8 px y quedan unos 250 px vacíos a cada lado en 1600 px.
- **Arreglo:**
  - Función pura `fitPdfZoom(viewportWidth)` en `lib/pdfDesign`, junto a `stepPdfZoom`:
    `(ancho del <main> − 64 px de relleno de .fm-doc) / PAPER_WIDTH_PX`. Se limita a
    `PDF_ZOOM_MIN..PDF_ZOOM_MAX` y se redondea hacia abajo a 5 %. `PAPER_WIDTH_PX` se mueve a
    `constants/pdfDesign.ts` si hace falta fuera de `PdfSheetView`.
  - `PdfZoomControl`: un ítem "Ajustar al ancho" arriba de los porcentajes. Mide el `<main>` con
    `getCanvasScrollPort`.
  - `PdfDesigner`: la primera vez que `isReady` es `true` en cada apertura, aplicar el zoom de ajuste.
    Solo una vez por apertura, no en cada resize.
  - El zoom es estado de vista y no se guarda, así que no hace falta migración. Cuidar el anclaje del
    scroll que ya existe en `PdfSheetView`.

## [x] ~~P2.6 Estado del guardado sin ambigüedad~~ (2026-11-20, sin commit)

- **Hoy:** "Sin cambios guardados" se puede leer como "tienes cambios sin guardar".
- **Arreglo:** en `savedStatus` (`PdfDesigner.utils.ts`):
  - `idle` → "Sin cambios".
  - `saved` → "Guardado a las HH:MM", con `toLocaleTimeString` sin segundos.
  - `error` no cambia.
  - "Guardando…" necesitaría que `startPdfAutosave` exponga el pendiente; queda fuera.

## Resultado (2026-11-20)

Lo que cambió respecto del plan, y por qué:

- **Pestañas con el control segmentado** (`SWITCH_*` de `uiClasses.ts`, el mismo de "Texto | HTML |
  Tabla | Componente"), no con `TabButtonGroup`: este pinta la activa en naranja lleno con texto
  blanco, el 3,58:1 que P1.3 acaba de sacar.
- **El ajuste al abrir vive en `PdfCanvas`**, no en `PdfDesigner`: el efecto va antes de la
  suscripción que ancla el zoom, así ese primer cambio no anota ancla y la vista arranca arriba (con
  ancla al centro arrancaba a mitad de la hoja).
- **"Avanzado" no se pliega entero**: el rótulo queda a la vista y lo de adentro va en un `<details>`
  ("Clases escritas a mano y estilos en línea"), para que se sepa que existe.

Medido en Edge headless (1600×1000 y 1366×768, claro y oscuro):

- Barra lateral con una celda: **1.448 px** para 943 visibles (antes 2.272 px). Es 1,54 pantallas,
  **no llega a la meta de ~1,3**: lo que queda es Hojas (fija), Tabla, Contenido, Clases de la celda y
  Estilo. Bajar más pide decidir algo nuevo (por ejemplo, plegar "Tabla" o esconder Hojas con una
  selección).
- Al abrir: 145 % a 1600, 115 % a 1366, `scrollTop` 0, sin scroll horizontal. `fitPdfZoom` probado en
  los bordes (0, negativo, NaN → 50 %; 5000 px → 300 %).
- Seleccionar una celda deja "Selección"; "+ Nueva clase con este estilo" pasa a "Documento".
- Una hoja: sin anillo; dos: anillo; Ctrl+Z vuelve a una y sin anillo.
- `.fm-var` en `rgba(59,130,246,.16)`; la selección sigue naranja.
- Estado: "Sin cambios" y "Guardado a las 08:15 a. m.".

## Cómo verificar P2

- `pnpm build`, `pnpm lint` y el grep del límite perezoso en `dist/`.
- Script tsx en el scratchpad para lo puro: `fitPdfZoom` (bordes y límites) y `setSidebarTab` (devuelve
  la misma referencia si no cambia y no crea pasos de deshacer).
- Edge headless por CDP (ver `Plan-PDF-UX-P1.md`):
  - `aside.scrollHeight` con una celda seleccionada.
  - Seleccionar una celda lleva a "Selección"; "+ Nueva clase con este estilo" lleva a "Documento".
  - Una hoja sin anillo y dos con anillo.
  - `.fm-var` azul y la selección naranja.
  - La forma de "Combinar".
  - Ajuste al ancho a 1366 y a 1600.
  - El texto del estado del guardado.
  - En claro y en oscuro. El formulario no cambia (capturas antes y después).
- Al terminar: anotar en `docs/Decisiones.md` → `PDF designer (PdfDesigner)` las pestañas, el
  `sidebarTab` fuera del historial, el ajuste al ancho al abrir y la barra a la izquierda por decisión
  del usuario.
- Commits, uno por punto, en español imperativo, por ruta explícita.

## Fuera de P2 (P3 de la misma crítica, para otro plan)

- Selección múltiple con un solo borde exterior.
- 31 de 134 celdas con variables sin resaltar (las de contenido HTML).
- Piso de 11–12 px para el texto.
- Pestaña "Componente" sin relleno.
- "Volver al formulario" arriba a la izquierda.
- Jerga ("margen del back") y el ejemplo `{total_impuesto_a_cargo}`.
- Herramienta activa en naranja lleno.
- "Mover" no mueve nada en el PDF. La barra es igual a la del formulario por decisión del usuario.
