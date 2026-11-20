import type { BurstGate, HistorySnapshot } from '../../types'

// Piezas del historial sin zundo ni store; el cableado vive en formStore.ts.

export function toHistorySnapshot(state: HistorySnapshot): HistorySnapshot {
  return {
    formSteps: state.formSteps,
    introModal: state.introModal,
    formScript: state.formScript,
    setupConfig: state.setupConfig,
    activeCanvas: state.activeCanvas,
    selectedFieldIds: state.selectedFieldIds,
  }
}

// Solo el documento decide si hubo un paso: la seleccion y el paso activo no cuentan.
export function sameDocument(a: HistorySnapshot, b: HistorySnapshot): boolean {
  return (
    sameValue(a.formSteps, b.formSteps) &&
    sameValue(a.introModal, b.introModal) &&
    a.formScript === b.formScript &&
    sameValue(a.setupConfig, b.setupConfig)
  )
}

// Deja pasar el primer cambio de una rafaga (guarda el estado de antes) y traga los demas. reset()
// en cada deshacer: si no, un cambio tragado dejaria vivo el rehacer.
export function createBurstGate(windowMs: number, now: () => number = Date.now): BurstGate {
  let lastChange: number = Number.NEGATIVE_INFINITY

  function wrap<TArgs extends unknown[]>(fn: (...args: TArgs) => void): (...args: TArgs) => void {
    return (...args: TArgs): void => {
      const time: number = now()
      if (time - lastChange > windowMs) fn(...args)
      lastChange = time
    }
  }

  function reset(): void {
    lastChange = Number.NEGATIVE_INFINITY
  }

  return { wrap, reset }
}

// Por contenido, cortando en la primera referencia igual: rearmar sin cambiar nada no deja un paso
// vacio.
function sameValue(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false

  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false

    return a.every((item, index) => sameValue(item, b[index]))
  }

  const left: Record<string, unknown> = a as Record<string, unknown>
  const right: Record<string, unknown> = b as Record<string, unknown>
  // La union de claves: una clave presente con undefined y una ausente dicen lo mismo.
  const keys: Set<string> = new Set<string>([...Object.keys(left), ...Object.keys(right)])

  for (const key of keys) {
    if (!sameValue(left[key], right[key])) return false
  }

  return true
}
