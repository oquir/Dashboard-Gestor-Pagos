import type { FormUploadResult } from '../../types/formUpload'

export function describeUpload(result: FormUploadResult): string {
  const kilobytes: string = (result.bytes / 1024).toLocaleString('es-CO', {
    maximumFractionDigits: 1,
  })
  const time: string = new Date(result.uploadedAt).toLocaleTimeString('es-CO')
  return `${result.formId} · ${kilobytes} KB · ${time}`
}

export function describeUploadError(error: unknown): string {
  return error instanceof Error ? error.message : 'Error desconocido.'
}
