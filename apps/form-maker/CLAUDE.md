# CLAUDE.md

Guidance for Claude Code in this app (FormMaker, formerly "Form Orchestrator"): a visual drag-and-drop **step-by-step form builder** that compiles its config to one JSON document, plus a **simulator** (a working prototype of the consuming app that runs the exported JSON) and a **PDF designer**.

**This file is the short version.** The full record of settled decisions, with their reasons, is [`docs/Decisiones.md`](docs/Decisiones.md) (the former CLAUDE.md, verbatim). **Before touching an area in the table below, read its section there** — headings are quoted exactly so you can grep them. Don't re-litigate what's marked "Settled" without asking the user.

## Other docs

- `docs/Project.md` (Spanish) — original spec, reference for the target JSON schema. Check before adding features.
- `docs/Dominio-ICA.md` — **read before working on the `industria_comercio`, `retencion_industria_comercio` or `autorretencion` templates, renglones, scripts, sanctions or deadlines.** ⏳ marks data that expires (UVT, bases, deadlines, rates): re-verify only those.
- `docs/Pendientes-PDF.md` — **read before any work on a declaration's PDF** ("Diseñar PDF", its templates, the `{Variable}` placeholders). Tick items off there as they land (`[x]`, strikethrough, date, commit).

## Where to read (section in `docs/Decisiones.md`)

| Area | Section |
|---|---|
| Right panel, collapsed chip, tabs, zoom control | `The right panel (RightSidebar)` |
| Crash screens | `Render errors (ErrorBoundary)` |
| Hidden steps | `Hidden steps (step.hidden)` |
| Ctrl+←/→ | `Step navigation shortcut` |
| Shift / Shift+Ctrl placement while dragging, `colStart` | `Zone placement` |
| Canvas zoom, free canvas / pan room | `Canvas zoom`, `The free canvas` |
| Slow-machine toggle | `Low-performance mode` |
| JSON view, virtual list, its search | `JSON view: virtual list…` |
| Tools (V/M/H), floating bar, multi-selection | `Canvas tools and floating toolbar` |
| Undo/redo (zundo) | `Undo / redo (zundo)` |
| Dragging rows, row styles | `Reordering rows`, `Row styles` |
| `customCss` fields | `Styles are plain CSS, not Tailwind classes` |
| Moving fields/rows between steps | `Moving things between steps` (Almacén de Partes is gone — do not rebuild) |
| `actividades[]`, `group.checks` | `Repeatable groups`, `group.checks` |
| `logic.script`, `{{campo}}`, rules, prelude, no-code calc | `The field script`, `References are {{campo}}`, `No-code calculation` |
| `label`, `rich_text` | `Presentational fields` |
| Simulator, mock catalogs | `Simulador (FormSimulator)` |
| PDF designer | `PDF designer (PdfDesigner)` |
| tooltip, rounding, formatted, decimals, allowsNegative, maxLength, placeholder, datalist | the section named after each |
| `apiBinding.kind: "concept"` / `conceptos` | `Conceptos tributarios` |
| Options, `dataSource`, `fills`, catalog/fechas/UVT banks | `Options and apiBinding` and its `###` subsections |
| Date helpers (`fechaLimite`, `mesesDeMora`…) | `fechaLimite / diasDeMora / mesesDeMora` |
| Renglón 31 / 37 (sanción, intereses) | `Sanciones`, `Intereses de mora` |
| `validations.overrides`, `visibleWhen`/`enableWhen` | `Conditional validations`, `Conditions` |
| Open an exported file | `Opening an exported form (builderDraft)` |
| Export review | `Export review (diagnoseForm)` |
| `projectMeta.requires` | `What a form requires` |
| Pieces / persistence / output | `Architecture` → `Pieces` |

## Known gaps

