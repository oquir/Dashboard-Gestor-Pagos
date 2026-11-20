import { toScriptNumber } from '../../constants'
import { NUMERIC_FIELD_TYPES } from '../../constants'
import type { ScriptFunction, ScriptFunctionResult } from '../../types'
import type { RuntimeContext } from '../../types'
import { buildScriptFunction, composeScriptBody } from '../fieldScript'

// Sin tabla los helpers de fecha devuelven null y 0: un formulario sin fechas corre igual.
export const EMPTY_CONTEXT: RuntimeContext = { reglas: [], hoy: '', valores: [] }

// Cache de compilacion por el cuerpo compuesto (preludio incluido): sin ella habria un new Function
// por campo en cada tecla. A nivel de modulo a proposito.
const CACHE: Map<string, ScriptFunction | null> = new Map()

// El error se guarda aparte: en la cache un fallo es null, y sin esto se recompilaria el script
// roto en cada tecla.
const ERRORS: Map<string, string> = new Map()

export function compileCached(compiled: string, prelude: string): ScriptFunctionResult {
  const body: string = composeScriptBody(compiled, prelude)
  const cached: ScriptFunction | null | undefined = CACHE.get(body)

  if (cached !== undefined) return { fn: cached, error: cached ? null : (ERRORS.get(body) ?? null) }

  const built: ScriptFunctionResult = buildScriptFunction(body)
  CACHE.set(body, built.fn)
  if (built.error) ERRORS.set(body, built.error)

  return built
}

// Coaccionado por tipo: sin esto "5" + "3" daria "53", que no falla, miente.
export function coerceForScript(value: unknown, type: string): unknown {
  // Una columna de grupo llega como array: elemento por elemento.
  if (Array.isArray(value)) return value.map((item) => coerceForScript(item, type))
  if (NUMERIC_FIELD_TYPES.includes(type)) return toScriptNumber(value)
  if (type === 'checkbox') return Boolean(value)

  return value
}
