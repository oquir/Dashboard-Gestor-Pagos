# Gestor Autoliquidables (dashboard)

El dashboard con el que los municipios y 1cero1 gestionan las declaraciones de industria y comercio (ICA), retención (ReteICA) y autorretención (AutoReteICA), las inscripciones en el RIT, los pagos y la configuración de cada municipio.

> **Es un mock.** Corre en localhost, sin API ni base de datos, y sirve para mostrarles a los municipios cómo se verá el aplicativo. Los datos de la demo se generan con una semilla fija (siempre salen los mismos) y lo que se cambia queda guardado en el navegador (`localStorage`).

## Cómo correrlo

Con pnpm 12.18.0, desde esta carpeta:

```sh
pnpm install   # dependencias de esta app (tiene su propio pnpm-lock.yaml)
pnpm dev       # servidor de desarrollo en http://localhost:5173
pnpm build     # typecheck (tsc -b) + build de producción
pnpm preview   # sirve lo compilado, en el mismo puerto
pnpm lint      # ESLint + chequeo de Prettier
pnpm format    # Prettier --write
```

Desde la raíz del monorepo también sirven `pnpm dev:dashboard` y `pnpm preview:dashboard`.

**Entrar a la demo**: en `/login` se elige un usuario, y la contraseña es `admin` / `admin` para todos (temporal, hasta que haya autenticación real). El botón **Reiniciar demo** de la barra superior borra los cambios y vuelve a los datos originales.

## Roles

| Rol                                                    | Qué hace                                                                                           |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| **1cero1** (`1cero1`)                                  | El proveedor del aplicativo: ve todos los municipios, los configura y gestiona sus administradores |
| **Administrador del municipio** (`municipality_admin`) | Secretario de Hacienda o de Tesorería: configura su municipio, gestiona funcionarios y revisa      |
| **Funcionario** (`official`)                           | Revisa las inscripciones del RIT y las declaraciones de su municipio                               |

Qué ve y qué puede hacer cada rol está en `src/lib/permissions.ts`.

Municipios de la demo: **Villeta** (Cundinamarca, solo ICA), **Ricaurte** (Cundinamarca, con aprobación previa en el ICA) y **Garzón** (Huila, sin RIT).

## Páginas

| Menú              | Qué tiene                                                                                                   |
| ----------------- | ----------------------------------------------------------------------------------------------------------- |
| **Inicio**        | Resumen del municipio: recaudo, vencimientos, aprobaciones y solicitudes pendientes, alertas                |
| **Inscripciones** | El RIT: inscripciones y novedades por revisar, con la ficha de cada inscrito                                |
| **Declaraciones** | Las declaraciones presentadas y los omisos, la aprobación previa, las correcciones y los emplazamientos     |
| **Pagos**         | Pagos recibidos, cartera, cheques en canje, retenciones sin consignar, pago en ventanilla y Asobancaria     |
| **Reportes**      | Gráficas e informes del municipio, descargables en Excel                                                    |
| **Actividades**   | Las actividades económicas y sus tarifas por año gravable, cargadas desde una plantilla de Excel            |
| **Calendario**    | Vencimientos por año gravable, periodicidad de cada formulario y descuento por pronto pago                  |
| **Configuración** | Lo de cada municipio: retención, trámite de corrección, sanciones, aprobación previa y formularios          |
| **Usuarios**      | Los usuarios del municipio                                                                                  |
| **Municipios**    | Activar el RIT y los impuestos de cada municipio, y abrir FormMaker para editar su formulario (solo 1cero1) |
| **Bitácora**      | Quién hizo cada cambio y cuándo (solo 1cero1)                                                               |

Además, sin entrada en el menú, el **estado de cuenta** del contribuyente (`/estado-de-cuenta/...`), al que se llega desde la declaración, la ficha del RIT o la cartera.

## FormMaker

El enlace **Editar formulario** de Municipios abre FormMaker (`apps/form-maker`) en `VITE_FORM_BUILDER_URL` o, sin esa variable, en `http://localhost:5174`. Los puertos de las dos apps están fijos (`strictPort`): si uno está ocupado, Vite falla en vez de cambiarse a otro y dejar el enlace roto.

## Stack

- **React 19** + **TypeScript** + **Vite 8**, con **react-router** para las rutas
- **Zustand** para el estado, persistido en `localStorage`
- **Tailwind v4** con tokens de color por rol en `src/index.css` (solo modo claro)
- **@tanstack/react-table** para las tablas, **sonner** para los avisos, **@floating-ui/react** para los globos
- **jspdf** y **pdfjs-dist** para generar y ver los PDF de las declaraciones; **fflate** para leer y escribir los Excel y armar los ZIP
- **reicon-react** para los íconos
- **ESLint + Prettier** compartidos con FormMaker desde la raíz del monorepo

## Documentación

- [`docs/Pendientes-y-decisiones.md`](docs/Pendientes-y-decisiones.md): las decisiones tomadas, lo que falta en orden y dónde está cada cosa en el código.
- [`docs/Dominio-ICA.md`](docs/Dominio-ICA.md): cómo funcionan el ICA, la ReteICA, la autorretención y el RIT, y qué le exigen al dashboard.
- [`docs/Contexto-RIT.md`](docs/Contexto-RIT.md): cómo se llega a ser agente retenedor o autorretenedor y cómo lo registra el municipio.
- [`CLAUDE.md`](CLAUDE.md): las convenciones del código y la arquitectura, para quien trabaje en él (con o sin IA).
