import { v4 as uuidv4 } from 'uuid'

// Migraciones sobre el objeto crudo; el schema decide despues. Un hueco en la cadena deja el diseno
// sin leer (empieza en blanco).

type Raw = Record<string, unknown>

function isRecord(value: unknown): value is Raw {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

// 1 → 2: la hoja pasa de una tabla a bloques; el texto de la celda a content y su ancho a las
// columnas.
function v1ToV2(design: Raw): Raw {
  const sheets = asArray(design.sheets).map((sheet) => {
    if (!isRecord(sheet)) return sheet
    const rows = asArray(sheet.rows)
    if (rows.length === 0) return { id: sheet.id, blocks: [] }

    const firstCells = isRecord(rows[0]) ? asArray(rows[0].cells) : []
    const widths: (number | undefined)[] = firstCells.flatMap((cell) => {
      const span: number = isRecord(cell) && typeof cell.colSpan === 'number' ? cell.colSpan : 1
      const width: unknown = isRecord(cell) ? cell.width : undefined
      return Array.from({ length: Math.max(1, span) }, (_, i) =>
        i === 0 && span === 1 && typeof width === 'number' ? width : undefined,
      )
    })

    const table = {
      kind: 'table',
      id: uuidv4(),
      columns: (widths.length > 0 ? widths : [undefined]).map((width) =>
        width === undefined ? { id: uuidv4() } : { id: uuidv4(), width },
      ),
      rows: rows.map((row) => {
        if (!isRecord(row)) return row
        return {
          ...row,
          cells: asArray(row.cells).map((cell) => {
            if (!isRecord(cell)) return cell
            const rest: Raw = { ...cell }
            delete rest.text
            delete rest.width
            const text: string = typeof cell.text === 'string' ? cell.text : ''
            return { ...rest, content: { kind: 'text', text } }
          }),
        }
      }),
    }

    return { id: sheet.id, blocks: [table] }
  })

  return { ...design, sheets }
}

export const PDF_DESIGN_MIGRATIONS: Record<number, (design: Raw) => Raw> = {
  1: v1ToV2,
}

export function migratePdfDesign(raw: unknown, current: number): unknown {
  if (!isRecord(raw) || typeof raw.schemaVersion !== 'number') return raw

  let version: number = raw.schemaVersion
  let design: unknown = raw.design
  while (version < current) {
    const step = PDF_DESIGN_MIGRATIONS[version]
    if (!step || !isRecord(design)) return raw
    design = step(design)
    version++
  }

  return { ...raw, schemaVersion: version, design }
}
