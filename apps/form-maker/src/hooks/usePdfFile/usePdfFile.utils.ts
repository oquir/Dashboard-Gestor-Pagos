import { describeApiResponse } from '../../lib/fakeApi/fakeApi'
import type { PdfUploadResult } from '../../types/upload'

export function describePdfUpload(result: PdfUploadResult): string {
  return `${result.fileName} · ${describeApiResponse(result)}`
}
