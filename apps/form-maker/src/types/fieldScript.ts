// start en la primera llave y end tras la ultima: el editor decora el tramo completo.
export interface ScriptRef {
  name: string
  start: number
  end: number
  known: boolean
}

export interface ScriptCompileResult {
  // Cuerpo para new Function, con las referencias ya sustituidas.
  code: string
  refs: ScriptRef[]
  reads: string[]
  unknown: string[]
}

export interface ScriptValidation extends ScriptCompileResult {
  error: string | null
  isEmpty: boolean
  isValid: boolean
}

export interface PreludeValidation {
  // En el preludio toda {{x}} es ilegal: viajan para poder nombrarlas.
  refs: ScriptRef[]
  error: string | null
  isEmpty: boolean
  isValid: boolean
}

export type ScriptFunction = (...args: unknown[]) => unknown

export interface ScriptFunctionResult {
  fn: ScriptFunction | null
  error: string | null
}
