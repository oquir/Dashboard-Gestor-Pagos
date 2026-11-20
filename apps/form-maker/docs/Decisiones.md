# Decisiones de diseño (archivo completo)

Este es el antiguo `CLAUDE.md` completo, movido aquí tal cual el 2026-11-18 para aligerar el `CLAUDE.md` de la raíz de la app (que ahora es un resumen con un índice hacia estas secciones). Al cambiar una decisión, actualiza la sección aquí y, si cambia una regla de las que muerden, también el resumen.

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

The core builder is implemented: the eight-step Industria y Comercio template, repeatable groups, the script/rules engine, presentational field types and the **simulator** (a working prototype of the consuming app that runs the exported JSON). `docs/Project.md` (Spanish) is the original spec — still the reference for the target JSON schema; check it before adding features.

**Tax domain: read `docs/Dominio-ICA.md` before working on the `industria_comercio`, `retencion_industria_comercio` or `autorretencion` templates, their renglones, scripts, sanctions or deadlines.** It explains how the three declarations work (the national FUN renglón by renglón, ReteICA and autorretención with their per-municipality variations) and marks with ⏳ the data that expires (UVT, minimum bases, deadlines, rates): re-verify only those, not the whole document.

**PDF designer: phases §3.1, §3.2 and §3.5 built (the zone, the model, autosave, the editor, and publishing/opening/importing the `.html` — see "PDF designer"); no components (§3.3) or variable list (§3.4) yet. Before any work on a declaration's PDF (the "Diseñar PDF" zone, its templates, the `{Variable}` placeholders the back replaces), read [`docs/Pendientes-PDF.md`](docs/Pendientes-PDF.md)** — context, settled and open decisions, the ordered to-do list and what today's hand-made templates look like. Tick items off there as they land (`[x]`, strikethrough, date and commit).

Known gaps:

- **The consumer has drifted from the builder, silently** (checked 2026-10-07, unchanged 2026-10-09). `FrontAutoliquidable` copied the runtime on 2026-08-26 and lacks `fieldDate`, `dateFormat`, `dateBound`, `fieldAffix`, `fieldContact`, so `dateRange`/`dateFormat`/`includesTime`/`prefix`/`suffix`/phone/email ship and get ignored there. The ICA template already uses them: `$`/`X1000`/`kW` affixes and `email`/`tel` fields, which the consumer paints without affix and as a plain text box (the `default` of its `SchemaFieldControl`). The `datalist` type (added 2026-10-20) lands in that same default: the typed text works, its `suggestions` are dropped. Plan: (1) port the missing modules to the consumer — pending; (2) **builder side done**: the export declares `projectMeta.requires` (see "What a form requires"); pending on the consumer: its own list of supported words and refusing to load a form that asks for one it lacks — (1) and (2) go together there, since the check alone would block ICA today; (3) sharing the runtime as a package is **postponed by the user's call** (compatibility; may come back), so the runtime keeps being copied. `scripts/verifyRuntime.ts` in the consumer (`pnpm verify`) already runs the real JSON through its runtime; it could also run it through both engines and diff the results.
- **No test runner yet: unit tests with Vitest are planned for the end of development** (decided 2026-11-16), and only for the stable core, since the UI changes too often for tests to pay off. Minimum scope: the number and date rules (`roundToMultiple`, `parseFormattedNumber`, `mesesDeMora`, `digitoDe`); a golden test of the ICA template through `resolveRuntime`, checking renglones 25, 31, 33, 35, 38 and 40 for a sample declaration; and draft migrations (an old draft must still open the same). No component or canvas tests. Until then, verification uses throwaway `pnpm exec tsx` scripts in the scratchpad.
- `logic.script` exports **compiled JS**, run by the consumer with `new Function` — this is the file's trust boundary (anyone handing the consumer a JSON gets code execution there). Coordinated decision since the user builds both ends.
- `persistence.ts` versions and migrates drafts (`DRAFT_SCHEMA_VERSION`) before validating. Zod validates _shape_, not coherence (`colSpan: -999`, a `dataSource` on a `text` field, a dangling `labelFor` all pass).
- `validations.pattern` isn't validated while typing (a `try { new RegExp(value) }` guard in `ValidationsPanel` was offered, not built), but the export review blocks an invalid regex from shipping.
- **Renglón 31 hardcodes two catalog ids**: `TIPO_SANCION_OTRA = "4"` and `TIPO_SANCION_EXTEMPORANEIDAD = "1"` in `baseTemplate.constants.ts`. Reordering `tipos_sancion` breaks both in silence. Fix (read the catalog bank, not `lib/mockCatalog`) is scoped and deferred.
- **Two catalog-fed selects still use path-inference instead of `dataSource`**: `periodo_anio`, `clasificacion_contribuyente` (+ the `tipo_representante` toggle). `CATALOGS` declares 9 names, only 8 are wired. `juegos_permitidos` has no field pointing at it yet. Catalog ids are unconfirmed contract names with the consumer.
- **Renglones 31 and 37 need the intro modal** (`{{periodo_anio}}` lives there). The wizard always creates it for `industria_comercio` (step 2 is skipped), but nothing stops deleting those intro steps afterwards. Without them the field stays typeable but uncalculated — no longer silently: the unknown `{{periodo_anio}}` shows red and the export review blocks.
- Selects mapped to `number` leaves show a permanent `⚠ tipo` warning (a two-line fix in `fieldMatchesSchemaType` has been offered, not approved).
- **Moving a field out of a repeatable group to another step keeps its `apiBinding`** — `moveFieldsToStep` → `planLanding` copies the field as is, contrary to the rule in "Repeatable groups". Shared by drag-to-tab and "Mover a paso". One-line fix, not applied: it changes single-field transfers too.

## The right panel (`RightSidebar`)

Header, `CanvasTabs`, `TransferNotice` and `StepTitleEditor` moved off the canvas into a right-hand panel (`organisms/RightSidebar/`). `AppLayout` takes four slots (`sidebar`, `canvas`, `canvasOverlay`, `rightSidebar`) — the overlay carries the floating tool bar and, with the panel collapsed, `CollapsedRightSidebar`; see "Canvas tools and floating toolbar".

**It is modelled on Figma's right panel, by explicit user reference**, in three stacked rows: an **action row** (one row: Guardar and Diseñar PDF as icons on the left; Simulador and Exportar with text, and the collapse toggle, on the right — see "The action row is one row of icons"), a **text tab strip** with the zoom on its right (Figma's `Design | Prototype … 7% ˅`), and a **body of flat blocks**. The two tabs are `RightSidebarTab` in `types/ui.ts` (`TABS` in `RightSidebar.constants.ts`): **Proyecto** — blocks "Vista" (`ViewModeSwitch`) and "Formulario" (`FormSummary`) — and **Steps** — "Pasos" (the chip grid) and "Paso activo" (título/subtítulo).

Settled:

