import { SCRIPT_HELPER_VALUES } from '../../constants'
import type { ScriptFunctionResult } from '../../types'
import type { RuntimeContext, RuntimeModel, RuntimeValues } from '../../types'
import type { ScriptRunResult } from '../../types'
import { normalizeScriptResult } from '../fieldScript'
import { buildDateHelpers } from '../scriptDates'
import { buildValueHelpers } from '../scriptValores'
import { coerceForScript, compileCached, EMPTY_CONTEXT } from './scriptRuntime.utils'

// Ejecuta el script de un campo con new Function: unico sitio que corre codigo del autor, sin
// aislamiento (autor y consumidor son la misma persona). Contiene los errores; un bucle infinito
// no.

export function runFieldScript(
  compiled: string,
  prelude: string,
  values: RuntimeValues,
  value: unknown,
  index: number,
  context: RuntimeContext = EMPTY_CONTEXT,
): ScriptRunResult {
  const built: ScriptFunctionResult = compileCached(compiled, prelude)
  if (!built.fn) return { value: undefined, error: built.error }

  try {
    // Los de contexto al final, armados por corrida, en el orden de SCRIPT_PARAM_NAMES (ver
    // CONTEXT_HELPER_NAMES).
    const result: unknown = built.fn(
      values,
      value,
      index,
      ...SCRIPT_HELPER_VALUES,
      ...buildDateHelpers(context),
      ...buildValueHelpers(context),
    )

    return { value: normalizeScriptResult(result), error: null }
  } catch (error) {
    return { value: undefined, error: error instanceof Error ? error.message : String(error) }
  }
}

// Toda la vista coaccionada de una vez: un script lee a sus vecinos.
export function coerceValues(values: RuntimeValues, model: RuntimeModel): RuntimeValues {
  const coerced: RuntimeValues = {}

  // Todo el modelo y no solo las claves de values: un campo sin tocar daria undefined, y en una
  // resta NaN apaga la cadena (asi el 35 dejaba en null al 38).
  for (const [name, field] of model.fieldsByName) {
    coerced[name] = coerceForScript(values[name], field.type)
  }

  // Lo que venga por fuera del modelo pasa tal cual: no hay tipo con el que coaccionarlo.
  for (const name of Object.keys(values)) {
    if (!model.fieldsByName.has(name)) coerced[name] = values[name]
  }

  return coerced
}

export { coerceForScript }