- **The consumer (`FrontAutoliquidable`) has drifted from the builder silently**: it copied the runtime on 2026-08-26 and lacks `fieldDate`, `dateFormat`, `dateBound`, `fieldAffix`, `fieldContact` (and drops `datalist` suggestions). The ICA template already uses them. Plan: port the modules; the export already declares `projectMeta.requires`, the consumer must refuse forms asking for words it lacks (both go together). Sharing the runtime as a package is postponed by the user. `pnpm verify` in the consumer runs the real JSON through its runtime.
- **No test runner yet.** Vitest planned for the end of development, stable core only (number/date rules, a golden test of the ICA template through `resolveRuntime`, draft migrations). Until then: throwaway `pnpm exec tsx` scripts in the scratchpad.
- `logic.script` exports **compiled JS**, run by the consumer with `new Function` — the trust boundary (a JSON from someone else = code execution).
- Zod validates _shape_, not coherence (`colSpan: -999`, a `dataSource` on a `text` field pass).
- `validations.pattern` isn't validated while typing; the export review blocks an invalid regex.
- **Renglón 31 hardcodes two catalog ids** (`TIPO_SANCION_OTRA = "4"`, `TIPO_SANCION_EXTEMPORANEIDAD = "1"`); reordering `tipos_sancion` breaks them silently.
- **Two selects still infer their catalog from the path** (`periodo_anio`, `clasificacion_contribuyente`); `juegos_permitidos` has no field. Catalog ids are unconfirmed contract names.
- Renglones 31 and 37 need the intro modal (`{{periodo_anio}}` lives there); deleting those intro steps leaves them uncalculated (the export review blocks).
- Selects mapped to `number` leaves show a permanent `⚠ tipo` (fix offered, not approved).
- **Moving a field out of a repeatable group to another step keeps its `apiBinding`** (`planLanding`); one-line fix not applied.
- PDF designer: §3.1, §3.2, §3.3, §3.5 built; no variable list (§3.4). §3.3 has no checkbox and no repeating row — the user's call, don't build them without asking. Styles go in design classes (one `<style>`, `class="…"` per cell); don't reintroduce per-cell inline defaults. The sidebar isn't checked in a browser yet, nor anything through the real back.

## Invariants that bite (details in `docs/Decisiones.md`)

- **Selectors must return stable references** (Zustand `useSyncExternalStore`): use the `NO_ROWS`/`NO_GROUPS`/`NO_SELECTION` sentinels, never a fresh `[]`.
- **A shape change needs a draft migration** (`persistence.migrations.ts`, bump `DRAFT_SCHEMA_VERSION`) — migrate _before_ validating. A purely additive optional key needs only its line in `persistence.schema.ts`: `z.object` silently strips undeclared keys. Same for `pdfDesignBank.schema.ts`.
- **The simulator consumes `buildFormExport(...)` and never `useFormStore`.** If it can't do something, neither can the consumer.
- **Lazy boundaries**: `FormSimulator`, `PdfDesigner`, `ScriptEditor` are separate chunks. Don't re-export them from level `index.ts`; don't import `lib/mockCatalog`, `zodHydrate`, `formRuntime`, `scriptRuntime`, `runtimeValidation`, `components/organisms/preview|pdf` etc. from the builder side. Verify by grepping `dist/`.
- **Field refs are `{{campo}}`**; `fieldRefText(name)` is the one place that writes the syntax. An unknown `{{x}}` is an error. Never move rule logic (sanción, intereses) out of `logic.script` into code or the prelude.
- **Never in the draft or export**: the simulator banks (catalogs, fechas, UVT), the PDF design (own `localStorage` key per tax), `canvasZoom`, `canvasTool`, panel state.
- **Never store rich text/PDF HTML as raw HTML**; the serializer/sanitizer is the barrier, `safeHref` runs at insert, serialize and draft load.
- **Equality for undo is `sameDocument`** — selection, zoom, tool and drag state never create a history step. Edits that change nothing must return the same reference.
- **Rounding/negatives/decimals change the value, not just display**; the formatted text never leaves the input (state holds a real `number`).
- Nothing in the collapsed right chip's container may set `transform`/`filter`/`backdrop-filter`/`will-change` (breaks `ModalShell`).
- Every UI hint uses `atoms/Tooltip`, never native `title=` (handles dnd-kit owns are the exception). Every new surface needs `dark:` variants.

