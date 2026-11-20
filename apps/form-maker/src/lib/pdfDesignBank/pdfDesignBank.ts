import type {
  PdfClass,
  PdfComponent,
  PdfDesign,
  PdfSaveResult,
  PdfTaxType,
  StoredPdfDesign,
} from '../../types'
import {
  PDF_DESIGN_KEY_PREFIX,
  PDF_DESIGN_SCHEMA_VERSION,
  QUOTA_MESSAGE,
  SAVE_FAILED_MESSAGE,
} from './pdfDesignBank.constants'
import { migratePdfDesign } from './pdfDesignBank.migrations'
import {
  pdfClassSchema,
  pdfComponentSchema,
  pdfDesignSchema,
  storedPdfDesignSchema,
} from './pdfDesignBank.schema'

// Guardado local del diseno, una llave por impuesto: es la copia de trabajo; lo publicado es el
// .html. Ni persistence ni exportForm lo nombran. Fuera de lib/index.ts.

export function pdfDesignKey(taxType: PdfTaxType): string {
  return `${PDF_DESIGN_KEY_PREFIX}${taxType}`
}

// null si no hay nada o no se puede leer: el disenador empieza en blanco.
export function loadPdfDesign(taxType: PdfTaxType): StoredPdfDesign | null {
  let raw: string | null
  try {
    raw = localStorage.getItem(pdfDesignKey(taxType))
  } catch {
    return null
  }
  if (!raw) return null

  try {
    // Migrar antes de validar: al reves, se descartaria justo lo que la migracion puede salvar.
    const migrated: unknown = migratePdfDesign(JSON.parse(raw), PDF_DESIGN_SCHEMA_VERSION)
    const parsed = storedPdfDesignSchema.safeParse(migrated)
    if (!parsed.success) return null
    if (parsed.data.schemaVersion !== PDF_DESIGN_SCHEMA_VERSION) return null
    if (parsed.data.design.taxType !== taxType) return null

    return parsed.data
  } catch {
    return null
  }
}

// El mismo esquema para el diseno leido de un .html: un archivo editado a mano no mete una forma
// que el guardado rechazaria.
export function parsePdfDesign(value: unknown): PdfDesign | null {
  const parsed = pdfDesignSchema.safeParse(value)
  return parsed.success ? parsed.data : null
}

// Las clases sin forma se descartan una por una.
export function parsePdfClasses(value: unknown): PdfClass[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((item) => {
    const parsed = pdfClassSchema.safeParse(item)
    return parsed.success ? [parsed.data] : []
  })
}

// Un componente leido de un .html (su JSON de data-fm-config), con el mismo esquema que el guardado.
export function parsePdfComponent(value: unknown): PdfComponent | null {
  const parsed = pdfComponentSchema.safeParse(value)
  return parsed.success ? parsed.data : null
}

// Nunca lanza: corre en un temporizador. El caso real es el cupo lleno por los base64.
export function savePdfDesign(
  design: PdfDesign,
  now: Date = new Date(),
  version: number | null = null,
): PdfSaveResult {
  const savedAt: string = now.toISOString()
  const stored: StoredPdfDesign = { schemaVersion: PDF_DESIGN_SCHEMA_VERSION, savedAt, design }
  if (version !== null) stored.version = version

  try {
    localStorage.setItem(pdfDesignKey(design.taxType), JSON.stringify(stored))
    return { ok: true, savedAt }
  } catch (error) {
    const isQuota: boolean = error instanceof DOMException && error.name === 'QuotaExceededError'
    return { ok: false, error: isQuota ? QUOTA_MESSAGE : SAVE_FAILED_MESSAGE }
  }
}
