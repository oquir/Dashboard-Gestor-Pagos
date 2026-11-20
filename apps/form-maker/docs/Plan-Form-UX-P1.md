# Plan P1 — UX del maquetador de formularios (crítico)

> **Alcance: SOLO el editor del formulario** (`apps/form-maker`): el lienzo, el panel izquierdo
> (`Sidebar` y sus pestañas), el panel derecho (`RightSidebar`, `CollapsedRightSidebar`) y la barra
> flotante (`CanvasToolbar`). **No** es el simulador, ni el diseñador de PDF, ni `tax-filing-manager`.
> Lo compartido con el PDF (`CANVAS_TOOLBAR_CLASSES`, `PanelSection`, `Button`) puede cambiar si el PDF
> queda igual o mejor: verificarlo en cada punto.

Origen: crítica visual del 2026-11-20, hecha en Edge headless con la plantilla de Industria y Comercio,
a 1600×1000, 1366×768 y 1280×720, en claro y oscuro. Los contrastes se midieron con los colores
computados, componiendo los fondos translúcidos. Marca cada punto como `[x]`, con fecha y commit.

Decisiones del usuario (2026-11-20):

- **Un clic en un campo NO cambia el panel izquierdo a Atributos.** Ya existen el doble clic y el clic
  derecho para editar, y abrir el panel en cada clic sería incómodo. No construirlo. Anotarlo en
  `docs/Decisiones.md`.
- **Un clic en la paleta agrega el campo** (P2.7 de `Plan-Form-UX-P2.md`).
- **La paleta va toda en español** (P2.8 de `Plan-Form-UX-P2.md`).

## [x] ~~P1.1 La barra flotante parte sus etiquetas~~ (2026-11-20, sin commit)

- **Qué pasa:** con selección múltiple, a 1600×1000 se lee "Grupo / repetible", "3 / seleccionados" y
  "Mover a / paso". A 1280×720 "Grupo / repetible" se parte incluso sin selección.
- **Medido:**
  - Ancho natural de la barra: 430 px sin selección y 726 px con selección.
  - Ancho del lienzo con los dos paneles abiertos: 960 px a 1600, 726 px a 1366 y 640 px a 1280.
  - A 1600 la barra entraría, pero queda en 640 px.
- **Por qué:** `CANVAS_TOOLBAR_CLASSES` (`src/constants/uiClasses.ts:107`) es
  `absolute left-1/2 -translate-x-1/2` sin ancho propio. Una caja absoluta con `left: 50%` calcula su
  ancho con la mitad del contenedor, así que se encoge hasta partir las palabras.
- **Arreglo:**
  - `w-max` en la caja y `whitespace-nowrap` en `CANVAS_TOOLBAR_ACTION_CLASSES` y
    `CANVAS_SELECTION_COUNT_CLASSES`. Son constantes compartidas con `PdfToolbar`: la barra del PDF
    tiene que quedar igual o mejor.
  - A 1280 ni así entra (726 > 640). Hace falta una variante compacta: con selección, "Fila" y
    "Grupo repetible" pasan a solo icono, con su `Tooltip`. Se decide con una container query.
  - **Trampa:** el `@container` **no** puede ir en el envoltorio de `AppLayout` que también contiene
    el chip plegado. `container-type` aplica contención de layout, y eso vuelve al elemento el
    bloque contenedor de los `fixed`: `ModalShell` (la revisión de Exportar, que se abre desde el
    chip) se mediría contra él. Va en una capa propia solo de la barra, por ejemplo
    `absolute inset-x-0 bottom-4 flex justify-center pointer-events-none @container`, con la barra
    adentro en `pointer-events-auto`. Revisar que el desplegable de "Mover a paso" no se recorte.
- **Meta:** ninguna etiqueta partida a 1280, 1366 ni 1600, con y sin selección, y la barra sin pisar
  los paneles.

