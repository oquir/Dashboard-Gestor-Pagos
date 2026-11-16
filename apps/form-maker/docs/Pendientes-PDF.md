# Diseñador de PDF en FormMaker: pendientes y decisiones

> **Para qué sirve**: retomar en cualquier sesión, con cualquier IA o persona, el trabajo de la zona "Diseñar PDF" de FormMaker. Reúne:
>
> - por qué se hace y cómo encaja con el back (§1);
> - lo decidido y lo que falta por decidir (§2);
> - la lista de lo que falta, en el orden en que conviene hacerlo (§3);
> - lo que se sabe de las plantillas que hoy se hacen a mano (§4);
> - dónde se engancha cada cosa en el código de FormMaker (§5).
>
> **Cómo se usa**: al terminar un punto de §3, marcarlo `[x]`, tacharlo con `~~…~~` y anotar la fecha y el commit, por ejemplo `- [x] ~~Tipos del diseño~~ (2026-11-20, abc1234)`. Lo que se decida pasa a la tabla de §2.1 con su fecha. No se borra nada: lo tachado le sirve a la auditoría.
>
> **Estado: en planeación, no empezado.** Escrito el 2026-11-15. Lo que dice sobre el código es de esa fecha: antes de usarlo, verificar que siga igual.

## 1. Contexto

- **El problema.** Cada municipio pide el PDF de la declaración con su propio formato. En el ICA no hay tanto lío, porque está estandarizado en el Formulario Único Nacional (FUN), pero la ReteICA y la autorretención no tienen estándar: cada municipio manda el suyo. Hoy cada PDF se hace a mano en HTML con `<table>` (lo más compatible con todo, también con los correos), con imágenes para los escudos, las banderas, los eslóganes y los textos verticales. Es lo que más tiempo toma.
- **Por qué empezar por el PDF.** El deber ser es diseñar primero el formulario y después el PDF, pero los municipios siempre salen con cosas raras en el PDF, así que en la práctica el usuario empieza por ahí.
- **La idea.** Una zona nueva en FormMaker para diseñar el PDF del formulario. Produce HTML con variables `{Variable}` y guarda el diseño, para volver a abrirlo.
- **Cómo encaja con el back.** El back recibe el formulario del municipio, **solo reemplaza las variables** (no arma filas repetidas) y convierte el HTML a PDF. **Todavía no se sabe qué librería usará** para convertirlo.
- **Fallo conocido.** El back no pinta el HTML igual que el navegador. Por eso abrir una plantilla en Chrome no sirve para validarla, y es un fallo que hay que solucionar (§2.2).
- **Advertencia del usuario: esto va a ser muy difícil.** Cada PDF nuevo de un municipio trae un formato impredecible y un "machetazo" distinto en HTML para replicarlo. El diseñador no puede prometer cubrirlo todo; por eso las reglas de §2.1.

## 2. Decisiones

### 2.1 Tomadas

| Punto                                  | Decisión                                                                                                                     | Por qué                                                                                                                  |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Sintaxis de las variables (2026-11-15) | **Llave sencilla `{Var}`**                                                                                                   | Es lo que el back reemplaza y lo que usan las 22 plantillas actuales                                                     |
| Filas repetidas (2026-11-15)           | **Se exportan como ranuras numeradas**: se diseña una fila y sale copiada como `{CodigoSecundaria1}` … `{CodigoSecundariaN}` | El back solo reemplaza variables; no arma filas. Las plantillas de hoy ya lo hacen así, a mano                           |
| Columnas (2026-11-15)                  | **`colspan` sin máximo y sin rejilla impuesta**                                                                              | Replicar el PDF del municipio a veces exige machetazos                                                                   |
| Escape para lo imprevisto (2026-11-15) | **HTML libre por celda o por bloque**                                                                                        | El diseñador nunca puede ser peor que hacerlo a mano: lo que el editor visual no sepa hacer, se escribe en HTML como hoy |
| Componentes (2026-11-15)               | **Solo se vuelve componente el machetazo que se repite**: texto vertical, casilla, NIT con DV, firmas, código de barras      | Lo raro de un solo municipio se queda en HTML libre                                                                      |
| Orden de trabajo (2026-11-15)          | **Se puede empezar por el PDF**, con variables sueltas, y conectarlas con los campos después                                 | Es como trabaja el usuario (§1)                                                                                          |
| Dónde vive (2026-11-15)                | **Dentro de FormMaker, como lienzo propio del proyecto**, no como una vista más                                              | Se guarda y se exporta con el formulario, y la vista previa puede usar los valores del simulador                         |

