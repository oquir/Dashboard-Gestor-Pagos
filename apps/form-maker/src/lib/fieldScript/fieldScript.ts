import { SCRIPT_PARAM_NAMES } from '../../constants/fieldScript'
import type {
  PreludeValidation,
  ScriptCompileResult,
  ScriptFunction,
  ScriptFunctionResult,
  ScriptRef,
  ScriptValidation,
} from '../../types/fieldScript'
import { scanScript } from './fieldScript.utils'

// Script de campo: de texto con {{campo}} a cuerpo ejecutable mas sus dependencias. Aca solo se
// compila y valida; ejecutar es del runtime (el consumidor usa new Function). Ninguna funcion
// lanza: el error viaja en el resultado.

// El unico sitio que escribe la sintaxis de una referencia (junto con REF_PATTERN).
export function fieldRefText(name: string): string {
  return `{{${name}}}`
}

export function unknownRefsMessage(names: string[]): string {
  const refs: string = names.map(fieldRefText).join(', ')

  return names.length === 1
    ? `${refs} no es un campo del formulario.`
    : `${refs} no son campos del formulario.`
}

// Para la migracion de la sintaxis vieja: reescribe exactamente lo que ese compilador sustituia.
export function findScriptRefs(
  source: string,
  knownNames: Set<string>,
  pattern: RegExp,
): ScriptRef[] {
  return scanScript(source, knownNames, pattern).refs
}

export function compileScript(source: string, knownNames: Set<string>): ScriptCompileResult {
  const { code, refs } = scanScript(source, knownNames)
  const reads: string[] = []
  const unknown: string[] = []
  const seen = new Set<string>()

  for (const ref of refs) {
    if (seen.has(ref.name)) continue
    seen.add(ref.name)

    if (ref.known) {
      reads.push(ref.name)
      continue
    }

    unknown.push(ref.name)
  }

  return { code, refs, reads, unknown }
}

// El preludio va delante del cuerpo: sus funciones quedan en ambito sin ceremonia, y el compilado
// se cachea por texto.
export function composeScriptBody(code: string, prelude?: string): string {
  const shared: string = prelude?.trim() ?? ''

  return shared.length === 0 ? code : `${shared}\n${code}`
}

export function buildScriptFunction(body: string): ScriptFunctionResult {
  try {
    return { fn: new Function(...SCRIPT_PARAM_NAMES, body) as ScriptFunction, error: null }
  } catch (error) {
    return { fn: null, error: error instanceof Error ? error.message : 'El script no compila.' }
  }
}

export function checkScriptSyntax(body: string): string | null {
  return buildScriptFunction(body).error
}

export function validateFieldScript(
  source: string,
  knownNames: Set<string>,
  prelude?: string,
): ScriptValidation {
  const compiled: ScriptCompileResult = compileScript(source, knownNames)
  const isEmpty: boolean = source.trim().length === 0

  if (isEmpty) return { ...compiled, error: null, isEmpty, isValid: true }

  // La referencia desconocida va antes que la sintaxis: el {{x}} sin sustituir suele romper el
  // parseo con un mensaje que no dice nada.
  if (compiled.unknown.length > 0) {
    return { ...compiled, error: unknownRefsMessage(compiled.unknown), isEmpty, isValid: false }
  }

  const ownError: string | null = checkScriptSyntax(compiled.code)
  if (ownError) return { ...compiled, error: ownError, isEmpty, isValid: false }

  // El cuerpo solo primero, para saber de quien es el error: si no, un preludio roto se reporta en
  // cuarenta campos.
  const body: string = composeScriptBody(compiled.code, prelude)
  const sharedError: string | null = body === compiled.code ? null : checkScriptSyntax(body)

  return {
    ...compiled,
    error: sharedError === null ? null : `El script del formulario no compila: ${sharedError}`,
    isEmpty,
    isValid: sharedError === null,
  }
}

// El preludio no puede leer campos: solo funciones y constantes puras (en un grupo repetible {{x}}
// no tendria respuesta unica). Con algun {{x}} no se revisa la sintaxis.
export function validatePrelude(source: string): PreludeValidation {
  // El codigo sustituido se descarta: escanear es la unica forma de ver si nombro algun campo.
  const refs: ScriptRef[] = scanScript(source, new Set<string>()).refs
  const isEmpty: boolean = source.trim().length === 0
  const error: string | null = isEmpty || refs.length > 0 ? null : checkScriptSyntax(source)

  return { refs, error, isEmpty, isValid: error === null && refs.length === 0 }
}

// Un resultado no finito sale como null (no se pudo calcular): un Infinity viajaria al payload.
export function normalizeScriptResult(value: unknown): unknown {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null

  return value
}
