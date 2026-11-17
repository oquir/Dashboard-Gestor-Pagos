import { z } from 'zod'
import type { PdfCell, PdfFontFamily, PdfTable, PdfTaxType } from '../../types'

// z.object quita en silencio las llaves que no declara: cada llave nueva del diseño necesita su
// linea aca, o se pierde al recargar. Valida la version actual; las viejas pasan antes por
// pdfDesignBank.migrations.ts.

const TAX_TYPES: [PdfTaxType, ...PdfTaxType[]] = [
  'industria_comercio',
  'retencion_industria_comercio',
  'autorretencion',
]

const FONT_FAMILIES: [PdfFontFamily, ...PdfFontFamily[]] = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Courier New',
  'Verdana',
  'Tahoma',
]

const bordersSchema = z.object({
  top: z.boolean(),
  right: z.boolean(),
  bottom: z.boolean(),
  left: z.boolean(),
})

// Recursiva: una celda puede llevar una tabla, que lleva celdas. z.lazy corta el ciclo.
const cellSchema: z.ZodType<PdfCell> = z.object({
  id: z.string(),
  colSpan: z.number().int().positive(),
  rowSpan: z.number().int().positive(),
  content: z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('text'), text: z.string() }),
    z.object({ kind: z.literal('html'), html: z.string() }),
    z.object({ kind: z.literal('table'), table: z.lazy(() => tableSchema) }),
  ]),
  fontSize: z.number().positive().optional(),
  bold: z.boolean().optional(),
  italic: z.boolean().optional(),
  align: z.enum(['left', 'center', 'right']).optional(),
  verticalAlign: z.enum(['top', 'middle', 'bottom']).optional(),
  backgroundColor: z.string().optional(),
  borders: bordersSchema.optional(),
  className: z.string().optional(),
  style: z.string().optional(),
})

const tableShape = {
  id: z.string(),
  columns: z.array(z.object({ id: z.string(), width: z.number().positive().optional() })).min(1),
  rows: z
    .array(
      z.object({
        id: z.string(),
        height: z.number().positive().optional(),
        cells: z.array(cellSchema),
      }),
    )
    .min(1),
  className: z.string().optional(),
  style: z.string().optional(),
}

const tableSchema: z.ZodType<PdfTable> = z.object(tableShape)

const blockSchema = z.discriminatedUnion('kind', [
  z.object({ ...tableShape, kind: z.literal('table') }),
  z.object({ kind: z.literal('html'), id: z.string(), html: z.string() }),
])

const marginsSchema = z.object({
  top: z.number().nonnegative(),
  right: z.number().nonnegative(),
  bottom: z.number().nonnegative(),
  left: z.number().nonnegative(),
})

export const pdfDesignSchema = z.object({
  taxType: z.enum(TAX_TYPES),
  fontFamily: z.enum(FONT_FAMILIES),
  fontSize: z.number().positive(),
  margins: marginsSchema,
  // Al menos una hoja: un diseño sin hojas no tiene donde pintarse.
  sheets: z.array(z.object({ id: z.string(), blocks: z.array(blockSchema) })).min(1),
})

export const storedPdfDesignSchema = z.object({
  schemaVersion: z.number().int(),
  savedAt: z.string(),
  design: pdfDesignSchema,
})
