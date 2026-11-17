import { z } from 'zod'
import type { PdfFontFamily, PdfTaxType } from '../../types'

// z.object quita en silencio las llaves que no declara: cada llave nueva del diseño necesita su
// linea aca, o se pierde al recargar.

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

const cellSchema = z.object({
  id: z.string(),
  colSpan: z.number().int().positive(),
  rowSpan: z.number().int().positive(),
  text: z.string(),
  width: z.number().positive().optional(),
  fontSize: z.number().positive().optional(),
  bold: z.boolean().optional(),
  align: z.enum(['left', 'center', 'right']).optional(),
  verticalAlign: z.enum(['top', 'middle', 'bottom']).optional(),
  backgroundColor: z.string().optional(),
  borders: bordersSchema.optional(),
})

const rowSchema = z.object({
  id: z.string(),
  height: z.number().positive().optional(),
  cells: z.array(cellSchema),
})

const sheetSchema = z.object({
  id: z.string(),
  rows: z.array(rowSchema),
})

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
  sheets: z.array(sheetSchema).min(1),
})

export const storedPdfDesignSchema = z.object({
  schemaVersion: z.number().int(),
  savedAt: z.string(),
  design: pdfDesignSchema,
})
