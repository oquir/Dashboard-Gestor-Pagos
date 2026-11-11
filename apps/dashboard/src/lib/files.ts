import { strToU8, zipSync } from 'fflate'
import type { StoredFile } from '../types'

export interface FileItem {
  title: string
  file?: StoredFile
}

export function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toLocaleString('es-CO', { maximumFractionDigits: 1 })} MB`
}

// Sin API, los archivos que se cargan en la demo se guardan en IndexedDB, en este navegador.
const BASE = 'gestor-pagos-archivos'
const STORAGE = 'archivos'

function openBase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const application = indexedDB.open(BASE, 1)
    application.onupgradeneeded = () => application.result.createObjectStore(STORAGE)
    application.onsuccess = () => resolve(application.result)
    application.onerror = () => reject(application.error)
  })
}

async function operate<T>(
  mode: IDBTransactionMode,
  action: (storage: IDBObjectStore) => IDBRequest<T>,
) {
  const base = await openBase()
  return new Promise<T>((resolve, reject) => {
    const application = action(base.transaction(STORAGE, mode).objectStore(STORAGE))
    application.onsuccess = () => resolve(application.result)
    application.onerror = () => reject(application.error)
  }).finally(() => base.close())
}

/** Guarda el contenido de un archivo cargado y devuelve sus datos para el estado de la demo. */
export async function saveFile(file: File): Promise<StoredFile> {
  const id = crypto.randomUUID()
  const data: StoredFile = {
    id,
    name: file.name,
    size: file.size,
    uploadDate: new Date().toISOString().slice(0, 10),
  }
  try {
    await operate('readwrite', (a) => a.put(file, id))
  } catch {
    // Sin IndexedDB (navegación privada, almacenamiento bloqueado) se descarga el PDF de muestra.
  }
  return data
}

async function savedContent(file: StoredFile) {
  if (!file.id) return undefined
  try {
    return await operate<Blob | undefined>('readonly', (a) => a.get(file.id!))
  } catch {
    return undefined
  }
}

/** PDF de una página con unas líneas de texto (solo ASCII, sin fuentes incrustadas). */
function textPdf(textLines: string[]) {
  const ascii = (t: string) =>
    t
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^\x20-\x7e]/g, '?')
      .replace(/[\\()]/g, '\\$&')
  const text = textLines
    .map((l, i) => `BT /F1 ${i === 0 ? 16 : 11} Tf 60 ${760 - i * 22} Td (${ascii(l)}) Tj ET`)
    .join('\n')
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${text.length} >>\nstream\n${text}\nendstream`,
  ]
  let pdf = '%PDF-1.4\n'
  const positions = objects.map((o, i) => {
    const pos = pdf.length
    pdf += `${i + 1} 0 obj\n${o}\nendobj\n`
    return pos
  })
  const xref = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${positions.map((p) => `${String(p).padStart(10, '0')} 00000 n \n`).join('')}`
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`
  return pdf
}

/** Los archivos de los datos generados no tienen contenido: se descarga un PDF que dice qué documento es y de quién. */
function samplePdf(file: StoredFile, title: string, context: string[]) {
  return textPdf([
    title,
    ...context,
    '',
    `Archivo: ${file.name}`,
    `Cargado el ${file.uploadDate}`,
    '',
    'Documento de muestra generado por la demo.',
  ])
}

export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Descarga un archivo: el contenido cargado si existe, o el PDF de muestra. */
export async function downloadFile(file: StoredFile, title: string, context: string[]) {
  const saved = await savedContent(file)
  downloadBlob(
    saved ?? new Blob([samplePdf(file, title, context)], { type: 'application/pdf' }),
    file.name,
  )
}

/** Empaqueta en un solo .zip todos los archivos cargados. */
export async function downloadZip(
  zipName: string,
  items: { title: string; file: StoredFile }[],
  context: string[],
) {
  const optionEntries = await Promise.all(
    items.map(async ({ title, file }) => {
      const saved = await savedContent(file)
      return [
        file.name,
        saved
          ? new Uint8Array(await saved.arrayBuffer())
          : strToU8(samplePdf(file, title, context)),
      ] as const
    }),
  )
  const zip = zipSync(Object.fromEntries(optionEntries))
  downloadBlob(new Blob([zip as Uint8Array<ArrayBuffer>], { type: 'application/zip' }), zipName)
}