- **The right panel collapses to a floating chip** (`organisms/CollapsedRightSidebar/`, in the `canvasOverlay` slot, top-right). This reverses an earlier settled decision — the panel used to be fixed `w-80` with no `isRightSidebarOpen`, so it can fold like the left sidebar. The chip carries only Guardar, Simulador, Diseñar PDF, Exportar, all icon-only, the zoom and the toggle back. The trigger is a **button in the action row**, not a click on the active tab: the two panels are still deliberately not symmetric, but now only on the gesture.
- **Collapsed, the `<aside>` is not rendered at all** — not `w-0` with the left sidebar's clipped `w-80` child. That mold exists on the left because its 56 px rail stays visible, so its content can't unmount; the right panel leaves nothing behind. More importantly, `w-0` would keep `CanvasTabs` mounted, and with it `StepTabChip`'s droppables — live drop zones nobody can see. It doesn't animate its width either: `useCanvasViewport` watches the port, so a transition would fire a `setPortSize` and a canvas re-render per frame, and panel and chip are different objects with no visual continuity to preserve. Animate the chip if anything, never the layout's width.
- **Collapsed is a focus mode over the active step**, with three accepted losses: you can't add, delete or rename steps (`CanvasTabs`), you can't get back from the JSON/Payload views (`ViewModeSwitch` lives in the Proyecto block), and you can't drag a field or a row to another step. Changing step still works with **Ctrl + ← / →** (see "Step navigation shortcut"). Dragging onto the chip to spring it open was considered and **deliberately not built**.
- **The panel can't appear or disappear mid-drag**, which is what keeps the reflow-under-the-pointer problem dead: the only trigger is a button, and you can't click one with a row hanging off the cursor. A keyboard shortcut would need an explicit `rowDrag`/`draggingFieldId` guard — that is why there isn't one.
- **`ExportButton` owns `useExportReview` and its modal**, not `RightSidebar` — same shape as `SaveButton` owning `useSaveButton`. The panel and the chip both mount it and are mutually exclusive, so there is never a second instance and neither needs props. `SimulatorButton` was extracted for the same reason; `ProjectImportModal` stayed in the panel, since `Abrir…` lives in the Formulario block.
- **Nothing in the chip's container may set `transform`, `filter`, `backdrop-filter` or `will-change`.** `ExportReviewModal` renders from inside it through `ModalShell`, which is `fixed inset-0`; any of those creates a containing block and the modal would size itself against the chip instead of the window. `TOOLBAR_CLASSES`, the bar it is modelled on, ships `-translate-x-1/2` — copying that string wholesale is the way to break it. No `overflow-hidden` either, or the zoom menu gets clipped.
- **The active tab is underlined, not filled.** A grey `bg-surface-raised` pill was the first version and read as a fourth button of the action row right above it — an elevated surface on an elevated surface. It is now plain text, semibold when active, with a 2 px brand rule (`after:` pseudo-element) sitting on the strip's own `border-b`: no new surface, and the only orange is a 2 px sliver that doesn't compete with Exportar. During a drag the forced Steps tab grows a small brand dot (`PANEL_TAB_DROP_DOT_CLASSES`) — the only thing that explains why the tab switched by itself.
- **Text tabs, not an icon rail.** An icon rail was built first (mirroring the left sidebar) and rejected in favour of the Figma reference. `SidebarTabRail` was made generic for that version and **reverted** once only the left sidebar used it again — an unused generic is the kind of leftover nobody later knows whether they can touch.
- **`molecules/PanelBlock/` is the flat section, and it coexists with `PanelSection` on purpose.** `PanelSection` is the rounded card with a black veil, for panels that already have margins (the left sidebar's eight). `PanelBlock` is a full-bleed block closed by a `border-b`, for a panel that runs to its own edge. Unifying them would repaint all eight left panels, which is not what was asked.
- **"Vista" is a segmented control (`molecules/ViewModeSwitch/`), not `TabButtonGroup`.** Three exclusive modes of one canvas read as a segmented control: a sunken rail, the active option a raised pill (`bg-surface`, `dark:bg-surface-inset`), one icon each (`Grid`/`Code12`/`Hierarchy22` in `VIEW_MODE_ICONS`). The old version put three loose buttons with the active one in solid orange, needed a `[&>nav]` override to strip the shared component's own border and padding, and never said the modes were exclusive. `VIEW_MODE_TABS` stays the canonical list of modes and labels; the icons are the control's business. `TabButtonGroup` itself stays — `FieldContextMenu` and `PreviewResults` still use it.
- **"Formulario" is `molecules/FormSummary/`, not four label→value rows.** Identity first (brand-tinted badge + form type + "Tipo de formulario"), then a bordered strip of big `tabular-nums` metrics (Steps / Modal / Campos), then the save state as a dot + hour. `Campos` is the one number the panel didn't read before: `formSteps.reduce(… getAllFields(step.rows).length)`, form steps only (the modal has its own cell). The dot tells saved from never-saved without spending a row saying it; the Modal cell and its grid column disappear with `hasIntroModal` off.
- **The zoom lives on the tab strip, not inside Proyecto**, because it belongs to the canvas rather than to a section: it stays visible under either tab. Outside `canvas` view mode it is **disabled, not hidden**, and the gate lives inside `CanvasZoomControl` so both mounts — the strip and the chip — behave the same. Hiding it made the chip change width when switching views, the same reason "+ Grupo repetible" greys out instead of disappearing.
- **`CanvasZoomControl` is a `100% ˅` dropdown, not `− 100% +`.** Menu: Acercar / Alejar with their shortcut hints, then `ZOOM_PRESETS` (50/75/100/125/150 %) with a check on the current one. Choosing closes it — it is a jump, not a control you keep manipulating; the wheel and Ctrl `+`/`-`/`0` still do the continuous work with the menu shut. Presets must stay inside `[ZOOM_MIN, ZOOM_MAX]` or `clampZoom` silently returns something other than the label.
- **The panel never scrolls.** `min-h-0` on the body wrapper (without it a flex item can't shrink below its content and the overflow escapes the panel) plus a `max-h-56 overflow-y-auto` scoped to just the step-chip grid inside `CanvasTabs` — the one deliberate exception, and the only place in the panel that can scroll.
- **Every step tab is a bare number, the active one included.** The active chip used to expand with its title; that made the whole grid reflow on every step change — exactly what must not happen while you point at one of these chips with a row hanging off the cursor. The active chip is now the same 28 px square, told apart by a brand fill plus a `ring-[3px] ring-brand/20` halo, and the delete ✕ still hangs only off it. Uniform width packs 8/row (~40 steps before the grid's own scrollbar). The name lives in the "Paso activo" block, whose header now reads `Paso N · Formulario` to tie the chip's number to the title being edited, and in each chip's native `title`.
- **The two chip groups are captioned only when both exist** (`GROUP_CAPTION_CLASSES`) — with the intro modal off, a "Formulario" caption would just repeat the block title above it.
- `StepTabChip`'s droppable id/data is unchanged — only the visual content collapses.
- **During a drag the Steps tab wins, derived and not written** (`visibleTab = isTransferring ? "steps" : activeTab`, off `rowDrag`/`draggingFieldId`). The step tabs are the drop targets for moving a field or a row to another step; from Proyecto that gesture would have nowhere to land. It snaps back to the chosen tab on drop with no store write. What made this impossible before — opening the panel reflowed the canvas under a moving pointer, mid-gesture — still doesn't apply: while the panel exists its width is fixed, and it cannot be collapsed or reopened mid-drag (see the collapse notes above).
- `canvasViewMode` moved to the store (`types/ui.ts` / `constants/canvasView.ts`) since the tabs and canvas are now different subtrees.
- Neither `rightSidebarTab` nor `canvasViewMode` is persisted, matching `isSidebarOpen` and `canvasZoom`.
- `FORM_TYPES`/`FormTypeOption` moved to `constants/formType.ts`/`types/setup.ts` (co-location rule: used from outside `SetupWizardModal/`).
- **`SaveButton` is compact and its timestamp is its `title`.** It first sat above a second line with the hour; in the action row there is no second line, and text that comes and goes would shift the buttons beside it. The hour is still readable as a row of the "Formulario" block.
- **The action row is one row of icons (2026-11-18).** Guardar and Diseñar PDF are icon-only on the left (`iconOnly`, tooltip names them, like the chip); Simulador and Exportar keep their text on the right, next to the collapse toggle (the user's call; first version had Simulador as an icon too). Measured in headless Edge (Segoe UI, 295 px usable = 320 − 2×`px-3`): the old row (Guardar 85 + Simulador 95.5 + Exportar 85.5 + toggle 26 + `gap-1.5`) needed 310 px and overflowed ~15 px; four labelled buttons would need ~378. Now 35 + 35 + 95.5 + 85.5 + 26 = 277 plus four `gap-1` = ~293, only ~2 px to spare (with `gap-1.5` it is ~301 and eats the right padding): changing a label or adding anything to this row needs a new measurement. The user chose this over two rows of two ("2 arriba + 2 abajo", which keeps every label and was the fallback). The labelled variants of `SaveButton`/`SimulatorButton`/`PdfDesignerButton` stay in code, so going back to two rows is a markup change. The tax caption that used to sit under the button ("Plantilla de …") now lives in its tooltip. The "PDF de la declaración" block of the Proyecto tab was deleted.
- **`TransferNotice` carries its own `m-3`, as the default of a `className` prop.** The body has no padding of its own — each block brings it — and a padded wrapper would leave dead space at the top whenever there is no notice, which is nearly always. The prop exists because the collapsed chip mounts the notice too, hanging below it with absolute position instead of a margin: "Mover a paso" keeps writing `transferNotice` while the panel is folded, and without it those crossing references would be lost in silence.

## Render errors (`ErrorBoundary`)

A render error used to unmount the whole tree and leave a blank screen. `atoms/ErrorBoundary` (a class: React 19 still has no hook for this) is mounted twice, and `molecules/CrashPanel` is the shared look of both fallbacks.

- **Around `<App />` in `main.tsx`** → `organisms/AppCrashScreen`. Offers **Descargar una copia** (the same file as Exportar, through `downloadFormExport`, reopened with Abrir… / Cargar formulario) and **Recargar**, which recovers the last saved draft. The copy matters because up to 3 minutes of work (`AUTOSAVE_INTERVAL_MS`) only live in memory.
- **It never writes `localStorage` on a crash, on purpose**: if the state ended up with an odd shape, saving would overwrite the last good draft with one `parseDraft` rejects on reload, and everything would be lost. A download replaces nothing.
- **Around the simulator's `Suspense` in `FormBuilder`** → `organisms/SimulatorCrashScreen`, with **Volver al editor** (`setSimulatorOpen(false)`). The simulator runs author scripts and is a separate chunk, so it is the likeliest thing to fail (a script that breaks what it renders, a chunk that doesn't download). The builder state is untouched, so closing it is enough. The boundary only exists while the simulator is open, so reopening starts clean.
- Neither catches errors in event handlers or timers, nor an infinite loop in a script (that still freezes the tab). Script throws were already caught as `RuntimeIssue`s; this is the net for what slips past.
- Both fallbacks live in the initial chunk and import nothing behind the lazy boundaries (checked: `FormSimulator` stays its own chunk).

## Hidden steps (`step.hidden`)

A form step can be hidden (`FormStep.hidden?: true`, toggle + (i) in the "Paso activo" block, `setFormStepHidden`): the taxpayer never sees it and "Siguiente" skips it, but its fields **keep computing and keep travelling in the payload** (calculated ones with their value, the rest empty). Motivating case: municipalities that want ICA step 7 gone, which would zero `total_a_pagar_con_aporte_voluntario` if its fields were deleted.

Settled:

- **Not `visibleWhen` on each field** — a hidden field neither validates nor travels in the payload; a hidden step only stops being shown and navigated.
- Form steps only (the intro modal is navigated differently). The chip's `title` says "(oculto)"; the step stays editable on the canvas.
- No required fields belong there — nobody can fill them. Navigation never gates on them (validation is per step), though the simulator's results panel would list them.
- Exported as `hidden: true` (absent otherwise) and declared as `step.hidden` in `requires`. Additive key: one `persistence.schema.ts` line, no version bump.

## Step navigation shortcut (Ctrl + ← / →)

Builder-only (never the consumer): Ctrl+← / Ctrl+→ moves to the previous / next step, one at a time, in `useKeyboardShortcuts`. Pure order in `src/lib/stepNavigation/` (`orderedSteps`, `adjacentStep`); keys and the chips' `title` hint in `constants/stepNavigation.ts`.

Settled:

- **One at a time, no wrap-around, no direct jump** (no Alt+N, no first/last) — the user's call: reaching a far step means walking through the ones in between.
- **Order is the taxpayer's, not the panel's**: intro steps first, then form steps (the user's call). The panel lists the form group above the modal group; the arrows follow the real fill order instead.
- **Ctrl only.** Alt+arrows is browser back/forward (a missed `preventDefault` leaves the app), Ctrl+Alt+arrows rotates the screen on many Intel-graphics PCs, Alt+Shift switches the Windows keyboard layout, Cmd+arrows is back on Mac. Plain/Shift arrows stay free for nudging a field later.
- Ignored in editable targets (word jump), with the simulator open, before setup, and **mid-drag** (`rowDrag`/`draggingFieldId`: changing step would unmount what hangs off the pointer).
- Goes through `setActiveCanvas` like a chip click (clears selection, re-homes, no history step). The active chip `scrollIntoView`s itself (`nearest`), since the chip grid scrolls past ~40 steps.

## Zone placement (Shift / Shift+Ctrl while dragging)

**Shift** highlights every column of the target row so you pick the exact start column (width unchanged). **Shift+Ctrl** anchors the start where Ctrl was pressed and lets the pointer set the end (width follows selection). Modifiers are read live and apply to palette drops too.

`CanvasField.colStart` (1-based, CSS grid line numbers) **ships in the export**. Rules live in `src/lib/rowLayout/` (`getFreeRuns`, `findNearestFit`, `resolvePlacement`, `getMaxSpanAt`, `repackRow`, `migrateRows`) — pure, no React/store imports. `loadDraft` migrates pre-`colStart` drafts by turning overflowing visual lines into real rows.

Settled — do not re-litigate without asking:

- **`dragPlacement` is written only when it changes** (`samePlacement` value-compare) — cuts ~100 writes/drag down to the handful that matter.
- **Collision resolves by magnetic snap, never by pushing.** No fit → red, drop rejected.
- **Holes are preserved** everywhere except `updateRowColumns`, which re-packs deliberately.
- **One row is one visual line — rows never overflow to a second line.** A full row rejects the drop; the user must add another `CanvasRow`. Deliberate guardrail, tested and kept. Only revisit if the user explicitly asks.

## Canvas zoom (`canvasZoom`)

Canvas body scales via `transform: scale()`, 50–150%, from a header control, Ctrl/Cmd+wheel, and Ctrl/Cmd `+`/`-`/`0`. `src/lib/canvasZoom/` (zoom arithmetic) + `src/lib/canvasViewport/` (free-canvas geometry) + `src/hooks/useCanvasViewport/` (DOM — was `useCanvasZoom`, renamed when it started owning the whole viewport).

**Only the canvas body scales** — header/tabs/notices live in `RightSidebar` now, at 1×. `FieldContextMenu` also stays outside the scale so `clientX/clientY` positioning stays correct.

Settled:

- dnd-kit applies no `transform` inside the scaled container — dragged elements go `opacity-0`, the `DragOverlay` is a sibling of `<AppLayout>` outside the scale. Moving either breaks the classic "travels k× too far" bug.
- Collision detection needs no changes — `pointerWithin`/`rectIntersection` compare visual-space rects, so the ratio is scale-invariant.
- **Scale is read from the DOM**: `getCanvasScale(el) = rect.width / el.offsetWidth`, not from the store — returns exactly 1 with no zoom and can't go stale like a threaded store value. ~0.05% error from `offsetWidth` rounding; breaks under a rotated ancestor (none exist here).
- The bug this fixed was mixing visual and layout pixels in exactly three places (`getColumnAtPointer`, `useFieldResize`) — fixed with five divisions back to layout space.
- `measureRow` returns layout pixels; `RowDragPreview` scales itself. `transformOrigin: top left` lands the ghost on the replaced row.
- The overlay's label chip stays at 1× (floating caption, not a replica).
- **`marginBottom: contentHeight * (zoom - 1)` compensates for the transform not affecting layout** — without it, zooming out leaves dead scroll and zooming in pushes content out of reach. Measured via `ResizeObserver` on `offsetHeight` (no feedback loop).
- At `zoom === 1` neither the transform nor the margin is emitted — a `scale(1)` would still create a containing block and a stacking context. The document's explicit `width` is always emitted since the free canvas: the root is wider than the port, so the document can no longer take its width from it.
- Wheel zoom is continuous; buttons/shortcuts step 10% (Figma-like).
- **Not persisted** — view state only, resets to 100% on reload.
- One zoom for both canvases (form steps + intro modal).
- **Anchors on viewport middle, not the cursor, in both axes** — zoom also arrives from the keyboard and the menu, where the cursor isn't over the canvas. The content-space point under the center is captured with the _old_ rects (hook body for zoom, `ResizeObserver` callback for port resizes) and restored in a layout effect with the new ones (`captureAnchor`/`restoreAnchor`, dividing by the DOM-read scale). X needs it since the free canvas: the root's width changes with zoom and with the port, and the document is centered in it. The old Y-only `offset·ratio − offset` assumed the content edge never moves, which is false in X.
- Known cosmetic limit: `min-h-[60vh]`/`70vh` resolve against the real viewport regardless of scale, so at 50% the empty canvas reads shorter than intended. Left as is.

### The free canvas (pan room)

**The user chose a free canvas with margin over scrolling within the document's bounds**: `getViewportLayout` wraps the document in half a port of pan room per side (`CANVAS_PAN_ROOM_RATIO = 0.5`, `constants/canvasViewport.ts`), so the hand and the scrollbars move it in any direction even at 100%.

Settled:

- **Native scroll with margin, not a `translate`** — keeps the wheel, trackpad, scrollbars and dnd-kit's autoscroll, and dnd-kit never has to re-measure. The hand tool is just drag-to-scroll.
- **It also fixed a latent zoom bug.** With `transformOrigin: top center`, half of the zoom overflow landed left of the scroll origin — negative scroll space, unreachable (~145 px at 150% on a 1366 px screen with both panels open). The margin always covers it — `(W·k − W)/2 ≤ (port − 48)/4 < port/2` — verified by a tsx sweep over port widths 320–2600 × every zoom, so `top center` stays.
- The document is still `min(976, port − 48)` wide — what `max-w-5xl` + `px-6` gave — now as an explicit `width` measured from the port's `clientWidth` (the scrollbar doesn't count).
- **Home on mounting the canvas view and on every `activeCanvas` change**: `homeLeft` centers the document, `homeTop` leaves 32 px above it. Without it, switching from a long step to a short one leaves the view floating in empty margin. `rootMinHeight = port + 2·panY` keeps home reachable for a short document at low zoom. Home wins over a pending anchor in the same commit.
- **`[scrollbar-gutter:stable]` on `main`** — the root is sized from the port's width, so a vertical scrollbar that comes and goes would make that width oscillate against the `ResizeObserver`.
- `contentRef` is a **callback ref kept in state**, and every observer and listener is keyed on the node: the document unmounts in the JSON/Payload views and has to be re-attached to the new node when it comes back.
- The JSON and Payload views keep their plain `mx-auto max-w-5xl px-6 py-8` container — the free canvas is only for the canvas view.
- **Entering JSON or Payload resets `main`'s scroll to the top** (`useViewModeScroll`, layout effect keyed on `canvasViewMode`). They share `main` with the free canvas, whose home leaves `scrollTop = panY` (half a port); without the reset those views opened that far down (reported by the user). Going back to the canvas needs nothing — it homes itself on mount.

## Low-performance mode (`isLowPerformance`)

A toggle for slow machines, asked for by the user (2026-11-13), built on the dark-mode mold: `isLowPerformance` in the store, its own `localStorage` key (`PERFORMANCE_STORAGE_KEY`, never in the draft or export), a `low-performance` class on `<html>` (`usePerformanceClass`), and an icon toggle (`SpeedLow`) at the right end of the **floating `CanvasToolbar`**, after Deshacer/Rehacer. **With no stored choice it follows `prefers-reduced-motion`** (`getInitialLowPerformance`), which Chromium on Windows takes from the system's animation setting; the switch overrides it from then on.

What it changes:

- **CSS** (`index.css`): one rule sets every transition and animation duration and delay to `0s` under the class, `!important` so it also beats inline styles (the row-displacement transform transition). Safe because nothing waits on `transitionend`/`animationend` and there are no spinners. A `low-performance:` custom variant exists for one-offs — today only `filter-none` on the intro-modal's blurred decoration.
  - **Zero duration, never `animation: none`.** The first version used `none`, and turning the mode off made the right panel slide in again, as if it reloaded (reported by the user): going from `none` back to `animate-right-panel-in` creates the animation anew and the browser replays it. With a zero duration the animation keeps existing; back at 220 ms it is long past its end and stays finished. Same for the collapsed chip.
- **Wheel zoom coalesces to one apply per frame** (`useCanvasViewport`): deltas add up and `requestAnimationFrame` applies `wheelZoom` once with the sum. Off, the wheel is untouched — **the user's call: the normal mode was fine as it was**, the coalescing only belongs to this mode. `z(1−a)(1−b)` vs `z(1−a−b)` differ by a product of thousandths.
- **A row drags as the compact chip**, not the `RowDragPreview` replica. `DragPreview` and `useDragAndDrop`'s `overlayModifiers` must share the condition, or the chip is drawn with the replica's offset instead of centered on the cursor.
- **Entry animations exist so the mode is visible** (2026-11-19), built with **`tw-animate-css`** (the user's call, same day: a Tailwind animation library instead of hand-written keyframes). The class strings live in `src/constants/animations.ts`: `ENTER_FADE_CLASSES` (modal veil, Canvas/JSON/Payload switch, simulator intro veil), `ENTER_MODAL_CLASSES` (`ModalShell` panel, simulator intro panel), `ENTER_POP_CLASSES` (menus, the "formulario válido" note), `ENTER_RISE_CLASSES` (tab content keyed on the tab, simulator intro step, PDF file notice), `ENTER_ROW_CLASSES` (canvas rows and bands, staggered by `--enter-index`, capped at 12 × 35 ms), `ENTER_FIELD_CLASSES` (field chips), `ENTER_STEP_FORWARD|BACK_CLASSES` (simulator step, from `direction` in `usePreviewNavigation`) and `ENTER_CHECK_CLASSES` (copy button's check, keyed on `copied`). They are CSS animations, so the zero-duration rule above cuts them with no extra code. Rules:
  - **Entry only** (nothing waits on `animationend`); **no `animation-fill-mode` except `backwards` on rows** (a surviving transform becomes a containing block for the `fixed` modals).
  - **The library animates `transform`** (`translate3d` + `scale3d`) plus `filter: blur(0)`. Accepted: the inline `translateY` of rows and bands only exists mid row-drag, when rows don't remount; menus centered with `-translate-x-1/2` use the `translate` property, which composes with `transform`. Our own keyframes (`shake`, the PDF canvas) still use the individual properties.
  - **On rows and bands, never `duration-*`, `delay-*` or `ease-*`**: those also set `transition-duration/-delay/-timing-function`, and rows have their own transitions (border color, the drag displacement with its bounce ease); a 420 ms delay would lag the hover. Use the library's `animation-duration-*` and the `--tw-animation-delay` variable (read by `animate-in`'s shorthand, so it doesn't depend on rule order). The field chip's container has no transitions, so it does take `ease-*`.
  - Each constant ends in `motion-reduce:animate-none`.
  - Rows nested in a band get no `enterIndex` (they enter with the band). A row added later at the end of a long step waits its stagger delay (up to ~420 ms) before appearing.
- **What stays hand-written** (the library has no equivalent): a field's error shake in the simulator (`animate-shake`, `inline-block` because `translate` doesn't apply to inline boxes); buttons sinking on press through the `press` utility (it **replaces** `transition-colors`: combining it with `transition-colors`/`transition-transform` makes Tailwind v4 overwrite `transition-property`); the `ToggleSwitch` knob's bounce and `PaletteChip`'s hover lift (plain transitions; the chip drags through `DragOverlay`, so its `translate` is safe); the older right panel, collapsed chip and performance-icon animations; and everything inside the PDF canvas (next bullet).
- **The PDF canvas needs its own switch.** It lives in a shadow root, so `.low-performance *` never reaches it, and `:host-context` doesn't exist in Firefox/Safari. `PdfCanvas` copies `isLowPerformance` to `data-low-performance` on the `.doc` element and the last rule of `CANVAS_CSS` zeroes animations and transitions under it (sheet entry `pdf-sheet-in`, selected-cell pulse `pdf-select-in`). Anything new animated inside the shadow root must live under `.doc` to be covered.
- **The origami loader is the one animation the mode keeps alive** (`atoms/OrigamiLoader`, `.origami-loader` in `index.css`, shown by `SimulatorLoading` for the simulator and the PDF designer): four 20 px tiles that cost nothing, and a frozen loader looks hung. Same pattern as the performance icon's spin: a higher-specificity `!important` rule restores the duration **and the staggered delays** (the global rule zeroed those too). Under `prefers-reduced-motion` it doesn't animate. The script editor's lazy fallback stays the working `<textarea>` (you can already type while CodeMirror downloads), not a loader.
- **JS-requested smooth scrolls go instant** (`revealScrollBehavior`, `lib/performanceMode/`): CSS `scroll-behavior` doesn't override an explicit `behavior: 'smooth'`.

Settled:

- **The script editor is never swapped for the textarea fallback**, not even here (the user's call): colors and autocomplete stay. It was proposed and rejected.
- **The toggle lives in the floating `CanvasToolbar`** (the user's call, 2026-11-17) — its third home: the left rail first, then the right panel's foot (`molecules/PerformanceModeSwitch`, deleted with the move). A bare icon like the rest of the bar, with the explanation in its `Tooltip`; on, it takes the brand _tint_ (`PERFORMANCE_ON_CLASSES`), not the solid brand fill of the active tool, so it doesn't read as a fourth pointer tool. Two consequences: it now works with the right panel collapsed too, and — like the whole bar — it only shows in the `canvas` view mode, not in JSON/Payload (switch back to the canvas to toggle it).
- **No 10%-step wheel zoom** either: it was in the first proposal, but a trackpad pinch sends many small deltas and would hit the limits before the fingers lift (the reason `wheelZoom` is continuous). Coalescing alone caps the redraws.
- Not a draft key and not history: toggling it never creates an undo step (`sameDocument` only looks at the document).

## JSON view: virtual list and its own search (`JsonCode`)

`JsonCode` (JSON view, Payload view, the simulator's result panels) paints **only the rows in view plus `JSON_ROW_OVERSCAN`**. The ICA template's JSON is ~2,200 lines; painting them all was ~12,500 DOM nodes rebuilt on every store change — the slowest view in the app, confirmed by the user. DOM side in `useJsonViewport` (range, reveal), state in `useJsonCode` (folding, search), pure parts in `lib/jsonCode` (`buildJsonSearchIndex`, `findJsonMatches`, `expandToLine`, `groupHighlightsByLine`, `longestRowLength`).

Settled:

- **Fixed row height** (`h-5` = `JSON_ROW_HEIGHT_PX`): the range is a division, nothing is measured. The list keeps the full height (`rows × 20 px`) and a top padding pushes the painted rows into place, so the native scroll and scrollbar are unchanged. Changing the row's height class means changing the constant.
- **The range is computed against every clipping ancestor**, not a known scroller: in the canvas `main` scrolls and the list grows whole; in the simulator the box itself scrolls. Scroll is listened to on `document` in capture phase, so it catches whichever element moves.
- **The list's `min-width` comes from the longest line in `ch`** (`longestRowLength`, folded suffix included) — measured on painted rows only, the horizontal scroll would change length while scrolling down.
- **The box is not a scroll container** (overflow lives on the inner scroller) so the search bar's `sticky` anchors to `main`. The bar spans the box's full width (the user's call) and sits outside the list, so it doesn't scroll sideways with long lines. **It adapts with a container query (`@container` + `@xs:`), not screen breakpoints**: the same bar lives in the wide JSON view and in the simulator's narrow panel on a wide screen. Below `@xs` it drops the magnifier and shows `3/41` instead of `3 de 41`; the input (`min-w-0 flex-1`) is what shrinks, never the buttons.
- **Ctrl+F opens the view's own search** because the browser's can't find unpainted rows (the user asked for it). The JSON and Payload views pass `captureFind` (they own the screen); the simulator's panel only takes Ctrl+F with the pointer or focus inside, so the form being filled next to it keeps the browser's.
- **Search folds case and accents character by character** (`foldSearchText`): every folded char is one char, so positions map 1:1 back to the real text. A whole-string `normalize('NFD')` would split each accent and shift everything after it.
- It searches the **whole JSON, collapsed parts included**; jumping to a hidden match opens its containers (`expandToLine`). The index is built only while the bar is open and rebuilt per JSON change (matches stay live, like the view).
- A match can cross token segments (`"name": "` spans key, colon and value), so `renderTokens` cuts each segment's part separately; `<mark>` keys are the part's position.
- **Reveal is two-step**: scroll the row to the middle by arithmetic (it may not be painted yet), then, once painted, `scrollIntoView` the current `<mark>` with `block: 'nearest'` for the horizontal part (compiled scripts make lines of 2,000+ chars). Each request carries a `token`, handled once — a live JSON change with the bar open doesn't jump the view again.
- **The search input's ref travels outside the `search` object** (`searchInputRef`): inside it, the compiler's `react-hooks/refs` rule treats the whole object as a ref and rejects reading anything from it during render.
- **Copy is unaffected** (it copies the full string). Mouse selection and the browser's find only reach painted rows — accepted.

## Canvas tools and floating toolbar (`canvasTool`, `CanvasToolbar`)

A floating bar centered at the bottom of the canvas (`organisms/CanvasToolbar/`, Figma UI3's placement): pointer tools **Mover (V) / Selección múltiple (M) / Mano (H)**, **+ Fila / + Grupo repetible**, **Deshacer / Rehacer**, and — with 2+ fields selected — **N seleccionados · Mover a paso ▾ · Eliminar · Deseleccionar**. It lives in `AppLayout`'s `canvasOverlay` slot, a sibling of `main`, so it neither scrolls nor scales, and renders only in `canvas` view mode. Tools in `constants/canvasTool.ts` (`CANVAS_TOOLS`: tool, label, shortcut — read by both the keyboard hook and the buttons' `title`); icons are the bar's business (`TOOL_ICONS`).

Settled:

- **Selection is `selectedFieldIds: string[]`**; "exactly one" is derived by `getSelectedFieldId` (a primitive, stable for `useSyncExternalStore`), never stored. Panels still edit one field: with 2+ the field tabs show `SelectionSummary`, and Lógica does _not_ fall back to the prelude as if nothing were selected. The selection always lives in the active step (`setActiveCanvas` clears it) and is pruned by `removeFields` and `removeRow` (which used to leave a dangling id — harmless with one, a lying counter with a set). `NO_SELECTION` sentinel for the same identity reason as `NO_ROWS`.
- `selectField` replaces (and skips the write when nothing changes); Shift/Ctrl/Cmd+click toggles (`toggleFieldSelection`); `setFieldSelection` skips the write when the set is equal (`sameIdSet`) — the marquee calls it on every pointermove.
- **`select` and `hand` make the document inert** (`pointer-events-none` on the scaled content, `select-none` + the tool's cursor on the root): no dnd-kit activation, resize, context menu or hover chrome. Native listeners on the port do the work, mounted by `CanvasToolLayer` (`useCanvasPan`, `useCanvasMarquee`) — a separate leaf so the marquee re-renders only itself. **Palette drops still land in any tool**: dnd-kit resolves collisions by rects, not pointer events.
- **In `select` everything adds**: a click toggles a field, the marquee adds what it touches (intersection, like Figma), a click on empty space clears. Escape mid-marquee restores the starting selection (capture-phase listener that stops the global Escape). Hit-testing uses `getBoundingClientRect` of `[data-field-id]` — scale-invariant, and `elementsFromPoint` would skip `pointer-events-none` nodes. Marquee coordinates live in the port's scroll space, so wheeling mid-gesture keeps the origin glued to the document; the drawn rectangle is `fixed` and clipped to the port.
- **The hand is plain scroll** (`scrollLeft/scrollTop = start − delta`). Pointer capture goes on the pressed node, not the port, because the cursor comes from the capturing element and the root is the one carrying `active:cursor-grabbing`. A press whose target is the port itself is a scrollbar press and both tools ignore it.
- **Space held = temporary hand** (Figma), **only with the pointer over the canvas** (`:hover` on the port): with focus on a panel button, Space must keep activating it. `preventDefault` on keydown and keyup, `event.repeat` ignored, restored on `window` blur (a backgrounded window never sends the keyup). A tool key pressed while Space is held changes where you return to.
- **Pinned chrome (handles, row toolbar) only for a single selection with Mover** — N sets of handles would be noise, and in the other tools the chrome doesn't respond anyway.
- **`removeFields(ids)` and `moveFieldsToStep(ids, target)` replaced the single-id actions** — one pass, one new state, one aggregated crossing notice. A linked label selected together with its field travels once; fields already in the target are skipped but stay selected.
- **Bulk delete doesn't ask for confirmation** — Ctrl+Z brings it back (see "Undo / redo"). The prompt existed only while there was no undo, and went away with it.
- **"+ Fila" / "+ Grupo repetible" moved off the canvas footer** (`CanvasAddRowButton`/`CanvasAddGroupButton` deleted). They append at the end of the step, so the bar brings the new row or band into view (`scrollIntoView` after the commit). "+ Grupo" is disabled — not hidden — on intro steps, so the bar keeps its width.
- **The active tool gets the brand fill**, unlike `ViewModeSwitch`: the tool changes what a click does on the canvas, and staying in the wrong mode unnoticed means selecting or panning when you meant to move.
- `canvasTool` isn't persisted (back to Mover on reload), like `canvasZoom`.
- `lib/canvasDom/` holds the `data-*` DOM queries shared across folders (`getCanvasScrollPort`, `getFieldElements`, and `getRowElement`/`getBandElement` moved out of `useDragAndDrop.utils.ts`); `lib/canvasSelection/` holds the rect and id-set arithmetic.
- Not built: dragging a multi-selection within the canvas, bulk property editing, edge auto-scroll during the marquee.

## Undo / redo (`zundo`)

Ctrl/Cmd+Z undoes; Ctrl+Y and Ctrl/Cmd+Shift+Z redo; Deshacer/Rehacer sit in the floating bar. The store is wrapped in **`zundo`'s `temporal` middleware** — the one dependency added outside the original stack, chosen over a hand-rolled history (~200–250 lines) because the stacks, limit, pause and clear are generic; the project-specific parts below would exist either way. History lives in a separate store, `useFormStore.temporal`, which `useFormHistory` reads for `canUndo`/`canRedo`. Pure pieces in `src/lib/history/` (`toHistorySnapshot`, `sameDocument`, `createBurstGate`); wiring at the bottom of `formStore.ts` (`HISTORY_OPTIONS`, `travelHistory`, `clearHistory`).

Settled:

- **A step is the document plus the view of that moment** (`HistorySnapshot`: `formSteps`, `introModal`, `formScript`, `setupConfig`, `activeCanvas`, `selectedFieldIds`). Undo brings back the step and the selection where the change happened — undoing "Mover a paso" returns the fields _and_ the view to the source step. `setupConfig` travels because adding/removing intro steps rewrites `hasIntroModal`/`introModalSteps`; without it, undoing the removal of the last intro step would bring the step back with its tabs hidden.
- **Only the document decides whether there was a step** (`sameDocument`): selection, active step, zoom, tool and drag state never create one. **`equality` is mandatory with zundo** — without it every `set`, the ~100 `dragPlacement` writes per drag included, records a step.
- **Equality is by content with a reference short-circuit** (`sameValue`), not by reference alone. Several actions rebuild steps and rows without changing anything — dropping a field where it was, a blur that confirms the same text — and each would leave an empty step that Ctrl+Z "undoes" with nothing visible. Structural sharing keeps the walk down to what was rebuilt.
- **Keystroke bursts coalesce** (`createBurstGate`, `HISTORY_BURST_MS = 500`): the leading change of a sliding window records, so the saved past state is the one _before_ the burst. A slow column-by-column resize (more than 500 ms between columns) still leaves one step per column — accepted.
- **The gate resets on every undo/redo.** zundo only clears the redo stack when it records, so a change swallowed right after an undo would leave redo alive, ready to overwrite what was just typed.
- Undo/redo write through zundo's raw `set`, so they never record themselves. `reconcileViewAfterHistory` then repairs an `activeCanvas`/selection pointing at something gone and clears `transferNotice` — a view-only write the equality discards.
- **`completeSetup` and `restoreDraft` clear the history** — a new document must not undo into the blank canvas it replaced.
- `HISTORY_LIMIT = 100`; steps are references, so the memory cost is negligible. **Not persisted** — a reload starts empty.
- **Ctrl+Z inside an editable target is left alone** (`isEditableTarget`): inputs and CodeMirror keep their own text history. Ignored with the simulator open.
- **`RichTextEditor` repaints when `value` arrives different from what it shows** (reference compare against what it last painted or emitted; the panels store the emitted object as is). It used to paint only on mount, so after an undo it kept the stale text and the next blur wrote it back, silently undoing the undo. `ScriptEditor` already synced external changes.
- **The field script gets one CodeMirror per field** (`key={field.id}` on `FieldScriptEditor`'s `ScriptInput`). The external-value sync is a transaction that enters CodeMirror's own history, so with one shared editor a Ctrl+Z inside it wrote the previous field's script into the new one (verified in Edge). Never route a _different document_ through that sync.
- Verified with a tsx script against the real store: bursts, no-op writes, a change right after an undo, multi-delete, move-to-step, intro steps with `setupConfig`, clearing on setup/draft restore, view reconciliation.

## Reordering rows (drag the row itself)

A whole `CanvasRow` can be dragged to a new position. Row order **is** `step.rows[]` order — no separate index — so `persistence`/`exportForm`/simulator needed zero changes.

Rules in `src/lib/rowOrder/rowOrder.ts` (`resolveRowDrop`, `resolveBandDrop`, `reorderRows`), pure, mirrors `rowLayout`. Store action `moveRow(rowId, target: RowDropTarget)`.

Settled:

- **A row drag never crosses into/out of a repeatable group** (would silently clear `apiBinding` on every field in it). Joining/leaving stays a separate explicit action; reordering within a group works normally.
- A loose row over a band snaps to the band's nearest edge; a row inside a group pointing outside it goes red and is rejected.
- `rowDropTarget` written only on change; `recompute` skips column placement entirely during a row drag.
- The group band gets its own droppable, `disabled` unless a row drag is active — keeps it from competing with inner rows for field drops.
- The drag handle is a hover affordance on the row's left edge only (`RowDragHandle`), using `group/row` (not a bare `group`, which would leak into every chip's own hover state).

### The gesture: you carry the section, the rest step aside

Rejected an earlier "drag a small chip, draw a line" version — had to feel like moving the whole section with others opening a gap.

- Overlay is a full-width replica (`RowDragPreview`), measured once at drag start; simplified (no handle/menu/resize grip).
- **Dragged row goes `opacity-0`**, not dimmed — neighbours shift onto its exact spot; dimming would show overlap with the ghost.
- `buildRowDisplacement` mirrors `rowOrder`'s two cases (loose row displaces blocks; in-group reorder displaces individual rows).
- Transition class is bound to the same state as the transform (`rowDrag !== null`) so drop and reset commit together — no FLIP jump-back.
- `dropAnimation={null}` for row drags (dnd-kit's default flies to the wrong rect).
- Only the red rejection indicator survives; the valid one was removed as noise once the gap already shows it.
- Bounce curve: `ease-[cubic-bezier(0.34,1.6,0.5,1)]` (in a source file so Tailwind v4 scans it).

## Row styles (`row.styles`)

`RowStyles`: `customCss`, `marginTop`, `marginBottom` — **narrower than `FieldStyles`** (no `backgroundColor`/`textColor`, on purpose: a row is layout, not something read like a field). Authored via `RowStylesMenu` (popover at the row's right edge). Store action `updateRowStyles`.

Settled:

- **Optional, absent by default** (same as `groupId`) — purely additive, no `DRAFT_SCHEMA_VERSION` bump, just a `persistence.schema.ts` line (`rowStylesSchema`).
- Export carries it resolved: `styles: resolveRowStyles(row.styles)`, optional key, omitted when empty.
- Reaches the simulator too (`PreviewRowsGrid` spreads it, structural props last).
- `RowDragPreview` deliberately ignores `row.styles` (generic ghost, not a faithful preview).

## Styles are plain CSS, not Tailwind classes

`FieldStyles.customCss`, `RowStyles.customCss`, `FieldTooltip.customCss` hold **raw CSS text**, not Tailwind classes. Replaced `customClasses` because Tailwind v4 scans source files at build time — a class typed into the builder never appeared in source, so it was emitted only by coincidence. Measured: `font-bold`/`text-right`/`uppercase` worked, `bg-purple-700`/`tracking-widest`/`text-2xl` silently didn't — the worst kind of bug (partially working).

`src/lib/cssStyles/` (no React/store imports): `parseCssText` → `CssStyleMap` (camelCase, ready for React `style`); `resolveFieldStyles`/`resolveRowStyles`/`resolveTooltipStyles` merge named properties with parsed `customCss` on top; `unsupportedDeclarations` runs `CSS.supports()` for a non-blocking warning (guarded for `typeof CSS === "undefined"` in tsx scripts).

Settled:

- **Export carries one flat `CssStyleMap`** per field/row/tooltip, not named properties + a class string. `textColor` → `color` only on export; internal name stays `textColor`.
- **The free text wins** (`{...namedProperties, ...parseCssText(customCss)}`, ordinary cascade) — canvas paints what the consumer will paint.
- **No sanitizer** — CSS via React `style` executes nothing; `unsupportedDeclarations` is informational, not blocking (a declaration this browser rejects may work in the consumer's).
- **Structural placement always wins**, enforced by DOM node separation (field's `gridColumn` lives on a different node than `customCss`) or spread order (row's structural props spread after resolved styles).
- Canvas splits `marginTop`/`marginBottom` onto the spacing wrapper and the rest onto the `<button>` that paints (applying custom CSS to the wrapper would be invisible under the button's opaque background). `CanvasRow`/`TooltipBubble` have one node each, apply the map directly.
- Simulator doesn't re-resolve anything — consumes `ExportedField/Row/Tooltip.styles` as already-resolved objects.
- **Migration (`DRAFT_SCHEMA_VERSION` 6) never discards what it can't translate** — `TAILWIND_TO_CSS` covers the common classes; anything else survives as a CSS comment listing the original class names (same treatment as `preservedFormula`). Applies to `field.styles`, `field.tooltip`, `row.styles` (the last needed its own draft walker, `mapDraftRows`/`mapStepRows`).

## Moving things between steps (drop on a step tab)

Drag a field or row onto another step's tab to move it — same id, same name, references intact. Shared core in `src/lib/fieldTransfer/fieldTransfer.ts` (`canTransfer`, `transferGroup`, `planLanding`, `collectCrossingRefs`), used by both `moveFieldsToStep` and `moveRowToStep`.

### The Almacén de Partes is gone — do not rebuild it

It "moved" a field by copying it (new id/name) into a `SavedComponent`, then required manual cleanup. Dragging onto a step tab does the real move properly, so the Almacén (store, panel, tab, draft key, all four `library`-typed call sites) was deleted. `DRAFT_SCHEMA_VERSION` went to **5** with a migration step that _deletes_ `savedComponents` from `localStorage` (dropping it from the schema alone would have left it there invisibly). If genuine reuse is needed later, that's a different feature (a template library), not this one.

Settled:

- A linked `label` travels with its field in both directions (label ordered first, so it lands to the left).
- A row belonging to a repeatable group cannot change step (same rule as reordering) — tabs render rejected/red for it.
- **`planLanding` deliberately skips `resolvePlacement`** (which truncates `colSpan` as a last resort) — a field lands whole, in a new row if needed, never narrowed where you can't see it.
- A row lands appended at the end of the target step; reposition afterward by dragging.
- Target step is stripped of any pre-existing linked label before planting, to avoid duplicating it.
- `activeCanvas` follows the move and the field stays selected.
- **Backward references are reported, never pruned** (`TransferNotice`) — only those a move leaves on an intro field pointing at a form field, the one direction the pickers refuse (see "Conditions"). A form field watching an intro field is legal and stays silent. Script refs are excluded (travel by name, which moves with the field).
- Tab droppable is `disabled` unless a transfer is in flight (same structural guard as the group band).
- **Collision detection is `pointerWithin` first, `rectIntersection` fallback** (`pointerFirstCollision`) — dnd-kit's default compared the row-wide overlay against each tab, so the widest covered tab always won regardless of pointer position. Rect fallback still forgives gaps between rows.
- Over a tab the row preview collapses to a compact chip (`hoveredTransferTarget`) so the tab strip stays visible, and switches to `centerOverlayOnCursor`.

## Repeatable groups (`actividades[]`)

A repeatable group is a **marker on the row**, not a nested container: `CanvasRow.groupId` points at a `RepeatableGroup` in `FormStep.groups[]`. Chosen because `useDragAndDrop` resolves everything by `rowId` and never inspects contents, so drag & drop, `rowLayout`, resize and placement all work inside a group unchanged, and fields stay freely movable/reorderable. Cost: contiguity isn't structural — `normalizeGroupRows` re-pulls a group's rows together after any mutation that could scatter them.

Helpers in `src/lib/repeatableGroup/repeatableGroup.ts`. Bounds default `DEFAULT_GROUP_MIN = 1` / `MAX = 15` (ICA rule), clamped to `MIN_GROUP_ITEMS = 0`…`MAX_GROUP_ITEMS = 99`.

Settled:

- **`arrayPath` is absolute** (`actividades[].idActividad`), not group-relative — one namespace, no special cases in `resolveLeaf`/mapping.
- Moving a field out of a group clears its `apiBinding` (path is meaningless outside the array item). Changing a group's `arrayPath` clears all members' bindings for the same reason.
- Deleting a group's last row deletes the group (`pruneEmptyGroups`); `removeGroup` instead keeps the rows and strips `groupId`.

UI: `RepeatableGroupBand` (title, min/max, `arrayPath` select, +Fila, dissolve, collapsed `GroupChecksEditor`), `CanvasRowsGrid.utils.ts` (`toCanvasBlocks`), "+ Grupo repetible" in `CanvasToolbar`.

### `group.checks` — validation that spans the whole group

`GroupCheck` = `{id, label, enabled, script, message}` on `RepeatableGroup.checks[]`, exported compiled like `logic.script`. Evaluated **once per group in root scope** (not per repetition) — **truthy passes, falsy shows message**. Motivating rule (ICA template): sum of `ingresos_gravados` across activities must equal renglón 16.

**First non-per-field validation in the project** — Zod's `safeParse` works on one scalar at a time and can't see the root.

Settled:

- Owner is the group, not the field it compares against — the activities step has no root field to hang an error on, and hanging it on renglón 16 (one step earlier) would block navigation before any activity exists.
- A script, not a typed rule — reuses `compileScript`, the scanner, the prelude, `reads`, the compile cache, and the consumer already runs compiled scripts with `new Function`. A typed rule would need an interpreter.
- **A broken check never blocks** — throw or `undefined` both report a `RuntimeIssue` and pass (author's bug, not the taxpayer's).
- **`enabled: false` isn't exported at all** — no third state for the consumer to interpret.
- Scope built from `snapshot.groups` (third-pass, definitive), never the root's first-pass array copy.
- Not an edge in `fieldGraph` — a check observes but produces no value.
- Error key `check:${groupId}:${checkId}` (`checkKey`), shares the map with field errors (a field literally named `check` can't collide).
- `stepErrorKeys` adds group check keys so "Siguiente" actually gates on them.
- `lib/groupCheck/` stays declarative-only — evaluation (`buildCheckScope`, `runGroupCheck`) lives in `runtimeValidation.ts`, past the lazy boundary, to keep the exporter from dragging `formRuntime`/`scriptRuntime` into the initial chunk (measured: +12.5 kB initial otherwise).
- Compares with `abs(a - b) < 1`, not `===` (both round to the thousand today, but shouldn't have to).
- **Ships enabled** — balancing is the rule; forgetting to turn it on would let evasion through silently.

## The field script (`logic.script`, `formScript`, `logic.rules`)

**A field's value is computed in exactly one place: `logic.script`**, JS with `{{campo}}` to read other fields. Replaced a self-contained formula language + rules editor + an unexecuted `logic.typeScript` textarea — three mechanisms for one question.

`src/lib/fieldScript/fieldScript.ts`: `compileScript`, `validateFieldScript`, `validatePrelude`, `buildScriptFunction`, `composeScriptBody`, `normalizeScriptResult`, `fieldRefText`, `unknownRefsMessage`, `findScriptRefs`. **No function throws** — errors travel in the result since the editor calls them on every keystroke.

Contract (identical for a script and a rule effect):

- `return` gives the value; **`return undefined` means "leave what the user typed"** (not `computed`, stays editable).
- Scope: `value`, `index` (repetition inside a group), and helpers from `src/constants/fieldScript.ts` — `num`, `sum`, `count`, `abs`, `min`, `max`, `round`, `floor`, `ceil`, `dvNit` — passed as **named parameters**, not a container object.
- Inside a group `{{sibling}}` is that row's scalar; from root `{{column}}` is the whole array (`sum` flattens it).
- Non-finite result → `null` (`normalizeScriptResult`).

**`scanScript` is a scanner, not a regex** — blind substitution broke on `{{campo}}` inside strings/comments. Skips strings/comments/template text, **substitutes inside `${...}`**. Known limit: regex literals aren't detected (now needs a regex with a field name between double braces to bite).

`formScript` (the prelude) is form-wide, **cannot read fields** (`{{campo}}` invalid there — no single answer inside a repeatable group). Concatenated ahead of the body, so the compile cache absorbs the repetition; `validateFieldScript` checks the body alone first so a broken prelude reports as the form's problem, not every field's.

`FieldRule` = `{id, label?, matchAll, when: RuleCondition[], effects: RuleEffect[]}`, effect is `{kind:"script", source}` or `{kind:"constant", value}` — **survived on purpose** (declarative condition+effect, not a second language). Run **after** the script, overwrite in list order. `src/lib/fieldRule/fieldRule.ts`, UI in `FieldRulesEditor`/`useFieldRules`.

`src/lib/fieldGraph/fieldGraph.ts` unifies **four** edge sources (`visibleWhen`, `enableWhen`, `rules[].when[]`, `{{campo}}` refs) into one dependency graph — `buildNameToIdIndex` normalizes refs to ids, `topologicalOrder` returns `{order, unresolved, cycle}`, never throws.

Settled:

- **A script cycle is warned about, never blocked** (free text, refusing input mid-word fights the person typing); condition editors _do_ block with an `alert` since those are picked from a list.
- **Script sees values coerced by field type** (`coerceForScript`) — otherwise `"5"+"3"` = `"53"`. **Whole model is coerced**, not just touched keys — an untouched field's `undefined` becoming `NaN` in a subtraction was killing entire chains of renglones.
- **Compile cache is module-level**, keyed by composed body (prelude included) — without it, ~31 `new Function` calls per keystroke with 15 activities. Compile errors cached separately.
- `evaluationOrder` is **not exported** (silently appended cycle members to the end). What's exported instead is `script.reads` per field.
- `lib/formula/` is gone except its parser, which survives in `lib/scriptMigration/` purely to open pre-migration drafts. Delete once no old drafts remain.
- **An unparseable formula is preserved as a comment inside the script**, field falls back to `return undefined` — neither dropped nor crashes the draft (old formula editor stored invalid text too).

### References are `{{campo}}` (double braces)

**The single-brace `{campo}` syntax was replaced by `{{campo}}`** so a reference can't be mistaken for JS: `{a}` could be a field or a destructuring/object literal, `{{x}}` is valid JS in no expression. Spaces inside are tolerated (`{{ campo }}`), newlines never (`REF_PATTERN`). **`fieldRefText(name)` is the one place that writes the syntax** (messages, autocomplete, migration) — changing it again means that function plus `REF_PATTERN`.

Settled:

- **Only a known name is substituted, and an unknown `{{x}}` is an error, not a warning** (typo, deleted or renamed field). `validateFieldScript` checks it _before_ syntax — the leftover `{{x}}` is almost always also the syntax error, and "Unexpected token '{'" says nothing — and the export review blocks on it, reported alone. The old "warning, because it might be destructuring" reasoning died with the single brace.
- **Editors judge refs against the same names as the export**: `useKnownFieldNames()` (both canvases), used by the field script, rule effects, group checks and the prelude. They used to see `formSteps` only, which falsely flagged `{periodo_anio}` on renglones 31/37. `candidates`/dependencies/cycle come from `useDependencyCandidates` (see "Conditions").
- **Any `{{x}}` in the prelude is an error, field or not** (`validatePrelude` takes no names); with one present the syntax check is skipped, and `checkPrelude` treats the prelude as broken (`isValid`, not just `error === null`) so field scripts aren't composed with it.
- **Autocomplete**: `{{` opens the field list and closes with `}}` respecting what closeBrackets already inserted. A single `{` no longer opens it (it popped on every JS block, and Enter then accepted a field). **Ctrl+Space anywhere offers helpers + fields**, a field inserted already wrapped; plain typing offers helpers only, for the same Enter reason.
- **The "+ Insertar campo…" select is gone** from `ScriptInput` (and so from the field script, rule effects and group checks, sidebar and right-click alike) — the autocomplete covers it.
- **The simulator and the consumer never read the syntax**: they run `compiled` (`__v["campo"]`) and `reads`, byte-identical under both syntaxes — the change needed zero runtime code. `source` carries `{{campo}}` and is still never executed.
- **Drafts migrate at `DRAFT_SCHEMA_VERSION` 7** (`upgradeFieldRefs` in `lib/scriptMigration/`): field scripts, rule effects, group checks and the prelude, both canvases. It rewrites **exactly what the old compiler substituted** — `findScriptRefs` runs the same scanner with the frozen `LEGACY_REF_PATTERN` (`scanScript` takes the pattern as a parameter for this) and only known names change — so a migrated script compiles to the same body. Verified with a tsx script over 34 scripts with trap cases (destructuring, strings, comments, template `${}`, regex quantifiers, unknown refs, a nameless field): identical compiled output before/after. The rewritten ICA template compiles identically too, except one comment that names `{{total_a_pagar}}`. Comments in saved scripts keep `{campo}` (the scanner skips comments, on purpose). `formulaToScript` still prints `{x}`: it is step 2→3, and step 6→7 lifts its output.

### No-code calculation (`SimpleCalcModal`)

Lets a non-programmer set a field's calculation. "Editar sin código" in "Cálculo del campo" (numeric fields only) opens a modal: rows of `[+|−] field`, "Multiplicar el resultado por", "No bajar de 0", a `<details>` with the generated JS. Pure core in `src/lib/simpleCalc/` (`buildCalcTermOptions`, `indexCalcTermOptions`, `buildSimpleCalcScript`, `parseSimpleCalcScript`), state in `useSimpleCalcBuilder`, rows in `molecules/CalcTermRow`.

Settled:

- **`logic.script` stays the only truth** — no stored model, no draft/export/consumer change. Apply writes once through `setFieldScript` (one undo step); Cancel leaves nothing.
- **Generated text copies the ICA template style letter for letter** (`return {{a}} - {{b}};`, `max(…, 0)`, `({{a}} + {{b}}) * 0.15`), which is what lets the modal reopen template renglones. **The floor wraps the multiplier**: what can't go below zero is the field's value.
- **Reopening = read leniently, regenerate, compare without whitespace.** The modal only claims scripts it would write identically; anything else opens empty with a "Aplicar lo reemplaza" banner. On the ICA template it recognizes 10: renglones 10, 16, 17, 20, 21, 25, 33, 35, 38, 40. A line break right after `return` is rejected (ASI would return `undefined`).
- **`sum({{x}})` iff `x` lives in a group other than the edited field's** — there `{{x}}` is the column array and `+` would concatenate it as text. Same-group siblings and root fields go bare.
- **Picker**: numeric form-step fields only, labels (not slugs), one `<optgroup>` per step and per group ("misma fila" / "suma de todas las filas"). Options that already depend on the edited field are disabled (`wouldCreateCycle`, the export review's verdict).
- **Keyboard guard**: a capture-phase `keydown` on `window` stops every key while the modal is mounted (Escape cancels). Without it Delete would delete the field being edited and Escape would deselect it, unmounting the modal — focus may be on `body` after a backdrop click, so a React `onKeyDown` isn't enough. Ctrl+S is swallowed meanwhile; autosave keeps running.
- Not built: field × field (`impuesto_actividad`), constants as terms, renglón 34's `-(…)`, a searchable picker.

## Presentational fields (`label`, `rich_text`)

**Input fields** collect a value; **presentational fields** only show content. Predicate: `isPresentationalField` (`src/lib/fieldKind/fieldKind.ts`), backed by `PRESENTATIONAL_FIELD_TYPES`.

A presentational field keeps `colStart`/`colSpan`/`styles`/`visibleWhen`, loses validations/payload mapping/`enableWhen`/script/rules, never appears as a condition/script candidate. `LogicPanel` short-circuits to just visibility for them.

### `label` — an external label bound to a field

Link lives **on the label**: `CanvasField.labelFor` points at the input. "A field with a linked label has no label of its own" is **derived, never stored** (`hasLinkedLabel`). `CanvasRowsGrid` builds a `linkedLabels` index once and drills it down (was O(n) per chip — measured 16.9× necessary work on a 15-field step).

Invariants: **1:1** (`setFieldLabelFor` unlinks any prior label on that target); **no dangling refs** (`removeFields` clears `labelFor` too, but deleting the target just leaves the label unlinked, matching "holes are preserved"); `labelTargetCandidates` offers free input fields + the current target.

The linked field **keeps `field.label` in the model** (drives `name` and every panel that names the field) even though nothing renders it. Canvas shows the label's own text in muted italics.

**A linked label inherits its field's visibility** via a second pass in `buildScope` (target may come later in the list) — derived, never copied onto the label (which would orphan on edit). `=== false` guard: a target outside scope leaves the label alone.

### `rich_text` — a formatted content block

Standalone, never bound to input. Bold/italic/underline/links only — no lists, no headings.

**Content is stored structured, never as HTML** (`RichTextContent`, `src/types/richText.ts`) — an HTML blob would be executable markup, same class of risk as the `validations.pattern` injection. Do not "simplify" to HTML.

**The serializer is the sanitizer** (`serializeRichText`, DOM walk with a whitelist: `b/strong/i/em/u/ins/a/br`, drops `script`/`style`/`iframe` subtrees, flattens everything else to text, reads inline `font-weight`/`style`/`text-decoration` for HTML that still gets in, e.g. dropped). **Pasting is always plain text** (`pastePlainText`, like Ctrl+Shift+V): pasted HTML was breaking the editor; formatting is applied afterwards with the buttons.

**`safeHref`** allows only `http:`/`https:`/`mailto:` (prefixes `https://` if no scheme) — runs at insert, serialize, **and again on draft load** (localStorage is devtools-editable). Keep all three.

Editor is `contentEditable`, repaints **only on mount** (`key={field.id}` remounts on field change — repainting on every keystroke would jump the caret to the end).

## Simulador (`FormSimulator`) — el consumidor de mentira

A working prototype of the consuming app, not a mock. **Full-screen mode** — `isSimulatorOpen` in the store, `FormBuilder` returns `<FormSimulator />` early (sidebar/canvas/`DndContext` unmount). Entry point is a button beside "Exportar JSON", deliberately not a `VIEW_MODE_TABS` member. `useAutosave`/shortcuts stay running (they live in `App`, above `FormBuilder`).

**The single rule that makes it worth anything: it consumes `buildFormExport(...)` and never touches `useFormStore`.** `useFormPreview` is the only store read, solely to feed `buildFormExport`. If the simulator can't do something, neither can the real consumer. Everything keyed by field **name** (export already resolved ids to names).

Layers (React-free, ~1ms/keystroke on the full ICA form with 15 activities):

- `lib/formRuntime/` — `buildRuntimeModel`/`resolveRuntime` → `RuntimeSnapshot` (root + per-repetition scopes + `issues`).
- `lib/runtimeCondition/` — `evaluateCondition`, the 13-operator executor (didn't exist before — builder only ever _authored_ conditions).
- `lib/runtimeDerived/` — resolves `logic.script`/`logic.rules` in topological order (script → rules override → rounding).
- `lib/scriptRuntime/` — runs author code with `new Function`. A throw is that field's problem; an infinite loop freezes the tab (not worth a worker+timeout today).
- `lib/runtimePayload/` — walks `apiBinding.path` into the real `DeclaracionIcaE` object.
- `lib/zodHydrate/` — `new Function("z", ...)` over `validations.zodSchema`.
- `lib/mockCatalog/` — simulator-only option data, **never exported** (verified by grep). Three tiers: `MOCK_CATALOGS` by `dataSource.catalog` → `MOCK_BY_LEAF` by payload leaf → `placeholderOptions`. `MOCK_BY_LEAF` exists because conditions compare against **real catalog ids** (e.g. `tipo_documento === "2"` for persona jurídica) — fake ids would make persona jurídica unreachable in the simulator.
  - `mockCatalog.data.ts` is **generated, not authored** — 9 catalogs, 1601 entries transcribed verbatim from real API dumps, warts included (duplicate CUNDINAMARCA, split words, uppercase everywhere). **Do not tidy them.**
  - Departamentos/ciudades keyed by the API's own ids (1–33 / 1–1119), not DANE codes.
  - Actividades dump has a different shape (`{idDeclaracion, codigoCIIU, descripcion, tarifaXMil}`) — `idDeclaracion` used as option id, `codigoCIIU` as `code`; **unconfirmed which the payload leaf actually wants**. Dump is also a known subset (missing CIIU 210).
  - `CatalogOption` = `{id, label, code?, tarifa?}` — extra columns never reach the export (consumer's own endpoint returns them).
  - **`tarifa` column is empty** (dump lost `tarifaXMil`) — every activity reads "sin tarifa" until a fresh dump or manual paste in the Catálogos tab. Do not fabricate.
  - `dataSource.fills` projection is built and works (`codigo_actividad` fills correctly); `tarifa_x_mil` stays empty for the same data reason.
  - `periodoAnio`, `idClasificacionMunicipio`, `idTipoRepresentante` in `MOCK_BY_LEAF` are still invented (never came in a dump).
  - Adds ~93 kB raw but sits behind the lazy boundary.

Settled:

- **Three passes in `resolveRuntime`**: groups w/ raw root values → root w/ group columns exposed as arrays → groups again w/ resolved root. Collapsing this silently zeroes the ICA totals.
- A scope per repetition, not one bag.
- **`eval` is the contract, not a shortcut** — `ExportedField.validations` carries only Zod strings; the consumer has no other validation path. `hydrateZodSchema` wraps in try/catch → `RuntimeIssue`.
- `hydrateFieldSchemas` keys by schema _string_ (a field can have >1 schema depending on override state; a name key can't answer).
- `required` is sniffed from the schema string (no trailing `.optional()`); `checkbox` excluded (never gets `.optional()` appended).
- Runtime issues deduplicated (`dedupeIssues`) — a broken group script would otherwise report once per repetition. It runs again over `validateRuntime`'s final list, which adds sources after the snapshot's dedupe, because `PreviewResults` keys each warning by the same `kind|field|message`.
- Preview state is **local to the component tree**, never the Zustand store (answers are throwaway).
- Hidden fields are neither rendered nor validated.
- **Validation is per step and gates navigation** — no "validate everything" button. `stepErrorKeys` expands group rows to per-repetition keys; errors revealed only for reached fields (`revealed`), but the results panel shows everything live.
- `react-hook-form` still unused — the hard part is the runtime, not state; a plain value bag makes script-writeback and repeatable arrays easier.
- `number`/`calculated` render `PreviewNumberInput` (the only stateful control — owns typed draft + focus/blur, since a number input can't display `1.000`).
- **`search_select` is a modal, `select` stays native** — 425 actividades × 15 repetitions would be 6,375 `<option>` nodes mounted upfront. Modal filters code+description, accent/case-insensitive, closed = no filtering.
- **The modal cannot clear a selection** — "Quitar" was removed; changing activity means picking another, removing one means deleting the whole row (so its ingresos/impuesto go with it). First row has no delete button (`min: 1`).
- A missing tarifa shows a muted **"sin tarifa"**, gated by `fillsColumn(field, "tarifa")` so a municipios select stays silent.
- Tarifa always reads `4X1000`, never `4‰` (per-mille misread as percent otherwise).

**Behind a `React.lazy` boundary** in `FormBuilder` — measured 872 kB → 762 kB initial + 117 kB on demand. What crosses is `mockCatalog.data.ts` + `preview/` tree — **not Zod** (`persistence.schema.ts`/`catalogBank.schema.ts` import it eagerly since `loadDraft` runs at startup; getting Zod out needs an async `loadDraft`, not done). Keep the boundary honest: any new eager import of `lib/mockCatalog/`, `lib/zodHydrate/`, or `components/organisms/preview/` from the builder side pulls the chunk back in.

**Second, bigger lazy boundary**: `ScriptInput` lazy-loads `ScriptEditor` (CodeMirror, 457 kB/155 kB gzip) — only on Logic tab open. The plain-textarea fallback is the real pre-CodeMirror control, not a spinner.

**Third lazy boundary**: `PdfDesigner` (see "PDF designer").

## PDF designer (`PdfDesigner`)

The declaration's PDF template, designed inside FormMaker. Plan, decisions and the to-do list live in `docs/Pendientes-PDF.md` (Spanish) — tick items off there. Built so far (§3.1 + §3.2 + §3.5, 2026-11-17): the zone, the model, local autosave, the editor (sheets, tables with merged and nested cells, free HTML, extra margin, own undo), and the file: publish (download `<tax>_v<N>.html`), open a local `.html`, import a hand-made template. §3.3 (2026-11-18): cell components — image, vertical text, NIT with DV, signatures, barcode, QR, stamp; **no checkbox and no repeating row, the user's call ("por ahora no")**. Not built: the variable list (§3.4). Pieces: `types/pdfDesign.ts`, `constants/pdfDesign.ts` (the conversion profile) and `constants/pdfCanvas.ts`, `lib/pdfDesign/` (sizes, blank design, which tax, `tableStyleMap`/`cellStyleMap`/`documentStyleMap`), `lib/pdfTable/` (grid operations), `lib/pdfDesignEdit/` (design-wide edits and lookups), `lib/pdfHtml/` (the sanitizer and the tolerant reader), `lib/pdfFile/` (generate and read the `.html`), `lib/pdfTemplates/` (the factory templates), `lib/pdfComponents/` (the components' HTML, pure) and `lib/pdfVerticalText/` (the vertical-text PNG, touches the DOM), `lib/pdfDesignBank/` (`localStorage` + migrations), `store/pdfDesignStore.ts`, `hooks/usePdfDesignAutosave/`, `hooks/usePdfDesignerShortcuts/`, `hooks/usePdfFile/` and `hooks/usePdfImageCheck/`, `organisms/PdfDesigner/` + `organisms/pdf/*` (canvas, sheet, table, sidebar and its panels — `PdfComponentPanel`, `PdfImageSourceField`, `PdfSignaturesFields`, `PdfTextField` for the components —, the file notice), and in the initial chunk `PdfDesignerButton` (an icon in the right panel's action row and in the collapsed chip; its tooltip names the tax whose template it opens) and `PdfDesignerCrashScreen`.

Settled:

- **Full screen, like the simulator — not a third `CanvasTarget`.** `isPdfDesignerOpen` in the form store; `FormBuilder` returns the lazy `PdfDesigner` early, with its own `ErrorBoundary`. The doc first said "a third kind of canvas", but `CanvasTarget` is read in ~57 places that assume rows and fields, travels in the form's history snapshot, and a `pdf` variant would fall into every "else it's the intro modal" branch. Keyboard shortcuts ignore the form canvas while it is open, as with the simulator.
- **Its own store, `usePdfDesignStore`, not a slice of `useFormStore`**, with its own zundo `temporal`: undo in the PDF must not touch the form, nor the reverse. Same shape as the form's history — snapshot `{design, selection}`, equality on `design` only, 500 ms bursts through `createBurstGate`, limit 100, gate reset on undo/redo, `reconcilePdfView` after travelling, history cleared by `openDesign`. Equality is **by reference** (unlike the form's content walk): every edit in `lib/pdfDesignEdit`/`lib/pdfTable` returns the same reference when nothing changed, and that is the invariant that keeps empty steps out — keep it in any new edit. `store/index.ts` doesn't re-export the store — imported by path, from behind the lazy boundary only. Ctrl+Z/Y/S and Escape come from `usePdfDesignerShortcuts`; the form's Ctrl+S stands down while the designer is open.
- **The model** (draft version 2): a sheet is a list of blocks — a table (`PdfTableBlock`) or free HTML (`PdfHtmlBlock`); a cell's `content` is text with `{Var}`s, free HTML, or a nested table (up to `PDF_MAX_TABLE_DEPTH = 4`). Tables follow HTML's own model (each cell once, in its starting row, with spans) plus a `columns[]` array that carries the widths — no single cell can say how wide a column is once there are colspans. `pdfDesignBank.migrations.ts` lifts version 1 (one table per sheet, `cell.text`) — migrate before validating, as the form's drafts do.
- **Every table operation goes through `placeCells`** (`lib/pdfTable`): place each cell on the grid with the browser's algorithm, move positions and spans arithmetically, rebuild the rows. Spans that don't fit are clipped like the browser does, and `normalizeTable` fills holes — a hand-written template with odd spans is read the way Chrome paints it. The last row/column can't be removed. Merging takes the Shift+click rectangle, grown until it cuts no merged cell (`selectionRect`); joined texts are kept.
- **The sanitizer is a tokenizer, not `DOMParser`** (`sanitizePdfHtml`): it runs in tsx scripts as in the browser, and the output is rewritten from scratch — whitelisted tags, whitelisted attributes quoted and escaped, text escaped — so nothing of the input passes verbatim. URLs are judged decoded and with control characters stripped (`java&#115;cript:` is `javascript:`); `src="{Code}"` passes, since the back fills it. `<style>` is kept with `sanitizeCss` (no `@import`, `expression(`, `behavior`, unsafe `url()`, comments stripped first) and every `<` inside neutralized. It's the first barrier; the second is the back's converter without JavaScript (doc §7.1).
- **The canvas renders in one shadow root** (`PdfCanvas`, a React portal into it). The author's `<style>` would otherwise restyle FormMaker itself; inside, it reaches only the sheets, and since every sheet shares the root, a `<style>` on sheet 1 applies to sheet 2, as in the final single HTML document. Tailwind doesn't reach inside: the canvas classes are `fm-*` (`PDF_CANVAS_CLASS`) defined by `CANVAS_CSS`; app tokens (`--color-brand`…) do cross, as CSS variables inherit. React catches events at the portal container, so clicks work normally. Editing chrome (selection, hover, guides) uses shadows and outlines, never space.
- **The PDF designer has the same floating toolbar as the form canvas (2026-11-18)** — `organisms/pdf/PdfToolbar`, bottom centre of the canvas area, minus + Fila / + Grupo repetible (the user's call: "prácticamente igual"). Mover (V) / Selección múltiple (M) / Mano (H), Deshacer / Rehacer, the low-performance toggle, and with 2+ cells selected "N celdas · Combinar · Deseleccionar". Settled with the user: **M = drag across cells** (press in one cell and drag to another of the same table builds the rectangle; a click without dragging extends like Shift+Click; a drag never crosses into another table), **Deshacer/Rehacer moved from the header to the bar**, and the selection group offers **Combinar** instead of Mover a paso / Eliminar. What is shared, so the two bars can't drift: `molecules/CanvasToolPicker`, `HistoryButtons`, `PerformanceModeToggle`, and the `CANVAS_TOOLBAR_*` / `CANVAS_TOOL_BUTTON_*` classes in `constants/uiClasses.ts` (they moved there from `CanvasToolbar.constants.ts`). The bar is a sibling of the scrolling `<main>`, not inside it, so it doesn't scroll with the sheets. `tool` lives in `usePdfDesignStore` (outside the history, never saved, like `zoom`); the low-performance preference stays global in `useFormStore`. Pieces and traps: **(1)** the PDF's `<main>` carries `data-canvas-scroll`, so `useCanvasPan` and the Space shortcut find it through `getCanvasScrollPort` (the form and the designer are never mounted together). **(2)** `useCanvasPan` now decides "scrollbar press" **by geometry** (`clientX/Y` past `clientWidth/Height`) and not by `target === port`: in the PDF the empty space around the sheets is the port itself and must pan. **(3)** The hand makes the sheets inert with `.fm-doc[data-tool="hand"] { pointer-events: none }` inside the shadow root, so the pointer lands on the host (a child of `<main>`); `:host` is `min-width: max-content` so the host covers the whole scrollable width (at 300 % the sheets are wider than `<main`>). **(4)** The cells carry `data-fm-table-id` / `data-fm-cell-id` (`PDF_CANVAS_ATTRIBUTE`) and `PdfCanvas` handles pointer down/over once on `.fm-doc`, not per cell. **(5) TRAP: after a drag across cells the browser sends the `click` to the common ancestor (the row), which bubbles to the paper's `onClick` = "activate sheet" = `clearSelection()`, wiping the rectangle just built.** `PdfCanvas` swallows that one click (`swallowClickRef`, set on pointer up after a started drag, cleared on the next pointer down). **(6)** `usePdfDesignerShortcuts` copies the form's V/M/H and Space-held-as-temporary-hand logic (it writes to another store, so it isn't shared); Space only acts with the pointer over the sheets. Not done: the `.low-performance` CSS rule doesn't reach the shadow root and Ctrl+wheel in the PDF isn't coalesced per frame. Verified in headless Edge over CDP with real mouse events (34 checks on the PDF, 11 on the form: tools and keys, hand at 300 % from sheet / margin / scrollbar, Space, drag selection, Combinar, undo from the bar, + Fila, no console errors).
- **The PDF's line-height is a fixed `1.15`, never `normal` (2026-11-18)** — `PDF_LINE_HEIGHT` in `constants/pdfDesign.ts`, applied by `documentStyleMap`, so the canvas and the exported `.html` share it. `normal` is computed per engine from the font metrics and rounded differently (Arial at 8px: 9px lines in Chromium, 10px in Firefox); with ~70 one-line rows the factory ICA template measured 994px in Edge and 1060px in Zen (it didn't fit the 1018px sheet there: the red "No cabe" outline, which covers the dashed guides), and 1006.5 / 1007.1px with 1.15. **Unitless on purpose**, so it scales with each cell's font size. Measure a template in more than one engine before calling it "fits": render the published `.html` in headless Edge (`--dump-dom`) and Zen (`--headless --screenshot`, with `-profile <tmp> --no-remote` so it doesn't touch the open session). SelectPdf's old WebKit is a third engine, still unmeasured.
- **The canvas has its own zoom, 50–300 %** (`zoom` in `usePdfDesignStore`, `PdfZoomControl` in the floating toolbar since 2026-11-18, moved from the header, its menu opens upward: − / % menu / +; Ctrl + wheel over the sheets; Ctrl + / - / 0 from `usePdfDesignerShortcuts`), asked for by the user — the one-sheet ICA template is 8 px text. It reaches further than the form's 150 % for that reason. View state only: outside the history (`partialize` keeps `design`/`selection`), never saved, and `setZoom` skips equal values. Buttons and keys jump to the next multiple of 25 % (`stepPdfZoom`: from 113 %, + goes to 125 %, not 138 %); the wheel is continuous (`wheelPdfZoom`). **Each paper is scaled with `transform` inside a box sized to the scaled paper** (`PdfSheetView`): the transform keeps the paper's own px, so the "No cabe" `ResizeObserver` still measures real px, and the outer box gives the scroll and the gap between sheets the scaled size. No transform at 100 %. **The scroll is anchored** — on the cursor for the wheel, on the view's centre otherwise — by recording `scrollLeft`/`scrollTop` in a store subscription, which fires before React paints (afterwards, zooming out, the browser would already have clamped the scroll to the smaller content), and restoring them in a layout effect. The scroller is the designer's `<main>`, the host's parent.
- **A 1 px guard on each side of every sheet's content** (`PDF_EDGE_GUARD_PX`, applied by `sheetEdgeStyleMap` to the canvas flow and to each generated sheet `div`; `contentBox` discounts it). A collapsed-border table paints its edge borders half inside and half outside its box; at exactly the sheet's width the outer half of the right border landed on px 778, which the canvas clips (`overflow: hidden` at the guide) and the converter's 778 px window doesn't paint — reported by the user as "the right border never shows", plus text shifting half a pixel when the border was removed. Measured with headless Edge: the table now spans 1..777 and the sheet no longer overflows (779 → 778). With `table-layout: fixed`, columns whose widths sum to more than the space make the table grow past it, so the ICA template leaves its last column without a width. **The sheet also reports overflow to the right** ("Se sale por la derecha: sobran N px y se pierde el borde", `measureSheetOverflow` in `PdfSheetView.utils.ts`): each block's `offsetLeft + max(offsetWidth, scrollWidth)` against the flow's width minus the guard — offset sizes ignore the zoom transform. It exists because a design saved before the guard (the ICA template with its last column at 66 px) kept clipping its right border in silence; the user hit it in Brave while Edge, with a freshly loaded template, looked fine — each browser has its own `localStorage`. Verified on a static replica of the canvas in headless Edge: 0 px for the current template, 3 px for the old one.
- **What doesn't fit a sheet is clipped at the guide and reported** (`ResizeObserver` on the sheet's content, "No cabe: sobran N px"), never flowed to the next sheet.
- **Style edits apply to the whole selected rectangle** (`updateSelectionStyle`); content edits to the focus cell. `cellStyleMap`/`tableStyleMap`/`documentStyleMap` + `pdfStyleSheet` are the single definition of how a cell, a table and the page paint (since 2026-11-18 the first two return only the element's **own** inline CSS — named properties, then the sanitized free CSS on top — and what is common lives in `pdfStyleSheet`, see "Design classes"); the canvas and the generator both call them, so they can't diverge. `documentStyleMap` sets `line-height: normal` on purpose: the shadow root inherits FormMaker's 1.5 (Tailwind preflight) while the converter starts at `normal`, so without it every canvas row was taller than in the PDF.
- **The `.html` is the only source, and it is reopened by reading its structure** (`lib/pdfFile`: `buildPdfHtml`, `readPdfFile`) — not from a JSON blob stuffed in an attribute, which a hand edit of the file would silently contradict. What the reader needs travels in `data-fm-*` (SelectPdf ignores them): on the root `data-fm-design` (the _file_ format, `PDF_FILE_FORMAT_VERSION`, independent of the storage schema; a newer one is refused), `-tax`, `-version`, `-font`, `-font-size`, `-margins`; `data-fm-sheet`, `data-fm-block` (free HTML), `data-fm-table`; on each cell `data-fm-cell` (its kind), `data-fm-props` (the sidebar's properties as JSON) and `data-fm-style` (the author's free CSS — the `style` attribute is the merged map and can't be split back). Cell text, spans, column widths and row heights are read from the HTML itself, so a hand edit of a text survives reopening; a hand edit of `style` doesn't (it's re-derived). Rows and cells go through `normalizeTable`, so a cell deleted by hand still yields a sane grid; the whole design goes through the storage schema (`parsePdfDesign`), so a damaged file can't put a shape in the store that the autosave would later reject. Verified: generate → read → generate is byte-identical.
- **Design classes (2026-11-18), asked for by the user: "sin clases queda demasiado código en el html".** The ICA template was 116 KB of markup (images aside), ~83 % of it repeated `style` (46 KB) and `data-fm-props` (51 KB) — 38 distinct style combinations over 253 cells. Now `design.classes: PdfClass[]` (`{name, …PdfStyleProps, css?}`, same properties as a cell's sidebar plus free CSS) and a cell's `className` names them. Rules: **(1) One stylesheet, `pdfStyleSheet(design)`**, emitted in the file's `<head>` and as a second `<style>` in the canvas shadow root: `.fm-t { collapse; 100 %; fixed }`, `.fm-t > tbody > tr > td { padding: 2px; vertical-align: top }` (what every `<td>` used to repeat inline), then each class as `.x, .fm-t > tbody > tr > td.x { … }` in list order. The second selector exists because a bare `.x` (0,1,0) loses to the base rule (0,1,3) and couldn't change a cell's padding; the bare `.x` keeps it usable on a `<span>` in free HTML. **`fm-t` (`PDF_TABLE_CLASS`) is put on every editor table by the generator and the canvas**, stripped by the reader; `fm-` is reserved (`isValidPdfClassName`), invalid names are skipped in the sheet. **(2) Cascade = base < classes (later in the list wins) < the cell's own props < its free CSS.** `inheritedCellStyle` reproduces the class part for the sidebar. So own props can now override a class: `bold`/`italic: false` emit `normal`, and a cell with classes that sets its own `borders` emits `none` for the sides it lacks; all four sides collapse to one `border`. **(3) The sidebar shows the effective value** (`PdfStyleFields`, shared by the cell panel and the class editor): a button lit by a class looks lit, and choosing what the class already gives _removes_ the own prop instead of duplicating it — otherwise the file would refill with inline styles. **(4) Editing**: `PdfClassesPanel` (create, rename — also in every cell, nested included —, edit, remove — also from every cell —, usage count), class toggles in the cell panel, and "+ Nueva clase con este estilo" (`createClassFromCell`): the focus cell's own props/CSS become the class, every selected cell gets it and drops the own props equal to it. `editingClass` is view state in the store (outside history, like zoom). New rows/columns copy the neighbour's `className` as well as its borders (`newCell(like)`). **(5) File**: classes travel as JSON in `data-fm-classes` on the root (bad entries dropped one by one with a warning); the `<head>` `<style>` is regenerated and never read. Text cells no longer carry `data-fm-cell` (the reader's default), empty `style` attributes are omitted. Format bumped to 3; 1 and 2 still open. Storage schema not bumped: `classes` has `.default([])`. **(6) The ICA factory template uses 9 composable classes** (`ICA_CLASSES`: `celda`, `suelta`, `arriba`, `negrita`, `centro`, `derecha`, `gris`, `titulo`, `sangria`) built by `pdfTemplates.utils` from the same options as before. Result: 23 KB of markup, 29 `style=` (columns and the root) and 1 `data-fm-props`; **rendered in headless Edge, the table and every cell have the same position and size as before** (776 × 994, identical per-cell geometry). Verified with a tsx script (51 checks: ICA round trip byte-identical, cascade, `}`/`<` in a class's CSS dropped, reserved and invalid names, damaged `data-fm-classes`, format-2 files, rename/remove/toggle/create-from-cell including nested tables, reference equality on no-ops, storage without `classes`, store + undo). **Not checked**: the panels in a browser, and the `<style>` through SelectPdf's old WebKit (child combinators and attribute-free class selectors should be fine there, but it's unverified).
- **The designer's contrast is fixed for the PDF only (2026-11-20, `docs/Plan-PDF-UX-P1.md`)** — the user's call: the shared pieces don't change for the form. Informative text in `organisms/pdf/*` and the header uses `text-fg-muted` (≥ 4.76:1), not `fg-subtle` (2.63:1 on white); PDF `PanelSection`s pass `legibleTitle`. Publish and the "+" links use two **new** tokens, `--ui-brand-strong` (orange-700 / orange-500 dark) and `--ui-on-brand-strong` (white / neutral-950 dark), via `PUBLISH_BUTTON_CLASSES` and `PDF_ADD_LINK_CLASSES` — `--ui-brand` and `ADD_LINK_CLASSES` are untouched, so "Exportar" and the form's labels keep their old (low) contrast until decided apart. Shift+click on the canvas `preventDefault`s the `mousedown`, so the browser no longer paints its text selection over the cells. Measured in headless Edge, light and dark: every text in the header, sidebar and toolbar ≥ 4.5:1.
- **Ctrl+P prints the design, not the app (2026-11-19)** — `usePdfDesignerShortcuts` intercepts it and `printPdfHtml` (`lib/pdfFile`) prints the same `.html` that Publish downloads, in a hidden `<iframe srcdoc>`, plus `PRINT_CSS` (`@page` letter 5 mm, `print-color-adjust: exact` so the greys show) injected **only for printing**, never in the published file (the back sets the paper). A `@media print` over the page was rejected: the canvas is a shadow root scaled with `transform`, with selection outlines and guides, all to be undone by hand. Browser-menu printing isn't interceptable. Variables print as `{Var}` (no data).
- **The generated document**: `<!DOCTYPE html>`, `body { margin: 0 }` (the browser's 8 px would shift everything against the canvas), a root `div` 778 px wide (`border-box`) with the side margins as padding and the document font, then one `div` per sheet with its top/bottom padding and `page-break-before: always` from the second on. Tables carry the same `<colgroup>`/`<tbody>` the canvas paints, and empty cells the same `&nbsp;`. Free HTML goes out through `normalizePdfHtml` (sanitize → tolerant parse → re-serialize): an unclosed `<table>` in one cell would otherwise swallow the rest of the document. Only tables and blocks — no script, flex or grid from the generator (an author's free CSS is the author's).
- **The tolerant reader is `parsePdfHtml`** (`lib/pdfHtml`), run on already-sanitized text: implicit closes like the browser's (a cell closes the open cell of its row, a row its row, a section the previous one, a block element the open `<p>`, `<li>` the `<li>`), a closing tag with no opening — or across a cell boundary — is ignored, and **nothing is inserted** (no implicit `<tbody>`/`<tr>`), so everything is written back where it was. Text nodes keep their source (escaped) form, attributes are decoded.
- **A hand-made template enters as HTML blocks, not as editor tables** (`readLegacyFile`): sheet 1, one block per top-level table and one per run of content between tables. Converting to editable tables was rejected because it changes what you see: the designer's inline cell styles (2 px padding, `vertical-align: top`, `table-layout: fixed`, `border-collapse`) beat the template's class CSS, and old tables rely on automatic layout. Nothing is fixed silently; the notice lists what deserves a look — text between rows (ICA's `{Bloque…}`, which its back replaces with whole rows; in the canvas the browser hoists it above the table), attributes with a variable (`colspan="{ColspanAnual}"`), `body`/`html` rules in a `<style>` (they match nothing in the shadow root, and in the PDF the design's root font covers them), `@page` (the back sets the paper), stray `${`, removed unsafe content, and how many distinct variables it carries.
- **Subir/Bajar cross sheets** (`moveBlock`): at a sheet's edge a block goes to the end of the previous sheet or the start of the next, so document order holds — that is how an imported roll is split into sheets. It never creates a sheet ("+ Hoja" first) and does nothing at the document's edges (`canMoveBlock` disables the buttons). The active sheet follows the block.
- **Version N** (`<tax>_v<N>.html`, §2.1): `publishedVersion` lives in the store **outside the history** — undoing must never make an N repeat — and is saved as an optional `version` key of the stored payload (one schema line, no version bump); autosave also fires when it changes. Publish downloads `(publishedVersion ?? 0) + 1` and marks it. Opening a file takes its N (`data-fm-version`, else the name's `_vN`); with several files the highest N wins (`pickLatestPdfFile`). A FormMaker file of another tax is refused (each tax has its own template). Opening is an ordinary undo step — no confirmation; Ctrl+Z brings back the previous design (not the previous N). Publishing doesn't check overflow: the sheet's own "No cabe" is the check. The notice of what opening/publishing did is local state of `usePdfFile`, not the store.
- **The ICA has a factory template** (`lib/pdfTemplates`, `factoryPdfDesign`), asked for by the user as "the PDF of the ICA declarations": Autoliquidables' generic `PdfICA.html` rebuilt as an editor design, on **one** letter sheet. `openDesign` starts with it when nothing is stored, and "Cargar la plantilla de fábrica" (document panel) brings it back through `loadDesign` (an undo step). It is **built in code row by row** (`text`/`html`/`nested`/`row`/`table` in `pdfTemplates.utils.ts`), the way `lib/baseTemplate` builds the form — not imported as HTML blocks, so every cell can be edited — and the six vertical section labels are the original PNGs, generated into `pdfTemplates.data.ts`. Choices: the 15 activities sit in section C (the original had 3 + "VER DESAGREGACIÓN" + a second sheet); a 10-column grid with fixed widths (`ICA_COLUMN_WIDTHS`, summing 778, sized so the longest variable of each column doesn't break — the original mixed 12- and 10-column rows); 8 px text; `word-wrap: break-word` on the table, so a long value wraps instead of widening the page (the converter would shrink the whole sheet); **today's variable names** (`{RazonSocial}`, `{CodigoSecundaria1}`…), so the current back fills it unchanged — moving to field names belongs to the inventory (§3.7). **Measured with headless Edge** at 778 px: 994 of 1018 px, the same with long sample values (company name, address, email, 13-digit amounts). A label image taller than its section's rows makes the section grow — `ICA_LABEL_HEIGHTS` is sized to the rows, and the C label is capped by its 30 px column. Not yet run through the real back.
- **One template per tax, not per form or municipality** (the user's call: FormMaker shows no municipality anywhere yet). `resolvePdfTaxType(formType, readPdfEntryParams(location.search))`: `?impuesto=<FormType>` wins when it names a known tax, else `setupConfig.formType`; `null` shows a "no tax" message. How the tax will really arrive from `tax-filing-manager` is unknown — the URL reader is the placeholder.
- **Never in the draft or the export.** One `localStorage` key per tax, `form-orchestrator-pdf-<tax>` (`pdfDesignKey`), payload `{schemaVersion, savedAt, design}` validated by Zod (`pdfDesignBank.schema.ts` — `z.object` strips unknown keys, so a new design key needs its line there). A read that fails (corrupt, a version with no migration path, a design of another tax under the key) returns `null` and the designer starts blank. **Trap**: that blank start autosaves over the unreadable payload on the first change — so every bump of `PDF_DESIGN_SCHEMA_VERSION` needs its migration step first.
- **Autosave is `startPdfAutosave`** (pure of React, the hook only mounts it): 800 ms after the last change, a flush on unmount ("Volver al formulario" never loses the last edit). Opening a template never saves — an untouched template leaves no key. Switching tax with a change pending writes it to the _old_ tax's key without reporting its status on the new one. `savePdfDesign` never throws: a full quota (base64 images) becomes `saveError`, shown in the header; IndexedDB is the planned way out, not built.
- **The profile is one constant set** (`PDF_WEB_PAGE_WIDTH_PX = 778`, letter, 5 mm back margin). `PDF_PX_PER_MM` is derived from what the converter does — 778 px stretched over the letter's usable width — not from 96 dpi; the two differ in the fourth figure, and the derived one puts the extra margin and the end-of-sheet guide where the back puts them. Usable sheet height ≈ 1018 px.
- **Extra margin is the design's, never the back's** (`PdfMargins`, mm, 0–40, half-mm steps, `normalizeMargins`): sides become the container's padding, top/bottom each sheet's. `contentBox` gives the space left.
- **The paper stays white with black text in dark mode** — it's paper, not an app surface (the deliberate exception to "every surface needs `dark:`").
- **Components are a fourth kind of cell content** (`{kind: 'component', component: PdfComponent}`, 2026-11-18), not a sheet-level block: everything in the designer is a table, and the cell gives a component its borders, background and alignment for free. Seven types: `image`, `verticalText`, `nit`, `signatures`, `barcode`, `qr`, `stamp` (`PDF_COMPONENT_OPTIONS`). **The checkbox and the repeating row were left out by the user ("por ahora no")** — don't build them without asking; a checkbox is a nested table or free HTML, slots are written by hand. Rules: **(1) one HTML for canvas and file** — `pdfComponentHtml(component, ctx)` in `lib/pdfComponents` (pure); `ctx.mode` only changes what the canvas can't paint (barcode, QR, an image whose `src` is a `{Var}`), which becomes a same-size sample box. Both outputs go through the sanitizer (`sanitizePdfHtml` on the canvas, `normalizePdfHtml` in `buildPdfHtml`), so an unsafe `src` dies there like in free HTML. Tables, images and blocks only — no flex/grid, the back's old WebKit. **(2) Reopening** reads `data-fm-component` (type) + `data-fm-config` (JSON) on the component's outer element, validated by `pdfComponentSchema` (`parsePdfComponent`); the image `src` is **not** in the JSON but read from the first `<img>`, so a base64 travels once. The inside is regenerated, so a hand edit inside a component doesn't survive; a damaged config falls back to HTML content. File format bumped to 2 (`PDF_FILE_FORMAT_VERSION`); format-1 files still open. Storage schema **not** bumped: a new union variant is additive. **(3) Vertical text is a PNG** drawn on a `<canvas>` at 4 dots per CSS px (`lib/pdfVerticalText`, cached by spec, 300 entries), because SelectPdf's WebKit mishandles `writing-mode`; the same PNG goes to canvas and file, so the canvas doesn't lie. It can't carry `{Var}`s (the panel warns), keeps its text in `data-fm-config`, and has its own size/bold/font (defaults to the document's). `lib/pdfComponents` stays pure by receiving the renderer (`ctx.renderVerticalText`); `buildPdfHtml(design, version, renderer)` defaults to `() => null`, which emits `writing-mode` text — what the tsx scripts get. **(4) Turning a component cell into HTML leaves the component's file HTML** (done in the store, which has the renderer) — the way out for the "machetazo" a component almost covers; to text leaves its text. **(5) Stamp**: image + absolutely positioned `<span>` centred with `translate(-50%, -50%)`, emitted with `-webkit-transform` too; `top`/`left` are the text's centre in % (0–100). **(6) Images** accept a URL, a base64 or a `{Var}`; "Elegir archivo…" reads a local file into base64 — no upload, the decision "FormMaker no sube imágenes" stands. `pdfImageWarnings` (pure) + `usePdfImageCheck` (loads it for its natural size) warn on WebP, natural size > 4× the shown size (`HEAVY_IMAGE_FACTOR`), base64 ≥ 150 KB, load errors and non-absolute URLs (the back has no base URL). **(7) Defaults** use today's back variables (`{Code}`, `{FechaGuardado}`, `{Identificacion}`/`{DV}`, the ICA template's signature variables); `{CodigoQR}` is a placeholder name until the inventory. Text fields with `{Var}`s are escaped, keep runs of spaces (`&nbsp;`) and turn newlines into `<br>`; on the canvas their variables are highlighted. Verified with a tsx script (133 checks: every type round-trips generate → read → generate byte-identical, schema limits, sanitizer traps, image warnings, store actions and undo) and a headless-Edge screenshot of the PNG (both directions, multi-line) and of the published file. **Not checked**: the sidebar in a browser, and the output through the real back.
- The lazy boundary was verified by grepping `dist/`: the storage key, the canvas classes and the sanitizer's lists appear only in `PdfDesigner-*.js` (~48 kB). Verified with two tsx scripts (37 + 75 checks): sizes, margins, tax resolution, storage round trips, quota and autosave; every table operation against a grid map (merge, split, insert/remove rows and columns across spans, odd files through `normalizeTable`); 30 sanitizer traps; the v1→v2 migration; undo/redo, bursts and nesting to depth 4 through the real store. **Not checked in a browser yet** — the shadow root, the overflow warning and the panels have only been typechecked and built.

## Tooltips (`field.tooltip`)

`FieldTooltip` = `{content: RichTextContent, position, customCss?}`. Only 8 types (`TOOLTIP_CAPABLE_FIELD_TYPES`): text, number, select, checkbox, calculated, file, toggle_group, radio_group. Predicates in `src/lib/fieldTooltip/`. Store action `updateFieldTooltip(fieldId, updates | null)`.

Settled:

- **Trigger is an ℹ icon, not the field** — hover-on-field is undiscoverable, doesn't exist on phones, and would cover `toggle_group` options. Icon sits next to the _visible_ label (the linked label's text, if any).
- Canvas preview is looser than the contract on purpose (reveals on hovering the whole chip, to escape `overflow-x-hidden` and ease hit-testing).
- **Content is `RichTextContent`**, reusing all of `rich_text`'s machinery (editor, sanitizer, `safeHref`) — do not simplify to HTML/string.
- **Empty tooltip isn't exported.**
- **No per-option tooltips** — would only be authorable for excluded option-fields, and none exist today in the ICA template. Design stays forward-compatible.

## Rounding (`field.rounding`)

A numeric field rounds to the **nearest thousand** — the standard rule for Colombian tax renglones. `rounding?: boolean`, offered only for `number`/`calculated`. Lib: `src/lib/fieldRounding/` (`roundToMultiple`, `applyRounding`, `supportsRounding`, `exportableRounding`).

**Changes the value, not just presentation.**

Settled:

- **Boolean, not a configurable multiple** — every form built so far only ever needs the-nearest-thousand or nothing.
- **`Math.round` is a real bug here** — breaks tie symmetry with negatives (`1500→2000` but `−1500→−1000`, `−500→−0`). `roundToMultiple` rounds the magnitude and reapplies sign, `+0` kills `−0`.
- **Two application points**: on blur for what the user types (`PreviewFieldControl`); as-computed in `runtimeDerived` for a script/rule result (a `calculated` field is `alwaysDisabled`, so blur never fires there). Rounds _before_ publishing to `scriptValues`, so the next field in the chain reads the rounded value.
- **Only when something produced a value** — an untouched field isn't stamped with a spurious `0`.
- Empty stays empty — `applyRounding` passes through `undefined`/`null`/blank/unparseable untouched.
- **ICA template turns it on per-step, off by exception** (`FIELDS_WITHOUT_ROUNDING`, 4 fields: `tarifa_x_mil`, `dv`, `numero_establecimientos`, `generacion_energia_kw` — the last a judgement call, kW not pesos, user was told).
- **Rounding runs before validation** — a `min:1` field typing `499` rounds to `0` and then fails, correctly, if confusingly worded.

## Number formatting (`field.formatted`)

Numeric field shown with dot-thousands/comma-decimal (`1000` → `1.000`, `1.5` → `1,5`). `formatted?: boolean`, same two types as rounding. Lib `src/lib/numberFormat/`.

**The formatted text never leaves the input** — state always holds a real `number`; `1.000` exists only on screen while unfocused. This is why payload/schemas/scripts needed zero changes; a leaked `"1.000"` string would put a wrong value in the payload and make every script read `1`.

Settled:

- **Control is `type="text"`**, not `type="number"` — the HTML spec's dot is a _decimal_ separator (`"1.000"` there means one; `"1.000,5"` is invalid and blanks the field). `inputMode="decimal"` keeps the numeric keypad.
- **Stricter typing filter than native**: `sanitizeNumericInput` whitelists digits/dot/comma/leading minus; `parseFormattedNumber` re-validates independently.
- Local draft state while focused (otherwise typing `1,` gets stomped by a re-render from the already-parsed store value).
- Formatting/rounding both happen on blur (mid-typing would move the caret).
- **A dot is always a thousands separator, never decimal** — locale choice; `1.5` typed with English habits gives `15`, known trade-off.
- Written by hand, not `Intl.NumberFormat` (needs exact round-trip with the custom parser; some locales use U+00A0 as group separator).
- Display decimals capped at 4 (`MAX_DISPLAY_DECIMALS`) so `0.1+0.2` doesn't paint 17 digits.
- **All numeric fields use the new control**, not just formatted ones (removed the string/number split in preview state).
- ICA template formats all 38 numeric fields, including the 4 unrounded ones.

## Decimals (`field.decimals`)

How many decimals a field **shows and lets you type**. `decimals?: number`, absent = up to `MAX_DISPLAY_DECIMALS`. Picker offers 0–4, not free input.

**Padding is presentation (`formatNumber`, doesn't lie); cutting is a value change** (`applyDecimals` in `fieldRounding`, alongside `applyRounding`).

Settled:

- **`roundToDecimals` scales instead of `toFixed`** — both symmetric with negatives, but `toFixed` follows the double's binary tail (`0.35` stored as `.34999...` → `toFixed(1)` = `0,3`, wrong reading of what's on screen). Scaling agrees with the printed value in all but 3 of 17 tested cases, and wins the tiebreak there. Neither is exact above certain precision.
- Above `MAX_SAFE_INTEGER`, returned untouched (precision already lost).
- **`decimals: 0` cuts pasted text at the comma**, not by dropping it (`1234,56` → `1234`, not `123456`).
- Fixed order — thousand, decimals, sign — in both application points.
- **Editing does not pad** (`toEditableText` keeps `6`, not `6,0`) — round trip must hold exactly.
- ICA declares `0` everywhere, `1` only on `tarifa_x_mil`.

## Negative values (`field.allowsNegative`)

A numeric field can refuse negatives — minus key blocked on typing, script results **clamped to 0**. `src/lib/fieldSign/`.

Like rounding, **changes the value** (not just display).

Settled:

- **Polarity inverted vs. rounding/formatted**: absent means negatives ARE allowed; only `allowsNegative: false` restricts. Flipping the default would silently start clamping every existing draft. `setFieldAllowsNegative` stores `false`, deletes `true`.
- `sanitizeNumericInput` takes a boolean, not the field — keeps `numberFormat` text-only.
- `PreviewNumberInput` clamps on blur too, in case a route other than the keyboard sets the value.
- **In `runtimeDerived`, clamp goes after rounding, before publishing** — same ordering reason as rounding.
- **The clamp reports itself** (`clampNegative` returns `{value, clamped}`, shown as "El cálculo dio negativo y se recortó a 0") — **simulator-only, not exported**.
- ICA turns it off on 27/38 numeric fields (25 plain `number` + renglones 10 and 16, the two calculated fields that can legitimately go negative). Others already self-clamp with `max(…, 0)` in-script.
- **Script-level `max(…,0)` and `allowsNegative` are not interchangeable** — renglón 38's negative _is_ the normal saldo-a-favor case, so the flag (which warns) would be wrong there; the script clamp is silent by design.
- `min: 0` validations stay regardless (cover whatever a script writes).

## Length cap (`validations.maxLength`)

Offered for `text`, `textarea`, `number`, `calculated` (`LENGTH_CAPABLE_FIELD_TYPES`) — **counted differently**: characters for text types, **digits of the integer part** for numeric ones. `src/lib/fieldLength/`.

Not a new property — `validations.maxLength` already existed and already produced `z.string().max(n)`; what was missing was enforcement on typing and any handling for numeric fields. No `DRAFT_SCHEMA_VERSION` bump; only `ExportedField.maxLength` is new (additive).

Settled:

- **A number's cap counts digits, not on-screen characters** — the text is unstable across `formatted`/sign/decimals; counting integer digits keeps each property independent.
- **It never changes the value** — keyboard stops the extra digit; a `calculated` field that overflows _fails validation_, isn't silently shortened.
- **Travels twice on purpose**: inside the schema (the only thing the consumer can validate with) and as its own key (`ExportedField.maxLength`, so the keyboard can stop typing before a schema parse would).
- **Exported key is the loosest (base) reading** — a tightening override is caught only by `zodSchemaWhen`, never by blocking a legal keystroke.
- `z.number()` can't express it with `.max()` — uses a `.refine` on `Math.abs(Math.trunc(n)).toString().length <= n`; `capIntegerDigits` mirrors it on the text side.
- Cap of `0` reads as absent (`effectiveMaxLength`) — otherwise a number field becomes impossible to satisfy.
- `select` lost the dead "Longitud" fieldset (option-based fields go the `z.enum` branch, which never reads `minLength`/`maxLength`).
- ICA declares no cap — `numero_documento`'s 7–10 digit rule already lives in its `pattern`.

## Placeholder (`field.placeholder`)

The grey text of an empty field (`placeholder?: string`), asked for by nearly every municipality. Offered for `text`, `textarea`, `tel`, `email`, `datalist`, `number`, `calculated`, `select`, `search_select` (`PLACEHOLDER_CAPABLE_FIELD_TYPES`); `src/lib/fieldPlaceholder/` (`supportsPlaceholder`, `placeholderOf`), store action `setFieldPlaceholder`, input + (i) in Atributos → General.

Settled:

- **Presentation only** — never part of the value, so the schema, scripts and payload never see it; an empty required field still fails.
- **`date` is left out**: its box already shows the format (`dd/mm/aaaa`), the hint that actually matters there.
- In a `select` it replaces the first option's "Seleccionar…"; in a `search_select`, the trigger's "Buscar…". On the canvas it replaces the type's sample text.
- Stored as typed, trimmed by `placeholderOf` on export and render (trimming per keystroke would eat the space before the next word); a type that doesn't take it ignores a leftover key. Capped at `MAX_PLACEHOLDER_LENGTH = 80` — longer belongs in a tooltip.
- Additive optional key: no `DRAFT_SCHEMA_VERSION` bump, one `persistence.schema.ts` line. Ships as `field.placeholder` in `requires` — the compile-enforced key table caught it when it was added.

## Datalist (`datalist`, `field.suggestions`)

"Input Datalist" in the palette (complejos; the team are all programmers, so the HTML name over a descriptive one): HTML's `<input list>` + `<datalist>`, free text that offers a list while typing. Municipalities ask for it rarely. `suggestions?: string[]` on the field; `src/lib/fieldSuggestions/` (`supportsSuggestions`, `suggestionsOf`, `suggestionsText`, `parseSuggestionsText`), store action `setFieldSuggestions`, `SuggestionsEditor` in Atributos, `PreviewDatalistInput` in the simulator.

Settled:

- **Not an option-based type** (not in `OPTION_BASED_FIELD_TYPES`): the value is the typed text, not an option id, so it validates like `text` (`z.string()` + length + `pattern`, never `z.enum`), maps to string leaves, takes the text operators in conditions and reaches scripts as a string. A suggestion restricts nothing; forcing a choice from a list is what `select`/`search_select` are for.
- **`suggestions` is its own key, not `options[]`**: options are the value domain (`{id, label}`, the id is what gets stored) and ship only for excluded fields; suggestions ship whatever the `apiBinding`, since they don't constrain what travels in the payload.
- **Stored as typed** — one entry per line of the panel's textarea, untrimmed, empties included (cleaning per keystroke would eat the newline just typed) — and **cleaned on export and render** by `suggestionsOf`: trimmed, empties dropped, repeats collapsed keeping the first (each suggestion is its `<option>`'s React key). Nothing left → key absent.
- **A textarea, one per line**, not `FieldOptionsEditor`'s row per option: lists like barrios or bancos run to dozens and get pasted from Excel.
- Joins the length, placeholder and tooltip lists, like `text`.
- `requires`: `type:datalist`; `suggestions` is `"core"` in `FIELD_KEYS`, covered by the type word like `options`/`fileConfig`/`content`. Additive optional key: one `persistence.schema.ts` line, no version bump.
- Simulator: the list's id comes from `useId` (every repetition of a group renders the same field), and `autoComplete="off"` keeps the browser's own history out of the list.
- Not built: suggestions from a catalog (`dataSource`), an `<option label>` different from the inserted value, the consumer's branch (see "Known gaps").

## Conceptos tributarios (`apiBinding.kind: "concept"`)

A third destination for a field's value, besides a contract leaf (`mapped`) or nowhere (`excluded`): what the fixed `DeclaracionIcaE` contract doesn't cover (a file, an "acepto", an extra datum a municipality asks for) travels in a **`conceptos` list at the root of the payload**, each item identified by the `idConcepto` of the backend's `MaestroConcepto` table. The backend stores it EAV-style, typed (`MaestroConcepto` + `DeclaracionConcepto` with one column per value kind). Pieces: `lib/fieldConcept/` (`conceptKindOf`, `isValidConceptId`, `parseConceptId`, `conceptOwners`), `constants/fieldConcept.ts` (`CONCEPT_KIND_BY_FIELD_TYPE`, `CONCEPT_VALUE_KEY`, `CONCEPTS_PAYLOAD_KEY`, `CONCEPT_ID_MAX`), `types/fieldConcept.ts` (`ConceptValueKind`, `ConceptoPayload`), `conceptEntry` in `runtimePayload.utils.ts`, `molecules/PayloadDestinationSwitch/`.

The contract (Spanish names on purpose: it _is_ the API contract):

```json
"conceptos": [
  { "idConcepto": 5, "tipo": "archivo",  "valorTexto": "recibo.pdf" },
  { "idConcepto": 3, "tipo": "booleano", "valorBooleano": true },
  { "idConcepto": 4, "tipo": "lista",    "valorLista": ["RUT", "Cámara de comercio"] }
]
```

`tipo` ∈ `texto | numero | booleano | lista | archivo`; exactly one `valor*` travels (`valorTexto`/`valorNumero`/`valorBooleano`/`valorLista`). On the C# side it is a flat `ConceptoDto` with nullable `ValorX` properties.

Settled:

- **One property per value kind ("opción A"), not a polymorphic `valor`** — C# receives it with a plain class, no `JsonElement`/converters, and it maps 1:1 to the typed EAV columns.
- **`tipo` is the data kind, not the control type** — the backend doesn't care whether it was a radio or a select; it equals `MaestroConcepto.TipoDato`. text/textarea → `texto`; number/calculated → `numero`; checkbox → `booleano`; select/search_select/radio_group/toggle_group → `texto`; checkbox_group → `lista`; file → `archivo` (in `valorTexto`).
- **`tipo` is derived, never stored** — the draft keeps `{kind: "concept", idConcepto?}`; `resolveApiBinding` (export) adds `tipo` from the field type, so the consumer reads it instead of copying the table. `ExportedField.apiBinding` is `ExportedApiBinding` for that reason. A presentational field never exports as a concept.
- **`idConcepto` is optional in the draft** (it doesn't exist until typed) and the schema only asks for a number: a `0` or a decimal is a form problem, not a file problem, and rejecting it in Zod would throw the whole draft away. The export review blocks anything that isn't a positive int32 (`CONCEPT_ID_MAX`: `IdConcepto` is an `int` in C#). Typed by hand; picking it from a pasted `MaestroConcepto` catalog was left for later.
- **Array rules**: only visible concepts travel; **an unanswered one doesn't travel** (empty text, no number, empty list, no file) so no empty rows land in `DeclaracionConcepto` — **except the checkbox, which always travels** (unticked is an answer). Order is form order (intro modal, then steps). The `conceptos` key appears only when the form declares at least one concept, so the ICA template's payload is byte-identical.
- **Options: manually authored → the option's text; catalog-fed → the id.** Manual option ids are uuids nobody else knows; catalog ids are the backend's own. The consumer tells them apart by `options[]` being present, like everything else.
- **A file travels by name only**; the binary goes separately (multipart or an attachments endpoint) — the consumer's and backend's call, not the builder's.
- **No concepts inside repeatable groups** — the list is flat and wouldn't know which repetition a value belongs to (a `grupo` index was proposed and dropped). The panel disables "Concepto" inside a group (disabled, not hidden), `moveField` turns a concept dropped into a group row into `excluded` (keeps its manual options, loses the id), `buildPayload` doesn't walk group concepts, and the export review errors on one (only reachable through a hand-edited file). `planLanding` already skips group rows.
- **Manual options are allowed for concepts** (`allowsManualOptions`: excluded _or_ concept, no `dataSource`) — a concept has no path to infer a catalog from. Excluded ↔ concept keeps the options; going back to the contract discards them.
- **`ApiMappingPanel` has a three-way segmented control** (Contrato · Concepto · Excluido) instead of the old "Excluir" toggle and the later two-way "Se envía / No se envía" control (whose hints — excluded, pending path — stay). It reuses `ViewModeSwitch`'s look; the `SWITCH_*` classes moved to `constants/uiClasses.ts`. Live errors for a missing id and for an id another field already uses (both canvases). `FieldOptionsModal` fires when leaving the contract for either destination on an option field with no options (`pendingDestination` remembers which).
- Additive: no `DRAFT_SCHEMA_VERSION` bump, just the `apiBindingSchema` variant.
- The Payload view appends a `conceptos` node (one line per field, amber when the id is missing or repeated, `— ninguno —` when empty); the simulator shows "N mapeados · M conceptos".

## Options and `apiBinding`

Option-based types (`select`, `search_select`, `toggle_group`, `radio_group`, `checkbox_group`) get **manually authored options only when they don't go to the contract (excluded from the payload _or_ sent as a concept) _and_ declare no `dataSource`**; otherwise options are injected at runtime. Predicates in `src/lib/fieldOptions/fieldOptions.ts` — use `allowsManualOptions`, not an inline `apiBinding` check (exactly 4 call sites enforce this).

**Precedence the consumer applies:**

1. `options[]` present → use them (only ever emitted for excluded or concept, no-`dataSource` fields).
2. `dataSource` present → query `dataSource.catalog`, gated by `dependsOn` if set.
3. Neither, `apiBinding.kind === "mapped"` → infer catalog from `apiBinding.path` (legacy fallback, most ICA selects still here).

**`options[]` and `dataSource` are mutually exclusive by construction** — `allowsManualOptions` returns false whenever `dataSource` is set, so the JSON can never carry both.

Settled:

- Dropping an option-field from the palette creates it with no options; `FieldOptionsModal` fires from `ApiMappingPanel` when the field leaves the contract (excluded or concept), skipped if the field already has a `dataSource`.
- Going back to the contract, or declaring a `dataSource`, **discards** `options` — deliberate, not kept hidden.
- `buildZodSchema` only emits `z.enum` for excluded or concept fields; mapped ones fall back to `z.string()`.
- `ConditionValueInput` offers a dropdown only for fields with _local_ options — a mapped select degrades to free-text-by-id in condition editors.
- `checkbox` (single boolean) and `checkbox_group` (multi-select array) are **different types on purpose** — do not merge.
- `PAYLOAD_SCHEMA` has 75 leaves (53 number, 22 string, no boolean, no scalar arrays) — a `checkbox_group` has nowhere real to map. `fieldMatchesSchemaType` lets `checkbox` match `number` leaves (0/1) to avoid a permanent unavoidable type warning.
- `flattenLeaves`/`flattenSelectableLeaves(schema, arrayPath?)` stamp array-item leaves and filter by array context for group mapping.

### `field.inlineOptions` — options on one line

`inlineOptions?: boolean`, only `radio_group`/`checkbox_group` (`toggle_group` already horizontal, `select` has nowhere to put them). Absent = stacked. Predicates in `src/lib/fieldOptions/`; switch lives in `AttributesPanel`'s Diseño section (not `FieldOptionsEditor`, since catalog-fed fields need it too). **Presentation only** — doesn't touch value/schema/selection count; uses `flex-wrap`, not a promise everything fits.

### `dataSource.fills` — columns of the chosen option copied into other fields

`CatalogFill` = `{column: keyof CatalogOption, field}` — the target's id, resolved to a name on export. `src/lib/catalogFill/` (`resolveFills`, `hasFills`), panel `CatalogFillsEditor`. Models what the consumer already did hardcoded for `codigo_actividad`/`tarifa_x_mil`.

Settled:

- Declaration lives on the field that **originates** the selection (one owner, like `labelFor`).
- The fill writes into the scope of **the row it came from** — `useFormPreview.setValue` merges into that same group item, not row 1.
- Clearing the selection clears the targets too (a stale tarifa left behind would keep computing wrong).
- `catalogOptions` only built when the field declares fills (425-entry list, avoid rebuilding on every keystroke).
- A fill whose target no longer exists is dropped whole, same rule as a validation-override on a deleted field.
- **`actividades[].idActividad` still carries `idDeclaracion`, unconfirmed** — flipping to `codigoCIIU` is one line in the generator.

### `dataSource` — which catalog feeds a field

`FieldDataSource` = `{catalog, dependsOn?}`. `catalog` is a contract string the consumer maps to its own endpoint. **Orthogonal to `apiBinding`** ("where do options come from" vs. "does this value travel in the payload") — `departamento` proves it: `{kind:"excluded"}` (API only wants `idCiudad`) yet still `{catalog:"departamentos"}` for its own options.

Settled:

- `CATALOGS` is a closed dropdown list (`src/constants/catalog.ts`), never typed — same reasoning as `apiBinding.path` (a typo'd catalog name fails silently on the far side).
- Identifying a catalog by field `name` was rejected — breaks on rename, doesn't generalize.
- A `dataSource` never ships its options — export carries only the catalog name.
- No mock data still yields `placeholderOptions` — never a dead select.

### The catalog bank — real options for the simulator

`CatalogBank` = `Record<catalogId, {source, entries}>`, edited from the **Catálogos** tab, own `localStorage` key (`form-orchestrator-catalogs`), **never in the draft or export** (structurally, not by convention).

**Keyed by catalog, not by field** — one `departamentos` entry serves every form that needs it; per-field storage would have needed a "copy between forms" feature that this design makes unnecessary.

Settled:

- **Pasted, not typed** — `parseCatalogPaste(raw, keys)` digs the first array out of a `{data:[…]}`-style wrapper; author names the columns (`CatalogPasteKeys`). A tarifa that doesn't parse is dropped, not stored as `NaN`.
- **The bank wins whole, or not at all** — an active catalog with no match for the current parent still doesn't fall back to mock data (would mix real/fake in one dropdown).
- **`default`/`custom` is a per-catalog switch, not a modal prompt** — flipping to `default` keeps the pasted data. A global "which mode?" modal was rejected as either annoying or an unfindable one-time setting.
- `isSimulatedCatalog` takes the bank as an argument, so the "simulado" badge is actually true.
- **No HTTP** — deferred (CORS/auth/offline cost); pasting gets the same data for free.
- **A repeated id (catálogos) or year (UVT/SMMLV, fechas) keeps its first row on paste** — the user's call over rejecting the paste. That value is also its row's React key; repeated, it left ghost options/rows. Almost always a mis-named id column.

### Fechas máximas de presentación — the second simulator-only bank

`FechasMaximasPresentacion` = `{municipioId, ica[], reteica[], autoretencionIca[]}`, each a `ReglaAnio` list. **Not in the export or draft** (verified by asserting neither ever mentions `municipioId`/`periodicidad`/`tipoDigito`/`autoretencionIca`). `src/lib/maxDates/` (arithmetic), `src/lib/maxDatesBank/` (`localStorage` layer, key `form-orchestrator-fechas`), `panels/MaxDatesPanel` (Fechas tab).

Settled:

- **Model is deliberately flat** — periodicity × digit-validation is 12 combinations, each `FechaLimite` carries its own `periodo`/`digito` rather than a discriminated union. `fechasEsperadas` derives expected count to catch half-loaded dumps early.
- Names stay in Spanish — this object _is_ the API contract.
- **`digitoDe` returns `null`, not a number** — fixes two silent bugs: `Number("")===0` was picking the digit-0 deadline for an empty document; `NaN` from a lettered NIT matched nothing with no explanation.
- **Generated table is recomputed from the clock and read-only** (`generarReglasAnuales`); the offset (ICA=1 previous año gravable, retención=0 current) is the only difference between the two. Editing anything **forks a copy** (`source: "custom"`) rather than silently losing edits on the next regeneration.
- ReteICA/autorretención ship empty — inventing bimonthly/monthly deadlines nobody gave would be the same mistake as fake tarifas.
- Pasting takes the whole object (no column naming — the shape already matches). Paste and stored value share one Zod schema.
- Only `anual + ninguno` is hand-editable; everything else is paste-only (6–120 dates).
- Store holds no date logic — `setMaxDates` takes a finished table, all rules live in `lib/maxDates`.

### UVT y SMMLV — the third simulator-only bank

`ValorAnual` = `{anio, uvt, smmlv}`, one bank per year (`localStorage` key `form-orchestrator-valores`, `src/lib/valoresBank/`). **Not in draft/export** (verified: no `smmlv` or `1750905` in exported JSON).

**Deliberately NOT a `CatalogBank` entry** — a catalog is `{id,label}` options for a dropdown; this is two scalars per year with nothing to pick. UI is `ValoresAnualesEditor`, first section of `CatalogsPanel`.

Helpers `uvt(año)`/`smmlv(año)` (`src/lib/scriptValores/`), impure (built per run over `RuntimeContext`, since the table isn't exported).

Settled:

- **Return `null`, not `0`, when unloaded** — a `0` silently zeroes any floor/cap written in UVT; `null` forces the author to write a visible fallback (`const UVT = uvt() ?? 52374;`).
- No argument = current year, from `context.hoy` (never the real clock).
- `CONTEXT_HELPER_NAMES = [...DATE_HELPER_NAMES, ...VALUE_HELPER_NAMES]` — order matters, both `SCRIPT_PARAM_NAMES` and `runFieldScript` derive from it.
- `resolver` guards `context.valores` with `Array.isArray` (older consumer objects predate this key).
- **Bank wins whole, or not at all** — same as the catalog bank.
- Paste names its columns (flat list, no way to guess which key is the year); a row missing any of the three is discarded whole.
- **`leerNumero` tries the direct read before stripping separators** — the reverse order would mangle `"52374.00"` by two orders of magnitude.
- Factory table ships filled 2020–2026 from published DIAN/decree numbers — not invented data, unlike the tarifas gap. Check asserts both columns rise monotonically.

### `fechaLimite` / `diasDeMora` / `mesesDeMora` — the deadline table inside a script

`src/lib/scriptDates/`, names in `DATE_HELPER_NAMES`. `fechaLimite(año, periodo, documento)` → date string or `null`; `diasDeMora` → days late (`0` if on time); `mesesDeMora` → months/fraction late (the sanción's actual unit).

**`mesesDeMora` ≠ `diasDeMora / 30`** — only 4 months have 30 days, so division eventually overcharges a full month (5% of base). `mesesOFraccion` counts by calendar instead (verified against `31/01→28/02`=1, `31/03→30/04`=1, a full year=12 not 13).

**First impure helpers** — built per run, closing over `RuntimeContext = {reglas, hoy, valores}`, passed as a **second argument** to `resolveRuntime`/`validateRuntime` (never inside `RuntimeModel`, mirroring how the consumer gets the config JSON and the deadline table from different places).

Settled:

- Declaration kind resolved once at the top (`buildRuntimeModel` reads `projectMeta.formType`) — helpers never branch on ICA-vs-retención themselves.
- **`diasDeMora` returns `0`, not `NaN`, with no table loaded** — a sanción must never be born from missing data.
- Dates parsed by hand into UTC (`aUtc`) — `new Date("2025/03/31")` (local) vs `"2025-03-31"` (UTC) differ by a day depending on timezone, and a day here decides on-time vs. late. Also round-trips to catch invalid dates like 31 Feb.
- `hoy` is a parameter, not a clock read — makes mora testable without touching system time.
- No graph changes needed — `{{campo}}` inputs are already scanned as reads.
- Names come from `DATE_HELPER_NAMES` in both places (same anti-drift trick as `SCRIPT_HELPER_VALUES`).
- Used by renglón 31 (`mesesDeMora`) and renglón 37 (`fechaLimite`, `diasDeMora`).

## Sanciones (renglón 31)

The **sanción por extemporaneidad** (art. 641 ET) auto-liquidates. The rule lives **entirely inside renglón 31's `logic.script`** — municipal parameters, base choice, and formula all in one place. `SANCION_EXTEMPORANEIDAD_SCRIPT` is only the seed text; from creation it's ordinary `logic.script`, editable by the form's author.

**Do not move any part of it into code or the prelude.** Tried the other way (helper + params in the prelude) and rejected: a municipality asking to change the rate means whoever handles it has to already know the prelude holds part of the logic. The user's own experience (four months building strictly to the law, then told "too strict, put it back") is the reason. **The law is the default, never the constraint.**

Script declares `UVT` (`uvt() ?? 52374`), `MINIMA_UVT`, `POR_MES`, `TOPE`, `base` as named constants with a comment on each. Shipped defaults are the legal ceiling (10 UVT min, 5%/month, 100% cap) — the law is a maximum a municipality may only lower.

Settled:

- **Base is renglón 25** (`total_impuesto_a_cargo`) — 33/34/35/38 already sum in `valor_sancion`, so using them would close a `fieldGraph` cycle. Coincides with art. 644 §3. **Consequence: saldo-a-favor-based caps are structurally impossible here**, documented at the `const base` line.
- **`valor_sancion` stays `type:"number"`, no `alwaysDisabled`** — the script's own `return`/`return undefined` is the only lock mechanism, since three other `tipo_sancion` values need the field to stay typeable.
- Only EXTEMPORANEIDAD auto-liquidates — first line compares against `TIPO_SANCION_EXTEMPORANEIDAD`, returns `undefined` otherwise (including "nothing selected yet").
- **"No lateness" is checked before the minimum** — same fail-open family as `mesesDeMora`/`0`.
- Period argument is `const periodo = 1` (ICA is annual) — a bimonthly municipality changes one line.
- Rounds to the thousand like every renglón (10 UVT floor lands as 524.000, not 523.740).

### What is deliberately NOT built

- **Sanción por corrección (art. 644)** — all three variants need the _prior_ declaration, which doesn't exist yet (system newly deployed, no history to diff). Documentation-only by explicit instruction.
- **Art. 642** (post-emplazamiento) — needs a flag from an intro modal that doesn't exist; defaulting to the harsher rate isn't defensible.
- **Ingresos-brutos/patrimonio-líquido branches of art. 641** — patrimonio líquido isn't a field at all; ingresos branch is buildable but nobody's confirmed these municipalities use it.
- **Gradualidad (art. 640)** — same missing-history blocker as corrección.

## Intereses de mora (renglón 37)

Same shape as the sanción: whole rule inside `logic.script` (`INTERES_MORA_SCRIPT` seed). Formula (art. 634-635 ET): **`base × (TASA_ANUAL / DIAS_ANIO) × días`**, daily/simple, rounded **up** to the thousand. Rate = tasa de usura (Superfinanciera) − 2 points, **the rate at time of payment applies to the whole delay** (why one constant is correct instead of a per-period table). Ships August 2026 value (27,66% E.A.).

Settled:

- **`const base = {{valor_a_pagar}};` is meant to be edited** per municipality — falls out of `{{campo}}` substitution for free. **Only renglón 38 is illegal** as a base (consumes the interest itself, would close a cycle); 33/34/35/25 were all checked against `fieldGraph` and don't.
- **Default base is renglón 35** — inherits 33's `max(…,0)`, so a saldo a favor charges zero interest on a non-debt.
- **Rounding is `ceil`, done in the script** (matches the municipality's `ROUNDUP(…;-3)`) — the one renglón whose rounding isn't the project's default round-to-nearest; `applyRounding` afterward is a no-op since the value is already a multiple of 1000.
- **`fechaLimite` decides whether to compute at all; `diasDeMora` only supplies the number** — they look redundant but aren't: `diasDeMora=0` means either "on time" or "no table loaded", which must not be treated the same. `fechaLimite === null` → script returns `undefined`, field stays typeable (a locked `0` would be indistinguishable from a real on-time result).
- `type:"number"`, no `alwaysDisabled` — same script-owns-the-lock mechanism as renglón 31.
- Rate is a script constant, not a fourth bank — no need to segment by period since the law applies the payment-date rate to the whole delay; a values-bank column would be wrong by construction (that table is annual, this rate is monthly).

### The script editor got a ceiling

`ScriptEditor` (CodeMirror) had no max height, so a ~50-line script pushed error messages/cycle warnings below the fold in the sidebar. `ScriptInput` now computes `maxHeight` from a `maxRows` prop (default 18), `.cm-scroller` gets explicit `overflow:auto`, both travel as inline style (CodeMirror takes no classes).

## Conditional validations (`validations.overrides`)

A field's validation can change with another field's value. `FieldValidationOverride` = `{id, when: FieldCondition, validations: FieldValidationRules}`. `FieldValidationRules` is kept separate from `FieldValidations` **so an override can't nest overrides**.

Exported as `validations: {zodSchema, zodSchemaWhen?: [{when, zodSchema}]}` — **consumer walks `zodSchemaWhen` in order, first match wins; else `zodSchema`** (`effectiveSchemaSource`, shared by `collectErrors` and the required asterisk so the simulator can't drift).

Motivating case: `numero_documento` needs 7–10 digits normally but 7–9 when `tipo_documento` is NIT (10th digit is the separately-modeled DV). Three fields (contribuyente/declarante/responsable) each observe their **own** `tipo_documento`.

Settled:

- **An override merges onto the base**, doesn't replace it (`mergeValidationRules` skips `undefined` keys) — clearing a panel input reverts to inherit, it doesn't store `0`/`""`.
- Rejected alternative: two fields swapped by `visibleWhen` sharing a payload leaf — doubles the field count and breaks `buildPathIndex`'s one-path-one-entry assumption.
- **Not edges in `fieldGraph`** (observes a field, no value flows through). `removeFields` still prunes overrides pointing at it (dropped whole, not partially).
- `persistence.schema.ts` had to learn the shape (Zod strips unknown keys — any future `FieldValidations` addition needs the same line).

## Conditions (`visibleWhen` / `enableWhen` / `alwaysDisabled`)

Both share the `FieldCondition` type, operator set, store shape and the whole `ConditionEditor`/`useConditionEditor` machinery — `kind: "enable"|"visible"` is the only difference. Operator semantics in `src/lib/fieldCondition/fieldCondition.ts`: `operatorNeedsValue`, `operatorTakesList`, `operatorIsStringBased`, `parseConditionList`, `operatorsForFieldType` (narrows per type — `checkbox` only gets truthy/falsy, `file` only empty/not-empty).

**Precedence, in order:**

1. `visibleWhen` false → not rendered, not validated. Nothing below applies.
2. `alwaysDisabled` → rendered, read-only.
3. `enableWhen` false → rendered, disabled.

Settled:

- **A hidden field's Zod schema still exports unchanged** (`buildZodSchema` knows nothing about `visibleWhen`) — the consumer must drop hidden fields from its resolver itself. Same coordinated-consumer arrangement as `logic.script`.
- Visibility is editable even when `alwaysDisabled` is on (hiding a read-only field is legitimate); the enable editor itself is hidden in that case.
- `wouldCreateCycle` walks **every** edge kind (a cycle can span condition and script edges).
- **Who can depend on whom follows the fill order** (`dependencyCandidates` in `src/lib/fieldCandidates/`, read through `useDependencyCandidates`): a form-step field sees intro-modal fields first, then form fields; an intro field sees only intro fields. One list feeds every picker — conditions, rules, the script's dependencies/cycle, validation overrides (Validaciones) and the catalog parent (Mapeo API). The other direction is what the old `formSteps`-only list allowed by accident: the modal showed a field watching one nobody had filled yet, hidden and so unvalidated, and let the taxpayer through without año gravable (verified with a tsx script). Runtime, export and consumer needed no change — `buildRuntimeModel` already puts intro fields in the same root scope.
- **Deleting a step or a row prunes what pointed at its fields**, exactly like `removeFields` (`removeFieldsEverywhere` in `formStore.utils.ts`). Before, `removeFormStep`/`removeIntroModalStep`/`removeRow` dropped the fields and left the conditions behind: the export wrote the dead uuid as the field name, the consumer evaluated it against nothing (a hidden field stayed hidden forever, a conditional `required` vanished) and the export review saw nothing. Ctrl+Z brings the step and the conditions back together.

## Opening an exported form (`builderDraft`)

The **Exportar** file doubles as the project file: `downloadFormExport` writes `{projectMeta, setupConfig, formSchema, builderDraft}`, where `builderDraft` is exactly the `localStorage` draft payload (`buildDraftPayload`). It opens from the wizard's **Cargar formulario** or the right panel's `Abrir…` (`ProjectImportModal`, which confirms first: it replaces the current form and `restoreDraft` clears the history). Pieces: `src/lib/projectFile/` (`readProjectFile`, `summarizeProjectFile`), `useProjectImport`, `ProjectFilePicker`, `FieldRenameNotice` (extracted from `DraftRecoveryModal`).

Settled:

- **Rebuilt from `builderDraft`, never from `formSchema`** — the compiled export is lossy (validations only as Zod strings, styles merged into one CSS map, disabled checks dropped). `formSchema` is ignored on open and regenerated from the draft.
- **Same pipeline as a `localStorage` draft**: `parseDraft` (migrate → Zod, which also runs `safeHref` → name dedup). No second validator and no separate export-format version — `DRAFT_SCHEMA_VERSION` covers both.
- **Only files that carry `builderDraft` open.** Older exports get a message asking to re-export; a `schemaVersion` above ours (`isNewerDraft`) gets "update the builder". Reconstructing old files from the compiled schema was explicitly declined.
- `buildFormExport` stays copy-free, so the simulator and the JSON view neither show nor pay for it. **The consumer must ignore `builderDraft`.**
- **The simulator banks don't travel** — same rule as everywhere else; whoever opens the file pastes their own catalogs, dates and UVT.
- `parseDraft` rejects a draft with zero `formSteps` (`restoreDraft` reads `formSteps[0]`); `readProjectFile` forces `setupConfig.isComplete = true`, so a hand-edited file can't strand the app in the wizard.
- The opened project is saved immediately (`saveDraft` + `markSaved`), not on the 3-minute autosave.
- **Trust**: a file from someone else carries their scripts, which run in the simulator. The picker tells the user to open only trusted files; nothing sandboxes them.

## Export review (`diagnoseForm`)

**Exportar** runs `diagnoseForm` (`src/lib/formDiagnostics/`) before downloading; `useExportReview` owns when it runs and where "Ir" leads, and `ExportReviewModal` lists the problems. No problems → straight download.

Errors (block the download): a field, rule-effect or enabled group-check script that doesn't compile (alone, or once composed with the prelude) or reads an unknown `{{x}}`; a prelude that doesn't compile or reads fields; an invalid regex in `validations.pattern`, an override's `pattern` or a `matches` condition; a dependency cycle; a concept without a valid `idConcepto`, sharing its id with another field (reported on both), or inside a repeatable group. Warnings (never block): a binding to a path the contract lacks or to a host-provided leaf, unsupported CSS in field/row/tooltip styles.

Settled:

- **Runs only on Exportar**, never live — no per-keystroke cost, which matters on the user's slow work PC.
- **Errors block, warnings don't** — only certainly-broken things are errors. An unknown `{{x}}` is one since the double braces (it can't be destructuring); it is reported alone, without the "no compila" it almost always also causes.
- **`⚠ tipo` and payload coverage are left out on purpose** (user's call): the 12 known type warnings would show on every export, and the contract doesn't mark which leaves are required. Both stay in Mapeo API and the Payload view.
- **Judges what actually ships**: `knownNames` from both canvases (as `buildFormExport` does), disabled checks skipped, `pattern` checked only where `buildSchemaFor` embeds it (`TYPES_WITHOUT_PATTERN`).
- **A broken prelude is reported once**, and scripts are then checked without it. With a valid prelude, a script that only fails once composed (e.g. `const UVT` in both) gets its own "no compila junto con el script del formulario" message — built from `compileScript`/`checkScriptSyntax`/`composeScriptBody` instead of parsing `validateFieldScript`'s prefixed message.
- One cycle per export (`topologicalOrder` reports the first); fixing it reveals the next.
- **Rule-effect scripts had no validation anywhere before this** — the review is the first check they get.
- "Ir": `setCanvasViewMode("canvas")` → `setActiveCanvas` → `selectFieldAndEdit` (order matters: `setActiveCanvas` clears the selection), then `scrollIntoView` in an effect after the commit — the same `pendingReveal` pattern as `CanvasToolbar`. `getFieldElement` joined `lib/canvasDom`.
- Stays out of the lazy chunks: imports nothing from `formRuntime`/`scriptRuntime`/`zodHydrate`/`mockCatalog` (measured: `FormSimulator` and `ScriptEditor` unchanged, main chunk +8 kB).
- The JSON view's copy button doesn't go through the review.
- **`ExportButton` owns the hook and the modal**, not `RightSidebar` — so the collapsed chip can export too. The panel and the chip are mutually exclusive, so exactly one `useExportReview` is ever mounted and its local `problems` can't drift. `ModalShell` is `fixed inset-0`, which is why the chip's container may not set `transform`/`filter`/`backdrop-filter`/`will-change` (see "The right panel").

## What a form requires (`projectMeta.requires`)

The export lists in `projectMeta.requires` every word of the JSON a consumer must know to run _that_ form without silently losing anything; a consumer that doesn't recognize one refuses to load the form. The user's call: when a municipality asks for something new it wants it now, and blocking beats degrading in silence. Pure module `src/lib/formRequires/` (`collectRequires`), called at the end of `buildFormExport`. The ICA template asks for 57 words.

Two kinds of word, sorted:

- **Keys**, `scope.key`, declared when the key carries something: `field.prefix`, `field.logic.script`, `field.validations.zodSchemaWhen`, `field.dataSource.fills`, `field.tooltip.styles`, `richText.href`, `row.styles`, `step.groups`, `group.checks`, `formSchema.prelude`, `setupConfig.introModal`.
- **Values of a closed list the consumer branches on**, `category:value`: `type:`, `operator:`, `helper:`, `catalog:`, `effect:`, `fillColumn:`, `dateFormat:`, `binding:`, `tooltipPosition:`, `richTextBlock:`.

Settled:

- **A list, not a version number** — a number would also block an old form that uses nothing new. `projectMeta.version` stays a fixed `"1.0.0"` only because the consumer already types it.
- **Computed from the export, not the model** — it judges what ships: an empty tooltip, a disabled check or an `alwaysDisabled: false` left by the panel ask for nothing.
- **The key tables are compile-enforced**: `formRequires.constants.ts` holds a `Record<keyof T, KeyRule>` per exported object, so adding a key to `ExportedField` (or row, step, group, condition, rule…) without classifying it as `"core"` or `"feature"` doesn't typecheck. A key whose value comes from a closed list also needs its value words in `formRequires.utils.ts` — the one step the compiler can't force. Objects without a table (compiled script, validation variant, catalog fill, option, file config, rich-text paragraph) are pure skeleton and need one the day they gain an optional key.
- `"present"` exists for `allowsNegative`, the one key that travels only as `false`.
- **Helpers are matched on the raw compiled text**, comments and strings included: a false positive only over-asks, while a second code/text walker could hide a real call. Not after a dot (`Math.max`) nor glued to a quote (`__v["max"]`, a field named so). The prelude is scanned separately — `compiled` doesn't carry it.
- **Intro-modal steps count** — they run in the same root scope.
- Not covered: catalog inference from `apiBinding.path` (legacy, being replaced by `dataSource`), and a change in how an existing word behaves (a rounding fix) — that needs the consumer redeployed and its `pnpm verify`, not a new word.
- **Deploy order** (the consumer is a container in `GestorPagosWeb/compose.yml`; the builder isn't deployed with it): whoever reads goes first — the back if the payload changes, then the consumer — and the form that uses the new word is published last.
- **The consumer side isn't built** (the user's call: builder only for now). Its `checkContract.ts` accepts the extra key and its runtime only reads `projectMeta.formType`, so the new key breaks nothing there.
- Verified with a tsx script: ICA's 57 words, a one-text-field form asking only `type:text` (with `alwaysDisabled: false` and empty styles), helper traps (`Math.max`, a field named `count`, `uvt` in a comment), the prelude, determinism and a JSON round trip.

## Commit conventions

- Spanish, present tense, imperative ("Agrega X", "Corrige Y", "Amplía Z") — matches existing history.
- Subject under ~72 chars, specific.
- **Bodies short — 3-4 lines max, often none.** Durable detail belongs in `CLAUDE.md`/README, not commit history.
- No `Co-Authored-By: Claude` trailer unless explicitly asked.
- One commit per cohesive feature/decision; split only when parts are genuinely independent.
- **Stage by explicit path** — never `git add -A`/`git add src` (user often has unrelated WIP).
- Line-ending noise: `.gitattributes` normalizes to LF; if `git status` isn't clean, run `git add --renormalize .` once, separately from feature commits.
- On Windows, write the message to a file and use `git commit -F <file>` (PowerShell here-strings are unreliable through the tool layer).

## Commands

Package manager is **pnpm** — use `pnpm install`/`pnpm add`, not npm/yarn/bun.

- `pnpm dev` — Vite dev server
- `pnpm build` — typecheck (`tsc -b`) then production build
- `pnpm lint` — ESLint + Prettier check (config shared at the monorepo root)
- `pnpm format` — Prettier, write mode
- `pnpm preview` — preview production build
- `pnpm exec tsx <script>.ts` — throwaway verification script

No test runner configured. **ESLint + Prettier are the enforced linter/formatter, shared with the dashboard**: one `eslint.config.js`, `.prettierrc.json` and set of versions at the monorepo root (2-space indent, single quotes, no semicolons, 100-char width). Biome was removed so both apps follow the same convention; imports are no longer auto-organized. Intentional exceptions carry an `eslint-disable` with its reason. `pnpm build` occasionally exceeds a 2-minute tool timeout (harness kill, exit 143, not a build failure) — re-run with a longer timeout before reporting a problem.

### Migrated from bun

bun filled two roles; pnpm only replaces package management (that swap was free — no bun APIs/config anywhere). bun's second role, **running TypeScript directly**, is now `tsx` (a devDependency; scratchpad scripts run under `pnpm exec tsx`).

Settled:

- **`pnpm-workspace.yaml` carries `allowBuilds`, not `package.json`** — pnpm 11 moved this out of `package.json`, where it's now silently ignored with only a warning. Needed for `esbuild` (via tsx), which download platform binaries at install.
- **`reicon-react` pinned to exact `1.1.2`** — `^` ranges pull `1.2.0`, which renamed 10 icon exports in a minor (`Maximize22`→`Maximize2`, etc.) and breaks the typecheck.
- Other bumps were verified, not assumed (Vite 8.1.1→8.2.2 re-partitioned chunks but both lazy boundaries still hold, verified by grep).
- The 1132 extensionless imports didn't need fixing (normal for `moduleResolution: bundler`; tsx resolves them like bun did — Node's own loader is the one that can't).
- Scratchpad needs: `package.json` with `{"type":"module"}` (top-level await), absolute imports as `file:///C:/...` URLs, and a `node_modules` junction to the project.
- **Run scratchpad scripts from the project root** (`pnpm exec tsx <scratchpad>/x.ts`), never from inside the scratchpad: there, pnpm 11's deps-status check launches a `pnpm install`, and the only thing stopping it from wiping the junctioned `node_modules` is `ERR_PNPM_UNSAFE_MODULES_DIR`.
- A script that imports the store needs a `localStorage` stub installed _before_ the import (`Object.assign(globalThis, { localStorage })`, then a dynamic `await import()`): the simulator banks read it when the store is created.

## Architecture

Visual drag-and-drop **step-by-step form builder** ("FormMaker", formerly "Form Orchestrator") that compiles its config to one structured JSON document.

### File layout conventions

Atomic design: `src/components/atoms|molecules|organisms/` + `src/components/layout/`. Panels in `organisms/panels/`. Each component/hook gets its **own folder** with co-located `X.tsx`/`X.types.ts`/`X.constants.ts`/`X.utils.ts` (only what's needed). Hooks: `src/hooks/useX/useX.ts`. Libs: `src/lib/<name>/<name>.ts`, same suffixes.

`X.ts` is the module's public API — helpers/constants/types belong in co-located files, not inline.

**Every component folder has an `index.ts`** (`export * from './X'`) and is imported by its folder (`'../atoms/Button'`), not `'../atoms/Button/Button'`. Files inside the same folder keep importing `./X` directly (going through the index would be a cycle). The three `React.lazy` imports (`FormSimulator`, `PdfDesigner`, `ScriptEditor`) still point at the file.

**`atoms/`, `molecules/` and `organisms/` also have a level `index.ts`**, and an import that crosses levels goes through it (`from '../../atoms'`). **Within a level, import by the component's folder, never the level index** (that would be a barrel cycle); `organisms/panels/`, `organisms/preview/` and `organisms/pdf/` count as `organisms`, so they have no level index of their own. The level indices **must not re-export `ScriptEditor`, `FormSimulator`, `PdfDesigner` or anything in `preview/` or `pdf/`** — they are the lazy chunks, and a static re-export would pull them into the initial bundle. Upward imports (an atom importing a molecule, a molecule importing an organism) don't exist and must stay that way, or the level indices start importing each other.

**`hooks/`, `constants/` and `types/` have an `index.ts` too** (and every hook folder its own), and code outside them imports through it (`from '../../hooks'`, `from '../constants'`, `import type … from '../types'`). Inside the folder, keep importing by path (a hook imports another by its folder, `../useClickOutside`), never the folder's own index. **`hooks/index.ts` leaves out `useFormPreview`, `usePreviewNavigation` and `usePreviewSearchSelect`** — only the simulator uses them, so they're imported by their folder from behind the lazy boundary. Same for `usePdfDesignAutosave`, `usePdfDesignerShortcuts` and `usePdfFile` (the PDF designer's). A new file in `constants/` or `types/` needs its line in the index; two files exporting the same name make `tsc` fail on the index.

**`lib/` and `store/` follow the same rule.** Every lib folder has its `index.ts`; `lib/index.ts` re-exports only the libs the initial bundle already reaches. **The ones only the simulator or the PDF designer use stay out and are imported by their folder** (`from '../../lib/formRuntime'`): `catalogFill`, `formRuntime`, `mockCatalog`, `pdfDesign`, `pdfDesignBank`, `pdfDesignEdit`, `pdfFile`, `pdfHtml`, `pdfTable`, `pdfTemplates`, `runtimeCondition`, `runtimeDerived`, `runtimePayload`, `runtimeValidation`, `scriptDates`, `scriptRuntime`, `scriptValores`, `zodHydrate` (listed in the header of `lib/index.ts`). Adding one of those to the index, or importing a lazy lib from the builder side, pulls it back into the initial chunk. Libs import each other by folder (`../fieldGraph`), never through `lib/index.ts`. `store/index.ts` exposes only `formStore.ts`; `banksSlice` and the `.utils`/`.constants` files stay internal, and `pdfDesignStore.ts` is imported by its path from behind the PDF designer's lazy boundary.

**A co-located `X.types.ts`/`X.constants.ts` is private to its folder.** The moment code outside that folder imports it, the declaration moves to `src/types/`/`src/constants/` (both directions audited to zero, kept that way). When the leaking declaration drags neighbours along, **move the whole file** rather than splitting it (`types/exportForm.ts`, `types/payloadMapping.ts`). Genuinely private stuff stays put (`FieldSpec` in `baseTemplate`, `TopologicalResult` in `fieldGraph`, `SALDO_NETO`, `CONDITION_COPY`, tokenizer regexes).

Not tool-enforced — a restricted-imports rule doesn't fit (matches exact specifiers only, and the same target is spelled differently from every importer); verified with throwaway audit scripts instead.

Both import cycles this shape produced are fixed the same way: implementation moved to `.utils.ts` (`findFieldById` → `formStore.utils.ts`, `fieldMatchesSchemaType` → `payloadMapping.utils.ts`), public file re-exports it. One remaining cycle (`types/field.ts` ↔ `types/catalog.ts`) is harmless — type-only, erases at compile.

### Pieces

- **Setup wizard** (`SetupWizardModal/`, `useSetupWizard/`): 2-step modal when `setupConfig.isComplete` is false. Step 1 picks `FormType` — `industria_comercio` loads the ICA template (`src/lib/baseTemplate/`), others start blank. Step 2 configures the intro modal, seeding `introModal.steps` (ICA skips it: its intro modal is fixed). Step 1 also offers **Cargar formulario**, a third screen that creates nothing — the project comes from an exported file (see "Opening an exported form"). `DraftRecoveryModal` runs before it on mount if `loadDraft()` finds a saved draft.
- **ICA template** (`src/lib/baseTemplate/`): 8 steps built from `FieldSpec` rows. Computed renglones are `type:"calculated"` + `script` + `alwaysDisabled` (13 of them) — **except renglón 31**, deliberately neither (see Sanciones). `SALDO_NETO` is the shared subexpression behind 33/34 (a-cargo/a-favor), a bare expression interpolated into two `return max(…)` scripts.

  **The 33/34→35→38→40 tail encodes an unwritten rule**: 35 is just 33 (saldo a favor → nothing to pay, no condition needed), and 38 = `max(35 − 36 + 37 − 34, 0)` — **the `− 34`** keeps intereses de mora from charging against a debt that doesn't exist; below zero it's already stated in 34, so 38 doesn't repeat it as a negative. Some municipalities want the opposite (signed 35/38/39/40) — **not built**, a per-municipality change to make when asked, not a mode to carry now.

  **`calculated` and `number` are behaviourally identical today** (same Zod case, same preview control, same numeric properties) — the only difference is the palette label. **`alwaysDisabled` is what actually locks a field**, applied in `formRuntime.utils.ts` (takes precedence over `enableWhen`).

- **State** — single Zustand store, `src/store/formStore.ts`, typed by `formStoreTypes.ts` + domain files (`field.ts`, `formStructure.ts`, `setup.ts`, `placement.ts`, `ui.ts`, `store.ts`). Constructors/walkers in `formStore.utils.ts`; `formStore.constants.ts` holds `THEME_STORAGE_KEY` and the `NO_ROWS`/`NO_GROUPS`/`NO_SELECTION` sentinels.

  **`store/banksSlice.ts` lives outside `formStore.ts`** — the three simulator-only banks (`catalogBank`, `maxDates`, `valores`), spread into the store (`...createBanksSlice(set)`) so every consumer still uses ordinary `useFormStore((s) => s.setValores)`. They share nothing with the rest: never touch `formSteps`/`introModal`, never enter the draft, never reach the export. Takes only `set` (no bank action reads outside state); splitting anything else out has the same 100-column `create<FormState>(…)` trap.
  - `formSteps[]` — multi-step, each with `stepId`/`title`/`subtitle?`/`rows`/`groups?`.
  - `introModal.steps[]` — same minus `groups`.
  - `formScript` — the shared prelude.
  - `activeCanvas`: `{type: "formStep"|"introStep", stepId}`.
  - UI state: `selectedFieldIds`, `canvasTool`, `isSidebarOpen`, `isRightSidebarOpen`, `sidebarTab`, `rightSidebarTab`, `canvasViewMode`, `canvasZoom`, `dragPlacement`, `rowDropTarget`, `rowDrag`, `draggingFieldId`, `hoveredTransferTarget`, `transferNotice`, `isDarkMode` and `isLowPerformance` (each persisted separately), `lastSavedAt`.
  - `setupConfig` + the three banks (each own `localStorage` key, none in draft/export).
  - Selectors: `getActiveRows`, `getActiveGroups`, `getSelectedFieldId`, `findFieldById`, `getAllFields`, `findRowContainingField`, `findRowById`.
  - Row/field mutations apply uniformly via `mapRowEverywhere`/`mapFieldEverywhere`. Key actions: `addFieldToRow`, `moveField`, `removeFields`, `selectField`/`toggleFieldSelection`/`setFieldSelection`, `updateField`, `setFieldName`, `updateFieldValidations/Styles/FileConfig`, `updateFieldApiBinding`, `setFieldScript`, `setFormScript`, `setFieldRounding/Formatted/AllowsNegative/Decimals/LabelFor/Content`, `addFieldRule`/`updateFieldRule`/`removeFieldRule`/`reorderFieldRule`, `addFieldOption`/`removeFieldOption`/`updateFieldOptionLabel`, `setFieldEnableWhen`/`setFieldVisibleWhen`, `addRowToActiveCanvas`/`updateRowColumns`/`removeRow`/`moveRow`, `moveFieldsToStep`/`moveRowToStep`, `setCanvasTool`, `addGroupToActiveStep`/`addRowToGroup`/`updateGroup`/`removeGroup`, step actions, `restoreDraft`, `undo`/`redo`.
  - **Wrapped in zundo's `temporal` middleware**: history lives in `useFormStore.temporal`, read through `useFormHistory`. The creator is `createFormState`, passed to `create<FormState>()(temporal(…))` — any further middleware has to keep that curried form. See "Undo / redo".
  - **Selectors must return stable references** — Zustand's `useSyncExternalStore` compares by identity; a fresh `[]` per call causes "Maximum update depth exceeded" (hence `NO_ROWS`/`NO_GROUPS`).

- **Field model** (`CanvasField`, `src/types/field.ts`): `name` (unique slug), `type`, `label`, `colStart`, `colSpan`, `validations`, `styles`, `logic`, plus optional `title`, `options[]`, `fileConfig`, `alwaysDisabled`, `apiBinding`, `labelFor`, `content`, `tooltip`, `rounding`, `formatted`, `allowsNegative`, `decimals`, `placeholder`, `suggestions`, `enableWhen`, `visibleWhen` (`FieldCondition = {fieldId, operator, value}`). Operators: `equals|notEquals|greaterThan|lessThan|startsWith|endsWith|contains|matches|in|isEmpty|isNotEmpty|isTruthy|isFalsy`. `logic` = `{script?, rules?}`. Types in `FIELD_TYPES` (`src/constants/fieldTypes.ts`), grouped **básicos** (text, number, tel, email, date, select, textarea, checkbox, calculated, file), **complejos** (search_select, datalist, toggle_group, radio_group, checkbox_group), **contenido** (label, rich_text). Adding a type is just a `FIELD_TYPES` entry (`PALETTE_SECTIONS` skips empty categories).
- **Grid**: `src/constants/grid.ts` — `GRID_BASE_COLUMNS = 16` default; rows carry their own `columns` (clamped 1–24), shrinking clamps field `colSpan`s to fit.
- **Four-slot layout** (`AppLayout.tsx`: `sidebar`, `canvas`, `canvasOverlay`, `rightSidebar`):
  - Left sidebar (`Sidebar/`): icon rail (`SidebarTabRail`, includes dark-mode toggle) over a tabbed panel — `SidebarTab` = `fields|attributes|validations|styles|logic|apiMapping|catalogs|fechas`. `fields`, `catalogs`, `fechas`, and `logic` (renders the prelude) work with no field selected. `LogicPanel` hosts `FieldScriptEditor`, `FieldRulesEditor`, `ConditionEditor` (×2, by `kind`). `FileOptionsEditor`/`NumberOptionsEditor`/`FieldOptionsEditor` handle type-specific config. This is the panel that still collapses (click the active tab).
  - Canvas (`Canvas/Canvas.tsx`): owns the full height of the window as a free canvas with pan room (`useCanvasViewport`); `CanvasToolLayer` mounts the hand and the marquee. Grid drop targets (`@dnd-kit` `useDroppable` per row), laid out by `CanvasRowsGrid` (blocks consecutive same-group rows into `RepeatableGroupBand`); `RowColumnsMenu` + `FieldResizeHandle`/`useFieldResize` for column count/`colSpan`; `FieldContextMenu` (right-click) for per-field actions; `JsonPreviewCanvas`/`PayloadPreviewCanvas` swap in by `canvasViewMode`. Intro-modal canvas renders inside a decorative fake-modal frame.
  - Right panel (`RightSidebar/`): action row (`SaveButton`, `SimulatorButton`, `PdfDesignerButton`, `ExportButton`, `RightPanelToggle`) over a text tab strip carrying `CanvasZoomControl`, over the blocks of the active tab — view mode and project info under **Proyecto** (the Formulario block's `Abrir…` opens `ProjectImportModal`); `CanvasTabs` (which switches `activeCanvas`) and `StepTitleEditor` under **Steps**. `TransferNotice` shows above both. Collapsed (`isRightSidebarOpen`), the whole `<aside>` is unrendered and `CollapsedRightSidebar` replaces it. See "The right panel".
  - Canvas overlay (`CanvasToolbar/`, `CollapsedRightSidebar/`): the floating bar with the pointer tools, + Fila / + Grupo repetible and the multi-selection actions, plus the right panel's chip when it is folded. See "Canvas tools and floating toolbar".
  - Drag-and-drop wiring in `src/hooks/useDragAndDrop/`; `FormBuilder` wires `DndContext`/`DragOverlay` (and swaps to the lazy `FormSimulator`). Every palette drop creates the field directly; options are configured later.
- **Payload mapping** (`src/lib/payloadSchema/`, `src/lib/payloadMapping/`): `PAYLOAD_SCHEMA` is the hardcoded `DeclaracionIcaE` contract. `buildMappingTree` pairs leaves with bound fields, flags type mismatches/orphans/host-provided leaves; rendered by `PayloadPreviewCanvas`, which appends the `conceptos` list (`summarizeConcepts`) — it lives outside the contract (see "Conceptos tributarios").
- **Persistence** (`useAutosave/`, `src/lib/persistence/persistence.ts`): autosaves on interval once setup is complete; Ctrl/Cmd+S via `useKeyboardShortcuts/`. `loadDraft`/`clearDraft` back the recovery modal. `loadDraft` is `JSON.parse` + `parseDraft`, which `lib/projectFile` reuses for exported files; `buildDraftPayload` (shared with the export) stamps `schemaVersion`/`savedAt`. Draft carries `schemaVersion`, **migrates before validating** (the reverse order would discard old drafts precisely when migration could save them). Migration steps in `persistence.migrations.ts`, indexed by source version, work on the raw object (no shape assumed) — a gap in the chain stops the walk and the version rejection kicks in. **Every shape change needs a migration step**; `z.object` silently strips undeclared keys, so skipping the step loses data without a word. A purely additive optional key (like `rounding`) needs no version bump, just its `persistence.schema.ts` line — forgetting that line is the same silent-strip trap from the other direction.
- **Output** (`src/lib/exportForm/`): `downloadFormExport`/`buildFormExport` serialize `projectMeta` (with `requires`, see "What a form requires"), `setupConfig.introModal`, `formSchema.steps[]` (each field's `colStart`/`colSpan`/`styles`/`validations.zodSchema`/`logic`/`options`/`fileConfig`/`alwaysDisabled`/`apiBinding`/`labelFor`/`content`/`tooltip`/`rounding`/`formatted`/`allowsNegative`/`decimals`/`enableWhen`/`visibleWhen`) plus `groups[]` (`min`/`max`/`arrayPath`, array Zod schema, `checks[]`) and `rows[].groupId`, plus `formSchema.gridBaseColumns`/`prelude` (sent once, not repeated per `compiled`). Field ids in conditions/rules/`labelFor` are **resolved to names** on export; a concept `apiBinding` goes out with its derived `tipo`. `validations.zodSchema` is optional — its absence is how the consumer knows there's nothing to validate. `downloadFormExport` adds `builderDraft` (the draft payload) to the downloaded file only — `buildFormExport`, which the simulator and the JSON view read, never carries it. The Exportar button goes through the export review first (see "Export review").

### Prescribed stack

- `@dnd-kit/core` + `@dnd-kit/sortable` (not react-dnd)
- `react-hook-form` + `@hookform/resolvers` + `zod` (Zod schemas authored dynamically per-field, stored as strings)
- `zustand` for the builder state tree
- `zundo` for undo/redo — the `temporal` middleware wrapping the store; the one addition to the original stack (see "Undo / redo")
- Tailwind v4 (`@tailwindcss/vite`), no CSS-in-JS, class-based dark mode — every new surface needs `dark:` variants
- `uuid` for ids
- `reicon-react` for icons (not lucide/heroicons)
- `@floating-ui/react` (exact `0.27.20`, same as the dashboard) for the builder's own UI tooltips: `atoms/Tooltip`, a port of the dashboard's (an atom, so `InfoHint`, `IconButton` and `DashedAddButton` can use it). **Not `field.tooltip`** (form content that gets exported). **Every UI hint goes through it, never a native `title=`** (`IconButton`/`DashedAddButton`/`CopyIconButton` turn their `title` prop into one; the three drag/resize handles are the deliberate exception, dnd-kit owns their ref). Its bubble is `bg-inverse text-on-inverse`, tokens that flip with `.dark`, and it renders in a `FloatingPortal` on `body` (z-60, above `ModalShell`) so the canvas's `scale()` and panel overflows can't shift or clip it. A disabled button never receives the pointer: wrap it in a `<span>` and put the Tooltip around that. The left rail names its icons **only while the panel is collapsed** (`isCollapsed={!isSidebarOpen}`).
- `@codemirror/*` + `@lezer/highlight` for the script editor — picked over Monaco (spec's original ask) for weight, since TS diagnostics aren't needed (script is JS). Only loads behind `ScriptInput`'s `React.lazy`.

### Code style

- **Comments in Spanish, `//` only — never JSDoc `/** */`** (JSDoc restates the signature's own types, rots first). No accents, matching existing style.
- **`src/lib/`, `src/store/`, `src/hooks/` carry a header comment per file** stating its role/boundary, plus targeted comments only where there's a trap, an invariant the code can't express, or a discarded alternative. High bar: if deducible from the line below, don't write it.
- `src/components/` is not commented as a matter of course — add one only when a component hides a real decision.
- **Explicit type annotations** on local declarations, matching existing files.
- Prettier decides formatting; run `pnpm format` rather than hand-formatting.
