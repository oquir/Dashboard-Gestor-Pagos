// Peticion FALSA a la API mientras no hay back: no sale de la maquina, espera FAKE_API_DELAY_MS y
// responde siempre bien. La usan Subir del formulario (lib/formUpload) y Subir del PDF
// (lib/pdfUpload); conectar el endpoint real es cambiar fakeApiPost por un fetch en cada uno.
import type { FakeApiResponse } from '../../types/upload'
import { FAKE_API_DELAY_MS } from './fakeApi.constants'

export function fakeApiPost(body: string): Promise<FakeApiResponse> {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      resolve({ uploadedAt: new Date().toISOString(), bytes: new Blob([body]).size })
    }, FAKE_API_DELAY_MS)
  })
}

// "12,3 KB · 10:31:02": lo que dicen los toasts de exito.
export function describeApiResponse(response: FakeApiResponse): string {
  const kilobytes: string = (response.bytes / 1024).toLocaleString('es-CO', {
    maximumFractionDigits: 1,
  })
  const time: string = new Date(response.uploadedAt).toLocaleTimeString('es-CO')
  return `${kilobytes} KB · ${time}`
}

export function describeApiError(error: unknown): string {
  return error instanceof Error ? error.message : 'Error desconocido.'
}
