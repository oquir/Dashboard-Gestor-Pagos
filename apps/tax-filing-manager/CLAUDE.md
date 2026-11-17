# CLAUDE.md

Guía para Claude Code (claude.ai/code) al trabajar en esta app.

## Qué es

**Gestor Autoliquidables** (nombre técnico `tax-filing-manager`, paquete `tax-filing-manager-dashboard`): el dashboard con el que los municipios y 1cero1 gestionan las declaraciones de ICA, ReteICA y AutoReteICA, las inscripciones en el RIT, los pagos y la configuración de cada municipio.

**Es un mock**: corre en localhost, sin API ni base de datos, y sirve para mostrarles a los municipios cómo se verá el aplicativo. Todo el estado vive en el navegador (`localStorage`) y los datos de la demo se generan con una semilla fija. El login real, PSE y los bancos, la base de datos, la seguridad entre municipios, los festivos y la tasa de interés de mora de cada mes **no son del mock**: llegan con la API.

Roles (`Role` en `src/types/domain.ts`): `1cero1` (el proveedor, ve todos los municipios), `municipality_admin` y `official`. Qué puede hacer cada uno está en `src/lib/permissions.ts`; ajustar ahí cambia menús, botones y rutas. Municipios de la demo: **Villeta** (solo ICA), **Ricaurte** (Cundinamarca; aprobación previa en el ICA, no valida la ReteICA contra el RIT) y **Garzón** (Huila; sin RIT).

## Leer antes de trabajar

- **[`docs/Pendientes-y-decisiones.md`](docs/Pendientes-y-decisiones.md)**, el documento principal:
  - §1: las decisiones tomadas, con su porqué. Lo que dice **Descartado** no se vuelve a proponer sin preguntar.
  - §2: lo que falta, en el orden en que conviene hacerlo. Cada punto se hace en su versión mínima.
  - §3: los conceptos tributarios detrás de cada función.
  - §4: dónde está cada cosa en el código.
  - Al terminar o decidir algo, se actualiza ahí: §1 si es una decisión, §3 o §4 si se implementó, y se quita de §2.
- **[`docs/Dominio-ICA.md`](docs/Dominio-ICA.md)**: cómo funcionan las tres declaraciones y el RIT, y qué le exigen al dashboard (§6). Lo que caduca (UVT, plazos, tasas) está marcado con ⏳: antes de usarlo, verificar solo eso.
- **[`docs/Contexto-RIT.md`](docs/Contexto-RIT.md)**: cómo se llega a ser agente retenedor o autorretenedor y cómo lo registra el municipio. §8 lista diferencias con `Dominio-ICA.md` que siguen sin corregir.

## Reglas del dominio que se rompen fácil

- **ReteICA y AutoReteICA son formularios distintos**, cada uno con su periodicidad (mensual, bimestral o trimestral) y sus propios vencimientos. No suponer bimestral ni un calendario combinado.
- **Los vencimientos pueden ir por último dígito del NIT o la cédula, siempre sin el DV.** La página Calendario lo dice con un ejemplo, porque los municipios se quejan cuando no queda claro.
- **Los años pasados se pueden cargar en el calendario** (hasta 10 atrás), y en ellos no hay descuento por pronto pago.
- **Cada declaración guarda su periodicidad y los datos que escribió el declarante.** El detalle, el PDF, las tablas y los reportes los toman de la declaración, no del RIT. El contribuyente (la empresa o la persona) y el declarante (quien diligencia) son cosas distintas.
- **Hay municipios sin RIT**, y formularios que no se validan contra el RIT. Sin RIT no hay cruces ni omisos.
- **Los omisos se revisan desde la salida a producción de cada formulario** (`inProductionSince`). Lo anterior está en otro sistema, y revisarlo marcaría como omisos a quienes sí declararon.
- **`today()` de `src/utils` da la fecha en UTC**: de noche en Colombia ya es el día siguiente. `now()` sí usa la hora local.

