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

// El guardado local del diseño del PDF: una llave de localStorage por impuesto. Es la copia de
// trabajo; lo que se publica es el .html (docs/Pendientes-PDF.md §2.1). Ni persistence ni
// exportForm nombran este modulo, asi que el diseño no se filtra al borrador ni al JSON.
// Solo lo usa el diseñador (chunk perezoso): fuera de lib/index.ts.

export function pdfDesignKey(taxType: PdfTaxType): string {
  return `${PDF_DESIGN_KEY_PREFIX}${taxType}`
}

// null cuando no hay nada guardado, o cuando lo guardado no se puede leer: otra version, otra
// forma o de otro impuesto. El diseñador empieza entonces en blanco.
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

// El mismo esquema que el guardado, para el diseño que sale de leer un .html (lib/pdfFile): asi un
// archivo editado a mano no mete en el store una forma que el guardado despues rechazaria.
export function parsePdfDesign(value: unknown): PdfDesign | null {
  const parsed = pdfDesignSchema.safeParse(value)
  return parsed.success ? parsed.data : null
}

// Las clases leidas de un .html (su data-fm-classes): las que no tienen forma se descartan una por
// una, no el archivo entero.
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

// Nunca lanza: el autoguardado corre en un temporizador y un error ahi no lo atrapa nadie. El
// caso que importa es el cupo lleno, que llega con las imagenes en base64.
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
