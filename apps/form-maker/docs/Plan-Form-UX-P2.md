# Plan P2 — UX del maquetador de formularios (importante)

> **Alcance: SOLO el editor del formulario** (`apps/form-maker`): el lienzo, el panel izquierdo, el
> panel derecho y la barra flotante. **No** es el simulador, ni el diseñador de PDF, ni
> `tax-filing-manager`. Las piezas compartidas se pueden tocar si el PDF y el simulador quedan igual o
> mejor.

Origen: crítica visual del 2026-11-20. Va después de P1 (`docs/Plan-Form-UX-P1.md`), donde están las
decisiones del usuario. Marca cada punto como `[x]`, con fecha y commit.

Decisiones del usuario al arrancar P2 (2026-11-20):

- **P2.1:** el rótulo tiene que **diferenciar** un paso del formulario de un paso del modal de entrada,
  no solo numerarlos.
- **P2.2 en pausa:** el asterisco rojo no le convence; el usuario va a buscar cómo marcar los
  obligatorios. No construirlo hasta que lo decida.
- **P2.5 se hace, pero puede pedir revertirlo:** dejarlo aislado (solo clases, en sus propios archivos)
  para que volver atrás sea trivial.
- **P2.8:** se aprueban los nombres de la tabla.

## [x] ~~P2.1 Rótulo del paso activo sobre el lienzo~~ (2026-11-20, sin commit)

- **Hoy:**
  - El título del paso no aparece en ningún lugar del lienzo (medido: no está en `main`).
  - En la pestaña Proyecto nada dice cuál es el paso activo. Los chips son números sueltos (eso está
    decidido), así que el nombre solo vive en "Paso activo" y en el tooltip del chip.
  - Con el panel derecho plegado no hay ninguna pista.
  - La maqueta del modal de entrada dice "Modal de entrada" en vez del título del paso.
- **Arreglo:**
  - Un rótulo fijo arriba a la izquierda del lienzo, en el `canvasOverlay` de `AppLayout` (es el
    hermano del chip plegado): "Paso 3 de 8 · Actividades gravadas" para un paso del formulario y
    "Modal de entrada · Paso 1 de 2 · …" para un paso del modal.
  - No se escala ni se desplaza, y sirve con el panel abierto y con el panel plegado.
  - Solo lectura y sin `pointer-events`, para no robarle clics al lienzo.
  - Solo en la vista `canvas`, como la barra.
  - La numeración sigue a `orderedSteps` (`lib/stepNavigation`), igual que Ctrl+←/→.
  - Si el paso está oculto, decirlo: "(oculto)".
- **No toca** la decisión de los chips con número solo.

## [ ] P2.2 Marcar en el lienzo los campos obligatorios — EN PAUSA (decisión del usuario)

- **Hoy:** el simulador marca los obligatorios con `*` rojo (`PreviewField.tsx:77`) y el lienzo no.
  "Tipo de documento" tiene "Campo requerido" prendido y su tarjeta no lo muestra.
- **Arreglo:** en `CanvasFieldChip`, un `*` en `text-danger` pegado a la etiqueta cuando
  `field.validations.required` es `true`. Va también en la etiqueta vinculada (la versión en cursiva).
  Se usa la regla fija y no `isRequiredBySchema`: los overrides dependen de valores que el lienzo no
  tiene, y además esa función vive detrás del límite perezoso.

## [x] ~~P2.3 La ✕ de la fila se confunde con la ✕ del campo~~ (2026-11-20, sin commit)

- **Hoy:** la ✕ del campo (esquina de la tarjeta) y la ✕ de la barra de la fila ("Eliminar fila") usan
  el mismo glifo. En el último campo de una fila quedan a ~22 px (medido en Municipio, a 1600×1000), y
  la de la fila se lleva todos sus campos.
- **Arreglo:** la fila borra con `Trash6`, como el menú contextual. La ✕ queda solo para el campo.