## Relación con FormMaker

- **FormMaker** (`apps/form-maker`, mismo monorepo) arma el formulario de cada municipio. El dashboard lo abre desde Municipios con el permiso `openFormBuilder`, en `FORM_BUILDER_URL` (`src/constants/formBuilder.ts`, `VITE_FORM_BUILDER_URL` o `http://localhost:5174`).
- **Los puertos son fijos** (dashboard 5173, FormMaker 5174, con `strictPort` también en `preview`). Si se cambia uno, se rompe el enlace.
- Lo que depende del formulario, como qué soportes pide el RIT según la calidad, se configura en FormMaker; el dashboard solo muestra lo que trae cada inscripción.
- Hoy FormMaker abre sin contexto. Pasarle el municipio elegido es lo último de la lista de pendientes.

## Comandos

pnpm **12.18.0**: la raíz del monorepo la exige en `devEngines`, con `onFail: error`.

- `pnpm dev`: servidor de Vite en el puerto 5173.
- `pnpm build`: `tsc -b` y luego `vite build`.
- `pnpm lint` / `pnpm format`: ESLint + Prettier, con la configuración compartida en la raíz del monorepo (2 espacios, comillas simples, sin punto y coma, 100 columnas).
- Desde la raíz del monorepo: `pnpm dev:dashboard` y `pnpm preview:dashboard`.

Esta app tiene su propio `pnpm-lock.yaml` (`sharedWorkspaceLockfile: false`): `pnpm install` y `pnpm audit` se corren dentro de `apps/tax-filing-manager`.

**No hay test runner todavía**: las pruebas unitarias con Vitest están planeadas al final del desarrollo (punto 13 de `docs/Pendientes-y-decisiones.md`). Mientras tanto, para probar la lógica con los datos de la demo sin navegador, un script `.mjs` en el scratchpad levanta Vite con `createServer` (`configFile: false`, `server: { middlewareMode: true }`) y carga los módulos reales con `server.ssrLoadModule('/src/...')`. Para renderizar componentes:

- React y `react-dom/server` se cargan con `createRequire(<app>/package.json)`, no con `ssrLoadModule`, que falla con "module is not defined".
- `MemoryRouter` se carga con `import()` de `require.resolve('react-router')`.

## Arquitectura

```
src/
  App.tsx            rutas (react-router); todo menos /login vive dentro de Layout
  store.ts           el store de Zustand, persistido
  data/              generación de la demo: catalogs.ts (municipios, SETTINGS), generate.ts, auditLog.ts, random.ts
  lib/               lógica sin React: rules, calendar, nonFilers, remittance, summonses, statement, permissions, session, declarationPdf, excel...
  types/             domain.ts (el modelo) y tipos compartidos por tema
  constants/  utils/ lo que usan dos o más módulos
  components/        atoms, molecules, organisms (por tema: declarations, payments, calendar...), templates
  pages/             una por ruta
```

