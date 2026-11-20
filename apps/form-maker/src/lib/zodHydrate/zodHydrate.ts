import { z } from 'zod'
import type { ExportedField } from '../../types'
import type { RuntimeIssue } from '../../types'

export interface HydratedSchema {
  schema: z.ZodType | null
  error: string | null
}

// El unico camino del consumidor: el export lleva el schema como string. El fallo vuelve como
// texto: un schema roto es problema de ese campo.
export function hydrateZodSchema(source: string | undefined): HydratedSchema {
  if (!source || source.trim() === '') return { schema: null, error: null }

  try {
    const factory = new Function('z', `return (${source});`) as (zod: typeof z) => z.ZodType
    const schema: z.ZodType = factory(z)

    if (typeof schema?.safeParse !== 'function') {
      return { schema: null, error: 'El schema no produjo un validador de Zod.' }
    }

    return { schema, error: null }
  } catch (error) {
    return { schema: null, error: error instanceof Error ? error.message : String(error) }
  }
}

// Por texto del schema: un campo con variantes tiene varios, y dos campos iguales comparten
// validador.
export function hydrateFieldSchemas(fields: ExportedField[]): {
  schemas: Map<string, z.ZodType>
  issues: RuntimeIssue[]
} {
  const schemas: Map<string, z.ZodType> = new Map()
  const issues: RuntimeIssue[] = []

  for (const field of fields) {
    const sources: (string | undefined)[] = [
      field.validations.zodSchema,
      ...(field.validations.zodSchemaWhen ?? []).map((variant) => variant.zodSchema),
    ]

    for (const source of sources) {
      if (source === undefined || schemas.has(source)) continue

      const { schema, error } = hydrateZodSchema(source)

      if (error) {
        issues.push({ kind: 'schema', field: field.name, message: error })
        continue
      }

      if (schema) schemas.set(source, schema)
    }
  }

  return { schemas, issues }
}

export function firstZodMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Valor inválido'
}
