// value undefined: o el script fallo (error lo dice) o pide no tocar lo que escribio el usuario.
export interface ScriptRunResult {
  value: unknown
  error: string | null
}