### 2.2 Abiertas

1. **Nombres de las variables.** Hoy se llaman como las reemplaza el back (`{TotalImpuestoCargo}`, `{RazonSocial}`), no como los campos del formulario (`total_impuesto_a_cargo`). Mantenerlos no le cambia nada al back; unificarlos con los campos acaba con los ~315 nombres sueltos (§4.2), pero obliga al back a aprender los nombres nuevos. El usuario la dejó abierta el 2026-11-15.
2. **Librería del back y acuerdo de página.** Falta saber con qué librería convertirá el back y fijar con él el tamaño del papel (carta, A4 u oficio), los márgenes y el ancho con que convierte. Ese ancho es el contrato entre el diseñador y el back, y pesa más que la librería: si se diseña a ~740 px y el convertidor imagina una ventana más ancha y la encoge, el navegador y el PDF nunca coinciden (§4.5).
3. **Vista previa.** Lo ideal es que la genere el mismo back, con un endpoint que convierta la plantilla con datos de prueba: así lo que se ve es lo que sale. Imitar el ancho en el navegador sirve de borrador, pero no quita las diferencias propias del motor. Depende del punto 2.
4. **Imágenes.** Incrustadas en base64, como casi todas hoy, o por URL, como tres plantillas que las piden a `autoliquidables.1cero1.com/HtmlToPdf/<NIT>/`. Además, el borrador vive en una sola llave de `localStorage` (unos 5 MB por origen): con escudos en base64 se puede llenar. ¿IndexedDB para las imágenes?
5. **Saneo del HTML libre.** FormMaker nunca guarda HTML en `rich_text`: lo guarda estructurado y su serializador es el sanitizador, porque un HTML guardado es marcado ejecutable ("Presentational fields" en `CLAUDE.md`). El HTML libre del PDF rompe esa regla a propósito; hay que decidir cómo sanearlo (sin `<script>` ni atributos `on*`) y mostrar la vista previa en un iframe aislado (`sandbox`).
6. **Deshacer.** Si el diseño del PDF entra al historial de zundo junto con el formulario o lleva el suyo.
7. **Cómo viaja el HTML.** Como una llave más del JSON exportado o como un archivo `.html` aparte. Se acuerda con el back.

## 3. Lo que falta

En el orden en que conviene hacerlo. Cada punto se hace en su versión mínima.

### 3.0 Antes de escribir código

- [ ] Decidir los nombres de las variables (§2.2, punto 1).
- [ ] Saber qué librería usará el back y fijar el acuerdo de página: tamaño, márgenes y ancho (§2.2, punto 2).
- [ ] Hacer el inventario único de variables: juntar los ~315 nombres de las plantillas (§4.2) en una sola lista, con lo que significa cada uno y cuáles son sinónimos o errores. Esa lista se acuerda con el back, que es quien reemplaza.
- [ ] Decidir cómo viajan y dónde se guardan las imágenes (§2.2, punto 4).

### 3.1 La zona y el modelo

- [ ] Tipos del diseño en `src/types/`: la página (tamaño y márgenes), las filas y las celdas, con `colspan`, `rowspan`, bordes, alineación, fondo y contenido.
- [ ] Guardarlo en el store y en el borrador: subir `DRAFT_SCHEMA_VERSION` (hoy 7) con su paso de migración, y agregar su línea en `persistence.schema.ts`, porque Zod descarta en silencio las llaves que no conoce.
- [ ] Entrada "Diseñar PDF" en el panel derecho, como un tercer tipo de lienzo (hoy `CanvasTarget` es `formStep | introStep`).
- [ ] Que el diseñador sea un chunk perezoso, como `FormSimulator`: fuera de los índices de nivel y de `lib/index.ts`.

