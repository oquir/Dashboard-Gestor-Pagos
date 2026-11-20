import { useMemo } from 'react'
import { validatePrelude } from '../../lib/fieldScript/fieldScript'
import { useFormStore } from '../../store/formStore'
import type { PreludeValidation } from '../../types/fieldScript'
import { useKnownFieldNames } from '../useKnownFieldNames/useKnownFieldNames'
import type { UseFormScriptEditorResult } from './useFormScriptEditor.types'

export function useFormScriptEditor(): UseFormScriptEditorResult {
  const formScript = useFormStore((state) => state.formScript)
  const setFormScript = useFormStore((state) => state.setFormScript)

  // Solo para pintar: en el preludio ningun {{x}} es legal, pero el editor muestra los campos
  // reales como ficha.
  const knownNames: Set<string> = useKnownFieldNames()

  const validation: PreludeValidation = useMemo(() => validatePrelude(formScript), [formScript])

  return {
    formScript,
    setFormScript,
    knownNames,
    validation,
  }
}