## [x] ~~P2.4 Catálogos y Fechas no editan el campo~~ (2026-11-20, sin commit)

- **Hoy:** `Sidebar.tsx:72` pone "Editando tipo_documento" en todas las pestañas menos Campos. Catálogos
  y Fechas son bancos globales del simulador: no dependen del campo ni viajan en el export. Además, el
  riel mezcla tres clases de pestaña con iconos iguales: la paleta, las cinco del campo y los dos
  bancos.
- **Arreglo:**
  - Un subtítulo fijo para esas dos pestañas, por ejemplo "Datos de prueba del simulador, comunes a
    todos los formularios".
  - Un separador fino en `SidebarTabRail` entre Campos | Atributos…Mapeo API | Catálogos y Fechas. Se
    puede leer de `FIELD_TABS`, que ya existe.

## [x] ~~P2.5 Menos naranja lleno para que se lean la acción principal y la selección~~ (2026-11-20, sin commit)

> Ampliado el 2026-11-20 por la jerarquía de botones (`constants/actionTiers.ts`, `docs/Decisiones.md`, "Button hierarchy"): Subir es el único relleno naranja y Exportar pasó a terciario.

- **Hoy:** en una sola pantalla hay naranja lleno en el riel activo, Exportar, la herramienta activa y
  el paso activo. A eso se suman Simulador en contorno, PDF teñido, la selección, la cadena de "se
  envía", los toggles, el slider y los "+".
- **Arreglo:**
  - El riel activo pasa a tinte (`bg-brand-surface text-brand-strong`), el mismo patrón que el toggle
    de bajo rendimiento.
  - Simulador y Diseñar PDF pasan a botones neutros. Exportar queda como el único botón lleno de la
    fila de acciones y del chip plegado (`CollapsedRightSidebar` usa las variantes de solo icono).
- **No se toca** lo decidido: la herramienta activa sigue llena y la cadena de "se envía" sigue en
  color marca (decisión del usuario).

## [x] ~~P2.6 "Pasos" y no "Steps"~~ (2026-11-20, sin commit)

- **Hoy:** la pestaña dice "Steps", la métrica "STEPS", y los campos "Título del step" y "Subtítulo del
  step (opcional)". En el mismo panel aparecen "Pasos", "8 pasos" y "Paso activo".
- **Arreglo:** "Pasos" en `RightSidebar.constants.ts:5` y `FormSummary.tsx:42`; "Título del paso" y
  "Subtítulo del paso (opcional)" en `StepTitleEditor.tsx:40,52`. Actualizar el nombre de la pestaña en
  `docs/Decisiones.md` → `The right panel`.

## [x] ~~P2.7 Un clic en la paleta agrega el campo~~ (2026-11-20, sin commit)

Decisión del usuario, 2026-11-20.

- **Hoy:** las fichas se levantan al pasar el mouse, como si fueran clicables, pero solo responden al
  arrastre. Solo hay `PointerSensor` (`useDragAndDrop.ts:63`), así que con teclado no se puede agregar
  un campo.
- **Arreglo:**
  - Una acción nueva del store, por ejemplo `appendFieldToActiveCanvas(fieldType)`. En **un solo
    `set`** crea una fila vacía al final del paso activo (como `addRowToActiveCanvas`), le pone el campo
    (como `addFieldToRow`, con `createEmptyField` y `resolvePlacement`) y lo deja seleccionado. Así queda
    un solo paso de deshacer.
  - La fila nueva va suelta, nunca dentro de un grupo repetible.
  - `PaletteChip`: `onClick` llama a esa acción. Enter y Espacio ya disparan el clic en un `<button>`.
    Verificar que soltar después de un arrastre no dispare además un clic: el `PointerSensor` tiene
    distancia de activación, pero hay que comprobarlo.
  - Traer el campo a la vista como hace "+ Fila" (`scrollIntoView` después del commit). Si la lógica
    vive dentro de `CanvasToolbar`, sacarla a un hook compartido en vez de copiarla.
  - El subtítulo de Campos pasa a "Arrastra un campo al lienzo o haz clic para agregarlo al final".
  - No cambia el panel izquierdo (misma decisión que en P1.4).