### 3.2 El editor

- [ ] Tabla editable: agregar y quitar filas y columnas, combinar y dividir celdas, cambiar anchos.
- [ ] Contenido de cada celda: texto fijo con formato, una variable `{Var}`, o los dos mezclados.
- [ ] HTML libre por celda o por bloque, con su saneo (§2.2, punto 5).
- [ ] Tablas dentro de celdas: las plantillas de hoy anidan hasta 4 niveles, sobre todo para dibujar casillas.
- [ ] Deshacer, rehacer y Ctrl+S, como en el formulario (§2.2, punto 6).

### 3.3 Componentes para los machetazos que se repiten

- [ ] Texto vertical que el diseñador convierte en PNG al exportar. Hoy hay unas 27 imágenes de texto vertical hechas a mano (§4.3).
- [ ] Casilla: una caja pequeña con su `{Var}` adentro, donde el back pone la X (`{Corr}`/`{Ini}`, `{CC}`/`{NIT}`, los meses, los bimestres…).
- [ ] Caja de NIT con DV.
- [ ] Bloque de firmas: declarante y contador o revisor fiscal, con documento y tarjeta profesional.
- [ ] Código de barras: `<img src="{Code}">`, cuya imagen pone el back.
- [ ] Fila repetible que se exporta como ranuras numeradas (§2.1). El ICA usa 15 actividades, el mismo máximo del grupo repetible de la plantilla ICA (`DEFAULT_GROUP_MAX`).
- [ ] Imágenes por municipio: se suben una vez, se reducen, se pasan a PNG o JPG (sin WebP) y las comparten la ReteICA y la autorretención del mismo municipio.

### 3.4 Variables y formulario

- [ ] Elegir las variables de la lista de §3.0, no escribirlas a mano.
- [ ] Conectar cada variable con un campo del formulario cuando exista, con los mismos nombres que ya usan el export y los editores (`useKnownFieldNames`).
- [ ] Vista previa con los valores del simulador: `buildFormExport` y `resolveRuntime` ya calculan todos los renglones, sin depender del back.
- [ ] Avisos en la revisión de Exportar (`diagnoseForm`): una variable que ningún campo llena, un renglón calculado que no sale en el PDF, `${}` o llaves sueltas, etiquetas sin cerrar en el HTML libre.

### 3.5 Exportar e importar

- [ ] Exportar el HTML final con `{Var}`: bien formado, solo tablas, estilos en línea, sin scripts ni flex ni grid, con el `@page` acordado.
- [ ] Guardar el diseño en `builderDraft`, para que el archivo del proyecto lo vuelva a abrir con `Abrir…`.
- [ ] Decidir si `projectMeta.requires` declara lo que usa el PDF.
- [ ] Importar una plantilla HTML existente al diseñador, con un parser que tolere etiquetas sin cerrar. Empezar por `ICA/PdfICA.html`, la más limpia (§4.1).
- [ ] Importar las 21 de ReteICA y autorretención.

### 3.6 Documentación

- [ ] Al cerrar cada fase, documentar lo hecho en `CLAUDE.md` (en inglés, con sus decisiones) y en el README (en español), como el resto de FormMaker.

## 4. Lo que se sabe de las plantillas actuales

Análisis del 2026-11-15 sobre las 22 plantillas que hoy se hacen a mano.

### 4.1 Dónde están y cómo leerlas