- **`store.ts`**: un solo store de Zustand con `persist`, con la clave `tax-filing-manager-demo` y una `version`. **No tiene `migrate`**: si cambia la forma de los datos o lo que genera `data/`, se sube la `version`. Así se descarta lo guardado y la demo se vuelve a generar. `resetDemo` hace lo mismo a mano.
- **La bitácora**: cada acción del store que cambia algo llama a `record(REQUESTS.x, municipio, datosEnviados, success)` al terminar, como lo hará el back al terminar cada endpoint. Una acción nueva necesita su entrada en `REQUESTS` (`src/constants/auditLog.ts`) y su `record`.
- **`lib/session.ts`**: los hooks que cruzan el store con las reglas (`useNonFilers`, `useUnremitted`, `useDateQuery`...). Los componentes leen de ahí, no recalculan.
- **El ciclo de `lib/index.ts`**: componentes y páginas importan desde `lib` (el índice). `data/`, `store.ts`, `constants/`, `types/` y los archivos de `lib` entre sí importan **por la ruta** (`../lib/rules`). `lib/session` lee el store, y el store genera los datos al cargarse: pasar por el índice cierra un ciclo que rompe la inicialización.
- **Datos de la demo con semilla fija** (`data/random.ts`): siempre salen los mismos. Si una función nueva necesita ejemplos, se agregan en `generate.ts`, y sus registros de la bitácora en `auditLog.ts`.
- **Consulta por rango de fechas** en Inscripciones y Declaraciones: no se muestra nada hasta elegir Desde y Hasta y presionar Consultar, como funcionará con la API.
- **Errores al pintar**: el átomo `ErrorBoundary` y el organismo `ErrorFallback` están en dos lugares.
  - **Alrededor de `<Outlet />` en `Layout`**, con `key={pathname}`: si falla una página, el menú y la barra siguen ahí, y al navegar se reinicia.
  - **Alrededor de `<App />` en `main.tsx`**, a pantalla completa: atrapa lo que falle fuera de una página, como el login o el menú.
  - Las dos ofrecen **Reiniciar demo**: si lo guardado en `localStorage` quedó con una forma que el código ya no espera, recargar vuelve a fallar.
  - Solo atrapan errores al pintar, no los de un `onClick`.

## Convenciones del código

- **Componentes limpios**: el archivo del componente solo tiene los imports y el componente. Lo que define, va en su carpeta:
  - `X/X.tsx`, `X/X.types.ts` (las props, como `XProps`), `X/X.constants.ts`, `X/X.utils.ts` y `X/index.ts` (`export { default } from './X'`).
  - Cuenta como definición cualquier tipo escrito en línea (props, `useState<…>`), las constantes de módulo y los datos fijos (listas, opciones, regex).
  - Un componente sin nada propio se queda como archivo suelto (`Input.tsx`, `SearchBox.tsx`, `Layout.tsx`).
- **Lo que usan dos o más módulos va a `src/types/`, `src/constants/` o `src/utils/`**, cada uno con su `index.ts`. Antes de escribir un helper, buscar ahí: había copias de `today()` en seis lugares.
- Cada nivel de componentes (`atoms`, `molecules`, `organisms`, `templates`) tiene su `index.ts`, y se importa por el nivel o por la carpeta del componente. Un átomo no usa otros componentes.
- **Colores por rol, nunca la paleta de Tailwind directo**: `bg-surface`, `text-fg`, `border-border`, `bg-brand`... definidos en `src/index.css` en el mismo formato que FormMaker. Solo hay modo claro; el oscuro sería redefinir esos tokens bajo una clase `.dark`.
- **Textos y comentarios en español.** Los campos de los tipos y del store se documentan con `/** … */` (a diferencia de FormMaker), y cada archivo de `lib/`, `data/` y `store.ts` abre con un comentario que dice para qué es. Se comenta el porqué, no lo que ya dice la línea.
- Lo visible dice "Gestor Autoliquidables"; lo técnico (paquetes, claves de almacenamiento) va en inglés. La carpeta raíz y el repositorio conservan el nombre viejo, `Dashboard-Gestor-Pagos`, a propósito.
- Íconos de `reicon-react`, tablas con `@tanstack/react-table`, avisos con `sonner`, globos con `@floating-ui/react`, PDF con `jspdf` (importado dinámicamente) y `pdfjs-dist`.

## Commits

- En español, con el formato `tipo: resumen en infinitivo`, y un ámbito opcional: `feat(store): registrar y quitar emplazamientos`, `docs: reordenar la lista de pendientes`.
- Sin `Co-Authored-By`.
- Se agregan los archivos por su ruta, nunca con `git add -A`.
- **El historial no se reescribe** (nada de rebase ni `filter-repo` sobre lo publicado): el monorepo conserva los hashes de los repositorios originales para una auditoría.
