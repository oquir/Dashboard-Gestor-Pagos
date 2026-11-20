// Prefijo del nombre viejo (Form Orchestrator) a proposito: cambiarlo perderia lo ya guardado.
export const DRAFT_KEY: string = 'form-orchestrator-draft'

// Version de la forma del borrador; cada subida lleva su paso en persistence.migrations. 2
// formScript, 3 formula a script, 4 efectos a script, 5 sin almacen, 6 Tailwind a CSS, 7 {campo} a
// {{campo}}.
export const DRAFT_SCHEMA_VERSION: number = 7