- `C:\Users\tomas\OneDrive\Documents\PDFsAutoliquidables`: 6 `PdfAutoretencion<COD>.html` y 15 `PdfReteICA<COD>.html`.
- `…\PDFsAutoliquidables\ICA\PdfICA.html`: la plantilla general del ICA, que sigue el FUN del renglón 8 al 40. Es la más ordenada: etiquetas balanceadas y casi sin estilos en línea.
- **Pesan de 13 a 378 KB, casi todo base64 de imágenes**; el marcado son de 13 a 45 KB. Para leerlas sin el base64:

  ```sh
  sed -E 's#data:[a-zA-Z/+.-]+;base64,[A-Za-z0-9+/=[:space:]]{40,}#[B64]#g' PdfReteICASES.html
  ```

### 4.2 Variables

- Todas usan `{Var}`; ninguna `{{Var}}`. Hay unos 315 nombres distintos en las 21 de ReteICA y autorretención (de 24 a 108 por plantilla), y solo 3 están en todas: `Anio`, `Direccion` e `Identificacion`. La de ICA usa 141.
- **No hay estándar**:
  - sinónimos: `Sanciones`/`MasSanciones`/`ValSanciones`/`ValSancion`/`Sancion`, `TotalAPagar`/`ValorPagar`/`ValorAPagar`/`ValorACancelar`, `InteresMora`/`IntMora`, `Corr`/`Cor`, `Efect`/`efect`, `Ene`/`ENERO`;
  - errores: `Indentificacion1`, `ImpuestoSobTasBomeril1..8`;
  - nombres de relleno en AGU: `{AQWERTYY}`, `{LaverdadNoseComoHacerunAnagramaDeEsto}`, `{SupongoOtrasSancion}`, `{fazx}`;
  - una con tilde: `{AÑO}`.
- **Casillas como variables**: `Corr`/`Ini`, `CC`/`NIT`/`CE`/`TI`, los 12 meses, los 6 bimestres, `Efect`/`Cheq`/`enLinea`, `SI`/`NO`. El back pone la X en una y deja vacías las demás.
- **Ranuras numeradas**: `CodigoSecundaria1..7`, `TarifaXMilSecundaria1..7` e `Impuesto1..8` en retención (8 actividades); en ICA, la principal más `Secundaria1` a `Secundaria14` (15).
- `{Code}` es el `src` de la imagen del código de barras, en 6 plantillas.
- **Fallo visible**: `PdfAutoretencionCAR` tiene tres `${}` vacíos que salen impresos tal cual.

### 4.3 Imágenes

- Las 21 de retención traen 45 imágenes incrustadas (37 distintas); la de ICA, 7 más.
- **Unas 27 son texto vertical hecho imagen** (PNG altos y angostos):
  - 20 en 6 plantillas de retención (autorretención CAR, PT y VDG; ReteICA CAR, PT y TOR), con `alt` como "INGRESOS" o "LIQUIDACIÓN PRIVADA";
  - las 7 de ICA, que son los rótulos laterales de cada sección.
  - Otras 8 plantillas hacen el texto vertical con CSS (`writing-mode`).
- El resto son escudos, banderas, logos y eslóganes. Algunas pesan de más: el escudo de PT mide 1920×2677 (157 KB) para mostrarse a 200×250, y TOR trae un WebP de 202 KB para mostrarse a 100×100.
- 8 imágenes se repiten entre la ReteICA y la autorretención del mismo municipio (CAR, PT, SJ, TAU, VDG).
- Tres plantillas (autorretención PC, ReteICA LD y VDG) piden imágenes por URL a `autoliquidables.1cero1.com/HtmlToPdf/<NIT>/…`.

### 4.4 Estructura

- Solo tablas: sin scripts, sin flex ni grid.
- `colspan` de hasta 25 (rejillas de 12 o 24 columnas, pero sin máximo real: §2.1) y `rowspan` de hasta 15. Tablas anidadas hasta 4 niveles.
- Tres "familias" de CSS copiadas de una plantilla a otra: `table-full`/`cell-bordered`…, `page`/`borderAll`/`grayRow`…, y solo atributos en línea.
- 7 plantillas tienen etiquetas sin cerrar o de más: `<table>` en las dos de SJ, `<tr>` en TOR, y `<p>`, `<span>` o `<strong>` en otras. Chrome lo perdona; otro motor puede armar esa tabla distinto.
- 17 de las 22 comparten el mismo bloque base de estilos: `@page { size: A4 }` y un `body` verde (`#11E328`) en `@media print`, que parece un resto de pruebas.

