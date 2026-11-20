import { useEffect } from 'react'
import { saveDraft } from '../../lib'
import { useFormStore } from '../../store'
import { AUTOSAVE_INTERVAL_MS } from './useAutosave.constants'

// Guarda el borrador cada cierto tiempo. Vive en App para seguir corriendo con el simulador
// abierto.
export function useAutosave() {
  useEffect(() => {
    const intervalId = setInterval(() => {
      // getState y no selector: suscribirse reiniciaria el intervalo en cada tecla.
      const { formSteps, introModal, formScript, setupConfig, markSaved } = useFormStore.getState()

      // Antes de terminar el asistente no hay nada que valga la pena guardar.
      if (!setupConfig.isComplete) return

      saveDraft({ formSteps, introModal, formScript, setupConfig })
      markSaved()
    }, AUTOSAVE_INTERVAL_MS)

    return () => clearInterval(intervalId)
  }, [])
}