## Commit conventions

- Spanish, present tense, imperative ("Agrega X", "Corrige Y"). Subject under ~72 chars. **Bodies short — 3-4 lines max, often none**; durable detail goes to docs, not commit history.
- One commit per cohesive change. **Stage by explicit path** — never `git add -A`/`git add src` (unrelated WIP is common).
- `.gitattributes` normalizes to LF; if `git status` isn't clean, `git add --renormalize .` once, separately.
- On Windows write the message to a file and use `git commit -F <file>`.

## Commands

Package manager is **pnpm** (never npm/yarn/bun).

- `pnpm dev` / `pnpm build` (typecheck `tsc -b` + build; may exceed the 2-min tool timeout, exit 143 = harness kill, re-run longer) / `pnpm lint` / `pnpm format` / `pnpm preview`
- `pnpm exec tsx <script>.ts` — throwaway verification. **Run from the project root**, never from inside the scratchpad (pnpm 11 would try to `pnpm install` over the junctioned `node_modules`). Scratchpad needs `package.json` `{"type":"module"}`, absolute imports as `file:///C:/...`, a `node_modules` junction, and a `localStorage` stub installed _before_ a dynamic `import()` of the store.
- ESLint + Prettier are shared with the dashboard at the monorepo root (2 spaces, single quotes, no semicolons, 100 cols). `reicon-react` is pinned to exact `1.1.2`. `pnpm-workspace.yaml` carries `allowBuilds`.

## File layout conventions

- Atomic design: `src/components/atoms|molecules|organisms/` + `layout/`; panels in `organisms/panels/`. Each component/hook gets **its own folder** with co-located `X.tsx`/`X.types.ts`/`X.constants.ts`/`X.utils.ts` (only what's needed) and an `index.ts` (`export * from './X'`). Hooks `src/hooks/useX/useX.ts`; libs `src/lib/<name>/<name>.ts`.
- Import a component by its folder; across levels go through the level `index.ts`, **within a level import by folder, never the level index** (cycle). No upward imports (atom → molecule).
- `hooks/`, `constants/`, `types/`, `lib/`, `store/` have an `index.ts` too; code outside imports through it. **Left out of the indices on purpose** (imported by folder, from behind the lazy boundary): `useFormPreview`, `usePreviewNavigation`, `usePreviewSearchSelect`, `usePdfDesignAutosave`, `usePdfDesignerShortcuts`, `usePdfFile`, `usePdfImageCheck`; libs `catalogFill`, `formRuntime`, `mockCatalog`, `pdf*`, `runtimeCondition|Derived|Payload|Validation`, `scriptDates`, `scriptRuntime`, `scriptValores`, `zodHydrate`; `store/pdfDesignStore.ts`, `banksSlice`. Libs import each other by folder, never through `lib/index.ts`.
- A co-located `X.types.ts`/`X.constants.ts` is private to its folder; once something outside imports it, it moves to `src/types/` / `src/constants/` (whole file, not split). A new file there needs its line in the index.
- `X.ts` is the module's public API — helpers/constants/types go in co-located files.

## Stack

`@dnd-kit/core` + `sortable`, `zustand` + `zundo` (undo/redo), `zod` (schemas authored per field, stored as strings), `react-hook-form` (unused so far), Tailwind v4 (class-based dark mode), `uuid`, `reicon-react` (not lucide/heroicons), `@floating-ui/react` `0.27.20` (UI tooltips only — not `field.tooltip`), `@codemirror/*` (script editor, lazy).

## Code style

- **Comments in Spanish, `//` only — never JSDoc**, no accents. `src/lib/`, `src/store/`, `src/hooks/` carry a header comment per file (role/boundary) plus comments only for traps, invariants or discarded alternatives; if deducible from the next line, don't write it. `src/components/` isn't commented by default.
- **Explicit type annotations** on local declarations. Prettier decides formatting (`pnpm format`).