### 4.5 Tamaños y la diferencia con el navegador

- **Señal de un convertidor más ancho**: letras de 25 a 50 px e imágenes de hasta 595 px de alto, que en una hoja A4 del navegador (unos 794 px de ancho) se ven gigantes. Las plantillas están pensadas para un convertidor que pinta la página mucho más ancha y luego la encoge.
- **Papel en Colombia**: carta (21,6 × 27,9 cm) y oficio (21,6 × 33 cm), con el mismo ancho.
  - El formulario 350 de la DIAN (versión 2009) es carta: 612 × 792 pt. El PDF del dashboard también (`apps/tax-filing-manager/src/lib/declarationPdf.ts`, `format: 'letter'`).
  - A4 es 6 mm más angosta y 18 mm más alta que carta: una copia en A4 de un PDF en carta arranca con otras proporciones.
- **En píxeles** (CSS cuenta 96 px por pulgada): carta y oficio miden 816 px de ancho, unos 740 útiles con márgenes de 1 cm; A4 mide 794 px, unos 718 útiles.

## 5. Dónde se engancha en el código

FormMaker al 2026-11-15. Rutas relativas a `apps/form-maker/`.

| Qué                                                              | Dónde                                                                                                                                                                                                             |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lienzo activo (hoy, pasos del formulario y del modal de entrada) | `CanvasTarget` en `src/types/placement.ts`; `activeCanvas` y `setActiveCanvas` en `src/store/formStore.ts`; `CanvasTabs`; `src/lib/stepNavigation/`                                                               |
| Vistas del lienzo y pestañas del panel derecho                   | `CanvasViewMode` y `RightSidebarTab` en `src/types/ui.ts`; `VIEW_MODE_TABS` en `src/constants/canvasView.ts`; `organisms/RightSidebar/`                                                                           |
| Borrador en `localStorage`                                       | `buildDraftPayload`, `saveDraft`, `loadDraft` y `parseDraft` en `src/lib/persistence/persistence.ts`; `DRAFT_SCHEMA_VERSION` en `persistence.constants.ts`; `persistence.schema.ts` y `persistence.migrations.ts` |
| Exportar y abrir el archivo del proyecto                         | `buildFormExport` y `downloadFormExport` (que agrega `builderDraft`) en `src/lib/exportForm/exportForm.ts`; `readProjectFile` en `src/lib/projectFile/`; `ProjectImportModal`                                     |
| Revisión antes de exportar                                       | `diagnoseForm` en `src/lib/formDiagnostics/`; `useExportReview`; `ExportReviewModal`                                                                                                                              |
| Lo que un formulario le pide al consumidor                       | `collectRequires` en `src/lib/formRequires/`                                                                                                                                                                      |
| Valores calculados para la vista previa                          | `buildRuntimeModel` y `resolveRuntime` en `src/lib/formRuntime/formRuntime.ts`; `useFormPreview`; `FormSimulator` (chunk perezoso)                                                                                |
| Nombres de campos conocidos                                      | `useKnownFieldNames` en `src/hooks/useKnownFieldNames/`                                                                                                                                                           |
| Precedente de contenido seguro                                   | `serializeRichText` y `safeHref` en `src/lib/richText/`                                                                                                                                                           |
| Máximo de actividades del grupo repetible                        | `DEFAULT_GROUP_MAX` en `src/lib/repeatableGroup/repeatableGroup.constants.ts`                                                                                                                                     |
| Frontera de los chunks perezosos                                 | El encabezado de `src/lib/index.ts`; "File layout conventions" en `CLAUDE.md`                                                                                                                                     |

## 6. Para retomar

- **Estado**: en planeación. Al 2026-11-15 no se ha escrito código de esta zona.
- **Siguiente paso**: §3.0, empezando por el acuerdo de página con el back y la decisión de los nombres de las variables.
