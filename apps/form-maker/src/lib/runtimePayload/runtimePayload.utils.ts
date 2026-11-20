import type { ExportedField } from '../../types/exportForm'
import type { ConceptoPayload } from '../../types/fieldConcept'
import { isValidConceptId } from '../fieldConcept/fieldConcept'

// Escritura por ruta ("contribuyente.x", "actividades[0].y"), creando los tramos que falten.

export const ARRAY_MARKER = '[]'

interface PathSegment {
  key: string
  index: number | null
}

export function parsePath(path: string): PathSegment[] {
  return path
    .split('.')
    .filter((part) => part.length > 0)
    .map((part) => {
      const match: RegExpMatchArray | null = part.match(/^(.*?)\[(\d+)\]$/)

      return match
        ? { key: match[1], index: Number.parseInt(match[2], 10) }
        : { key: part, index: null }
    })
}

export function setDeepValue(target: Record<string, unknown>, path: string, value: unknown): void {
  const segments: PathSegment[] = parsePath(path)
  if (segments.length === 0) return

  let cursor: Record<string, unknown> = target

  segments.forEach((segment, position) => {
    const isLast: boolean = position === segments.length - 1

    if (segment.index === null) {
      if (isLast) {
        cursor[segment.key] = value
        return
      }

      if (typeof cursor[segment.key] !== 'object' || cursor[segment.key] === null) {
        cursor[segment.key] = {}
      }
      cursor = cursor[segment.key] as Record<string, unknown>
      return
    }

    // Rellena hasta el indice: las repeticiones no llegan en orden y el array no puede quedar
    // disperso.
    if (!Array.isArray(cursor[segment.key])) cursor[segment.key] = []
    const list = cursor[segment.key] as Record<string, unknown>[]
    while (list.length <= segment.index) list.push({})

    if (isLast) {
      list[segment.index] = value as Record<string, unknown>
      return
    }

    cursor = list[segment.index]
  })
}

// Concepto con su valor convertido, o null si no hay nada. Reglas del contrato con el backend,
// leidas solo del export. Sin respuesta no viaja.
export function conceptEntry(field: ExportedField, value: unknown): ConceptoPayload | null {
  const binding = field.apiBinding
  if (binding?.kind !== 'concept' || !isValidConceptId(binding.idConcepto)) return null

  const idConcepto: number = binding.idConcepto

  switch (binding.tipo) {
    case 'texto': {
      const text: string = value === undefined || value === null ? '' : optionText(field, value)
      return text.trim() === '' ? null : { idConcepto, tipo: 'texto', valorTexto: text }
    }
    case 'numero':
      return typeof value === 'number' && Number.isFinite(value)
        ? { idConcepto, tipo: 'numero', valorNumero: value }
        : null
    // Desmarcado tambien es una respuesta, asi que el checkbox viaja siempre.
    case 'booleano':
      return { idConcepto, tipo: 'booleano', valorBooleano: value === true }
    case 'lista': {
      const items: string[] = Array.isArray(value)
        ? value.map((item: unknown) => optionText(field, item))
        : []
      return items.length > 0 ? { idConcepto, tipo: 'lista', valorLista: items } : null
    }
    // El nombre del archivo; el binario viaja aparte.
    case 'archivo':
      return value instanceof File ? { idConcepto, tipo: 'archivo', valorTexto: value.name } : null
  }
}

// Opciones a mano: viaja el texto (su uuid no lo conoce el backend). Las de catalogo van con su id.
function optionText(field: ExportedField, value: unknown): string {
  const id: string = String(value)

  return field.options?.find((option) => option.id === id)?.label ?? id
}
