import type { CanvasRow, RepeatableGroup } from '../types'

// Zustand compara por identidad (useSyncExternalStore): un [] nuevo en un selector dispara un bucle
// de renders. Vacios compartidos: nunca un [] literal en un selector.
export const NO_ROWS: CanvasRow[] = []
export const NO_GROUPS: RepeatableGroup[] = []
// La seleccion vacia, por lo mismo: un [] nuevo en cada limpieza redibujaria todas las filas.
export const NO_SELECTION: string[] = []
// Prefijo del nombre viejo (Form Orchestrator) a proposito: cambiarlo perderia lo ya guardado.
export const THEME_STORAGE_KEY: string = 'form-orchestrator-theme'
// Aparte del borrador, como el tema: es preferencia del equipo, no del formulario.
export const PERFORMANCE_STORAGE_KEY: string = 'form-orchestrator-performance'