## [x] ~~P2.8 La paleta toda en español~~ (2026-11-20, sin commit)

Decisión del usuario, 2026-11-20 (opción A: todo en español).

- **Hoy:** la paleta mezcla idiomas: "Select", "Checkbox", "Select con búsqueda", "Input Datalist",
  "Toggle Buttons", "Radio Buttons", "Checkbox Group"; títulos "Inputs básicos", "Inputs complejos",
  "Visor de contenido".
- **Propuesta de nombres (confirmar con el usuario antes de aplicar):**

  | Hoy                 | Propuesta             |
  | ------------------- | --------------------- |
  | Select              | Lista desplegable     |
  | Checkbox            | Casilla               |
  | Select con búsqueda | Lista con búsqueda    |
  | Input Datalist      | Texto con sugerencias |
  | Toggle Buttons      | Botones de selección  |
  | Radio Buttons       | Opción única          |
  | Checkbox Group      | Grupo de casillas     |
  | Inputs básicos      | Campos básicos        |
  | Inputs complejos    | Campos con opciones   |
  | Visor de contenido  | Contenido             |

- **Dónde:** las etiquetas salen de `src/constants/fieldTypes.ts`. Los títulos de grupo, de donde los
  arme `FieldPalette`.
- **Ojo:**
  - `createEmptyField` usa esa etiqueta como nombre inicial del campo nuevo. Cambia solo para los
    campos que se creen desde ahora; los borradores y JSON existentes no cambian.
  - La tarjeta de identidad de Atributos también muestra el tipo ("Select" → "Lista desplegable").
  - El `type` interno (`select`, `checkbox`, …) **no cambia**: es contrato con el consumidor.
  - Revisar que las fichas de 72 px no queden de tres líneas con los nombres nuevos.

## Resultado (2026-11-20)

Lo que cambió respecto del plan, y por qué:

- **P2.1:** `organisms/ActiveStepLabel`, en el `canvasOverlay`. Usa la insignia gris "Formulario" o la
  invertida "Modal de entrada" (`bg-inverse`, la que pidió el usuario para diferenciarlos) + "Paso N de
  M" + el título. La numeración es la del grupo, igual que el chip y "Paso activo", no
  `orderedSteps`.
- **P2.4:** el subtítulo es corto ("Datos de prueba del simulador") porque el del panel se corta en
  una línea de 232 px. Los separadores salen de `RAIL_DIVIDER_BEFORE` (`Sidebar.constants.ts`).
- **P2.5, reversible:**
  - El tinte del riel se revirtió el mismo día, por pedido del usuario: el activo vuelve a
    `bg-brand text-on-brand` (`RAIL_TAB_ACTIVE_CLASSES`). Los separadores del riel se quedan.
  - Simulador y Diseñar PDF siguen neutros. Volver atrás es `SIMULATOR_BUTTON_CLASSES` y
    `PDF_BUTTON_CLASSES` (antes contorno `border-brand-border` y `text-brand-strong`).
- **P2.7:** acción `appendFieldToActiveCanvas` en el store y hook `useCanvasReveal` (lo comparten la
  barra y la paleta; `CanvasReveal` pasó a `src/types/`). El subtítulo de Campos dice "Haz clic o
  arrastra un campo al lienzo".
- **Además (contraste que faltó en P1):** `HINT_CLASSES` y `BADGE_EMPTY_CLASSES` de
  `constants/uiClasses.ts` seguían en `fg-subtle` (P1 solo revisó `src/components`), y el tipo de la
  tarjeta de identidad daba 4,49:1 sobre el naranja claro (pasó a `fg-soft`).

Medido en Edge headless a 1366×768, con los dos paneles abiertos:

- **Rótulo:** "FORMULARIO | Paso 3 de 8 | Actividades gravadas" y "MODAL DE ENTRADA | Paso 1 de 2 |
  Seleccione año gravable y período".
- **Clic en "Lista desplegable":**
  - En el paso 3 (con grupo repetible) y en el paso 2 del modal, agrega una fila al final, fuera del
    grupo, con el campo seleccionado y a la vista.
  - "Deshacer" la quita de una vez.
  - Ctrl+Z simulado por CDP no llegó a la app, así que hay que probarlo con teclado real.
- **Contraste:** en las ocho pestañas del panel izquierdo solo quedan dos textos bajo 4,5:1, y los dos
  quedan fuera:
  - El ejemplo de script de Lógica (placeholder, P3).
  - El aviso `⚠ tipo` de Mapeo API (3,09:1). Es el token `warning` de `index.css`, y cambiarlo
    toca todos los avisos, así que hay que decidirlo aparte.
- **Pendiente de decidir:** "Botones de selección" ocupa tres líneas en su ficha de 72 px.

## Cómo verificar P2

- `pnpm build`, `pnpm lint` y el grep del límite perezoso en `dist/` (P2.2 no puede importar nada de
  `runtimeValidation`).
- Script tsx en el scratchpad para P2.7: un solo paso de historial, la fila al final y fuera de
  cualquier grupo, el campo seleccionado y que funcione en un paso del modal de entrada.
- Edge headless por CDP (ver `Plan-PDF-UX-P1.md`):
  - El rótulo en cada paso, con el panel plegado y en el modal.
  - El `*` en "Tipo de documento".
  - Que el icono de la fila sea distinto de la ✕ del campo.
  - El subtítulo de Catálogos con un campo seleccionado.
  - Que no queden botones naranja llenos en la fila de acciones, salvo Exportar.
  - "Pasos" en la pestaña.
  - Clic y Enter en la paleta.
  - Los nombres nuevos sin partirse.
  - En claro y en oscuro.
- Al terminar, anotar en `docs/Decisiones.md`:
  - El clic que agrega desde la paleta.
  - El rótulo del paso.
  - Que un clic en un campo **no** cambia el panel izquierdo (decisión del usuario).
- Commits, uno por punto, en español con tildes, por ruta explícita.

## Fuera de P2 (P3 de la misma crítica, para otro plan)

- Piso tipográfico: 9 px en las métricas y 10 px en los títulos de sección, ayudas, "Abrir…" y
  "16 col". Propuesta: 11 px para leyendas y 12 px para ayudas. Quedó igual de pendiente en el PDF.
- Ayudas largas (la intro de Catálogos ocupa ~12 líneas a 10–11 px): una frase y el resto en
  `InfoHint`.
- El borde punteado tiene cinco significados (el marco del documento, la banda repetible, el campo
  interno, los "+" y "De la base de datos"). El marco del documento podría ser liso, con sombra.
- Placeholders que parecen contenido: la expresión regular en naranja monoespaciado (`Input` con
  `tone="code"` hereda `text-brand-fg`), y "Ej: Ingrese el NIT sin dígito…" en todos los campos.
- El icono de tipo repetido dentro del input (Teléfono, Correo).
- El menú contextual ordena las pestañas distinto que el riel, y su "Mapeo API" se parte en dos
  líneas.
- "Abrir…" es un enlace gris de 10 px en una esquina.
- El riel del toggle apagado (≈1,5:1) y el borde de los inputs (≈1,2:1) no llegan al 3:1 de WCAG 1.4.11.
- Colores `slate-*`/`neutral-*` directos en vez de tokens (`AppLayout`, `SidebarTabRail`,
  `PaletteChip`, `CanvasFieldChip`, `Input`).
- La hora de guardado con segundos, cuando el PDF ya dice "Guardado a las HH:MM".
- La pestaña Proyecto queda con el 67 % vacío. P2.1 resuelve la orientación sin reabrir la decisión
  de las dos pestañas.
