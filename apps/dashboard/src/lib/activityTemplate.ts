// Plantilla de Excel con la que los funcionarios cargan las actividades y tarifas de un año gravable.
import type { Sector, Rate } from '../types'
import { downloadBlob } from './files'
import { createXlsx, readXlsx } from './excel'
import { sectorLabel, normalize } from './format'

const HEADERS = ['CIIU', 'Descripción', 'Sector', 'Tarifa (por mil)']

const SECTOR_BY_NAME = new Map(Object.keys(sectorLabel).map((s) => [normalize(s), s as Sector]))

/** Descarga la plantilla con las actividades dadas, para que solo se ajuste lo que cambió. */
export function downloadTemplate(fiscalYear: number, rates: Rate[]) {
  const rows = [
    HEADERS,
    ...rates.map((t) => [t.ciiu, t.description, sectorLabel[t.sector], t.perThousand]),
  ]
  const workbook = createXlsx({
    name: `Actividades ${fiscalYear}`,
    rows,
    widths: [10, 60, 14, 16],
    textColumns: [0],
    list: { column: 2, values: Object.values(sectorLabel) },
  })
  downloadBlob(workbook, `actividades_${fiscalYear}.xlsx`)
}

/** Lee la plantilla diligenciada. Si hay errores no devuelve actividades: el archivo se corrige y se vuelve a cargar. */
export async function readTemplate(file: File): Promise<{ rates: Rate[]; errors: string[] }> {
  let rows: ReturnType<typeof readXlsx>
  try {
    rows = readXlsx(new Uint8Array(await file.arrayBuffer()))
  } catch {
    return {
      rates: [],
      errors: ['No se pudo leer el archivo. Carga la plantilla en formato Excel (.xlsx).'],
    }
  }
  const [heading, ...rest] = rows
  if (normalize(heading?.cells[0] ?? '') !== 'ciiu') {
    return {
      rates: [],
      errors: [
        `El archivo no tiene el formato de la plantilla: la primera fila debe traer ${HEADERS.join(', ')}.`,
      ],
    }
  }

  const rates: Rate[] = []
  const errors: string[] = []
  const vistos = new Set<string>()
  for (const { number, cells } of rest) {
    const [code = '', description = '', sectorName = '', value = ''] = cells.map((c) => c.trim())
    if (!code && !description && !sectorName && !value) continue
    // Si Excel guardó el código como número, recupera los ceros a la izquierda.
    const ciiu = /^\d{1,4}$/.test(code) ? code.padStart(4, '0') : code
    const sector = SECTOR_BY_NAME.get(normalize(sectorName))
    const perThousand = Math.round(Number(value.replace(',', '.')) * 1000) / 1000
    const problems: string[] = []
    if (!/^\d{4}$/.test(ciiu)) problems.push('el CIIU debe tener 4 dígitos')
    else if (vistos.has(ciiu)) problems.push(`el CIIU ${ciiu} está repetido`)
    if (!description) problems.push('falta la descripción')
    if (!sector) problems.push(`el sector debe ser ${Object.values(sectorLabel).join(', ')}`)
    if (value === '' || !Number.isFinite(perThousand) || perThousand < 0)
      problems.push('la tarifa debe ser un número mayor o igual a 0')
    vistos.add(ciiu)
    if (problems.length > 0 || !sector) errors.push(`Fila ${number}: ${problems.join('; ')}.`)
    else rates.push({ ciiu, description, sector, perThousand })
  }
  if (errors.length === 0 && rates.length === 0) errors.push('El archivo no trae actividades.')
  return { rates: errors.length > 0 ? [] : rates, errors }
}