## [x] ~~P1.2 Texto informativo por debajo de 4,5:1~~ (2026-11-20, sin commit)

- **Medido:**
  - En claro, `text-fg-subtle` (slate-400) sobre blanco da **2,63:1**. Las leyendas de 9 px de
    `FormSummary` ("STEPS · MODAL · CAMPOS") dan **2,51:1** sobre slate-50.
  - En oscuro da **3,78–3,98:1**, y **3,19:1** dentro de las tarjetas del lienzo.
- **Dónde aparece:**
  - Panel izquierdo: los títulos de sección de la paleta, el subtítulo de `PanelHeader`, los títulos
    de todas las `PanelSection`, las ayudas, las marcas del slider (`1 col` / `6 col`) y
    "Sin campo seleccionado." (lo pinta el `text-slate-400` del contenedor en `Sidebar.tsx:84`).
  - Panel derecho: la pestaña inactiva, "Abrir…", "Tipo de formulario", "Sin guardar / Guardado",
    "FORMULARIO / MODAL DE ENTRADA", "8 pasos" y "Paso 1 · Formulario".
- **Arreglo:**
  - `PanelSection`: `legibleTitle` pasa a valer `true` por defecto. El PDF ya lo pasa explícito, así
    que allá no cambia nada. Si después nadie lo pasa en `false`, se puede borrar la prop.
  - En los componentes del editor que usan `text-fg-subtle`, `text-slate-400` o
    `dark:text-neutral-500` para **informar**, pasar a `text-fg-muted`. Hay que revisar uso por uso,
    no reemplazar a ciegas: `fg-subtle` queda solo para placeholders, deshabilitados y adornos.
- **Fuera:** los placeholders de la vista previa del lienzo ("Texto de ejemplo") copian lo que pinta el
  consumidor. Subirlos es una decisión del runtime, no del editor.
- **Meta:** ningún texto informativo del editor por debajo de 4,5:1, ni en claro ni en oscuro.
  `fg-muted` mide 4,76:1 en claro.

## [x] ~~P1.3 Texto sobre naranja, o en naranja, bajo 4,5:1~~ (2026-11-20, sin commit)

- **Medido:**
  - "Exportar" (blanco sobre naranja): **3,58:1** en claro y **2,89:1** en oscuro.
  - "Simulador" (naranja sobre blanco): **3,58:1** en claro.
  - El chip del paso activo: **3,58:1**.
  - La pestaña activa del menú contextual: el mismo naranja lleno con texto blanco.
- **Arreglo:** los tokens `brand-strong` / `on-brand-strong` ya existen (P1.3 del PDF).
  - `ExportButton.constants.ts` y la variante `primary` de `Button.constants.ts`:
    `bg-brand-strong text-on-brand-strong`. `primary` también la usan el asistente y los modales, y
    les sirve igual.
  - `SimulatorButton.constants.ts` y `PdfDesignerButton.constants.ts`: `text-brand-strong`. Si se hace
    P2.5, pasan a neutros y esto sobra.
  - `StepTabChip.tsx:42`: el chip activo con los tokens nuevos.
  - `TabButtonGroup.constants.ts:7`: la pestaña activa con los tokens nuevos. También lo usa
    `PreviewResults` del simulador, y le sirve igual.
- **Cifras esperadas:** blanco sobre orange-700 ≈ 5,2:1; neutral-950 sobre orange-500 ≈ 6,9:1.

## [x] ~~P1.4 Los iconos del riel izquierdo sin nombre~~ (2026-11-20, sin commit)

- **Qué pasa:** con el panel abierto, siete de los ocho iconos no tienen nombre visible. El `Tooltip`
  está apagado (`SidebarTabRail.tsx:21`, `disabled={!isCollapsed}`) y el encabezado solo nombra la
  pestaña activa. Al botón activo le falta `aria-current`.
