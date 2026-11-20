import { SCRIPT_VALUES_PARAM } from '../../constants/fieldScript'
import type { ScriptRef } from '../../types/fieldScript'
import { REF_PATTERN } from './fieldScript.constants'
import type { ScanFrame, ScanResult } from './fieldScript.types'

// Recorre la fuente distinguiendo codigo de texto: sustituir con regex rompia un {{x}} dentro de un
// string, y uno en un comentario inventaba una dependencia. Limite conocido: no detecta regex
// literales.

// Corta en el salto de linea si el string no cierra: una comilla suelta no se traga el resto.
function skipQuoted(source: string, start: number, quote: string): number {
  let i: number = start + 1

  while (i < source.length) {
    const char: string = source[i]

    if (char === '\\') {
      i += 2
      continue
    }

    if (char === quote) return i + 1
    if (char === '\n') return i

    i += 1
  }

  return source.length
}

// El patron es parametro por la migracion de la sintaxis vieja; tiene que ser sticky.
export function scanScript(
  source: string,
  knownNames: Set<string>,
  pattern: RegExp = REF_PATTERN,
): ScanResult {
  const refs: ScriptRef[] = []
  const pieces: string[] = []
  const stack: ScanFrame[] = [{ kind: 'code', depth: 0 }]
  let copied = 0
  let i = 0

  while (i < source.length) {
    const frame: ScanFrame = stack[stack.length - 1]
    const char: string = source[i]

    if (frame.kind === 'template') {
      if (char === '\\') {
        i += 2
        continue
      }

      if (char === '`') {
        stack.pop()
        i += 1
        continue
      }

      // Dentro de ${...} se vuelve a codigo, asi que ahi una referencia si vale.
      if (char === '$' && source[i + 1] === '{') {
        stack.push({ kind: 'code', depth: 0 })
        i += 2
        continue
      }

      i += 1
      continue
    }

    if (char === '/' && source[i + 1] === '/') {
      const end: number = source.indexOf('\n', i + 2)
      i = end === -1 ? source.length : end
      continue
    }

    if (char === '/' && source[i + 1] === '*') {
      const end: number = source.indexOf('*/', i + 2)
      i = end === -1 ? source.length : end + 2
      continue
    }

    if (char === "'" || char === '"') {
      i = skipQuoted(source, i, char)
      continue
    }

    if (char === '`') {
      stack.push({ kind: 'template', depth: 0 })
      i += 1
      continue
    }

    if (char === '{') {
      pattern.lastIndex = i
      const match: RegExpExecArray | null = pattern.exec(source)

      if (match) {
        const name: string = match[1]
        const known: boolean = knownNames.has(name)
        refs.push({ name, start: i, end: i + match[0].length, known })

        // Solo se sustituye un campo real; un {{x}} desconocido queda intacto en refs y
        // validateFieldScript lo da como error.
        if (known) {
          pieces.push(source.slice(copied, i), `${SCRIPT_VALUES_PARAM}[${JSON.stringify(name)}]`)
          i += match[0].length
          copied = i
          continue
        }
      }

      frame.depth += 1
      i += 1
      continue
    }

    if (char === '}') {
      // Con el contador en cero esta llave cierra el ${} que abrio este tramo, no una del codigo.
      if (frame.depth === 0 && stack.length > 1) {
        stack.pop()
      } else {
        frame.depth = Math.max(0, frame.depth - 1)
      }

      i += 1
      continue
    }

    i += 1
  }

  pieces.push(source.slice(copied))

  return { code: pieces.join(''), refs }
}
