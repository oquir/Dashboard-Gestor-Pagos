// Subida del .html del PDF a la API, que lo guardara en el FTP (docs/Pendientes-PDF.md §2.1): hoy
// la peticion falsa de lib/fakeApi. Para el endpoint real se reemplaza solo este cuerpo. Fuera de
// lib/index.ts, como el resto de pdf*.
import type { FakeApiResponse, PdfUploadResult } from '../../types/upload'
import { fakeApiPost } from '../fakeApi/fakeApi'

export async function uploadPdfHtml(
  html: string,
  fileName: string,
  version: number,
): Promise<PdfUploadResult> {
  const response: FakeApiResponse = await fakeApiPost(html)
  return { fileName, version, ...response }
}
