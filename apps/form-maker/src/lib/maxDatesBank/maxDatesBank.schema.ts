import { z } from 'zod'

const fechaLimiteSchema = z.object({
  periodo: z.number(),
  digito: z.number().optional(),
  fecha: z.string(),
})

const reglaAnioSchema = z.object({
  anio: z.number(),
  periodicidad: z.enum(['anual', 'bimestral', 'trimestral', 'mensual']),
  tipoDigito: z.enum(['ninguno', 'primer_digito', 'ultimo_digito']),
  fechas: z.array(fechaLimiteSchema),
})

// El mismo schema valida lo pegado y lo guardado.
export const fechasMaximasSchema = z.object({
  municipioId: z.union([z.number(), z.string()]),
  ica: z.array(reglaAnioSchema),
  reteica: z.array(reglaAnioSchema),
  autoretencionIca: z.array(reglaAnioSchema),
})

export const storedMaxDatesSchema = z.object({
  source: z.enum(['default', 'custom']),
  custom: fechasMaximasSchema.nullable(),
})
