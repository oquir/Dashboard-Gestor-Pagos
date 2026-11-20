import { useStore } from 'zustand'
import { useFormStore } from '../../store'
import type { UseFormHistoryResult } from './useFormHistory.types'

// Si hay algo que deshacer o rehacer, y las dos acciones. Se suscribe al store temporal de zundo:
// los pasos no estan en FormState.
export function useFormHistory(): UseFormHistoryResult {
  const canUndo: boolean = useStore(
    useFormStore.temporal,
    (temporal) => temporal.pastStates.length > 0,
  )
  const canRedo: boolean = useStore(
    useFormStore.temporal,
    (temporal) => temporal.futureStates.length > 0,
  )
  const undo = useFormStore((state) => state.undo)
  const redo = useFormStore((state) => state.redo)

  return { canUndo, canRedo, undo, redo }
}
