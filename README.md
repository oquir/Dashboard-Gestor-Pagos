# Gestor de Pagos (monorepo)

Dos aplicaciones de 1cero1 en un solo repositorio:

| Carpeta | Qué es | Historial anterior |
|---|---|---|
| `apps/dashboard` | Dashboard Gestor de Pagos: RIT, declaraciones, pagos y configuración de cada municipio | Este mismo repositorio (`oquir/Dashboard-Gestor-Pagos`) |
| `apps/form-orchestrator` | Orquestador de formularios: arma el formulario de cada municipio y exporta su JSON | `oquir/Form-Orchestrator` |

## Comandos

Desde la raíz, con pnpm 12.18.0:

```sh
pnpm install            # instala las dos apps
pnpm dev                # arranca las dos a la vez
pnpm dev:dashboard      # solo el dashboard
pnpm dev:formularios    # solo el orquestador
pnpm build              # compila las dos
pnpm lint               # ESLint en el dashboard y Biome en el orquestador
```

Cada app conserva su propio `pnpm-lock.yaml` (`sharedWorkspaceLockfile: false` en `pnpm-workspace.yaml`).

## Historial

Los dos repositorios se unieron el 2026-11-10 **sin reescribir el historial**: cada commit conserva su hash original, que se puede comparar con el del repositorio de donde viene.

- Cada proyecto tiene su primer commit: `0a35f3f` (dashboard) y `5503bd9` (orquestador). `git log --max-parents=0 --all` los muestra.
- Los commits anteriores a la unión tienen los archivos en la raíz, como estaban ese día. Para seguir un archivo desde el principio: `git log --follow apps/form-orchestrator/src/App.tsx`.
- Las ramas `Desarrollo` y `feat-Conceptos-Tributarios` vienen del orquestador.
