import { useCallback, useEffect, useMemo, useState } from 'react'
import { hasFills, resolveFills } from '../../lib/catalogFill'
import { buildFormExport } from '../../lib'
import { buildRuntimeModel, createInitialState, resolveRuntime } from '../../lib/formRuntime'
import { enTexto } from '../../lib'
import { maxDatesEnUso } from '../../lib'
import { catalogOptions } from '../../lib/mockCatalog'
import { buildPayload } from '../../lib/runtimePayload'
import { validateRuntime } from '../../lib/runtimeValidation'
import { valoresEnUso } from '../../lib'
import { useFormStore } from '../../store'
import type { ExportedField } from '../../types'
import type { FormPreviewApi } from '../../types'
import type {
  PreviewState,
  RuntimeContext,
  RuntimeModel,
  RuntimeSnapshot,
  RuntimeValues,
} from '../../types'
import { emptyGroupItem, reconcileState } from './useFormPreview.utils'

// Unico contacto del simulador con el store, solo para buildFormExport. Las respuestas viven en el
// arbol, nunca en el store.
export function useFormPreview(): FormPreviewApi {
  const formSteps = useFormStore((state) => state.formSteps)
  const setupConfig = useFormStore((state) => state.setupConfig)
  const introSteps = useFormStore((state) => state.introModal.steps)
  const catalogBank = useFormStore((state) => state.catalogBank)
  const formScript = useFormStore((state) => state.formScript)
  const maxDates = useFormStore((state) => state.maxDates)
  const valores = useFormStore((state) => state.valores)

  // El simulador solo ve el JSON exportado: si falta algo en el contrato, se rompe aca como en el
  // consumidor.
  const model: RuntimeModel = useMemo(
    () => buildRuntimeModel(buildFormExport(formSteps, setupConfig, introSteps, formScript)),
    [formSteps, setupConfig, introSteps, formScript],
  )

  const [state, setState] = useState<PreviewState>(() => createInitialState(model))
  // Errores revelados por clave: un campo al que no se llego nunca aparece en rojo.
  const [revealed, setRevealed] = useState<Record<string, boolean>>({})

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reconcilia las respuestas cuando cambia el modelo
    setState((previous) => reconcileState(model, previous))
  }, [model])

  // Las tablas entran por fuera del modelo, como al consumidor. Aca se elige que lista de
  // vencimientos aplica.
  const context: RuntimeContext = useMemo(() => {
    const ahora = new Date()

    return {
      reglas: maxDatesEnUso(maxDates, ahora.getFullYear())[model.declaracion],
      hoy: enTexto(ahora),
      valores: valoresEnUso(valores),
    }
  }, [maxDates, valores, model.declaracion])

  const snapshot: RuntimeSnapshot = useMemo(
    () => resolveRuntime(model, state, context),
    [model, state, context],
  )
  const validation = useMemo(
    () => validateRuntime(model, snapshot, context),
    [model, snapshot, context],
  )
  const payload = useMemo(() => buildPayload(model, snapshot), [model, snapshot])

  const setValue = useCallback(
    (name: string, value: unknown, groupId?: string, index?: number) => {
      setState((previous) => {
        const item: RuntimeValues =
          groupId !== undefined && index !== undefined
            ? (previous.groups[groupId]?.[index] ?? {})
            : {}
        const field: ExportedField | undefined = model.fieldsByName.get(name)

        // Las columnas de la opcion elegida se copian en el mismo ambito (la tarifa de la fila 3,
        // no de la 1). El catalogo solo se arma si el campo declara rellenos: esto corre en cada
        // tecla.
        const filled: RuntimeValues =
          field && hasFills(field)
            ? resolveFills(
                field,
                value,
                catalogOptions(field, { ...previous.values, ...item }, catalogBank),
              )
            : {}

        if (groupId === undefined || index === undefined) {
          return { ...previous, values: { ...previous.values, [name]: value, ...filled } }
        }

        const items = [...(previous.groups[groupId] ?? [])]
        items[index] = { ...items[index], [name]: value, ...filled }

        return { ...previous, groups: { ...previous.groups, [groupId]: items } }
      })
    },
    [model, catalogBank],
  )

  const addGroupItem = useCallback(
    (groupId: string) => {
      setState((previous) => ({
        ...previous,
        groups: {
          ...previous.groups,
          [groupId]: [...(previous.groups[groupId] ?? []), emptyGroupItem(model, groupId)],
        },
      }))
    },
    [model],
  )

  const removeGroupItem = useCallback((groupId: string, index: number) => {
    setState((previous) => ({
      ...previous,
      groups: {
        ...previous.groups,
        [groupId]: (previous.groups[groupId] ?? []).filter((_, position) => position !== index),
      },
    }))
  }, [])

  const validateKeys = useCallback(
    (keys: string[]): boolean => {
      setRevealed((previous) => {
        const next: Record<string, boolean> = { ...previous }
        for (const key of keys) next[key] = true

        return next
      })

      return keys.every((key) => validation.errors[key] === undefined)
    },
    [validation.errors],
  )

  const reset = useCallback(() => {
    setState(createInitialState(model))
    setRevealed({})
  }, [model])

  return {
    model,
    catalogBank,
    state,
    snapshot,
    errors: validation.errors,
    issues: validation.issues,
    payload,
    revealed,
    setValue,
    addGroupItem,
    removeGroupItem,
    validateKeys,
    reset,
  }
}
