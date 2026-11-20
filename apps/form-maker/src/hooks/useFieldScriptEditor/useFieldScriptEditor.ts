import { useMemo, useState } from 'react'
import { buildFieldGraph, describeCycle, topologicalOrder } from '../../lib/fieldGraph/fieldGraph'
import { isNumericField } from '../../lib/fieldKind/fieldKind'
import { validateFieldScript } from '../../lib/fieldScript/fieldScript'
import { useFormStore } from '../../store/formStore'
import type { CanvasField } from '../../types/field'
import type { FieldGraph } from '../../types/fieldGraph'
import type { ScriptValidation } from '../../types/fieldScript'
import { useKnownFieldNames } from '../useKnownFieldNames/useKnownFieldNames'
import type {
  UseFieldScriptEditorParams,
  UseFieldScriptEditorResult,
} from './useFieldScriptEditor.types'

export function useFieldScriptEditor({
  field,
  candidates,
}: UseFieldScriptEditorParams): UseFieldScriptEditorResult {
  const setFieldScript = useFormStore((state) => state.setFieldScript)
  const formScript = useFormStore((state) => state.formScript)

  const source: string = field.logic.script ?? ''

  // El propio campo cuenta como conocido: asi se avisa la autorreferencia en vez de marcarlo
  // desconocido.
  const knownNames: Set<string> = useKnownFieldNames()

  const validation: ScriptValidation = useMemo(
    () => validateFieldScript(source, knownNames, formScript),
    [source, knownNames, formScript],
  )

  // El ciclo se avisa y no se bloquea: el script es texto libre. Las condiciones si lo bloquean (se
  // eligen de una lista).
  const cycle: string | null = useMemo(() => {
    const graph: FieldGraph = buildFieldGraph([field, ...candidates])
    const found: string[] | null = topologicalOrder(graph).cycle

    return found?.includes(field.id) ? describeCycle(graph, found) : null
  }, [field, candidates])

  const readsSelf: boolean = validation.reads.includes(field.name)
  const dependencies: CanvasField[] = validation.reads.flatMap((name) => {
    const found: CanvasField | undefined = candidates.find((candidate) => candidate.name === name)

    return found ? [found] : []
  })

  // El calculo sin codigo solo suma y resta numeros.
  const offersSimpleCalc: boolean = isNumericField(field.type)
  const [isSimpleCalcOpen, setIsSimpleCalcOpen] = useState<boolean>(false)

  function handleChange(next: string): void {
    setFieldScript(field.id, next)
  }

  function openSimpleCalc(): void {
    setIsSimpleCalcOpen(true)
  }

  function closeSimpleCalc(): void {
    setIsSimpleCalcOpen(false)
  }

  return {
    source,
    knownNames,
    validation,
    cycle,
    readsSelf,
    dependencies,
    handleChange,
    offersSimpleCalc,
    isSimpleCalcOpen,
    openSimpleCalc,
    closeSimpleCalc,
  }
}
