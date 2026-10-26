import { strToU8, zipSync } from 'fflate'
import type { Archivo } from '../types'

export interface ItemArchivo {
  titulo: string
  archivo?: Archivo
}

export function formatoTamano(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toLocaleString('es-CO', { maximumFractionDigits: 1 })} MB`
}

// Sin API, los archivos que se cargan en la demo se guardan en IndexedDB, en este navegador.
const BASE = 'gestor-pagos-archivos'
const ALMACEN = 'archivos'

function abrirBase() {
  return new Promise<IDBDatabase>((resolver, rechazar) => {
    const solicitud = indexedDB.open(BASE, 1)
    solicitud.onupgradeneeded = () => solicitud.result.createObjectStore(ALMACEN)
    solicitud.onsuccess = () => resolver(solicitud.result)
    solicitud.onerror = () => rechazar(solicitud.error)
  })
}

async function operar<T>(modo: IDBTransactionMode, accion: (almacen: IDBObjectStore) => IDBRequest<T>) {
  const base = await abrirBase()
  return new Promise<T>((resolver, rechazar) => {
    const solicitud = accion(base.transaction(ALMACEN, modo).objectStore(ALMACEN))
    solicitud.onsuccess = () => resolver(solicitud.result)
    solicitud.onerror = () => rechazar(solicitud.error)
  }).finally(() => base.close())
}

/** Guarda el contenido de un archivo cargado y devuelve sus datos para el estado de la demo. */
export async function guardarArchivo(archivo: File): Promise<Archivo> {
  const id = crypto.randomUUID()
  const datos: Archivo = { id, nombre: archivo.name, tamano: archivo.size, fechaCarga: new Date().toISOString().slice(0, 10) }
  try {
    await operar('readwrite', (a) => a.put(archivo, id))
  } catch {
    // Sin IndexedDB (navegación privada, almacenamiento bloqueado) se descarga el PDF de muestra.
  }
  return datos
}

async function contenidoGuardado(archivo: Archivo) {
  if (!archivo.id) return undefined
  try {
    return await operar<Blob | undefined>('readonly', (a) => a.get(archivo.id!))
  } catch {
    return undefined
  }
}

/** PDF de una página con unas líneas de texto (solo ASCII, sin fuentes incrustadas). */
function pdfDeTexto(lineas: string[]) {
  const ascii = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\x20-\x7e]/g, '?').replace(/[\\()]/g, '\\$&')
  const texto = lineas.map((l, i) => `BT /F1 ${i === 0 ? 16 : 11} Tf 60 ${760 - i * 22} Td (${ascii(l)}) Tj ET`).join('\n')
  const objetos = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${texto.length} >>\nstream\n${texto}\nendstream`,
  ]
  let pdf = '%PDF-1.4\n'
  const posiciones = objetos.map((o, i) => {
    const pos = pdf.length
    pdf += `${i + 1} 0 obj\n${o}\nendobj\n`
    return pos
  })
  const xref = pdf.length
  pdf += `xref\n0 ${objetos.length + 1}\n0000000000 65535 f \n${posiciones.map((p) => `${String(p).padStart(10, '0')} 00000 n \n`).join('')}`
  pdf += `trailer\n<< /Size ${objetos.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`
  return pdf
}

/** Los archivos de los datos generados no tienen contenido: se descarga un PDF que dice qué documento es y de quién. */
function pdfDeMuestra(archivo: Archivo, titulo: string, contexto: string[]) {
  return pdfDeTexto([titulo, ...contexto, '', `Archivo: ${archivo.nombre}`, `Cargado el ${archivo.fechaCarga}`, '', 'Documento de muestra generado por la demo.'])
}

export function descargarBlob(blob: Blob, nombre: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nombre
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Descarga un archivo: el contenido cargado si existe, o el PDF de muestra. */
export async function descargarArchivo(archivo: Archivo, titulo: string, contexto: string[]) {
  const guardado = await contenidoGuardado(archivo)
  descargarBlob(guardado ?? new Blob([pdfDeMuestra(archivo, titulo, contexto)], { type: 'application/pdf' }), archivo.nombre)
}

/** Empaqueta en un solo .zip todos los archivos cargados. */
export async function descargarZip(nombreZip: string, items: { titulo: string; archivo: Archivo }[], contexto: string[]) {
  const entradas = await Promise.all(
    items.map(async ({ titulo, archivo }) => {
      const guardado = await contenidoGuardado(archivo)
      return [archivo.nombre, guardado ? new Uint8Array(await guardado.arrayBuffer()) : strToU8(pdfDeMuestra(archivo, titulo, contexto))] as const
    }),
  )
  const zip = zipSync(Object.fromEntries(entradas))
  descargarBlob(new Blob([zip as Uint8Array<ArrayBuffer>], { type: 'application/zip' }), nombreZip)
}
