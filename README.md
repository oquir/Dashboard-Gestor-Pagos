# Gestor de Pagos (monorepo)

Dos aplicaciones de 1cero1 en un solo repositorio:

| Carpeta           | Qué es                                                                                      | Historial anterior                                      |
| ----------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `apps/dashboard`  | Dashboard Gestor de Pagos: RIT, declaraciones, pagos y configuración de cada municipio      | Este mismo repositorio (`oquir/Dashboard-Gestor-Pagos`) |
| `apps/form-maker` | FormMaker (antes Form Orchestrator): arma el formulario de cada municipio y exporta su JSON | `oquir/Form-Orchestrator`                               |

## Comandos

Desde la raíz, con pnpm 12.18.0:

```sh
pnpm install            # instala las dos apps
pnpm dev                # arranca las dos a la vez (dashboard en :5173, FormMaker en :5174)
pnpm dev:dashboard      # solo el dashboard
pnpm dev:formularios    # solo FormMaker
pnpm build              # compila las dos
pnpm preview            # sirve lo compilado de las dos (mismos puertos que dev)
pnpm preview:dashboard  # solo el dashboard compilado
pnpm preview:formularios # solo FormMaker compilado
pnpm lint               # ESLint + chequeo de Prettier en las dos apps
pnpm lint:fix           # ESLint con --fix + Prettier --write
pnpm format             # Prettier --write
```

En **Municipios**, con un municipio elegido, cada formulario que gestiona tiene un enlace **Editar formulario** que abre FormMaker en una pestaña nueva (solo 1cero1). La dirección sale de `VITE_FORM_BUILDER_URL` y, sin ella, es `http://localhost:5174`. Los dos puertos están fijos (`strictPort`): si uno está ocupado, Vite falla en vez de moverse a otro y dejar el enlace roto.

Cada app conserva su propio `pnpm-lock.yaml` (`sharedWorkspaceLockfile: false` en `pnpm-workspace.yaml`).

## Historial

Los dos repositorios se unieron el 2026-11-10 **sin reescribir el historial**: cada commit conserva su hash original, que se puede comparar con el del repositorio de donde viene.

- Cada proyecto tiene su primer commit: `0a35f3f` (dashboard) y `5503bd9` (FormMaker). `git log --max-parents=0 --all` los muestra.
- Los commits anteriores a la unión tienen los archivos en la raíz, como estaban ese día. Para seguir un archivo desde el principio: `git log --follow apps/form-maker/src/App.tsx`.
- La app se llamó Form Orchestrator hasta el 2026-11-13; ese día se renombró a FormMaker y su carpeta pasó de `apps/form-orchestrator` a `apps/form-maker` con un commit normal, sin tocar el historial.
- Las ramas `Desarrollo` y `feat-Conceptos-Tributarios` vienen del repositorio original de FormMaker (`oquir/Form-Orchestrator`).
