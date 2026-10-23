// Plantilla de Excel con la que los funcionarios cargan las actividades y tarifas de un año gravable.
import type { Sector, Tarifa } from '../types'
import { descargarBlob } from './archivos'
import { crearXlsx, leerXlsx } from './excel'
import { etiquetaSector, normalizar } from './formato'

const ENCABEZADOS = ['CIIU', 'Descripción', 'Sector', 'Tarifa (por mil)']

const SECTOR_POR_NOMBRE = new Map(Object.keys(etiquetaSector).map((s) => [normalizar(s), s as Sector]))

/** Descarga la plantilla con las actividades dadas, para que solo se ajuste lo que cambió. */
export function descargarPlantilla(vigencia: number, tarifas: Tarifa[]) {
  const filas = [ENCABEZADOS, ...tarifas.map((t) => [t.ciiu, t.descripcion, etiquetaSector[t.sector], t.porMil])]
  const libro = crearXlsx({
    nombre: `Actividades ${vigencia}`,
    filas,
    anchos: [10, 60, 14, 16],
    columnasTexto: [0],
    lista: { columna: 2, valores: Object.values(etiquetaSector) },
  })
  descargarBlob(libro, `actividades_${vigencia}.xlsx`)
}

/** Lee la plantilla diligenciada. Si hay errores no devuelve actividades: el archivo se corrige y se vuelve a cargar. */
export async function leerPlantilla(archivo: File): Promise<{ tarifas: Tarifa[]; errores: string[] }> {
  let filas: ReturnType<typeof leerXlsx>
  try {
    filas = leerXlsx(new Uint8Array(await archivo.arrayBuffer()))
  } catch {
    return { tarifas: [], errores: ['No se pudo leer el archivo. Carga la plantilla en formato Excel (.xlsx).'] }
  }
  const [encabezado, ...resto] = filas
  if (normalizar(encabezado?.celdas[0] ?? '') !== 'ciiu') {
    return { tarifas: [], errores: [`El archivo no tiene el formato de la plantilla: la primera fila debe traer ${ENCABEZADOS.join(', ')}.`] }
  }

  const tarifas: Tarifa[] = []
  const errores: string[] = []
  const vistos = new Set<string>()
  for (const { numero, celdas } of resto) {
    const [codigo = '', descripcion = '', nombreSector = '', valor = ''] = celdas.map((c) => c.trim())
    if (!codigo && !descripcion && !nombreSector && !valor) continue
    // Si Excel guardó el código como número, recupera los ceros a la izquierda.
    const ciiu = /^\d{1,4}$/.test(codigo) ? codigo.padStart(4, '0') : codigo
    const sector = SECTOR_POR_NOMBRE.get(normalizar(nombreSector))
    const porMil = Math.round(Number(valor.replace(',', '.')) * 1000) / 1000
    const problemas: string[] = []
    if (!/^\d{4}$/.test(ciiu)) problemas.push('el CIIU debe tener 4 dígitos')
    else if (vistos.has(ciiu)) problemas.push(`el CIIU ${ciiu} está repetido`)
    if (!descripcion) problemas.push('falta la descripción')
    if (!sector) problemas.push(`el sector debe ser ${Object.values(etiquetaSector).join(', ')}`)
    if (valor === '' || !Number.isFinite(porMil) || porMil < 0) problemas.push('la tarifa debe ser un número mayor o igual a 0')
    vistos.add(ciiu)
    if (problemas.length > 0 || !sector) errores.push(`Fila ${numero}: ${problemas.join('; ')}.`)
    else tarifas.push({ ciiu, descripcion, sector, porMil })
  }
  if (errores.length === 0 && tarifas.length === 0) errores.push('El archivo no trae actividades.')
  return { tarifas: errores.length > 0 ? [] : tarifas, errores }
}
