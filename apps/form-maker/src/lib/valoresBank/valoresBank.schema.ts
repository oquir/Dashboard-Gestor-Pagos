import { z } from 'zod'

// El mismo schema valida lo pegado y lo guardado.
export const valorAnualSchema = z.object({
  anio: z.number().int().positive(),
  uvt: z.number().nonnegative(),
  smmlv: z.number().nonnegative(),
})

export const valoresAnualesSchema = z.array(valorAnualSchema)

export const storedValoresSchema = z.object({
  source: z.enum(['default', 'custom']),
  custom: valoresAnualesSchema.nullable(),
})