- **Arreglo:**
  - El `Tooltip` sale siempre, con el panel abierto y con el panel contraído. Va igual para el botón
    del tema.
  - `aria-current="page"` en la pestaña activa.
  - El vacío de las pestañas del campo ("Sin campo seleccionado.") explica cómo editar: "Haz doble
    clic en un campo del lienzo para editarlo, o clic derecho para el menú".
- **No se hace** (decisión del usuario): cambiar a Atributos con un clic en un campo.

## Resultado (2026-11-20)

Lo que cambió respecto del plan, y por qué:

- **La capa de la barra vive en `CanvasToolbar`** (`TOOLBAR_LAYER_CLASSES`), no en `AppLayout`. Así
  el `@container` no envuelve al chip plegado. La caja común pasó a `CANVAS_TOOLBAR_BOX_CLASSES` (con
  `w-max`), y `CANVAS_TOOLBAR_CLASSES` (la del PDF) es esa caja más su posición de siempre.
- **El corte de la variante compacta es 46rem**, así que también aplica a 1366, donde el lienzo mide
  exactamente lo que la barra con selección (726 px) y no quedaba aire.
- **`legibleTitle` se borró**: con el formulario también en `fg-muted`, la prop ya no distinguía
  nada.
- **El naranja fuerte llegó a más lugares que los listados**: el Sí/No del asistente, los signos de la
  calculadora, los modos de fecha y de teléfono, los números de columna de Shift, los números de las
  reglas, los enlaces "+ Agregar", "Ir a Mapeo API →", "Configurar" y el valor de los inputs de código.
  `ADD_LINK_CLASSES` quedó igual a la `PDF_ADD_LINK_CLASSES` del PDF, y esta se borró.
- **Además**: "Suelta un campo aquí" en las filas vacías estaba en slate-300 (≈1,5:1), y los números
  de los pasos inactivos daban 4,35:1 sobre su fondo (pasaron a `fg-soft`, ≈7:1).

Medido en Edge headless, con los dos paneles abiertos:

- **Barra:** ninguna etiqueta partida y siempre dentro del lienzo, con y sin selección. A 1600 la
  barra mide 726 px con selección sobre 960 px de lienzo. A 1366 y 1280, con selección, "Fila" y
  "Grupo repetible" quedan como icono.
- **Barra del PDF:** en una línea, 42 px de alto, a 1366.
- **Contraste:** ningún texto informativo de los dos paneles bajo 4,5:1.
  - Claro: grises 4,76:1; Exportar, Simulador y el paso activo 5,22:1.
  - Oscuro: grises 6,94:1; Exportar y el paso activo 6,86:1; Simulador 6,21:1.
  - Lo único bajo 4,5 es la vista previa del lienzo, que queda fuera.
- **Riel:** el Tooltip sale con el panel abierto y la pestaña activa tiene `aria-current="page"`.
- **No verificado** en el navegador: la revisión de Exportar abriéndose desde el chip plegado (con la
  plantilla limpia, Exportar descarga sin abrir el modal). El chip no está dentro de la capa nueva,
  así que la contención no lo alcanza.

## Cómo verificar P1

- `pnpm build` (typecheck + build) y `pnpm lint`.
- Edge headless por CDP (ver `Plan-PDF-UX-P1.md`): `http://localhost:5174/`, Industria y Comercio →
  Siguiente. Medir y capturar:
  - La barra a 1280×720, 1366×768 y 1600×1000, sin selección y con 2 o 3 campos seleccionados.
    Ningún elemento de la barra puede medir más de 24 px de alto.
  - Que la revisión de Exportar se abra a pantalla completa desde el chip plegado.
  - El contraste de cada texto de los dos `aside` y de la barra, en claro y en oscuro.
  - Los tooltips del riel con el panel abierto.
- El PDF no tiene que empeorar: capturar su barra y su panel antes y después.
- Commits, uno por punto, en español con tildes, por ruta explícita.
